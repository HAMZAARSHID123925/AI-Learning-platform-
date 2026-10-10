/**
 * ELARION — Video template theme.
 *
 * Everything that must look IDENTICAL in every generated video lives here:
 * canvas, colours, header/footer, teacher placement. Scene templates and the
 * teacher loop read from this file only, so a brand change is a one-file edit.
 */

export const CANVAS = { width: 1920, height: 1080, fps: 30 };

export const THEME = {
  fontFamily: "Arial, Helvetica, sans-serif",
  background: ["#FFF8EE", "#EEF4FF"],          // alternates per scene
  backgroundGlow: "radial-gradient(circle at 10% 35%, #D9E6FF 0, transparent 45%)",
  brandName: "PEN & PAGE ACADEMIA",
  brandSub: "JUNIOR SCHOOL",
  brandNavy: "#27317A",
  brandGold: "#E9A826",
  headerText: "PEN & PAGE ACADEMIA · JUNIOR SCHOOL",
  headerColor: "#27317A",
  ink: "#182C50",
  accent: "#7261CB",
  accentSoft: "#6D57B4",
  cardBg: "#FFFFFF",
  cardShadow: "0 12px 45px #24427214",
  pointBg: "#F0F3FF",
  pointBgRecap: "#ECF8F0",
  subtitleBg: "#182C50",
  subtitleText: "#FFFFFF",
};

/** Fixed layout of the stage (positions in 1920x1080 canvas pixels). */
export const LAYOUT = {
  header: { left: 56, top: 14, logoHeight: 178 },
  card: { left: 690, right: 80, top: 200, bottom: 150, radius: 32, padding: "36px 46px" },
  shelf: { right: 90, top: 30 },
  subtitle: { left: 690, right: 80, bottom: 40, minHeight: 80, fontSize: 32 },
  // The teacher is NOT part of the stage: it is overlaid from a pre-rendered
  // loop. These values place that loop (box = teacher composition size).
  teacher: { left: 20, bottom: 0, width: 520, height: 760 },
};

/** Animation timing (frames at 30 fps). Shared by the renderer's keyframe
 *  calculator and the scene template so both always agree. */
export const MOTION = {
  enterFrames: 12,
  exitFrames: 10,
  revealSpan: 16,
  revealStart: 18,
  revealWindow: 0.65,   // reveals are spread over the first 65 % of the audio
  subtitleWords: 10,    // words per subtitle chunk
};
