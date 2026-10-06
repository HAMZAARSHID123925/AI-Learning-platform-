"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/services/audio_generation_service.py

Purpose:
    M3.4 — Scene-level TTS audio generation.

    Flow:
        storyboard_ready (job in assets_preparing → audio_generating)
        ↓
        For each scene in scene_json:
            1. Validate narration text
            2. Check idempotency (existing clip with same text_hash)
            3. Synthesize TTS via tts_client
            4. Upload MP3 to object storage
            5. Measure real duration
            6. Reconcile with planned scene timing
        ↓
        Persist audio_manifest_json
        ↓
        Advance job → audio_ready

    Object storage key structure:
        personalized-video/{job_id}/audio/scene-{index:03d}.mp3

        WHY job_id-only in path?
            Avoids embedding student_id in object paths.
            Job IDs are non-guessable UUIDs. Bucket is private.
            Presigned URLs provide time-limited access.

    State machine:
        storyboard_ready → assets_preparing → audio_generating → audio_ready

    ⚠ DO NOT render video here.
    ⚠ DO NOT call Remotion here.
    ⚠ DO NOT advance beyond audio_ready.
"""

from __future__ import annotations

import asyncio
import base64
import math
import hashlib
import json
import uuid
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.modules.module6_adaptive.models import VideoGenerationJob, VideoJobStatus
from app.shared.logging_config import get_logger
from app.shared.s3_client import upload_verified_bytes, object_exists
from app.shared.tts_client import TTSSynthesisResult
from .pipeline_errors import VideoPipelineError, retry_transient
from app.shared.tts_client import synthesize_narration, sanitize_narration, _text_hash

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MAX_TTS_RETRIES = 1          # Per-scene retry limit
TOTAL_DURATION_TOLERANCE = 0.20  # ±20% from target_duration_seconds


# ---------------------------------------------------------------------------
# Audio manifest data structures
# ---------------------------------------------------------------------------

@dataclass
class SceneAudioClip:
    scene_id: str
    scene_index: int
    audio_key: str           # S3 object key
    audio_url: str           # S3 URL (not presigned — presign on demand)
    format: str              # "mp3"
    duration_seconds: float  # MEASURED real duration
    planned_duration_seconds: float
    render_duration_seconds: float   # measured audio plus bounded padding
    text_hash: str
    tts_provider: str
    tts_voice_id: str
    is_mock: bool
    status: str              # "ready" | "failed"
    error: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class AudioManifest:
    version: int
    job_id: str
    provider: str
    voice_id: str
    scenes: list[SceneAudioClip]
    total_planned_duration_seconds: float
    total_audio_duration_seconds: float
    total_render_duration_seconds: float
    duration_delta_ratio: float       # deviation from target
    duration_within_tolerance: bool
    is_mock: bool
    generated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------------------
# Scene timing reconciliation
# ---------------------------------------------------------------------------

def reconcile_scene_timing(
    planned_seconds: float,
    audio_seconds: float,
    padding_seconds: float,
) -> float:
    """
    Determine the render duration for a scene.

    Rule:
        render_duration = audio + bounded padding

    This ensures:
        - Audio never gets cut off
        - Visual hold/padding is added after narration ends
        - Planned duration is advisory; it never introduces a long silent hold
    """
    return round(audio_seconds + min(1.0, max(0.5, padding_seconds)), 3)


def validate_total_duration(
    target_seconds: float,
    actual_seconds: float,
    tolerance: float = TOTAL_DURATION_TOLERANCE,
) -> tuple[float, bool]:
    """
    Compare actual total audio duration against job target.

    Returns:
        (delta_ratio, within_tolerance)
        delta_ratio: fractional deviation (0.05 = 5% longer)
    """
    if target_seconds <= 0:
        return 0.0, True
    delta = abs(actual_seconds - target_seconds) / target_seconds
    return round(delta, 4), delta <= tolerance


# ---------------------------------------------------------------------------
# S3 object key builder
# ---------------------------------------------------------------------------

def _audio_object_key(job_id: uuid.UUID, scene_index: int) -> str:
    """
    Build a deterministic, private S3 key for a scene audio clip.
    Uses job_id only — no student PII in the path.
    """
    settings = get_settings()
    prefix = settings.TTS_AUDIO_OBJECT_PREFIX
    return f"{prefix}/{job_id}/audio/scene-{scene_index:03d}.mp3"


# ---------------------------------------------------------------------------
# Idempotency check
# ---------------------------------------------------------------------------

def _existing_clip_matches(
    clip: SceneAudioClip,
    new_text_hash: str,
) -> bool:
    """
    Returns True if an existing clip has the same text hash and is in 'ready' status.
    In this case we can safely reuse it without re-synthesizing.
    """
    return (
        clip.status == "ready"
        and clip.text_hash == new_text_hash
        and clip.format == "mp3" and bool(clip.audio_key)
        and math.isfinite(clip.duration_seconds) and 0 < clip.duration_seconds <= 600
        and math.isfinite(clip.render_duration_seconds)
        and clip.duration_seconds <= clip.render_duration_seconds <= clip.duration_seconds + 1.01
    )


# ---------------------------------------------------------------------------
# Main service
# ---------------------------------------------------------------------------

async def generate_scene_audio(
    job_id: uuid.UUID,
    db: AsyncSession,
) -> AudioManifest:
    """
    Generate TTS narration clips for all scenes in a VideoGenerationJob.

    Preconditions:
        - Job must be in storyboard_ready, assets_preparing, or audio_generating
        - scene_json must be populated with narration per scene

    Side effects:
        - Uploads MP3 files to object storage
        - Persists audio_manifest_json to job record
        - Advances job status to audio_ready

    Returns:
        The completed AudioManifest

    Raises:
        ValueError if job not found, wrong state, or scene_json missing
        RuntimeError if TTS fails after all retries
    """
    settings = get_settings()

    # ── Load job ─────────────────────────────────────────────────────────────
    job = await db.get(VideoGenerationJob, job_id)
    if not job:
        raise ValueError(f"VideoGenerationJob {job_id} not found")

    allowed_entry_states = {
        VideoJobStatus.storyboard_ready,
        VideoJobStatus.assets_preparing,
        VideoJobStatus.audio_generating,
    }
    if job.status not in allowed_entry_states:
        raise ValueError(
            f"Job {job_id} is in state '{job.status.value}' — cannot generate audio. "
            f"Expected one of: {[s.value for s in allowed_entry_states]}"
        )

    if not job.scene_json:
        raise ValueError(f"Job {job_id} has no scene_json — cannot generate audio.")

    scenes: list[dict] = job.scene_json.get("scenes", [])
    if not scenes:
        raise ValueError(f"Job {job_id} scene_json contains no scenes.")

    # ── Advance to assets_preparing then audio_generating ────────────────────
    if job.status == VideoJobStatus.storyboard_ready:
        job.status = VideoJobStatus.assets_preparing
        await db.commit()

    if job.status == VideoJobStatus.assets_preparing:
        job.status = VideoJobStatus.audio_generating
        await db.commit()

    logger.info("audio_generation_started", job_id=str(job_id), scene_count=len(scenes))

    # ── Load existing manifest for idempotency ───────────────────────────────
    existing_manifest: dict = job.audio_manifest_json or {}
    existing_clips: dict[str, SceneAudioClip] = {}
    if existing_manifest.get("scenes"):
        for c in existing_manifest["scenes"]:
            try:
                sc = SceneAudioClip(**c)
                existing_clips[sc.scene_id] = sc
            except (TypeError, ValueError):
                continue

    # ── Process each scene ───────────────────────────────────────────────────
    completed_clips: list[SceneAudioClip] = []
    padding = settings.TTS_SCENE_PADDING_SECONDS
    provider_used = settings.TTS_PROVIDER if not settings.TTS_MOCK_MODE else "mock"
    voice_used = settings.OPENAI_TTS_VOICE if provider_used == "openai_tts" else (
        settings.ELEVENLABS_VOICE_ID if provider_used == "elevenlabs" else "mock-voice"
    )
    any_mock = False

    for idx, scene in enumerate(scenes):
        scene_id = scene.get("scene_id", f"scene-{idx+1}")
        planned_duration = float(scene.get("duration_seconds", 15.0))
        narration_raw = scene.get("narration", "")

        # Validate narration exists
        if not narration_raw or not narration_raw.strip():
            raise ValueError(
                f"Scene '{scene_id}' has empty narration. "
                "All scenes must have narration before audio generation."
            )

        try:
            clean_narration = sanitize_narration(narration_raw)
        except ValueError as e:
            raise ValueError(f"Scene '{scene_id}' narration validation failed: {e}") from e

        text_hash = _text_hash(clean_narration)
        object_key = _audio_object_key(job_id, idx + 1)

        # ── Idempotency: reuse if same narration already synthesized ─────────
        if scene_id in existing_clips:
            existing = existing_clips[scene_id]
            if (_existing_clip_matches(existing, text_hash) and existing.scene_index == idx + 1
                    and existing.tts_provider == provider_used and existing.tts_voice_id == voice_used
                    and existing.is_mock == settings.TTS_MOCK_MODE
                    and await object_exists(existing.audio_key)):
                logger.info(
                    "audio_clip_reused",
                    job_id=str(job_id),
                    scene_id=scene_id,
                    text_hash=text_hash,
                )
                completed_clips.append(existing)
                if existing.is_mock:
                    any_mock = True
                continue

        # The TTS client owns the only bounded network retry loop. A durable
        # pending clip survives upload failure without repeating paid synthesis.
        pending = (job.audio_manifest_json or {}).get("pending_audio_upload")
        if (pending and pending.get("scene_id") == scene_id and pending.get("text_hash") == text_hash
                and pending.get("provider") == provider_used and pending.get("voice_id") == voice_used):
            synthesis_result = TTSSynthesisResult(
                provider=pending["provider"], voice_id=pending["voice_id"],
                audio_bytes=base64.b64decode(pending["audio_b64"], validate=True), format="mp3",
                duration_seconds=pending["duration_seconds"], text_hash=text_hash, is_mock=pending["is_mock"])
        else:
            try:
                synthesis_result = await synthesize_narration(
                    text=clean_narration, scene_planned_duration=planned_duration)
            except Exception as exc:
                raise VideoPipelineError("VIDEO_TTS_FAILED", "Narration synthesis failed: " + type(exc).__name__) from exc
            if (not synthesis_result.audio_bytes or synthesis_result.format != "mp3"
                    or not math.isfinite(synthesis_result.duration_seconds)
                    or not 0 < synthesis_result.duration_seconds <= 600
                    or len(synthesis_result.audio_bytes) > 8 * 1024 * 1024):
                raise VideoPipelineError("VIDEO_TTS_FAILED", "Invalid or oversized narration audio")
            job.audio_manifest_json = {
                **(job.audio_manifest_json or {}),
                "pending_audio_upload": {"scene_id":scene_id, "text_hash":text_hash,
                    "provider":synthesis_result.provider, "voice_id":synthesis_result.voice_id,
                    "duration_seconds":synthesis_result.duration_seconds, "is_mock":synthesis_result.is_mock,
                    "audio_b64":base64.b64encode(synthesis_result.audio_bytes).decode("ascii")}}
            await db.commit()
        # Content-hash keys prevent changed narration overwriting a clip used by
        # a renderer. Ambiguous PUT success is confirmed and reused on retry.
        request_hash = hashlib.sha256(f"{text_hash}:{provider_used}:{voice_used}".encode()).hexdigest()[:24]
        object_key = f"{settings.TTS_AUDIO_OBJECT_PREFIX}/{job_id}/audio/{idx+1:03d}-{request_hash}.mp3"
        try:
            object_key, audio_url = await asyncio.wait_for(retry_transient(lambda: upload_verified_bytes(
                synthesis_result.audio_bytes, object_key, "audio/mpeg")), timeout=120)
        except Exception as exc:
            raise VideoPipelineError("VIDEO_UPLOAD_FAILED", "Narration upload failed: " + type(exc).__name__) from exc

        # ── Reconcile timing ─────────────────────────────────────────────────
        render_dur = reconcile_scene_timing(
            planned_seconds=planned_duration,
            audio_seconds=synthesis_result.duration_seconds,
            padding_seconds=padding,
        )

        clip = SceneAudioClip(
            scene_id=scene_id,
            scene_index=idx + 1,
            audio_key=object_key,
            audio_url=audio_url,
            format="mp3",
            duration_seconds=synthesis_result.duration_seconds,
            planned_duration_seconds=planned_duration,
            render_duration_seconds=render_dur,
            text_hash=text_hash,
            tts_provider=synthesis_result.provider,
            tts_voice_id=synthesis_result.voice_id,
            is_mock=synthesis_result.is_mock,
            status="ready",
        )
        completed_clips.append(clip)
        # Persist every completed clip so worker recovery reuses paid TTS.
        existing_clips[scene_id] = clip
        job.audio_manifest_json = {"scenes": [c.to_dict() for c in existing_clips.values()], "is_mock": any_mock or synthesis_result.is_mock}
        await db.commit()

        if synthesis_result.is_mock:
            any_mock = True

        logger.info(
            "audio_clip_ready",
            job_id=str(job_id),
            scene_id=scene_id,
            duration_seconds=synthesis_result.duration_seconds,
            render_duration_seconds=render_dur,
            is_mock=synthesis_result.is_mock,
        )

    # ── Validate all clips succeeded ─────────────────────────────────────────
    failed_clips = [c for c in completed_clips if c.status == "failed"]
    if failed_clips:
        failed_ids = [c.scene_id for c in failed_clips]
        raise RuntimeError(
            f"Audio generation failed for {len(failed_clips)} scene(s): {failed_ids}. "
            "Cannot advance to audio_ready with failed clips."
        )

    # ── Compute totals ───────────────────────────────────────────────────────
    total_planned = sum(c.planned_duration_seconds for c in completed_clips)
    total_audio = sum(c.duration_seconds for c in completed_clips)
    total_render = sum(c.render_duration_seconds for c in completed_clips)
    target = float(job.target_duration_seconds or 120)

    delta_ratio, within_tolerance = validate_total_duration(target, total_audio)

    if not within_tolerance:
        logger.warning(
            "audio_total_duration_outside_tolerance",
            job_id=str(job_id),
            target_seconds=target,
            actual_seconds=total_audio,
            delta_ratio=delta_ratio,
            tolerance=TOTAL_DURATION_TOLERANCE,
        )

    # ── Build and persist manifest ───────────────────────────────────────────
    manifest = AudioManifest(
        version=1,
        job_id=str(job_id),
        provider=provider_used,
        voice_id=voice_used,
        scenes=completed_clips,
        total_planned_duration_seconds=round(total_planned, 3),
        total_audio_duration_seconds=round(total_audio, 3),
        total_render_duration_seconds=round(total_render, 3),
        duration_delta_ratio=delta_ratio,
        duration_within_tolerance=within_tolerance,
        is_mock=any_mock,
    )

    job.audio_manifest_json = manifest.to_dict()
    job.status = VideoJobStatus.audio_ready
    await db.commit()

    logger.info(
        "audio_generation_complete",
        job_id=str(job_id),
        scenes=len(completed_clips),
        total_audio_seconds=total_audio,
        total_render_seconds=total_render,
        within_tolerance=within_tolerance,
        is_mock=any_mock,
    )

    return manifest
