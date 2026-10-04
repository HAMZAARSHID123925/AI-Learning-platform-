"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/visual/templates.py

Purpose:
    Reusable scene template definitions for ELARION educational videos.
    Each template defines layout contracts, content zones, character slots,
    text limits, and Remotion-compatible prop schemas.

    Templates are STABLE CONTRACTS — changing a template's layout spec
    must increment its version.

    M3.4 (TTS/audio) will attach narration_clip_id to these templates.
    M3.5 (Remotion) will consume these as React component props.
    DO NOT add audio or rendering logic here.
"""

from __future__ import annotations

import enum
from dataclasses import dataclass, field
from typing import Any, Optional

from app.modules.module6_adaptive.visual.character import (
    PoseId, ExpressionId, ScreenSide
)
from app.modules.module6_adaptive.visual.design_tokens import ENVIRONMENT_LIBRARY


# ---------------------------------------------------------------------------
# Scene type enum — must match M3.2 scene_json scene_type values
# ---------------------------------------------------------------------------

class SceneType(str, enum.Enum):
    """
    Controlled vocabulary for scene_type in scene_json.
    The LLM must only emit values from this enum.
    """
    intro = "intro"
    concept = "concept"
    comparison = "comparison"
    whiteboard = "whiteboard"
    diagram = "diagram"
    example = "example"
    misconception_correction = "misconception_correction"
    recap = "recap"
    quiz_prompt = "quiz_prompt"


# ---------------------------------------------------------------------------
# Layout zone definitions
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class PixelRect:
    x: int
    y: int
    width: int
    height: int


@dataclass(frozen=True)
class LayoutZones:
    """
    Safe content placement zones for a 1920x1080 canvas.
    All coordinates in pixels, origin top-left.

    Character must NEVER overlap text, diagram, or content zones.
    """
    # Character safe slot — these are the allowed character bounding boxes
    character_left: PixelRect    # Character on left side
    character_right: PixelRect   # Character on right side
    character_center: PixelRect  # Character centered (intro only)

    # Content zones
    title_zone: PixelRect
    body_zone: PixelRect
    diagram_zone: PixelRect
    left_panel: PixelRect
    right_panel: PixelRect
    caption_zone: PixelRect
    subtitle_zone: PixelRect     # Bottom subtitle strip
    whiteboard_zone: PixelRect


# Standard 1920x1080 layout zones
STANDARD_LAYOUT = LayoutZones(
    # Character slots: tall portrait bounding boxes
    character_left=PixelRect(x=40, y=180, width=480, height=820),
    character_right=PixelRect(x=1400, y=180, width=480, height=820),
    character_center=PixelRect(x=720, y=200, width=480, height=820),

    # Title area: top of screen, full width safe area
    title_zone=PixelRect(x=100, y=60, width=1720, height=130),

    # Body text: right half when char is left; left half when char is right
    body_zone=PixelRect(x=560, y=200, width=1260, height=720),

    # Diagram zone: large central area
    diagram_zone=PixelRect(x=560, y=220, width=1260, height=680),

    # Two-panel comparison layout
    left_panel=PixelRect(x=100, y=200, width=800, height=720),
    right_panel=PixelRect(x=1020, y=200, width=800, height=720),

    # Caption strip (above subtitle)
    caption_zone=PixelRect(x=100, y=900, width=1720, height=80),

    # Subtitle strip: very bottom
    subtitle_zone=PixelRect(x=0, y=980, width=1920, height=100),

    # Whiteboard surface (right of character)
    whiteboard_zone=PixelRect(x=540, y=100, width=1300, height=880),
)


# ---------------------------------------------------------------------------
# Text limit rules
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class TextLimits:
    max_title_words: int
    max_body_words_visible: int
    max_bullet_count: int
    max_comparison_label_words: int
    max_caption_chars: int


# Strict limits — reject scenes that exceed these
STANDARD_TEXT_LIMITS = TextLimits(
    max_title_words=8,
    max_body_words_visible=30,
    max_bullet_count=3,
    max_comparison_label_words=4,
    max_caption_chars=120,
)


# ---------------------------------------------------------------------------
# Template definition
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class SceneTemplateDefinition:
    template_id: str
    version: str
    supported_scene_types: tuple[SceneType, ...]
    description: str

    # Character defaults for this template
    default_character_pose: PoseId
    default_expression: ExpressionId
    default_character_position: ScreenSide
    character_scale: float

    # Content zone visibility
    has_title: bool
    has_body_text: bool
    has_diagram: bool
    has_comparison_panels: bool
    has_whiteboard: bool
    has_caption: bool
    has_subtitle: bool

    # Environment default
    default_environment_id: str

    # Text limits (can override global)
    text_limits: TextLimits

    # Preferred duration
    min_duration_seconds: int
    max_duration_seconds: int

    # Animation intent (descriptive — for future Remotion)
    animation_intent: str

    # Remotion component name
    remotion_component: str


# ---------------------------------------------------------------------------
# Template library
# ---------------------------------------------------------------------------

TEMPLATE_LIBRARY: dict[str, SceneTemplateDefinition] = {

    "intro-v1": SceneTemplateDefinition(
        template_id="intro-v1",
        version="v1",
        supported_scene_types=(SceneType.intro,),
        description="Lesson opening. Character centered or slightly left. Warm greeting, topic preview.",
        default_character_pose=PoseId.idle_front,
        default_expression=ExpressionId.friendly_smile,
        default_character_position=ScreenSide.left,
        character_scale=1.0,
        has_title=True,
        has_body_text=True,
        has_diagram=False,
        has_comparison_panels=False,
        has_whiteboard=False,
        has_caption=False,
        has_subtitle=True,
        default_environment_id="modern-classroom-v1",
        text_limits=TextLimits(
            max_title_words=8,
            max_body_words_visible=20,
            max_bullet_count=0,
            max_comparison_label_words=0,
            max_caption_chars=0,
        ),
        min_duration_seconds=8,
        max_duration_seconds=20,
        animation_intent="Fade in character and title. Slide up greeting text.",
        remotion_component="IntroScene",
    ),

    "concept-v1": SceneTemplateDefinition(
        template_id="concept-v1",
        version="v1",
        supported_scene_types=(SceneType.concept,),
        description="Core concept explanation. Character left, content panel right.",
        default_character_pose=PoseId.explain_right,
        default_expression=ExpressionId.focused,
        default_character_position=ScreenSide.left,
        character_scale=0.9,
        has_title=True,
        has_body_text=True,
        has_diagram=False,
        has_comparison_panels=False,
        has_whiteboard=False,
        has_caption=True,
        has_subtitle=True,
        default_environment_id="modern-classroom-v1",
        text_limits=TextLimits(
            max_title_words=6,
            max_body_words_visible=30,
            max_bullet_count=3,
            max_comparison_label_words=0,
            max_caption_chars=120,
        ),
        min_duration_seconds=15,
        max_duration_seconds=45,
        animation_intent="Slide in character left. Reveal content panel from right.",
        remotion_component="ConceptScene",
    ),

    "comparison-v1": SceneTemplateDefinition(
        template_id="comparison-v1",
        version="v1",
        supported_scene_types=(SceneType.comparison,),
        description="Side-by-side comparison of two concepts. Character edge-left or hidden.",
        default_character_pose=PoseId.point_right,
        default_expression=ExpressionId.focused,
        default_character_position=ScreenSide.edge_left,
        character_scale=0.75,
        has_title=True,
        has_body_text=False,
        has_diagram=False,
        has_comparison_panels=True,
        has_whiteboard=False,
        has_caption=True,
        has_subtitle=True,
        default_environment_id="comparison-v1",
        text_limits=TextLimits(
            max_title_words=6,
            max_body_words_visible=0,
            max_bullet_count=3,
            max_comparison_label_words=4,
            max_caption_chars=80,
        ),
        min_duration_seconds=15,
        max_duration_seconds=40,
        animation_intent="Panels slide in from sides. Character points between them.",
        remotion_component="ComparisonScene",
    ),

    "whiteboard-v1": SceneTemplateDefinition(
        template_id="whiteboard-v1",
        version="v1",
        supported_scene_types=(SceneType.whiteboard,),
        description="Character stands beside whiteboard. Drawn annotations on board.",
        default_character_pose=PoseId.whiteboard_point,
        default_expression=ExpressionId.focused,
        default_character_position=ScreenSide.edge_left,
        character_scale=0.85,
        has_title=False,
        has_body_text=False,
        has_diagram=True,
        has_comparison_panels=False,
        has_whiteboard=True,
        has_caption=True,
        has_subtitle=True,
        default_environment_id="whiteboard-v1",
        text_limits=TextLimits(
            max_title_words=0,
            max_body_words_visible=20,
            max_bullet_count=3,
            max_comparison_label_words=0,
            max_caption_chars=100,
        ),
        min_duration_seconds=15,
        max_duration_seconds=60,
        animation_intent="Character appears. Whiteboard content draws in progressively.",
        remotion_component="WhiteboardScene",
    ),

    "diagram-v1": SceneTemplateDefinition(
        template_id="diagram-v1",
        version="v1",
        supported_scene_types=(SceneType.diagram,),
        description="Large central diagram with labels. Character to the side.",
        default_character_pose=PoseId.point_right,
        default_expression=ExpressionId.focused,
        default_character_position=ScreenSide.left,
        character_scale=0.8,
        has_title=True,
        has_body_text=False,
        has_diagram=True,
        has_comparison_panels=False,
        has_whiteboard=False,
        has_caption=True,
        has_subtitle=True,
        default_environment_id="diagram-v1",
        text_limits=TextLimits(
            max_title_words=6,
            max_body_words_visible=0,
            max_bullet_count=0,
            max_comparison_label_words=4,
            max_caption_chars=100,
        ),
        min_duration_seconds=15,
        max_duration_seconds=50,
        animation_intent="Diagram builds in labeled layers. Character gestures to each part.",
        remotion_component="DiagramScene",
    ),

    "example-v1": SceneTemplateDefinition(
        template_id="example-v1",
        version="v1",
        supported_scene_types=(SceneType.example,),
        description="Worked example walkthrough. Step-by-step reveal.",
        default_character_pose=PoseId.explain_right,
        default_expression=ExpressionId.neutral,
        default_character_position=ScreenSide.left,
        character_scale=0.9,
        has_title=True,
        has_body_text=True,
        has_diagram=False,
        has_comparison_panels=False,
        has_whiteboard=False,
        has_caption=True,
        has_subtitle=True,
        default_environment_id="example-v1",
        text_limits=TextLimits(
            max_title_words=6,
            max_body_words_visible=30,
            max_bullet_count=3,
            max_comparison_label_words=0,
            max_caption_chars=120,
        ),
        min_duration_seconds=15,
        max_duration_seconds=45,
        animation_intent="Steps appear one by one. Character reacts as each step lands.",
        remotion_component="ExampleScene",
    ),

    "misconception-v1": SceneTemplateDefinition(
        template_id="misconception-v1",
        version="v1",
        supported_scene_types=(SceneType.misconception_correction,),
        description="Common mistake reveal + correction. Uses surprised then encouraging expression.",
        default_character_pose=PoseId.surprised,
        default_expression=ExpressionId.confused_demo,
        default_character_position=ScreenSide.left,
        character_scale=0.9,
        has_title=True,
        has_body_text=True,
        has_diagram=False,
        has_comparison_panels=False,
        has_whiteboard=False,
        has_caption=True,
        has_subtitle=True,
        default_environment_id="modern-classroom-v1",
        text_limits=TextLimits(
            max_title_words=7,
            max_body_words_visible=25,
            max_bullet_count=2,
            max_comparison_label_words=0,
            max_caption_chars=100,
        ),
        min_duration_seconds=15,
        max_duration_seconds=40,
        animation_intent="Wrong answer revealed with subtle red highlight. Corrected with green. Character transitions expression.",
        remotion_component="MisconceptionScene",
    ),

    "recap-v1": SceneTemplateDefinition(
        template_id="recap-v1",
        version="v1",
        supported_scene_types=(SceneType.recap,),
        description="Lesson summary. Up to 3 bullet points. Dark calm scene.",
        default_character_pose=PoseId.recap,
        default_expression=ExpressionId.encouraging,
        default_character_position=ScreenSide.left,
        character_scale=0.85,
        has_title=True,
        has_body_text=False,
        has_diagram=False,
        has_comparison_panels=False,
        has_whiteboard=False,
        has_caption=False,
        has_subtitle=True,
        default_environment_id="recap-v1",
        text_limits=TextLimits(
            max_title_words=5,
            max_body_words_visible=0,
            max_bullet_count=3,
            max_comparison_label_words=0,
            max_caption_chars=0,
        ),
        min_duration_seconds=12,
        max_duration_seconds=30,
        animation_intent="Bullets appear one at a time as character counts them off.",
        remotion_component="RecapScene",
    ),

    "quiz-prompt-v1": SceneTemplateDefinition(
        template_id="quiz-prompt-v1",
        version="v1",
        supported_scene_types=(SceneType.quiz_prompt,),
        description="Question prompt for student. No answer shown. Thinking pause.",
        default_character_pose=PoseId.thinking,
        default_expression=ExpressionId.thinking,
        default_character_position=ScreenSide.left,
        character_scale=0.9,
        has_title=True,
        has_body_text=True,
        has_diagram=False,
        has_comparison_panels=False,
        has_whiteboard=False,
        has_caption=False,
        has_subtitle=False,
        default_environment_id="quiz-prompt-v1",
        text_limits=TextLimits(
            max_title_words=5,
            max_body_words_visible=20,
            max_bullet_count=0,
            max_comparison_label_words=0,
            max_caption_chars=0,
        ),
        min_duration_seconds=6,
        max_duration_seconds=15,
        animation_intent="Question card floats in. Character thinks. Pause held for viewer reflection.",
        remotion_component="QuizPromptScene",
    ),
}


# ---------------------------------------------------------------------------
# Scene type → template mapping
# ---------------------------------------------------------------------------

SCENE_TYPE_TO_TEMPLATE: dict[SceneType, str] = {
    SceneType.intro: "intro-v1",
    SceneType.concept: "concept-v1",
    SceneType.comparison: "comparison-v1",
    SceneType.whiteboard: "whiteboard-v1",
    SceneType.diagram: "diagram-v1",
    SceneType.example: "example-v1",
    SceneType.misconception_correction: "misconception-v1",
    SceneType.recap: "recap-v1",
    SceneType.quiz_prompt: "quiz-prompt-v1",
}


def resolve_template(scene_type: str) -> SceneTemplateDefinition:
    """
    Map a scene_json scene_type string to its canonical template.
    Raises ValueError for unsupported/unknown scene types.
    """
    try:
        st = SceneType(scene_type)
    except ValueError:
        raise ValueError(
            f"Unknown scene_type '{scene_type}'. Must be one of: "
            f"{[s.value for s in SceneType]}"
        )
    template_id = SCENE_TYPE_TO_TEMPLATE[st]
    return TEMPLATE_LIBRARY[template_id]
