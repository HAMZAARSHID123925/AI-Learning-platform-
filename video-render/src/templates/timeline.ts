/**
 * ELARION — Lesson timeline.
 *
 * Pure functions shared by the scene template (what to draw at a frame) and
 * the renderer (which frames actually change). Keeping both in one place is
 * what makes the keyframe render safe: the stage layer is only re-rendered
 * on frames listed here, and held as a still everywhere else.
 */
import { MOTION } from "./theme";
import type { RenderPayload, SceneData, AudioClip } from "../types";

export interface SubtitleChunk { text: string; start: number }

export function subtitleChunks(narration: string, audioFrames: number): SubtitleChunk[] {
  const re = new RegExp(`(?:\\S+\\s*){1,${MOTION.subtitleWords}}`, "g");
  const texts = narration.match(re) || [narration];
  const counts = texts.map((c) => c.trim().split(/\s+/).length);
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  const duration = Math.max(1, audioFrames);
  let cum = 0;
  return texts.map((text, i) => {
    const start = i === 0 ? 0 : Math.ceil((cum / total) * duration);
    cum += counts[i];
    return { text: text.trim(), start };
  });
}

export function subtitleAt(chunks: SubtitleChunk[], frame: number): string {
  let current = chunks[0]?.text ?? "";
  for (const c of chunks) if (frame >= c.start) current = c.text;
  return current;
}

export function revealStart(i: number, count: number, audioFrames: number): number {
  return Math.round(MOTION.revealStart + (i / Math.max(1, count)) * Math.max(1, audioFrames) * MOTION.revealWindow);
}

export interface SceneTiming {
  scene: SceneData;
  clip: AudioClip;
  index: number;
  from: number;            // first global frame
  durationFrames: number;  // includes padding after the audio
  audioFrames: number;     // narration length
}

export interface LessonTimeline {
  fps: number;
  scenes: SceneTiming[];
  totalFrames: number;
}

export function buildTimeline(payload: RenderPayload): LessonTimeline {
  const fps = payload.video_config.fps;
  let from = 0;
  const scenes = payload.scenes.map((scene, index) => {
    const clip = payload.audio_manifest.scenes.find((c) => c.scene_id === scene.scene_id);
    if (!clip) throw new Error(`No audio clip for scene ${scene.scene_id}`);
    const durationFrames = Math.ceil(clip.render_duration_seconds * fps);
    const audioFrames = Math.ceil(clip.duration_seconds * fps);
    const t: SceneTiming = { scene, clip, index, from, durationFrames, audioFrames };
    from += durationFrames;
    return t;
  });
  return { fps, scenes, totalFrames: from };
}

/** Local frame ranges (inclusive) during which the stage layer changes. */
export function sceneActiveRanges(t: SceneTiming): Array<[number, number]> {
  const { scene, durationFrames, audioFrames } = t;
  const last = durationFrames - 1;
  const ranges: Array<[number, number]> = [
    [0, MOTION.enterFrames],
    [Math.max(0, durationFrames - MOTION.exitFrames), last],
  ];
  const points = scene.on_screen_text || scene.bullets || [scene.heading || ""];
  points.forEach((_, i) => {
    const s = revealStart(i, points.length, audioFrames);
    ranges.push([s, s + MOTION.revealSpan]);
  });
  const d = scene.diagram;
  if (d && d.kind !== "none") {
    const n = d.kind === "number_line" ? d.values.length : d.labels.length;
    for (let i = 0; i < n; i++) {
      const s = revealStart(i, n, audioFrames);
      ranges.push([s, s + MOTION.revealSpan]);
    }
  }
  for (const c of subtitleChunks(scene.narration, audioFrames)) ranges.push([c.start, c.start]);
  return ranges
    .map(([a, b]): [number, number] => [Math.max(0, Math.min(a, last)), Math.max(0, Math.min(b, last))])
    .filter(([a, b]) => a <= b);
}

/** Sorted unique global frames that must be rendered; every other frame is a
 *  hold of the previous rendered frame. */
export function activeFrames(timeline: LessonTimeline): number[] {
  const set = new Set<number>();
  for (const t of timeline.scenes) {
    for (const [a, b] of sceneActiveRanges(t)) for (let f = a; f <= b; f++) set.add(t.from + f);
  }
  set.add(0);
  return [...set].filter((f) => f < timeline.totalFrames).sort((a, b) => a - b);
}

/** Map a global frame to its scene and local frame. */
export function locate(timeline: LessonTimeline, frame: number): { t: SceneTiming; local: number } {
  let t = timeline.scenes[timeline.scenes.length - 1];
  for (const s of timeline.scenes) if (frame >= s.from) t = s;
  return { t, local: Math.min(frame - t.from, t.durationFrames - 1) };
}
