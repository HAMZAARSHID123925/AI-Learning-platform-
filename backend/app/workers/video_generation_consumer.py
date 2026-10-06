"""
ELARION AI Learning Platform — Backend
Module: app/workers/video_generation_consumer.py

Purpose:
    Personalized video worker with renewable ownership and resumable stages.
    Listens to 'elarion:video_generation:jobs'.
    Processes script, storyboard, TTS, Remotion rendering and private object upload.
"""

from __future__ import annotations

import asyncio
import json
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import AsyncSessionLocal
from app.modules.module6_adaptive.models import VideoGenerationJob, VideoJobStatus
from app.modules.module1_auth.models import User
from app.modules.module2_content.models import Course
from app.modules.module4_experience.models import Enrollment
from app.modules.module5_assessment.models import Submission
from app.modules.module6_adaptive.models import WeaknessFlag, RemediationPlan
from app.modules.module6_adaptive.services.script_generation_service import generate_personalized_script_and_scenes
from app.modules.module6_adaptive.services.audio_generation_service import generate_scene_audio
from app.modules.module6_adaptive.services.render_service import render_video
from app.shared.logging_config import get_logger
from app.shared.redis_client import get_redis_client

logger = get_logger(__name__)

import socket
CONSUMER_GROUP = "video-generation-group"
CONSUMER_NAME = f"video-worker-{socket.gethostname()}-{uuid.uuid4().hex[:6]}"


async def process_video_generation_job(event_payload: dict, db: AsyncSession) -> dict:
    """Renewable broker ownership does not hold a DB transaction during rendering."""
    from contextlib import suppress
    try:job_id=uuid.UUID(str(event_payload.get('job_id')))
    except (ValueError,TypeError):return {'status':'error','reason':'Invalid job ID'}
    redis=get_redis_client()
    key=f"{get_settings().REDIS_KEY_PREFIX}:video_generation:lease:{job_id}"
    owner=uuid.uuid4().hex
    if not await redis.set(key,owner,nx=True,ex=120):return {'status':'busy'}
    async def renew():
        from redis.exceptions import ConnectionError as RedisConnectionError, TimeoutError as RedisTimeoutError
        loop = asyncio.get_running_loop()
        # Retry transient broker failures only within the last confirmed lease.
        deadline = loop.time() + 110
        delay = 30
        while True:
            await asyncio.sleep(delay)
            started = loop.time()
            remaining = deadline - started
            if remaining <= 0:
                raise RuntimeError('Video worker lease expired')
            try:
                refreshed = await asyncio.wait_for(redis.eval(
                    "if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('expire',KEYS[1],120) else return 0 end",
                    1, key, owner), timeout=min(10, remaining))
            except (RedisConnectionError, RedisTimeoutError, asyncio.TimeoutError):
                logger.warning('video_lease_renew_retry')
                delay = min(5, max(0, deadline - loop.time()))
                continue
            if not refreshed:
                raise RuntimeError('Video worker lease lost')
            deadline = started + 110
            delay = 30
    heartbeat=asyncio.create_task(renew())
    processing=asyncio.create_task(_process_owned_job(job_id,db))
    try:
        done,_=await asyncio.wait((heartbeat,processing),return_when=asyncio.FIRST_COMPLETED)
        if heartbeat in done:
            processing.cancel()
            with suppress(asyncio.CancelledError):await processing
            raise RuntimeError('Video worker ownership unavailable')
        return await processing
    finally:
        heartbeat.cancel()
        with suppress(asyncio.CancelledError, Exception):await heartbeat
        try:
            await redis.eval("if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end",1,key,owner)
        except Exception as exc:
            # An unavailable broker cannot invalidate an already persisted ready job.
            logger.warning('video_lease_release_failed',error_type=type(exc).__name__)

