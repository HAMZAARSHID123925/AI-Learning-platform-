"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/visual/validators.py

Purpose:
    Validation layer for the ELARION visual system.

    All visual components — character poses, expressions, templates,
    text content, scene structure, and asset manifests — must pass
    these validators BEFORE any rendering pipeline is triggered.

    Validation failures must raise clear, descriptive exceptions.
    Do NOT silently drop or skip invalid data.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.modules.module6_adaptive.visual.character import (
    PoseId, ExpressionId, CANONICAL_CHARACTER
)
from app.modules.module6_adaptive.visual.templates import (
    SceneType, TEMPLATE_LIBRARY, SCENE_TYPE_TO_TEMPLATE, resolve_template,
    TextLimits, STANDARD_TEXT_LIMITS
)
from app.modules.module6_adaptive.visual.design_tokens import ENVIRONMENT_LIBRARY
from app.modules.module6_adaptive.visual.asset_manifest import VideoAssetManifest, SceneAssetSlot


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------

@dataclass
class ValidationResult:
    valid: bool
    errors: list[str]

    def raise_if_invalid(self) -> None:
        if not self.valid:
            raise ValueError(
                f"Visual validation failed with {len(self.errors)} error(s):\n"
                + "\n".join(f"  • {e}" for e in self.errors)
            )


# ---------------------------------------------------------------------------
# Character validators
# ---------------------------------------------------------------------------

def validate_character_version(character_version: str) -> ValidationResult:
    """Ensure the character version matches the canonical ELARION teacher."""
    canonical = f"{CANONICAL_CHARACTER.character_id}-{CANONICAL_CHARACTER.version}"
    errors = []
    if character_version != canonical:
        errors.append(
            f"Character version '{character_version}' does not match canonical "
            f"'{canonical}'. All videos must use the same approved character."
        )
    return ValidationResult(valid=not errors, errors=errors)


def validate_pose(pose: str) -> ValidationResult:
    """Ensure pose_id is in the approved pose library."""
    errors = []
    try:
        PoseId(pose)
    except ValueError:
        valid_poses = [p.value for p in PoseId]
        errors.append(
            f"Invalid pose '{pose}'. Must be one of: {valid_poses}"
        )
    return ValidationResult(valid=not errors, errors=errors)


def validate_expression(expression: str) -> ValidationResult:
    """Ensure expression is in the approved expression library."""
    errors = []
    try:
        ExpressionId(expression)
    except ValueError:
        valid_exprs = [e.value for e in ExpressionId]
        errors.append(
            f"Invalid expression '{expression}'. Must be one of: {valid_exprs}"
        )
    return ValidationResult(valid=not errors, errors=errors)


# ---------------------------------------------------------------------------
# Template validators
# ---------------------------------------------------------------------------

def validate_template_id(template_id: str) -> ValidationResult:
    """Ensure template_id is in the registered template library."""
    errors = []
    if template_id not in TEMPLATE_LIBRARY:
        valid_templates = list(TEMPLATE_LIBRARY.keys())
        errors.append(
            f"Unknown template_id '{template_id}'. Must be one of: {valid_templates}"
        )
    return ValidationResult(valid=not errors, errors=errors)


def validate_scene_type(scene_type: str) -> ValidationResult:
    """Ensure scene_type is a recognised SceneType value."""
    errors = []
    try:
        SceneType(scene_type)
    except ValueError:
        valid_types = [s.value for s in SceneType]
        errors.append(
            f"Unknown scene_type '{scene_type}'. Must be one of: {valid_types}"
        )
    return ValidationResult(valid=not errors, errors=errors)


def validate_scene_type_template_compatibility(
    scene_type: str, template_id: str
) -> ValidationResult:
    """Ensure the template supports the given scene_type."""
    errors = []
    st_result = validate_scene_type(scene_type)
    if not st_result.valid:
        return st_result
    t_result = validate_template_id(template_id)
    if not t_result.valid:
        return t_result

    template = TEMPLATE_LIBRARY[template_id]
    st = SceneType(scene_type)
    if st not in template.supported_scene_types:
        errors.append(
            f"Template '{template_id}' does not support scene_type '{scene_type}'. "
            f"Supported: {[s.value for s in template.supported_scene_types]}"
        )
    return ValidationResult(valid=not errors, errors=errors)


# ---------------------------------------------------------------------------
# Text validators
# ---------------------------------------------------------------------------

def _word_count(text: str) -> int:
    return len(text.split()) if text.strip() else 0


def validate_title_text(title: str, limits: TextLimits = STANDARD_TEXT_LIMITS) -> ValidationResult:
    """Ensure title does not exceed word limit."""
    errors = []
    wc = _word_count(title)
    if wc > limits.max_title_words:
        errors.append(
            f"Title '{title}' has {wc} words; maximum is {limits.max_title_words}."
        )
    return ValidationResult(valid=not errors, errors=errors)


