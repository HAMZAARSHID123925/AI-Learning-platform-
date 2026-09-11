"""
ELARION AI Learning Platform — Backend
Module: app/modules/module3_live/models.py

Purpose: Module 3 — Live Classes & Video Sessions (Phase 4)
Status:  STUB — Models defined but no service/router yet.
         This ensures schema migrations include these tables on Day 1.
         Services will be implemented in Phase 4 (Days 13-17).

Video Provider Abstraction:
    The platform uses a Strategy pattern for video providers.
    VideoProvider is an abstract interface with methods:
        - create_room(session_id) → room_url
        - get_token(room_id, user_id) → token
    MockVideoProvider: dev stub (returns fake values)
    ZoomProvider / AgoraProvider / DailyProvider: real implementations (Phase 4)
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SessionStatus(str, enum.Enum):
    scheduled = "scheduled"
    live = "live"
    ended = "ended"
    cancelled = "cancelled"


class AttendanceStatus(str, enum.Enum):
    registered = "registered"
    attended = "attended"
    no_show = "no_show"


class LiveSession(Base):
    """Scheduled live class session. Linked to a CourseModule."""
    __tablename__ = "live_sessions"
    __table_args__ = (
        Index("ix_live_sessions_course_id", "course_id"),
        Index("ix_live_sessions_scheduled_at", "scheduled_at"),
        Index("ix_live_sessions_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    instructor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=60)
    status: Mapped[SessionStatus] = mapped_column(
        Enum(SessionStatus, name="session_status"), nullable=False, default=SessionStatus.scheduled
    )
    # Video provider fields (populated when session goes live)
    video_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)  # mock | zoom | agora | daily
    room_id: Mapped[str | None] = mapped_column(String(500), nullable=True)
    room_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    max_participants: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    recording_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    attendances: Mapped[list[SessionAttendance]] = relationship(
        "SessionAttendance", back_populates="session", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<LiveSession title={self.title!r} status={self.status.value!r}>"


class SessionAttendance(Base):
    """Student attendance record for a live session."""
    __tablename__ = "session_attendances"
    __table_args__ = (
        UniqueConstraint("session_id", "student_id", name="uq_session_attendance"),
        Index("ix_session_attendances_student_id", "student_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("live_sessions.id", ondelete="CASCADE"), nullable=False
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[AttendanceStatus] = mapped_column(
        Enum(AttendanceStatus, name="attendance_status"), nullable=False, default=AttendanceStatus.registered
    )
    joined_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    left_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    session: Mapped[LiveSession] = relationship("LiveSession", back_populates="attendances")
