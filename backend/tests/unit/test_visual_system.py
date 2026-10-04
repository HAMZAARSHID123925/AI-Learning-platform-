"""
ELARION — M3.3 Visual System Tests

Tests cover:
  1. Intro scene maps to correct template
  2. Comparison scene maps to ComparisonScene
  3. Invalid character pose is rejected
  4. Unsupported template_id is rejected
  5. Excessive visible text is rejected
  6. Character version remains fixed across manifest
  7. Asset manifest serializes correctly
  8. No audio/render logic present in manifest
  9. All pose IDs have library entries
 10. All expression IDs have library entries
 11. scene_type → template mapping is exhaustive
 12. Character identity drift detection
"""

import sys
import os
import pytest

# Ensure backend is in path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from app.modules.module6_adaptive.visual.character import (
    PoseId, ExpressionId, POSE_LIBRARY, EXPRESSION_LIBRARY,
    CANONICAL_CHARACTER, validate_no_identity_drift,
)
from app.modules.module6_adaptive.visual.templates import (
    SceneType, TEMPLATE_LIBRARY, SCENE_TYPE_TO_TEMPLATE, resolve_template,
    STANDARD_TEXT_LIMITS,
)
from app.modules.module6_adaptive.visual.validators import (
    validate_pose, validate_expression, validate_template_id,
    validate_character_version, validate_scene_type_template_compatibility,
    validate_body_text, validate_title_text, validate_bullet_count,
    validate_asset_manifest, assert_no_audio_content,
)
from app.modules.module6_adaptive.visual.asset_manifest import (
    build_asset_manifest, SceneAssetSlot, VideoAssetManifest,
)

import uuid


# ---------------------------------------------------------------------------
# 1. Intro scene maps to correct template
# ---------------------------------------------------------------------------

def test_intro_scene_maps_to_intro_v1():
    template = resolve_template("intro")
    assert template.template_id == "intro-v1"
    assert template.remotion_component == "IntroScene"
    assert SceneType.intro in template.supported_scene_types


# ---------------------------------------------------------------------------
# 2. Comparison scene maps to ComparisonScene
# ---------------------------------------------------------------------------

def test_comparison_scene_maps_to_comparison_v1():
    template = resolve_template("comparison")
    assert template.template_id == "comparison-v1"
    assert template.remotion_component == "ComparisonScene"
    assert template.has_comparison_panels is True
    assert template.has_body_text is False  # Comparison uses panels, not free body text


# ---------------------------------------------------------------------------
# 3. Invalid character pose is rejected
# ---------------------------------------------------------------------------

def test_invalid_pose_is_rejected():
    result = validate_pose("random_dance")
    assert not result.valid
    assert any("random_dance" in e for e in result.errors)


def test_valid_pose_passes():
    result = validate_pose("point_right")
    assert result.valid
    assert not result.errors


# ---------------------------------------------------------------------------
# 4. Unsupported template_id is rejected
# ---------------------------------------------------------------------------

def test_invalid_template_id_rejected():
    result = validate_template_id("fake-template-v99")
    assert not result.valid
    assert any("fake-template-v99" in e for e in result.errors)


def test_valid_template_id_passes():
    result = validate_template_id("concept-v1")
    assert result.valid


# ---------------------------------------------------------------------------
# 5. Excessive visible text is rejected
# ---------------------------------------------------------------------------

def test_title_word_limit_enforced():
    long_title = "This is a very long title that definitely has way too many words here"
    result = validate_title_text(long_title)
    assert not result.valid


def test_title_within_limit_passes():
    short_title = "What is a CPU?"
    result = validate_title_text(short_title)
    assert result.valid


def test_body_text_word_limit_enforced():
    long_body = " ".join(["word"] * 35)  # 35 words, limit is 30
    result = validate_body_text(long_body)
    assert not result.valid


