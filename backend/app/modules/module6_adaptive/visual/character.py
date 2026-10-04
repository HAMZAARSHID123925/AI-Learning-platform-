"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/visual/character.py

Purpose:
    Canonical character specification for the ELARION Teacher character.
    This is the SINGLE SOURCE OF TRUTH for all character identity attributes.

    ⚠ DO NOT modify character identity without explicit product approval.
    Any future redesign must increment the version and preserve prior-version assets.

Character Direction (User-Approved):
    - Human, Female, Age 17–18
    - Full 3D cartoon style
    - Simple ELARION branded shirt
    - Friendly, intelligent, premium appearance
    - Same fixed character identity across all videos
"""

from __future__ import annotations

import enum
from dataclasses import dataclass, field
from typing import Optional


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class CharacterGender(str, enum.Enum):
    female = "female"
    male = "male"
    neutral = "neutral"


class CharacterStyle(str, enum.Enum):
    cartoon_3d = "cartoon_3d"
    cartoon_2d = "cartoon_2d"
    realistic = "realistic"


class RenderOrientation(str, enum.Enum):
    front = "front"
    three_quarter_left = "three_quarter_left"
    three_quarter_right = "three_quarter_right"
    side_left = "side_left"
    side_right = "side_right"


class PoseId(str, enum.Enum):
    """Approved, controlled pose library. DO NOT add poses arbitrarily."""
    idle_front = "idle_front"
    idle_three_quarter = "idle_three_quarter"
    explain_left = "explain_left"
    explain_right = "explain_right"
    point_left = "point_left"
    point_right = "point_right"
    point_up = "point_up"
    thinking = "thinking"
    happy = "happy"
    encouraging = "encouraging"
    surprised = "surprised"
    recap = "recap"
    whiteboard_point = "whiteboard_point"
    hands_open = "hands_open"
    attention = "attention"


class ExpressionId(str, enum.Enum):
    """Approved, controlled expression set. Reject anything outside this list."""
    neutral = "neutral"
    friendly_smile = "friendly_smile"
    encouraging = "encouraging"
    thinking = "thinking"
    confused_demo = "confused_demo"
    surprised = "surprised"
    celebrating = "celebrating"
    focused = "focused"


class ScreenSide(str, enum.Enum):
    left = "left"
    right = "right"
    center = "center"
    edge_left = "edge_left"
    edge_right = "edge_right"


class CharacterFacing(str, enum.Enum):
    left = "left"
    right = "right"
    forward = "forward"


# ---------------------------------------------------------------------------
# Pose definitions
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class PoseDefinition:
    pose_id: PoseId
    description: str
    intended_use: str
    safe_screen_side: ScreenSide
    character_facing_direction: CharacterFacing


POSE_LIBRARY: dict[PoseId, PoseDefinition] = {
    PoseId.idle_front: PoseDefinition(
        pose_id=PoseId.idle_front,
        description="Standing relaxed, arms at sides, facing camera",
        intended_use="Default/intro, character introduction moments",
        safe_screen_side=ScreenSide.center,
        character_facing_direction=CharacterFacing.forward,
    ),
    PoseId.idle_three_quarter: PoseDefinition(
        pose_id=PoseId.idle_three_quarter,
        description="Slight 3/4 angle, relaxed, arms slightly open",
        intended_use="Calm transitions, listening moments",
        safe_screen_side=ScreenSide.left,
        character_facing_direction=CharacterFacing.right,
    ),
    PoseId.explain_left: PoseDefinition(
        pose_id=PoseId.explain_left,
        description="Gesturing to left side with open hand",
        intended_use="Directing attention to left-side content",
        safe_screen_side=ScreenSide.right,
        character_facing_direction=CharacterFacing.left,
    ),
    PoseId.explain_right: PoseDefinition(
        pose_id=PoseId.explain_right,
        description="Gesturing to right side with open hand",
        intended_use="Directing attention to right-side content",
        safe_screen_side=ScreenSide.left,
        character_facing_direction=CharacterFacing.right,
    ),
    PoseId.point_left: PoseDefinition(
        pose_id=PoseId.point_left,
        description="Extended arm pointing left",
        intended_use="Highlighting specific element on left",
        safe_screen_side=ScreenSide.right,
        character_facing_direction=CharacterFacing.left,
    ),
    PoseId.point_right: PoseDefinition(
        pose_id=PoseId.point_right,
        description="Extended arm pointing right",
        intended_use="Highlighting specific element on right",
        safe_screen_side=ScreenSide.left,
        character_facing_direction=CharacterFacing.right,
    ),
    PoseId.point_up: PoseDefinition(
        pose_id=PoseId.point_up,
        description="Arm raised pointing upward",
        intended_use="Highlighting title or headline",
        safe_screen_side=ScreenSide.left,
        character_facing_direction=CharacterFacing.forward,
    ),
    PoseId.thinking: PoseDefinition(
        pose_id=PoseId.thinking,
        description="Hand near chin, thoughtful posture",
        intended_use="Introducing a question or problem",
        safe_screen_side=ScreenSide.left,
        character_facing_direction=CharacterFacing.forward,
    ),
    PoseId.happy: PoseDefinition(
        pose_id=PoseId.happy,
        description="Relaxed smile, open body language",
        intended_use="Positive reinforcement, success moments",
        safe_screen_side=ScreenSide.left,
        character_facing_direction=CharacterFacing.forward,
    ),
    PoseId.encouraging: PoseDefinition(
        pose_id=PoseId.encouraging,
        description="Slight forward lean, warm gesture",
        intended_use="Motivational moments, correction with encouragement",
        safe_screen_side=ScreenSide.left,
        character_facing_direction=CharacterFacing.forward,
    ),
    PoseId.surprised: PoseDefinition(
        pose_id=PoseId.surprised,
        description="Hands slightly raised, eyes wide",
        intended_use="Common misconception reveal",
        safe_screen_side=ScreenSide.left,
        character_facing_direction=CharacterFacing.forward,
    ),
    PoseId.recap: PoseDefinition(
        pose_id=PoseId.recap,
        description="Counting off points on fingers",
        intended_use="Summary/recap moments",
        safe_screen_side=ScreenSide.left,
        character_facing_direction=CharacterFacing.forward,
    ),
    PoseId.whiteboard_point: PoseDefinition(
        pose_id=PoseId.whiteboard_point,
        description="Arm extended to whiteboard/board area",
        intended_use="WhiteboardScene — pointing at board content",
        safe_screen_side=ScreenSide.edge_left,
        character_facing_direction=CharacterFacing.right,
    ),
    PoseId.hands_open: PoseDefinition(
        pose_id=PoseId.hands_open,
        description="Both hands open and slightly raised",
        intended_use="Open explanation, welcoming a concept",
        safe_screen_side=ScreenSide.center,
        character_facing_direction=CharacterFacing.forward,
    ),
    PoseId.attention: PoseDefinition(
        pose_id=PoseId.attention,
        description="One finger raised, alert posture",
        intended_use="Important note, key fact emphasis",
        safe_screen_side=ScreenSide.left,
        character_facing_direction=CharacterFacing.forward,
    ),
}


# ---------------------------------------------------------------------------
# Expression definitions
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ExpressionDefinition:
    expression_id: ExpressionId
    description: str
    intended_use: str
    emotional_tone: str


EXPRESSION_LIBRARY: dict[ExpressionId, ExpressionDefinition] = {
    ExpressionId.neutral: ExpressionDefinition(
        expression_id=ExpressionId.neutral,
        description="Calm, engaged, no strong emotion",
        intended_use="Default during explanations",
        emotional_tone="calm",
    ),
    ExpressionId.friendly_smile: ExpressionDefinition(
        expression_id=ExpressionId.friendly_smile,
        description="Warm, natural smile",
        intended_use="Introductions, greetings, positive transitions",
        emotional_tone="warm",
    ),
    ExpressionId.encouraging: ExpressionDefinition(
        expression_id=ExpressionId.encouraging,
        description="Supportive expression, slight nod quality",
        intended_use="Motivating student, positive reinforcement",
        emotional_tone="supportive",
    ),
    ExpressionId.thinking: ExpressionDefinition(
        expression_id=ExpressionId.thinking,
        description="Slightly raised eyebrow, thoughtful look",
        intended_use="Introducing a problem or question to consider",
        emotional_tone="curious",
    ),
    ExpressionId.confused_demo: ExpressionDefinition(
        expression_id=ExpressionId.confused_demo,
        description="Mild confusion — demonstrating a common mistake",
        intended_use="Misconception correction scenes",
        emotional_tone="puzzled",
    ),
    ExpressionId.surprised: ExpressionDefinition(
        expression_id=ExpressionId.surprised,
        description="Eyes slightly wide, mild surprise",
        intended_use="Revealing unexpected facts, common mistake reveals",
        emotional_tone="surprised",
    ),
    ExpressionId.celebrating: ExpressionDefinition(
        expression_id=ExpressionId.celebrating,
        description="Bright smile, positive energy",
        intended_use="Success moments, lesson completion",
        emotional_tone="joyful",
    ),
    ExpressionId.focused: ExpressionDefinition(
        expression_id=ExpressionId.focused,
        description="Attentive, serious but not stern",
        intended_use="Core concept delivery, important rules",
        emotional_tone="focused",
    ),
}


# ---------------------------------------------------------------------------
# Character outfit spec
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class OutfitSpec:
    primary_garment: str
    brand_element: str
    brand_logo_position: str
    color_scheme: str
    accessories: list[str]
    prohibited: list[str]


CANONICAL_OUTFIT = OutfitSpec(
    primary_garment="Crew-neck short-sleeve shirt",
    brand_element="ELARION wordmark logo",
    brand_logo_position="Left chest, approximately 10% of shirt width",
    color_scheme="Deep navy (#1A237E) shirt, white ELARION logo text",
    accessories=[],   # No accessories on canonical character
    prohibited=[
        "jewelry", "earrings", "necklace", "watch", "rings",
        "fashion-model styling", "glamour elements",
        "sexualized appearance", "outfit changes between episodes"
    ],
)


# ---------------------------------------------------------------------------
# Master character profile — THE SINGLE SOURCE OF TRUTH
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class CharacterProfile:
    character_id: str
    version: str
    display_name: str
    age_visual: str
    gender: CharacterGender
    style: CharacterStyle
    skin_tone_reference: str
    hair_style: str
    hair_color: str
    eye_color: str
    body_proportions: str
    default_expression: ExpressionId
    default_pose: PoseId
    render_orientation: RenderOrientation
    default_scale: float
    outfit: OutfitSpec

    # Consistency rules — attributes that MUST NOT change across assets
    immutable_attributes: tuple[str, ...] = field(default_factory=tuple)

    def validate(self) -> None:
        """Raise ValueError if any immutable attribute is missing."""
        required = self.immutable_attributes
        for attr in required:
            if getattr(self, attr, None) is None:
                raise ValueError(f"CharacterProfile missing required immutable attribute: {attr}")


# The one and only approved ELARION teacher character
ELARION_TEACHER_V1: CharacterProfile = CharacterProfile(
    character_id="elarion-teacher",
    version="v1",
    display_name="ELARION Teacher",
    age_visual="17–18",
    gender=CharacterGender.female,
    style=CharacterStyle.cartoon_3d,
    skin_tone_reference="Medium warm — Hex approx #C68642",
    hair_style="Straight shoulder-length with subtle layering",
    hair_color="Dark brown (#2C1A0E)",
    eye_color="Dark brown (#3E1C00)",
    body_proportions="Slightly stylized — head 1/6 body height (cartoon-realistic balance)",
    default_expression=ExpressionId.neutral,
    default_pose=PoseId.idle_three_quarter,
    render_orientation=RenderOrientation.three_quarter_left,
    default_scale=1.0,
    outfit=CANONICAL_OUTFIT,
    immutable_attributes=(
        "character_id", "version", "gender", "style",
        "skin_tone_reference", "hair_style", "hair_color",
        "eye_color", "body_proportions",
    ),
)


# Alias — always reference this constant, never construct a new CharacterProfile inline
CANONICAL_CHARACTER = ELARION_TEACHER_V1


# ---------------------------------------------------------------------------
# Character consistency rule enforcement
# ---------------------------------------------------------------------------

FORBIDDEN_PROMPT_WORDS = [
    "different character", "another character", "new character",
    "random girl", "random woman", "varied appearance",
    "changing hair", "different outfit", "no logo", "without logo",
    "older woman", "younger child", "boy", "man", "male teacher",
    "fashion model", "sexy", "glamour", "edgy", "goth", "anime",
    "2d", "sketch", "watercolor", "pixel art",
]


def validate_no_identity_drift(prompt: str) -> None:
    """Raise ValueError if prompt text would cause character identity drift."""
    prompt_lower = prompt.lower()
    violations = [w for w in FORBIDDEN_PROMPT_WORDS if w in prompt_lower]
    if violations:
        raise ValueError(
            f"Character prompt contains forbidden identity-drift terms: {violations}. "
            "All image generation must use the canonical character spec."
        )


def get_character_render_prompt_fragment() -> str:
    """
    Returns the canonical character description fragment for use in
    image-generation prompts. Always prepend this to any scene prompt.
    """
    c = CANONICAL_CHARACTER
    o = c.outfit
    return (
        f"A {c.age_visual}-year-old {c.gender.value} character in full {c.style.value} style. "
        f"Shoulder-length dark brown straight hair, warm medium skin tone, dark brown eyes. "
        f"Wearing a {o.color_scheme} with {o.brand_element} on the {o.brand_logo_position}. "
        "Friendly, intelligent, approachable expression. "
        "Classroom-appropriate, no jewelry, no accessories. "
        "Consistent identity — same character as all prior renders."
    )
