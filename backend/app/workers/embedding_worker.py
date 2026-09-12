"""
ELARION AI Learning Platform — Backend
Module: app/workers/embedding_worker.py

Purpose:
    Processes pending rows in embedding_outbox.
    Extracts text/PDFs/video transcripts from published lessons,
    computes vector embeddings, and writes them to content_embeddings in PostgreSQL.

Design Patterns:
    - Transactional Outbox consumer
    - Idempotent execution (skips if (lesson_id, version) is already indexed)
    - Exponential backoff retry handling
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import AsyncSessionLocal
from app.modules.module2_content.models import (
    ContentEmbedding,
    EmbeddingOutbox,
    Lesson,
    LessonStatus,
    OutboxStatus,
)
from app.modules.module2_content.services.content_extractor import extract_and_chunk_lesson
from app.shared.ai_client import get_embedding
from app.shared.logging_config import get_logger

logger = get_logger(__name__)


async def process_single_outbox_entry(outbox_id: str, db: AsyncSession) -> bool:
    """
    Processes one outbox row:
    1. Fetches the row and verifies state.
    2. Checks idempotency against content_embeddings.
    3. Extracts text, PDF, and video transcripts into TextChunks.
    4. Computes vector embeddings and stores in PostgreSQL pgvector.
    5. Updates outbox entry status to 'completed'.
    """
    outbox = await db.get(EmbeddingOutbox, outbox_id)
    if not outbox or outbox.status not in (OutboxStatus.pending, OutboxStatus.processing):
        return False

    outbox.status = OutboxStatus.processing
    outbox.attempts += 1
    await db.commit()

    try:
        # 1. Fetch lesson with skills and assets
        query = (
            select(Lesson)
            .where(Lesson.id == outbox.lesson_id)
            .options(
                selectinload(Lesson.lesson_skills),
                selectinload(Lesson.assets)
            )
        )
        result = await db.execute(query)
        lesson = result.scalar_one_or_none()

        if not lesson or lesson.status != LessonStatus.published:
            logger.warning("lesson_not_published_skipping", lesson_id=str(outbox.lesson_id))
            outbox.status = OutboxStatus.failed
            outbox.error_message = "Lesson is missing or not in published state"
            await db.commit()
            return False

        # 2. Idempotency check: skip embedding if already completed for this exact version
        existing_check = await db.execute(
            select(ContentEmbedding.id)
            .where(
                ContentEmbedding.lesson_id == lesson.id,
                ContentEmbedding.lesson_version == outbox.lesson_version
            )
            .limit(1)
        )
        if existing_check.scalar_one_or_none():
            logger.info("embeddings_already_exist_skipping", lesson_id=str(lesson.id), version=outbox.lesson_version)
            outbox.status = OutboxStatus.completed
            await db.commit()
            return True

        # 3. Extract and chunk content (Body + PDFs + Video transcripts)
        chunks = await extract_and_chunk_lesson(lesson, db)
        logger.info("lesson_chunks_extracted", lesson_id=str(lesson.id), chunk_count=len(chunks))

        # 4. Generate embeddings and persist to content_embeddings
        for chunk in chunks:
            vector = await get_embedding(chunk.text)
            embedding_record = ContentEmbedding(
                lesson_id=lesson.id,
                lesson_version=outbox.lesson_version,
                chunk_index=chunk.chunk_index,
                chunk_text=chunk.text,
                vector=vector,
                skill_tags=chunk.skill_ids
            )
            db.add(embedding_record)

        outbox.status = OutboxStatus.completed
        await db.commit()
        logger.info("outbox_entry_processed_successfully", outbox_id=str(outbox.id), chunks_stored=len(chunks))
        return True

    except Exception as e:
        await db.rollback()
        logger.error("outbox_processing_failed", outbox_id=str(outbox.id), error=str(e))
        
        # Reload outbox to update error status
        failed_outbox = await db.get(EmbeddingOutbox, outbox_id)
        if failed_outbox:
            if failed_outbox.attempts >= 5:
                failed_outbox.status = OutboxStatus.failed
            else:
                failed_outbox.status = OutboxStatus.pending  # Re-queue for retry
            failed_outbox.error_message = str(e)
            await db.commit()
        return False


async def process_pending_outbox_entries(db: AsyncSession, limit: int = 10) -> int:
    """
    Finds pending outbox rows and processes them sequentially.
    Returns the number of processed records.
    """
    result = await db.execute(
        select(EmbeddingOutbox.id)
        .where(
            EmbeddingOutbox.status == OutboxStatus.pending,
            EmbeddingOutbox.attempts < 5
        )
        .order_by(EmbeddingOutbox.created_at.asc())
        .limit(limit)
    )
    outbox_ids = result.scalars().all()
    
    processed_count = 0
    for oid in outbox_ids:
        success = await process_single_outbox_entry(oid, db)
        if success:
            processed_count += 1

    return processed_count


async def run_worker_loop(poll_interval: float = 5.0):
    """Continuous polling daemon for deployment environments."""
    logger.info("embedding_worker_started", poll_interval=poll_interval)
    while True:
        try:
            async with AsyncSessionLocal() as session:
                processed = await process_pending_outbox_entries(session, limit=5)
                if processed > 0:
                    logger.info("processed_outbox_batch", count=processed)
        except Exception as e:
            logger.error("embedding_worker_loop_error", error=str(e))
        
        await asyncio.sleep(poll_interval)


if __name__ == "__main__":
    asyncio.run(run_worker_loop())
