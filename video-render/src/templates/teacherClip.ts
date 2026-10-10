/**
 * ELARION — Real-footage teacher clips (template assets).
 *
 * Green-screen clips of the presenters (generated in Google Flow / Veo), keyed
 * and sequenced by render.ts:
 *   talking — loops during narration
 *   idle    — the silent padding between scenes
 *   point   — gesture towards the content card when a new topic starts
 *
 * There is one TeacherClipSet per presenter. The backend picks the presenter
 * for a whole video (payload.teacher = "female" | "male") together with the
 * matching narration voice; render.ts looks the set up in TEACHER_PRESENTERS.
 * Override the clip folder with VIDEO_TEACHER_CLIPS. Within one set all clips
 * must share framing; `crop` (source pixels) and `place` (canvas pixels)
 * apply to all three of them.
 */
export interface TeacherClipSet {
  dir: string;                                                    // relative to video-render/
  files: { talking: string; idle: string; point: string };
  mirror: { talking: boolean; idle: boolean; point: boolean };   // flip horizontally
  crop: { x: number; y: number; width: number; height: number };
  key: { color: string; similarity: number; blend: number; despill: number; expand?: number };  // expand: despill spread (default 0.3)
  place: { left: number; bottom: number; height: number };
  /** Usable part of the point clip: starts at neutral, gesture, back to neutral. */
  pointWindow: { start: number; end: number };                    // seconds in the source clip
  /** Minimum narration length (s) for a scene to open with the pointing gesture. */
  pointMinAudio: number;
}

export type TeacherName = "female" | "male";

export const DEFAULT_TEACHER: TeacherName = "female";

export const TEACHER_PRESENTERS: Record<TeacherName, TeacherClipSet> = {
  female: {
    dir: "assets",
    files: { talking: "teacher_talking.mp4", idle: "teacher_idle.mp4", point: "teacher_point.mp4" },
    mirror: { talking: false, idle: false, point: true },         // she points to her right in the source
    crop: { x: 300, y: 0, width: 1620, height: 1080 },
    key: { color: "0x20B650", similarity: 0.13, blend: 0.02, despill: 0.5 },
    place: { left: -123, bottom: 0, height: 960 },
    pointWindow: { start: 0.8, end: 7.2 },
    pointMinAudio: 14,
  },
  male: {
    // Flow clips 2026-10-10: lighter green (≈ #5CB361), presenter centred, head top ≈ y 56.
    // Lower similarity than the female set: her green was more saturated, and 0.13
    // here starts eating the navy blazer. despill kept mild so the blue shirt stays blue.
    dir: "assets",
    files: { talking: "teacher_m_talking.mp4", idle: "teacher_m_idle.mp4", point: "teacher_m_point.mp4" },
    mirror: { talking: false, idle: false, point: true },         // he raises his right hand (screen left)
    crop: { x: 150, y: 0, width: 1620, height: 1080 },
    key: { color: "0x5CB361", similarity: 0.10, blend: 0.02, despill: 0.3, expand: 0 },
    place: { left: -330, bottom: 0, height: 920 },                // centred clip → shift left so his shoulder clears the card
    pointWindow: { start: 0.8, end: 7.2 },
    pointMinAudio: 14,
  },
};

/** Kept for older imports: the default presenter's set. */
export const TEACHER_CLIPS: TeacherClipSet = TEACHER_PRESENTERS[DEFAULT_TEACHER];
