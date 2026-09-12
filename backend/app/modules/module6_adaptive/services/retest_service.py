"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/services/retest_service.py

Purpose:
    Manages the remedial study completion gate and focused retest generation.
    Enforces maximum retest attempts (3) before triggering human instructor escalation.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.modules.module5_assessment.models import Submission, Test
from app.modules.module5_assessment.services.generation_service import generate_lesson_assessment
from app.modules.module6_adaptive.models import PlanStatus, RemediationPlan, WeaknessFlag
from app.shared.exceptions import BusinessRuleError, NotFoundError
from app.shared.logging_config import get_logger

logger = get_logger(__name__)


async def complete_remedial_study_and_trigger_retest(
    db: AsyncSession,
    student_id: uuid.UUID,
    plan_id: uuid.UUID
) -> tuple[RemediationPlan, Test | None]:
    """
    1. Validates that the student is owner of the remediation plan.
    2. Marks study_completed = True and records timestamp.
    3. Increments retest_attempt_count.
    4. If attempt count >= 3, flags instructor_escalated = True (no further auto tests).
    5. Else triggers Module 5 to generate a focused retest covering the weak skill.
    """
    settings = get_settings()
    max_attempts = settings.MAX_RETEST_ATTEMPTS  # 3

    # Fetch plan with weakness flag
    query = (
        select(RemediationPlan)
        .where(RemediationPlan.id == plan_id)
        .options(selectinload(RemediationPlan.weakness_flag))
    )
    res = await db.execute(query)
    plan = res.scalar_one_or_none()
    if not plan or plan.student_id != student_id:
        raise NotFoundError("RemediationPlan", plan_id)

    if plan.status != PlanStatus.active:
        raise BusinessRuleError("This remediation plan is already completed or closed.")

    # Mark study completed
    plan.study_completed = True
    plan.study_completed_at = datetime.now(timezone.utc)
    plan.retest_attempt_count += 1

    # Check bounded attempt limit
    if plan.retest_attempt_count >= max_attempts:
        plan.instructor_escalated = True
        await db.commit()
        await db.refresh(plan)
        logger.warning(
            "retest_limit_reached_escalating",
            plan_id=str(plan.id),
            student_id=str(student_id),
            attempts=plan.retest_attempt_count
        )
        return plan, None

    # Resolve lesson from the original submission
    flag = plan.weakness_flag
    sub_query = select(Submission).where(Submission.id == flag.submission_id)
    sub_res = await db.execute(sub_query)
    submission = sub_res.scalar_one_or_none()
    
    if not submission:
        await db.commit()
        return plan, None

    test_query = select(Test).where(Test.id == submission.test_id)
    test_res = await db.execute(test_query)
    orig_test = test_res.scalar_one_or_none()
    lesson_id = orig_test.lesson_id if orig_test else uuid.uuid4()

    # Generate targeted retest via Module 5
    retest = await generate_lesson_assessment(
        lesson_id=lesson_id,
        db=db,
        is_focused_retest=True,
        skill_filter=[flag.skill_id],
        num_questions=4
    )

    await db.commit()
    await db.refresh(plan)
    logger.info("focused_retest_generated_for_plan", plan_id=str(plan.id), test_id=str(retest.id))
    return plan, retest
