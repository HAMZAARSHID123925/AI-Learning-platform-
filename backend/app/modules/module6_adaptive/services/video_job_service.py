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

from app.modules.module5_assessment.services.grading_service import grade_mcq_deterministic
from app.modules.module5_assessment.models import Submission, Test
from app.modules.module6_adaptive.models import VideoGenerationJob, VideoJobStatus, WeaknessFlag, WeaknessStatus
from app.modules.shared_models.skill_taxonomy import SkillTaxonomy
from app.modules.module2_content.models import Lesson, CourseModule
from app.modules.module6_adaptive.models import RemediationPlan, PlanStatus
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
            if ans and grade_mcq_deterministic(q, ans)[0] < float(q.max_score):
                student_mistakes.append({
                    "question_id": str(q.id),
                    "question_prompt": q.prompt,
                    "selected_answer": ans.get("selected_option_id") or ans.get("text_answer"),
                    "explanation": q.rubric
                })

    course_id = submission.test.course_id
    if course_id is None and submission.test.lesson_id:
        course_id = (await db.execute(select(CourseModule.course_id).join(Lesson, Lesson.module_id == CourseModule.id).where(Lesson.id == submission.test.lesson_id))).scalar_one_or_none()
    if course_id is None or submission.student_id != weakness_flag.student_id:
        raise BusinessRuleError("Invalid assessment ownership or course context")
    return {
        "student_id": str(weakness_flag.student_id),
        "course_id": str(course_id),
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
    weakness_flag_id: uuid.UUID,
    submission_id: uuid.UUID | None = None
) -> VideoGenerationJob:
    """
    Securely creates a VideoGenerationJob, preventing duplicates, and enqueues it.
    """
    # 1. Verify flag
    flag = (await db.execute(select(WeaknessFlag).where(WeaknessFlag.id == weakness_flag_id).with_for_update())).scalar_one_or_none()
    if not flag:
        raise NotFoundError("WeaknessFlag", weakness_flag_id)
    
    # 2. Verify ownership and status
    if flag.student_id != student_id:
        raise BusinessRuleError("You do not own this weakness flag.")
    if flag.status != WeaknessStatus.active:
        raise BusinessRuleError("Video jobs can only be created for active weaknesses.")

    if submission_id is not None and flag.submission_id != submission_id:
        raise BusinessRuleError("This weakness belongs to a different assessment")

    # 3. Prevent duplicate active jobs (Idempotency)
    active_statuses = [
        VideoJobStatus.queued, VideoJobStatus.planning, VideoJobStatus.scripting,
        VideoJobStatus.audio_generating, VideoJobStatus.assets_preparing,
        VideoJobStatus.rendering, VideoJobStatus.uploading,
        VideoJobStatus.storyboard_ready, VideoJobStatus.audio_ready
    ]
    
    dup_query = select(VideoGenerationJob).where(
        VideoGenerationJob.student_id == student_id,
        VideoGenerationJob.weakness_flag_id == weakness_flag_id,
        VideoGenerationJob.submission_id == flag.submission_id,
        VideoGenerationJob.status.in_(active_statuses)
    )
    dup_result = await db.execute(dup_query)
    existing_job = dup_result.scalar_one_or_none()
    
    if existing_job:
        return existing_job  # Idempotent return

    ready_query = select(VideoGenerationJob).where(VideoGenerationJob.weakness_flag_id == weakness_flag_id, VideoGenerationJob.student_id == student_id, VideoGenerationJob.submission_id == flag.submission_id, VideoGenerationJob.status == VideoJobStatus.ready).order_by(VideoGenerationJob.created_at.desc()).limit(1)
    ready = (await db.execute(ready_query)).scalar_one_or_none()
    if ready: return ready
    # Automatic result-page recovery must not restart a paid failed pipeline.
    failed = (await db.execute(select(VideoGenerationJob).where(VideoGenerationJob.weakness_flag_id == weakness_flag_id, VideoGenerationJob.student_id == student_id, VideoGenerationJob.submission_id == flag.submission_id, VideoGenerationJob.status == VideoJobStatus.failed).order_by(VideoGenerationJob.created_at.desc()).limit(1))).scalar_one_or_none()
    if failed:
        return failed
    plan = (await db.execute(select(RemediationPlan).where(RemediationPlan.weakness_flag_id == weakness_flag_id, RemediationPlan.student_id == student_id, RemediationPlan.status == PlanStatus.active, RemediationPlan.source_submission_id == flag.submission_id).order_by(RemediationPlan.created_at.desc()).limit(1))).scalar_one_or_none()
    if not plan or not plan.remedial_course_markdown:
        raise BusinessRuleError("An active written remediation plan is required")
    # 4. Resolve Context
    context = await build_video_generation_context(db, flag)

    job = VideoGenerationJob(
        student_id=student_id, remediation_plan_id=plan.id,
        course_id=uuid.UUID(context["course_id"]), submission_id=uuid.UUID(context["submission_id"]),
        weakness_flag_id=weakness_flag_id, skill_id=uuid.UUID(context["weak_skill"]["id"]),
        status=VideoJobStatus.queued, target_duration_seconds=context["target_duration_seconds"]
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

    await enqueue_video_job(db, job)
    return job


async def enqueue_video_job(db: AsyncSession, job: VideoGenerationJob) -> None:
    """Queued DB rows are the durable outbox; dispatch is safe to repeat."""
    settings = get_settings()
    stream = f"{settings.REDIS_KEY_PREFIX}:video_generation:jobs"
    key = f"{stream}:dispatched:{job.id}:{job.retry_count}"
    try:
        await get_redis_client().eval(
            "if redis.call('get',KEYS[2]) then return 0 end; local id=redis.call('xadd',KEYS[1],'*','data',ARGV[1]); redis.call('set',KEYS[2],id,'EX',300); return id",
            2, stream, key, json.dumps({"job_id": str(job.id)})
        )
    except Exception:
        # The worker dispatch sweep retries this committed row after reconnect.
        job.error_code = "VIDEO_ENQUEUE_PENDING"
        job.error_message = "Waiting for the video queue to reconnect"
        await db.commit()


async def dispatch_pending_video_jobs(db: AsyncSession) -> None:
    """DB state also recovers active work if broker pending data was lost.

    Never replay terminal historical jobs or disturb a healthy live owner.
    Pending-stream reclaim remains the ordinary restart path.
    """
    from datetime import datetime, timezone, timedelta
    from sqlalchemy import or_, and_, case
    jobs = (await db.execute(select(VideoGenerationJob).where(or_(
        VideoGenerationJob.status == VideoJobStatus.queued,
        and_(VideoGenerationJob.status.notin_([VideoJobStatus.queued, VideoJobStatus.ready, VideoJobStatus.failed]),
             VideoGenerationJob.updated_at < datetime.now(timezone.utc)-timedelta(minutes=5))
    )).order_by(case((VideoGenerationJob.status == VideoJobStatus.queued,0),else_=1),
                VideoGenerationJob.created_at).limit(20))).scalars().all()
    for job in jobs:
        if job.status != VideoJobStatus.queued:
            lease=f"{get_settings().REDIS_KEY_PREFIX}:video_generation:lease:{job.id}"
            if await get_redis_client().get(lease):continue
        await enqueue_video_job(db,job)


async def retry_video_generation_job(db: AsyncSession, student_id: uuid.UUID, job_id: uuid.UUID) -> VideoGenerationJob:
    """Explicit owned retry resumes checkpoints; refresh never restarts paid work."""
    from datetime import datetime, timezone
    job = await db.get(VideoGenerationJob, job_id)
    if not job or job.student_id != student_id:
        raise NotFoundError("VideoGenerationJob", job_id)
    flag = (await db.execute(select(WeaknessFlag).where(
        WeaknessFlag.id == job.weakness_flag_id).with_for_update())).scalar_one()
    await db.refresh(job)
    if flag.student_id != student_id or flag.submission_id != job.submission_id or flag.status != WeaknessStatus.active:
        raise BusinessRuleError("This video belongs to an earlier remediation lifecycle")
    if job.status == VideoJobStatus.ready:
        return job
    if job.status != VideoJobStatus.failed:
        age = (datetime.now(timezone.utc) - (job.started_at or job.created_at)).total_seconds()
        if age < 900:
            return job
        lease = f"{get_settings().REDIS_KEY_PREFIX}:video_generation:lease:{job.id}"
        if await get_redis_client().get(lease):
            return job
        job.status = VideoJobStatus.failed
    # Prevent concurrent retry/create from starting another job for the flag.
    other = (await db.execute(select(VideoGenerationJob.id).where(
        VideoGenerationJob.weakness_flag_id == flag.id,
        VideoGenerationJob.id != job.id,
        VideoGenerationJob.status.notin_([VideoJobStatus.ready, VideoJobStatus.failed])
    ).limit(1))).scalar_one_or_none()
    if other:
        raise BusinessRuleError("Another video for this weakness is already running")
    plan = await db.get(RemediationPlan, job.remediation_plan_id)
    if not plan or plan.student_id != student_id or plan.status != PlanStatus.active or plan.source_submission_id != job.submission_id:
        raise BusinessRuleError("The current written remediation is required")
    job.status = VideoJobStatus.queued
    job.error_code = None
    job.error_message = None
    job.started_at = datetime.now(timezone.utc)
    job.completed_at = None
    # Keep retry_count for audit history. One explicit retry permits one attempt.
    await db.commit()
    await enqueue_video_job(db, job)
    return job
