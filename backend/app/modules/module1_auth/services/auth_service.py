"""
ELARION AI Learning Platform — Backend
Module: app/modules/module1_auth/services/auth_service.py

Purpose:
    All authentication business logic:
    - Register, Login, Logout, Token Refresh
    - Forgot Password / Reset Password
    - Email Verification
    - Rate Limiting enforcement
    - Audit Logging

This service does NOT know about HTTP. It raises domain exceptions.
The router layer translates domain exceptions to HTTP responses.

Key patterns:
    - bcrypt in thread pool: CPU-intensive hash/verify runs in asyncio.to_thread()
      to prevent blocking the event loop. A blocked event loop = ALL requests stall.
    - Redis-based rate limiting: Sliding window counter with atomic INCR + EXPIRE.
    - Audit log on EVERY auth event: Required for FERPA compliance.
"""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.modules.module1_auth.models import (
    AuditLog,
    PasswordResetToken,
    RefreshToken,
    Role,
    User,
    UserRole,
    UserStatus,
)
from app.shared.auth import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.shared.exceptions import (
    AccountSuspendedError,
    BusinessRuleError,
    DuplicateResourceError,
    EmailNotVerifiedError,
    InvalidCredentialsError,
    RateLimitExceededError,
    ResourceNotFoundError,
)
from app.shared.logging_config import get_logger

logger = get_logger(__name__)
settings = get_settings()

# =============================================================================
# Rate Limiting Helpers
# =============================================================================

async def _check_rate_limit(
    redis: Redis,
    key: str,
    max_attempts: int,
    window_seconds: int,
) -> None:
    """
    Atomic sliding window rate limiter using Redis INCR + EXPIRE.

    How it works:
        INCR key      → increment counter (creates key with value=1 if not exists)
        EXPIRE key N  → set TTL on the key (only if it's the first increment)

    WHY INCR not SET?
        INCR is atomic — no race condition between read and write.
        If two requests arrive simultaneously, both safely get different values.

    Returns: None if within limit
    Raises: RateLimitExceededError if limit exceeded
    """
    count = await redis.incr(key)
    if count == 1:
        # First attempt — set the expiry window
        await redis.expire(key, window_seconds)

    if count > max_attempts:
        ttl = await redis.ttl(key)
        raise RateLimitExceededError(action="login", retry_after=max(ttl, 0))


# =============================================================================
# Audit Logging Helper
# =============================================================================

async def _write_audit_log(
    db: AsyncSession,
    action: str,
    actor_id: uuid.UUID | None = None,
    target_type: str | None = None,
    target_id: uuid.UUID | None = None,
    metadata: dict | None = None,
    ip_address: str | None = None,
) -> None:
    """Write an audit log entry. Errors here are logged but never propagate."""
    try:
        log = AuditLog(
            actor_id=actor_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            metadata=metadata,
            ip_address=ip_address,
        )
        db.add(log)
        # Note: Committed by the request lifecycle (get_db dependency)
    except Exception as e:
        logger.error("audit_log_write_failed", action=action, error=str(e))


# =============================================================================
# Email Helper (Phase 1: Console Logger)
# =============================================================================

async def _send_email(to: str, subject: str, body: str) -> None:
    """
    Send an email. Phase 1: logs to console.
    Production: Replace with SMTP/SendGrid/Mailgun.

    WHY a separate function?
        Easy to swap implementations. One change in one place.
        A proper email service would use a queue (Celery beat) for reliability.
    """
    logger.info(
        "EMAIL_CONSOLE_LOG",
        to=to,
        subject=subject,
        body=body,
    )
    # TODO (Phase 5): Replace with real email provider
    # await smtp_client.send(to=to, subject=subject, html_body=render_template(body))


# =============================================================================
# User Loading Helper
# =============================================================================

async def _get_user_with_roles(db: AsyncSession, email: str) -> User | None:
    """Load a user with all roles and permissions eagerly."""
    result = await db.execute(
        select(User)
        .where(User.email == email.lower().strip())
        .options(
            selectinload(User.user_roles)
            .selectinload(UserRole.role)
            .selectinload(Role.role_permissions)
        )
    )
    return result.scalar_one_or_none()


