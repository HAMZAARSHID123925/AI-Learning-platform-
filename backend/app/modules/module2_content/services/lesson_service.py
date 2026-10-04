"""
ELARION AI Learning Platform — Backend
Module: app/modules/module2_content/services/lesson_service.py

Purpose:
    Business logic for Lesson CRUD and the publish state machine.

Critical: The Outbox Pattern
    When a lesson is published, we write an EmbeddingOutbox row in the
    SAME database transaction as the lesson status update.
    This ensures atomicity: either both succeed or both fail.
    The embedding worker reads pending outbox rows and processes them.
"""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.module2_content.models import (
    CourseModule,
    EmbeddingOutbox,
    Lesson,
    LessonSkill,
    LessonStatus,
    OutboxStatus,
)
from app.modules.module2_content.services.course_service import get_module
from app.shared.exceptions import (
    InvalidStateTransitionError,
    PermissionDeniedError,
    ResourceNotFoundError,
    ValidationError,
)
from app.shared.logging_config import get_logger

logger = get_logger(__name__)


def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return re.sub(r"^-+|-+$", "", text)


async def _ensure_lesson_slug_unique(db: AsyncSession, slug: str, exclude_id: uuid.UUID | None = None) -> str:
    base_slug = slug
    counter = 2
    while True:
        query = select(Lesson).where(Lesson.slug == slug)
        if exclude_id:
            query = query.where(Lesson.id != exclude_id)
        existing = await db.execute(query)
        if not existing.scalar_one_or_none():
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


async def create_lesson(
    db: AsyncSession,
    module_id: uuid.UUID,
    actor_id: uuid.UUID,
    is_admin: bool,
    title: str,
    slug: str | None,
    body_markdown: str | None,
    sequence_order: int,
    estimated_minutes: int | None,
    skill_ids: list[uuid.UUID],
) -> Lesson:
    """Create a lesson within a module. Instructor must own the parent course."""
    module = await get_module(db, module_id)

    # Verify instructor ownership
    from app.modules.module2_content.models import Course
    from sqlalchemy import select as sa_select
    course_result = await db.execute(
        sa_select(Course).where(Course.id == module.course_id)
    )
    course = course_result.scalar_one()
    if not is_admin and course.instructor_id != actor_id:
        raise PermissionDeniedError()

    auto_slug = slug or _slugify(title)
    final_slug = await _ensure_lesson_slug_unique(db, auto_slug)

    lesson = Lesson(
        module_id=module_id,
        title=title,
        slug=final_slug,
        body_markdown=body_markdown,
        sequence_order=sequence_order,
        estimated_minutes=estimated_minutes,
        status=LessonStatus.draft,
        content_version=1,
    )
    db.add(lesson)
    await db.flush()

    # Attach skill tags
    for skill_id in skill_ids:
        db.add(LessonSkill(lesson_id=lesson.id, skill_id=skill_id))

    logger.info("lesson_created", lesson_id=str(lesson.id), module_id=str(module_id))
    return lesson


async def get_lesson(db: AsyncSession, lesson_id: uuid.UUID) -> Lesson:
    """Fetch a lesson by ID with skill associations loaded."""
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Lesson)
        .where(Lesson.id == lesson_id)
        .options(selectinload(Lesson.lesson_skills), selectinload(Lesson.assets))
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise ResourceNotFoundError("Lesson", str(lesson_id))
    return lesson


async def update_lesson(
    db: AsyncSession,
    lesson_id: uuid.UUID,
    actor_id: uuid.UUID,
    is_admin: bool,
    title: str | None = None,
    body_markdown: str | None = None,
    sequence_order: int | None = None,
    estimated_minutes: int | None = None,
    skill_ids: list[uuid.UUID] | None = None,
    video_url: str | None = None,
    thumbnail_url: str | None = None,
    video_object_key: str | None = None,
    thumbnail_object_key: str | None = None,
) -> Lesson:
    """Update lesson fields and optionally replace skill tags."""
    lesson = await get_lesson(db, lesson_id)

    # Ownership check via module → course
    await _verify_lesson_ownership(db, lesson, actor_id, is_admin)

    if title is not None:
        lesson.title = title
    if body_markdown is not None:
        lesson.body_markdown = body_markdown
    if sequence_order is not None:
        lesson.sequence_order = sequence_order
    if estimated_minutes is not None:
        lesson.estimated_minutes = estimated_minutes
    if video_url is not None:
        lesson.video_url = video_url
    if thumbnail_url is not None:
        lesson.thumbnail_url = thumbnail_url
    if video_object_key is not None:
        lesson.video_object_key = video_object_key
    if thumbnail_object_key is not None:
        lesson.thumbnail_object_key = thumbnail_object_key

    if skill_ids is not None:
        # Replace all skill tags
        existing = await db.execute(
            select(LessonSkill).where(LessonSkill.lesson_id == lesson_id)
        )
        for ls in existing.scalars().all():
            await db.delete(ls)
        for skill_id in skill_ids:
            db.add(LessonSkill(lesson_id=lesson.id, skill_id=skill_id))

    return lesson


async def publish_lesson(
    db: AsyncSession,
    lesson_id: uuid.UUID,
    actor_id: uuid.UUID,
    is_admin: bool,
) -> Lesson:
    """
    Publish a lesson.

    CRITICAL: This function writes the EmbeddingOutbox row in the SAME
    database transaction as the lesson status change.

    This is the Outbox Pattern:
    - If the DB transaction commits → both the lesson AND the outbox row are saved.
    - If it rolls back → neither is saved.
    - The embedding worker polls embedding_outbox for pending rows.
    - No event can be lost, even if Redis is down at publish time.

    On re-publish: content_version is incremented. Old embeddings for this lesson
    version become stale; the worker re-embeds with the new version number.
    """
    lesson = await get_lesson(db, lesson_id)
    await _verify_lesson_ownership(db, lesson, actor_id, is_admin)

    if lesson.status == LessonStatus.archived:
        raise InvalidStateTransitionError("Lesson", "archived", "published")

    # Publish rules enforcement
    if not lesson.title:
        raise ValidationError("Lesson must have a title to be published")
    if not lesson.body_markdown:
        raise ValidationError("Lesson must have body_markdown to be published")
    if not lesson.video_url:
        raise ValidationError("Lesson must have a confirmed video_url to be published")

    is_republish = lesson.status == LessonStatus.published
    if is_republish:
        lesson.content_version += 1

    lesson.status = LessonStatus.published
    lesson.published_at = datetime.now(timezone.utc)

    # Write outbox entry IN THE SAME TRANSACTION (this is the key invariant)
    outbox_entry = EmbeddingOutbox(
        lesson_id=lesson.id,
        lesson_version=lesson.content_version,
        status=OutboxStatus.pending,
        attempts=0,
    )
    db.add(outbox_entry)

    action = "lesson_republished" if is_republish else "lesson_published"
    logger.info(action, lesson_id=str(lesson_id), version=lesson.content_version)
    return lesson


async def _verify_lesson_ownership(
    db: AsyncSession,
    lesson: Lesson,
    actor_id: uuid.UUID,
    is_admin: bool,
) -> None:
    """Verify the actor is allowed to modify this lesson."""
    if is_admin:
        return
    from app.modules.module2_content.models import Course
    result = await db.execute(
        select(Course)
        .join(CourseModule, Course.id == CourseModule.course_id)
        .where(CourseModule.id == lesson.module_id)
    )
    course = result.scalar_one_or_none()
    if course is None or course.instructor_id != actor_id:
        raise PermissionDeniedError()
