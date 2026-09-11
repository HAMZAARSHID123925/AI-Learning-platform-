"""
ELARION AI Learning Platform — Backend
Module: app/modules/module1_auth/router.py

Purpose:
    FastAPI router for Module 1 — Auth & User Management endpoints.
    ALL endpoints with their exact HTTP method, path, status codes,
    and dependencies as defined in 01-MODULE-SPECIFICATIONS.md.

Routing convention: /api/v1/auth/* and /api/v1/users/*
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Cookie, Depends, Request, Response, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.modules.module1_auth.schemas import (
    AdminUpdateUserRequest,
    AssignRoleRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenResponse,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UpdateUserRequest,
    UserInTokenResponse,
    UserResponse,
)
from app.modules.module1_auth.services import auth_service, user_service
from app.shared.dependencies import get_current_user, require_any_role, require_permission
from app.shared.pagination import PaginatedResponse, PaginationParams
from app.shared.redis_client import get_redis

settings = get_settings()

router = APIRouter()

# =============================================================================
# Auth Endpoints
# =============================================================================

@router.post(
    "/auth/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    tags=["Authentication"],
)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new user with email and password.
    Automatically assigns the Student role.
    In development mode, email is auto-verified.
    """
    user = await auth_service.register_user(
        db=db,
        email=body.email,
        password=body.password,
        first_name=body.first_name,
        last_name=body.last_name,
    )
    return {"message": "Registration successful. Please verify your email.", "user_id": str(user.id)}


@router.post(
    "/auth/login",
    response_model=TokenResponse,
    summary="Login with email and password",
    tags=["Authentication"],
)
async def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    """
    Login and receive an access token + HttpOnly refresh token cookie.

    Security:
    - Refresh token is set as HttpOnly cookie (inaccessible to JavaScript)
    - Access token is returned in the response body (stored in memory on frontend)
    - 5 failed attempts per IP per 15 minutes triggers rate limiting
    """
    ip = request.client.host if request.client else None
    access_token, raw_refresh, user = await auth_service.login_user(
        db=db,
        redis=redis,
        email=body.email,
        password=body.password,
        ip_address=ip,
    )

    # Set refresh token as HttpOnly, Secure, SameSite=Lax cookie
    # WHY HttpOnly? JavaScript cannot read it → protects from XSS attacks
    response.set_cookie(
        key="refresh_token",
        value=raw_refresh,
        max_age=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=True,
        secure=settings.is_production,  # Secure in prod, not in local dev
        samesite="lax",
        path="/api/v1/auth",
    )

    from app.modules.module1_auth.models import UserRole, Role
    roles = [ur.role.name for ur in user.user_roles]

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserInTokenResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            roles=roles,
        ),
    )


