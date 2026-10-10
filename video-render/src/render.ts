/**
 * ELARION — Video Render Service
 * src/render.ts
 *
 * Usage:  node node_modules/tsx/dist/cli.mjs src/render.ts <input.json> <output.mp4>
 * Called by backend render_service.py as a subprocess.
 *
 * Two render modes (VIDEO_RENDER_MODE env, default "template"):
 *
 *  template  — keyframe pipeline (fast):
 *     1. the STAGE (header, card, diagram, subtitles) is drawn by Chromium
 *        only on frames where something changes; every other frame is a
 *        held still (see templates/timeline.ts)
 *     2. the TEACHER is a transparent loop rendered once and cached
 *     3. FFmpeg assembles stills + teacher overlay + narration into the MP4
 *
 *  full      — the original path: Chromium draws every frame (renderMedia).
 *
 * Output (last stdout line, JSON): RenderResult.
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, renderFrames, getCompositions } from "@remotion/renderer";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";
import { ChildProcess, spawn } from "child_process";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { RenderPayload, RenderResult, DEFAULT_VIDEO_CONFIG } from "./types";
import { validatePayload } from "./validate_payload";
import { buildTimeline, activeFrames } from "./templates/timeline";
import { LAYOUT } from "./templates/theme";
import { TEACHER_LOOP_FRAMES, TEACHER_VERSION } from "./templates/Teacher";
import { TEACHER_PRESENTERS, DEFAULT_TEACHER, type TeacherClipSet, type TeacherName } from "./templates/teacherClip";
import type { LessonTimeline } from "./templates/timeline";

const browserExecutable = process.env.REMOTION_CHROMIUM_EXECUTABLE_PATH || null;
const RENDER_TIMEOUT_MS = 10 * 60 * 1000;
const RENDER_MODE = (process.env.VIDEO_RENDER_MODE || "template").toLowerCase();
const FFMPEG = process.env.FFMPEG_BINARY || "ffmpeg";
const FFPROBE = process.env.FFPROBE_BINARY || "ffprobe";
// Pauses shorter than this keep the teacher talking. The default (very large)
// means ONE continuous talking take per scene: she starts with the first word
// and stops with the last; only the silence after the narration is idle.
// Set e.g. 1.5 to also go idle during long mid-scene pauses.
const TEACHER_PAUSE_SECONDS = Number(process.env.VIDEO_TEACHER_PAUSE_SECONDS || 9999);

// ── Performance settings (passed by render_service.py; safe defaults) ──────
const CONCURRENCY = (() => {
  const configured = Number(process.env.VIDEO_RENDER_CONCURRENCY || 0);
  if (Number.isFinite(configured) && configured >= 1) return Math.min(16, Math.floor(configured));
  return Math.max(2, Math.min(8, os.cpus().length - 2));
})();
const OUTPUT_HEIGHT = Number(process.env.VIDEO_OUTPUT_HEIGHT || 1080);

// ── Windows/Node 24: a closed helper handle makes kill() throw EBADF, which
//    would otherwise crash Node inside Remotion's cleanup and hide the real error.
const originalKill = ChildProcess.prototype.kill;
ChildProcess.prototype.kill = function (this: ChildProcess, ...args: any[]) {
  try { return (originalKill as any).apply(this, args); }
  catch (err: any) {
    if (err && err.code === "EBADF") { process.stderr.write("render_warning:ignored EBADF while stopping a helper process\n"); return false; }
    throw err;
  }
} as any;
process.on("uncaughtException", (err: any) => {
  if (err && err.code === "EBADF" && err.syscall === "kill") { process.stderr.write("render_warning:ignored EBADF while stopping a helper process\n"); return; }
  process.stderr.write(`render_uncaught:${err?.stack || err}\n`);
  writeResult({ success: false, error: `Uncaught renderer error: ${err?.message || err}` });
  process.exit(1);
});

let resultWritten = false;
function writeResult(result: Partial<RenderResult>): void {
  resultWritten = true;
  process.stdout.write(JSON.stringify(result) + "\n");
}
process.on("exit", (code) => {
  if (!resultWritten) process.stdout.write(JSON.stringify({ success: false, error: `Renderer exited (code ${code}) without a result` }) + "\n");
});
function timing(stage: string, startedAt: number): void {
  process.stderr.write(`render_timing:${stage}=${((Date.now() - startedAt) / 1000).toFixed(1)}s\n`);
}
function fail(message: string): never {
  process.stderr.write(`render_error:${message}\n`);
  writeResult({ success: false, error: message });
  process.exit(1);
}

// ── Source hash: used to cache the webpack bundle and the teacher loop ──────
function sourceHash(extraParts: string[] = []): string {
  const root = path.resolve(__dirname, "..");
  const hash = crypto.createHash("sha256");
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir).sort()) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?|css|json|png|svg)$/.test(name)) hash.update(name).update(fs.readFileSync(full));
    }
  };
  walk(path.join(root, "src"));
  if (fs.existsSync(path.join(root, "public"))) {
    for (const name of fs.readdirSync(path.join(root, "public")).sort()) {
      const full = path.join(root, "public", name);
      if (fs.statSync(full).isFile()) hash.update(name).update(fs.readFileSync(full));
    }
  }
  const lock = path.join(root, "package-lock.json");
  if (fs.existsSync(lock)) hash.update(fs.readFileSync(lock));
  for (const p of extraParts) hash.update(p);
  return hash.digest("hex").slice(0, 16);
}

/** Bundle once per source version and reuse it (webpack on every job wasted 20-60 s). */
async function getBundle(): Promise<string> {
  const outDir = path.join(os.tmpdir(), "elarion-remotion-bundle", sourceHash());
  if (fs.existsSync(path.join(outDir, "index.html"))) return outDir;
  const built = await bundle({ entryPoint: path.resolve(__dirname, "index.ts"), webpackOverride: (c) => c, outDir: `${outDir}.tmp-${process.pid}` });
  try { fs.renameSync(built, outDir); return outDir; }
  catch { return fs.existsSync(path.join(outDir, "index.html")) ? outDir : built; }
}

