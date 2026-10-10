/**
 * ELARION — Lesson scene template (the "stage" layer).
 *
 * Draws header, content card, diagram and subtitle bar for ONE scene at ONE
 * frame. It is a pure function of (scene, frame): no hooks, no Remotion
 * timing, so the renderer can draw it only on the frames where it changes.
 * The teacher is NOT drawn here; it is overlaid from a pre-rendered loop.
 */
import React from "react";
import { interpolate } from "remotion";
import { THEME, LAYOUT, MOTION } from "./theme";
import { subtitleChunks, subtitleAt, revealStart } from "./timeline";
import { BackgroundShapes, Shelf, BrandMark } from "./Decor";
import type { SceneData } from "../types";

const ease = (f: number, start: number, span = MOTION.revealSpan) =>
  interpolate(f, [start, start + span], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export interface LessonSceneProps {
  scene: SceneData;
  frame: number;           // local frame within the scene
  durationFrames: number;
  audioFrames: number;
  index: number;
  showSubtitle?: boolean;
}

export const LessonScene: React.FC<LessonSceneProps> = ({ scene, frame: f, durationFrames, audioFrames, index, showSubtitle = true }) => {
  const points = scene.on_screen_text || scene.bullets || [scene.heading || ""];
  const diagram = scene.diagram;
  const hasDiagram = !!diagram && diagram.kind !== "none";
  const enter = ease(f, 0, MOTION.enterFrames);
  const exit = 1 - ease(f, durationFrames - MOTION.exitFrames, MOTION.exitFrames);
  const reveal = (i: number, count: number) => ease(f, revealStart(i, count, audioFrames));
  const subtitle = subtitleAt(subtitleChunks(scene.narration, audioFrames), f);
  const bg = THEME.background[index % THEME.background.length];

  return (
    <div style={{ position: "absolute", inset: 0, background: bg, fontFamily: THEME.fontFamily, color: THEME.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: THEME.backgroundGlow }} />
      <BackgroundShapes />
      <div style={{ position: "absolute", left: LAYOUT.header.left, top: LAYOUT.header.top }}><BrandMark /></div>
      <Shelf x={1920 - LAYOUT.shelf.right - 560} y={LAYOUT.shelf.top} />

      <div style={{
        position: "absolute", left: LAYOUT.card.left, right: LAYOUT.card.right, top: LAYOUT.card.top, bottom: LAYOUT.card.bottom,
        borderRadius: LAYOUT.card.radius, background: THEME.cardBg, boxShadow: THEME.cardShadow, padding: LAYOUT.card.padding,
        opacity: (0.35 + 0.65 * enter) * (0.35 + 0.65 * exit),
        transform: `translateX(${scene.transition === "slide" ? (1 - enter) * 45 : 0}px)`,
      }}>
        <div style={{ fontSize: 22, color: THEME.accentSoft, fontWeight: 700, letterSpacing: 2, marginBottom: 18 }}>
          {(scene.scene_type || "").replace(/_/g, " ").toUpperCase()}
        </div>
        <h1 style={{ fontSize: 54, lineHeight: 1.12, margin: "0 0 22px", maxHeight: 130 }}>{scene.heading}</h1>
        <div style={{ display: "flex", gap: 18, flexDirection: hasDiagram ? "row" : "column", height: hasDiagram ? undefined : 400 }}>
          {points.map((text, i) => {
            const r = reveal(i, points.length);
            return (
              <div key={i} style={{
                flex: 1, display: "flex", alignItems: "center", opacity: r, transform: `translateY(${(1 - r) * 14}px)`,
                padding: hasDiagram ? "15px 18px" : "20px 26px", background: scene.scene_type === "recap" ? THEME.pointBgRecap : THEME.pointBg,
                borderRadius: 18, borderLeft: `6px solid ${THEME.accent}`, fontSize: hasDiagram ? 30 : 40, lineHeight: 1.25, fontWeight: 600,
              }}>{text}</div>
            );
          })}
        </div>

        {hasDiagram && diagram && (
          <svg viewBox="0 0 1100 410" style={{ width: "100%", height: 430, marginTop: 24, overflow: "visible" }}>
            {diagram.kind === "fraction_bars" && diagram.labels.map((label, i) => {
              const y = (410 / (diagram.labels.length + 1)) * (i + 1), n = diagram.denominators[i], v = diagram.values[i];
              return (
                <g key={i} opacity={reveal(i, diagram.labels.length)}>
                  <text x="10" y={y + 20} fontSize="36" fontWeight="bold" fill={THEME.ink}>{label}</text>
                  {Array.from({ length: n }, (_, j) => (
                    <rect key={j} x={340 + (j * 700) / n} y={y - 22} width={700 / n} height="64" fill={j < v ? THEME.accent : "#E5EAF5"} stroke="#384D81" strokeWidth="2" />
                  ))}
                </g>
              );
            })}
            {diagram.kind === "number_line" && (
              <>
                <line x1="80" y1="210" x2="1010" y2="210" stroke="#384D81" strokeWidth="8" />
                <text x="72" y="264" fontSize="32">0</text><text x="1002" y="264" fontSize="32">1</text>
                {diagram.values.map((v, i) => (
                  <g key={i} opacity={reveal(i, diagram.values.length)}>
                    <circle cx={80 + v * 930} cy="210" r="13" fill={THEME.accent} />
                    <line x1={80 + v * 930} y1="210" x2={80 + v * 930} y2={i % 2 ? 300 : 130} stroke={THEME.accent} strokeWidth="3" />
                    <text x={80 + v * 930} y={i % 2 ? 340 : 110} textAnchor="middle" fontSize="34">{diagram.labels[i]}</text>
                  </g>
                ))}
              </>
            )}
            {["equation_steps", "process", "comparison", "cycle"].includes(diagram.kind) && diagram.labels.map((label, i) => {
              const cols = 2, w = 1000 / cols, x = 25 + (i % cols) * w;
              const y = (410 - Math.ceil(diagram.labels.length / cols) * 170) / 2 + Math.floor(i / cols) * 170;
              return (
                <g key={i} opacity={reveal(i, diagram.labels.length)}>
                  <rect x={x} y={y} width={w - 24} height="130" rx="18" fill={i % 2 ? "#EDF8F2" : "#EEE9FA"} stroke="#C1C9E1" strokeWidth="2" />
                  <text x={x + 20} y={y + 37} fontSize="23" fill={THEME.accentSoft}>{diagram.kind === "comparison" ? "COMPARE" : `STEP ${i + 1}`}</text>
                  <foreignObject x={x + 16} y={y + 52} width={w - 50} height="75">
                    <div style={{ fontSize: 32, lineHeight: 1.05, fontWeight: 700, textAlign: "center", fontFamily: THEME.fontFamily }}>{label}</div>
                  </foreignObject>
                  {i < diagram.labels.length - 1 && diagram.kind !== "comparison" && (i % 2
                    ? <text x={x + 60} y={y + 157} fontSize="36" fill={THEME.accentSoft}>↙</text>
                    : <g><line x1={x + w - 18} y1={y + 65} x2={x + w - 6} y2={y + 65} stroke={THEME.accentSoft} strokeWidth="3" /><polygon points={`${x + w - 6},${y + 65} ${x + w - 12},${y + 60} ${x + w - 12},${y + 70}`} fill={THEME.accentSoft} /></g>)}
                  {diagram.kind === "cycle" && i === diagram.labels.length - 1 && <text x="400" y="399" fontSize="32" fill={THEME.accentSoft}>↶ repeat the cycle</text>}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {showSubtitle && (
        <div style={{
          position: "absolute", left: LAYOUT.subtitle.left, right: LAYOUT.subtitle.right, bottom: LAYOUT.subtitle.bottom, minHeight: LAYOUT.subtitle.minHeight,
          borderRadius: 20, background: THEME.subtitleBg, color: THEME.subtitleText, padding: "19px 35px", fontSize: LAYOUT.subtitle.fontSize, lineHeight: 1.3, textAlign: "center",
        }}>{subtitle}</div>
      )}
    </div>
  );
};
