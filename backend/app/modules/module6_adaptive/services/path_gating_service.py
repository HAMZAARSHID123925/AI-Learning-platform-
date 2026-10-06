"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/services/path_gating_service.py

Purpose:
    Content gating state machine:
    - Locks downstream lessons in LearningPathState when a prerequisite weakness is detected.
    - Unlocks lessons when weakness flags are resolved.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.module2_content.models import LessonSkill, Lesson, CourseModule, Course, LessonStatus, CourseStatus
from app.modules.module4_experience.models import LearningPathState, PathState, Enrollment
from app.modules.module6_adaptive.models import WeaknessFlag, WeaknessStatus
from app.modules.shared_models.skill_taxonomy import SkillTaxonomy
from app.shared.logging_config import get_logger

logger = get_logger(__name__)


async def lock_lessons_for_weakness(
    db: AsyncSession,
    student_id: uuid.UUID,
    skill_id: uuid.UUID
) -> int:
    """
    Finds all lessons requiring skill_id and locks them in LearningPathState.
    Returns the count of locked lessons.
    """
    skill = await db.get(SkillTaxonomy, skill_id)
    skill_name = skill.name if skill else str(skill_id)
    reason = f"Prerequisite skill '{skill_name}' requires remediation."

    # Find lessons requiring this skill
    query = select(LessonSkill.lesson_id).join(Lesson).join(CourseModule).join(Course).join(Enrollment, Enrollment.course_id == Course.id).where(LessonSkill.skill_id == skill_id, Enrollment.student_id == student_id, Enrollment.status == "active", Lesson.status == LessonStatus.published, Course.status == CourseStatus.published)
    res = await db.execute(query)
    lesson_ids = res.scalars().all()

    now = datetime.now(timezone.utc)
    locked_count = 0

    for lid in lesson_ids:
        stmt = insert(LearningPathState).values(
            student_id=student_id,
            lesson_id=lid,
            state=PathState.locked,
            locked_reason=reason,
            updated_at=now
        ).on_conflict_do_update(
            index_elements=["student_id", "lesson_id"],
            set_={
                "state": PathState.locked,
                "locked_reason": reason,
                "updated_at": now
            },
            where=LearningPathState.state != PathState.mastered
        )
        result = await db.execute(stmt)
        locked_count += result.rowcount

    await db.commit()
    logger.info("lessons_locked_for_weakness", student_id=str(student_id), skill_id=str(skill_id), count=locked_count)
    return locked_count


async def unlock_lessons_if_clear(
    db: AsyncSession,
    student_id: uuid.UUID,
    skill_id: uuid.UUID
) -> int:
    """
    Checks if student has any remaining active weaknesses for skill_id.
    If none remain, unlocks all lessons locked for this skill.
    """
    # Check if student still has any active flag for this skill
    active_query = select(WeaknessFlag.id).where(
        WeaknessFlag.student_id == student_id,
        WeaknessFlag.skill_id == skill_id,
        WeaknessFlag.status == WeaknessStatus.active
    )
    active_res = await db.execute(active_query.limit(1))
    if active_res.scalar_one_or_none():
        return 0  # Still has active weakness, keep locked

    # Find lessons requiring this skill
    query = select(LessonSkill.lesson_id).join(Lesson).join(CourseModule).join(Course).join(Enrollment, Enrollment.course_id == Course.id).where(LessonSkill.skill_id == skill_id, Enrollment.student_id == student_id, Enrollment.status == "active", Lesson.status == LessonStatus.published, Course.status == CourseStatus.published)
    res = await db.execute(query)
    lesson_ids = res.scalars().all()

    now = datetime.now(timezone.utc)
    unlocked_count = 0

    for lid in lesson_ids:
        path_query = select(LearningPathState).where(
            LearningPathState.student_id == student_id,
            LearningPathState.lesson_id == lid,
            LearningPathState.state == PathState.locked
        )
        path_res = await db.execute(path_query)
        path_state = path_res.scalar_one_or_none()
        if path_state:
            remaining = (await db.execute(select(WeaknessFlag.id).join(LessonSkill, LessonSkill.skill_id == WeaknessFlag.skill_id).where(LessonSkill.lesson_id == lid, WeaknessFlag.student_id == student_id, WeaknessFlag.status == WeaknessStatus.active).limit(1))).scalar_one_or_none()
            if remaining:
                continue
            path_state.state = PathState.unlocked
            path_state.locked_reason = None
            path_state.updated_at = now
            unlocked_count += 1

    await db.commit()
    logger.info("lessons_unlocked", student_id=str(student_id), skill_id=str(skill_id), count=unlocked_count)
    return unlocked_count
