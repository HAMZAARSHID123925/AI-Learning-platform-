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
    if (!scene.narration || !scene.narration.trim()) {
      errors.push({
        field: `scene[${scene.scene_id}].narration`,
        message: "Scene has empty narration — cannot sync audio",
      });
    }
    if (scene.duration_seconds <= 0) {
      errors.push({
        field: `scene[${scene.scene_id}].duration_seconds`,
        message: `Scene duration must be > 0, got ${scene.duration_seconds}`,
      });
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
    if (clip.render_duration_seconds <= 0) {
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
