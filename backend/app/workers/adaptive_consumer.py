"""
ELARION AI Learning Platform — Backend
Module: app/workers/adaptive_consumer.py

Purpose:
    Redis Streams consumer for Module 6 — Adaptive Learning Engine.
    Listens to 'elarion:events:test_graded'.
    When a student submits a test:
      1. Evaluates skill scores against WEAKNESS_THRESHOLD (0.60).
      2. If weak: creates WeaknessFlag, locks downstream lessons, and generates
         a tailored written remedial course in Markdown via Claude API.
      3. If passing: resolves active WeaknessFlag and unlocks downstream lessons.
"""

from __future__ import annotations

import asyncio
import json
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import AsyncSessionLocal
from app.modules.module1_auth.models import User
from app.modules.module2_content.models import Course
from app.modules.module4_experience.models import Enrollment
from app.modules.module5_assessment.models import Submission, SubmissionStatus
from app.modules.module6_adaptive.models import WeaknessFlag, RemediationPlan, WeaknessStatus
from app.modules.module6_adaptive.services.path_gating_service import (
    lock_lessons_for_weakness,
    unlock_lessons_if_clear,
)
from app.modules.module6_adaptive.services.remedial_course_service import generate_student_remedial_course
from app.modules.module6_adaptive.services.weakness_detector import evaluate_submission_skills_for_weaknesses
from app.shared.logging_config import get_logger
from app.shared.redis_client import get_redis_client

logger = get_logger(__name__)

import socket
CONSUMER_GROUP = "module6-adaptive"
CONSUMER_NAME = f"adaptive-worker-{socket.gethostname()}-{uuid.uuid4().hex[:6]}"


async def process_test_graded_event(event_payload: dict, db: AsyncSession) -> dict:
    """
    Direct event processing logic.
    Callable by background Redis Streams consumer AND test runners.
    """
    submission_id = uuid.UUID(event_payload["submission_id"])
    student_id = uuid.UUID(event_payload["student_id"])

    submission = await db.get(Submission, submission_id)
    if not submission:
        logger.error("submission_not_found_for_event", submission_id=str(submission_id))
        return {"status": "error", "reason": "Submission not found"}

    if submission.student_id != student_id or submission.status != SubmissionStatus.graded or str(submission.test_id) != event_payload.get("test_id"):
        return {"status": "error", "reason": "Event does not match a graded submission"}
    # 1. Run weakness detector
    new_flags, resolved_flags = await evaluate_submission_skills_for_weaknesses(submission, db)

    # 2. For newly detected or recurring weaknesses: generate tailored written remedial course and lock content
    # Replays also repair gating if a previous attempt failed after plan persistence.
    active_flags = list((await db.execute(select(WeaknessFlag).where(WeaknessFlag.student_id == student_id, WeaknessFlag.submission_id == submission.id, WeaknessFlag.status == WeaknessStatus.active))).scalars())
    work_flags = {flag.id: flag for flag in [*new_flags, *active_flags]}
    for flag in work_flags.values():
        # Generate custom written course
        await generate_student_remedial_course(db, student_id, flag, submission)
        # Lock downstream lessons requiring this weak skill
        await lock_lessons_for_weakness(db, student_id, flag.skill_id)

    # 3. For resolved weaknesses: unlock downstream lessons
    for flag in resolved_flags:
        await unlock_lessons_if_clear(db, student_id, flag.skill_id)

    logger.info(
        "test_graded_event_processed",
        submission_id=str(submission_id),
        new_weaknesses=len(new_flags),
        resolved_weaknesses=len(resolved_flags)
    )

    return {
        "status": "success",
        "new_weaknesses_count": len(new_flags),
        "resolved_weaknesses_count": len(resolved_flags)
    }


async def run_consumer_loop(poll_delay: float = 1.0):
    """
    Redis Streams consumer loop for deployment containers.
    """
    settings = get_settings()
    stream_key = f"{settings.REDIS_KEY_PREFIX}:events:test_graded"
    redis = get_redis_client()

    # Ensure stream and consumer group exist
    try:
        await redis.xgroup_create(stream_key, CONSUMER_GROUP, id="0", mkstream=True)
    except Exception as exc:
        if "BUSYGROUP" not in str(exc):
            raise

    logger.info("adaptive_consumer_started", stream=stream_key, group=CONSUMER_GROUP)

    while True:
        try:
            from app.shared.events import dispatch_pending_graded_events
            async with AsyncSessionLocal() as outbox_session:
                await dispatch_pending_graded_events(outbox_session)
            # Recover pending messages idle for > 5 minutes (300000 ms)
            try:
                claim_res = await redis.xautoclaim(stream_key, CONSUMER_GROUP, CONSUMER_NAME, 300000, "0-0", count=5)
                claimed_msgs = claim_res[1] if isinstance(claim_res, (tuple, list)) and len(claim_res) >= 2 else []
                if claimed_msgs:
                    for msg_id, data in claimed_msgs:
                        try:
                            payload_raw = data.get("data")
                            if payload_raw:
                                event = json.loads(payload_raw)
                                async with AsyncSessionLocal() as session:
                                    await process_test_graded_event(event, session)
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
                                    await process_test_graded_event(event, session)
                            # Acknowledge processed message
                            await redis.xack(stream_key, CONSUMER_GROUP, msg_id)
                        except Exception as e:
                            logger.error("error_processing_stream_msg", msg_id=msg_id, error=str(e))

        except Exception as e:
            logger.error("adaptive_consumer_loop_error", error=str(e))
            await asyncio.sleep(poll_delay)


if __name__ == "__main__":
    asyncio.run(run_consumer_loop())
