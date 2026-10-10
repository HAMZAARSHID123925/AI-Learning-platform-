import React from "react";
import { Composition, AbsoluteFill, Sequence, Audio, useCurrentFrame } from "remotion";
import { LessonScene } from "./templates/LessonScene";
import { TeacherFigure, TEACHER_LOOP_FRAMES } from "./templates/Teacher";
import { buildTimeline, locate } from "./templates/timeline";
import { CANVAS, LAYOUT } from "./templates/theme";
import type { RenderPayload } from "./types";

const Empty: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFF8EE", color: "#182C50", justifyContent: "center", alignItems: "center", fontSize: 48 }}>
    ELARION — load a real render payload to preview
  </AbsoluteFill>
);

/** Teacher placed exactly where the FFmpeg overlay puts the pre-rendered loop. */
const TeacherInPlace: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: "absolute", left: LAYOUT.teacher.left, bottom: LAYOUT.teacher.bottom, width: LAYOUT.teacher.width, height: LAYOUT.teacher.height }}>
    <TeacherFigure frame={frame} />
  </div>
);

// ---------------------------------------------------------------------------
// 1. Full lesson — Remotion Studio preview and the "full" fallback render.
// ---------------------------------------------------------------------------
export type ElarionLessonProps = { payload: RenderPayload | null };

export const ElarionLesson: React.FC<ElarionLessonProps> = ({ payload }) => {
  const frame = useCurrentFrame();
  if (!payload) return <Empty />;
  const timeline = buildTimeline(payload);
  return (
    <AbsoluteFill style={{ background: "#FFF8EE" }}>
      {timeline.scenes.map((t) => (
        <Sequence key={t.scene.scene_id} from={t.from} durationInFrames={t.durationFrames}>
          <LessonScene scene={t.scene} frame={Math.max(0, frame - t.from)} durationFrames={t.durationFrames} audioFrames={t.audioFrames} index={t.index} />
          {t.clip.audio_url && <Audio src={t.clip.audio_url} />}
        </Sequence>
      ))}
      <TeacherInPlace frame={frame} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 2. Stage — keyframe render. Frame N of this composition is global frame
//    frameMap[N] of the lesson, drawn WITHOUT the teacher.
// ---------------------------------------------------------------------------
export type ElarionStageProps = { payload: RenderPayload | null; frameMap: number[] };

export const ElarionStage: React.FC<ElarionStageProps> = ({ payload, frameMap }) => {
  const idx = useCurrentFrame();
  if (!payload || !frameMap?.length) return <Empty />;
  const timeline = buildTimeline(payload);
  const global = frameMap[Math.min(idx, frameMap.length - 1)];
  const { t, local } = locate(timeline, global);
  return (
    <AbsoluteFill>
      <LessonScene scene={t.scene} frame={local} durationFrames={t.durationFrames} audioFrames={t.audioFrames} index={t.index} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 3. Teacher loop — transparent, rendered once and cached.
// ---------------------------------------------------------------------------
export const ElarionTeacherLoop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <TeacherFigure frame={frame} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ElarionLesson" component={ElarionLesson} width={CANVAS.width} height={CANVAS.height} fps={CANVAS.fps} durationInFrames={900} defaultProps={{ payload: null }} />
    <Composition id="ElarionStage" component={ElarionStage} width={CANVAS.width} height={CANVAS.height} fps={CANVAS.fps} durationInFrames={1} defaultProps={{ payload: null, frameMap: [] }} />
    <Composition id="ElarionTeacherLoop" component={ElarionTeacherLoop} width={LAYOUT.teacher.width} height={LAYOUT.teacher.height} fps={CANVAS.fps} durationInFrames={TEACHER_LOOP_FRAMES} />
  </>
);
