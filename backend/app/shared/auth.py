"""
ELARION AI Learning Platform — Backend
Module: app/shared/auth.py

Purpose:
    JWT token management (RS256 encode/decode) and password hashing.
    This module ONLY handles cryptographic operations.
    Business logic (user lookup, session management) is in auth_service.py.

Cryptographic choices explained:
    - Password hashing: bcrypt (cost=12) — industry standard, auto-salted
    - JWT algorithm: RS256 (asymmetric RSA) — private key signs, public verifies
    - Refresh tokens: 64-byte cryptographic random (secrets module) — SHA-256 stored
    - JTI (JWT ID): UUID4 — used for individual token blacklisting after logout
"""

from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings
from app.shared.exceptions import (
    TokenExpiredError,
    TokenInvalidError,
    TokenRevokedError,
)
from app.shared.logging_config import get_logger

logger = get_logger(__name__)

# =============================================================================
# Password Hashing
# =============================================================================

# WHY bcrypt with cost=12?
#   Cost=12 means 2^12 = 4096 iterations. Each hash takes ~250ms on modern CPU.
#   This makes brute-force attacks extremely slow.
#   Lower cost (8): faster but weaker. Higher cost (14): too slow for users.
#   12 is the industry sweet spot as of 2024.
_pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)


def hash_password(plain_password: str) -> str:
    """
    Hash a plaintext password using bcrypt.

    CRITICAL: This is a CPU-intensive operation.
    In async context, this SHOULD be run in a thread pool executor
    to avoid blocking the event loop. We handle this in auth_service.py.
    """
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against its bcrypt hash.
    Returns True if match, False if not. Never raises on mismatch.
    """
    return _pwd_context.verify(plain_password, hashed_password)


# =============================================================================
# Refresh Token Utilities
# =============================================================================

def generate_refresh_token() -> str:
    """
    Generate a cryptographically secure refresh token.

    Returns the RAW token (128 hex chars = 64 bytes of randomness).
    NEVER store the raw token — always store SHA-256(raw_token).

    WHY secrets.token_hex?
        os.urandom(64) generates cryptographic randomness.
        secrets.token_hex() is Python's recommended way to use it.
        uuid4() is NOT suitable — UUID4 has reduced entropy (6 bits fixed).
    """
    return secrets.token_hex(64)


def hash_token(raw_token: str) -> str:
    """
    SHA-256 hash of a raw token for safe database storage.

    WHY hash before storing?
        If the database is leaked, raw refresh tokens cannot be derived
        from SHA-256 hashes (one-way function).
        The raw token is sent to the client ONCE and never stored.
    """
    return hashlib.sha256(raw_token.encode()).hexdigest()


# =============================================================================
# JWT Operations (RS256)
# =============================================================================

def create_access_token(
    user_id: str,
    email: str,
    first_name: str,
    roles: list[str],
    permissions: list[str],
) -> tuple[str, str]:
    """
    Create a signed RS256 JWT access token.

    Returns:
        (token_string, jti) — jti is the unique token ID used for blacklisting.

    Token TTL: 15 minutes (configured in settings).

    JWT Payload (per spec 03-AUTH-AND-NEXTJS-GUIDE.md):
        sub: user UUID
        email: lowercase email
        first_name: for UI display without extra API call
        roles: list of role names
        permissions: all accumulated permissions (from all roles)
        jti: unique token ID (for revocation blacklist)
        iat: issued-at timestamp
        exp: expiry timestamp
    """
    settings = get_settings()
    now = datetime.now(timezone.utc)
    jti = str(uuid.uuid4())

    payload = {
        "sub": user_id,
        "email": email,
        "first_name": first_name,
        "roles": roles,
        "permissions": permissions,
        "jti": jti,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp()),
    }

    token = jwt.encode(
        payload,
        settings.jwt_private_key,
        algorithm=settings.JWT_ALGORITHM,
    )
    return token, jti


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.

    Validates:
    - Signature (RS256 with public key)
    - Expiry (exp claim)
    - Issued-at (iat claim)

    Raises:
        TokenExpiredError: Token is valid but expired
        TokenInvalidError: Token is malformed or signature invalid

    NOTE: Blacklist check (revoked JTI) is done in the FastAPI dependency,
    not here. Keeping this function pure and synchronous for testability.
    """
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_public_key,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError as e:
        error_str = str(e).lower()
        if "expired" in error_str:
            raise TokenExpiredError() from e
        raise TokenInvalidError() from e