async def _get_user_with_roles_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    """Load a user by ID with all roles and permissions eagerly."""
    result = await db.execute(
        select(User)
        .where(User.id == user_id)
        .options(
            selectinload(User.user_roles)
            .selectinload(UserRole.role)
            .selectinload(Role.role_permissions)
        )
    )
    return result.scalar_one_or_none()


def _build_token_data(user: User) -> tuple[list[str], list[str]]:
    """Extract role names and accumulated permissions from a user with roles loaded."""
    roles = [ur.role.name for ur in user.user_roles]
    permissions = list(user.get_permissions())
    return roles, permissions


# =============================================================================
# Auth Service Functions
# =============================================================================

async def register_user(
    db: AsyncSession,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
) -> User:
    """
    Register a new user with Student role.

    Business rules:
    - Email must be unique (enforced by DB UNIQUE constraint)
    - Password is hashed before storage (bcrypt cost=12)
    - New users start as pending_verification
    - A verification email is sent (console log in Phase 1)
    - Audit log: user.registered
    """
    email = email.lower().strip()

    # Check for existing email (provide clear error before DB constraint fails)
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise DuplicateResourceError("User", "email")

    # Hash password in thread pool — bcrypt is CPU-intensive and BLOCKS the event loop
    password_hash = await asyncio.to_thread(hash_password, password)

    user = User(
        email=email,
        password_hash=password_hash,
        first_name=first_name,
        last_name=last_name,
        status=UserStatus.pending_verification,
        email_verified=False,
    )
    db.add(user)
    await db.flush()  # Flush to get user.id without committing

    # Assign Student role (default for new registrations)
    student_role = await db.execute(select(Role).where(Role.name == "Student"))
    student_role = student_role.scalar_one_or_none()
    if student_role:
        db.add(UserRole(user_id=user.id, role_id=student_role.id))

    # Send email verification (console log in Phase 1)
    verify_token = generate_refresh_token()[:32]  # Short token for email URL
    # TODO: Store verification token properly in Phase 5
    await _send_email(
        to=email,
        subject="Verify your ELARION account",
        body=f"Verification link: {settings.FRONTEND_URL}/verify-email?token={verify_token}\n"
             f"(DEVELOPMENT MODE: Email verification auto-approved for testing)"
    )

    # For development: auto-verify email
    if settings.is_development:
        user.email_verified = True
        user.status = UserStatus.active

    await _write_audit_log(db, action="user.registered", actor_id=user.id)

    logger.info("user_registered", user_id=str(user.id), email=email)
    return user


async def login_user(
    db: AsyncSession,
    redis: Redis,
    email: str,
    password: str,
    ip_address: str | None = None,
) -> tuple[str, str, User]:
    """
    Authenticate a user and issue access + refresh tokens.

    Returns: (access_token, raw_refresh_token, user)

    Rate limiting: 5 attempts per 15 minutes per IP (spec §Module1 Rule 9)
    """
    # Rate limit check BEFORE any DB query (fail fast, reduce DB load)
    if ip_address:
        await _check_rate_limit(
            redis,
            key=f"{settings.REDIS_KEY_PREFIX}:rate:login:{ip_address}",
            max_attempts=settings.RATE_LIMIT_LOGIN_MAX,
            window_seconds=settings.RATE_LIMIT_LOGIN_WINDOW_SECONDS,
        )

    user = await _get_user_with_roles(db, email)

    # SECURITY: Use same error message whether user doesn't exist OR password is wrong.
    # This prevents user enumeration attacks (attacker can't tell if email is registered).
    if user is None:
        await _write_audit_log(
            db, action="user.login_failed",
            metadata={"reason": "user_not_found", "email": email},
            ip_address=ip_address,
        )
        raise InvalidCredentialsError()

    # Verify password in thread pool
    is_valid = await asyncio.to_thread(verify_password, password, user.password_hash)
    if not is_valid:
        await _write_audit_log(
            db, action="user.login_failed",
            actor_id=user.id,
            metadata={"reason": "wrong_password"},
            ip_address=ip_address,
        )
        raise InvalidCredentialsError()

    if user.status == UserStatus.suspended:
        raise AccountSuspendedError()

    if not user.email_verified:
        raise EmailNotVerifiedError()

    # Issue access token
    roles, permissions = _build_token_data(user)
    access_token, jti = create_access_token(
        user_id=str(user.id),
        email=user.email,
        first_name=user.first_name,
        roles=roles,
        permissions=permissions,
    )

    # Issue refresh token (store SHA-256 hash only)
    raw_refresh_token = generate_refresh_token()
    token_hash = hash_token(raw_refresh_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)

    db.add(RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    ))

    # Update Redis session registry
    session_key = f"{settings.REDIS_KEY_PREFIX}:session:{user.id}"
    await redis.hset(session_key, mapping={
        "last_seen": datetime.now(timezone.utc).isoformat(),
        "token_family": jti,
    })
    await redis.expire(session_key, settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 86400)

    # Update last login timestamp
    user.last_login_at = datetime.now(timezone.utc)

    await _write_audit_log(
        db, action="user.login",
        actor_id=user.id,
        ip_address=ip_address,
    )

    logger.info("user_login", user_id=str(user.id), email=user.email)
    return access_token, raw_refresh_token, user


