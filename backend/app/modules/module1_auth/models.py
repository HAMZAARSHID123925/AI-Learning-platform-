"""
ELARION AI Learning Platform — Backend
Module: app/modules/module1_auth/models.py

Purpose:
    SQLAlchemy ORM models for Module 1 — User & Access Management.
    Includes: User, Role, Permission, RolePermission, UserRole,
              RefreshToken, PasswordResetToken, AuditLog.

All models exactly match the schema defined in 02-DATABASE-AND-ERD.md.
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# =============================================================================
# Enums (must match Postgres CREATE TYPE in migration 001)
# =============================================================================

class UserStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"
    pending_verification = "pending_verification"


# =============================================================================
# Models
# =============================================================================

class User(Base):
    """
    Central user entity. Every platform user has one record here.

    Email is stored lowercase (enforced at service layer, not DB).
    Password is stored as bcrypt hash — plaintext never persists.
    """
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name="uq_users_email"),
        Index("ix_users_email", "email"),
        Index("ix_users_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus, name="user_status"),
        nullable=False,
        default=UserStatus.pending_verification,
    )
    grade: Mapped[int | None] = mapped_column(
        Integer, CheckConstraint("grade >= 1 AND grade <= 5", name="ck_users_grade"), nullable=True
    )
    email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    parental_consent: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user_roles: Mapped[list[UserRole]] = relationship("UserRole", back_populates="user", lazy="selectin")
    refresh_tokens: Mapped[list[RefreshToken]] = relationship("RefreshToken", back_populates="user")
    password_reset_tokens: Mapped[list[PasswordResetToken]] = relationship("PasswordResetToken", back_populates="user")
    audit_logs: Mapped[list[AuditLog]] = relationship("AuditLog", back_populates="actor", foreign_keys="AuditLog.actor_id")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def has_role(self, role_name: str) -> bool:
        """Check if this user has a specific role."""
        return any(ur.role.name == role_name for ur in self.user_roles)

    def get_permissions(self) -> set[str]:
        """Accumulate all permissions from all roles (RBAC is additive)."""
        permissions: set[str] = set()
        for ur in self.user_roles:
            for rp in ur.role.role_permissions:
                permissions.add(rp.permission.code)
        return permissions

    def __repr__(self) -> str:
        return f"<User email={self.email!r} status={self.status.value!r}>"


class Role(Base):
    """
    Platform roles: Student, Instructor, Admin.
    Roles are seeded at deployment — not created dynamically.
    """
    __tablename__ = "roles"
    __table_args__ = (
        UniqueConstraint("name", name="uq_roles_name"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    user_roles: Mapped[list[UserRole]] = relationship("UserRole", back_populates="role")
    role_permissions: Mapped[list[RolePermission]] = relationship("RolePermission", back_populates="role", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Role name={self.name!r}>"


class Permission(Base):
    """
    Granular permission codes. e.g., "course:create", "assessment:take".
    Permissions are seeded at deployment — not created dynamically.
    """
    __tablename__ = "permissions"
    __table_args__ = (
        UniqueConstraint("code", name="uq_permissions_code"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    role_permissions: Mapped[list[RolePermission]] = relationship("RolePermission", back_populates="permission")

    def __repr__(self) -> str:
        return f"<Permission code={self.code!r}>"


class RolePermission(Base):
    """
    Many-to-many junction: Role ↔ Permission.
    Composite primary key — no surrogate ID needed.
    """
    __tablename__ = "role_permissions"

    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    )
    permission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True
    )

    role: Mapped[Role] = relationship("Role", back_populates="role_permissions")
    permission: Mapped[Permission] = relationship("Permission", back_populates="role_permissions", lazy="selectin")


class UserRole(Base):
    """
    Many-to-many junction: User ↔ Role.
    A user can have multiple roles (e.g., both Instructor and Admin).
    Permissions accumulate additively across all roles.
    """
    __tablename__ = "user_roles"
    __table_args__ = (
        Index("ix_user_roles_user_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    )

    user: Mapped[User] = relationship("User", back_populates="user_roles")
    role: Mapped[Role] = relationship("Role", back_populates="user_roles", lazy="selectin")


class RefreshToken(Base):
    """
    Refresh token record. Stores SHA-256 hash — never the raw token.

    Lifecycle:
    - Created on login/refresh
    - revoked_at set on: logout, rotation (each refresh issues a new token)
    - Expired rows are cleaned up by a periodic job (future)

    WHY not store in Redis only?
        Redis is ephemeral. A Redis restart would log everyone out.
        PostgreSQL is the source of truth; Redis is the fast path.
    """
    __tablename__ = "refresh_tokens"
    __table_args__ = (
        Index("ix_refresh_tokens_user_id", "user_id"),
        Index("ix_refresh_tokens_token_hash", "token_hash"),
        Index("ix_refresh_tokens_expires_at", "expires_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    token_hash: Mapped[str] = mapped_column(Text, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped[User] = relationship("User", back_populates="refresh_tokens")

    @property
    def is_valid(self) -> bool:
        """Token is valid if not revoked and not expired."""
        now = datetime.now(timezone.utc)
        return self.revoked_at is None and self.expires_at > now


class PasswordResetToken(Base):
    """
    Single-use password reset token. Expires in 1 hour.
    Stores SHA-256 hash of the raw token sent via email.
    """
    __tablename__ = "password_reset_tokens"
    __table_args__ = (
        Index("ix_password_reset_tokens_token_hash", "token_hash"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    token_hash: Mapped[str] = mapped_column(Text, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User] = relationship("User", back_populates="password_reset_tokens")

    @property
    def is_usable(self) -> bool:
        """Token is usable if not yet used and not expired."""
        now = datetime.now(timezone.utc)
        return self.used_at is None and self.expires_at > now


class AuditLog(Base):
    """
    Immutable event log for all security-relevant actions.

    WHY audit logging?
    1. Compliance: FERPA requires audit trails for educational data access.
    2. Security: Detect abnormal patterns (e.g., 100 logins in 1 minute).
    3. Debugging: Trace exactly what happened when.

    Rows are NEVER deleted (append-only). Archive old rows to cold storage
    (e.g., S3) after 90 days in production.
    """
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_actor_id", "actor_id"),
        Index("ix_audit_logs_action", "action"),
        Index("ix_audit_logs_created_at", "created_at"),
        Index("ix_audit_logs_target", "target_type", "target_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    target_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    target_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(INET, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def __init__(self, *args, **kw):
        if "metadata" in kw:
            kw["metadata_"] = kw.pop("metadata")
        super().__init__(*args, **kw)

    actor: Mapped[User | None] = relationship(
        "User", back_populates="audit_logs", foreign_keys=[actor_id]
    )

    def __repr__(self) -> str:
        return f"<AuditLog action={self.action!r} actor={self.actor_id}>"
