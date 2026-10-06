"""
ELARION AI Learning Platform — Backend
Module: app/shared/tts_client.py

Purpose:
    Provider-agnostic Text-to-Speech abstraction.
    Returns raw MP3 bytes + measured duration.

    Supported providers:
        openai_tts   — OpenAI /v1/audio/speech  (tts-1 / tts-1-hd)
        elevenlabs   — ElevenLabs v1 TTS API
        mock         — Explicit development/test mock (silent audio stub)

    Production rule:
        If TTS_MOCK_MODE is False and credentials are missing → raise immediately.
        NEVER silently return fake audio in production.

    Usage:
        result = await synthesize_narration(text="Hello world")
        # result.audio_bytes   → raw MP3
        # result.duration_seconds  → measured from audio
        # result.provider      → which provider was used

    ⚠ This module handles ONLY synthesis + duration.
    Upload to object storage happens in audio_generation_service.py.
"""

from __future__ import annotations

import hashlib
import io
import tempfile
import os
from dataclasses import dataclass
from typing import Literal

from app.config import get_settings
from app.shared.logging_config import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Result type
# ---------------------------------------------------------------------------

@dataclass
class TTSSynthesisResult:
    provider: str
    voice_id: str
    audio_bytes: bytes
    format: str          # "mp3"
    duration_seconds: float
    text_hash: str       # SHA-256 of the narration text (for idempotency)
    is_mock: bool = False


# ---------------------------------------------------------------------------
# Text sanitization
# ---------------------------------------------------------------------------

def sanitize_narration(text: str) -> str:
    """
    Prepare raw narration text for TTS input.

    Strips:
    - Leading/trailing whitespace
    - Markdown formatting symbols (**, __, ##, *, -, `)
    - HTML tags
    - Internal metadata markers

    Preserves:
    - Sentence punctuation (pacing)
    - Commas, ellipses (natural pauses)
    - Numbers and proper nouns
    """
    import re

    if not text or not text.strip():
        raise ValueError("Narration text is empty. Cannot synthesize audio for empty scene.")

    t = text.strip()

    # Remove HTML tags
    t = re.sub(r"<[^>]+>", " ", t)

    # Remove markdown bold/italic/code
    t = re.sub(r"\*{1,3}|_{1,3}|`+", "", t)

    # Remove markdown headings (##, ###)
    t = re.sub(r"^#{1,6}\s*", "", t, flags=re.MULTILINE)

    # Remove markdown list markers at line start
    t = re.sub(r"^\s*[-*+]\s+", "", t, flags=re.MULTILINE)

    # Normalize whitespace
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    t = t.strip()

    # Enforce per-scene text length (guard against LLM dumping full essay)
    MAX_CHARS = 1200
    if len(t) > MAX_CHARS:
        raise ValueError(
            f"Narration text too long for TTS ({len(t)} chars > {MAX_CHARS}). "
            "Each scene should be short narration, not a full transcript."
        )

    return t


def _text_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


# ---------------------------------------------------------------------------
# Duration measurement using mutagen (precise, no ffprobe subprocess needed)
# ---------------------------------------------------------------------------

def measure_mp3_duration(audio_bytes: bytes) -> float:
    """
    Measure the exact duration of an MP3 from its raw bytes.
    Uses mutagen — no subprocess, no ffprobe dependency at runtime.

    Falls back to ffprobe if mutagen can't decode (e.g. unusual encoding).
    Raises RuntimeError if neither can measure duration.
    """
    # Primary: mutagen (pure Python, fast)
    try:
        from mutagen.mp3 import MP3
        buf = io.BytesIO(audio_bytes)
        audio = MP3(buf)
        duration = audio.info.length
        if duration > 0:
            return round(duration, 3)
    except Exception as e:
        logger.warning("mutagen_duration_failed", error=str(e))

    # Fallback: ffprobe subprocess
    try:
        import subprocess
        import json as _json
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
            f.write(audio_bytes)
            tmp_path = f.name
        try:
            result = subprocess.run(
                [
                    "ffprobe", "-v", "quiet",
                    "-print_format", "json",
                    "-show_format",
                    tmp_path
                ],
                capture_output=True, text=True, timeout=10
            )
            if result.returncode == 0:
                info = _json.loads(result.stdout)
                dur = float(info.get("format", {}).get("duration", 0))
                if dur > 0:
                    return round(dur, 3)
        finally:
            os.unlink(tmp_path)
    except Exception as e:
        logger.warning("ffprobe_duration_failed", error=str(e))

    raise RuntimeError("Could not measure audio duration — both mutagen and ffprobe failed.")


