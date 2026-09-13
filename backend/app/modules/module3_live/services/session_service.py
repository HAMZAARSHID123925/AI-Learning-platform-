"""
ELARION AI Learning Platform — Backend
Module: app/modules/module3_live/services/session_service.py

Purpose:
    Core service for managing live online classroom sessions, room provisioning,
    token distribution, status state transitions, and attendance logging.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.module2_content.models import Course
from app.modules.module3_live.models import AttendanceStatus, LiveSession, SessionAttendance, SessionStatus
from app.modules.module3_live.services.video_provider import get_video_provider
from app.shared.exceptions import AuthorizationError, BusinessRuleError, ResourceNotFoundError
from app.shared.logging_config import get_logger

logger = get_logger(__name__)


async def create_live_session(
    db: AsyncSession,
    instructor_id: uuid.UUID,
    course_id: uuid.UUID,
    title: str,
    description: str | None,
    scheduled_at: datetime,
    duration_minutes: int = 60,
    max_participants: int = 100,
) -> LiveSession:
    """
    Creates a new live session and provisions a virtual room via the configured video provider.
    """
    # 1. Verify course exists
    course = await db.get(Course, course_id)
    if not course:
        raise ResourceNotFoundError("Course", course_id)

    # 2. Provision room on video provider
    provider = get_video_provider()
    session_id = uuid.uuid4()
    room_id, room_url = await provider.create_room(
        session_id=session_id,
        title=title,
        max_participants=max_participants
    )

    now = datetime.now(timezone.utc)
    session = LiveSession(
        id=session_id,
        course_id=course_id,
        instructor_id=instructor_id,
        title=title,
        description=description,
        scheduled_at=scheduled_at,
        duration_minutes=duration_minutes,
        status=SessionStatus.scheduled,
        video_provider=provider.name,
        room_id=room_id,
        room_url=room_url,
        max_participants=max_participants,
        created_at=now,
        updated_at=now,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    logger.info("live_session_created", session_id=str(session.id), course_id=str(course_id))
    return session


async def list_live_sessions(
    db: AsyncSession,
    course_id: uuid.UUID | None = None,
    from_dt: datetime | None = None,
    to_dt: datetime | None = None,
    status: SessionStatus | None = None,
) -> list[LiveSession]:
    """
    Lists live sessions with optional course and temporal filters.
    """
    query = select(LiveSession).order_by(LiveSession.scheduled_at.asc())
    if course_id:
        query = query.where(LiveSession.course_id == course_id)
    if from_dt:
        query = query.where(LiveSession.scheduled_at >= from_dt)
    if to_dt:
        query = query.where(LiveSession.scheduled_at <= to_dt)
    if status:
        query = query.where(LiveSession.status == status)

    res = await db.execute(query)
    return list(res.scalars().all())


async def get_live_session(db: AsyncSession, session_id: uuid.UUID) -> LiveSession:
    session = await db.get(LiveSession, session_id)
    if not session:
        raise ResourceNotFoundError("LiveSession", session_id)
    return session


async def update_live_session(
    db: AsyncSession,
    session_id: uuid.UUID,
    user,
    **fields
) -> LiveSession:
    """
    Updates session details. Must be session host or Admin.
    """
    session = await get_live_session(db, session_id)
    if session.instructor_id != user.id and not user.has_role("Admin"):
        raise AuthorizationError("Only the host instructor or Admin can update this session.")

    for k, v in fields.items():
        if v is not None and hasattr(session, k):
            setattr(session, k, v)

    session.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(session)
    return session


async def join_live_session(
    db: AsyncSession,
    session_id: uuid.UUID,
    user,
) -> tuple[LiveSession, str]:
    """
    Generates WebRTC token for joining the live room.
    Records/upserts initial attendance record for students.
    """
    session = await get_live_session(db, session_id)

    if session.status in (SessionStatus.ended, SessionStatus.cancelled):
        raise BusinessRuleError(f"Cannot join a session that is {session.status.value}.")

    is_host = (session.instructor_id == user.id) or user.has_role("Admin")

    # If host joins a scheduled session, transition to live
    now = datetime.now(timezone.utc)
    if is_host and session.status == SessionStatus.scheduled:
        session.status = SessionStatus.live
        session.updated_at = now

    # Upsert attendance record for students
    if not is_host:
        stmt = insert(SessionAttendance).values(
            session_id=session_id,
            student_id=user.id,
            status=AttendanceStatus.registered,
            joined_at=now,
            created_at=now
        ).on_conflict_do_update(
            index_elements=["session_id", "student_id"],
            set_={"joined_at": now}
        )
        await db.execute(stmt)

    await db.commit()

    # Generate token from provider
    provider = get_video_provider()
    token = await provider.generate_token(
        room_id=session.room_id or str(session.id),
        user_id=user.id,
        is_host=is_host
    )

    logger.info("user_joined_live_session", session_id=str(session_id), user_id=str(user.id), is_host=is_host)
    return session, token


async def end_live_session(
    db: AsyncSession,
    session_id: uuid.UUID,
    user,
) -> LiveSession:
    """
    Terminates a live session and closes the provider room.
    """
    session = await get_live_session(db, session_id)
    if session.instructor_id != user.id and not user.has_role("Admin"):
        raise AuthorizationError("Only the host instructor or Admin can end this session.")

    session.status = SessionStatus.ended
    session.updated_at = datetime.now(timezone.utc)

    provider = get_video_provider()
    if session.room_id:
        await provider.delete_room(session.room_id)

    await db.commit()
    await db.refresh(session)
    logger.info("live_session_ended", session_id=str(session_id))
    return session


async def cancel_live_session(
    db: AsyncSession,
    session_id: uuid.UUID,
    user,
) -> LiveSession:
    """
    Cancels a scheduled session.
    Invariant (Rule 5): A session can only be cancelled before it goes live.
    """
    session = await get_live_session(db, session_id)
    if session.instructor_id != user.id and not user.has_role("Admin"):
        raise AuthorizationError("Only the host instructor or Admin can cancel this session.")

    if session.status != SessionStatus.scheduled:
        raise BusinessRuleError("A session can only be cancelled while scheduled. Live sessions must be ended.")

    session.status = SessionStatus.cancelled
    session.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(session)
    logger.info("live_session_cancelled", session_id=str(session_id))
    return session


async def get_session_attendance(
    db: AsyncSession,
    session_id: uuid.UUID,
    user,
) -> list[SessionAttendance]:
    session = await get_live_session(db, session_id)
    if session.instructor_id != user.id and not user.has_role("Admin"):
        raise AuthorizationError("Only the host instructor or Admin can view attendance logs.")

    query = (
        select(SessionAttendance)
        .where(SessionAttendance.session_id == session_id)
        .order_by(SessionAttendance.created_at.asc())
    )
    res = await db.execute(query)
    return list(res.scalars().all())
