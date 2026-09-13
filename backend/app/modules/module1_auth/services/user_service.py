"""
ELARION AI Learning Platform — Backend
Module: app/modules/module1_auth/services/user_service.py

Purpose:
    User CRUD operations (Admin functions) and role management.
"""

from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.module1_auth.models import (
    AuditLog,
    Role,
    User,
    UserRole,
    UserStatus,
)
from app.shared.exceptions import (
    BusinessRuleError,
    ResourceNotFoundError,
)
from app.shared.logging_config import get_logger
from app.shared.pagination import PaginationParams

logger = get_logger(__name__)


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User:
    """Fetch a user by ID with roles loaded. Raises 404 if not found."""
    result = await db.execute(
        select(User)
        .where(User.id == user_id)
        .options(
            selectinload(User.user_roles)
            .selectinload(UserRole.role)
            .selectinload(Role.role_permissions)
        )
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise ResourceNotFoundError("User", str(user_id))
    return user


async def list_users(
    db: AsyncSession,
    params: PaginationParams,
    status_filter: str | None = None,
) -> tuple[list[User], int]:
    """
    List all users with pagination and optional status filter.
    Returns (users, total_count).
    """
    query = select(User).options(
        selectinload(User.user_roles).selectinload(UserRole.role)
    )
    count_query = select(func.count(User.id))

    if status_filter:
        query = query.where(User.status == status_filter)
        count_query = count_query.where(User.status == status_filter)

    query = query.offset(params.offset).limit(params.limit).order_by(User.created_at.desc())

    result = await db.execute(query)
    count_result = await db.execute(count_query)

    return result.scalars().all(), count_result.scalar_one()


async def update_user(
    db: AsyncSession,
    user_id: uuid.UUID,
    first_name: str | None = None,
    last_name: str | None = None,
    status: str | None = None,
    email_verified: bool | None = None,
    parental_consent: bool | None = None,
) -> User:
    """Update user fields. Only updates fields that are explicitly provided."""
    user = await get_user_by_id(db, user_id)

    if first_name is not None:
        user.first_name = first_name
    if last_name is not None:
        user.last_name = last_name
    if status is not None:
        user.status = UserStatus(status)
    if email_verified is not None:
        user.email_verified = email_verified
    if parental_consent is not None:
        user.parental_consent = parental_consent

    logger.info("user_updated", user_id=str(user_id))
    return user


async def assign_role(
    db: AsyncSession,
    user_id: uuid.UUID,
    role_name: str,
    actor_id: uuid.UUID,
) -> None:
    """
    Assign a role to a user. Idempotent: silently succeeds if already assigned.
    """
    user = await get_user_by_id(db, user_id)

    role_result = await db.execute(select(Role).where(Role.name == role_name))
    role = role_result.scalar_one_or_none()
    if role is None:
        raise ResourceNotFoundError("Role", role_name)

    # Check if already assigned (idempotent)
    existing = await db.execute(
        select(UserRole).where(
            UserRole.user_id == user_id,
            UserRole.role_id == role.id,
        )
    )
    if existing.scalar_one_or_none():
        return  # Already has this role — no error

    db.add(UserRole(user_id=user_id, role_id=role.id))

    # Audit log
    db.add(AuditLog(
        actor_id=actor_id,
        action="role.assigned",
        target_type="User",
        target_id=user_id,
        metadata={"role": role_name},
    ))
    logger.info("role_assigned", user_id=str(user_id), role=role_name, actor=str(actor_id))


async def revoke_role(
    db: AsyncSession,
    user_id: uuid.UUID,
    role_name: str,
    actor_id: uuid.UUID,
) -> None:
    """Revoke a role from a user."""
    role_result = await db.execute(select(Role).where(Role.name == role_name))
    role = role_result.scalar_one_or_none()
    if role is None:
        raise ResourceNotFoundError("Role", role_name)

    result = await db.execute(
        select(UserRole).where(
            UserRole.user_id == user_id,
            UserRole.role_id == role.id,
        )
    )
    user_role = result.scalar_one_or_none()
    if user_role is None:
        raise BusinessRuleError(f"User does not have role '{role_name}'.")

    await db.delete(user_role)

    db.add(AuditLog(
        actor_id=actor_id,
        action="role.revoked",
        target_type="User",
        target_id=user_id,
        metadata={"role": role_name},
    ))
    logger.info("role_revoked", user_id=str(user_id), role=role_name, actor=str(actor_id))
