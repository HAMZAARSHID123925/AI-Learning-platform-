"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/router.py

Purpose:
    FastAPI Router for Module 6 — Adaptive Learning & Remediation.
    Provides student endpoints for viewing weak areas, reading AI remedial courses,
    confirming study completion, and instructor escalation tracking.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.modules.module1_auth.models import User
from app.modules.module2_content.models import Course
from app.modules.module4_experience.models import LearningPathState
from app.modules.module6_adaptive.models import PlanStatus, RemediationPlan, WeaknessFlag, VideoGenerationJob
from app.modules.module6_adaptive.schemas import (
    CompleteStudyResponse,
    EscalationResponse,
    LearningPathStateResponse,
    RemediationPlanResponse,
    WeaknessFlagResponse,
    VideoGenerationJobCreateRequest,
    VideoGenerationJobResponse,
)
from app.modules.module6_adaptive.services.retest_service import complete_remedial_study_and_trigger_retest
from app.modules.module6_adaptive.services.video_job_service import create_video_generation_job
from app.shared.dependencies import get_current_user, require_permission
from app.shared.exceptions import NotFoundError
from app.shared.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["Module 6 — Adaptive Learning & Remediation"])


# =============================================================================
# 1. Student Weakness Visibility
# =============================================================================

@router.get(
    "/students/me/weakness-flags",
    response_model=list[WeaknessFlagResponse],
    summary="Get active and resolved weaknesses for current student"
)
async def get_my_weakness_flags(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> list[WeaknessFlagResponse]:
    query = (
        select(WeaknessFlag)
        .where(WeaknessFlag.student_id == current_user.id)
        .order_by(desc(WeaknessFlag.created_at))
    )
    res = await db.execute(query)
    flags = res.scalars().all()
    return [
        WeaknessFlagResponse(
            id=f.id,
            student_id=f.student_id,
            skill_id=f.skill_id,
            submission_id=f.submission_id,
            score_at_flag=float(f.score_at_flag),
            threshold=float(f.threshold),
            status=f.status,
            created_at=f.created_at,
            resolved_at=f.resolved_at
        )
        for f in flags
    ]


# =============================================================================
# 2. Remediation Plans & AI Course Documents
# =============================================================================

@router.get(
    "/students/me/remediation-plans",
    response_model=list[RemediationPlanResponse],
    summary="Get all remediation plans and customized courses for current student"
)
async def get_my_remediation_plans(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> list[RemediationPlanResponse]:
    query = (
        select(RemediationPlan)
        .where(RemediationPlan.student_id == current_user.id)
        .order_by(desc(RemediationPlan.created_at))
    )
    res = await db.execute(query)
    plans = res.scalars().all()
    return [
        RemediationPlanResponse(
            id=p.id,
            student_id=p.student_id,
            weakness_flag_id=p.weakness_flag_id,
            status=p.status,
            remedial_course_title=p.remedial_course_title,
            remedial_course_markdown=p.remedial_course_markdown,
            study_completed=p.study_completed,
            study_completed_at=p.study_completed_at,
            retest_attempt_count=p.retest_attempt_count,
            instructor_escalated=p.instructor_escalated,
            created_at=p.created_at,
            completed_at=p.completed_at
        )
        for p in plans
    ]


@router.get(
    "/remediation-plans/{plan_id}",
    response_model=RemediationPlanResponse,
    summary="Read AI-generated written remedial course document"
)
async def get_remediation_plan_detail(
    plan_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> RemediationPlanResponse:
    plan = await db.get(RemediationPlan, plan_id)
    if not plan:
        raise NotFoundError("RemediationPlan", plan_id)

    # Authorization
    is_privileged = any(r.name in ("Admin", "Instructor") for r in current_user.roles)
    if plan.student_id != current_user.id and not is_privileged:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view another student's remediation plan."
        )

    return RemediationPlanResponse(
        id=plan.id,
        student_id=plan.student_id,
        weakness_flag_id=plan.weakness_flag_id,
        status=plan.status,
        remedial_course_title=plan.remedial_course_title,
        remedial_course_markdown=plan.remedial_course_markdown,
        study_completed=plan.study_completed,
        study_completed_at=plan.study_completed_at,
        retest_attempt_count=plan.retest_attempt_count,
        instructor_escalated=plan.instructor_escalated,
        created_at=plan.created_at,
        completed_at=plan.completed_at
    )


@router.post(
    "/remediation-plans/{plan_id}/complete-study",
    response_model=CompleteStudyResponse,
    summary="Confirm remedial course studied → Unlocks and triggers focused retest"
)
async def complete_remedial_study_endpoint(
    plan_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> CompleteStudyResponse:
    """
    Called by the student after studying the AI-generated written remedial course.
    Triggers the focused retest generator (bounded to 3 attempts).
    """
    plan, retest = await complete_remedial_study_and_trigger_retest(
        db=db,
        student_id=current_user.id,
        plan_id=plan_id
    )

    plan_resp = RemediationPlanResponse(
        id=plan.id,
        student_id=plan.student_id,
        weakness_flag_id=plan.weakness_flag_id,
        status=plan.status,
        remedial_course_title=plan.remedial_course_title,
        remedial_course_markdown=plan.remedial_course_markdown,
        study_completed=plan.study_completed,
        study_completed_at=plan.study_completed_at,
        retest_attempt_count=plan.retest_attempt_count,
        instructor_escalated=plan.instructor_escalated,
        created_at=plan.created_at,
        completed_at=plan.completed_at
    )

    if plan.instructor_escalated:
        msg = "Maximum retest attempts reached. An instructor has been notified to assist you."
    else:
        msg = "Remedial study completed. A targeted retest has been generated for you."

    return CompleteStudyResponse(
        message=msg,
        plan=plan_resp,
        retest_id=retest.id if retest else None,
        instructor_escalated=plan.instructor_escalated
    )


# =============================================================================
# 3. Learning Path & Content Gating View
# =============================================================================

@router.get(
    "/students/me/learning-path",
    response_model=list[LearningPathStateResponse],
    summary="View lesson lock/unlock states across curriculum"
)
async def get_my_learning_path_state(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> list[LearningPathStateResponse]:
    query = (
        select(LearningPathState)
        .where(LearningPathState.student_id == current_user.id)
    )
    res = await db.execute(query)
    states = res.scalars().all()
    return [
        LearningPathStateResponse(
            lesson_id=s.lesson_id,
            state=s.state,
            locked_reason=s.locked_reason,
            updated_at=s.updated_at
        )
        for s in states
    ]


# =============================================================================
# 4. Instructor Escalation Dashboard
# =============================================================================

@router.get(
    "/escalations",
    response_model=list[EscalationResponse],
    summary="List students requiring instructor intervention (Failed 3 retests)",
    dependencies=[Depends(require_permission("course:create"))]
)
async def list_instructor_escalations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> list[EscalationResponse]:
    query = (
        select(RemediationPlan)
        .where(RemediationPlan.instructor_escalated == True)
        .order_by(desc(RemediationPlan.created_at))
    )
    res = await db.execute(query)
    escalated_plans = res.scalars().all()
    return [
        EscalationResponse(
            plan_id=p.id,
            student_id=p.student_id,
            weakness_flag_id=p.weakness_flag_id,
            retest_attempt_count=p.retest_attempt_count,
            created_at=p.created_at
        )
        for p in escalated_plans
    ]


# =============================================================================
# 5. Video Generation Jobs
# =============================================================================

@router.post(
    "/remediation/video-jobs",
    response_model=VideoGenerationJobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new personalized video generation job"
)
async def create_video_job(
    payload: VideoGenerationJobCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> VideoGenerationJobResponse:
    """
    Initiates the personalized video generation pipeline.
    """
    job = await create_video_generation_job(
        db=db,
        student_id=current_user.id,
        weakness_flag_id=payload.weakness_flag_id
    )
    # Sign URLs if keys exist
    from app.config import get_settings
    from app.shared.s3_client import generate_presigned_url
    settings = get_settings()

    video_url = job.video_url
    thumbnail_url = job.thumbnail_url
    if getattr(job, 'video_object_key', None):
        video_url = await generate_presigned_url(job.video_object_key, expires_in=settings.MEDIA_SIGNED_URL_TTL_SECONDS)
    if getattr(job, 'thumbnail_object_key', None):
        thumbnail_url = await generate_presigned_url(job.thumbnail_object_key, expires_in=settings.MEDIA_SIGNED_URL_TTL_SECONDS)

    return VideoGenerationJobResponse(
        id=job.id,
        weakness_flag_id=job.weakness_flag_id,
        status=job.status,
        title=job.title,
        target_duration_seconds=job.target_duration_seconds,
        video_url=video_url,
        thumbnail_url=thumbnail_url,
        error_code=job.error_code,
        created_at=job.created_at,
        started_at=job.started_at,
        completed_at=job.completed_at
    )


@router.get(
    "/remediation/video-jobs/{job_id}",
    response_model=VideoGenerationJobResponse,
    summary="Get status of a personalized video generation job"
)
async def get_video_job_status(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> VideoGenerationJobResponse:
    """
    Get safe status details of a video job.
    """
    job = await db.get(VideoGenerationJob, job_id)
    if not job:
        raise NotFoundError("VideoGenerationJob", job_id)

    # Authorization
    is_admin = any(r.name == "Admin" for r in current_user.roles)
    is_instructor = any(r.name == "Instructor" for r in current_user.roles)
    
    if job.student_id != current_user.id and not is_admin:
        if is_instructor:
            course = await db.get(Course, job.course_id)
            if not course or course.instructor_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not authorized to view this job."
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view this job."
            )

    # Sign URLs if keys exist
    from app.config import get_settings
    from app.shared.s3_client import generate_presigned_url
    settings = get_settings()

    video_url = job.video_url
    thumbnail_url = job.thumbnail_url
    if getattr(job, 'video_object_key', None):
        video_url = await generate_presigned_url(job.video_object_key, expires_in=settings.MEDIA_SIGNED_URL_TTL_SECONDS)
    if getattr(job, 'thumbnail_object_key', None):
        thumbnail_url = await generate_presigned_url(job.thumbnail_object_key, expires_in=settings.MEDIA_SIGNED_URL_TTL_SECONDS)

    return VideoGenerationJobResponse(
        id=job.id,
        weakness_flag_id=job.weakness_flag_id,
        status=job.status,
        title=job.title,
        target_duration_seconds=job.target_duration_seconds,
        video_url=video_url,
        thumbnail_url=thumbnail_url,
        error_code=job.error_code,
        created_at=job.created_at,
        started_at=job.started_at,
        completed_at=job.completed_at
    )
