"""
ELARION AI Learning Platform â€” Backend
Module: app/shared/ai_client.py

Purpose:
    Unified AI client abstraction supporting:
    1. Vector Embeddings (FastEmbed / OpenAI text-embedding-3-small)
    2. LLM Completions (Anthropic Claude API / Groq Llama-3.3)
    3. Audio Transcription (OpenAI Whisper API for Video Lectures)

Design Principles:
    - Provider abstraction: Swap dev (FastEmbed/Groq) to prod (OpenAI/Claude) via .env only.
    - Resilient: Automatic exponential backoff retries on rate limits and network glitches.
    - Strictly typed: Returns Python data structures matching application schemas.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import math
from typing import Any

from app.config import get_settings
from app.shared.logging_config import get_logger

logger = get_logger(__name__)


# =============================================================================
# 1. Embedding Provider
# =============================================================================

import os
# Prevent OpenBLAS from spawning multiple threads and deadlocking
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

_fastembed_model = None

async def get_embedding(text: str) -> list[float]:
    """
    Generate a normalized vector embedding for the given text string.
    Matches settings.EMBEDDING_DIM (default 384 for dev / 1536 for OpenAI).
    """
    global _fastembed_model
    settings = get_settings()
    dim = settings.EMBEDDING_DIM

    if settings.EMBEDDING_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        try:
            import openai
            client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY, timeout=60.0)
            resp = await client.embeddings.create(
                model=settings.EMBEDDING_MODEL,
                input=text,
                dimensions=dim if "text-embedding-3" in settings.EMBEDDING_MODEL else None
            )
            return resp.data[0].embedding
        except Exception as e:
            logger.error(f"OpenAI embedding failed: {e}")
            raise

    # Fallback / FastEmbed local generator
    try:
        from fastembed import TextEmbedding
        if _fastembed_model is None:
            _fastembed_model = TextEmbedding(model_name=settings.EMBEDDING_MODEL)
        embeddings = list(_fastembed_model.embed([text]))
        vector = embeddings[0].tolist()
        if len(vector) != dim:
            raise ValueError("Embedding dimension mismatch")
        return vector
    except Exception as e:
        logger.error(f"FastEmbed failed: {e}")
        raise RuntimeError("Configured embedding provider failed") from e


def _generate_deterministic_vector(text: str, dim: int) -> list[float]:
    """
    Generates a deterministic unit-normalized pseudo-vector of dimension `dim`
    from SHA-256 hashes of the text. Used for testing and offline environments.
    """
    vec = []
    for i in range(dim):
        h = hashlib.sha256(f"{text}:{i}".encode("utf-8")).hexdigest()
        val = (int(h[:8], 16) / 0xFFFFFFFF) * 2.0 - 1.0
        vec.append(val)

    # Normalize to unit vector for cosine similarity
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [x / norm for x in vec]


# =============================================================================
# 2. LLM Completion Provider (Claude / Groq)
# =============================================================================

async def generate_llm_completion(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.2,
    max_tokens: int = 4000,
    json_mode: bool = True,
    max_retries: int = 3,
    sdk_max_retries: int | None = None
) -> str:
    """
    Calls the configured LLM (Anthropic Claude API or Groq).
    Applies exponential backoff on rate limits.
    """
    settings = get_settings()

    for attempt in range(max_retries):
        try:
            # 1. Anthropic Claude API
            if settings.LLM_PROVIDER == "anthropic" and settings.ANTHROPIC_API_KEY and not settings.ANTHROPIC_API_KEY.startswith("#"):
                import anthropic
                client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY, timeout=60.0, **({"max_retries":sdk_max_retries} if sdk_max_retries is not None else {}))
                resp = await client.messages.create(
                    model=settings.ANTHROPIC_LLM_MODEL,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}]
                )
                return resp.content[0].text

            # 2. Groq API
            elif settings.LLM_PROVIDER == "groq" and settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("#"):
                import openai
                client = openai.AsyncOpenAI(
                    base_url="https://api.groq.com/openai/v1",
                    api_key=settings.GROQ_API_KEY,
                    timeout=60.0,
                    **({"max_retries":sdk_max_retries} if sdk_max_retries is not None else {})
                )
                kwargs: dict[str, Any] = {
                    "model": settings.GROQ_LLM_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}

                resp = await client.chat.completions.create(**kwargs)
                return resp.choices[0].message.content or ""

            # 3. OpenAI API
            elif settings.LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("#"):
                import openai
                client = openai.AsyncOpenAI(
                    api_key=settings.OPENAI_API_KEY,
                    timeout=60.0,
                    **({"max_retries":sdk_max_retries} if sdk_max_retries is not None else {})
                )
                kwargs: dict[str, Any] = {
                    "model": settings.OPENAI_LLM_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}

                resp = await client.chat.completions.create(**kwargs)
                return resp.choices[0].message.content or ""

            # 4. If no external key is configured:
            # - In production: raise clear configuration error
            # - In development/test: provide safe structured fallback
            else:
                raise RuntimeError("Configured LLM credentials are missing")

        except Exception as e:
            delay = 1.5 * (2 ** attempt)
            logger.warning("llm_call_failed", attempt=attempt + 1, error_type=type(e).__name__, next_retry_delay=delay)
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(delay)

    return ""


def _generate_mock_llm_response(user_prompt: str) -> str:
    """Provides fallback structured JSON for offline dev/test runs when no API keys are set."""
    if "Generate a structured test" in user_prompt or "assessment" in user_prompt.lower():
        return json.dumps({
            "title": "Comprehensive Diagnostic Assessment",
            "questions": [
                {
                    "question_type": "mcq",
                    "prompt": "What is the primary function of a thesis statement in an academic essay?",
                    "options": [
                        {"id": "opt-1", "text": "To state the central argument or claim of the essay", "is_correct": True},
                        {"id": "opt-2", "text": "To list all bibliography sources", "is_correct": False},
                        {"id": "opt-3", "text": "To provide emotional background anecdotes", "is_correct": False},
                        {"id": "opt-4", "text": "To summarize the conclusion paragraph", "is_correct": False}
                    ],
                    "rubric": None,
                    "max_score": 1.0,
                    "skill_name": "Essay Structure & Argumentation"
                },
                {
                    "question_type": "short_answer",
                    "prompt": "Explain how cohesive devices link paragraphs together and give an example.",
                    "options": None,
                    "rubric": "Full credit (1.0) requires mentioning transitions/connectors and providing a valid example such as 'Furthermore' or 'In contrast'. Half credit (0.5) if example is missing.",
                    "max_score": 1.0,
                    "skill_name": "Cohesion & Coherence"
                }
            ]
        })
    elif "remedial course" in user_prompt.lower() or "remediation" in user_prompt.lower():
        return json.dumps({
            "title": "Targeted Remedial Mastery Guide: Cohesive Devices & Essay Structure",
            "target_skill": "Cohesion & Coherence",
            "estimated_reading_minutes": 10,
            "summary": "Detailed conceptual review addressing paragraph transitions and linking words.",
            "content_markdown": "# Remedial Mastery Guide\n\n## 1. The Core Misconception\nCohesive devices are not just decorative words...",
            "key_takeaways": ["Use transitions intentionally", "Vary sentence openings", "Maintain logical progression"]
        })
    elif "generation context:" in user_prompt.lower():
        return json.dumps({
            "lesson_plan": {
                "title": "Understanding the CPU",
                "target_skill_name": "Basic Computer Hardware",
                "learning_objectives": ["Identify the CPU", "Understand CPU vs RAM"],
                "student_misconceptions": ["Confusing short-term memory (RAM) with processing (CPU)"],
                "teaching_strategy": "Compare CPU to a chef and RAM to the counter.",
                "target_duration_seconds": 120
            },
            "scenes": [
                {
                    "scene_id": "scene-1",
                    "scene_type": "intro",
                    "duration_seconds": 15,
                    "heading": "Meet the CPU",
                    "narration": "Hello! Today we are learning about the CPU. Think of the CPU like the chef in a kitchen.",
                    "visual_intent": {
                        "type": "concept_intro",
                        "concepts": ["CPU"]
                    },
                    "on_screen_text": ["CPU = The Brain"]
                }
            ],
            "validation": {
                "grounding_check": "Used the chef analogy from the lesson.",
                "misconception_alignment": "Directly compares CPU to RAM.",
                "grade_level_check": "Passed."
            }
        })
    else:
        # Default grading response
        return json.dumps({
            "score": 0.85,
            "feedback": "Strong understanding demonstrated. Cohesive devices were correctly identified with accurate examples.",
            "llm_reasoning": "Student provided definition and example ('Furthermore'), minor detail omitted regarding sentence boundaries."
        })


# =============================================================================
# 3. Audio & Video Transcription Provider
# =============================================================================

async def transcribe_audio_bytes(audio_bytes: bytes, filename: str = "lecture.mp3") -> str:
    """
    Transcribes audio bytes extracted from video/audio lectures using OpenAI Whisper API.
    """
    settings = get_settings()
    if settings.OPENAI_API_KEY:
        import io
        import openai
        client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = filename
        resp = await client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="text"
        )
        return str(resp)

    # Offline fallback transcript
    return (
        f"[00:00] Welcome to this video lesson on {filename}.\n"
        "[01:15] In this lecture we discuss fundamental concepts, structural rules, and practical examples.\n"
        "[03:45] Key takeaway: Focus on clear communication and precision."
    )