async def refresh_token(
    db: AsyncSession,
    redis: Redis,
    raw_refresh_token: str,
) -> tuple[str, str]:
    """
    Rotate refresh token and issue new access token.

    Refresh token rotation (RTR):
    - Each refresh invalidates the old token and issues a new one.
    - If a revoked/already-used refresh token is presented (token reuse / theft),
      the backend immediately revokes ALL tokens for that user session and destroys the Redis session.

    Returns: (new_access_token, new_raw_refresh_token)
    """
    token_hash = hash_token(raw_refresh_token)

    # Find the refresh token in DB
    result = await db.execute(
        select(RefreshToken)
        .where(RefreshToken.token_hash == token_hash)
        .options(selectinload(RefreshToken.user))
    )
    stored_token = result.scalar_one_or_none()

    if stored_token is None:
        raise ResourceNotFoundError("RefreshToken", None)

    user = await _get_user_with_roles_by_id(db, stored_token.user_id)
    if user is None or user.status == UserStatus.suspended:
        raise AccountSuspendedError()

    # DETECT TOKEN REUSE (Attempted attack with an already-used/revoked token)
    if stored_token.revoked_at is not None or not stored_token.is_valid:
        # Compromised Token Family Detected: Invalidate all tokens for user!
        logger.warning(
            "refresh_token_reuse_detected",
            user_id=str(user.id),
            token_id=str(stored_token.id)
        )
        # Revoke all refresh tokens for this user
        all_user_tokens = await db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user.id,
                RefreshToken.revoked_at.is_(None)
            )
        )
        for tok in all_user_tokens.scalars().all():
            tok.revoked_at = datetime.now(timezone.utc)

        # Destroy active Redis sessions
        session_key = f"{settings.REDIS_KEY_PREFIX}:session:{user.id}"
        await redis.delete(session_key)

        await _write_audit_log(
            db,
            action="security.token_reuse_detected",
            actor_id=user.id,
            metadata={"compromised_token_id": str(stored_token.id)}
        )
        raise InvalidCredentialsError()

    # Check Redis session still exists
    session_key = f"{settings.REDIS_KEY_PREFIX}:session:{user.id}"
    session_exists = await redis.exists(session_key)
    if not session_exists:
        stored_token.revoked_at = datetime.now(timezone.utc)
        raise InvalidCredentialsError()

    # Rotate: Revoke current token
    stored_token.revoked_at = datetime.now(timezone.utc)

    # Issue new access token
    roles, permissions = _build_token_data(user)
    new_access_token, new_jti = create_access_token(
        user_id=str(user.id),
        email=user.email,
        first_name=user.first_name,
        roles=roles,
        permissions=permissions,
    )

    # Issue new refresh token
    new_raw_refresh_token = generate_refresh_token()
    new_token_hash = hash_token(new_raw_refresh_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=new_token_hash,
        expires_at=expires_at,
    ))

    # Update Redis session
    await redis.hset(session_key, mapping={
        "last_seen": datetime.now(timezone.utc).isoformat(),
        "token_family": new_jti,
    })
    await redis.expire(session_key, settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 86400)

    await _write_audit_log(db, action="user.token_refresh", actor_id=user.id)
    return new_access_token, new_raw_refresh_token


