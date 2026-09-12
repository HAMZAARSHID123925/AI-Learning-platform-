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
            WeaknessFlag.status == WeaknessStatus.active
        )
        flag_res = await db.execute(flag_query)
        existing_flag = flag_res.scalar_one_or_none()

        if score_ratio < threshold:
            # Deficit detected!
            if existing_flag:
                # Update existing active flag with latest score
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
            if existing_flag:
                # Resolve the active weakness
                existing_flag.status = WeaknessStatus.resolved
                existing_flag.resolution_submission_id = submission.id
                existing_flag.resolved_at = datetime.now(timezone.utc)

                # Mark associated remediation plan as completed
                plan_query = select(RemediationPlan).where(
                    RemediationPlan.weakness_flag_id == existing_flag.id,
                    RemediationPlan.status == PlanStatus.active
                )
                plan_res = await db.execute(plan_query)
                plan = plan_res.scalar_one_or_none()
                if plan:
                    plan.status = PlanStatus.completed
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
    return new_weaknesses, resolved_weaknesses