def validate_body_text(text: str, limits: TextLimits = STANDARD_TEXT_LIMITS) -> ValidationResult:
    """Ensure visible body text does not exceed word limit."""
    errors = []
    wc = _word_count(text)
    if wc > limits.max_body_words_visible:
        errors.append(
            f"Body text has {wc} words; maximum visible is {limits.max_body_words_visible}."
        )
    return ValidationResult(valid=not errors, errors=errors)


def validate_bullet_count(bullets: list[str], limits: TextLimits = STANDARD_TEXT_LIMITS) -> ValidationResult:
    """Ensure bullet list does not exceed maximum count."""
    errors = []
    count = len(bullets)
    if count > limits.max_bullet_count:
        errors.append(
            f"Scene has {count} bullets; maximum is {limits.max_bullet_count}."
        )
    return ValidationResult(valid=not errors, errors=errors)


def validate_caption(caption: str, limits: TextLimits = STANDARD_TEXT_LIMITS) -> ValidationResult:
    """Ensure caption does not exceed character limit."""
    errors = []
    if len(caption) > limits.max_caption_chars:
        errors.append(
            f"Caption is {len(caption)} chars; maximum is {limits.max_caption_chars}."
        )
    return ValidationResult(valid=not errors, errors=errors)


# ---------------------------------------------------------------------------
# Layout validators
# ---------------------------------------------------------------------------

def validate_active_zones(zones: list[str]) -> ValidationResult:
    """Ensure layout zones are recognised zone names."""
    VALID_ZONES = {
        "title_zone", "body_zone", "diagram_zone",
        "left_panel", "right_panel", "caption_zone",
        "subtitle_zone", "whiteboard_zone",
    }
    errors = []
    for z in zones:
        if z not in VALID_ZONES:
            errors.append(f"Unknown layout zone '{z}'. Valid: {VALID_ZONES}")
    return ValidationResult(valid=not errors, errors=errors)


# ---------------------------------------------------------------------------
# Asset slot validator
# ---------------------------------------------------------------------------

def validate_scene_slot(slot: SceneAssetSlot) -> ValidationResult:
    """
    Run all validators for a single SceneAssetSlot.
    Returns aggregated result.
    """
    all_errors: list[str] = []

    for result in [
        validate_character_version(slot.character_version),
        validate_pose(slot.character_pose),
        validate_expression(slot.character_expression),
        validate_template_id(slot.template_id),
        validate_scene_type(slot.scene_type),
        validate_scene_type_template_compatibility(slot.scene_type, slot.template_id),
        validate_active_zones(slot.active_zones),
    ]:
        all_errors.extend(result.errors)

    return ValidationResult(valid=not all_errors, errors=all_errors)


# ---------------------------------------------------------------------------
# Full manifest validator
# ---------------------------------------------------------------------------

def validate_asset_manifest(manifest: VideoAssetManifest) -> ValidationResult:
    """
    Validate the entire VideoAssetManifest before handing to rendering.
    Checks character version lock, all scene slots, and completeness.
    """
    all_errors: list[str] = []

    # Character version lock
    cv_result = validate_character_version(manifest.character_version)
    all_errors.extend(cv_result.errors)

    # Must have at least one scene
    if not manifest.scene_slots:
        all_errors.append("Asset manifest has no scene_slots.")

    # Validate each scene slot
    for i, slot in enumerate(manifest.scene_slots):
        slot_result = validate_scene_slot(slot)
        if not slot_result.valid:
            for e in slot_result.errors:
                all_errors.append(f"Scene slot {i} ({slot.scene_id}): {e}")

    # Audio must NOT be present at this stage (M3.3 boundary check)
    for slot in manifest.scene_slots:
        if slot.narration_clip_id is not None:
            all_errors.append(
                f"Scene slot {slot.scene_id} has narration_clip_id set "
                "— audio attachment must not happen before M3.4 TTS phase."
            )

    return ValidationResult(valid=not all_errors, errors=all_errors)


# ---------------------------------------------------------------------------
# No-audio boundary enforcer
# ---------------------------------------------------------------------------

def assert_no_audio_content(manifest: VideoAssetManifest) -> None:
    """
    Hard assertion: the M3.3 manifest must not contain any audio references.
    Raises if TTS/audio has leaked into this phase.
    """
    violations = [
        slot.scene_id for slot in manifest.scene_slots
        if slot.narration_clip_id is not None
    ]
    if violations:
        raise AssertionError(
            f"M3.3 phase boundary violation: audio references found in scene slots "
            f"{violations}. Audio must only be attached in M3.4 TTS phase."
        )