# ---------------------------------------------------------------------------
# Mock TTS (silent stub for development/testing)
# ---------------------------------------------------------------------------

def _generate_mock_audio(text: str, duration_hint_seconds: float = 5.0) -> bytes:
    """
    Generate a minimal valid MP3 stub for development/testing.
    The file is silent but structurally valid (ID3 + LAME header).

    Duration approximation: ~130 words/minute @ 128kbps
    """
    # Minimal valid MP3 silence frame (128kbps, 44100Hz mono, 1 frame ≈ 26ms)
    # Repeated to approximate duration_hint_seconds
    SILENT_MP3_FRAME = bytes([
        0xFF, 0xFB, 0x90, 0x00,  # MPEG1, Layer 3, 128kbps, 44100Hz, stereo
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ])
    frames_needed = max(1, int(duration_hint_seconds / 0.026))
    return SILENT_MP3_FRAME * frames_needed


def _estimate_duration_from_text(text: str, words_per_minute: float = 130.0) -> float:
    """Rough duration estimate from word count, for mock mode only."""
    words = len(text.split())
    return max(2.0, round(words / words_per_minute * 60.0, 1))


# ---------------------------------------------------------------------------
# OpenAI TTS provider
# ---------------------------------------------------------------------------

async def _synthesize_openai(text: str) -> bytes:
    """Call OpenAI /v1/audio/speech and return raw MP3 bytes."""
    settings = get_settings()
    key = settings.OPENAI_TTS_API_KEY or settings.OPENAI_API_KEY
    if not key or key.startswith("#"):
        raise ValueError(
            "OPENAI_TTS_API_KEY or OPENAI_API_KEY is not configured. "
            "Set it in .env or enable TTS_MOCK_MODE=true for development."
        )
    import openai
    client = openai.AsyncOpenAI(api_key=key, timeout=30.0, max_retries=0)
    response = await client.audio.speech.create(
        model=settings.OPENAI_TTS_MODEL,
        voice=settings.OPENAI_TTS_VOICE,          # type: ignore[arg-type]
        input=text,
        speed=settings.TTS_SPEAKING_RATE,
        response_format="mp3",
    )
    return response.content


# ---------------------------------------------------------------------------
# ElevenLabs TTS provider
# ---------------------------------------------------------------------------

async def _synthesize_elevenlabs(text: str) -> bytes:
    """Call ElevenLabs v1 TTS API and return raw MP3 bytes."""
    settings = get_settings()
    key = settings.ELEVENLABS_API_KEY
    voice_id = settings.ELEVENLABS_VOICE_ID
    if not key or key.startswith("#") or not voice_id:
        raise ValueError(
            "ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID is not configured. "
            "Set them in .env or enable TTS_MOCK_MODE=true for development."
        )
    import httpx
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            headers={
                "xi-api-key": key,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            json={
                "text": text,
                "model_id": "eleven_turbo_v2",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                    "style": 0.0,
                    "use_speaker_boost": True,
                },
            },
        )
        if resp.status_code != 200:
            raise RuntimeError(
                f"ElevenLabs TTS failed: HTTP {resp.status_code} — {resp.text[:200]}"
            )
        return resp.content


