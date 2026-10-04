"""
ELARION AI Learning Platform — Backend
Module: app/modules/module5_assessment/router.py

Purpose:
    FastAPI Router for Module 5 — AI Assessment Generation & Grading.
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
from app.modules.module5_assessment.models import Question, Submission, SubmissionStatus, Test
from app.modules.module5_assessment.schemas import (
    AssessmentGenerateRequest,
    AssessmentStudentViewResponse,
    QuestionStudentView,
    SkillScoreResponse,
    SubmissionCreateRequest,
    SubmissionDetailResponse,
)
from app.modules.module5_assessment.services.generation_service import generate_lesson_assessment
from app.modules.module5_assessment.services.grading_service import grade_submission
from app.shared.dependencies import get_current_user, require_permission
from app.shared.exceptions import BusinessRuleError, NotFoundError
from app.shared.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["Module 5 — AI Assessment"])


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
    Persists test questions with balanced MCQs and short answers.
    """
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

    student_questions = [QuestionStudentView.from_orm_model(q) for q in test.questions]

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

    progress = await get_course_progress(db, course_id, current_user.id)
    if progress.total_lessons == 0 or progress.completed_lessons < progress.total_lessons:
        raise BusinessRuleError("Course is not fully completed.")

    query = (
        select(Test)
        .where(Test.course_id == course_id)
        .where(Test.is_focused_retest == False)
        .order_by(desc(Test.created_at))
        .options(selectinload(Test.questions))
        .limit(1)
    )
    result = await db.execute(query)
    test = result.scalar_one_or_none()

    if not test:
        test = await generate_course_assessment(course_id=course_id, db=db)

    student_questions = [QuestionStudentView.from_orm_model(q) for q in test.questions]

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

    student_questions = [QuestionStudentView.from_orm_model(q) for q in test.questions]

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
    current_user: User = Depends(get_current_user)
) -> SubmissionDetailResponse:
    """
    Submits student answers, executes dual-engine grading, persists skill scores,
    and returns comprehensive results and feedback.
    """
    # 1. Verify test exists
    test = await db.get(Test, test_id)
    if not test:
        raise NotFoundError("Test", test_id)

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
        .options(selectinload(Submission.skill_scores).selectinload(SkillScore.skill))
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
        .options(selectinload(Submission.skill_scores).selectinload(SkillScore.skill))
    )
    res = await db.execute(query)
    submission = res.scalar_one_or_none()
    if not submission:
        raise NotFoundError("Submission", submission_id)

    # Authorization check
    is_privileged = any(r.name in ("Admin", "Instructor") for r in current_user.roles)
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
