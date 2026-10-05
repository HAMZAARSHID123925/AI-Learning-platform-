"""
ELARION AI Learning Platform — Backend
Module: app/shared/events.py

Purpose:
    Event bus for emitting domain events across modules via Redis Streams.
    Primary event: TestGraded (bridges Module 5 assessment to Module 6 adaptive loop).
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from app.config import get_settings
from app.shared.logging_config import get_logger
from app.shared.redis_client import get_redis_client

logger = get_logger(__name__)

TEST_GRADED_STREAM = "elarion:events:test_graded"


async def emit_test_graded_event(
    submission_id: uuid.UUID,
    test_id: uuid.UUID,
    student_id: uuid.UUID,
    attempt_number: int,
    overall_score: float,
    is_focused_retest: bool,
    skill_scores: list[dict[str, Any]]
) -> str | None:
    """
    Publishes the canonical TestGraded event into Redis Streams.
    Consumed by Module 6 (Adaptive Engine) for weakness analysis and remedial course generation.
    """
    settings = get_settings()
    stream_key = f"{settings.REDIS_KEY_PREFIX}:events:test_graded"

    event_payload = {
        "event_type": "test.graded",
        "version": "1.0",
        "emitted_at": datetime.now(timezone.utc).isoformat(),
        "submission_id": str(submission_id),
        "test_id": str(test_id),
        "student_id": str(student_id),
        "attempt_number": attempt_number,
        "overall_score": float(overall_score),
        "is_focused_retest": is_focused_retest,
        "skill_scores": [
            {
                "skill_id": str(s["skill_id"]),
                "score": float(s["score"]),
                "max_score": float(s.get("max_score", 1.0))
            }
            for s in skill_scores
        ]
    }

    try:
        redis = get_redis_client()
        dedup_key = f"{settings.REDIS_KEY_PREFIX}:events:test_graded:published:{submission_id}"
        msg_id = await redis.eval(
            "local previous=redis.call('get',KEYS[2]); if previous then return previous end; local id=redis.call('xadd',KEYS[1],'*','data',ARGV[1]); redis.call('set',KEYS[2],id); return id",
            2, stream_key, dedup_key, json.dumps(event_payload)
        )
        logger.info(
            "test_graded_event_emitted",
            stream=stream_key,
            msg_id=msg_id,
            submission_id=str(submission_id),
            student_id=str(student_id),
            overall_score=overall_score
        )
        return str(msg_id)
    except Exception as e:
        logger.error("failed_to_emit_test_graded_event", stream=stream_key, error=str(e))
        raise RuntimeError("Assessment event delivery failed") from e


async def publish_graded_outbox(db, submission_id):
    from sqlalchemy import select
    from app.modules.module5_assessment.models import TestGradedOutbox
    row=(await db.execute(select(TestGradedOutbox).where(TestGradedOutbox.submission_id==submission_id,TestGradedOutbox.published_at.is_(None)).with_for_update(skip_locked=True))).scalar_one_or_none()
    if row is None:return False
    await emit_test_graded_event(**row.payload)
    row.published_at=datetime.now(timezone.utc)
    await db.commit()
    return True

async def dispatch_pending_graded_events(db, limit=20):
    from sqlalchemy import select
    from app.modules.module5_assessment.models import TestGradedOutbox
    ids=(await db.execute(select(TestGradedOutbox.submission_id).where(TestGradedOutbox.published_at.is_(None)).order_by(TestGradedOutbox.created_at).limit(limit))).scalars().all()
    for sid in ids:
        try:await publish_graded_outbox(db,sid)
        except Exception as exc:
            await db.rollback()
            logger.warning('graded_event_outbox_pending',submission_id=str(sid),error_type=type(exc).__name__)
