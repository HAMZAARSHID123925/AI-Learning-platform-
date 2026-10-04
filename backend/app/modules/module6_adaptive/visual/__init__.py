"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/visual/__init__.py

Public re-exports for the visual system.
"""

from app.modules.module6_adaptive.visual.character import (
    CANONICAL_CHARACTER,
    ELARION_TEACHER_V1,
    PoseId,
    ExpressionId,
    POSE_LIBRARY,
    EXPRESSION_LIBRARY,
    get_character_render_prompt_fragment,
    validate_no_identity_drift,
)
from app.modules.module6_adaptive.visual.design_tokens import (
    CANONICAL_CANVAS,
    PALETTE,
    TYPOGRAPHY,
    LAYOUT,
    ENVIRONMENT_LIBRARY,
    DESIGN_SYSTEM_VERSION,
)
from app.modules.module6_adaptive.visual.templates import (
    SceneType,
    TEMPLATE_LIBRARY,
    SCENE_TYPE_TO_TEMPLATE,
    STANDARD_LAYOUT,
    STANDARD_TEXT_LIMITS,
    resolve_template,
)
from app.modules.module6_adaptive.visual.asset_manifest import (
    VideoAssetManifest,
    SceneAssetSlot,
    build_asset_manifest,
)
from app.modules.module6_adaptive.visual.validators import (
    ValidationResult,
    validate_character_version,
    validate_pose,
    validate_expression,
    validate_template_id,
    validate_scene_type,
    validate_scene_type_template_compatibility,
    validate_title_text,
    validate_body_text,
    validate_bullet_count,
    validate_asset_manifest,
    assert_no_audio_content,
)

__all__ = [
    # Character
    "CANONICAL_CHARACTER",
    "ELARION_TEACHER_V1",
    "PoseId",
    "ExpressionId",
    "POSE_LIBRARY",
    "EXPRESSION_LIBRARY",
    "get_character_render_prompt_fragment",
    "validate_no_identity_drift",
    # Design tokens
    "CANONICAL_CANVAS",
    "PALETTE",
    "TYPOGRAPHY",
    "LAYOUT",
    "ENVIRONMENT_LIBRARY",
    "DESIGN_SYSTEM_VERSION",
    # Templates
    "SceneType",
    "TEMPLATE_LIBRARY",
    "SCENE_TYPE_TO_TEMPLATE",
    "STANDARD_LAYOUT",
    "STANDARD_TEXT_LIMITS",
    "resolve_template",
    # Manifest
    "VideoAssetManifest",
    "SceneAssetSlot",
    "build_asset_manifest",
    # Validators
    "ValidationResult",
    "validate_character_version",
    "validate_pose",
    "validate_expression",
    "validate_template_id",
    "validate_scene_type",
    "validate_scene_type_template_compatibility",
    "validate_title_text",
    "validate_body_text",
    "validate_bullet_count",
    "validate_asset_manifest",
    "assert_no_audio_content",
]