@router.post(
    "/auth/refresh",
    response_model=RefreshTokenResponse,
    summary="Refresh access token using refresh token cookie",
    tags=["Authentication"],
)
async def refresh(
    response: Response,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    refresh_token: str | None = Cookie(default=None),
):
    """
    Issue a new access token using the HttpOnly refresh token cookie.
    Old refresh token is revoked (rotation prevents replay attacks).
    """
    if not refresh_token:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Refresh token not found.")

    new_access, new_refresh = await auth_service.refresh_token(
        db=db,
        redis=redis,
        raw_refresh_token=refresh_token,
    )

    response.set_cookie(
        key="refresh_token",
        value=new_refresh,
        max_age=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        path="/api/v1/auth",
    )

    return RefreshTokenResponse(
        access_token=new_access,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post(
    "/auth/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout and revoke tokens",
    tags=["Authentication"],
)
async def logout(
    response: Response,
    request: Request,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    refresh_token: str | None = Cookie(default=None),
):
    """
    Logout: revoke refresh token, destroy session, blacklist current access token.
    """
    # Get JTI from the current access token to blacklist it
    auth_header = request.headers.get("Authorization", "")
    jti = None
    if auth_header.startswith("Bearer "):
        from app.shared.auth import decode_access_token
        try:
            payload = decode_access_token(auth_header[7:])
            jti = payload.get("jti")
        except Exception:
            pass

    await auth_service.logout_user(
        db=db,
        redis=redis,
        raw_refresh_token=refresh_token,
        current_jti=jti,
        user_id=current_user.id,
    )

    # Clear the cookie
    response.delete_cookie(key="refresh_token", path="/api/v1/auth")


@router.post(
    "/auth/forgot-password",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Request password reset email",
    tags=["Authentication"],
)
async def forgot_password(
    body: ForgotPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    """
    Request a password reset email.
    Always returns 202 Accepted regardless of whether email exists (anti-enumeration).
    """
    ip = request.client.host if request.client else None
    await auth_service.forgot_password(db=db, redis=redis, email=body.email, ip_address=ip)
    return {"message": "If an account with this email exists, a reset link has been sent."}


@router.post(
    "/auth/reset-password",
    status_code=status.HTTP_200_OK,
    summary="Reset password using reset token",
    tags=["Authentication"],
)
async def reset_password(
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Complete password reset using the single-use token from email."""
    await auth_service.reset_password(db=db, raw_token=body.token, new_password=body.new_password)
    return {"message": "Password reset successfully. You may now log in."}


# =============================================================================
# User Endpoints
# =============================================================================

@router.get(
    "/users/me",
    response_model=UserResponse,
    summary="Get current user profile",
    tags=["Users"],
)
async def get_me(current_user=Depends(get_current_user)):
    """Return the authenticated user's full profile."""
    roles = [ur.role.name for ur in current_user.user_roles]
    permissions = list(current_user.get_permissions())
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        status=current_user.status.value,
        email_verified=current_user.email_verified,
        parental_consent=current_user.parental_consent,
        roles=roles,
        permissions=permissions,
        last_login_at=current_user.last_login_at,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


@router.patch(
    "/users/me",
    response_model=UserResponse,
    summary="Update own profile",
    tags=["Users"],
)
async def update_me(
    body: UpdateUserRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the authenticated user's own name fields."""
    updated = await user_service.update_user(
        db=db,
        user_id=current_user.id,
        first_name=body.first_name,
        last_name=body.last_name,
    )
    roles = [ur.role.name for ur in updated.user_roles]
    permissions = list(updated.get_permissions())
    return UserResponse(
        id=updated.id,
        email=updated.email,
        first_name=updated.first_name,
        last_name=updated.last_name,
        status=updated.status.value,
        email_verified=updated.email_verified,
        parental_consent=updated.parental_consent,
        roles=roles,
        permissions=permissions,
        last_login_at=updated.last_login_at,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
    )


@router.get(
    "/users",
    response_model=PaginatedResponse[UserResponse],
    summary="List all users (Admin only)",
    tags=["Users"],
    dependencies=[Depends(require_any_role("Admin"))],
)
async def list_users(
    db: AsyncSession = Depends(get_db),
    status_filter: str | None = None,
    page: int = 1,
    page_size: int = 20,
):
    """List all users with optional status filter. Admin only."""
    params = PaginationParams(page=page, page_size=page_size)
    users, total = await user_service.list_users(db=db, params=params, status_filter=status_filter)

    user_responses = []
    for u in users:
        roles = [ur.role.name for ur in u.user_roles]
        user_responses.append(UserResponse(
            id=u.id,
            email=u.email,
            first_name=u.first_name,
            last_name=u.last_name,
            status=u.status.value,
            email_verified=u.email_verified,
            parental_consent=u.parental_consent,
            roles=roles,
            permissions=[],
            last_login_at=u.last_login_at,
            created_at=u.created_at,
            updated_at=u.updated_at,
        ))

    return PaginatedResponse.create(items=user_responses, total=total, params=params)


@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Get user by ID (Admin or own profile)",
    tags=["Users"],
)
async def get_user(
    user_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get user profile. Users can view their own profile.
    Admins can view any user's profile.
    """
    is_admin = current_user.has_role("Admin")
    if not is_admin and current_user.id != user_id:
        from app.shared.exceptions import PermissionDeniedError
        raise PermissionDeniedError()

    user = await user_service.get_user_by_id(db=db, user_id=user_id)
    roles = [ur.role.name for ur in user.user_roles]
    permissions = list(user.get_permissions()) if is_admin else []

    return UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        status=user.status.value,
        email_verified=user.email_verified,
        parental_consent=user.parental_consent,
        roles=roles,
        permissions=permissions,
        last_login_at=user.last_login_at,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.patch(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Update any user (Admin only)",
    tags=["Users"],
    dependencies=[Depends(require_any_role("Admin"))],
)
async def admin_update_user(
    user_id: uuid.UUID,
    body: AdminUpdateUserRequest,
    db: AsyncSession = Depends(get_db),
):
    """Admin: update any user's fields including status."""
    updated = await user_service.update_user(
        db=db,
        user_id=user_id,
        first_name=body.first_name,
        last_name=body.last_name,
        status=body.status,
        email_verified=body.email_verified,
        parental_consent=body.parental_consent,
    )
    roles = [ur.role.name for ur in updated.user_roles]
    return UserResponse(
        id=updated.id,
        email=updated.email,
        first_name=updated.first_name,
        last_name=updated.last_name,
        status=updated.status.value,
        email_verified=updated.email_verified,
        parental_consent=updated.parental_consent,
        roles=roles,
        permissions=list(updated.get_permissions()),
        last_login_at=updated.last_login_at,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
    )


@router.post(
    "/users/{user_id}/roles",
    status_code=status.HTTP_200_OK,
    summary="Assign role to user (Admin only)",
    tags=["Users"],
    dependencies=[Depends(require_any_role("Admin"))],
)
async def assign_role(
    user_id: uuid.UUID,
    body: AssignRoleRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin: assign a role to a user."""
    await user_service.assign_role(db=db, user_id=user_id, role_name=body.role_name, actor_id=current_user.id)
    return {"message": f"Role '{body.role_name}' assigned successfully."}


@router.delete(
    "/users/{user_id}/roles/{role_name}",
    status_code=status.HTTP_200_OK,
    summary="Revoke role from user (Admin only)",
    tags=["Users"],
    dependencies=[Depends(require_any_role("Admin"))],
)
async def revoke_role(
    user_id: uuid.UUID,
    role_name: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin: revoke a role from a user."""
    await user_service.revoke_role(db=db, user_id=user_id, role_name=role_name, actor_id=current_user.id)
    return {"message": f"Role '{role_name}' revoked successfully."}
