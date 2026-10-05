"""Owned, atomic and idempotent remediation-study handoff."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.config import get_settings
from app.modules.module2_content.models import Lesson, CourseModule, LessonSkill, LessonStatus
from app.modules.module5_assessment.models import Submission, Test
from app.modules.module5_assessment.services.generation_service import generate_lesson_assessment
from app.modules.module6_adaptive.models import PlanStatus, RemediationPlan
from app.shared.exceptions import BusinessRuleError, NotFoundError

async def complete_remedial_study_and_trigger_retest(db, student_id: uuid.UUID, plan_id: uuid.UUID):
    plan = (await db.execute(select(RemediationPlan).where(RemediationPlan.id == plan_id).options(selectinload(RemediationPlan.weakness_flag)).with_for_update())).scalar_one_or_none()
    if not plan or plan.student_id != student_id:
        raise NotFoundError("RemediationPlan", plan_id)
    if plan.study_completed:
        if plan.instructor_escalated:
            return plan, None
        if plan.focused_retest_id:
            retest = await db.get(Test, plan.focused_retest_id)
            if retest:
                return plan, retest
        raise BusinessRuleError("The completed plan has no valid retest handoff")
    if plan.status != PlanStatus.active:
        raise BusinessRuleError("This remediation plan is closed")
    if not (plan.remedial_course_markdown or "").strip():
        raise BusinessRuleError("The study document is not ready")
    if plan.retest_attempt_count >= get_settings().MAX_RETEST_ATTEMPTS:
        plan.study_completed = True
        plan.study_completed_at = datetime.now(timezone.utc)
        plan.instructor_escalated = True
        plan.status = PlanStatus.escalated
        await db.commit()
        return plan, None
    flag = plan.weakness_flag
    submission = await db.get(Submission, flag.submission_id)
    original = await db.get(Test, submission.test_id) if submission else None
    if not original:
        raise BusinessRuleError("The originating assessment is unavailable")
    lesson_id = original.lesson_id
    if not lesson_id and original.course_id:
        lesson_id = (await db.execute(select(Lesson.id).join(CourseModule).join(LessonSkill).where(CourseModule.course_id == original.course_id, LessonSkill.skill_id == flag.skill_id, Lesson.status == LessonStatus.published).order_by(CourseModule.sequence_order, Lesson.sequence_order).limit(1))).scalar_one_or_none()
    if not lesson_id:
        raise BusinessRuleError("No published lesson covers the remediation skill")
    retest = await generate_lesson_assessment(lesson_id=lesson_id, db=db, is_focused_retest=True, skill_filter=[flag.skill_id], num_questions=4, commit=False)
    plan.focused_retest_id = retest.id
    plan.study_completed = True
    plan.study_completed_at = datetime.now(timezone.utc)
    plan.retest_attempt_count += 1
    await db.commit()
    return plan, retest
