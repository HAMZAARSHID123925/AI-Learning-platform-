/**
 * ELARION — Video Render Service
 * src/design.ts
 *
 * Design tokens mirroring M3.3 visual/design_tokens.py.
 * These are the ONLY source of colors/typography in components.
 */

export const CANVAS = { width: 1920, height: 1080, fps: 30 };

export const PALETTE = {
  brandPrimary: "#1A237E",
  brandSecondary: "#3949AB",
  brandAccent: "#7C4DFF",
  brandHighlight: "#00BCD4",

  bgClassroom: "#F5F7FA",
  bgDigital: "#0D1B2A",
  bgWhiteboard: "#FAFAFA",
  bgConcept: "#1A237E",
  bgRecap: "#1B2A3B",

  textPrimaryLight: "#1A1A2E",
  textPrimaryDark: "#F0F4FF",
  textMuted: "#6B7A9A",

  panelLight: "#FFFFFF",
  panelLightBorder: "#E0E4F0",
  panelDark: "#1E2D45",
  panelDarkBorder: "#2A3F60",

  correctGreen: "#4CAF50",
  errorRed: "#F44336",
  warningAmber: "#FF9800",

  subtitleBg: "rgba(0,0,0,0.72)",
  subtitleText: "#FFFFFF",
};

export const FONT = "Inter, system-ui, sans-serif";

export const TEXT_LIMITS = {
  maxTitleWords: 8,
  maxBodyWords: 30,
  maxBullets: 3,
  maxCaptionChars: 120,
};

export const LAYOUT = {
  marginTop: 80,
  marginBottom: 120,
  marginLeft: 100,
  marginRight: 100,
  safeSubtitleBottom: 20,
  subtitleHeight: 80,
  subtitleFontSize: 30,
  titleFontSize: 64,
  headingFontSize: 48,
  bodyFontSize: 34,
  captionFontSize: 26,
  bulletFontSize: 32,
  labelFontSize: 28,
  borderRadius: 16,
  panelPadding: 48,
};

// Character placeholder path — DEV PLACEHOLDER, not production asset
export const CHARACTER_PLACEHOLDER = {
  version: "elarion-teacher-v1",
  label: "⚠ DEV PLACEHOLDER — Not production character asset",
};
