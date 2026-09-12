"""
ELARION AI Learning Platform — Backend
Unit tests for Module 6 (Adaptive Learning & Remediation Engine)
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

from app.modules.module5_assessment.models import Question, QuestionType, SkillScore, Submission, Test
from app.modules.module6_adaptive.models import PlanStatus, RemediationPlan, WeaknessFlag, WeaknessStatus
from app.modules.module6_adaptive.services.weakness_detector import evaluate_submission_skills_for_weaknesses
from app.modules.module6_adaptive.services.retest_service import complete_remedial_study_and_trigger_retest
from app.shared.exceptions import BusinessRuleError, NotFoundError


@pytest.mark.asyncio
async def test_weakness_detector_creates_flag_on_low_score():
    """Score < 0.60 must create an active WeaknessFlag."""
    student_id = uuid.uuid4()
    submission_id = uuid.uuid4()
    skill_id = uuid.uuid4()

    submission = Submission(
        id=submission_id,
        test_id=uuid.uuid4(),
        student_id=student_id,
        answers={},
    )

    skill_score = SkillScore(
        id=uuid.uuid4(),
        submission_id=submission_id,
        skill_id=skill_id,
        score=0.45,
        max_score=1.0,
    )

    db = AsyncMock()
    # First query returns the skill score
    # Second query returns None for existing flag
    res1 = MagicMock()
    res1.scalars.return_value.all.return_value = [skill_score]

    res2 = MagicMock()
    res2.scalar_one_or_none.return_value = None

    db.execute.side_effect = [res1, res2]

    new_flags, resolved_flags = await evaluate_submission_skills_for_weaknesses(submission, db)

    assert len(new_flags) == 1
    assert len(resolved_flags) == 0
    flag = new_flags[0]
    assert flag.student_id == student_id
    assert flag.skill_id == skill_id
    assert flag.score_at_flag == 0.45
    assert flag.status == WeaknessStatus.active
    db.add.assert_called_once()


@pytest.mark.asyncio
async def test_weakness_detector_resolves_flag_on_passing_retest():
    """Score >= 0.60 on retest must resolve existing active WeaknessFlag."""
    student_id = uuid.uuid4()
    submission_id = uuid.uuid4()
    skill_id = uuid.uuid4()

    submission = Submission(
        id=submission_id,
        test_id=uuid.uuid4(),
        student_id=student_id,
        answers={},
    )

    skill_score = SkillScore(
        id=uuid.uuid4(),
        submission_id=submission_id,
        skill_id=skill_id,
        score=0.85,
        max_score=1.0,
    )

    existing_flag = WeaknessFlag(
        id=uuid.uuid4(),
        student_id=student_id,
        skill_id=skill_id,
        submission_id=uuid.uuid4(),
        score_at_flag=0.40,
        threshold=0.60,
        status=WeaknessStatus.active,
    )

    db = AsyncMock()
    res1 = MagicMock()
    res1.scalars.return_value.all.return_value = [skill_score]

    res2 = MagicMock()
    res2.scalar_one_or_none.return_value = existing_flag

    # Active plan query
    res3 = MagicMock()
    res3.scalar_one_or_none.return_value = None

    db.execute.side_effect = [res1, res2, res3]

    new_flags, resolved_flags = await evaluate_submission_skills_for_weaknesses(submission, db)

    assert len(new_flags) == 0
    assert len(resolved_flags) == 1
    assert existing_flag.status == WeaknessStatus.resolved
    assert existing_flag.resolution_submission_id == submission_id


@pytest.mark.asyncio
async def test_retest_service_completes_study_and_increments_attempts():
    """Validates study completion timestamp and attempt increment."""
    student_id = uuid.uuid4()
    plan_id = uuid.uuid4()
    flag_id = uuid.uuid4()
    submission_id = uuid.uuid4()
    test_id = uuid.uuid4()

    flag = WeaknessFlag(
        id=flag_id,
        student_id=student_id,
        skill_id=uuid.uuid4(),
        submission_id=submission_id,
        score_at_flag=0.50,
        threshold=0.60,
        status=WeaknessStatus.active,
    )

    plan = RemediationPlan(
        id=plan_id,
        student_id=student_id,
        weakness_flag_id=flag_id,
        weakness_flag=flag,
        status=PlanStatus.active,
        study_completed=False,
        retest_attempt_count=0,
        instructor_escalated=False,
    )

    submission = Submission(id=submission_id, test_id=test_id, student_id=student_id)
    orig_test = Test(id=test_id, lesson_id=uuid.uuid4())
    mock_retest = Test(id=uuid.uuid4(), lesson_id=orig_test.lesson_id, is_focused_retest=True)

    db = AsyncMock()
    res_plan = MagicMock()
    res_plan.scalar_one_or_none.return_value = plan

    res_sub = MagicMock()
    res_sub.scalar_one_or_none.return_value = submission

    res_test = MagicMock()
    res_test.scalar_one_or_none.return_value = orig_test

    db.execute.side_effect = [res_plan, res_sub, res_test]

    with patch(
        "app.modules.module6_adaptive.services.retest_service.generate_lesson_assessment",
        new=AsyncMock(return_value=mock_retest)
    ):
        updated_plan, generated_retest = await complete_remedial_study_and_trigger_retest(
            db=db, student_id=student_id, plan_id=plan_id
        )

        assert updated_plan.study_completed is True
        assert updated_plan.study_completed_at is not None
        assert updated_plan.retest_attempt_count == 1
        assert updated_plan.instructor_escalated is False
        assert generated_retest is not None
        assert generated_retest.id == mock_retest.id


@pytest.mark.asyncio
async def test_retest_service_escalates_on_max_attempts():
    """At 3rd attempt, instructor_escalated is set and no retest is generated."""
    student_id = uuid.uuid4()
    plan_id = uuid.uuid4()

    plan = RemediationPlan(
        id=plan_id,
        student_id=student_id,
        weakness_flag_id=uuid.uuid4(),
        status=PlanStatus.active,
        study_completed=True,
        retest_attempt_count=2,  # next attempt will be 3 (>= MAX_RETEST_ATTEMPTS)
        instructor_escalated=False,
    )

    db = AsyncMock()
    res_plan = MagicMock()
    res_plan.scalar_one_or_none.return_value = plan
    db.execute.return_value = res_plan

    updated_plan, generated_retest = await complete_remedial_study_and_trigger_retest(
        db=db, student_id=student_id, plan_id=plan_id
    )

    assert updated_plan.retest_attempt_count == 3
    assert updated_plan.instructor_escalated is True
    assert generated_retest is None  # Auto retest halted for human review


@pytest.mark.asyncio
async def test_retest_service_rejects_inactive_plan():
    """Non-active plans cannot trigger retests."""
    student_id = uuid.uuid4()
    plan_id = uuid.uuid4()

    plan = RemediationPlan(
        id=plan_id,
        student_id=student_id,
        weakness_flag_id=uuid.uuid4(),
        status=PlanStatus.completed,
        study_completed=True,
        retest_attempt_count=1,
    )

    db = AsyncMock()
    res_plan = MagicMock()
    res_plan.scalar_one_or_none.return_value = plan
    db.execute.return_value = res_plan

    with pytest.raises(BusinessRuleError, match="already completed or closed"):
        await complete_remedial_study_and_trigger_retest(
            db=db, student_id=student_id, plan_id=plan_id
        )
