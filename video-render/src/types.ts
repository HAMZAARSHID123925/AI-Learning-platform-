/**
 * ELARION AI Learning Platform — Video Render Service
 * src/types.ts
 *
 * Shared type contracts for the render pipeline.
 * These must match:
 *   - M3.3 visual/asset_manifest.py SceneAssetSlot
 *   - M3.4 audio_generation_service.py SceneAudioClip
 *   - M3.2 scene_json scene structure
 */

// ---------------------------------------------------------------------------
// Input payload (written by Python backend, read by render.ts)
// ---------------------------------------------------------------------------

export interface RenderVideoConfig {
  width: number;         // 1920
  height: number;        // 1080
  fps: number;           // 30
  codec: "h264";
  outputFormat: "mp4";
}

export const DEFAULT_VIDEO_CONFIG: RenderVideoConfig = {
  width: 1920,
  height: 1080,
  fps: 30,
  codec: "h264",
  outputFormat: "mp4",
};

// Scene from M3.2 scene_json
export interface SceneData {
  scene_id: string;
  scene_type: SceneType;
  duration_seconds: number;
  heading?: string;
  narration: string;
  body_text?: string;
  bullets?: string[];
  left_panel?: ComparisonPanel;
  right_panel?: ComparisonPanel;
  diagram_description?: string;
  diagram_labels?: string[];
  example_steps?: string[];
  caption?: string;
  misconception_text?: string;
  correction_text?: string;
  quiz_question?: string;
}

export interface ComparisonPanel {
  label: string;
  points: string[];
  icon?: string;
}

// Audio clip from M3.4 audio_manifest_json
export interface AudioClip {
  scene_id: string;
  scene_index: number;
  audio_key: string;
  audio_url: string;
  format: string;
  duration_seconds: number;
  planned_duration_seconds: number;
  render_duration_seconds: number;    // ← USED for actual frame count
  text_hash: string;
  tts_provider: string;
  tts_voice_id: string;
  is_mock: boolean;
  status: "ready" | "failed";
}

// Asset slot from M3.3 asset_manifest_json
export interface AssetSlot {
  scene_id: string;
  scene_type: string;
  template_id: string;
  remotion_component: string;
  character_version: string;
  character_pose: string;
  character_expression: string;
  character_position: "left" | "right" | "center" | "edge_left" | "edge_right";
  character_scale: number;
  environment_id: string;
  active_zones: string[];
}

// Full render payload — written to input.json by Python backend
export interface RenderPayload {
  job_id: string;
  title: string;
  scenes: SceneData[];
  audio_manifest: {
    version: number;
    provider: string;
    voice_id: string;
    scenes: AudioClip[];
    total_render_duration_seconds: number;
    is_mock: boolean;
  };
  asset_manifest: {
    character_version: string;
    design_system_version: string;
    canvas_width: number;
    canvas_height: number;
    frame_rate: number;
    scene_slots: AssetSlot[];
  };
  video_config: RenderVideoConfig;
  output_path: string;
}

// Output written back to stdout/output.json by render.ts
export interface RenderResult {
  success: boolean;
  output_path: string;
  duration_seconds: number;
  total_frames: number;
  width: number;
  height: number;
  fps: number;
  file_size_bytes: number;
  is_mock_audio: boolean;
  character_version: string;
  error?: string;
}

// Scene types — must match M3.3 SceneType enum
export type SceneType =
  | "intro"
  | "concept"
  | "comparison"
  | "whiteboard"
  | "diagram"
  | "example"
  | "misconception_correction"
  | "recap"
  | "quiz_prompt";

// Component name → SceneType mapping (from M3.3 SCENE_TYPE_TO_TEMPLATE)
export const SCENE_TYPE_TO_COMPONENT: Record<SceneType, string> = {
  intro: "IntroScene",
  concept: "ConceptScene",
  comparison: "ComparisonScene",
  whiteboard: "WhiteboardScene",
  diagram: "DiagramScene",
  example: "ExampleScene",
  misconception_correction: "MisconceptionScene",
  recap: "RecapScene",
  quiz_prompt: "QuizPromptScene",
};

// Validated scene types set
export const VALID_SCENE_TYPES = new Set<string>(Object.keys(SCENE_TYPE_TO_COMPONENT));
