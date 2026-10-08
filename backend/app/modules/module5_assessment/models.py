"""
ELARION AI Learning Platform — Backend
Module: app/modules/module5_assessment/models.py

Purpose: Module 5 — AI Assessment Generation & Grading (Phase 2)
Status:  STUB — Full models defined for schema migrations.
         Services/router implemented in Phase 2.
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, DateTime, Enum, ForeignKey, Index, Integer,
    Numeric, String, Text, UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.modules.shared_models.skill_taxonomy import SkillTaxonomy


class QuestionType(str, enum.Enum):
    mcq = "mcq"
    short_answer = "short_answer"


class GraderType(str, enum.Enum):
    deterministic = "deterministic"
    llm = "llm"


class SubmissionStatus(str, enum.Enum):
    pending = "pending"
    grading = "grading"
    graded = "graded"
    error = "error"


class Test(Base):
    """AI-generated test associated with a lesson."""
    __tablename__ = "tests"
    __table_args__ = (
        Index("ix_tests_lesson_id", "lesson_id"),
        Index("ix_tests_course_id", "course_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=True
    )
    course_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=True
    )
    lesson_version: Mapped[int | None] = mapped_column(Integer, nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    is_focused_retest: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    questions: Mapped[list[Question]] = relationship("Question", back_populates="test", cascade="all, delete-orphan")
    submissions: Mapped[list[Submission]] = relationship("Submission", back_populates="test")


class Question(Base):
    """A single question within a Test."""
    __tablename__ = "questions"
    __table_args__ = (
        Index("ix_questions_test_id", "test_id"),
        Index("ix_questions_skill_id", "skill_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tests.id", ondelete="CASCADE"), nullable=False
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skill_taxonomy.id", ondelete="RESTRICT"), nullable=False
    )
    question_type: Mapped[QuestionType] = mapped_column(
        Enum(QuestionType, name="question_type"), nullable=False
    )
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[dict | None] = mapped_column(JSONB, nullable=True)   # For MCQ: [{id, text, is_correct}]
    rubric: Mapped[str | None] = mapped_column(Text, nullable=True)      # For short answer
    max_score: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False, default=1.0)
    source_chunk_ids: Mapped[list | None] = mapped_column(JSONB, nullable=True)

    test: Mapped[Test] = relationship("Test", back_populates="questions")


class Submission(Base):
    """A student's test submission."""
    __tablename__ = "submissions"
    __table_args__ = (
        UniqueConstraint("test_id", "student_id", "attempt_number", name="uq_submission_attempt"),
        Index("ix_submissions_student_id", "student_id"),
        Index("ix_submissions_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tests.id", ondelete="RESTRICT"), nullable=False
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[SubmissionStatus] = mapped_column(
        Enum(SubmissionStatus, name="submission_status"), nullable=False, default=SubmissionStatus.pending
    )
    answers: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # {question_id: answer_text}
    overall_score: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    graded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    test: Mapped[Test] = relationship("Test", back_populates="submissions")
    skill_scores: Mapped[list[SkillScore]] = relationship("SkillScore", back_populates="submission", cascade="all, delete-orphan")


class SkillScore(Base):
    """Per-skill score from a graded submission. Used by Module 6 for weakness detection."""
    __tablename__ = "skill_scores"
    __table_args__ = (
        UniqueConstraint("submission_id", "skill_id", name="uq_skill_score"),
        Index("ix_skill_scores_student_skill", "submission_id", "skill_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skill_taxonomy.id", ondelete="RESTRICT"), nullable=False
    )
    score: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    max_score: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False, default=1.0)
    grader_type: Mapped[GraderType] = mapped_column(
        Enum(GraderType, name="grader_type"), nullable=False
    )
    llm_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)

    submission: Mapped[Submission] = relationship("Submission", back_populates="skill_scores")
    skill: Mapped["SkillTaxonomy"] = relationship("SkillTaxonomy")


class TestGradedOutbox(Base):
    """A grade and its adaptive event are committed atomically."""
    __tablename__ = 'test_graded_outbox'
    __table_args__ = (Index('ix_test_graded_outbox_pending', 'published_at'),)
    submission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),ForeignKey('submissions.id',ondelete='CASCADE'),primary_key=True)
    payload: Mapped[dict] = mapped_column(JSONB,nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True),default=lambda:datetime.now(timezone.utc),nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True),nullable=True)
