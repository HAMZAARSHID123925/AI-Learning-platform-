"""
ELARION AI Learning Platform — Backend
Module: app/modules/module4_experience/services/sse_service.py

Purpose:
    Server-Sent Events (SSE) streaming engine.
    Yields real-time events to connected clients via Redis Pub/Sub without polling.
"""

from __future__ import annotations

import asyncio
import json
import uuid
from collections.abc import AsyncGenerator

from app.modules.module4_experience.services.notification_service import get_notification_channel
from app.shared.logging_config import get_logger
from app.shared.redis_client import get_redis_client

logger = get_logger(__name__)


async def student_event_generator(student_id: uuid.UUID) -> AsyncGenerator[str, None]:
    """
    Subscribes to student-specific Redis Pub/Sub channel and yields
    text/event-stream formatted messages.
    Sends periodic comment pings (: ping\\n\\n) to keep HTTP proxy connections active.
    """
    redis = get_redis_client()
    pubsub = redis.pubsub()
    channel = get_notification_channel(student_id)

    await pubsub.subscribe(channel)
    logger.info("sse_client_connected", student_id=str(student_id), channel=channel)

    # Yield initial connected event
    initial_payload = json.dumps({"status": "connected", "student_id": str(student_id)})
    yield f"event: connect\ndata: {initial_payload}\n\n"

    try:
        while True:
            try:
                # Wait for message with 15-second timeout for keep-alive ping
                message = await asyncio.wait_for(
                    pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0),
                    timeout=15.0
                )
                if message and message.get("type") == "message":
                    raw_data = message.get("data")
                    yield f"event: notification\ndata: {raw_data}\n\n"
            except asyncio.TimeoutError:
                # Keep-alive heartbeat comment frame
                yield ": ping\n\n"
            except asyncio.CancelledError:
                break
    except Exception as exc:
        logger.warning("sse_stream_error", error=str(exc), student_id=str(student_id))
    finally:
        await pubsub.unsubscribe(channel)
        await pubsub.close()
        logger.info("sse_client_disconnected", student_id=str(student_id))