def test_body_text_within_limit_passes():
    short_body = "The CPU is the brain of the computer. It processes instructions."
    result = validate_body_text(short_body)
    assert result.valid


def test_bullet_count_limit_enforced():
    bullets = ["Point 1", "Point 2", "Point 3", "Point 4"]  # 4 > limit of 3
    result = validate_bullet_count(bullets)
    assert not result.valid


def test_bullet_count_within_limit_passes():
    bullets = ["Point 1", "Point 2", "Point 3"]
    result = validate_bullet_count(bullets)
    assert result.valid


# ---------------------------------------------------------------------------
# 6. Character version remains fixed
# ---------------------------------------------------------------------------

def test_canonical_character_version_is_fixed():
    assert CANONICAL_CHARACTER.character_id == "elarion-teacher"
    assert CANONICAL_CHARACTER.version == "v1"
    assert CANONICAL_CHARACTER.gender.value == "female"
    assert CANONICAL_CHARACTER.style.value == "cartoon_3d"
    assert "17" in CANONICAL_CHARACTER.age_visual


def test_wrong_character_version_rejected():
    result = validate_character_version("some-other-character-v1")
    assert not result.valid
    assert "some-other-character-v1" in result.errors[0]


def test_canonical_character_version_passes():
    canonical = f"{CANONICAL_CHARACTER.character_id}-{CANONICAL_CHARACTER.version}"
    result = validate_character_version(canonical)
    assert result.valid


# ---------------------------------------------------------------------------
# 7. Asset manifest serializes correctly
# ---------------------------------------------------------------------------

def test_asset_manifest_builds_and_serializes():
    job_id = uuid.uuid4()
    scene_json = {
        "scenes": [
            {
                "scene_id": "scene-1",
                "scene_type": "intro",
                "duration_seconds": 15,
                "heading": "Meet the CPU",
                "narration": "Hello!",
            },
            {
                "scene_id": "scene-2",
                "scene_type": "concept",
                "duration_seconds": 30,
                "heading": "What is a CPU?",
                "narration": "The CPU processes instructions.",
            },
        ]
    }
    manifest = build_asset_manifest(job_id, scene_json)

    assert manifest.job_id == str(job_id)
    assert manifest.canvas_width == 1920
    assert manifest.canvas_height == 1080
    assert len(manifest.scene_slots) == 2

    slot_0 = manifest.scene_slots[0]
    assert slot_0.template_id == "intro-v1"
    assert slot_0.remotion_component == "IntroScene"
    assert slot_0.character_version == "elarion-teacher-v1"

    slot_1 = manifest.scene_slots[1]
    assert slot_1.template_id == "concept-v1"
    assert slot_1.remotion_component == "ConceptScene"

    # Serialization
    d = manifest.to_dict()
    assert "scene_slots" in d
    assert d["canvas_width"] == 1920
    assert isinstance(d["scene_slots"], list)


# ---------------------------------------------------------------------------
# 8. No audio/render logic in manifest
# ---------------------------------------------------------------------------

def test_asset_manifest_has_no_audio():
    job_id = uuid.uuid4()
    scene_json = {
        "scenes": [
            {"scene_id": "s1", "scene_type": "recap", "duration_seconds": 20,
             "heading": "Summary", "narration": "Remember these 3 things."}
        ]
    }
    manifest = build_asset_manifest(job_id, scene_json)

    # All narration_clip_ids must be None at M3.3 stage
    for slot in manifest.scene_slots:
        assert slot.narration_clip_id is None

    # assert_no_audio_content must pass cleanly
    assert_no_audio_content(manifest)


