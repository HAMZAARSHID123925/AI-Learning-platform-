"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/models.py

Purpose: Module 6 — Adaptive Learning Engine (Phase 3)
Status:  STUB — Full models defined for schema migrations.
         Services/workers implemented in Phase 3.
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, DateTime, Enum, ForeignKey, Index, Integer,
    Numeric, String, Text, UniqueConstraint, text
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from app.database import Base


class WeaknessStatus(str, enum.Enum):
    active = "active"
    resolved = "resolved"


class PlanStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    escalated = "escalated"


class PlanItemStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    skipped = "skipped"


class VideoJobStatus(str, enum.Enum):
    queued = "queued"
    planning = "planning"
    scripting = "scripting"
    storyboard_ready = "storyboard_ready"
    assets_preparing = "assets_preparing"
    audio_generating = "audio_generating"
    audio_ready = "audio_ready"
    rendering = "rendering"
    uploading = "uploading"
    ready = "ready"
    failed = "failed"


class WeaknessFlag(Base):
    """
    Flags a skill as weak for a student when score < 0.60 (WEAKNESS_THRESHOLD).

    UNIQUE constraint on (student_id, skill_id) for ACTIVE flags:
        Only one active weakness per skill per student.
        When resolved, status changes to 'resolved' (not deleted).
        Historical record is preserved.
    """
    __tablename__ = "weakness_flags"
    __table_args__ = (
        UniqueConstraint("student_id", "skill_id", name="uq_active_weakness_per_student_skill"),
        Index("ix_weakness_flags_student_id", "student_id"),
        Index("ix_weakness_flags_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skill_taxonomy.id", ondelete="RESTRICT"), nullable=False
    )
    submission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("submissions.id", ondelete="RESTRICT"), nullable=False
    )
    score_at_flag: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    threshold: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False, default=0.60)
    status: Mapped[WeaknessStatus] = mapped_column(
        Enum(WeaknessStatus, name="weakness_status"), nullable=False, default=WeaknessStatus.active
    )
    resolution_submission_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("submissions.id", ondelete="SET NULL"), nullable=True
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    remediation_plans: Mapped[list[RemediationPlan]] = relationship(
        "RemediationPlan", back_populates="weakness_flag"
    )


class RemediationPlan(Base):
    """
    Ordered list of remediation lessons for a specific weakness flag.
    Created by the Module 6 adaptive consumer when a weakness is detected.

    retest_attempt_count:
        Tracks how many focused retests the student has attempted.
        When it reaches MAX_RETEST_ATTEMPTS (3), instructor_escalated=True.
    """
    __tablename__ = "remediation_plans"
    __table_args__ = (
        Index("ix_remediation_plans_student_id", "student_id"),
        Index("ix_remediation_plans_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    weakness_flag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("weakness_flags.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[PlanStatus] = mapped_column(
        Enum(PlanStatus, name="plan_status"), nullable=False, default=PlanStatus.active
    )
    # AI-generated written remedial course (structured Markdown document, NOT video)
    remedial_course_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    remedial_course_markdown: Mapped[str | None] = mapped_column(Text, nullable=True)
    study_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    study_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    retest_attempt_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    instructor_escalated: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    weakness_flag: Mapped[WeaknessFlag] = relationship("WeaknessFlag", back_populates="remediation_plans")
    items: Mapped[list[RemediationPlanItem]] = relationship(
        "RemediationPlanItem", back_populates="plan", cascade="all, delete-orphan",
        order_by="RemediationPlanItem.sequence_order"
    )


class RemediationPlanItem(Base):
    """A single lesson within a RemediationPlan, ordered by sequence."""
    __tablename__ = "remediation_plan_items"
    __table_args__ = (
        Index("ix_remediation_plan_items_plan_id", "plan_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("remediation_plans.id", ondelete="CASCADE"), nullable=False
    )
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False
    )
    sequence_order: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[PlanItemStatus] = mapped_column(
        Enum(PlanItemStatus, name="plan_item_status"), nullable=False, default=PlanItemStatus.pending
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    plan: Mapped[RemediationPlan] = relationship("RemediationPlan", back_populates="items")


class VideoGenerationJob(Base):
    """
    Represents the lifecycle of ONE personalized remedial video generation request.
    Created when an active WeaknessFlag triggers adaptive remediation.
    """
    __tablename__ = "video_generation_jobs"
    __table_args__ = (
        Index("ix_video_generation_jobs_student_id", "student_id"),
        Index("ix_video_generation_jobs_status", "status"),
        Index("ix_video_generation_jobs_weakness_flag_id", "weakness_flag_id"),
        Index(
            "uq_active_video_job_per_weakness",
            "weakness_flag_id",
            unique=True,
            postgresql_where=text("status IN ('queued', 'planning', 'scripting', 'audio_generating', 'assets_preparing', 'rendering', 'uploading')")
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    submission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False
    )
    weakness_flag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("weakness_flags.id", ondelete="CASCADE"), nullable=False
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skill_taxonomy.id", ondelete="RESTRICT"), nullable=False
    )
    remediation_plan_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("remediation_plans.id", ondelete="SET NULL"), nullable=True
    )

    status: Mapped[VideoJobStatus] = mapped_column(
        Enum(VideoJobStatus, name="video_job_status"), nullable=False, default=VideoJobStatus.queued
    )

    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    target_duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # JSONB for structured metadata
    script_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    scene_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    audio_manifest_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    asset_manifest_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    video_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    video_object_key: Mapped[str | None] = mapped_column(Text, nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    thumbnail_object_key: Mapped[str | None] = mapped_column(Text, nullable=True)

    error_code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    retry_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    @validates("status")
    def validate_status_transition(self, key, new_status):
        # Initial creation allows default (queued)
        if not getattr(self, "status", None) or self.status == new_status:
            return new_status
            
        old_status = self.status
        
        # Any state can go to failed
        if new_status == VideoJobStatus.failed:
            return new_status
            
        valid_transitions = {
            VideoJobStatus.queued: [VideoJobStatus.planning],
            VideoJobStatus.planning: [VideoJobStatus.scripting],
            VideoJobStatus.scripting: [VideoJobStatus.storyboard_ready],
            VideoJobStatus.storyboard_ready: [VideoJobStatus.assets_preparing],
            VideoJobStatus.assets_preparing: [VideoJobStatus.audio_generating],
            VideoJobStatus.audio_generating: [VideoJobStatus.audio_ready],
            VideoJobStatus.audio_ready: [VideoJobStatus.rendering],
            VideoJobStatus.rendering: [VideoJobStatus.uploading],
            VideoJobStatus.uploading: [VideoJobStatus.ready],
            VideoJobStatus.failed: [VideoJobStatus.queued], # Retry
            VideoJobStatus.ready: [] # Terminal
        }
        
        allowed_next_states = valid_transitions.get(old_status, [])
        if new_status not in allowed_next_states:
            raise ValueError(f"Invalid state transition from {old_status} to {new_status}")
            
        return new_status

    weakness_flag: Mapped[WeaknessFlag] = relationship("WeaknessFlag")
    remediation_plan: Mapped[RemediationPlan | None] = relationship("RemediationPlan")

