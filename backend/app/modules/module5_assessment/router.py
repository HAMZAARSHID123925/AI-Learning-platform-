"""
ELARION AI Learning Platform â€” Backend
Module: app/modules/module5_assessment/router.py

Purpose:
    FastAPI Router for Module 5 â€” AI Assessment Generation & Grading.
    Provides endpoints for test generation, anti-cheat question retrieval,
    submission intake, and graded result fetching.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.modules.module1_auth.models import User
from app.modules.module5_assessment.models import Question, SkillScore, Submission, SubmissionStatus, Test
from app.modules.module5_assessment.schemas import (
    AssessmentGenerateRequest,
    AssessmentStudentViewResponse,
    QuestionStudentView,
    SkillScoreResponse,
    SubmissionCreateRequest,
    SubmissionDetailResponse,
    student_option_id,
)
from app.modules.module5_assessment.services.generation_service import generate_lesson_assessment
from app.modules.module5_assessment.services.grading_service import grade_submission
from app.shared.dependencies import get_current_user, require_permission, require_any_role
from app.shared.exceptions import BusinessRuleError, NotFoundError
from app.shared.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["Module 5 â€” AI Assessment"])


# =============================================================================
# 1. Assessment Generation (Instructors / Admins)
# =============================================================================

@router.post(
    "/assessments/generate",
    status_code=status.HTTP_201_CREATED,
    summary="Generate an AI-powered assessment for a lesson",
    dependencies=[Depends(require_permission("course:create"))]
)
async def generate_assessment_endpoint(
    body: AssessmentGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict[str, Any]:
    """
    Generates a RAG-grounded assessment for the given lesson.
    Persists exactly ten validated MCQs; delivery excludes answer keys.
    """
    from app.modules.module5_assessment.services.access_service import require_target_access
    await require_target_access(db, current_user, lesson_id=body.lesson_id, course_id=body.course_id, generation=True)
    if body.course_id:
        from app.modules.module5_assessment.services.generation_service import generate_course_assessment
        test = await generate_course_assessment(course_id=body.course_id, db=db)
    elif body.lesson_id:
        test = await generate_lesson_assessment(
            lesson_id=body.lesson_id,
            db=db,
            is_focused_retest=body.is_focused_retest,
            skill_filter=body.skill_filter,
            num_questions=body.num_questions
        )
    else:
        raise HTTPException(status_code=400, detail="Must provide course_id or lesson_id")
    return {
        "message": "Assessment generated successfully",
        "test_id": test.id,
        "title": test.title,
        "question_count": len(test.questions),
        "is_focused_retest": test.is_focused_retest
    }


# =============================================================================
# 2. Student Test Delivery (Anti-Cheat View)
# =============================================================================

@router.get(
    "/lessons/{lesson_id}/assessment",
    response_model=AssessmentStudentViewResponse,
    summary="Get current assessment for a lesson (Anti-cheat sanitized)"
)
async def get_lesson_assessment(
    lesson_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> AssessmentStudentViewResponse:
    """
    Fetches the ready assessment for the given lesson.
    Anti-Cheat Guardrail: Correct answers, distractors flags, and rubrics
    are strictly stripped before delivery to the student.
    """
    from app.modules.module5_assessment.services.access_service import require_target_access
    await require_target_access(db, current_user, lesson_id=lesson_id)
    query = (
        select(Test)
        .where(Test.lesson_id == lesson_id)
        .where(Test.is_focused_retest == False)
        .order_by(desc(Test.lesson_version), desc(Test.created_at))
        .options(selectinload(Test.questions))
        .limit(1)
    )
    result = await db.execute(query)
    test = result.scalar_one_or_none()

    if not test:
        # If no assessment exists yet, generate on the fly
        test = await generate_lesson_assessment(lesson_id=lesson_id, db=db)

    from app.modules.module5_assessment.services.access_service import require_test_access
    await require_test_access(db, current_user, test)
    student_questions = [QuestionStudentView.from_orm_model(q, current_user.id) for q in test.questions]

    return AssessmentStudentViewResponse(
        id=test.id,
        lesson_id=test.lesson_id,
        course_id=test.course_id,
        title=test.title,
        is_focused_retest=test.is_focused_retest,
        questions=student_questions
    )


@router.get(
    "/courses/{course_id}/assessment",
    response_model=AssessmentStudentViewResponse,
    summary="Get current assessment for a course (Anti-cheat sanitized)"
)
async def get_course_assessment(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> AssessmentStudentViewResponse:
    """
    Fetches the ready final assessment for a course.
    Verifies that the student has completed all published lessons in the course.
    """
    from app.modules.module4_experience.services.progress_service import get_course_progress
    from app.modules.module5_assessment.services.generation_service import generate_course_assessment

    from app.modules.module5_assessment.services.access_service import require_target_access
    course = await require_target_access(db, current_user, course_id=course_id)
    progress = await get_course_progress(db, current_user.id, course_id)
    privileged_preview = current_user.has_role("Admin") or (current_user.has_role("Instructor") and course.instructor_id == current_user.id)
    if current_user.has_role("Student") and not privileged_preview and (progress["total_lessons"] == 0 or progress["completed_lessons"] < progress["total_lessons"]):
        raise BusinessRuleError("Course is not fully completed.")

    test = await generate_course_assessment(course_id=course_id, db=db)

    from app.modules.module5_assessment.services.access_service import require_test_access
    await require_test_access(db, current_user, test)
    student_questions = [QuestionStudentView.from_orm_model(q, current_user.id) for q in test.questions]

    return AssessmentStudentViewResponse(
        id=test.id,
        lesson_id=None,
        course_id=test.course_id,
        title=test.title,
        is_focused_retest=test.is_focused_retest,
        questions=student_questions
    )


@router.get(
    "/assessments/tests/{test_id}",
    response_model=AssessmentStudentViewResponse,
    summary="Get a specific test by ID (Anti-cheat sanitized)"
)
async def get_test(
    test_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> AssessmentStudentViewResponse:
    query = (
        select(Test)
        .where(Test.id == test_id)
        .options(selectinload(Test.questions))
    )
    result = await db.execute(query)
    test = result.scalar_one_or_none()

    if not test:
        raise NotFoundError("Test", test_id)

    from app.modules.module5_assessment.services.access_service import require_test_access
    await require_test_access(db, current_user, test)
    student_questions = [QuestionStudentView.from_orm_model(q, current_user.id) for q in test.questions]

    return AssessmentStudentViewResponse(
        id=test.id,
        lesson_id=test.lesson_id,
        course_id=test.course_id,
        title=test.title,
        is_focused_retest=test.is_focused_retest,
        questions=student_questions
    )


# =============================================================================
# 3. Assessment Submission & Grading
# =============================================================================

@router.post(
    "/assessments/{test_id}/submit",
    response_model=SubmissionDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit answers for grading"
)
async def submit_assessment(
    test_id: uuid.UUID,
    payload: SubmissionCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_any_role("Student"))
) -> SubmissionDetailResponse:
    """
    Submits student answers, executes dual-engine grading, persists skill scores,
    and returns comprehensive results and feedback.
    """
    # 1. Verify test exists
    test = (await db.execute(select(Test).where(Test.id == test_id).options(selectinload(Test.questions)).with_for_update())).scalar_one_or_none()
    if not test:
        raise NotFoundError("Test", test_id)

    from app.modules.module5_assessment.services.access_service import require_test_access
    question_map = {q.id: q for q in test.questions}
    ids = [item.question_id for item in payload.answers]
    if len(ids) != len(set(ids)) or set(ids) != set(question_map):
        raise HTTPException(422, "Submit exactly one answer for every test question")
    for item in payload.answers:
        question = question_map[item.question_id]
        if question.question_type.value == "mcq":
            selected = next((str(option["id"]) for option in question.options or [] if student_option_id(question.id, current_user.id, str(option["id"])) == item.selected_option_id), None)
            if selected is None or item.text_answer is not None:
                raise HTTPException(422, "Invalid MCQ answer")
            item.selected_option_id = selected
        elif not item.text_answer or item.selected_option_id is not None:
            raise HTTPException(422, "Invalid written answer")

    if test.is_focused_retest:
        existing = (await db.execute(select(Submission).where(Submission.test_id == test.id, Submission.student_id == current_user.id).order_by(Submission.submitted_at).limit(1))).scalar_one_or_none()
        if existing:
            expected = {str(item.question_id): {"selected_option_id": item.selected_option_id, "text_answer": item.text_answer} for item in payload.answers}
            if existing.answers != expected:
                raise HTTPException(409, "This focused retest has already been submitted")
            if existing.status != SubmissionStatus.graded:
                raise HTTPException(409, "This focused submission is not yet available")
            return await get_submission_detail(existing.id, db, current_user)
    await require_test_access(db, current_user, test, for_submission=True)

    # 2. Determine attempt number
    attempt_query = select(func.count(Submission.id)).where(
        Submission.test_id == test_id,
        Submission.student_id == current_user.id
    )
    res = await db.execute(attempt_query)
    attempt_count = res.scalar() or 0
    next_attempt = attempt_count + 1

    # 3. Format answers map: {str(question_id): {answer}}
    answers_map = {}
    for item in payload.answers:
        answers_map[str(item.question_id)] = {
            "selected_option_id": item.selected_option_id,
            "text_answer": item.text_answer
        }

    # 4. Create submission
    submission = Submission(
        test_id=test_id,
        student_id=current_user.id,
        attempt_number=next_attempt,
        status=SubmissionStatus.grading,
        answers=answers_map
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)

    # 5. Run grading pipeline (MCQ + Claude LLM)
    graded_sub = await grade_submission(submission.id, db)

    # 6. Eagerly load skill scores for response
    sub_query = (
        select(Submission)
        .where(Submission.id == graded_sub.id)
        .options(selectinload(Submission.skill_scores).selectinload(SkillScore.skill), selectinload(Submission.test).selectinload(Test.questions))
    )
    sub_res = await db.execute(sub_query)
    final_sub = sub_res.scalar_one()

    return SubmissionDetailResponse(
        id=final_sub.id,
        test_id=final_sub.test_id,
        student_id=final_sub.student_id,
        attempt_number=final_sub.attempt_number,
        status=final_sub.status,
        overall_score=final_sub.overall_score,
        total_count=len(final_sub.test.questions),
        correct_percentage=round(float(final_sub.overall_score) * 100, 2) if final_sub.overall_score is not None else None,
        submitted_at=final_sub.submitted_at,
        graded_at=final_sub.graded_at,
        skill_scores=[
            SkillScoreResponse(
                id=ss.id,
                skill_id=ss.skill_id,
                skill_name=ss.skill.name if ss.skill else None,
                skill_slug=ss.skill.slug if ss.skill else None,
                score=float(ss.score),
                max_score=float(ss.max_score),
                grader_type=ss.grader_type,
                llm_feedback=ss.llm_feedback
            )
            for ss in final_sub.skill_scores
        ]
    )


# =============================================================================
# 4. Results & Feedback Retrieval
# =============================================================================

@router.get(
    "/submissions/{submission_id}",
    response_model=SubmissionDetailResponse,
    summary="Get submission result, score breakdown, and constructive feedback"
)
async def get_submission_detail(
    submission_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> SubmissionDetailResponse:
    """
    Fetches details of a submission.
    Students can only view their own submissions; Instructors/Admins can view any.
    """
    query = (
        select(Submission)
        .where(Submission.id == submission_id)
        .options(selectinload(Submission.skill_scores).selectinload(SkillScore.skill), selectinload(Submission.test).selectinload(Test.questions))
    )
    res = await db.execute(query)
    submission = res.scalar_one_or_none()
    if not submission:
        raise NotFoundError("Submission", submission_id)

    # Authorization check
    is_privileged = current_user.has_role("Admin")
    if current_user.has_role("Instructor") and submission.student_id != current_user.id:
        from app.modules.module5_assessment.services.access_service import require_target_access
        test = await db.get(Test, submission.test_id)
        await require_target_access(db, current_user, lesson_id=test.lesson_id, course_id=test.course_id, generation=True)
        is_privileged = True
    if submission.student_id != current_user.id and not is_privileged:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view another student's submission."
        )

    return SubmissionDetailResponse(
        id=submission.id,
        test_id=submission.test_id,
        student_id=submission.student_id,
        attempt_number=submission.attempt_number,
        status=submission.status,
        overall_score=submission.overall_score,
        total_count=len(submission.test.questions),
        correct_percentage=round(float(submission.overall_score) * 100, 2) if submission.overall_score is not None else None,
        submitted_at=submission.submitted_at,
        graded_at=submission.graded_at,
        skill_scores=[
            SkillScoreResponse(
                id=ss.id,
                skill_id=ss.skill_id,
                skill_name=ss.skill.name if ss.skill else None,
                skill_slug=ss.skill.slug if ss.skill else None,
                score=float(ss.score),
                max_score=float(ss.max_score),
                grader_type=ss.grader_type,
                llm_feedback=ss.llm_feedback
            )
            for ss in submission.skill_scores
        ]
    )
