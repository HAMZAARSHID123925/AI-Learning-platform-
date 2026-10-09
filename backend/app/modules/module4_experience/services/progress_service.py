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


_UNLOADED_GATE = object()


async def check_lesson_access(
    db: AsyncSession,
    lesson_id: uuid.UUID,
    user,
    *, as_student: bool = False, loaded_state=_UNLOADED_GATE,
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
    if not as_student and (user.has_role("Instructor") or user.has_role("Admin")):
        return

    # Detail reads can supply their fresh, viewer-scoped DB join. Other callers
    # retain the original authoritative lookup; no cached/client state is used.
    if loaded_state is _UNLOADED_GATE:
        result = await db.execute(
            select(LearningPathState).where(
                LearningPathState.student_id == user.id,
                LearningPathState.lesson_id == lesson_id,
            )
        )
        state = result.scalar_one_or_none()
    else:
        state = loaded_state
        if state is not None and (state.student_id != user.id or state.lesson_id != lesson_id):
            raise ValueError("Lesson access state must match the viewer and lesson")

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
    """Fresh viewer-scoped counts and latest final assessment in one SQL read.

    Completion/total count only published lessons. Locks deliberately include
    unpublished lessons, matching the original contract. Unique student/lesson
    constraints make the joins one-to-one, preventing count multiplication.
    """
    from sqlalchemy import and_, case, true
    from app.modules.module2_content.models import CourseModule, Lesson, LessonStatus
    from app.modules.module5_assessment.models import Test, Submission, SubmissionStatus

    published = Lesson.status == LessonStatus.published
    counts = (
        select(
            func.count(case((published, Lesson.id))).label("total"),
            func.count(case((and_(published, StudentProgress.completed == True),
                             StudentProgress.id))).label("completed"),
            func.count(case((LearningPathState.state == PathState.locked,
                             LearningPathState.id))).label("locked"),
        )
        .select_from(Lesson).join(CourseModule, Lesson.module_id == CourseModule.id)
        .outerjoin(StudentProgress, and_(StudentProgress.lesson_id == Lesson.id,
                                        StudentProgress.student_id == student_id))
        .outerjoin(LearningPathState, and_(LearningPathState.lesson_id == Lesson.id,
                                          LearningPathState.student_id == student_id))
        .where(CourseModule.course_id == course_id).subquery()
    )
    latest = (
        select(Submission.id.label("submission_id"), Submission.status.label("submission_status"))
        .join(Test, Submission.test_id == Test.id)
        .where(Test.course_id == course_id, Test.is_focused_retest == False,
               Submission.student_id == student_id)
        .order_by(Submission.submitted_at.desc(), Submission.id.desc()).limit(1).subquery()
    )
    row = (await db.execute(
        select(counts, latest).select_from(counts).outerjoin(latest, true())
    )).mappings().one()
    total = row["total"]
    if total == 0:
        # Preserve the original four-field zero-lesson response, even if there
        # are unpublished locks or saved submissions for this course.
        return {"total_lessons": 0, "completed_lessons": 0, "percentage": 0.0, "locked_lessons": 0}
    submission_id = row["submission_id"]
    return {
        "total_lessons": total,
        "completed_lessons": row["completed"],
        "percentage": round((row["completed"] / total) * 100, 1),
        "locked_lessons": row["locked"],
        "assessment_status": (
            "completed" if row["submission_status"] == SubmissionStatus.graded else "in_progress"
        ) if submission_id is not None else "not_started",
        "latest_submission_id": submission_id,
    }