async def logout_user(
    db: AsyncSession,
    redis: Redis,
    raw_refresh_token: str | None,
    current_jti: str | None,
    user_id: uuid.UUID,
) -> None:
    """
    Logout: revoke refresh token, destroy Redis session, blacklist current access token JTI.
    """
    # Revoke refresh token in DB
    if raw_refresh_token:
        token_hash = hash_token(raw_refresh_token)
        result = await db.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at.is_(None),
            )
        )
        stored = result.scalar_one_or_none()
        if stored:
            stored.revoked_at = datetime.now(timezone.utc)

    # Destroy Redis session
    session_key = f"{settings.REDIS_KEY_PREFIX}:session:{user_id}"
    await redis.delete(session_key)

    # Blacklist current access token JTI (prevents reuse until expiry)
    if current_jti:
        blacklist_key = f"{settings.REDIS_KEY_PREFIX}:blacklist:jwt:{current_jti}"
        access_ttl = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
        await redis.set(blacklist_key, "1", ex=access_ttl)

    await _write_audit_log(db, action="user.logout", actor_id=user_id)
    logger.info("user_logout", user_id=str(user_id))


async def revoke_all_user_sessions(
    db: AsyncSession,
    redis: Redis,
    user_id: uuid.UUID,
) -> int:
    """
    Remote Logout: Revoke all active refresh tokens and clear Redis session for a user.
    """
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_at.is_(None),
        )
    )
    tokens = result.scalars().all()
    now = datetime.now(timezone.utc)
    for tok in tokens:
        tok.revoked_at = now

    # Destroy Redis session
    session_key = f"{settings.REDIS_KEY_PREFIX}:session:{user_id}"
    await redis.delete(session_key)

    await _write_audit_log(db, action="user.revoke_all_sessions", actor_id=user_id)
    logger.info("user_revoked_all_sessions", user_id=str(user_id), count=len(tokens))
    return len(tokens)


async def forgot_password(
    db: AsyncSession,
    redis: Redis,
    email: str,
    ip_address: str | None = None,
) -> None:
    """
    Initiate password reset flow.

    Rate limit: 3 requests per hour per email (spec §Module1 Rule 9).
    SECURITY: Return success regardless of whether email exists.
    This prevents user enumeration via the forgot-password endpoint.
    """
    email = email.lower().strip()

    # Rate limit per email
    await _check_rate_limit(
        redis,
        key=f"{settings.REDIS_KEY_PREFIX}:rate:forgot:{email}",
        max_attempts=settings.RATE_LIMIT_FORGOT_MAX,
        window_seconds=settings.RATE_LIMIT_FORGOT_WINDOW_SECONDS,
    )

    user = await db.execute(select(User).where(User.email == email))
    user = user.scalar_one_or_none()

    if user is None:
        # SECURITY: Don't reveal that email doesn't exist.
        # Log for monitoring, return success to caller.
        logger.info("forgot_password_unknown_email", email=email)
        return

    # Generate single-use reset token (1-hour TTL)
    raw_token = generate_refresh_token()
    token_hash = hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    db.add(PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    ))

    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
    await _send_email(
        to=email,
        subject="Reset your ELARION password",
        body=f"Click this link to reset your password (expires in 1 hour):\n{reset_link}",
    )

    await _write_audit_log(
        db, action="user.password_reset_requested",
        actor_id=user.id,
        ip_address=ip_address,
    )
    logger.info("password_reset_requested", user_id=str(user.id))


async def reset_password(
    db: AsyncSession,
    raw_token: str,
    new_password: str,
) -> None:
    """
    Complete password reset using the single-use token.
    Token is marked as used immediately to prevent replay attacks.
    """
    token_hash = hash_token(raw_token)

    result = await db.execute(
        select(PasswordResetToken)
        .where(PasswordResetToken.token_hash == token_hash)
        .options(selectinload(PasswordResetToken.user))
    )
    stored = result.scalar_one_or_none()

    if stored is None or not stored.is_usable:
        raise BusinessRuleError("Password reset token is invalid or has expired.")

    # Mark as used IMMEDIATELY (before hashing new password)
    # Prevents concurrent requests with the same token from both succeeding
    stored.used_at = datetime.now(timezone.utc)
    await db.flush()

    # Hash new password in thread pool
    new_hash = await asyncio.to_thread(hash_password, new_password)
    stored.user.password_hash = new_hash

    await _write_audit_log(db, action="user.password_reset_completed", actor_id=stored.user_id)
    logger.info("password_reset_completed", user_id=str(stored.user_id))
