"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/services/render_service.py

Purpose:
    M3.5 — Remotion video rendering service.

    This service:
    1. Loads the job from DB and validates it's in audio_ready
    2. Builds the RenderPayload JSON from scene_json + audio_manifest + asset_manifest
    3. Calls video-render/src/render.ts as a subprocess (Node/Remotion)
    4. Validates the rendered MP4 with ffprobe
    5. Uploads to S3 and persists video_url
    6. Advances job state: audio_ready → rendering → uploading → ready

    Architecture:
        Python backend ──subprocess──► Node/Remotion renderer
        (FastAPI/SQLAlchemy)           (video-render/src/render.ts)

    Character status:
        ⚠ DEV PLACEHOLDER — Production 3D character assets NOT created yet.
        CharacterPlaceholder.tsx is used in this phase.

    TTS status:
        If job's audio_manifest.is_mock = True → audio is MOCK (silent stubs).
        Must be reported explicitly. Not for production delivery.

    DO NOT render video in FastAPI request handlers.
    DO NOT start Remotion in the Python process.
"""

from __future__ import annotations

import asyncio
import json
import os
import subprocess
import tempfile
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.modules.module6_adaptive.models import VideoGenerationJob, VideoJobStatus
from app.modules.module6_adaptive.visual.asset_manifest import build_asset_manifest
from app.shared.logging_config import get_logger
from app.shared.s3_client import upload_file

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

RENDER_TIMEOUT_SECONDS = 600       # 10 minutes hard limit
UPLOAD_TIMEOUT_SECONDS = 120       # 2 minutes for S3 upload
VIDEO_RENDER_DIR = Path(__file__).resolve().parents[6] / "video-render"
RENDER_SCRIPT = VIDEO_RENDER_DIR / "src" / "render.ts"

# H.264 expected output
EXPECTED_WIDTH = 1920
EXPECTED_HEIGHT = 1080
EXPECTED_FPS = 30
DURATION_TOLERANCE_RATIO = 0.20    # ±20%


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class RenderResult:
    success: bool
    output_path: str
    duration_seconds: float
    total_frames: int
    width: int
    height: int
    fps: int
    file_size_bytes: int
    is_mock_audio: bool
    character_version: str
    error: Optional[str] = None


@dataclass
class FFProbeResult:
    valid: bool
    width: int
    height: int
    fps: float
    duration_seconds: float
    has_video_stream: bool
    has_audio_stream: bool
    file_size_bytes: int
    errors: list[str]


# ---------------------------------------------------------------------------
# ffprobe validation
# ---------------------------------------------------------------------------

def validate_mp4_with_ffprobe(output_path: str, expected_duration: float) -> FFProbeResult:
    """
    Run ffprobe on the output MP4 and validate:
      - file exists and is non-empty
      - video stream present
      - audio stream present
      - resolution matches expected
      - FPS approximately matches
      - duration within tolerance
    """
    errors: list[str] = []
    result_defaults = dict(
        valid=False, width=0, height=0, fps=0.0, duration_seconds=0.0,
        has_video_stream=False, has_audio_stream=False, errors=errors
    )

    if not os.path.exists(output_path):
        errors.append("Output file does not exist")
        return FFProbeResult(**result_defaults, file_size_bytes=0)

    file_size = os.path.getsize(output_path)
    if file_size == 0:
        errors.append("Output file is 0 bytes")
        return FFProbeResult(**result_defaults, file_size_bytes=0)

    try:
        probe_result = subprocess.run(
            [
                "ffprobe", "-v", "quiet",
                "-print_format", "json",
                "-show_format", "-show_streams",
                output_path,
            ],
            capture_output=True, text=True, timeout=30
        )
        if probe_result.returncode != 0:
            errors.append(f"ffprobe failed: {probe_result.stderr[:200]}")
            return FFProbeResult(**result_defaults, file_size_bytes=file_size)

        info = json.loads(probe_result.stdout)
        streams = info.get("streams", [])
        fmt = info.get("format", {})

        # Identify streams
        video_stream = next((s for s in streams if s.get("codec_type") == "video"), None)
        audio_stream = next((s for s in streams if s.get("codec_type") == "audio"), None)

        has_video = video_stream is not None
        has_audio = audio_stream is not None

        if not has_video:
            errors.append("No video stream found in output")
        if not has_audio:
            errors.append("No audio stream found in output")

        width = int(video_stream.get("width", 0)) if video_stream else 0
        height = int(video_stream.get("height", 0)) if video_stream else 0
        duration = float(fmt.get("duration", 0))

        # Parse FPS from r_frame_rate e.g. "30/1"
        fps = 0.0
        if video_stream:
            fps_raw = video_stream.get("r_frame_rate", "0/1")
            try:
                n, d = fps_raw.split("/")
                fps = float(n) / float(d) if float(d) > 0 else 0.0
            except Exception:
                pass

        # Resolution check
        if width != EXPECTED_WIDTH or height != EXPECTED_HEIGHT:
            errors.append(f"Resolution mismatch: got {width}x{height}, expected {EXPECTED_WIDTH}x{EXPECTED_HEIGHT}")

        # FPS check (allow ±2)
        if abs(fps - EXPECTED_FPS) > 2:
            errors.append(f"FPS mismatch: got {fps:.1f}, expected {EXPECTED_FPS}")

        # Duration check
        if expected_duration > 0 and duration > 0:
            delta = abs(duration - expected_duration) / expected_duration
            if delta > DURATION_TOLERANCE_RATIO:
                errors.append(
                    f"Duration mismatch: got {duration:.1f}s, expected ~{expected_duration:.1f}s "
                    f"(delta={delta*100:.1f}%)"
                )

        if duration <= 0:
            errors.append(f"Duration is zero or negative: {duration}")

        return FFProbeResult(
            valid=len(errors) == 0,
            width=width,
            height=height,
            fps=fps,
            duration_seconds=duration,
            has_video_stream=has_video,
            has_audio_stream=has_audio,
            file_size_bytes=file_size,
            errors=errors,
        )

    except subprocess.TimeoutExpired:
        errors.append("ffprobe timed out")
        return FFProbeResult(**result_defaults, file_size_bytes=file_size)
    except Exception as e:
        errors.append(f"ffprobe exception: {e}")
        return FFProbeResult(**result_defaults, file_size_bytes=file_size)


# ---------------------------------------------------------------------------
# Render payload builder
# ---------------------------------------------------------------------------

def build_render_payload(job: VideoGenerationJob, output_path: str) -> dict:
    """
    Construct the JSON payload that video-render/src/render.ts expects.
    Merges scene_json + audio_manifest_json + asset_manifest_json.
    """
    scene_json: dict = job.scene_json or {}
    audio_manifest: dict = job.audio_manifest_json or {}

    # Build asset manifest if not already on the job
    if job.asset_manifest_json:
        asset_manifest = job.asset_manifest_json
    else:
        manifest_obj = build_asset_manifest(job.id, scene_json)
        asset_manifest = manifest_obj.to_dict()

    return {
        "job_id": str(job.id),
        "title": job.title or "ELARION Personalized Lesson",
        "scenes": scene_json.get("scenes", []),
        "audio_manifest": audio_manifest,
        "asset_manifest": asset_manifest,
        "video_config": {
            "width": EXPECTED_WIDTH,
            "height": EXPECTED_HEIGHT,
            "fps": EXPECTED_FPS,
            "codec": "h264",
            "outputFormat": "mp4",
        },
        "output_path": output_path,
    }


# ---------------------------------------------------------------------------
# Node/Remotion subprocess invocation
# ---------------------------------------------------------------------------

def invoke_remotion_render(input_path: str, output_path: str) -> RenderResult:
    """
    Call video-render/src/render.ts via Node subprocess.

    Uses tsx (TypeScript executor bundled with Remotion env) if available,
    falls back to ts-node.

    Returns RenderResult parsed from subprocess stdout.
    """
    node_env = {**os.environ, "NODE_ENV": "production"}

    # Try tsx first (faster, no tsconfig overhead), then ts-node
    executors = [
        ["node", "--import", "tsx/esm", str(RENDER_SCRIPT), input_path, output_path],
        ["npx", "ts-node", "--esm", str(RENDER_SCRIPT), input_path, output_path],
    ]

    last_error: Optional[str] = None
    for cmd in executors:
        try:
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=RENDER_TIMEOUT_SECONDS,
                cwd=str(VIDEO_RENDER_DIR),
                env=node_env,
            )

            # Parse stdout JSON result
            stdout_lines = proc.stdout.strip().splitlines()
            result_line = next(
                (l for l in reversed(stdout_lines) if l.startswith("{")), None
            )

            if result_line:
                result_data = json.loads(result_line)
                return RenderResult(
                    success=result_data.get("success", False),
                    output_path=result_data.get("output_path", output_path),
                    duration_seconds=result_data.get("duration_seconds", 0.0),
                    total_frames=result_data.get("total_frames", 0),
                    width=result_data.get("width", 0),
                    height=result_data.get("height", 0),
                    fps=result_data.get("fps", 0),
                    file_size_bytes=result_data.get("file_size_bytes", 0),
                    is_mock_audio=result_data.get("is_mock_audio", True),
                    character_version=result_data.get("character_version", "unknown"),
                    error=result_data.get("error"),
                )

            if proc.returncode != 0:
                last_error = (proc.stderr or proc.stdout)[:500]
                continue

        except subprocess.TimeoutExpired:
            last_error = f"Render timeout after {RENDER_TIMEOUT_SECONDS}s"
            break
        except FileNotFoundError:
            last_error = f"Executor not found: {cmd[0]}"
            continue
        except Exception as e:
            last_error = str(e)
            continue

    return RenderResult(
        success=False, output_path=output_path, duration_seconds=0.0,
        total_frames=0, width=0, height=0, fps=0, file_size_bytes=0,
        is_mock_audio=True, character_version="unknown",
        error=last_error or "All render executors failed"
    )


# ---------------------------------------------------------------------------
# Main render service
# ---------------------------------------------------------------------------

async def render_video(
    job_id: uuid.UUID,
    db: AsyncSession,
) -> None:
    """
    Full render pipeline for a single VideoGenerationJob.

    Preconditions:
        Job must be in audio_ready

    Flow:
        audio_ready
        → rendering   (build payload, invoke Remotion)
        → ffprobe validation
        → uploading   (S3 upload)
        → ready       (video_url persisted)

    Raises:
        ValueError if job not found or wrong state
        RuntimeError on render failure, validation failure, or upload failure
    """
    settings = get_settings()

    job = await db.get(VideoGenerationJob, job_id)
    if not job:
        raise ValueError(f"VideoGenerationJob {job_id} not found")

    if job.status != VideoJobStatus.audio_ready:
        raise ValueError(
            f"Job {job_id} is in state '{job.status.value}' — render requires audio_ready"
        )

    if not job.scene_json or not job.audio_manifest_json:
        raise ValueError(f"Job {job_id} missing scene_json or audio_manifest_json")

    # Advance to rendering
    job.status = VideoJobStatus.rendering
    await db.commit()
    logger.info("render_started", job_id=str(job_id))

    # Calculate expected duration from audio manifest
    audio_scenes = job.audio_manifest_json.get("scenes", [])
    expected_duration = sum(c.get("render_duration_seconds", 0) for c in audio_scenes)
    is_mock_audio = job.audio_manifest_json.get("is_mock", True)

    with tempfile.TemporaryDirectory(prefix="elarion_render_") as tmpdir:
        input_path = os.path.join(tmpdir, "input.json")
        output_path = os.path.join(tmpdir, "video.mp4")

        # ── Build and write render payload ────────────────────────────────
        payload = build_render_payload(job, output_path)
        with open(input_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)

        logger.info(
            "render_payload_written",
            job_id=str(job_id),
            input_path=input_path,
            scene_count=len(payload["scenes"]),
        )

        # ── Invoke Remotion renderer ───────────────────────────────────────
        render_result = await asyncio.get_event_loop().run_in_executor(
            None,
            invoke_remotion_render,
            input_path,
            output_path,
        )

        if not render_result.success:
            job.status = VideoJobStatus.failed
            job.error_message = f"Render failed: {render_result.error}"
            job.retry_count += 1
            await db.commit()
            raise RuntimeError(f"Remotion render failed for job {job_id}: {render_result.error}")

        logger.info(
            "render_complete",
            job_id=str(job_id),
            duration_seconds=render_result.duration_seconds,
            file_size_bytes=render_result.file_size_bytes,
            is_mock_audio=render_result.is_mock_audio,
        )

        # ── ffprobe quality validation ────────────────────────────────────
        probe = validate_mp4_with_ffprobe(output_path, expected_duration)
        if not probe.valid:
            job.status = VideoJobStatus.failed
            job.error_message = f"ffprobe validation failed: {'; '.join(probe.errors)}"
            await db.commit()
            raise RuntimeError(
                f"MP4 validation failed for job {job_id}: {probe.errors}"
            )

        logger.info(
            "ffprobe_validation_passed",
            job_id=str(job_id),
            width=probe.width, height=probe.height,
            fps=probe.fps, duration=probe.duration_seconds,
        )

        # ── Advance to uploading ──────────────────────────────────────────
        job.status = VideoJobStatus.uploading
        await db.commit()

        # ── Upload to object storage ──────────────────────────────────────
        prefix = settings.TTS_AUDIO_OBJECT_PREFIX  # "personalized-video"
        video_object_prefix = f"{prefix}/{job_id}/final"

        try:
            with open(output_path, "rb") as f:
                video_bytes = f.read()

            video_key, video_url = await upload_file(
                file_data=video_bytes,
                original_filename="video.mp4",
                content_type="video/mp4",
                prefix=video_object_prefix,
            )
        except Exception as e:
            job.status = VideoJobStatus.failed
            job.error_message = f"S3 upload failed: {e}"
            await db.commit()
            raise RuntimeError(f"Upload failed for job {job_id}: {e}") from e

        # ── Persist video_url and mark ready ─────────────────────────────
        job.video_url = video_url
        job.video_object_key = video_key
        job.status = VideoJobStatus.ready
        await db.commit()

        logger.info(
            "render_pipeline_complete",
            job_id=str(job_id),
            video_url=video_url,
            duration_seconds=probe.duration_seconds,
            file_size_bytes=probe.file_size_bytes,
            is_mock_audio=is_mock_audio,
            character_version=render_result.character_version,
        )
