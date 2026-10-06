/**
 * ELARION — Video Render Service
 * src/validate_payload.ts
 *
 * Validates a RenderPayload before render starts.
 * Called before Remotion bundler to fail early on bad input.
 *
 * Exit code 0 = valid
 * Exit code 1 = invalid (errors printed to stderr)
 */

import { RenderPayload, VALID_SCENE_TYPES, SceneType } from "./types";

export interface ValidationError {
  field: string;
  message: string;
}

export function validatePayload(payload: RenderPayload): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!payload || typeof payload !== "object") return [{field:"payload",message:"Payload must be an object"}];
  if (!Array.isArray(payload.scenes) || !Array.isArray(payload.audio_manifest?.scenes) || !Array.isArray(payload.asset_manifest?.scene_slots) || !payload.video_config) return [{field:"payload",message:"Scenes, audio, assets and video_config are required"}];
  if ([...payload.scenes,...payload.audio_manifest.scenes,...payload.asset_manifest.scene_slots].some(s=>!s || typeof s!=="object")) return [{field:"payload",message:"Invalid scene/clip/slot"}];
  // ── Basic structure ──────────────────────────────────────────────────────
  if (!payload.job_id) errors.push({ field: "job_id", message: "Missing job_id" });
  if (!payload.scenes?.length) errors.push({ field: "scenes", message: "No scenes in payload" });
  if (!payload.audio_manifest?.scenes?.length) {
    errors.push({ field: "audio_manifest.scenes", message: "No audio clips in manifest" });
  }
  if (!payload.asset_manifest?.scene_slots?.length) {
    errors.push({ field: "asset_manifest.scene_slots", message: "No asset slots in manifest" });
  }
  if (!payload.output_path) {
    errors.push({ field: "output_path", message: "Missing output_path" });
  }

  // ── Video config ─────────────────────────────────────────────────────────
  const vc = payload.video_config;
  if (vc.width !== 1920 || vc.height !== 1080) {
    errors.push({ field: "video_config", message: `Expected 1920x1080, got ${vc.width}x${vc.height}` });
  }
  if (vc.fps !== 30) {
    errors.push({ field: "video_config.fps", message: `Expected fps=30, got ${vc.fps}` });
  }

  // ── Scene validation ─────────────────────────────────────────────────────
  for (const scene of payload.scenes ?? []) {
    if (!scene.scene_id) {
      errors.push({ field: "scene.scene_id", message: "Scene missing scene_id" });
    }
    if (!VALID_SCENE_TYPES.has(scene.scene_type)) {
      errors.push({
        field: `scene[${scene.scene_id}].scene_type`,
        message: `Unknown scene_type '${scene.scene_type}'. Must be one of: ${[...VALID_SCENE_TYPES].join(", ")}`,
      });
    }
    if (typeof scene.narration !== "string" || !scene.narration.trim()) {
      errors.push({
        field: `scene[${scene.scene_id}].narration`,
        message: "Scene has empty narration — cannot sync audio",
      });
    }
    if (!Number.isFinite(scene.duration_seconds) || scene.duration_seconds <= 0 || scene.duration_seconds > 600) {
      errors.push({
        field: `scene[${scene.scene_id}].duration_seconds`,
        message: `Scene duration must be > 0, got ${scene.duration_seconds}`,
      });
    }
  }

  const ids = (payload.scenes ?? []).map(s => s.scene_id);
  if (new Set(ids).size !== ids.length) errors.push({field:"scenes",message:"Duplicate scene IDs"});
  for (const scene of payload.scenes ?? []) {
    const clips = payload.audio_manifest?.scenes?.filter(c => c.scene_id === scene.scene_id) || [];
    const slots = payload.asset_manifest?.scene_slots?.filter(s => s.scene_id === scene.scene_id) || [];
    if (clips.length !== 1 || !clips[0]?.audio_url || clips[0]?.status !== "ready") errors.push({field:scene.scene_id,message:"Exactly one ready audio source required"});
    if (slots.length !== 1) errors.push({field:scene.scene_id,message:"Exactly one asset slot required"});
    if (clips[0] && (!Number.isFinite(clips[0].duration_seconds) || clips[0].duration_seconds <= 0 || !Number.isFinite(clips[0].render_duration_seconds) || clips[0].render_duration_seconds < clips[0].duration_seconds || clips[0].render_duration_seconds - clips[0].duration_seconds > 1.01)) errors.push({field:scene.scene_id,message:"Scene timing must follow measured audio with at most one second padding"});
    if (scene.visual_version !== 2) errors.push({field:scene.scene_id,message:"visual_version 2 required"});
    if (scene.visual_version === 2) {
      const d = scene.diagram;
      const text=scene.on_screen_text;
      if (!Array.isArray(text) || text.length<1 || text.length>3 || text.some(t => typeof t!=="string" || !t.trim() || t.length>80)) errors.push({field:scene.scene_id,message:"Invalid key points"});
      if (!d || !["none","fraction_bars","number_line","equation_steps","process","cycle","comparison"].includes(d.kind) || !Array.isArray(d.labels) || !Array.isArray(d.values) || !Array.isArray(d.denominators)) {errors.push({field:scene.scene_id,message:"Invalid diagram"});continue;}
      if (Object.keys(d).some(k=>!["kind","labels","values","denominators"].includes(k))) errors.push({field:scene.scene_id,message:"Unknown diagram field"});
      for (let i=0;i<d.labels.length;i++) {
        const fraction=/^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(d.labels[i]);
        if (fraction && ["fraction_bars","number_line"].includes(d.kind)) {
          const n=Number(fraction[1]), den=Number(fraction[2]);
          const value=d.kind==="fraction_bars" ? d.values[i]/d.denominators[i] : d.values[i];
          if (!den || !Number.isFinite(value) || Math.abs(n/den-value)>0.001) errors.push({field:scene.scene_id,message:"Fraction label disagrees with visual quantity"});
        }
      }
      if (d.kind==="equation_steps" && d.labels.some(t=>/^\s*\d+\s*\/\s*\d+\s*÷\s*\d+\s*$/.test(t))) errors.push({field:scene.scene_id,message:"Simplification must divide numerator and denominator"});
      if (d.kind==="equation_steps") for (const label of d.labels) {
        const m=/^\s*(\d+)\s*\/\s*(\d+)\s*=\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(label);
        if (m && (!Number(m[2]) || !Number(m[4]) || Number(m[1])*Number(m[4])!==Number(m[3])*Number(m[2]))) errors.push({field:scene.scene_id,message:"Incorrect fraction equality"});
      }
      if (d.labels.some(t=>typeof t!=="string" || !t.trim() || t.length>48) || d.values.some(v=>!Number.isFinite(v))) errors.push({field:scene.scene_id,message:"Invalid diagram data"});
      if (d.kind==="fraction_bars" && (d.labels.length<1 || d.labels.length>3 || d.values.length!==d.labels.length || d.denominators.length!==d.labels.length || d.denominators.some((n,i)=>!Number.isInteger(n)||n<1||n>12||!Number.isInteger(d.values[i])||d.values[i]<0||d.values[i]>n))) errors.push({field:scene.scene_id,message:"Invalid fraction quantities"});
      if (d.kind==="number_line" && (d.labels.length<1 || d.labels.length>4 || d.values.length!==d.labels.length || d.denominators.length || d.values.some(v=>v<0||v>1))) errors.push({field:scene.scene_id,message:"Invalid number line"});
      if (d.kind==="none" && (d.labels.length || d.values.length || d.denominators.length)) errors.push({field:scene.scene_id,message:"Unexpected empty diagram data"});
      if (["equation_steps","process","cycle","comparison"].includes(d.kind) && (d.labels.length<2 || d.labels.length>4 || d.values.length || d.denominators.length)) errors.push({field:scene.scene_id,message:"Invalid diagram steps"});
    }
  }

  // ── Audio clip validation ────────────────────────────────────────────────
  const sceneIds = new Set((payload.scenes ?? []).map((s) => s.scene_id));
  for (const clip of payload.audio_manifest?.scenes ?? []) {
    if (!sceneIds.has(clip.scene_id)) {
      errors.push({
        field: `audio_manifest.scenes[${clip.scene_id}]`,
        message: `Audio clip references unknown scene_id '${clip.scene_id}'`,
      });
    }
    if (clip.status === "failed") {
      errors.push({
        field: `audio_manifest.scenes[${clip.scene_id}]`,
        message: `Audio clip status is 'failed' — cannot render with failed audio`,
      });
    }
    if (clip.is_mock || clip.format !== "mp3" || !clip.audio_key) errors.push({field:clip.scene_id,message:"Real private MP3 clip required"});
    if (!Number.isFinite(clip.render_duration_seconds) || clip.render_duration_seconds <= 0) {
      errors.push({
        field: `audio_manifest.scenes[${clip.scene_id}].render_duration_seconds`,
        message: `render_duration_seconds must be > 0`,
      });
    }
  }

  // ── Asset slot validation ────────────────────────────────────────────────
  const VALID_POSITIONS = new Set(["left", "right", "center", "edge_left", "edge_right"]);
  const VALID_TEMPLATES = new Set([
    "intro-v1", "concept-v1", "comparison-v1", "whiteboard-v1",
    "diagram-v1", "example-v1", "misconception-v1", "recap-v1", "quiz-prompt-v1",
  ]);
  const CANONICAL_CHARACTER = "elarion-teacher-v1";

  for (const slot of payload.asset_manifest?.scene_slots ?? []) {
    if (slot.character_version !== CANONICAL_CHARACTER) {
      errors.push({
        field: `asset_manifest.slot[${slot.scene_id}].character_version`,
        message: `Character version '${slot.character_version}' != canonical '${CANONICAL_CHARACTER}'`,
      });
    }
    if (!VALID_TEMPLATES.has(slot.template_id)) {
      errors.push({
        field: `asset_manifest.slot[${slot.scene_id}].template_id`,
        message: `Unknown template_id '${slot.template_id}'`,
      });
    }
    if (!VALID_POSITIONS.has(slot.character_position)) {
      errors.push({
        field: `asset_manifest.slot[${slot.scene_id}].character_position`,
        message: `Invalid character_position '${slot.character_position}'`,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// CLI entry — validate an input.json file
// ---------------------------------------------------------------------------
if (process.argv[1] && process.argv[1].includes("validate_payload")) {
  const fs = await import("fs");
  const path = process.argv[2];
  if (!path) {
    console.error("Usage: ts-node validate_payload.ts <input.json>");
    process.exit(1);
  }
  const raw = fs.readFileSync(path, "utf-8");
  const payload: RenderPayload = JSON.parse(raw);
  const errs = validatePayload(payload);
  if (errs.length === 0) {
    console.log("✓ Payload valid");
    process.exit(0);
  } else {
    console.error("✗ Payload validation failed:");
    for (const e of errs) {
      console.error(`  [${e.field}] ${e.message}`);
    }
    process.exit(1);
  }
}
