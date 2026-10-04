"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/visual/design_tokens.py

Purpose:
    Visual design system tokens for ELARION educational video production.
    Defines consistent typography, color, layout, and style values
    that must be used across all generated scene templates.

    Changing these tokens changes the look of ALL future videos.
    Increment design_system_version when making breaking visual changes.
"""

from __future__ import annotations

import enum
from dataclasses import dataclass, field


DESIGN_SYSTEM_VERSION = "v1"

# ---------------------------------------------------------------------------
# Canvas / Output
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class CanvasSpec:
    width_px: int
    height_px: int
    aspect_ratio: str
    frame_rate: int
    color_space: str


CANONICAL_CANVAS = CanvasSpec(
    width_px=1920,
    height_px=1080,
    aspect_ratio="16:9",
    frame_rate=30,
    color_space="sRGB",
)


# ---------------------------------------------------------------------------
# Color palette
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ColorPalette:
    # Brand
    brand_primary: str = "#1A237E"       # Deep navy — main brand color
    brand_secondary: str = "#3949AB"     # Lighter indigo
    brand_accent: str = "#7C4DFF"        # Purple accent
    brand_highlight: str = "#00BCD4"     # Teal highlight

    # Backgrounds
    bg_classroom: str = "#F5F7FA"        # Light cool white
    bg_digital: str = "#0D1B2A"          # Deep dark blue-grey
    bg_whiteboard: str = "#FAFAFA"       # Near-white
    bg_concept: str = "#1A237E"          # Brand primary for concept scenes
    bg_recap: str = "#1B2A3B"            # Dark calm

    # Text
    text_primary_light: str = "#1A1A2E"  # For light backgrounds
    text_primary_dark: str = "#F0F4FF"   # For dark backgrounds
    text_muted: str = "#6B7A9A"

    # Panels
    panel_light: str = "#FFFFFF"
    panel_light_border: str = "#E0E4F0"
    panel_dark: str = "#1E2D45"
    panel_dark_border: str = "#2A3F60"

    # Semantic
    correct_green: str = "#4CAF50"
    error_red: str = "#F44336"
    warning_amber: str = "#FF9800"
    info_blue: str = "#2196F3"

    # Caption / subtitle strip
    subtitle_bg: str = "rgba(0,0,0,0.72)"
    subtitle_text: str = "#FFFFFF"


PALETTE = ColorPalette()


# ---------------------------------------------------------------------------
# Typography
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class TypographyToken:
    font_family: str
    font_size_px: int
    font_weight: str
    line_height: float
    letter_spacing_em: float = 0.0
    text_transform: str = "none"


@dataclass(frozen=True)
class TypographySystem:
    # Scene headings
    heading_scene: TypographyToken = field(default_factory=lambda: TypographyToken(
        font_family="Inter", font_size_px=72, font_weight="700", line_height=1.1
    ))
    heading_section: TypographyToken = field(default_factory=lambda: TypographyToken(
        font_family="Inter", font_size_px=52, font_weight="600", line_height=1.2
    ))

    # Body content
    body_primary: TypographyToken = field(default_factory=lambda: TypographyToken(
        font_family="Inter", font_size_px=36, font_weight="400", line_height=1.5
    ))
    body_emphasis: TypographyToken = field(default_factory=lambda: TypographyToken(
        font_family="Inter", font_size_px=36, font_weight="600", line_height=1.5
    ))

    # Labels and captions
    label: TypographyToken = field(default_factory=lambda: TypographyToken(
        font_family="Inter", font_size_px=28, font_weight="500", line_height=1.4
    ))
    caption: TypographyToken = field(default_factory=lambda: TypographyToken(
        font_family="Inter", font_size_px=24, font_weight="400", line_height=1.4
    ))

    # Subtitles (separate from scene body)
    subtitle: TypographyToken = field(default_factory=lambda: TypographyToken(
        font_family="Inter", font_size_px=30, font_weight="400", line_height=1.4
    ))

    # Comparison panel labels
    comparison_label: TypographyToken = field(default_factory=lambda: TypographyToken(
        font_family="Inter", font_size_px=32, font_weight="700", line_height=1.3,
        text_transform="uppercase"
    ))


TYPOGRAPHY = TypographySystem()


# ---------------------------------------------------------------------------
# Spacing and layout tokens
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class LayoutTokens:
    # Margins — minimum safe distance from canvas edge (px)
    margin_top: int = 80
    margin_bottom: int = 120     # Extra for subtitle strip
    margin_left: int = 100
    margin_right: int = 100

    # Grid unit
    base_unit: int = 8           # 8px grid system

    # Corner radii
    radius_sm: int = 8
    radius_md: int = 16
    radius_lg: int = 24
    radius_xl: int = 40

    # Shadows
    shadow_light: str = "0 4px 24px rgba(0,0,0,0.08)"
    shadow_medium: str = "0 8px 40px rgba(0,0,0,0.18)"
    shadow_heavy: str = "0 16px 64px rgba(0,0,0,0.32)"

    # Panel padding
    panel_padding_sm: int = 24
    panel_padding_md: int = 40
    panel_padding_lg: int = 64


LAYOUT = LayoutTokens()


# ---------------------------------------------------------------------------
# Style definitions per environment
# ---------------------------------------------------------------------------

class IconStyle(str, enum.Enum):
    outline = "outline"           # Clean line icons
    filled = "filled"             # Solid fill icons
    duotone = "duotone"           # Two-tone


class DiagramStyle(str, enum.Enum):
    clean_nodes = "clean_nodes"   # Node/edge diagrams
    simple_arrows = "simple_arrows"
    bar_chart = "bar_chart"
    pie_chart = "pie_chart"
    comparison_table = "comparison_table"
    labeled_image = "labeled_image"


@dataclass(frozen=True)
class EnvironmentStyle:
    environment_id: str
    display_name: str
    background_color_ref: str     # Key into ColorPalette
    panel_style: str
    text_color_ref: str
    icon_style: IconStyle
    diagram_style_default: DiagramStyle
    supports_whiteboard: bool
    description: str


# ---------------------------------------------------------------------------
# Environment library
# ---------------------------------------------------------------------------

ENVIRONMENT_LIBRARY: dict[str, EnvironmentStyle] = {
    "modern-classroom-v1": EnvironmentStyle(
        environment_id="modern-classroom-v1",
        display_name="Modern Classroom",
        background_color_ref="bg_classroom",
        panel_style="white card with light border",
        text_color_ref="text_primary_light",
        icon_style=IconStyle.outline,
        diagram_style_default=DiagramStyle.simple_arrows,
        supports_whiteboard=False,
        description=(
            "Bright classroom aesthetic. Warm light, educational feel. "
            "Use for general concept explanation."
        ),
    ),
    "whiteboard-v1": EnvironmentStyle(
        environment_id="whiteboard-v1",
        display_name="Whiteboard Teaching Scene",
        background_color_ref="bg_whiteboard",
        panel_style="whiteboard surface",
        text_color_ref="text_primary_light",
        icon_style=IconStyle.outline,
        diagram_style_default=DiagramStyle.simple_arrows,
        supports_whiteboard=True,
        description=(
            "Character stands beside large whiteboard. "
            "Drawn-on diagrams and annotations. Use for step-by-step explanations."
        ),
    ),
    "digital-concept-v1": EnvironmentStyle(
        environment_id="digital-concept-v1",
        display_name="Digital Concept Board",
        background_color_ref="bg_digital",
        panel_style="dark card with glow border",
        text_color_ref="text_primary_dark",
        icon_style=IconStyle.duotone,
        diagram_style_default=DiagramStyle.clean_nodes,
        supports_whiteboard=False,
        description=(
            "Dark premium digital environment. "
            "Floating concept panels, glowing accents. Use for tech concepts and science."
        ),
    ),
    "comparison-v1": EnvironmentStyle(
        environment_id="comparison-v1",
        display_name="Simple Comparison Scene",
        background_color_ref="bg_concept",
        panel_style="side-by-side panels",
        text_color_ref="text_primary_dark",
        icon_style=IconStyle.filled,
        diagram_style_default=DiagramStyle.comparison_table,
        supports_whiteboard=False,
        description=(
            "Two-panel layout for comparing concepts. "
            "Use for versus scenes: CPU vs RAM, Addition vs Subtraction, etc."
        ),
    ),
    "diagram-v1": EnvironmentStyle(
        environment_id="diagram-v1",
        display_name="Diagram-Focused Scene",
        background_color_ref="bg_classroom",
        panel_style="white diagram zone",
        text_color_ref="text_primary_light",
        icon_style=IconStyle.outline,
        diagram_style_default=DiagramStyle.labeled_image,
        supports_whiteboard=False,
        description=(
            "Large central diagram with labels. Character to the side. "
            "Use for anatomy, labeled parts, process flows."
        ),
    ),
    "example-v1": EnvironmentStyle(
        environment_id="example-v1",
        display_name="Example Scene",
        background_color_ref="bg_classroom",
        panel_style="white card",
        text_color_ref="text_primary_light",
        icon_style=IconStyle.outline,
        diagram_style_default=DiagramStyle.simple_arrows,
        supports_whiteboard=False,
        description=(
            "Worked example layout. Step-by-step walkthrough with character guiding."
        ),
    ),
    "recap-v1": EnvironmentStyle(
        environment_id="recap-v1",
        display_name="Recap Scene",
        background_color_ref="bg_recap",
        panel_style="dark minimal list",
        text_color_ref="text_primary_dark",
        icon_style=IconStyle.filled,
        diagram_style_default=DiagramStyle.simple_arrows,
        supports_whiteboard=False,
        description=(
            "Clean summary environment. Dark calm. Up to 3 bullet points. "
            "Character in recap pose."
        ),
    ),
    "quiz-prompt-v1": EnvironmentStyle(
        environment_id="quiz-prompt-v1",
        display_name="Quiz Prompt Scene",
        background_color_ref="bg_concept",
        panel_style="question card with accent border",
        text_color_ref="text_primary_dark",
        icon_style=IconStyle.filled,
        diagram_style_default=DiagramStyle.simple_arrows,
        supports_whiteboard=False,
        description=(
            "Interactive feel. Question prompt card. "
            "No correct answer shown — student is prompted to think."
        ),
    ),
}
