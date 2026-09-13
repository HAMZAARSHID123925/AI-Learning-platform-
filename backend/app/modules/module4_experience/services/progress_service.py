"""
ELARION AI Learning Platform — Backend
Module: app/modules/module4_experience/services/progress_service.py

Purpose:
    Student progress tracking and content gating (lesson access control).
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.module4_experience.models import LearningPathState, PathState, StudentProgress
from app.shared.exceptions import LessonLockedError, ResourceNotFoundError
from app.shared.logging_config import get_logger

logger = get_logger(__name__)


async def check_lesson_access(
    db: AsyncSession,
    lesson_id: uuid.UUID,
    user,
) -> None:
    """
    FastAPI dependency / service function: check if a student can access a lesson.

    Instructors and Admins always bypass (they can preview locked content).
    Students are blocked if the lesson is locked in LearningPathState.

    A missing row in LearningPathState = unlocked (default state).
    Rows only exist when state is non-default.

    Raises: LessonLockedError (403) if lesson is locked.
    """
    # Instructors and Admins bypass gating (spec §Module4)
    if user.has_role("Instructor") or user.has_role("Admin"):
        return

    result = await db.execute(
        select(LearningPathState).where(
            LearningPathState.student_id == user.id,
            LearningPathState.lesson_id == lesson_id,
        )
    )
    state = result.scalar_one_or_none()

    if state and state.state == PathState.locked:
        raise LessonLockedError(reason=state.locked_reason or "")


async def mark_lesson_complete(
    db: AsyncSession,
    student_id: uuid.UUID,
    lesson_id: uuid.UUID,
    time_spent_seconds: int | None = None,
) -> StudentProgress:
    """
    Mark a lesson as completed for a student.

    Uses INSERT ... ON CONFLICT DO UPDATE (UPSERT):
        If no record exists → insert (first completion)
        If record exists → update completed=True, completed_at=now

    WHY UPSERT?
        Avoids race conditions if two requests arrive simultaneously.
        The UNIQUE constraint on (student_id, lesson_id) ensures only one row.

    Also updates LearningPathState to 'mastered' if it was 'in_progress'.
    """
    now = datetime.now(timezone.utc)

    # Upsert progress record
    stmt = insert(StudentProgress).values(
        student_id=student_id,
        lesson_id=lesson_id,
        completed=True,
        completed_at=now,
        time_spent_seconds=time_spent_seconds,
        created_at=now,
        updated_at=now,
    ).on_conflict_do_update(
        index_elements=["student_id", "lesson_id"],
        set_={
            "completed": True,
            "completed_at": now,
            "updated_at": now,
            **({"time_spent_seconds": time_spent_seconds} if time_spent_seconds else {}),
        }
    ).returning(StudentProgress)

    result = await db.execute(stmt)
    progress = result.scalar_one()

    # Update LearningPathState: in_progress → mastered (if not locked)
    lps_result = await db.execute(
        select(LearningPathState).where(
            LearningPathState.student_id == student_id,
            LearningPathState.lesson_id == lesson_id,
        )
    )
    lps = lps_result.scalar_one_or_none()

    if lps:
        if lps.state == PathState.in_progress:
            lps.state = PathState.mastered
            lps.updated_at = now
    else:
        # Create mastered state row (first completion with no prior state)
        db.add(LearningPathState(
            student_id=student_id,
            lesson_id=lesson_id,
            state=PathState.mastered,
        ))

    await db.commit()
    logger.info("lesson_completed", student_id=str(student_id), lesson_id=str(lesson_id))

    # Invalidate cached student dashboard
    from app.modules.module4_experience.services.dashboard_service import invalidate_dashboard_cache
    await invalidate_dashboard_cache(student_id)

    return progress


async def get_course_progress(
    db: AsyncSession,
    student_id: uuid.UUID,
    course_id: uuid.UUID,
) -> dict:
    """
    Calculate course completion percentage for a student.

    Returns: {
        total_lessons: int,
        completed_lessons: int,
        percentage: float (0.0 to 100.0),
        locked_lessons: int
    }
    """
    from app.modules.module2_content.models import CourseModule, Lesson, LessonStatus

    # Count total published lessons in course
    total_result = await db.execute(
        select(func.count(Lesson.id))
        .join(CourseModule, Lesson.module_id == CourseModule.id)
        .where(
            CourseModule.course_id == course_id,
            Lesson.status == LessonStatus.published,
        )
    )
    total = total_result.scalar_one()

    if total == 0:
        return {"total_lessons": 0, "completed_lessons": 0, "percentage": 0.0, "locked_lessons": 0}

    # Count completed lessons
    completed_result = await db.execute(
        select(func.count(StudentProgress.id))
        .join(Lesson, StudentProgress.lesson_id == Lesson.id)
        .join(CourseModule, Lesson.module_id == CourseModule.id)
        .where(
            StudentProgress.student_id == student_id,
            CourseModule.course_id == course_id,
            StudentProgress.completed == True,
        )
    )
    completed = completed_result.scalar_one()

    # Count locked lessons
    locked_result = await db.execute(
        select(func.count(LearningPathState.id))
        .join(Lesson, LearningPathState.lesson_id == Lesson.id)
        .join(CourseModule, Lesson.module_id == CourseModule.id)
        .where(
            LearningPathState.student_id == student_id,
            CourseModule.course_id == course_id,
            LearningPathState.state == PathState.locked,
        )
    )
    locked = locked_result.scalar_one()

    percentage = round((completed / total) * 100, 1) if total > 0 else 0.0

    return {
        "total_lessons": total,
        "completed_lessons": completed,
        "percentage": percentage,
        "locked_lessons": locked,
    }
