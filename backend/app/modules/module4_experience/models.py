"""
ELARION AI Learning Platform — Backend
Module: app/modules/module4_experience/models.py

Purpose:
    Models for Module 4 — Student Learning Experience.
    Tracks lesson completion, progress, content gating (LearningPathState),
    and student notifications.
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
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PathState(str, enum.Enum):
    """
    Lesson access state for a specific student.

    State machine (from 05-ADAPTIVE-LOOP-AND-EVENTS.md §5):
        unlocked  → in_progress  (student first accesses the lesson)
        unlocked  → locked       (weakness detected in prerequisite skill)
        in_progress → mastered   (lesson completed + skill score ≥ 0.60)
        in_progress → locked     (weakness detected while in progress)
        locked    → unlocked     (all prerequisite weaknesses resolved)
        mastered  is terminal    (no transitions unless content updated)
    """
    unlocked = "unlocked"
    in_progress = "in_progress"
    mastered = "mastered"
    locked = "locked"


class NotificationType(str, enum.Enum):
    remediation_plan_created = "remediation_plan_created"
    retest_ready = "retest_ready"
    instructor_escalation = "instructor_escalation"
    session_reminder = "session_reminder"
    course_published = "course_published"
    general = "general"


class StudentProgress(Base):
    """
    Per-lesson completion record for a student.

    WHY not track all visits, just completed?
        Completion is idempotent and the meaningful business metric.
        Time-on-page tracking is done via frontend analytics (not the LMS core).

    UNIQUE constraint on (student_id, lesson_id):
        A student completes a lesson once. On re-attempt, we update the existing row.
        This is an UPSERT pattern — INSERT ... ON CONFLICT DO UPDATE.
    """
    __tablename__ = "student_progress"
    __table_args__ = (
        UniqueConstraint("student_id", "lesson_id", name="uq_student_progress_student_lesson"),
        Index("ix_student_progress_student_id", "student_id"),
        Index("ix_student_progress_lesson_id", "lesson_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False
    )
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    time_spent_seconds: Mapped[int | None] = mapped_column(
        # Optional: tracked by frontend, sent on completion
        __import__("sqlalchemy").Integer, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<StudentProgress student={self.student_id} lesson={self.lesson_id} completed={self.completed}>"


class LearningPathState(Base):
    """
    Per-student per-lesson access state (content gating).

    WHY a separate table instead of a column on StudentProgress?
        StudentProgress tracks COMPLETION.
        LearningPathState tracks ACCESS (locked/unlocked).
        These are orthogonal concerns. A student can have completed a lesson
        (progress) and have a downstream lesson locked (path state).

    Rows are created lazily when the state is not default (unlocked).
    A missing row = unlocked (default).

    This is the content gating mechanism from spec §Module4.
    GET /lessons/:id checks this before returning lesson content.
    """
    __tablename__ = "learning_path_states"
    __table_args__ = (
        UniqueConstraint("student_id", "lesson_id", name="uq_learning_path_state"),
        Index("ix_learning_path_states_student_id", "student_id"),
        Index("ix_learning_path_states_state", "state"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False
    )
    state: Mapped[PathState] = mapped_column(
        Enum(PathState, name="path_state"), nullable=False, default=PathState.unlocked
    )
    locked_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<LearningPathState student={self.student_id} lesson={self.lesson_id} state={self.state.value!r}>"


class Notification(Base):
    """
    In-app notification for students and instructors.
    Created by M6 (weakness escalation) and M3 (session reminders).
    """
    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notifications_student_id_read", "student_id", "read"),
        Index("ix_notifications_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    notification_type: Mapped[NotificationType] = mapped_column(
        Enum(NotificationType, name="notification_type"), nullable=False, default=NotificationType.general
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self) -> str:
        return f"<Notification type={self.notification_type.value!r} read={self.read}>"
