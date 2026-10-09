"""
ELARION AI Learning Platform — Backend
Module: app/shared/dependencies.py

Purpose:
    FastAPI dependency functions injected into route handlers.
    This is where authentication, authorization, and resource resolution live.

Key Design: RBAC as a Dependency (not inside business logic)
    WHY?
        If RBAC is checked inside service functions, a developer can accidentally
        call the service without the permission check.
        As a FastAPI Depends(), it's IMPOSSIBLE to reach the route handler
        without the check running first. The framework enforces it.

    Pattern:
        @router.post("/courses", dependencies=[Depends(require_permission("course:create"))])
        async def create_course(...):
            # By the time we reach here, permission is already verified

    Alternative considered: Decorator-based RBAC
        @require_permission("course:create")
        async def create_course(...)
        Rejected: Less compatible with FastAPI's dependency injection system.
        Dependencies compose better (e.g., you can combine multiple).
"""

from __future__ import annotations

from uuid import UUID

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, load_only

from app.config import get_settings
from app.database import get_db
from app.shared.auth import decode_access_token
from app.shared.exceptions import (
    AccountSuspendedError,
    PermissionDeniedError,
    TokenRevokedError,
    TokenInvalidError,
    TokenExpiredError,
)
from app.shared.redis_client import get_auth_redis

# HTTPBearer extracts the "Bearer <token>" from Authorization header
_bearer_scheme = HTTPBearer(auto_error=True)


async def _load_auth_user(db: AsyncSession, user_id: UUID):
    """One authoritative query per request; retain the existing User interface.

    Profile fields are needed by /users/me. Password hashes and RBAC
    descriptions are excluded. Explicit joined loading overrides only this
    query, leaving ORM defaults and login/write service queries unchanged.
    """
    from app.modules.module1_auth.models import Permission, Role, RolePermission, User, UserRole
    result = await db.execute(
        select(User).where(User.id == user_id).options(
            load_only(User.id, User.email, User.first_name, User.last_name,
                      User.status, User.grade, User.email_verified, User.parental_consent,
                      User.last_login_at, User.created_at, User.updated_at, raiseload=True),
            joinedload(User.user_roles)
            .joinedload(UserRole.role).load_only(Role.id, Role.name, raiseload=True)
            .joinedload(Role.role_permissions)
            .joinedload(RolePermission.permission).load_only(Permission.id, Permission.code, raiseload=True),
        )
    )
    # A joined collection produces multiple rows; deduplicate the principal.
    return result.unique().scalar_one_or_none()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_auth_redis),
):
    """
    FastAPI dependency: Authenticate the current request.

    Process:
    1. Extract JWT from Authorization: Bearer <token> header
    2. Decode and validate JWT signature + expiry
    3. Check JTI blacklist in Redis (prevents use of revoked tokens)
    4. Load user from database with roles and permissions
    5. Check user.status == 'active' (suspended users blocked immediately)
    6. Return the User model instance

    The returned User is then available in all downstream dependencies
    and the route handler itself.

    Raises:
        401: Token invalid/expired/revoked
        403: Account suspended
    """
    settings = get_settings()
    token = credentials.credentials

    # Decode JWT (validates signature + expiry)
    payload = decode_access_token(token)

    # Check Redis JTI blacklist (for tokens revoked on logout)
    jti = payload.get("jti")
    if jti:
        blacklist_key = f"{settings.REDIS_KEY_PREFIX}:blacklist:jwt:{jti}"
        is_blacklisted = await redis.exists(blacklist_key)
        if is_blacklisted:
            raise TokenRevokedError()

    user = await _load_auth_user(db, UUID(payload["sub"]))

    if user is None:
        from app.shared.exceptions import TokenInvalidError
        raise TokenInvalidError()

    # Suspended users are blocked immediately — no waiting for token expiry
    # (Business Rule from 01-MODULE-SPECIFICATIONS.md §Module1 Rule 6)
    if user.status.value == "suspended":
        raise AccountSuspendedError()

    return user


_bearer_scheme_optional = HTTPBearer(auto_error=False)


async def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme_optional),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_auth_redis),
):
    """
    FastAPI dependency: Optionally authenticate the current request.
    Returns the User model instance if a valid Bearer token is provided, else None.
    Never raises 401.
    """
    if credentials is None or not credentials.credentials:
        return None

    # Catch only credential parsing errors. Redis/DB errors outside this
    # boundary must never turn an authenticated request into anonymous access.
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = UUID(payload["sub"])
    except (TokenInvalidError, TokenExpiredError, ValueError, KeyError, TypeError):
        return None

    settings = get_settings()
    jti = payload.get("jti")
    if jti and await redis.exists(f"{settings.REDIS_KEY_PREFIX}:blacklist:jwt:{jti}"):
        return None
    user = await _load_auth_user(db, user_id)
    if user and user.status.value != "suspended":
        return user
    return None



def require_permission(permission_code: str):
    """
    Dependency factory: Require a specific permission code.

    Usage:
        @router.post(
            "/courses",
            dependencies=[Depends(require_permission("course:create"))]
        )

    Checks: user.permissions must include the given code.

    Raises:
        403 PermissionDeniedError if user lacks the permission.
    """
    async def _check_permission(
        current_user=Depends(get_current_user),
    ):
        # Accumulate all permissions from all roles
        user_permissions = _get_user_permissions(current_user)
        if permission_code not in user_permissions:
            raise PermissionDeniedError(permission_code)
        return current_user

    return _check_permission


def require_any_role(*role_names: str):
    """
    Dependency factory: Require the user to have at least one of the given roles.

    Usage:
        @router.get(
            "/admin/dashboard",
            dependencies=[Depends(require_any_role("Admin"))]
        )

    Raises:
        403 PermissionDeniedError if user has none of the required roles.
    """
    async def _check_role(
        current_user=Depends(get_current_user),
    ):
        user_roles = {ur.role.name for ur in current_user.user_roles}
        if not any(role in user_roles for role in role_names):
            raise PermissionDeniedError()
        return current_user

    return _check_role


def _get_user_permissions(user) -> set[str]:
    """
    Accumulate all permission codes from all roles.

    RBAC is additive: a user with multiple roles gets ALL permissions
    from ALL their roles combined.
    (Business Rule from 01-MODULE-SPECIFICATIONS.md §Module1 Rule 7)
    """
    permissions: set[str] = set()
    for user_role in user.user_roles:
        for role_permission in user_role.role.role_permissions:
            permissions.add(role_permission.permission.code)
    return permissions


def get_user_role_names(user) -> set[str]:
    """Return the set of role names for a user."""
    return {ur.role.name for ur in user.user_roles}
