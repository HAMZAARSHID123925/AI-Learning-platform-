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
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.module2_content.models import Course, CourseStatus
from app.modules.module4_experience.models import Enrollment
from app.modules.module4_experience.services.dashboard_service import invalidate_dashboard_cache
from app.shared.exceptions import BusinessRuleError, ResourceNotFoundError
from app.shared.logging_config import get_logger

logger = get_logger(__name__)


async def enroll_student(
    db: AsyncSession,
    student_id: uuid.UUID,
    course_id: uuid.UUID,
) -> Enrollment:
    """
    Enrolls a student in a course.
    Idempotent: if already enrolled, returns the existing enrollment.
    """
    # 1. Verify course exists
    course = await db.get(Course, course_id)
    if not course:
        raise ResourceNotFoundError("Course", course_id)
    if course.status != CourseStatus.published:
        raise BusinessRuleError("Cannot enroll in an unpublished course.")

    # 2. Check existing enrollment
    query = select(Enrollment).where(
        Enrollment.student_id == student_id,
        Enrollment.course_id == course_id,
    ).options(selectinload(Enrollment.course))
    result = await db.execute(query)
    existing = result.scalar_one_or_none()

    if existing:
        logger.info("student_already_enrolled", student_id=str(student_id), course_id=str(course_id))
        from app.shared.exceptions import DuplicateResourceError
        raise DuplicateResourceError("Enrollment", "student_id and course_id")

    # 3. Create new enrollment
    enrollment = Enrollment(
        student_id=student_id,
        course_id=course_id,
        status="active",
    )
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)

    # Attach course for response
    enrollment.course = course

    # 4. Invalidate student dashboard cache
    await invalidate_dashboard_cache(student_id)
    logger.info("student_enrolled_successfully", student_id=str(student_id), course_id=str(course_id))

    return enrollment


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