# ---------------------------------------------------------------------------
# Main public API
# ---------------------------------------------------------------------------

async def synthesize_narration(
    text: str,
    scene_planned_duration: float | None = None,
) -> TTSSynthesisResult:
    """
    Synthesize narration audio for a single scene.

    Args:
        text: Raw narration text (will be sanitized internally)
        scene_planned_duration: Planned scene duration (seconds), used for
            mock duration estimation only.

    Returns:
        TTSSynthesisResult with audio_bytes and measured duration_seconds

    Raises:
        ValueError: Empty text, text too long, or missing credentials in production
        RuntimeError: Provider failure or duration measurement failure
    """
    settings = get_settings()
    clean_text = sanitize_narration(text)
    h = _text_hash(clean_text)

    # ── Mock mode ────────────────────────────────────────────────────────────
    if settings.TTS_MOCK_MODE:
        if settings.is_production:
            raise RuntimeError(
                "TTS_MOCK_MODE=true is forbidden in production. "
                "Configure a real TTS provider."
            )
        logger.warning("tts_mock_mode_active", text_hash=h)
        hint = scene_planned_duration or _estimate_duration_from_text(clean_text)
        audio_bytes = _generate_mock_audio(clean_text, hint)
        duration = _estimate_duration_from_text(clean_text)
        return TTSSynthesisResult(
            provider="mock",
            voice_id="mock-voice",
            audio_bytes=audio_bytes,
            format="mp3",
            duration_seconds=duration,
            text_hash=h,
            is_mock=True,
        )

    # ── Real providers ───────────────────────────────────────────────────────
    provider = settings.TTS_PROVIDER

    max_retries = 3
    for attempt in range(max_retries):
        try:
            if provider == "openai_tts":
                if settings.is_production and (
                    not settings.OPENAI_TTS_API_KEY
                    or settings.OPENAI_TTS_API_KEY.startswith("#")
                ):
                    raise ValueError(
                        "Missing OPENAI_TTS_API_KEY in production. "
                        "TTS cannot silently fall back in production."
                    )
                audio_bytes = await _synthesize_openai(clean_text)
                voice_id = settings.OPENAI_TTS_VOICE

            elif provider == "elevenlabs":
                if settings.is_production and (
                    not settings.ELEVENLABS_API_KEY
                    or settings.ELEVENLABS_API_KEY.startswith("#")
                ):
                    raise ValueError(
                        "Missing ELEVENLABS_API_KEY in production. "
                        "TTS cannot silently fall back in production."
                    )
                audio_bytes = await _synthesize_elevenlabs(clean_text)
                voice_id = settings.ELEVENLABS_VOICE_ID

            else:
                raise ValueError(f"Unknown TTS_PROVIDER '{provider}'. Must be: openai_tts | elevenlabs")
            
            break # Success, exit retry loop
        except ValueError:
            raise # Configuration errors shouldn't retry
        except Exception as e:
            from app.modules.module6_adaptive.services.pipeline_errors import is_transient
            delay = 1.5 * (2 ** attempt)
            logger.warning("tts_provider_failed", attempt=attempt+1, error_type=type(e).__name__)
            if not is_transient(e) or attempt == max_retries - 1:
                raise RuntimeError(f"TTS synthesis failed [{provider}]: {type(e).__name__}") from e
            import asyncio
            await asyncio.sleep(delay)

    if not audio_bytes:
        raise RuntimeError(f"TTS provider '{provider}' returned empty audio response.")

    duration = measure_mp3_duration(audio_bytes)

    logger.info(
        "tts_synthesis_complete",
        provider=provider,
        voice=voice_id,
        duration_seconds=duration,
        bytes_size=len(audio_bytes),
        text_hash=h,
    )

    return TTSSynthesisResult(
        provider=provider,
        voice_id=voice_id,
        audio_bytes=audio_bytes,
        format="mp3",
        duration_seconds=duration,
        text_hash=h,
        is_mock=False,
    )