function run(cmd: string, args: string[], label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: ["ignore", "ignore", "pipe"], windowsHide: true });
    let err = "";
    proc.stderr.on("data", (d) => { err += d.toString(); if (err.length > 20000) err = err.slice(-20000); });
    proc.on("error", (e) => reject(new Error(`${label}: cannot start ${cmd}: ${e.message}`)));
    proc.on("close", (code) => code === 0 ? resolve() : reject(new Error(`${label}: ${cmd} exited ${code}: ${err.slice(-1500)}`)));
  });
}

async function download(url: string, dest: string): Promise<void> {
  if (/^[A-Za-z]:[\\/]|^\//.test(url) && fs.existsSync(url)) { fs.copyFileSync(url, dest); return; }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`audio download failed (${res.status}) for ${url.split("?")[0]}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

/** The teacher layer: keyed real-footage clips (assets/) or the drawn loop. */
type ClipRole = "talking" | "idle" | "point";
type KeyedClip = { color: string; alpha: string; seconds: number };
type TeacherAsset =
  | { kind: "clip"; clips: Record<ClipRole, KeyedClip>; width: number; height: number; set: TeacherClipSet }
  | { kind: "drawn"; movie: string };
type TeacherLayer = TeacherAsset;

/** Pick the presenter's clip set. Falls back to the default presenter when the
 *  requested one has no clips installed, and to the drawn teacher when none do. */
function resolveTeacherClips(requested: string | undefined): { dir: string; set: TeacherClipSet; name: TeacherName } | null {
  const want = (requested && requested in TEACHER_PRESENTERS ? requested : DEFAULT_TEACHER) as TeacherName;
  if (requested && requested !== want) process.stderr.write(`render_warning:unknown teacher "${requested}"; using ${want}\n`);
  const order: TeacherName[] = want === DEFAULT_TEACHER ? [want] : [want, DEFAULT_TEACHER];
  for (const name of order) {
    const set = TEACHER_PRESENTERS[name];
    const dir = process.env.VIDEO_TEACHER_CLIPS || path.resolve(__dirname, "..", set.dir);
    const missing = (Object.values(set.files) as string[]).filter((f) => !fs.existsSync(path.join(dir, f)));
    if (missing.length === 0) {
      if (name !== want) process.stderr.write(`render_warning:${want} teacher clips not installed; using ${name}\n`);
      return { dir, set, name };
    }
    if (missing.length < 3 || process.env.VIDEO_TEACHER_CLIPS) process.stderr.write(`render_warning:${name} teacher clips missing (${missing.join(", ")})\n`);
  }
  process.stderr.write("render_warning:no teacher clips installed; using drawn teacher\n");
  return null;
}

/** Key one clip (once) into cached colour + alpha-matte videos, all-intra so cuts are frame-exact. */
async function keyClip(src: string, set: TeacherClipSet, role: ClipRole, scale: number, fps: number, outW: number, outH: number): Promise<KeyedClip> {
  const stat = fs.statSync(src);
  const key = crypto.createHash("sha256").update(src).update(String(stat.size)).update(String(stat.mtimeMs))
    .update(JSON.stringify({ crop: set.crop, key: set.key, mirror: set.mirror[role] })).update(`${outW}x${outH}:${fps}:v3`).digest("hex").slice(0, 16);
  const dir = path.join(os.tmpdir(), "elarion-teacher-clip", key);
  const meta = path.join(dir, "meta.json");
  if (fs.existsSync(meta)) return JSON.parse(fs.readFileSync(meta, "utf-8"));
  const started = Date.now();
  const tmp = `${dir}.tmp-${process.pid}`;
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  const flip = set.mirror[role] ? "hflip," : "";
  const keyed = `${flip}crop=${set.crop.width}:${set.crop.height}:${set.crop.x}:${set.crop.y},fps=${fps},format=yuva444p,chromakey=${set.key.color}:${set.key.similarity}:${set.key.blend}`;
  const color = path.join(tmp, "color.mp4"), alpha = path.join(tmp, "alpha.mp4");
  await run(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error", "-i", src, "-an",
    "-filter_complex", `[0:v]${keyed},despill=type=green:mix=${set.key.despill}:expand=${set.key.expand ?? 0.3},scale=${outW}:${outH}:flags=lanczos,format=yuv420p[c]`,
    "-map", "[c]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-g", "1", "-pix_fmt", "yuv420p", color], `teacher ${role} colour`);
  await run(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error", "-i", src, "-an",
    "-filter_complex", `[0:v]${keyed},alphaextract,scale=${outW}:${outH}:flags=lanczos,format=gray[a]`,
    "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "8", "-g", "1", "-pix_fmt", "yuv420p", alpha], `teacher ${role} alpha`);
  // exact duration of the keyed clip (frames / fps) — needed to loop it precisely
  const probe = await new Promise<string>((resolve, reject) => {
    const p = spawn(FFPROBE, ["-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", color], { windowsHide: true });
    let out = ""; p.stdout.on("data", (d) => (out += d)); p.on("error", reject); p.on("close", () => resolve(out.trim()));
  });
  const frames = Number(probe) || 0;
  if (!frames) throw new Error(`could not probe keyed clip ${role}`);
  const result: KeyedClip = { color: path.join(dir, "color.mp4"), alpha: path.join(dir, "alpha.mp4"), seconds: frames / fps };
  fs.writeFileSync(path.join(tmp, "meta.json"), JSON.stringify(result));
  try { fs.renameSync(tmp, dir); } catch { if (!fs.existsSync(meta)) throw new Error("teacher clip cache rename failed"); }
  timing(`teacher_${role}`, started);
  return result;
}

async function getTeacherClipLayer(dir: string, set: TeacherClipSet, scale: number, fps: number): Promise<TeacherAsset> {
  const placeScale = set.place.height / set.crop.height;
  const outW = Math.round(set.crop.width * placeScale * scale / 2) * 2, outH = Math.round(set.place.height * scale / 2) * 2;
  const roles: ClipRole[] = ["talking", "idle", "point"];
  const clips = {} as Record<ClipRole, KeyedClip>;
  for (const role of roles) clips[role] = await keyClip(path.join(dir, set.files[role]), set, role, scale, fps, outW, outH);
  return { kind: "clip", clips, width: outW, height: outH, set };
}

/** Where the voice actually speaks in one narration file (seconds), via FFmpeg silencedetect. */
async function speechIntervals(audioFile: string, clipSeconds: number, minPause: number): Promise<Array<[number, number]>> {
  const stderr = await new Promise<string>((resolve, reject) => {
    const p = spawn(FFMPEG, ["-hide_banner", "-nostats", "-i", audioFile, "-af", "silencedetect=n=-32dB:d=0.25", "-f", "null", "-"], { windowsHide: true });
    let err = ""; p.stderr.on("data", (d) => (err += d)); p.on("error", reject); p.on("close", () => resolve(err));
  });
  const silences: Array<[number, number]> = [];
  let open: number | null = null;
  for (const m of stderr.matchAll(/silence_(start|end): ([0-9.]+)/g)) {
    if (m[1] === "start") open = Number(m[2]);
    else if (open !== null) { silences.push([open, Number(m[2])]); open = null; }
  }
  if (open !== null) silences.push([open, clipSeconds]);
  // speech = complement of silences, then bridge short pauses so she doesn't flicker between sentences
  const speech: Array<[number, number]> = [];
  let cursor = 0;
  for (const [a, b] of silences) { if (a > cursor + 0.05) speech.push([cursor, a]); cursor = Math.max(cursor, b); }
  if (cursor < clipSeconds - 0.05) speech.push([cursor, clipSeconds]);
  const merged: Array<[number, number]> = [];
  for (const iv of speech) {
    const last = merged[merged.length - 1];
    if (last && iv[0] - last[1] < minPause) last[1] = iv[1]; else merged.push([iv[0], iv[1]]);
  }
  return merged.filter(([a, b]) => b - a >= 0.15);
}

interface TeacherSegment { role: ClipRole; src: number; len: number }

/** Timeline of what the teacher does: talking only while the voice speaks, idle in every pause. */
function planTeacher(timeline: LessonTimeline, asset: Extract<TeacherAsset, { kind: "clip" }>, speech: Array<Array<[number, number]>>, fade: number): TeacherSegment[] {
  const fps = timeline.fps;
  const roleAt: Array<{ role: ClipRole; from: number; to: number }> = [];
  for (const t of timeline.scenes) {
    const base = t.from / fps, end = (t.from + t.durationFrames) / fps;
    let cursor = base;
    for (const [a, b] of speech[t.index]) {
      const sa = Math.min(end, base + a), sb = Math.min(end, base + b);
      if (sa > cursor) roleAt.push({ role: "idle", from: cursor, to: sa });
      if (sb > sa) roleAt.push({ role: "talking", from: sa, to: sb });
      cursor = Math.max(cursor, sb);
    }
    if (cursor < end) roleAt.push({ role: "idle", from: cursor, to: end });
  }
  // merge neighbours with the same role and absorb slivers shorter than the crossfade
  const compact: typeof roleAt = [];
  for (const r of roleAt) {
    const last = compact[compact.length - 1];
    if (last && (last.role === r.role || r.to - r.from < fade * 1.5)) last.to = r.to;
    else compact.push({ ...r });
  }
  // assign source offsets: each clip plays on continuously (its own phase); wrap at the clip end
  const phase: Record<ClipRole, number> = { talking: 0, idle: 0, point: 0 };
  const segs: TeacherSegment[] = [];
  for (const r of compact) {
    let remaining = r.to - r.from;
    while (remaining > 1e-6) {
      const clipLen = asset.clips[r.role].seconds;
      const room = clipLen - fade - phase[r.role];          // keep `fade` seconds of headroom for the crossfade tail
      if (room < 0.3) { phase[r.role] = 0; continue; }
      const len = Math.min(remaining, room);
      segs.push({ role: r.role, src: phase[r.role], len });
      phase[r.role] += len; remaining -= len;
      if (phase[r.role] >= clipLen - fade - 1e-6) phase[r.role] = 0;
    }
  }
  return segs;
}

/** Render (once) and cache the drawn teacher loop (fallback when no clip is configured). */
async function getTeacherLoop(bundleLocation: string, scale: number, fps: number): Promise<TeacherAsset> {
  const key = sourceHash([TEACHER_VERSION, String(scale), String(TEACHER_LOOP_FRAMES), String(fps)]);
  const dir = path.join(os.tmpdir(), "elarion-teacher-loop", key);
  const movie = path.join(dir, "loop.mov");
  if (fs.existsSync(path.join(dir, "done"))) return { kind: "drawn", movie };
  const started = Date.now();
  const tmp = `${dir}.tmp-${process.pid}`;
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  const comps = await getCompositions(bundleLocation, { browserExecutable });
  const comp = comps.find((c) => c.id === "ElarionTeacherLoop");
  if (!comp) throw new Error("Composition 'ElarionTeacherLoop' not found");
  await renderFrames({
    composition: comp, serveUrl: bundleLocation, inputProps: {}, outputDir: tmp, imageFormat: "png",
    imageSequencePattern: "raw-[frame].[ext]", scale, concurrency: CONCURRENCY, browserExecutable,
    onStart: () => undefined, onFrameUpdate: () => undefined, timeoutInMilliseconds: RENDER_TIMEOUT_MS,
  });
  const files = fs.readdirSync(tmp).filter((f) => f.startsWith("raw-")).sort();
  files.forEach((f, i) => fs.renameSync(path.join(tmp, f), path.join(tmp, `t-${String(i).padStart(4, "0")}.png`)));
  await run(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error", "-framerate", String(fps), "-i", path.join(tmp, "t-%04d.png"),
    "-c:v", "qtrle", "-pix_fmt", "argb", path.join(tmp, "loop.mov")], "teacher loop encode");
  for (const f of files.map((_, i) => `t-${String(i).padStart(4, "0")}.png`)) fs.rmSync(path.join(tmp, f), { force: true });
  fs.writeFileSync(path.join(tmp, "done"), String(files.length));
  try { fs.renameSync(tmp, dir); } catch { if (!fs.existsSync(path.join(dir, "done"))) throw new Error("teacher loop cache rename failed"); }
  timing("teacher_loop", started);
  return { kind: "drawn", movie };
}

async function getTeacherLayer(bundleLocation: string, scale: number, fps: number, teacher: string | undefined): Promise<TeacherLayer> {
  const clips = resolveTeacherClips(teacher);
  if (clips) {
    process.stderr.write(`render_config:teacher=${clips.name}\n`);
    return getTeacherClipLayer(clips.dir, clips.set, scale, fps);
  }
  return getTeacherLoop(bundleLocation, scale, fps);
}

async function main(): Promise<void> {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  if (!inputPath || !outputPath) fail("Usage: render.ts <input.json> <output.mp4>");

  let payload: RenderPayload;
  try {
    payload = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
    payload.output_path = outputPath;
    payload.video_config = payload.video_config ?? DEFAULT_VIDEO_CONFIG;
  } catch (e: any) { return fail(`Failed to read/parse input: ${e.message}`); }

  const validationErrors = validatePayload(payload);
  if (validationErrors.length > 0) return fail(`Payload validation failed: ${validationErrors.map((e) => `[${e.field}] ${e.message}`).join("; ")}`);

  const fps = payload.video_config.fps;
  const timeline = buildTimeline(payload);
  const totalFrames = timeline.totalFrames;
  if (totalFrames === 0) return fail("Total frame count is 0 — no scenes to render");

  const bundleStarted = Date.now();
  let bundleLocation: string;
  try { bundleLocation = await getBundle(); timing("bundle", bundleStarted); }
  catch (e: any) { return fail(`Bundle failed: ${e.message}`); }

  const canvasH = payload.video_config.height;
  const scale = OUTPUT_HEIGHT > 0 && OUTPUT_HEIGHT < canvasH ? OUTPUT_HEIGHT / canvasH : 1;
  const outW = Math.round(payload.video_config.width * scale), outH = Math.round(canvasH * scale);

  const renderStarted = Date.now();
  try {
    if (RENDER_MODE === "full") await renderFull(payload, bundleLocation, totalFrames, scale, outputPath);
    else await renderTemplate(payload, bundleLocation, timeline.scenes.map((s) => s.clip), totalFrames, scale, outW, outH, outputPath);
    timing("render", renderStarted);
  } catch (e: any) {
    process.stderr.write(`render_error:${e?.stack || e}\n`);
    return fail(`Render failed: ${e.message}`);
  }

  if (!fs.existsSync(outputPath)) return fail("Output file does not exist after render");
  const fileSizeBytes = fs.statSync(outputPath).size;
  if (fileSizeBytes === 0) return fail("Output file is 0 bytes");

  writeResult({
    success: true, output_path: outputPath, duration_seconds: totalFrames / fps, total_frames: totalFrames,
    width: payload.video_config.width, height: payload.video_config.height, fps, file_size_bytes: fileSizeBytes,
    is_mock_audio: payload.audio_manifest.is_mock, character_version: payload.asset_manifest.character_version,
  });
  process.exit(0);
}

// ── Mode "full": the original every-frame render ───────────────────────────
async function renderFull(payload: RenderPayload, bundleLocation: string, totalFrames: number, scale: number, outputPath: string) {
  const comps = await getCompositions(bundleLocation, { inputProps: { payload }, browserExecutable });
  const base = comps.find((c) => c.id === "ElarionLesson");
  if (!base) throw new Error("Composition 'ElarionLesson' not found in bundle");
  process.stderr.write(`render_config:mode=full frames=${totalFrames} concurrency=${CONCURRENCY} scale=${scale.toFixed(3)}\n`);
  await renderMedia({
    composition: { ...base, durationInFrames: totalFrames }, serveUrl: bundleLocation, codec: "h264", concurrency: CONCURRENCY, scale,
    x264Preset: "veryfast", outputLocation: outputPath, inputProps: { payload }, browserExecutable, timeoutInMilliseconds: RENDER_TIMEOUT_MS,
    onProgress: ({ progress }) => process.stderr.write(`render_progress:${Math.round(progress * 100)}\n`),
  });
}

// ── Mode "template": keyframe stage + cached teacher loop + FFmpeg ─────────
async function renderTemplate(
  payload: RenderPayload, bundleLocation: string, clips: RenderPayload["audio_manifest"]["scenes"],
  totalFrames: number, scale: number, outW: number, outH: number, outputPath: string,
) {
  const fps = payload.video_config.fps;
  const timeline = buildTimeline(payload);
  const frameMap = activeFrames(timeline);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "elarion-stage-"));
  try {
    // 1. Narration files (FFmpeg reads local files; Chromium no longer streams them).
    const audioStarted = Date.now();
    const audioFiles: string[] = [];
    await Promise.all(clips.map(async (clip, i) => {
      const dest = path.join(work, `a-${String(i).padStart(3, "0")}.mp3`);
      await download(clip.audio_url, dest);
      audioFiles[i] = dest;
    }));
    timing("audio_download", audioStarted);

    // 2. Teacher loop (cached after the first video).
    const teacher = await getTeacherLayer(bundleLocation, scale, fps, payload.teacher);

    // 3. Stage keyframes only.
    process.stderr.write(`render_config:mode=template frames=${totalFrames} keyframes=${frameMap.length} concurrency=${CONCURRENCY} scale=${scale.toFixed(3)}\n`);
    const stageStarted = Date.now();
    const comps = await getCompositions(bundleLocation, { inputProps: { payload, frameMap }, browserExecutable });
    const stage = comps.find((c) => c.id === "ElarionStage");
    if (!stage) throw new Error("Composition 'ElarionStage' not found in bundle");
    const stageDir = path.join(work, "stage");
    fs.mkdirSync(stageDir);
    let rendered = 0;
    await renderFrames({
      composition: { ...stage, durationInFrames: frameMap.length }, serveUrl: bundleLocation, inputProps: { payload, frameMap },
      outputDir: stageDir, imageFormat: "jpeg", jpegQuality: 92, imageSequencePattern: "s-[frame].[ext]", scale,
      concurrency: CONCURRENCY, browserExecutable, timeoutInMilliseconds: RENDER_TIMEOUT_MS,
      onStart: () => undefined,
      onFrameUpdate: () => { rendered++; if (rendered % 25 === 0 || rendered === frameMap.length) process.stderr.write(`render_progress:${Math.round((rendered / frameMap.length) * 100)}\n`); },
    });
    const stills = fs.readdirSync(stageDir).filter((f) => f.startsWith("s-")).sort();
    if (stills.length !== frameMap.length) throw new Error(`Expected ${frameMap.length} stage frames, got ${stills.length}`);
    timing("stage_frames", stageStarted);

    // 4. Expand keyframes to a full 30 fps sequence: every held frame is a
    //    hard link to its keyframe still (free on NTFS/ext4), so FFmpeg reads an
    //    exact frame-accurate image sequence. (The concat demuxer's "duration"
    //    rounds to a 1/25 s clock and shifts frames — verified, so not used.)
    const seqDir = path.join(work, "seq");
    fs.mkdirSync(seqDir);
    const pad = String(totalFrames).length;
    let link = (src: string, dst: string) => { try { fs.linkSync(src, dst); } catch { link = fs.copyFileSync; fs.copyFileSync(src, dst); } };
    frameMap.forEach((frame, i) => {
      const next = i + 1 < frameMap.length ? frameMap[i + 1] : totalFrames;
      const src = path.join(stageDir, stills[i]);
      for (let f = frame; f < next; f++) link(src, path.join(seqDir, `f-${String(f).padStart(pad, "0")}.jpeg`));
    });
    const seqPattern = path.join(seqDir, `f-%0${pad}d.jpeg`);

    // 5. FFmpeg: stills -> video, overlay teacher loop, concat padded narration, encode.
    const ffStarted = Date.now();
    const totalSeconds = totalFrames / fps;
    const place = teacher.kind === "clip" ? teacher.set.place : { left: LAYOUT.teacher.left, bottom: LAYOUT.teacher.bottom, height: LAYOUT.teacher.height };
    const tx = Math.round(place.left * scale);
    const ty = Math.round((payload.video_config.height - place.bottom - place.height) * scale);
    const args = ["-y", "-hide_banner", "-loglevel", "error",
      "-framerate", String(fps), "-start_number", "0", "-i", seqPattern];
    const FADE = 0.2;
    let teacherFilter: string;
    let audioBase: number;
    if (teacher.kind === "clip") {
      const speechStarted = Date.now();
      const speech = await Promise.all(timeline.scenes.map((t) => speechIntervals(audioFiles[t.index], t.clip.duration_seconds, TEACHER_PAUSE_SECONDS)));
      const segs = planTeacher(timeline, teacher, speech, FADE);
      timing("speech_analysis", speechStarted);
      process.stderr.write(`render_config:teacher_segments=${segs.length} talking=${segs.filter((x) => x.role === "talking").length}\n`);
      // one input pair (colour, alpha) per segment; all-intra clips make -ss frame-exact
      segs.forEach((sg, i) => {
        const extra = i < segs.length - 1 ? FADE : 0;
        args.push("-ss", sg.src.toFixed(6), "-t", (sg.len + extra).toFixed(6), "-i", teacher.clips[sg.role].color);
        args.push("-ss", sg.src.toFixed(6), "-t", (sg.len + extra).toFixed(6), "-i", teacher.clips[sg.role].alpha);
      });
      audioBase = 1 + segs.length * 2;
      const chain = (which: 0 | 1, fmt: string, out: string) => {
        const parts: string[] = [];
        segs.forEach((_, i) => parts.push(`[${1 + i * 2 + which}:v]fps=${fps},setpts=PTS-STARTPTS,format=${fmt}[s${which}_${i}]`));
        if (segs.length === 1) { parts.push(`[s${which}_0]copy[${out}]`); return parts.join(";"); }
        let prev = `s${which}_0`, offset = 0;
        for (let i = 1; i < segs.length; i++) {
          offset += segs[i - 1].len;
          const name = i === segs.length - 1 ? out : `x${which}_${i}`;
          parts.push(`[${prev}][s${which}_${i}]xfade=transition=fade:duration=${FADE}:offset=${offset.toFixed(6)}[${name}]`);
          prev = name;
        }
        return parts.join(";");
      };
      teacherFilter = `${chain(0, "yuv420p", "tcol")};${chain(1, "yuv420p", "talp")};[talp]format=gray[ta];[tcol]format=yuv444p[tc];[tc][ta]alphamerge,format=yuva420p[teacher]`;
    } else {
      args.push("-stream_loop", "-1", "-i", teacher.movie);
      audioBase = 2;
      teacherFilter = `[1:v]format=yuva420p[teacher]`;
    }
    for (const a of audioFiles) args.push("-i", a);
    // Each narration segment is padded to its scene's exact frame count, so audio
    // and picture stay aligned at every scene boundary (no cumulative drift).
    const audioChain = timeline.scenes.map((t, i) => {
      const seconds = (t.durationFrames / fps).toFixed(6);
      return `[${i + audioBase}:a]aresample=48000,atrim=0:${seconds},apad=whole_dur=${seconds}[a${i}]`;
    }).join(";");
    const audioConcat = clips.map((_, i) => `[a${i}]`).join("") + `concat=n=${clips.length}:v=0:a=1[aout]`;
    const filter = `[0:v]scale=${outW}:${outH}:flags=bicubic,format=yuv420p[stage];${teacherFilter};[stage][teacher]overlay=x=${tx}:y=${ty}:shortest=1:format=yuv420[vout];${audioChain};${audioConcat}`;
    const filterPath = path.join(work, "filter.txt");
    fs.writeFileSync(filterPath, filter);
    args.push("-filter_complex_script", filterPath, "-map", "[vout]", "-map", "[aout]",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-r", String(fps),
      "-c:a", "aac", "-b:a", "128k", "-t", totalSeconds.toFixed(3), "-movflags", "+faststart", outputPath);
    await run(FFMPEG, args, "assemble");
    timing("ffmpeg_assemble", ffStarted);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

main().catch((e) => fail(String(e?.stack || e)));
