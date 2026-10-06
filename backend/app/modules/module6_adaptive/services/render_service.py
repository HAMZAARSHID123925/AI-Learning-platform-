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
import hashlib
import threading
import functools
import signal
import time
import json
import os
import subprocess
import tempfile
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import get_settings
from app.modules.module6_adaptive.models import VideoGenerationJob, VideoJobStatus
from app.modules.module6_adaptive.visual.asset_manifest import build_asset_manifest
from app.shared.logging_config import get_logger
from app.shared.s3_client import upload_verified_bytes, object_exists
from .pipeline_errors import VideoPipelineError, safe_error, retry_transient

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

RENDER_TIMEOUT_SECONDS = 600       # 10 minutes hard limit
UPLOAD_TIMEOUT_SECONDS = 120       # 2 minutes for S3 upload
VIDEO_RENDER_DIR = Path(__file__).resolve().parents[5] / "video-render"
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
    import copy
    audio_manifest: dict = copy.deepcopy(job.audio_manifest_json or {})

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

def invoke_remotion_render(input_path: str, output_path: str, cancel_event: threading.Event | None = None) -> RenderResult:
    """
    Call video-render/src/render.ts via Node subprocess.

    Uses tsx (TypeScript executor bundled with Remotion env) if available,
    falls back to ts-node.

    Returns RenderResult parsed from subprocess stdout.
    """
    node_env = {**os.environ, "NODE_ENV": "production"}

    # Try tsx first (faster, no tsconfig overhead), then ts-node
    executors = [
        ["npm", "run", "render", "--", input_path, output_path]
    ]

    # Longer real narration produces more frames; the fixed ten-minute budget
    # timed out valid course videos. Bound the budget using measured clip timing.
    duration = sum(c.get("render_duration_seconds", 0) for c in json.loads(
        Path(input_path).read_text(encoding="utf-8"))["audio_manifest"]["scenes"])
    timeout_seconds = max(RENDER_TIMEOUT_SECONDS, min(1800, int(duration * 9)))

    last_error: Optional[str] = None
    for cmd in executors:
        try:
            proc = subprocess.Popen(
                cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                cwd=str(VIDEO_RENDER_DIR), env=node_env, shell=os.name == 'nt',
                start_new_session=os.name != 'nt',
            )
            stop_monitor = threading.Event()
            def stop_owned_process():
                if proc.poll() is not None: return
                if os.name == 'nt':
                    subprocess.run(["taskkill", "/PID", str(proc.pid), "/T", "/F"], capture_output=True, timeout=15)
                else:
                    try: os.killpg(proc.pid, signal.SIGKILL)
                    except ProcessLookupError: pass
            def monitor():
                while not stop_monitor.wait(0.1):
                    if cancel_event is not None and cancel_event.is_set():
                        stop_owned_process()
                        return
            watcher = threading.Thread(target=monitor, daemon=True)
            if cancel_event is not None: watcher.start()
            try:
                stdout, stderr = proc.communicate(timeout=timeout_seconds)
            except subprocess.TimeoutExpired:
                stop_owned_process()
                proc.communicate(timeout=15)
                last_error = f"Render timeout after {timeout_seconds}s"
                break
            finally:
                stop_monitor.set()
                if cancel_event is not None: watcher.join(timeout=16)
            if cancel_event is not None and cancel_event.is_set():
                raise RuntimeError("Render cancelled after ownership loss")

            # Parse stdout JSON result
            stdout_lines = stdout.strip().splitlines()
            result_line = next(
                (l for l in reversed(stdout_lines) if l.startswith("{")), None
            )

            if result_line:
                result_data = json.loads(result_line)
                return RenderResult(
                    success=result_data.get("success", False) and proc.returncode == 0,
                    output_path=result_data.get("output_path", output_path),
                    duration_seconds=result_data.get("duration_seconds", 0.0),
                    total_frames=result_data.get("total_frames", 0),
                    width=result_data.get("width", 0),
                    height=result_data.get("height", 0),
                    fps=result_data.get("fps", 0),
                    file_size_bytes=result_data.get("file_size_bytes", 0),
                    is_mock_audio=result_data.get("is_mock_audio", True),
                    character_version=result_data.get("character_version", "unknown"),
                    error=safe_error(result_data.get("error") or "") or None,
                )

            if proc.returncode != 0:
                last_error = safe_error((stderr or stdout)[:500])
                continue

        except subprocess.TimeoutExpired:
            last_error = f"Render timeout after {timeout_seconds}s"
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

async def await_render_completion(input_path: str, output_path: str) -> RenderResult:
    """Keep render files alive until the executor actually stops on cancellation."""
    cancel_event = threading.Event()
    future = asyncio.get_running_loop().run_in_executor(
        None, functools.partial(invoke_remotion_render, input_path, output_path, cancel_event=cancel_event)
    )
    try:
        return await asyncio.shield(future)
    except asyncio.CancelledError:
        # Stop only this owned renderer before releasing ownership or files.
        cancel_event.set()
        try:
            await asyncio.shield(future)
        except Exception:
            pass
        raise


def render_fingerprint(job) -> str:
    """Identity uses saved input/clip keys, never expiring presigned URLs."""
    clips = [{k:c.get(k) for k in ("scene_id", "audio_key", "text_hash", "tts_provider", "tts_voice_id", "duration_seconds", "render_duration_seconds")}
             for c in (job.audio_manifest_json or {}).get("scenes", [])]
    body = {"scenes":job.scene_json, "audio":clips, "assets":job.asset_manifest_json,
            "renderer_contract":2, "width":EXPECTED_WIDTH, "height":EXPECTED_HEIGHT, "fps":EXPECTED_FPS}
    return hashlib.sha256(json.dumps(body,sort_keys=True,separators=(",", ":")).encode()).hexdigest()