def test_audio_in_manifest_is_rejected():
    slot = SceneAssetSlot(
        scene_id="s1",
        scene_type="intro",
        template_id="intro-v1",
        remotion_component="IntroScene",
        character_version="elarion-teacher-v1",
        character_pose="idle_front",
        character_expression="neutral",
        character_position="left",
        character_scale=1.0,
        environment_id="modern-classroom-v1",
        active_zones=["title_zone", "body_zone", "subtitle_zone"],
        narration_clip_id="clip-123",  # Should NOT exist at M3.3
    )
    manifest = VideoAssetManifest(
        job_id=str(uuid.uuid4()),
        character_version="elarion-teacher-v1",
        design_system_version="v1",
        canvas_width=1920,
        canvas_height=1080,
        frame_rate=30,
        scene_slots=[slot],
    )
    with pytest.raises(AssertionError, match="M3.3 phase boundary violation"):
        assert_no_audio_content(manifest)


# ---------------------------------------------------------------------------
# 9. All pose IDs have library entries
# ---------------------------------------------------------------------------

def test_all_pose_ids_have_library_entries():
    for pose_id in PoseId:
        assert pose_id in POSE_LIBRARY, f"Pose '{pose_id.value}' missing from POSE_LIBRARY"


# ---------------------------------------------------------------------------
# 10. All expression IDs have library entries
# ---------------------------------------------------------------------------

def test_all_expression_ids_have_library_entries():
    for expr_id in ExpressionId:
        assert expr_id in EXPRESSION_LIBRARY, f"Expression '{expr_id.value}' missing from EXPRESSION_LIBRARY"


# ---------------------------------------------------------------------------
# 11. Scene type → template mapping is exhaustive
# ---------------------------------------------------------------------------

def test_all_scene_types_have_template_mapping():
    for scene_type in SceneType:
        assert scene_type in SCENE_TYPE_TO_TEMPLATE, (
            f"SceneType '{scene_type.value}' has no template mapping"
        )
        template_id = SCENE_TYPE_TO_TEMPLATE[scene_type]
        assert template_id in TEMPLATE_LIBRARY, (
            f"Template '{template_id}' mapped from '{scene_type.value}' not in TEMPLATE_LIBRARY"
        )


# ---------------------------------------------------------------------------
# 12. Character identity drift detection
# ---------------------------------------------------------------------------

def test_forbidden_prompt_terms_are_caught():
    bad_prompts = [
        "a different character standing in the classroom",
        "random girl teaching math",
        "a fashion model explaining fractions",
        "anime style teacher in 2d",
    ]
    for prompt in bad_prompts:
        with pytest.raises(ValueError, match="forbidden identity-drift"):
            validate_no_identity_drift(prompt)


def test_clean_prompt_passes_identity_check():
    safe_prompt = (
        "The ELARION teacher character stands beside a whiteboard. "
        "She is pointing at the CPU diagram with a focused expression. "
        "Classroom background, clean lighting."
    )
    # Should not raise
    validate_no_identity_drift(safe_prompt)


# ---------------------------------------------------------------------------
# 13. Full manifest validation integration
# ---------------------------------------------------------------------------

def test_full_manifest_validation_passes():
    job_id = uuid.uuid4()
    scene_json = {
        "scenes": [
            {"scene_id": "s1", "scene_type": "intro", "duration_seconds": 15,
             "heading": "Hello!", "narration": "Welcome."},
            {"scene_id": "s2", "scene_type": "comparison", "duration_seconds": 30,
             "heading": "CPU vs RAM", "narration": "Let us compare."},
            {"scene_id": "s3", "scene_type": "recap", "duration_seconds": 20,
             "heading": "Summary", "narration": "Here is what we learned."},
        ]
    }
    manifest = build_asset_manifest(job_id, scene_json)
    result = validate_asset_manifest(manifest)
    result.raise_if_invalid()  # Must not raise


def test_unsupported_scene_type_raises_on_manifest_build():
    scene_json = {
        "scenes": [
            {"scene_id": "s1", "scene_type": "live_session",
             "duration_seconds": 30, "heading": "Test", "narration": "Test."}
        ]
    }
    with pytest.raises(ValueError, match="Unknown scene_type"):
        build_asset_manifest(uuid.uuid4(), scene_json)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