async def _process_owned_job(job_id: uuid.UUID, db: AsyncSession) -> dict:
    job=await db.get(VideoGenerationJob,job_id)
    if not job:return {'status':'error','reason':'Job not found'}
    if job.status==VideoJobStatus.ready:return {'status':'skipped','reason':'Already ready'}
    if job.status==VideoJobStatus.failed and job.retry_count>=3:return {'status':'error','reason':'Retry limit reached'}
    stage='planning'
    try:
        if job.status in (VideoJobStatus.rendering,VideoJobStatus.uploading):job.status=VideoJobStatus.failed
        if job.status==VideoJobStatus.failed:job.status=VideoJobStatus.queued
        if job.status==VideoJobStatus.queued:
            job.status=VideoJobStatus.planning
            job.error_code=None
            job.error_message=None
            job.started_at=job.started_at or datetime.now(timezone.utc)
            await db.commit()
        if job.status in (VideoJobStatus.planning,VideoJobStatus.scripting):
            if job.scene_json and job.script_json:
                if job.status==VideoJobStatus.planning:job.status=VideoJobStatus.scripting
                job.status=VideoJobStatus.storyboard_ready
                await db.commit()
            else:
                stage='script'
                await generate_personalized_script_and_scenes(job.id,db)
        if job.status in (VideoJobStatus.storyboard_ready,VideoJobStatus.assets_preparing,VideoJobStatus.audio_generating):
            stage='audio'
            await generate_scene_audio(job.id,db)
        if job.status==VideoJobStatus.audio_ready:
            stage='render_upload'
            await render_video(job.id,db)
        if job.status!=VideoJobStatus.ready:raise RuntimeError('Video pipeline did not reach ready')
        return {'status':'success'}
    except Exception as exc:
        await db.rollback()
        job=await db.get(VideoGenerationJob,job_id)
        # Services already persist the specific failure; do not replace it with
        # just the exception type, which hides actionable rendering diagnostics.
        detail = job.error_message if job.status == VideoJobStatus.failed and job.error_message else stage+': '+type(exc).__name__
        import re
        detail = re.sub(r'https?://[^\s]+', '[URL REDACTED]', detail)
        detail = re.sub(r'(?i)Bearer\s+\S+|sk-[A-Za-z0-9_*\-]+', '[CREDENTIAL REDACTED]', detail)
        job.status=VideoJobStatus.failed
        job.error_code='VIDEO_'+stage.upper()+'_FAILED'
        job.error_message=detail[:2000]
        job.retry_count+=1
        await db.commit()
        logger.error('video_job_failed',job_id=str(job_id),stage=stage,error_type=type(exc).__name__,error_detail=job.error_message)
        return {'status':'error','reason':job.error_code}


async def run_consumer_loop(poll_delay: float = 1.0):
    """
    Redis Streams consumer loop for deployment containers.
    """
    settings = get_settings()
    stream_key = f"{settings.REDIS_KEY_PREFIX}:video_generation:jobs"
    redis = get_redis_client()

    # Ensure stream and consumer group exist
    try:
        await redis.xgroup_create(stream_key, CONSUMER_GROUP, id="0", mkstream=True)
    except Exception as exc:
        if "BUSYGROUP" not in str(exc):
            raise

    logger.info("video_generation_consumer_started", stream=stream_key, group=CONSUMER_GROUP)

    while True:
        try:
            from app.modules.module6_adaptive.services.video_job_service import dispatch_pending_video_jobs
            async with AsyncSessionLocal() as outbox_session:
                await dispatch_pending_video_jobs(outbox_session)
            # Recover pending messages idle for > 5 minutes (300000 ms)
            try:
                # XAUTOCLAIM syntax: stream, group, consumer, min_idle_time, start_id, count
                # Returns (next_start_id, [messages])
                claim_res = await redis.xautoclaim(stream_key, CONSUMER_GROUP, CONSUMER_NAME, 300000, "0-0", count=5)
                # handle both variations of xautoclaim return signature in aioredis/redis-py
                claimed_msgs = claim_res[1] if isinstance(claim_res, (tuple,list)) and len(claim_res) >= 2 else []
                if claimed_msgs:
                    for msg_id, data in claimed_msgs:
                        try:
                            payload_raw = data.get("data")
                            if payload_raw:
                                event = json.loads(payload_raw)
                                async with AsyncSessionLocal() as session:
                                    result = await process_video_generation_job(event, session)
                                    if result.get("status") == "busy": continue
                            await redis.xack(stream_key, CONSUMER_GROUP, msg_id)
                        except Exception as e:
                            logger.error("error_processing_claimed_msg", msg_id=msg_id, error=str(e))
            except Exception as e:
                logger.error("error_claiming_pending_messages", error=str(e))

            # Read new messages for this consumer group
            entries = await redis.xreadgroup(
                CONSUMER_GROUP,
                CONSUMER_NAME,
                {stream_key: ">"},
                count=5,
                block=2000
            )

            if entries:
                for stream, messages in entries:
                    for msg_id, data in messages:
                        try:
                            payload_raw = data.get("data")
                            if payload_raw:
                                event = json.loads(payload_raw)
                                async with AsyncSessionLocal() as session:
                                    result = await process_video_generation_job(event, session)
                                    if result.get("status") == "busy": continue
                            # Acknowledge processed message
                            await redis.xack(stream_key, CONSUMER_GROUP, msg_id)
                        except Exception as e:
                            logger.error("error_processing_stream_msg", msg_id=msg_id, error=str(e))

        except Exception as e:
            logger.error("video_generation_consumer_loop_error", error=str(e))
            await asyncio.sleep(poll_delay)


if __name__ == "__main__":
    asyncio.run(run_consumer_loop())