async def render_video(job_id: uuid.UUID, db: AsyncSession) -> None:
    """Validated render checkpoint survives worker restart and upload failure.

    The <=64 MiB BYTEA is deferred from normal queries, used only until upload
    succeeds and then cleared. It avoids relying on one worker's filesystem.
    """
    settings = get_settings()
    job = await db.get(VideoGenerationJob, job_id)
    if not job or job.status != VideoJobStatus.audio_ready:
        raise ValueError("Render requires an audio_ready job")
    if not job.scene_json or not job.audio_manifest_json or job.audio_manifest_json.get("is_mock"):
        raise VideoPipelineError("VIDEO_RENDER_FAILED", "Render requires real scene audio")
    clips = job.audio_manifest_json.get("scenes", [])
    scene_ids = [s["scene_id"] for s in job.scene_json["scenes"]]
    if ([c.get("scene_id") for c in clips] != scene_ids or any(
            c.get("status") != "ready" or c.get("is_mock") or c.get("format") != "mp3"
            or not c.get("audio_key") or not 0 < c.get("duration_seconds", 0) <= c.get("render_duration_seconds", 0) <= 601
            for c in clips)):
        raise VideoPipelineError("VIDEO_RENDER_FAILED", "Invalid scene audio mapping")
    expected_duration = sum(c["render_duration_seconds"] for c in clips)
    fingerprint = render_fingerprint(job)
    started = time.monotonic()
    stage = "render"
    try:
        job.status = VideoJobStatus.rendering
        await db.commit()
        logger.info("video_stage_started", job_id=str(job.id), student_id=str(job.student_id),
                    remediation_id=str(job.remediation_plan_id), stage=stage, attempt=job.retry_count+1)
        with tempfile.TemporaryDirectory(prefix="elarion_render_") as tmpdir:
            input_path, output_path = os.path.join(tmpdir,"input.json"), os.path.join(tmpdir,"video.mp4")
            checkpoint = job.render_manifest_json or {}
            video_bytes = None
            if checkpoint.get("fingerprint") == fingerprint:
                video_bytes = (await db.execute(select(VideoGenerationJob.render_checkpoint_bytes)
                    .where(VideoGenerationJob.id == job.id))).scalar_one_or_none()
                if (not video_bytes or len(video_bytes) != checkpoint.get("size")
                        or hashlib.sha256(video_bytes).hexdigest() != checkpoint.get("sha256")):
                    video_bytes = None
            if video_bytes is not None:
                Path(output_path).write_bytes(video_bytes)
                logger.info("video_render_checkpoint_reused",job_id=str(job.id), stage="upload", bytes_size=len(video_bytes))
            else:
                payload = build_render_payload(job,output_path)
                from app.shared.s3_client import generate_presigned_url
                for clip in payload["audio_manifest"]["scenes"]:
                    if not await object_exists(clip["audio_key"]):
                        raise VideoPipelineError("VIDEO_RENDER_FAILED", "A narration object is missing")
                    clip["audio_url"] = await generate_presigned_url(clip["audio_key"], expires_in=3600)
                Path(input_path).write_text(json.dumps(payload),encoding="utf-8")
                result = await await_render_completion(input_path,output_path)
                if not result.success:
                    raise VideoPipelineError("VIDEO_RENDER_FAILED", safe_error(result.error or "Renderer failed"))
            probe = validate_mp4_with_ffprobe(output_path,expected_duration)
            if not probe.valid:
                raise VideoPipelineError("VIDEO_RENDER_FAILED", "MP4 validation: " + safe_error("; ".join(probe.errors)))
            if video_bytes is None:
                if probe.file_size_bytes > 64 * 1024 * 1024:
                    raise VideoPipelineError("VIDEO_RENDER_FAILED", "Rendered MP4 exceeds 64 MiB checkpoint limit")
                video_bytes = Path(output_path).read_bytes()
                job.render_checkpoint_bytes = video_bytes
                job.render_manifest_json = {"fingerprint":fingerprint, "sha256":hashlib.sha256(video_bytes).hexdigest(),
                    "size":len(video_bytes), "duration_seconds":probe.duration_seconds}
                await db.commit()
            stage = "upload"
            job.status = VideoJobStatus.uploading
            await db.commit()
            key = f"{settings.TTS_AUDIO_OBJECT_PREFIX}/{job.id}/final/video.mp4"
            video_key, _ = await asyncio.wait_for(retry_transient(
                lambda: upload_verified_bytes(video_bytes,key,"video/mp4")), timeout=UPLOAD_TIMEOUT_SECONDS)
            job.video_object_key = video_key
            job.video_url = None  # API signs the saved private key on demand.
            from datetime import datetime, timezone
            job.completed_at = datetime.now(timezone.utc)
            job.error_code = job.error_message = None
            job.render_checkpoint_bytes = None
            job.status = VideoJobStatus.ready
            await db.commit()
            logger.info("video_stage_completed",job_id=str(job.id),student_id=str(job.student_id),
                        remediation_id=str(job.remediation_plan_id),stage="ready",attempt=job.retry_count+1,
                        duration_seconds=round(time.monotonic()-started,3),object_key=video_key)
    except asyncio.CancelledError:
        raise  # Consumer leaves delivery pending; saved checkpoints survive.
    except Exception as exc:
        code = exc.code if isinstance(exc,VideoPipelineError) else (
            "VIDEO_UPLOAD_FAILED" if stage == "upload" else "VIDEO_RENDER_FAILED")
        job.status = VideoJobStatus.failed
        job.error_code = code
        job.error_message = safe_error(str(exc))
        await db.commit()
        raise VideoPipelineError(code,job.error_message) from exc
