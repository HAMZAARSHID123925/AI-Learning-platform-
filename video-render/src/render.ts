/**
 * ELARION — Video Render Service
 * src/render.ts
 *
 * Main render entry point.
 *
 * Usage:
 *   node render.mjs <input.json> <output.mp4>
 *
 * Or called by Python backend render_service.py via subprocess.
 *
 * Process:
 *   1. Read + validate input payload
 *   2. Calculate total frame count from audio manifest
 *   3. Bundle Remotion composition
 *   4. Render via @remotion/renderer
 *   5. Write result JSON to stdout
 *   6. Exit 0 on success, 1 on failure
 *
 * Output (stdout JSON):
 *   { success, output_path, duration_seconds, total_frames,
 *     width, height, fps, file_size_bytes, is_mock_audio,
 *     character_version, error? }
 */

import { bundle } from "@remotion/bundler";
import {
  renderMedia,
  selectComposition,
  getCompositions,
} from "@remotion/renderer";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { RenderPayload, RenderResult, DEFAULT_VIDEO_CONFIG } from "./types";
import { validatePayload } from "./validate_payload";

const RENDER_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

async function main(): Promise<void> {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!inputPath || !outputPath) {
    writeResult({ success: false, error: "Usage: render.ts <input.json> <output.mp4>" });
    process.exit(1);
  }

  // ── 1. Read payload ───────────────────────────────────────────────────────
  let payload: RenderPayload;
  try {
    const raw = fs.readFileSync(inputPath, "utf-8");
    payload = JSON.parse(raw);
    payload.output_path = outputPath;
    payload.video_config = payload.video_config ?? DEFAULT_VIDEO_CONFIG;
  } catch (e: any) {
    writeResult({ success: false, error: `Failed to read/parse input: ${e.message}` });
    process.exit(1);
  }

  // ── 2. Validate payload ───────────────────────────────────────────────────
  const validationErrors = validatePayload(payload);
  if (validationErrors.length > 0) {
    const msg = validationErrors.map((e) => `[${e.field}] ${e.message}`).join("; ");
    writeResult({ success: false, error: `Payload validation failed: ${msg}` });
    process.exit(1);
  }

  // ── 3. Compute total frame count from audio manifest ─────────────────────
  const fps = payload.video_config.fps;
  let totalFrames = 0;
  for (const clip of payload.audio_manifest.scenes) {
    totalFrames += Math.ceil(clip.render_duration_seconds * fps);
  }

  if (totalFrames === 0) {
    writeResult({ success: false, error: "Total frame count is 0 — no scenes to render" });
    process.exit(1);
  }

  // ── 4. Bundle ─────────────────────────────────────────────────────────────
  let bundleLocation: string;
  try {
    bundleLocation = await bundle({
      entryPoint: path.resolve(__dirname, "index.ts"),
      webpackOverride: (config) => config,
    });
  } catch (e: any) {
    writeResult({ success: false, error: `Bundle failed: ${e.message}` });
    process.exit(1);
  }

  // ── 5. Get composition with dynamic duration ──────────────────────────────
  let composition;
  try {
    const comps = await getCompositions(bundleLocation, {
      inputProps: { payload },
    });
    const base = comps.find((c) => c.id === "ElarionLesson");
    if (!base) {
      writeResult({ success: false, error: "Composition 'ElarionLesson' not found in bundle" });
      process.exit(1);
    }
    // Override durationInFrames with calculated value
    composition = {
      ...base,
      durationInFrames: totalFrames,
    };
  } catch (e: any) {
    writeResult({ success: false, error: `Composition selection failed: ${e.message}` });
    process.exit(1);
  }

  // ── 6. Render ─────────────────────────────────────────────────────────────
  try {
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: { payload },
      timeoutInMilliseconds: RENDER_TIMEOUT_MS,
      onProgress: ({ progress }) => {
        process.stderr.write(`render_progress:${Math.round(progress * 100)}\n`);
      },
    });
  } catch (e: any) {
    writeResult({ success: false, error: `Render failed: ${e.message}` });
    process.exit(1);
  }

  // ── 7. Verify output and collect stats ────────────────────────────────────
  if (!fs.existsSync(outputPath)) {
    writeResult({ success: false, error: "Output file does not exist after render" });
    process.exit(1);
  }

  const fileSizeBytes = fs.statSync(outputPath).size;
  if (fileSizeBytes === 0) {
    writeResult({ success: false, error: "Output file is 0 bytes" });
    process.exit(1);
  }

  const durationSeconds = totalFrames / fps;

  const result: RenderResult = {
    success: true,
    output_path: outputPath,
    duration_seconds: durationSeconds,
    total_frames: totalFrames,
    width: payload.video_config.width,
    height: payload.video_config.height,
    fps,
    file_size_bytes: fileSizeBytes,
    is_mock_audio: payload.audio_manifest.is_mock,
    character_version: payload.asset_manifest.character_version,
  };

  writeResult(result);
  process.exit(0);
}

function writeResult(result: Partial<RenderResult>): void {
  process.stdout.write(JSON.stringify(result) + "\n");
}

main().catch((e) => {
  writeResult({ success: false, error: String(e) });
  process.exit(1);
});
