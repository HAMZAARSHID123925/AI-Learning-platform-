"""
ELARION AI Learning Platform — Backend
Module: app/workers/video_generation_consumer.py

Purpose:
    M3.1 — Video Generation Job Worker Skeleton.
    Listens to 'elarion:video_generation:jobs'.
    Validates job, transitions queued -> planning, and stops.
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
    """
    Processes the video generation job ID.
    Transitions queued -> planning.
    """
    job_id_str = event_payload.get("job_id")
    if not job_id_str:
        logger.error("invalid_video_job_event_payload", payload=event_payload)
        return {"status": "error", "reason": "No job_id provided"}

    try:
        job_id = uuid.UUID(job_id_str)
    except ValueError:
        logger.error("invalid_video_job_id_format", job_id=job_id_str)
        return {"status": "error", "reason": "Invalid job_id format"}

    job = await db.get(VideoGenerationJob, job_id)
    if not job:
        logger.error("video_job_not_found", job_id=str(job_id))
        return {"status": "error", "reason": "Job not found"}

    if job.status != VideoJobStatus.queued:
        logger.warning("video_job_not_queued", job_id=str(job_id), current_status=job.status)
        return {"status": "skipped", "reason": f"Job is not queued (current status: {job.status})"}

    logger.info("video_job_started", job_id=str(job_id))

    try:
        # Transition to planning
        job.status = VideoJobStatus.planning
        job.started_at = datetime.now(timezone.utc)
        await db.commit()
        logger.info("video_job_transitioned_to_planning", job_id=str(job_id))
        
        # M3.2: Generate script and scenes
        await generate_personalized_script_and_scenes(job.id, db)

        # M3.4: Generate TTS audio for each scene
        await generate_scene_audio(job.id, db)

        # M3.5: Render final MP4 via Remotion
        await render_video(job.id, db)

        return {"status": "success"}

    except Exception as e:
        logger.error("video_job_processing_failed", job_id=str(job_id), error=str(e))
        job.status = VideoJobStatus.failed
        job.error_message = "Unexpected error during job initialization"
        job.retry_count += 1
        await db.commit()
        return {"status": "error", "reason": str(e)}


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
    except Exception:
        pass  # Group already exists

    logger.info("video_generation_consumer_started", stream=stream_key, group=CONSUMER_GROUP)

    while True:
        try:
            # Recover pending messages idle for > 5 minutes (300000 ms)
            try:
                # XAUTOCLAIM syntax: stream, group, consumer, min_idle_time, start_id, count
                # Returns (next_start_id, [messages])
                claim_res = await redis.xautoclaim(stream_key, CONSUMER_GROUP, CONSUMER_NAME, 300000, "0-0", count=5)
                # handle both variations of xautoclaim return signature in aioredis/redis-py
                claimed_msgs = claim_res[1] if isinstance(claim_res, tuple) and len(claim_res) >= 2 else []
                if claimed_msgs:
                    for msg_id, data in claimed_msgs:
                        try:
                            payload_raw = data.get("data")
                            if payload_raw:
                                event = json.loads(payload_raw)
                                async with AsyncSessionLocal() as session:
                                    await process_video_generation_job(event, session)
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
                                    await process_video_generation_job(event, session)
                            # Acknowledge processed message
                            await redis.xack(stream_key, CONSUMER_GROUP, msg_id)
                        except Exception as e:
                            logger.error("error_processing_stream_msg", msg_id=msg_id, error=str(e))

        except Exception as e:
            logger.error("video_generation_consumer_loop_error", error=str(e))
            await asyncio.sleep(poll_delay)


if __name__ == "__main__":
    asyncio.run(run_consumer_loop())
