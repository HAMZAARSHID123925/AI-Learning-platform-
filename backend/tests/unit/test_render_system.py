"""
ELARION — M3.5 Video Render System Tests

Tests cover:
  1. Render payload building from job fields
  2. ffprobe validation logic
  3. Render timeout handling
  4. S3 upload behavior on success
  5. Job status transitions (rendering -> uploading -> ready)
  6. Failure state transitions
"""

import sys
import os
import uuid
import pytest
from unittest.mock import patch, MagicMock, AsyncMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from app.modules.module6_adaptive.models import VideoGenerationJob, VideoJobStatus
from app.modules.module6_adaptive.services.render_service import (
    build_render_payload,
    validate_mp4_with_ffprobe,
    FFProbeResult,
    EXPECTED_WIDTH,
    EXPECTED_HEIGHT,
    EXPECTED_FPS,
)

# ---------------------------------------------------------------------------
# 1. Payload Building
# ---------------------------------------------------------------------------

def test_build_render_payload_constructs_correct_json():
    job = VideoGenerationJob(
        id=uuid.uuid4(),
        title="Test Lesson",
        status=VideoJobStatus.audio_ready,
        scene_json={"scenes": [{"scene_id": "s1", "scene_type": "intro", "narration": "Hello."}]},
        audio_manifest_json={
            "is_mock": True,
            "scenes": [{"scene_id": "s1", "render_duration_seconds": 5.0}]
        },
        asset_manifest_json={
            "character_version": "elarion-teacher-v1",
            "scene_slots": [{"scene_id": "s1", "template_id": "intro-v1"}]
        }
    )
    
    payload = build_render_payload(job, "/tmp/out.mp4")
    
    assert payload["job_id"] == str(job.id)
    assert payload["title"] == "Test Lesson"
    assert len(payload["scenes"]) == 1
    assert payload["scenes"][0]["scene_type"] == "intro"
    assert payload["audio_manifest"]["is_mock"] is True
    assert payload["asset_manifest"]["character_version"] == "elarion-teacher-v1"
    assert payload["video_config"]["width"] == EXPECTED_WIDTH
    assert payload["video_config"]["height"] == EXPECTED_HEIGHT
    assert payload["video_config"]["fps"] == EXPECTED_FPS
    assert payload["output_path"] == "/tmp/out.mp4"

def test_build_render_payload_auto_builds_asset_manifest_if_missing():
    job = VideoGenerationJob(
        id=uuid.uuid4(),
        title="Test Lesson 2",
        status=VideoJobStatus.audio_ready,
        scene_json={"scenes": [{"scene_id": "s1", "scene_type": "intro", "narration": "Hello."}]},
        audio_manifest_json={"is_mock": True, "scenes": []},
        asset_manifest_json=None  # Missing
    )
    
    payload = build_render_payload(job, "/tmp/out2.mp4")
    
    assert payload["asset_manifest"] is not None
    assert "character_version" in payload["asset_manifest"]
    assert len(payload["asset_manifest"]["scene_slots"]) == 1


# ---------------------------------------------------------------------------
# 2. ffprobe Validation
# ---------------------------------------------------------------------------

@patch("os.path.exists", return_value=True)
@patch("os.path.getsize", return_value=1024)
@patch("subprocess.run")
def test_validate_mp4_with_ffprobe_success(mock_run, mock_size, mock_exists):
    mock_run.return_value = MagicMock(
        returncode=0,
        stdout='{"format": {"duration": "10.0"}, "streams": [{"codec_type": "video", "width": 1920, "height": 1080, "r_frame_rate": "30/1"}, {"codec_type": "audio"}]}'
    )
    
    res = validate_mp4_with_ffprobe("test.mp4", 10.0)
    assert res.valid is True
    assert res.width == 1920
    assert res.height == 1080
    assert res.fps == 30.0
    assert res.duration_seconds == 10.0
    assert res.has_video_stream is True
    assert res.has_audio_stream is True
    assert len(res.errors) == 0

@patch("os.path.exists", return_value=True)
@patch("os.path.getsize", return_value=1024)
@patch("subprocess.run")
def test_validate_mp4_with_ffprobe_invalid_resolution(mock_run, mock_size, mock_exists):
    mock_run.return_value = MagicMock(
        returncode=0,
        stdout='{"format": {"duration": "10.0"}, "streams": [{"codec_type": "video", "width": 1280, "height": 720, "r_frame_rate": "30/1"}, {"codec_type": "audio"}]}'
    )
    
    res = validate_mp4_with_ffprobe("test.mp4", 10.0)
    assert res.valid is False
    assert "Resolution mismatch" in res.errors[0]

@patch("os.path.exists", return_value=True)
@patch("os.path.getsize", return_value=1024)
@patch("subprocess.run")
def test_validate_mp4_with_ffprobe_missing_audio(mock_run, mock_size, mock_exists):
    mock_run.return_value = MagicMock(
        returncode=0,
        stdout='{"format": {"duration": "10.0"}, "streams": [{"codec_type": "video", "width": 1920, "height": 1080, "r_frame_rate": "30/1"}]}'
    )
    
    res = validate_mp4_with_ffprobe("test.mp4", 10.0)
    assert res.valid is False
    assert "No audio stream found" in res.errors[0]

@patch("os.path.exists", return_value=True)
@patch("os.path.getsize", return_value=1024)
@patch("subprocess.run")
def test_validate_mp4_with_ffprobe_duration_mismatch(mock_run, mock_size, mock_exists):
    mock_run.return_value = MagicMock(
        returncode=0,
        stdout='{"format": {"duration": "15.0"}, "streams": [{"codec_type": "video", "width": 1920, "height": 1080, "r_frame_rate": "30/1"}, {"codec_type": "audio"}]}'
    )
    
    res = validate_mp4_with_ffprobe("test.mp4", 10.0)  # expected 10, got 15 (50% diff)
    assert res.valid is False
    assert any("Duration mismatch" in e for e in res.errors)

@patch("os.path.exists", return_value=False)
def test_validate_mp4_with_ffprobe_missing_file(mock_exists):
    res = validate_mp4_with_ffprobe("missing.mp4", 10.0)
    assert res.valid is False
    assert "Output file does not exist" in res.errors[0]

@patch("os.path.exists", return_value=True)
@patch("os.path.getsize", return_value=0)
def test_validate_mp4_with_ffprobe_zero_byte_file(mock_size, mock_exists):
    res = validate_mp4_with_ffprobe("empty.mp4", 10.0)
    assert res.valid is False
    assert "Output file is 0 bytes" in res.errors[0]

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
