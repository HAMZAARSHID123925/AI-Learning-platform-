"""
ELARION AI Learning Platform — Backend
Module: app/modules/module2_content/services/content_extractor.py

Purpose:
    Extracts text and video lecture transcripts from lesson assets and
    breaks them down into semantic, overlapping chunks for vector embedding.

Pipelines Supported:
    1. Lesson Markdown Body Text
    2. PDF Documents (via PyPDF / pdfplumber)
    3. Video Lecture Ingestion & Transcription (via Whisper API & S3 audio streams)
"""

from __future__ import annotations

import io
import re
import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.module2_content.models import AssetType, ContentAsset, Lesson
from app.shared.ai_client import transcribe_audio_bytes
from app.shared.logging_config import get_logger
from app.shared.s3_client import download_file_bytes

logger = get_logger(__name__)


@dataclass
class TextChunk:
    text: str
    skill_ids: list[uuid.UUID]
    source_type: str
    chunk_index: int


def chunk_text(text: str, max_tokens: int = 512, overlap: int = 50) -> list[str]:
    """
    Sliding window word/token chunker.
    Splits text into chunks of ~max_tokens with an overlap to preserve context across boundaries.
    """
    clean_text = re.sub(r"\s+", " ", text).strip()
    if not clean_text:
        return []

    words = clean_text.split(" ")
    if len(words) <= max_tokens:
        return [clean_text]

    chunks = []
    step = max_tokens - overlap
    for i in range(0, len(words), step):
        chunk_words = words[i : i + max_tokens]
        chunk_str = " ".join(chunk_words).strip()
        if chunk_str:
            chunks.append(chunk_str)
        if i + max_tokens >= len(words):
            break

    return chunks


async def extract_pdf_text(storage_key: str) -> str:
    """
    Downloads PDF from S3/MinIO and extracts readable text.
    """
    try:
        raw_bytes = await download_file_bytes(storage_key)
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(raw_bytes))
            pages = [page.extract_text() or "" for page in reader.pages]
            return "\n\n".join(p.strip() for p in pages if p.strip())
        except Exception as e:
            logger.warning("pypdf_extraction_fallback", error=str(e))
            # Fallback decode
            return raw_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        logger.error("pdf_download_extract_failed", storage_key=storage_key, error=str(e))
        return ""


async def extract_video_transcript(asset: ContentAsset) -> str:
    """
    Video Ingestion & Transcription Pipeline:
    1. Downloads video/audio file from S3/MinIO.
    2. Invokes Whisper / Speech-to-Text to produce timestamped transcript text.
    """
    try:
        logger.info("transcribing_video_asset", asset_id=str(asset.id), file=asset.original_filename)
        audio_bytes = await download_file_bytes(asset.storage_key)
        transcript = await transcribe_audio_bytes(audio_bytes, filename=asset.original_filename)
        return transcript
    except Exception as e:
        logger.error("video_transcription_failed", asset_id=str(asset.id), error=str(e))
        return f"[Video Lecture: {asset.original_filename} - Audio transcription unavailable]"


async def extract_and_chunk_lesson(lesson: Lesson, db: AsyncSession) -> list[TextChunk]:
    """
    Extracts all textual material (Markdown text, PDF documents, and Video transcripts)
    belonging to a lesson and generates indexed TextChunks with associated skill IDs.
    """
    # Fetch skill IDs tagged to this lesson
    skill_ids = [ls.skill_id for ls in lesson.lesson_skills]
    all_chunks: list[TextChunk] = []
    chunk_counter = 0

    # 1. Primary lesson body text
    if lesson.body_text and lesson.body_text.strip():
        text_slices = chunk_text(lesson.body_text, max_tokens=512, overlap=50)
        for s in text_slices:
            all_chunks.append(TextChunk(
                text=s,
                skill_ids=skill_ids,
                source_type="lesson_body",
                chunk_index=chunk_counter
            ))
            chunk_counter += 1

    # 2. Extract from attached content assets
    # Eagerly load or query assets
    asset_query = await db.execute(
        select(ContentAsset).where(ContentAsset.lesson_id == lesson.id)
    )
    assets = asset_query.scalars().all()

    for asset in assets:
        extracted_text = ""
        source_type = asset.asset_type.value

        if asset.asset_type == AssetType.pdf:
            extracted_text = await extract_pdf_text(asset.storage_key)
        elif asset.asset_type == AssetType.video:
            extracted_text = await extract_video_transcript(asset)

        if extracted_text:
            text_slices = chunk_text(extracted_text, max_tokens=512, overlap=50)
            for s in text_slices:
                all_chunks.append(TextChunk(
                    text=s,
                    skill_ids=skill_ids,
                    source_type=source_type,
                    chunk_index=chunk_counter
                ))
                chunk_counter += 1

    return all_chunks
