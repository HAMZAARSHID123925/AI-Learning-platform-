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

from fastapi import APIRouter, Cookie, Depends, Request, Response, Query, status
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.modules.module1_auth.schemas import (
    AdminUpdateUserRequest,
    AssignRoleRequest,
    CreateTeacherRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenResponse,
    RegisterRequest,
    ResetPasswordRequest,
    SessionInfoResponse,
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
        grade=body.grade,
        role=body.role,
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
        grade=user.grade,
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


@router.get(
    "/auth/sessions",
    response_model=list[SessionInfoResponse],
    summary="List active sessions for current user",
    tags=["Authentication"],
)
async def list_active_sessions(
    request: Request,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    """
    List all active device sessions for current user.
    """
    from app.modules.module1_auth.models import RefreshToken
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == current_user.id,
            RefreshToken.revoked_at.is_(None),
        ).order_by(RefreshToken.created_at.desc())
    )
    tokens = result.scalars().all()
    user_agent = request.headers.get("user-agent", "Unknown Device")
    client_ip = request.client.host if request.client else None

    sessions = []
    for idx, tok in enumerate(tokens):
        sessions.append(
            SessionInfoResponse(
                session_id=str(tok.id),
                device_info="Web Browser — " + (user_agent[:40] if idx == 0 else "Active Browser Session"),
                ip_address=client_ip if idx == 0 else "Encrypted IP",
                last_active_at=tok.created_at,
                is_current=(idx == 0),
            )
        )
    return sessions


@router.post(
    "/auth/sessions/revoke-others",
    summary="Remote logout: Revoke all other active sessions",
    tags=["Authentication"],
)
async def revoke_other_sessions(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    """
    Log out all other devices and revoke all other refresh tokens for this user.
    """
    count = await auth_service.revoke_all_user_sessions(
        db=db,
        redis=redis,
        user_id=current_user.id,
    )
    return {"message": f"Successfully revoked {count} active sessions.", "revoked_count": count}


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
        grade=current_user.grade,
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


@router.get(
    "/auth/me",
    response_model=UserResponse,
    summary="Get current user profile (Authentication alias)",
    tags=["Authentication"],
)
async def get_auth_me(current_user=Depends(get_current_user)):
    """Alias for /users/me under Authentication tag."""
    return await get_me(current_user=current_user)


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
        grade=body.grade,
    )
    roles = [ur.role.name for ur in updated.user_roles]
    permissions = list(updated.get_permissions())
    return UserResponse(
        id=updated.id,
        email=updated.email,
        grade=updated.grade,
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
    status_filter: str | None = Query(default=None, pattern="^(active|suspended|pending_verification)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
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
        grade=u.grade,
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
        grade=user.grade,
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
        grade=body.grade,
        status=body.status,
        email_verified=body.email_verified,
        parental_consent=body.parental_consent,
    )
    roles = [ur.role.name for ur in updated.user_roles]
    return UserResponse(
        id=updated.id,
        email=updated.email,
        grade=updated.grade,
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


@router.post(
    "/admin/teachers",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Directly create and provision a teacher account (Admin only)",
    tags=["Users"],
    dependencies=[Depends(require_any_role("Admin"))],
)
async def admin_create_teacher(
    body: CreateTeacherRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Admin: Directly create and provision a new Teacher/Instructor account.
    Instantly verifies the account and assigns the Instructor role.
    """
    import asyncio
    from app.modules.module1_auth.models import User, Role, UserRole, UserStatus, AuditLog
    from app.shared.auth import hash_password
    from app.shared.exceptions import DuplicateResourceError, ResourceNotFoundError

    email = body.email.lower().strip()
    existing_res = await db.execute(select(User).where(User.email == email))
    existing_user = existing_res.scalar_one_or_none()

    role_res = await db.execute(select(Role).where(Role.name == "Instructor"))
    instructor_role = role_res.scalar_one_or_none()
    if not instructor_role:
        raise ResourceNotFoundError("Role", "Instructor")

    password_hash = await asyncio.to_thread(hash_password, body.password)

    if existing_user:
        # User already exists in DB: Update their name, password and promote/ensure Instructor role
        existing_user.first_name = body.first_name.strip()
        existing_user.last_name = body.last_name.strip()
        existing_user.password_hash = password_hash
        existing_user.status = UserStatus.active
        existing_user.email_verified = True

        # Check if already has Instructor role
        has_role = await db.execute(
            select(UserRole).where(UserRole.user_id == existing_user.id, UserRole.role_id == instructor_role.id)
        )
        if not has_role.scalar_one_or_none():
            db.add(UserRole(user_id=existing_user.id, role_id=instructor_role.id))

        db.add(
            AuditLog(
                actor_id=current_user.id,
                action="teacher.updated_and_assigned",
                target_type="User",
                target_id=existing_user.id,
                metadata={"email": email, "subject": body.subject},
            )
        )
        await db.commit()
        target_user = existing_user
    else:
        # Create brand new user
        new_user = User(
            email=email,
            password_hash=password_hash,
            first_name=body.first_name.strip(),
            last_name=body.last_name.strip(),
            status=UserStatus.active,
            email_verified=True,
        )
        db.add(new_user)
        await db.flush()

        db.add(UserRole(user_id=new_user.id, role_id=instructor_role.id))

        db.add(
            AuditLog(
                actor_id=current_user.id,
                action="teacher.provisioned",
                target_type="User",
                target_id=new_user.id,
                metadata={"email": email, "subject": body.subject},
            )
        )
        await db.commit()
        target_user = new_user

    return UserResponse(
        id=target_user.id,
        email=target_user.email,
        first_name=target_user.first_name,
        last_name=target_user.last_name,
        grade=target_user.grade,
        status=target_user.status.value,
        email_verified=target_user.email_verified,
        parental_consent=target_user.parental_consent,
        roles=["Instructor"],
        permissions=[],
        last_login_at=target_user.last_login_at,
        created_at=target_user.created_at,
        updated_at=target_user.updated_at,
    )



