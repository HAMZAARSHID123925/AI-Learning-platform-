"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/visual/asset_manifest.py

Purpose:
    Asset manifest schema and builder for ELARION video jobs.

    The AssetManifest is a structured record of every visual component
    required for rendering a scene or full video:
      - character version, pose, expression
      - environment/background
      - template selected
      - referenced asset paths
      - layout zones to use

    This feeds VideoGenerationJob.asset_manifest_json once built.

    M3.4 (TTS) will later attach audio clips.
    M3.5 (Remotion) will consume this manifest for final render.

    DO NOT add audio fields here — those belong in audio_manifest_json.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, asdict, field
from typing import Optional
from datetime import datetime, timezone

from app.modules.module6_adaptive.visual.character import (
    PoseId, ExpressionId, CANONICAL_CHARACTER
)
from app.modules.module6_adaptive.visual.templates import (
    SceneType, SceneTemplateDefinition, TEMPLATE_LIBRARY, resolve_template
)
from app.modules.module6_adaptive.visual.design_tokens import ENVIRONMENT_LIBRARY


# ---------------------------------------------------------------------------
# Asset directory structure (logical — physical paths set at deploy time)
# ---------------------------------------------------------------------------

ASSET_DIRECTORY_STRUCTURE = """
video-assets/
  characters/
    elarion-teacher-v1/
      poses/
        idle_front.png
        idle_three_quarter.png
        explain_left.png
        explain_right.png
        point_left.png
        point_right.png
        point_up.png
        thinking.png
        happy.png
        encouraging.png
        surprised.png
        recap.png
        whiteboard_point.png
        hands_open.png
        attention.png
      expressions/
        neutral.png
        friendly_smile.png
        encouraging.png
        thinking.png
        confused_demo.png
        surprised.png
        celebrating.png
        focused.png
      metadata/
        character_spec.json
        version.txt
  environments/
    modern-classroom-v1/
      bg.png
      bg_4k.png
    whiteboard-v1/
      bg.png
      board_surface.png
    digital-concept-v1/
      bg.png
    comparison-v1/
      bg.png
    diagram-v1/
      bg.png
    example-v1/
      bg.png
    recap-v1/
      bg.png
    quiz-prompt-v1/
      bg.png
  icons/
    outline/
    filled/
    duotone/
  diagrams/
    templates/
  branding/
    elarion_logo_white.svg
    elarion_logo_dark.svg
    elarion_wordmark.svg
"""


# ---------------------------------------------------------------------------
# Per-scene asset slot
# ---------------------------------------------------------------------------

@dataclass
class SceneAssetSlot:
    """
    Describes the visual assets assigned to a single scene.
    One of these is built for each entry in scene_json['scenes'].
    """
    scene_id: str
    scene_type: str
    template_id: str
    remotion_component: str

    # Character
    character_version: str
    character_pose: str
    character_expression: str
    character_position: str      # left | right | center | edge_left | edge_right
    character_scale: float

    # Environment
    environment_id: str

    # Content zones active in this scene
    active_zones: list[str]

    # Asset references (populated during asset preparation phase)
    asset_ids: list[str] = field(default_factory=list)

    # Narration clip reference — set by M3.4 TTS phase, NOT here
    narration_clip_id: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------------------
# Full video asset manifest
# ---------------------------------------------------------------------------

@dataclass
class VideoAssetManifest:
    """
    Full manifest for one VideoGenerationJob.
    Serialized into VideoGenerationJob.asset_manifest_json.
    """
    job_id: str
    character_version: str
    design_system_version: str
    canvas_width: int
    canvas_height: int
    frame_rate: int
    scene_slots: list[SceneAssetSlot]
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------------------
# Builder — constructs manifest from scene_json
# ---------------------------------------------------------------------------

def build_asset_manifest(
    job_id: uuid.UUID,
    scene_json: dict,
) -> VideoAssetManifest:
    """
    Given a job_id and the scene_json already persisted in M3.2,
    construct a full VideoAssetManifest by resolving templates and
    assigning canonical character/environment defaults.

    This does NOT load or generate any media files.
    Asset file references will be resolved later during assets_preparing.

    Args:
        job_id: UUID of the VideoGenerationJob
        scene_json: The persisted scene_json dict (must have 'scenes' list)

    Returns:
        VideoAssetManifest ready for serialization

    Raises:
        ValueError if any scene_type is invalid or template resolution fails
    """
    from app.modules.module6_adaptive.visual.design_tokens import CANONICAL_CANVAS

    scenes: list[dict] = scene_json.get("scenes", [])
    if not scenes:
        raise ValueError("scene_json contains no scenes")

    scene_slots: list[SceneAssetSlot] = []

    for scene in scenes:
        scene_id = scene.get("scene_id", f"scene-{len(scene_slots)+1}")
        scene_type_raw = scene.get("scene_type", "concept")

        template = resolve_template(scene_type_raw)

        # Determine active zones
        active_zones = []
        if template.has_title:
            active_zones.append("title_zone")
        if template.has_body_text:
            active_zones.append("body_zone")
        if template.has_diagram:
            active_zones.append("diagram_zone")
        if template.has_comparison_panels:
            active_zones.extend(["left_panel", "right_panel"])
        if template.has_whiteboard:
            active_zones.append("whiteboard_zone")
        if template.has_caption:
            active_zones.append("caption_zone")
        if template.has_subtitle:
            active_zones.append("subtitle_zone")

        slot = SceneAssetSlot(
            scene_id=scene_id,
            scene_type=scene_type_raw,
            template_id=template.template_id,
            remotion_component=template.remotion_component,
            character_version=f"{CANONICAL_CHARACTER.character_id}-{CANONICAL_CHARACTER.version}",
            character_pose=template.default_character_pose.value,
            character_expression=template.default_expression.value,
            character_position=template.default_character_position.value,
            character_scale=template.character_scale,
            environment_id=template.default_environment_id,
            active_zones=active_zones,
        )
        scene_slots.append(slot)

    return VideoAssetManifest(
        job_id=str(job_id),
        character_version=f"{CANONICAL_CHARACTER.character_id}-{CANONICAL_CHARACTER.version}",
        design_system_version="v1",
        canvas_width=CANONICAL_CANVAS.width_px,
        canvas_height=CANONICAL_CANVAS.height_px,
        frame_rate=CANONICAL_CANVAS.frame_rate,
        scene_slots=scene_slots,
    )
