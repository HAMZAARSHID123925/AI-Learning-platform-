"""
ELARION AI Learning Platform — Backend
Module: app/modules/module4_experience/services/enrollment_service.py

Purpose:
    Service managing student course enrollments.
    Persists enrollments to PostgreSQL, invalidates Redis dashboard cache,
    and returns enrolled courses with title/slug.
"""

from __future__ import annotations

import uuid
from sqlalchemy import and_, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.module2_content.models import Course, CourseStatus
from app.modules.module4_experience.models import Enrollment
from app.modules.module4_experience.schemas import EnrollmentResponse
from app.modules.module4_experience.services.dashboard_service import invalidate_dashboard_cache
from app.shared.exceptions import BusinessRuleError, ResourceNotFoundError
from app.shared.logging_config import get_logger

logger = get_logger(__name__)


_ENROLLMENT_COLUMNS = (
    Enrollment.id, Enrollment.student_id, Enrollment.course_id,
    Enrollment.status, Enrollment.enrolled_at,
)


def _enrollment_response(row, course) -> EnrollmentResponse:
    if row["status"] != "active":
        # The old recovery path only accepted active enrollments. Do not
        # reactivate an inactive row or let it become a successful media gate.
        raise BusinessRuleError("Enrollment is not active.")
    return EnrollmentResponse(
        **{column.key: row[column.key] for column in _ENROLLMENT_COLUMNS},
        course_title=course["course_title"], course_slug=course["course_slug"],
    )


async def enroll_student(
    db: AsyncSession,
    student_id: uuid.UUID,
    course_id: uuid.UUID,
) -> EnrollmentResponse:
    """Ensure enrollment, returning the same active row on repeat requests.

    Check current course visibility even on repeats. Column reads avoid the
    User/Course relationship graphs. Only the student/course unique conflict
    is ignored; foreign-key and unrelated integrity errors still propagate.
    """
    course = (await db.execute(
        select(Course.id.label("_course_id"), Course.status.label("_course_status"),
               Course.title.label("course_title"), Course.slug.label("course_slug"),
               *_ENROLLMENT_COLUMNS)
        .select_from(Course).outerjoin(Enrollment, and_(
            Enrollment.course_id == Course.id, Enrollment.student_id == student_id,
        )).where(Course.id == course_id)
    )).mappings().one_or_none()
    if course is None:
        raise ResourceNotFoundError("Course", course_id)
    if course["_course_status"] != CourseStatus.published:
        raise BusinessRuleError("Cannot enroll in an unpublished course.")
    if course["id"] is not None:
        return _enrollment_response(course, course)

    created = (await db.execute(
        insert(Enrollment).values(student_id=student_id, course_id=course_id, status="active")
        .on_conflict_do_nothing(index_elements=[Enrollment.student_id, Enrollment.course_id])
        .returning(*_ENROLLMENT_COLUMNS)
    )).mappings().one_or_none()
    if created is None:
        # A concurrent request won. PostgreSQL's unique check waits for its
        # transaction; this new SELECT sees the committed winner, without an
        # UPDATE that could touch timestamps, progress or audit state.
        existing = (await db.execute(
            select(*_ENROLLMENT_COLUMNS).where(
                Enrollment.student_id == student_id, Enrollment.course_id == course_id,
            )
        )).mappings().one_or_none()
        if existing is None:
            raise BusinessRuleError("Enrollment changed concurrently. Please retry.")
        return _enrollment_response(existing, course)

    response = _enrollment_response(created, course)
    await db.commit()
    await invalidate_dashboard_cache(student_id)
    return response


async def get_student_enrollments(
    db: AsyncSession,
    student_id: uuid.UUID,
) -> list[Enrollment]:
    """Returns all active enrollments for a student."""
    query = (
        select(Enrollment)
        .where(Enrollment.student_id == student_id, Enrollment.status == "active")
        .options(selectinload(Enrollment.course))
        .order_by(Enrollment.enrolled_at.desc())
    )
    result = await db.execute(query)
    return list(result.scalars().all())


async def unenroll_student(
    db: AsyncSession,
    student_id: uuid.UUID,
    course_id: uuid.UUID,
) -> None:
    """Un-enrolls / drops a student from a course."""
    query = select(Enrollment).where(
        Enrollment.student_id == student_id,
        Enrollment.course_id == course_id,
    )
    result = await db.execute(query)
    enrollment = result.scalar_one_or_none()
    if enrollment:
        await db.delete(enrollment)
        await db.commit()
        await invalidate_dashboard_cache(student_id)
        logger.info("student_unenrolled", student_id=str(student_id), course_id=str(course_id))
