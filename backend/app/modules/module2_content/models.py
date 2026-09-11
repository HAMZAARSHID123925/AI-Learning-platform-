"""
ELARION AI Learning Platform — Backend
Module: app/modules/module2_content/models.py

Purpose:
    SQLAlchemy ORM models for Module 2 — Course & Content Management.
    Includes: Course, CourseModule, Lesson, LessonSkill,
              ContentAsset, EmbeddingOutbox, ContentEmbedding.

Key Design Decisions:
    1. Slug uniqueness: Courses and Lessons have URL-safe slug fields.
       Slugs are stable identifiers. If a title changes, the slug doesn't.
    2. Publish state machine: draft → published is one-way per version.
       Re-publishing a lesson increments content_version.
    3. EmbeddingOutbox: Written in the SAME transaction as lesson.publish.
       This guarantees the embedding worker never misses a published lesson.
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
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# =============================================================================
# Enums
# =============================================================================

class CourseStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class LessonStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class AssetType(str, enum.Enum):
    pdf = "pdf"
    video = "video"
    image = "image"
    audio = "audio"


class OutboxStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


# =============================================================================
# Models
# =============================================================================

class Course(Base):
    """
    Top-level learning entity.
    A Course has multiple Modules; each Module has multiple Lessons.
    Owned by an Instructor.
    """
    __tablename__ = "courses"
    __table_args__ = (
        UniqueConstraint("slug", name="uq_courses_slug"),
        Index("ix_courses_instructor_id", "instructor_id"),
        Index("ix_courses_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    instructor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[CourseStatus] = mapped_column(
        Enum(CourseStatus, name="course_status"), nullable=False, default=CourseStatus.draft
    )
    thumbnail_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    modules: Mapped[list[CourseModule]] = relationship(
        "CourseModule", back_populates="course", cascade="all, delete-orphan",
        order_by="CourseModule.sequence_order"
    )

    def __repr__(self) -> str:
        return f"<Course slug={self.slug!r} status={self.status.value!r}>"


class CourseModule(Base):
    """
    A section within a Course. Ordered by sequence_order.
    e.g., "Week 1: Introduction", "Week 2: Core Concepts"
    """
    __tablename__ = "course_modules"
    __table_args__ = (
        Index("ix_course_modules_course_id", "course_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sequence_order: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    course: Mapped[Course] = relationship("Course", back_populates="modules")
    lessons: Mapped[list[Lesson]] = relationship(
        "Lesson", back_populates="module", cascade="all, delete-orphan",
        order_by="Lesson.sequence_order"
    )

    def __repr__(self) -> str:
        return f"<CourseModule title={self.title!r} seq={self.sequence_order}>"


class Lesson(Base):
    """
    A single learning unit within a CourseModule.

    content_version: Incremented on each publish. The embedding worker uses this
    to detect re-published content and re-embed the lesson body.
    """
    __tablename__ = "lessons"
    __table_args__ = (
        UniqueConstraint("slug", name="uq_lessons_slug"),
        Index("ix_lessons_module_id", "module_id"),
        Index("ix_lessons_status", "status"),
        Index("ix_lessons_sequence", "module_id", "sequence_order"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    module_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("course_modules.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(500), nullable=False)
    body_markdown: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[LessonStatus] = mapped_column(
        Enum(LessonStatus, name="lesson_status"), nullable=False, default=LessonStatus.draft
    )
    sequence_order: Mapped[int] = mapped_column(Integer, nullable=False)
    content_version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    module: Mapped[CourseModule] = relationship("CourseModule", back_populates="lessons")
    lesson_skills: Mapped[list[LessonSkill]] = relationship(
        "LessonSkill", back_populates="lesson", cascade="all, delete-orphan"
    )
    assets: Mapped[list[ContentAsset]] = relationship(
        "ContentAsset", back_populates="lesson", cascade="all, delete-orphan"
    )
    outbox_entries: Mapped[list[EmbeddingOutbox]] = relationship(
        "EmbeddingOutbox", back_populates="lesson"
    )

    def __repr__(self) -> str:
        return f"<Lesson slug={self.slug!r} v={self.content_version} status={self.status.value!r}>"


class LessonSkill(Base):
    """
    Many-to-many: Lesson ↔ SkillTaxonomy.
    Tagging lessons with skills enables:
    - Module 5: generating questions per skill
    - Module 6: linking weakness flags to remediation lessons
    """
    __tablename__ = "lesson_skills"

    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), primary_key=True
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skill_taxonomy.id", ondelete="CASCADE"), primary_key=True
    )

    lesson: Mapped[Lesson] = relationship("Lesson", back_populates="lesson_skills")


class ContentAsset(Base):
    """
    An uploaded file (PDF, video, image) attached to a lesson.
    storage_key: The S3/MinIO object key (used to generate presigned URLs).
    """
    __tablename__ = "content_assets"
    __table_args__ = (
        Index("ix_content_assets_lesson_id", "lesson_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False
    )
    asset_type: Mapped[AssetType] = mapped_column(
        Enum(AssetType, name="asset_type"), nullable=False
    )
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    storage_key: Mapped[str] = mapped_column(Text, nullable=False)
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    lesson: Mapped[Lesson] = relationship("Lesson", back_populates="assets")

    def __repr__(self) -> str:
        return f"<ContentAsset type={self.asset_type.value!r} file={self.original_filename!r}>"


class EmbeddingOutbox(Base):
    """
    Transactional outbox for the embedding pipeline.

    WHY the Outbox Pattern?
        Problem: When a lesson is published, we need to:
        1. Update lesson.status = 'published' in DB
        2. Notify the embedding worker to vectorize the content

        Naive approach: Do DB write, then publish to Redis stream.
        Problem: What if the app crashes BETWEEN step 1 and step 2?
        The DB is updated but the worker never runs. Content is NEVER embedded.

        Outbox solution:
        - Write both the lesson update AND the outbox row in ONE TRANSACTION.
        - Either BOTH succeed or BOTH fail. Atomicity guaranteed.
        - The embedding worker polls the outbox table instead of Redis.
        - Worker marks outbox row as 'completed' after successful embedding.
        - If worker crashes, it picks up 'pending' rows on restart.
        This pattern is used at Uber, Netflix, and all major CQRS systems.
    """
    __tablename__ = "embedding_outbox"
    __table_args__ = (
        Index("ix_embedding_outbox_status", "status"),
        Index("ix_embedding_outbox_lesson_version", "lesson_id", "lesson_version"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False
    )
    lesson_version: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[OutboxStatus] = mapped_column(
        Enum(OutboxStatus, name="outbox_status"), nullable=False, default=OutboxStatus.pending
    )
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    lesson: Mapped[Lesson] = relationship("Lesson", back_populates="outbox_entries")

    def __repr__(self) -> str:
        return f"<EmbeddingOutbox lesson={self.lesson_id} v={self.lesson_version} status={self.status.value!r}>"


class ContentEmbedding(Base):
    """
    Vector embedding for a text chunk extracted from lesson content.

    chunk_index: Order of this chunk within the lesson (for context retrieval).
    embedding: pgvector VECTOR(384) — BAAI/bge-small-en-v1.5 in dev,
               VECTOR(1536) when switching to OpenAI in production.

    WHY chunk-based embeddings?
        A full lesson may be 5000 words. Embedding the entire text as one vector
        loses granularity. Semantic search over 500-word chunks is more precise.
        The RAG (Retrieval-Augmented Generation) pipeline in M3 retrieves the most
        relevant chunks, not entire lessons.
    """
    __tablename__ = "content_embeddings"
    __table_args__ = (
        UniqueConstraint("lesson_id", "lesson_version", "chunk_index",
                         name="uq_content_embeddings_lesson_chunk"),
        Index("ix_content_embeddings_lesson_id", "lesson_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False
    )
    lesson_version: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    # embedding column is added by migration 007 using pgvector type
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self) -> str:
        return f"<ContentEmbedding lesson={self.lesson_id} chunk={self.chunk_index}>"
