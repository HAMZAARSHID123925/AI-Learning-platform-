/**
 * ELARION — Video Render Service
 * src/Root.tsx
 *
 * Remotion root composition for ELARION personalized video rendering.
 *
 * Architecture:
 *   - One root <Composition /> named "ElarionLesson"
 *   - Total duration = sum of all scenes' render_duration_seconds
 *   - Each scene rendered in sequence with no gaps
 *   - Audio bound per-scene using <Audio /> with startFrom alignment
 *
 * Props injected from render payload (inputProps).
 * No hardcoded lesson content.
 */

import React from "react";
import {
  Composition,
  AbsoluteFill,
  Sequence,
  Audio,
  staticFile,
} from "remotion";
import {
  IntroScene,
  ConceptScene,
  ComparisonScene,
  WhiteboardScene,
  DiagramScene,
  ExampleScene,
  MisconceptionScene,
  RecapScene,
  QuizPromptScene,
} from "./scenes";
import { RenderPayload, SceneData, AssetSlot, AudioClip } from "./types";
import { CANVAS } from "./design";

// ---------------------------------------------------------------------------
// Scene dispatcher — maps scene_type → component
// ---------------------------------------------------------------------------
const SceneDispatcher: React.FC<{
  scene: SceneData;
  slot: AssetSlot;
}> = ({ scene, slot }) => {
  const props = { scene, slot };
  switch (scene.scene_type) {
    case "intro": return <IntroScene {...props} />;
    case "concept": return <ConceptScene {...props} />;
    case "comparison": return <ComparisonScene {...props} />;
    case "whiteboard": return <WhiteboardScene {...props} />;
    case "diagram": return <DiagramScene {...props} />;
    case "example": return <ExampleScene {...props} />;
    case "misconception_correction": return <MisconceptionScene {...props} />;
    case "recap": return <RecapScene {...props} />;
    case "quiz_prompt": return <QuizPromptScene {...props} />;
    default:
      // Unknown scene_type — render safe fallback with error label
      return (
        <AbsoluteFill style={{ background: "#1A237E", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#fff", fontSize: 32 }}>
            ⚠ Unknown scene_type: {scene.scene_type}
          </p>
        </AbsoluteFill>
      );
  }
};

// ---------------------------------------------------------------------------
// Main lesson composition
// ---------------------------------------------------------------------------
export interface ElarionLessonProps {
  payload: RenderPayload;
}

export const ElarionLesson: React.FC<ElarionLessonProps> = ({ payload }) => {
  const { scenes, audio_manifest, asset_manifest, video_config } = payload;
  const fps = video_config.fps;

  // Map audio clips by scene_id for O(1) lookup
  const audioBySceneId = new Map<string, AudioClip>(
    audio_manifest.scenes.map((c) => [c.scene_id, c])
  );

  // Map asset slots by scene_id
  const slotBySceneId = new Map<string, AssetSlot>(
    asset_manifest.scene_slots.map((s) => [s.scene_id, s])
  );

  // Build sequence timeline
  let cumulativeFrames = 0;
  const timeline = scenes.map((scene) => {
    const audioClip = audioBySceneId.get(scene.scene_id);
    const slot = slotBySceneId.get(scene.scene_id);

    // Use reconciled render_duration from audio manifest (M3.4 timing)
    const renderDuration = audioClip?.render_duration_seconds ?? scene.duration_seconds;
    const durationFrames = Math.ceil(renderDuration * fps);

    const entry = {
      scene,
      slot: slot!,
      audioClip,
      from: cumulativeFrames,
      durationFrames,
    };
    cumulativeFrames += durationFrames;
    return entry;
  });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {timeline.map(({ scene, slot, audioClip, from, durationFrames }) => (
        <Sequence key={scene.scene_id} from={from} durationInFrames={durationFrames}>
          {/* Scene visual content */}
          {slot ? (
            <SceneDispatcher scene={scene} slot={slot} />
          ) : (
            <ConceptScene scene={scene} slot={{
              scene_id: scene.scene_id,
              scene_type: scene.scene_type,
              template_id: "concept-v1",
              remotion_component: "ConceptScene",
              character_version: "elarion-teacher-v1",
              character_pose: "explain_right",
              character_expression: "neutral",
              character_position: "left",
              character_scale: 0.9,
              environment_id: "modern-classroom-v1",
              active_zones: [],
            }} />
          )}

          {/* Scene audio — only if URL is available */}
          {audioClip && audioClip.audio_url && audioClip.status === "ready" && (
            <Audio src={audioClip.audio_url} />
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Remotion root — registers all compositions
// ---------------------------------------------------------------------------
export const RemotionRoot: React.FC = () => {
  // Composition duration will be overridden via inputProps at render time
  // These defaults are for Remotion Studio preview only
  const defaultDurationFrames = 30 * 30; // 30 seconds preview default

  return (
    <Composition
      id="ElarionLesson"
      component={ElarionLesson as any}
      width={CANVAS.width}
      height={CANVAS.height}
      fps={CANVAS.fps}
      durationInFrames={defaultDurationFrames}
      defaultProps={{ payload: null }}
    />
  );
};
