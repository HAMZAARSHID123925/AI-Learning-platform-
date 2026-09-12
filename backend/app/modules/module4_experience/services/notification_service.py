"""
ELARION AI Learning Platform — Backend
Module: app/modules/module4_experience/services/notification_service.py

Purpose:
    Handles in-app notification persistence in PostgreSQL and real-time broadcasting
    to connected students via Redis Pub/Sub.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.modules.module4_experience.models import Notification, NotificationType
from app.shared.exceptions import ResourceNotFoundError
from app.shared.logging_config import get_logger
from app.shared.redis_client import get_redis_client

logger = get_logger(__name__)


def get_notification_channel(student_id: uuid.UUID) -> str:
    settings = get_settings()
    return f"{settings.REDIS_KEY_PREFIX}:notifications:{student_id}"


async def create_and_publish_notification(
    db: AsyncSession,
    student_id: uuid.UUID,
    notification_type: NotificationType | str,
    title: str,
    body: str,
    payload: dict[str, Any] | None = None
) -> Notification:
    """
    1. Persists notification record into PostgreSQL.
    2. Broadcasts notification payload to student's Redis Pub/Sub channel for live SSE streaming.
    """
    if isinstance(notification_type, str):
        try:
            n_type = NotificationType(notification_type)
        except ValueError:
            n_type = NotificationType.general
    else:
        n_type = notification_type

    now = datetime.now(timezone.utc)
    notification = Notification(
        student_id=student_id,
        notification_type=n_type,
        title=title,
        body=body,
        payload=payload or {},
        read=False,
        created_at=now
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)

    # Broadcast via Redis PubSub
    try:
        redis = get_redis_client()
        channel = get_notification_channel(student_id)
        msg_payload = {
            "id": str(notification.id),
            "notification_type": notification.notification_type.value,
            "title": notification.title,
            "body": notification.body,
            "payload": notification.payload,
            "created_at": notification.created_at.isoformat()
        }
        await redis.publish(channel, json.dumps(msg_payload))
        logger.info("published_realtime_notification", student_id=str(student_id), notification_id=str(notification.id))
    except Exception as exc:
        logger.warning("redis_notification_broadcast_failed", error=str(exc), student_id=str(student_id))

    return notification


async def get_student_notifications(
    db: AsyncSession,
    student_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
    unread_only: bool = False
) -> tuple[list[Notification], int, int]:
    """
    Fetches paginated notifications for a student.
    Returns (items, total_matching, total_unread).
    """
    offset = (page - 1) * page_size

    # Total unread count
    unread_q = select(func.count(Notification.id)).where(
        Notification.student_id == student_id,
        Notification.read == False
    )
    unread_res = await db.execute(unread_q)
    unread_count = unread_res.scalar_one() or 0

    # Query with filters
    query = select(Notification).where(Notification.student_id == student_id)
    if unread_only:
        query = query.where(Notification.read == False)

    count_q = select(func.count()).select_from(query.subquery())
    count_res = await db.execute(count_q)
    total = count_res.scalar_one() or 0

    query = query.order_by(Notification.created_at.desc()).offset(offset).limit(page_size)
    res = await db.execute(query)
    items = res.scalars().all()

    return list(items), total, unread_count


async def mark_notification_as_read(
    db: AsyncSession,
    student_id: uuid.UUID,
    notification_id: uuid.UUID
) -> Notification:
    """
    Marks a single notification as read.
    """
    query = select(Notification).where(
        Notification.id == notification_id,
        Notification.student_id == student_id
    )
    res = await db.execute(query)
    notif = res.scalar_one_or_none()
    if not notif:
        raise ResourceNotFoundError("Notification", notification_id)

    notif.read = True
    notif.read_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(notif)
    return notif


async def mark_all_notifications_as_read(
    db: AsyncSession,
    student_id: uuid.UUID
) -> int:
    """
    Marks all unread notifications as read for a student.
    Returns count of updated rows.
    """
    now = datetime.now(timezone.utc)
    stmt = (
        update(Notification)
        .where(
            Notification.student_id == student_id,
            Notification.read == False
        )
        .values(read=True, read_at=now)
    )
    res = await db.execute(stmt)
    await db.commit()
    return res.rowcount or 0
