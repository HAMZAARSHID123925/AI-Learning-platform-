"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/services/weakness_detector.py

Purpose:
    Core weakness detection engine.
    Analyzes graded submission skill scores against the platform threshold (0.60).
    Manages WeaknessFlag lifecycle:
      - Score < 0.60: creates or updates active WeaknessFlag.
      - Score >= 0.60 on retest: resolves WeaknessFlag and links resolution submission.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.modules.module5_assessment.models import SkillScore, Submission
from app.modules.module6_adaptive.models import PlanStatus, RemediationPlan, WeaknessFlag, WeaknessStatus
from app.shared.logging_config import get_logger

logger = get_logger(__name__)


async def evaluate_submission_skills_for_weaknesses(
    submission: Submission,
    db: AsyncSession
) -> tuple[list[WeaknessFlag], list[WeaknessFlag]]:
    """
    Evaluates all skill scores for a graded submission:
    Returns (newly_flagged_weaknesses, resolved_weaknesses).
    """
    settings = get_settings()
    threshold = settings.WEAKNESS_THRESHOLD  # 0.60

    new_weaknesses: list[WeaknessFlag] = []
    resolved_weaknesses: list[WeaknessFlag] = []

    from app.modules.module1_auth.models import User
    # Serialize lifecycle changes for a student, including the first flag insert.
    await db.execute(select(User.id).where(User.id == submission.student_id).with_for_update())
    from app.modules.module5_assessment.models import Test
    from app.modules.module2_content.models import Lesson, CourseModule
    from app.shared.exceptions import BusinessRuleError
    test = await db.get(Test, submission.test_id)
    course_id = test.course_id
    if not course_id and test.lesson_id:
        course_id = (await db.execute(select(CourseModule.course_id).join(Lesson, Lesson.module_id == CourseModule.id).where(Lesson.id == test.lesson_id))).scalar_one_or_none()
    if not course_id:
        raise BusinessRuleError("Assessment has no course context")
    # Fetch skill scores for this submission
    query = select(SkillScore).where(SkillScore.submission_id == submission.id)
    res = await db.execute(query)
    scores = res.scalars().all()

    for item in scores:
        score_ratio = float(item.score) / float(item.max_score or 1.0)

        # Check if student already has an active weakness flag for this skill
        flag_query = select(WeaknessFlag).where(
            WeaknessFlag.student_id == submission.student_id,
            WeaknessFlag.skill_id == item.skill_id,
            WeaknessFlag.course_id == course_id
        )
        flag_res = await db.execute(flag_query)
        existing_flag = flag_res.scalar_one_or_none()
        if existing_flag:
            previous_ids = [existing_flag.submission_id, existing_flag.resolution_submission_id]
            previous = list((await db.execute(select(Submission).where(Submission.id.in_([i for i in previous_ids if i])))).scalars())
            if any(old.submitted_at > submission.submitted_at for old in previous):
                continue  # Delayed events must not overwrite a newer result.

        if score_ratio < threshold:
            # Deficit detected!
            if existing_flag:
                if existing_flag.status == WeaknessStatus.active and existing_flag.submission_id == submission.id:
                    plan_exists = (await db.execute(select(RemediationPlan.id).where(RemediationPlan.weakness_flag_id == existing_flag.id, RemediationPlan.status.in_([PlanStatus.active, PlanStatus.escalated])).limit(1))).scalar_one_or_none()
                    if plan_exists:
                        continue  # Already processed; avoid resetting a studied plan.
                existing_flag.status = WeaknessStatus.active
                existing_flag.resolved_at = None
                existing_flag.resolution_submission_id = None
                # Reuse the database's unique student/skill lifecycle row.
                existing_flag.score_at_flag = score_ratio
                existing_flag.submission_id = submission.id
                logger.info(
                    "updated_existing_weakness_flag",
                    flag_id=str(existing_flag.id),
                    student_id=str(submission.student_id),
                    skill_id=str(item.skill_id),
                    score=score_ratio
                )
                new_weaknesses.append(existing_flag)
            else:
                # Create new active weakness flag
                new_flag = WeaknessFlag(
                    student_id=submission.student_id,
                    course_id=course_id,
                    skill_id=item.skill_id,
                    submission_id=submission.id,
                    score_at_flag=score_ratio,
                    threshold=threshold,
                    status=WeaknessStatus.active
                )
                db.add(new_flag)
                await db.flush()
                logger.info(
                    "created_new_weakness_flag",
                    flag_id=str(new_flag.id),
                    student_id=str(submission.student_id),
                    skill_id=str(item.skill_id),
                    score=score_ratio
                )
                new_weaknesses.append(new_flag)

        else:
            # Passing score achieved!
            if existing_flag and existing_flag.status == WeaknessStatus.active:
                # Resolve the active weakness
                existing_flag.status = WeaknessStatus.resolved
                existing_flag.resolution_submission_id = submission.id
                existing_flag.resolved_at = datetime.now(timezone.utc)

                # Mark associated remediation plan as completed
                plan_query = select(RemediationPlan).where(
                    RemediationPlan.weakness_flag_id == existing_flag.id,
                    RemediationPlan.status.in_([PlanStatus.active, PlanStatus.escalated])
                )
                plan_res = await db.execute(plan_query)
                plan = plan_res.scalar_one_or_none()
                if plan:
                    plan.status = PlanStatus.completed
                    plan.instructor_escalated = False
                    plan.completed_at = datetime.now(timezone.utc)

                logger.info(
                    "resolved_weakness_flag",
                    flag_id=str(existing_flag.id),
                    student_id=str(submission.student_id),
                    skill_id=str(item.skill_id),
                    score=score_ratio
                )
                resolved_weaknesses.append(existing_flag)

    await db.commit()
    from app.modules.module4_experience.services.dashboard_service import invalidate_dashboard_cache
    await invalidate_dashboard_cache(submission.student_id)
    return new_weaknesses, resolved_weaknesses
