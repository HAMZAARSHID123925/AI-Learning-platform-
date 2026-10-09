"""
ELARION AI Learning Platform — Backend
Module: app/modules/module2_content/services/course_service.py

Purpose:
    Business logic for Course and CourseModule CRUD.
    Enforces: ownership, slug uniqueness, state machine for publish.
"""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select, literal, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.module2_content.models import Course, CourseModule, CourseStatus, Lesson
from app.shared.exceptions import (
    BusinessRuleError,
    DuplicateResourceError,
    InvalidStateTransitionError,
    PermissionDeniedError,
    ResourceNotFoundError,
)
from app.shared.logging_config import get_logger
from app.shared.pagination import PaginationParams

logger = get_logger(__name__)


def _slugify(text: str) -> str:
    """Convert a title to a URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text


async def _ensure_slug_unique(db: AsyncSession, slug: str, exclude_id: uuid.UUID | None = None) -> str:
    """Ensure slug uniqueness. If slug exists, append -2, -3, etc."""
    base_slug = slug
    counter = 2
    while True:
        query = select(Course).where(Course.slug == slug)
        if exclude_id:
            query = query.where(Course.id != exclude_id)
        existing = await db.execute(query)
        if not existing.scalar_one_or_none():
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


# =============================================================================
# Course CRUD
# =============================================================================

async def create_course(
    db: AsyncSession,
    instructor_id: uuid.UUID,
    title: str,
    description: str | None,
    slug: str | None,
    grade: int | None = None,
) -> Course:
    """Create a new course owned by the given instructor."""
    auto_slug = slug or _slugify(title)
    # Serialize allocation of the base slug through request commit.
    # Concurrent instructor/Admin creates must receive distinct suffixes.
    await db.execute(select(func.pg_advisory_xact_lock(func.hashtextextended("course-slug:" + auto_slug, 0))))
    final_slug = await _ensure_slug_unique(db, auto_slug)

    course = Course(
        instructor_id=instructor_id,
        title=title,
        description=description,
        slug=final_slug,
        status=CourseStatus.draft,
        grade=grade,
    )
    db.add(course)
    await db.flush()

    logger.info("course_created", course_id=str(course.id), slug=final_slug, instructor=str(instructor_id))
    return course


async def get_course(db: AsyncSession, course_id: uuid.UUID) -> Course:
    """Fetch a course by ID. Raises 404 if not found."""
    result = await db.execute(
        select(Course)
        .where(Course.id == course_id)
        .options(selectinload(Course.modules).selectinload(CourseModule.lessons).selectinload(Lesson.lesson_skills))
    )
    course = result.scalar_one_or_none()
    if not course:
        raise ResourceNotFoundError("Course", str(course_id))
    return course


async def get_course_detail(db: AsyncSession, course_id: uuid.UUID, *, include_bodies: bool = False) -> Course:
    """Read the syllabus in one bounded join, without asset or taxonomy graphs.

    CRUD keeps its original loader. Only the detail route uses this projection;
    student bodies and internal lesson object keys are not fetched.
    """
    from sqlalchemy.orm import joinedload, raiseload
    from app.modules.module2_content.models import LessonSkill
    columns = [Lesson.id, Lesson.module_id, Lesson.title, Lesson.slug, Lesson.status,
               Lesson.sequence_order, Lesson.content_version, Lesson.estimated_minutes,
               Lesson.video_url, Lesson.thumbnail_url, Lesson.duration_seconds,
               Lesson.published_at, Lesson.created_at, Lesson.updated_at]
    if include_bodies:
        columns.append(Lesson.body_markdown)
    syllabus = joinedload(Course.modules).joinedload(CourseModule.lessons)
    result = await db.execute(
        select(Course).where(Course.id == course_id).options(
            raiseload("*"),
            syllabus.load_only(*columns, raiseload=True),
            syllabus.joinedload(Lesson.lesson_skills).load_only(LessonSkill.lesson_id, LessonSkill.skill_id),
        )
    )
    course = result.unique().scalar_one_or_none()
    if course is None:
        raise ResourceNotFoundError("Course", str(course_id))
    return course


async def list_courses(
    db: AsyncSession,
    params: PaginationParams,
    instructor_id: uuid.UUID | None = None,
    status_filter: str | None = None,
    grade: int | None = None,
) -> tuple[list[Course], int]:
    """List courses with pagination. Instructors see only their own; Admins see all."""
    query = select(Course)
    count_query = select(func.count(Course.id))

    if instructor_id:
        query = query.where(Course.instructor_id == instructor_id)
        count_query = count_query.where(Course.instructor_id == instructor_id)
    if status_filter:
        query = query.where(Course.status == status_filter)
        count_query = count_query.where(Course.status == status_filter)
    if grade is not None:
        query = query.where(Course.grade == grade)
        count_query = count_query.where(Course.grade == grade)

    # Students only see published courses
    query = query.offset(params.offset).limit(params.limit).order_by(Course.created_at.desc())

    result = await db.execute(query)
    count = await db.execute(count_query)
    return result.scalars().all(), count.scalar_one()


async def update_course(
    db: AsyncSession,
    course_id: uuid.UUID,
    actor_id: uuid.UUID,
    is_admin: bool,
    title: str | None = None,
    description: str | None = None,
    grade: int | None = None,
    thumbnail_url: str | None = None,
    thumbnail_object_key: str | None = None,
) -> Course:
    """Update course fields. Only the owning instructor or Admin may update."""
    course = await get_course(db, course_id)

    if not is_admin and course.instructor_id != actor_id:
        raise PermissionDeniedError()

    if title is not None:
        course.title = title
    if description is not None:
        course.description = description
    if grade is not None:
        course.grade = grade
    if thumbnail_url is not None:
        course.thumbnail_url = thumbnail_url
    if thumbnail_object_key is not None:
        course.thumbnail_object_key = thumbnail_object_key

    return course


async def publish_course(
    db: AsyncSession,
    course_id: uuid.UUID,
    actor_id: uuid.UUID,
    is_admin: bool,
) -> Course:
    """
    Publish a course.
    Requires at least one published lesson in the course.
    """
    course = await get_course(db, course_id)

    if not is_admin and course.instructor_id != actor_id:
        raise PermissionDeniedError()

    if course.status == CourseStatus.published:
        raise InvalidStateTransitionError("Course", "published", "published")

    if course.status == CourseStatus.archived:
        raise InvalidStateTransitionError("Course", "archived", "published")

    # Must have at least one published lesson (unless admin override)
    if not is_admin:
        from app.modules.module2_content.models import Lesson, LessonStatus
        lesson_count = await db.execute(
            select(func.count(Lesson.id))
            .join(CourseModule, Lesson.module_id == CourseModule.id)
            .where(
                CourseModule.course_id == course_id,
                Lesson.status == LessonStatus.published,
            )
        )
        if lesson_count.scalar_one() == 0:
            raise BusinessRuleError("Cannot publish a course with no published lessons.")

    course.status = CourseStatus.published
    logger.info("course_published", course_id=str(course_id), instructor=str(actor_id))
    return course


async def delete_course(
    db: AsyncSession,
    course_id: uuid.UUID,
    actor_id: uuid.UUID,
    is_admin: bool,
) -> None:
    """Delete a course. Only Admin or owner instructor can delete."""
    course = await get_course(db, course_id)
    if not is_admin and course.instructor_id != actor_id:
        raise PermissionDeniedError()
    await db.delete(course)
    await db.flush()
    logger.info("course_deleted", course_id=str(course_id), actor=str(actor_id))


# =============================================================================
# CourseModule CRUD
# =============================================================================

async def create_module(
    db: AsyncSession,
    course_id: uuid.UUID,
    actor_id: uuid.UUID,
    is_admin: bool,
    title: str,
    description: str | None,
    sequence_order: int,
) -> CourseModule:
    """Create a module within a course. Instructor must own the course."""
    course = await get_course(db, course_id)

    if not is_admin and course.instructor_id != actor_id:
        raise PermissionDeniedError()

    module = CourseModule(
        course_id=course_id,
        title=title,
        description=description,
        sequence_order=sequence_order,
    )
    db.add(module)
    await db.flush()
    logger.info("module_created", module_id=str(module.id), course_id=str(course_id))
    return module


async def get_module(db: AsyncSession, module_id: uuid.UUID) -> CourseModule:
    """Fetch a CourseModule by ID."""
    result = await db.execute(
        select(CourseModule).where(CourseModule.id == module_id)
    )
    module = result.scalar_one_or_none()
    if not module:
        raise ResourceNotFoundError("CourseModule", str(module_id))
    return module


async def list_course_cards(
    db: AsyncSession, params: PaginationParams, *,
    instructor_id: uuid.UUID | None = None, status_filter: str | None = None,
    grade: int | None = None, student_id: uuid.UUID | None = None,
    staff_viewer_id: uuid.UUID | None = None, is_admin: bool = False,
) -> tuple[list[dict], int]:
    """Three bounded SELECTs; no ORM entities or relationship graph loading.

    Ordered lesson references are necessary for card segments and transient
    frontend progress. No lesson content, skills, assets or module bodies leave
    this path. Completion joins are scoped to the authenticated viewer.
    """
    from app.modules.module2_content.models import LessonStatus
    from app.modules.module4_experience.models import StudentProgress

    filters = []
    if instructor_id is not None:
        filters.append(Course.instructor_id == instructor_id)
    if status_filter is not None:
        filters.append(Course.status == status_filter)
    if grade is not None:
        filters.append(Course.grade == grade)
    total = (await db.execute(select(func.count(Course.id)).where(*filters))).scalar_one()
    rows = (await db.execute(
        select(Course.id, Course.slug, Course.title, Course.description, Course.grade,
               Course.thumbnail_url, Course.thumbnail_object_key)
        .where(*filters).order_by(Course.created_at.desc(), Course.id)
        .offset(params.offset).limit(params.limit)
    )).mappings().all()
    cards = [dict(row, lessons=[]) for row in rows]
    if not cards:
        return cards, total

    by_id = {card['id']: card for card in cards}
    completed = func.coalesce(StudentProgress.completed, False) if student_id else literal(False)
    query = (select(CourseModule.course_id, Lesson.id, Lesson.estimated_minutes, completed.label('completed'))
             .select_from(CourseModule).join(Lesson, Lesson.module_id == CourseModule.id)
             .where(CourseModule.course_id.in_(by_id)))
    if student_id:
        query = query.outerjoin(StudentProgress,
            (StudentProgress.lesson_id == Lesson.id) & (StudentProgress.student_id == student_id))
    if not is_admin:
        if staff_viewer_id:
            query = query.join(Course, Course.id == CourseModule.course_id).where(
                or_(Lesson.status == LessonStatus.published, Course.instructor_id == staff_viewer_id))
        else:
            query = query.where(Lesson.status == LessonStatus.published)
    query = query.order_by(CourseModule.sequence_order, CourseModule.id, Lesson.sequence_order, Lesson.id)
    for row in (await db.execute(query)).mappings():
        by_id[row['course_id']]['lessons'].append({
            'id': row['id'], 'minutes': row['estimated_minutes'] or 5, 'completed': bool(row['completed'])})
    return cards, total
