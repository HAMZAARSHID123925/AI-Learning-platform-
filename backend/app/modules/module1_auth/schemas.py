"""
ELARION AI Learning Platform — Backend
Module: app/modules/module1_auth/schemas.py

Purpose:
    Pydantic v2 request and response schemas for Module 1 (Auth & Users).
    These are the API contract definitions — what clients send and receive.

Pydantic v2 vs v1:
    v2 is significantly faster (10-50x) due to Rust-based validation core.
    We use model_config instead of class Config, and @field_validator
    instead of @validator. All v2 patterns.

Separation of concerns:
    Schemas (Pydantic) ≠ Models (SQLAlchemy).
    SQLAlchemy models map to database rows.
    Pydantic schemas define API shape and validation.
    NEVER return SQLAlchemy models directly from routes — always convert to schema.
    This prevents accidental exposure of sensitive fields (password_hash, etc.)
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# =============================================================================
# Auth Request Schemas
# =============================================================================

class RegisterRequest(BaseModel):
    """POST /api/v1/auth/register"""
    model_config = ConfigDict(str_strip_whitespace=True)

    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    grade: int | None = Field(default=None, ge=1, le=5)
    role: str | None = Field(default="student")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """
        Enforce strict NIST 800-63B password policy:
        - Minimum 10 characters
        - At least one uppercase letter (A-Z)
        - At least one lowercase letter (a-z)
        - At least one numeric digit (0-9)
        - At least one special symbol
        """
        if len(v) < 10:
            raise ValueError("Password must be at least 10 characters long.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>/?`~" for c in v):
            raise ValueError("Password must contain at least one special symbol (!@#$%^&*...).")
        return v

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower().strip()


class LoginRequest(BaseModel):
    """POST /api/v1/auth/login"""
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower().strip()


class RefreshRequest(BaseModel):
    """POST /api/v1/auth/refresh — token comes from HttpOnly cookie, not body."""
    pass


class ForgotPasswordRequest(BaseModel):
    """POST /api/v1/auth/forgot-password"""
    email: EmailStr

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower().strip()


class ResetPasswordRequest(BaseModel):
    """POST /api/v1/auth/reset-password"""
    token: str = Field(min_length=1)
    new_password: str = Field(min_length=10, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 10:
            raise ValueError("Password must be at least 10 characters long.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>/?`~" for c in v):
            raise ValueError("Password must contain at least one special symbol (!@#$%^&*...).")
        return v


class VerifyEmailRequest(BaseModel):
    """POST /api/v1/auth/verify-email"""
    token: str = Field(min_length=1)


# =============================================================================
# Auth Response Schemas
# =============================================================================

class UserInTokenResponse(BaseModel):
    """Minimal user data returned in the login response."""
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    grade: int | None = None
    roles: list[str]


class TokenResponse(BaseModel):
    """
    POST /api/v1/auth/login response.

    Note: refresh_token is NOT in this response — it is set as an HttpOnly cookie.
    Reason: Cookies are inaccessible to JavaScript (XSS protection).
    """
    access_token: str
    token_type: str = "Bearer"
    expires_in: int  # Seconds
    user: UserInTokenResponse


class RefreshTokenResponse(BaseModel):
    """POST /api/v1/auth/refresh response."""
    access_token: str
    token_type: str = "Bearer"
    expires_in: int


# =============================================================================
# User Schemas
# =============================================================================

class UserResponse(BaseModel):
    """Full user profile response — for GET /users/me, GET /users/:id."""
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    grade: int | None = None
    status: str
    email_verified: bool
    parental_consent: bool | None
    roles: list[str]
    permissions: list[str]
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UpdateUserRequest(BaseModel):
    """PATCH /api/v1/users/me — partial update."""
    model_config = ConfigDict(str_strip_whitespace=True)

    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    grade: int | None = Field(default=None, ge=1, le=5)


class AdminUpdateUserRequest(BaseModel):
    """PATCH /api/v1/users/:id — Admin can update more fields."""
    model_config = ConfigDict(str_strip_whitespace=True)

    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    grade: int | None = Field(default=None, ge=1, le=5)
    status: str | None = Field(default=None, pattern="^(active|suspended|pending_verification)$")
    email_verified: bool | None = None
    parental_consent: bool | None = None


class AssignRoleRequest(BaseModel):
    """POST /api/v1/users/:id/roles"""
    role_name: str = Field(pattern="^(Student|Instructor|Admin)$")


# =============================================================================
# Role & Permission Schemas
# =============================================================================

class RoleResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    permissions: list[str]

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Audit Log Schemas
# =============================================================================

class AuditLogResponse(BaseModel):
    id: uuid.UUID
    actor_id: uuid.UUID | None
    action: str
    target_type: str | None
    target_id: uuid.UUID | None
    metadata: dict | None = Field(default=None, validation_alias="metadata_")
    ip_address: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# =============================================================================
# Active Session Schemas
# =============================================================================

class SessionInfoResponse(BaseModel):
    session_id: str
    device_info: str
    ip_address: str | None
    last_active_at: datetime
    is_current: bool
