"""
ELARION AI Learning Platform — Backend
Module: app/shared/exceptions.py

Purpose:
    Centralized, typed exception hierarchy.
    All business rule violations and error conditions raise typed exceptions.
    The global exception handler (in main.py) maps them to HTTP responses.

Why a typed exception hierarchy?
    1. Code is self-documenting: raise InvalidCredentialsError() is clearer
       than raise HTTPException(status_code=401, detail="Invalid credentials")
    2. Business logic doesn't know about HTTP — services raise domain errors,
       the HTTP layer translates them. This separation is critical for testability.
    3. Consistent error response format across the entire API.
"""

from __future__ import annotations

from fastapi import HTTPException, status


# =============================================================================
# Base Application Exception
# =============================================================================

class ElarionError(Exception):
    """
    Base exception for all ELARION domain errors.
    All custom exceptions inherit from this class.
    """
    def __init__(self, message: str, code: str | None = None) -> None:
        self.message = message
        self.code = code or self.__class__.__name__
        super().__init__(message)


# =============================================================================
# Authentication & Authorization Exceptions (HTTP 4xx)
# =============================================================================

class InvalidCredentialsError(ElarionError):
    """Invalid email or password. Maps to 401."""
    def __init__(self) -> None:
        # SECURITY: Always use a generic message. Never reveal which field was wrong.
        super().__init__(
            message="Invalid credentials. Please check your email and password.",
            code="INVALID_CREDENTIALS"
        )


class TokenExpiredError(ElarionError):
    """JWT access token has expired. Maps to 401."""
    def __init__(self) -> None:
        super().__init__(message="Access token expired.", code="TOKEN_EXPIRED")


class TokenInvalidError(ElarionError):
    """JWT token is malformed or signature is invalid. Maps to 401."""
    def __init__(self) -> None:
        super().__init__(message="Invalid token.", code="TOKEN_INVALID")


class TokenRevokedError(ElarionError):
    """JWT token has been revoked (logout blacklist). Maps to 401."""
    def __init__(self) -> None:
        super().__init__(message="Token has been revoked.", code="TOKEN_REVOKED")


class AccountSuspendedError(ElarionError):
    """User account is suspended. Maps to 403."""
    def __init__(self) -> None:
        super().__init__(
            message="Your account has been suspended. Contact support.",
            code="ACCOUNT_SUSPENDED"
        )


class EmailNotVerifiedError(ElarionError):
    """User has not verified their email address. Maps to 403."""
    def __init__(self) -> None:
        super().__init__(
            message="Please verify your email address before logging in.",
            code="EMAIL_NOT_VERIFIED"
        )


class PermissionDeniedError(ElarionError):
    """User lacks required permission for this action. Maps to 403."""
    def __init__(self, required_permission: str | None = None) -> None:
        self.permission = required_permission
        msg = f"You do not have permission '{required_permission}' to perform this action." if required_permission else "You do not have permission to perform this action."
        super().__init__(message=msg, code="PERMISSION_DENIED")


class LessonLockedError(ElarionError):
    """Lesson is locked due to active weakness flag. Maps to 403."""
    def __init__(self, reason: str = "") -> None:
        super().__init__(
            message=f"This lesson is locked. Complete your remediation plan first. {reason}".strip(),
            code="LESSON_LOCKED"
        )


# =============================================================================
# Resource Exceptions (HTTP 4xx)
# =============================================================================

class ResourceNotFoundError(ElarionError):
    """Requested resource does not exist. Maps to 404."""
    def __init__(self, resource: str, identifier: str | None = None) -> None:
        msg = f"{resource} not found."
        if identifier:
            msg = f"{resource} '{identifier}' not found."
        super().__init__(message=msg, code="NOT_FOUND")


class DuplicateResourceError(ElarionError):
    """Resource already exists (unique constraint violation). Maps to 409."""
    def __init__(self, resource: str, field: str) -> None:
        super().__init__(
            message=f"{resource} with this {field} already exists.",
            code="DUPLICATE_RESOURCE"
        )


class RateLimitExceededError(ElarionError):
    """Rate limit exceeded. Maps to 429."""
    def __init__(self, action: str, retry_after: int) -> None:
        super().__init__(
            message=f"Too many {action} attempts. Please try again later.",
            code="RATE_LIMIT_EXCEEDED"
        )
        self.retry_after = retry_after


# =============================================================================
# Business Rule Exceptions (HTTP 4xx / 422)
# =============================================================================

class BusinessRuleError(ElarionError):
    """General business rule violation. Maps to 422."""
    def __init__(self, message: str) -> None:
        super().__init__(message=message, code="BUSINESS_RULE_VIOLATION")


class InvalidStateTransitionError(ElarionError):
    """State machine transition not allowed. Maps to 422."""
    def __init__(self, entity: str, from_state: str, to_state: str) -> None:
        super().__init__(
            message=f"Cannot transition {entity} from '{from_state}' to '{to_state}'.",
            code="INVALID_STATE_TRANSITION"
        )


# =============================================================================
# AI / Integration Exceptions
# =============================================================================

class AssessmentGenerationError(ElarionError):
    """Failed to generate assessment via LLM. Maps to 500."""
    def __init__(self, reason: str) -> None:
        super().__init__(message=f"Assessment generation failed: {reason}", code="GENERATION_FAILED")


class GradingError(ElarionError):
    """Grading pipeline encountered an error. Maps to 500."""
    def __init__(self, reason: str) -> None:
        super().__init__(message=f"Grading error: {reason}", code="GRADING_ERROR")


class StorageError(ElarionError):
    """Object storage (S3/MinIO) operation failed. Maps to 500."""
    def __init__(self, operation: str, reason: str) -> None:
        super().__init__(
            message=f"Storage {operation} failed: {reason}",
            code="STORAGE_ERROR"
        )
