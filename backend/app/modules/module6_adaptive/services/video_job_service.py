"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/services/video_job_service.py

Purpose:
    M3.1 — Personalized Video Generation Agent Async Job Foundation.
    Provides secure job creation, deduplication, and context building.
"""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError

from app.modules.module5_assessment.models import Submission, Test
from app.modules.module6_adaptive.models import VideoGenerationJob, VideoJobStatus, WeaknessFlag, WeaknessStatus
from app.modules.shared_models.skill_taxonomy import SkillTaxonomy
from app.shared.exceptions import BusinessRuleError, NotFoundError
from app.shared.redis_client import get_redis_client
from app.config import get_settings
import json

async def build_video_generation_context(db: AsyncSession, weakness_flag: WeaknessFlag) -> dict[str, Any]:
    """
    Builds grounded context from lessons, submissions, and skills to prevent Hallucinations.
    """
    # 1. Load skill
    skill = await db.get(SkillTaxonomy, weakness_flag.skill_id)
    
    # 2. Load submission and test
    query = (
        select(Submission)
        .where(Submission.id == weakness_flag.submission_id)
        .options(selectinload(Submission.test).selectinload(Test.questions))
    )
    result = await db.execute(query)
    submission = result.scalar_one_or_none()
    
    if not submission or not skill:
        raise BusinessRuleError("Incomplete data for weakness flag.")

    student_mistakes = []
    # Find mistakes related to this skill
    answers = submission.answers or {}
    for q in submission.test.questions:
        if q.skill_id == skill.id:
            ans = answers.get(str(q.id))
            is_correct = False # We could calculate or use skill_scores, but simplified context for M3.1:
            if ans:
                student_mistakes.append({
                    "question_id": str(q.id),
                    "question_prompt": q.prompt,
                    "selected_answer": ans.get("selected_option_id") or ans.get("text_answer"),
                    "explanation": q.rubric
                })

    return {
        "student_id": str(weakness_flag.student_id),
        "course_id": str(submission.test.course_id),
        "submission_id": str(submission.id),
        "weakness_flag_id": str(weakness_flag.id),
        "weak_skill": {
            "id": str(skill.id),
            "name": skill.name,
            "description": skill.description
        },
        "student_mistakes": student_mistakes,
        "target_duration_seconds": 180,  # 3 minutes default
    }

async def create_video_generation_job(
    db: AsyncSession,
    student_id: uuid.UUID,
    weakness_flag_id: uuid.UUID
) -> VideoGenerationJob:
    """
    Securely creates a VideoGenerationJob, preventing duplicates, and enqueues it.
    """
    # 1. Verify flag
    flag = await db.get(WeaknessFlag, weakness_flag_id)
    if not flag:
        raise NotFoundError("WeaknessFlag", weakness_flag_id)
    
    # 2. Verify ownership and status
    if flag.student_id != student_id:
        raise BusinessRuleError("You do not own this weakness flag.")
    if flag.status != WeaknessStatus.active:
        raise BusinessRuleError("Video jobs can only be created for active weaknesses.")

    # 3. Prevent duplicate active jobs (Idempotency)
    active_statuses = [
        VideoJobStatus.queued, VideoJobStatus.planning, VideoJobStatus.scripting,
        VideoJobStatus.audio_generating, VideoJobStatus.assets_preparing,
        VideoJobStatus.rendering, VideoJobStatus.uploading
    ]
    
    dup_query = select(VideoGenerationJob).where(
        VideoGenerationJob.student_id == student_id,
        VideoGenerationJob.weakness_flag_id == weakness_flag_id,
        VideoGenerationJob.status.in_(active_statuses)
    )
    dup_result = await db.execute(dup_query)
    existing_job = dup_result.scalar_one_or_none()
    
    if existing_job:
        return existing_job  # Idempotent return

    # 4. Resolve Context
    context = await build_video_generation_context(db, flag)

    # 5. Create Job
    job = VideoGenerationJob(
        student_id=student_id,
        course_id=uuid.UUID(context["course_id"]),
        submission_id=uuid.UUID(context["submission_id"]),
        weakness_flag_id=weakness_flag_id,
        skill_id=uuid.UUID(context["weak_skill"]["id"]),
        status=VideoJobStatus.queued,
        target_duration_seconds=context["target_duration_seconds"]
    )
    db.add(job)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        # A concurrent request created an active job and the partial unique index blocked this one.
        dup_result = await db.execute(dup_query)
        existing_job = dup_result.scalar_one_or_none()
        if existing_job:
            return existing_job
        raise BusinessRuleError("Failed to create video job due to concurrency error.")
    
    await db.refresh(job)

    # 6. Publish to Stream
    settings = get_settings()
    stream_key = f"{settings.REDIS_KEY_PREFIX}:video_generation:jobs"
    redis = get_redis_client()
    
    payload = {
        "job_id": str(job.id)
    }
    
    try:
        await redis.xadd(stream_key, {"data": json.dumps(payload)})
    except Exception as e:
        # If stream publish fails, we should probably mark the job as failed or rely on a retry sweeper
        job.status = VideoJobStatus.failed
        job.error_message = "Failed to enqueue job to Redis Stream"
        await db.commit()
        raise e

    return job
