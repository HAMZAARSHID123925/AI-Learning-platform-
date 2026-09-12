"""
Unit tests for Module 2 Content Extraction, Video Ingestion & Chunking.
"""

import math
import pytest
from app.modules.module2_content.services.content_extractor import chunk_text
from app.shared.ai_client import _generate_deterministic_vector


def test_chunk_text_short_string():
    text = "This is a short lesson body that fits in one chunk."
    chunks = chunk_text(text, max_tokens=50, overlap=10)
    assert len(chunks) == 1
    assert chunks[0] == text


def test_chunk_text_sliding_window_overlap():
    words = [f"word{i}" for i in range(100)]
    text = " ".join(words)
    chunks = chunk_text(text, max_tokens=30, overlap=10)
    
    assert len(chunks) > 1
    # Check that overlap exists between chunk 0 and chunk 1
    chunk0_words = chunks[0].split()
    chunk1_words = chunks[1].split()
    overlap_words = set(chunk0_words) & set(chunk1_words)
    assert len(overlap_words) >= 5


def test_deterministic_vector_generation():
    text = "IELTS Academic Writing Task 2 Essay Structure"
    dim = 384
    vec1 = _generate_deterministic_vector(text, dim)
    vec2 = _generate_deterministic_vector(text, dim)

    # Determinism
    assert vec1 == vec2
    assert len(vec1) == dim

    # Unit norm verification (magnitude == 1.0)
    magnitude = math.sqrt(sum(x * x for x in vec1))
    assert abs(magnitude - 1.0) < 1e-4

    # Different text yields different vector
    vec_diff = _generate_deterministic_vector("Completely different topic", dim)
    assert vec1 != vec_diff
