/**
 * ELARION — Video Render Service
 * src/scenes/index.tsx
 *
 * All 9 scene template components, implementing M3.3 visual contracts.
 * Each component accepts typed props from RenderPayload.
 *
 * Templates: IntroScene, ConceptScene, ComparisonScene, WhiteboardScene,
 *            DiagramScene, ExampleScene, MisconceptionScene, RecapScene,
 *            QuizPromptScene
 *
 * ⚠ CHARACTER: All use DEV PLACEHOLDER character (CharacterPlaceholder).
 *   Replace with real 3D asset when production character is approved.
 */

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CharacterPlaceholder } from "../components/CharacterPlaceholder";
import { SubtitleBar } from "../components/SubtitleBar";
import { PALETTE, FONT, LAYOUT } from "../design";
import { SceneData, AssetSlot } from "../types";

// ---------------------------------------------------------------------------
// Shared fade-in spring
// ---------------------------------------------------------------------------
function useFadeIn(delay = 0): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 80 } });
}

// ---------------------------------------------------------------------------
// Shared scene wrapper
// ---------------------------------------------------------------------------
const SceneWrapper: React.FC<{
  bg: string;
  children: React.ReactNode;
  narration: string;
  showSubtitle?: boolean;
}> = ({ bg, children, narration, showSubtitle = true }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      background: bg,
      position: "relative",
      fontFamily: FONT,
      overflow: "hidden",
    }}
  >
    {children}
    {showSubtitle && <SubtitleBar text={narration} />}
  </div>
);

// ---------------------------------------------------------------------------
// Title component with fade-in
// ---------------------------------------------------------------------------
const SceneTitle: React.FC<{ text: string; color: string; delay?: number }> = ({
  text,
  color,
  delay = 0,
}) => {
  const opacity = useFadeIn(delay);
  return (
    <div
      style={{
        position: "absolute",
        top: LAYOUT.marginTop,
        left: LAYOUT.marginLeft,
        right: LAYOUT.marginRight,
        opacity,
        transform: `translateY(${interpolate(opacity, [0, 1], [20, 0])}px)`,
      }}
    >
      <h1
        style={{
          fontFamily: FONT,
          fontSize: LAYOUT.titleFontSize,
          fontWeight: 700,
          color,
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {text}
      </h1>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 1. IntroScene
// ---------------------------------------------------------------------------
export interface IntroSceneProps {
  scene: SceneData;
  slot: AssetSlot;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ scene, slot }) => {
  const opacity = useFadeIn(0);
  const textOpacity = useFadeIn(8);

  return (
    <SceneWrapper bg={PALETTE.bgClassroom} narration={scene.narration}>
      <CharacterPlaceholder
        pose={slot.character_pose}
        expression={slot.character_expression}
        position={slot.character_position as any}
        scale={slot.character_scale}
      />
      <div
        style={{
          position: "absolute",
          top: LAYOUT.marginTop + 20,
          left: 560,
          right: LAYOUT.marginRight,
          opacity,
        }}
      >
        <h1
          style={{
            fontFamily: FONT,
            fontSize: LAYOUT.titleFontSize + 8,
            fontWeight: 800,
            color: PALETTE.brandPrimary,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {scene.heading ?? "Welcome"}
        </h1>
      </div>
      <div
        style={{
          position: "absolute",
          top: 280,
          left: 560,
          right: LAYOUT.marginRight,
          opacity: textOpacity,
          transform: `translateY(${interpolate(textOpacity, [0, 1], [16, 0])}px)`,
        }}
      >
        <p
          style={{
            fontFamily: FONT,
            fontSize: LAYOUT.bodyFontSize,
            color: PALETTE.textPrimaryLight,
            margin: 0,
            lineHeight: 1.6,
            maxWidth: 1100,
          }}
        >
          {scene.body_text ?? ""}
        </p>
      </div>
    </SceneWrapper>
  );
};

// ---------------------------------------------------------------------------
// 2. ConceptScene
// ---------------------------------------------------------------------------
export const ConceptScene: React.FC<{ scene: SceneData; slot: AssetSlot }> = ({
  scene,
  slot,
}) => {
  const panelOpacity = useFadeIn(4);

  return (
    <SceneWrapper bg={PALETTE.bgClassroom} narration={scene.narration}>
      <CharacterPlaceholder
        pose={slot.character_pose}
        expression={slot.character_expression}
        position="left"
        scale={slot.character_scale}
      />
      {/* Content panel — right of character */}
      <div
        style={{
          position: "absolute",
          left: 560,
          top: LAYOUT.marginTop,
          right: LAYOUT.marginRight,
          bottom: LAYOUT.marginBottom + 40,
          background: PALETTE.panelLight,
          borderRadius: LAYOUT.borderRadius,
          border: `1.5px solid ${PALETTE.panelLightBorder}`,
          padding: LAYOUT.panelPadding,
          boxSizing: "border-box",
          opacity: panelOpacity,
          transform: `translateX(${interpolate(panelOpacity, [0, 1], [40, 0])}px)`,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
        }}
      >
        {scene.heading && (
          <h2
            style={{
              fontFamily: FONT,
              fontSize: LAYOUT.headingFontSize,
              fontWeight: 700,
              color: PALETTE.brandPrimary,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {scene.heading}
          </h2>
        )}
        {scene.body_text && (
          <p
            style={{
              fontFamily: FONT,
              fontSize: LAYOUT.bodyFontSize,
              color: PALETTE.textPrimaryLight,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {scene.body_text}
          </p>
        )}
        {scene.bullets?.slice(0, 3).map((b, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "flex-start", gap: 16 }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: PALETTE.brandAccent,
                marginTop: 10,
                flexShrink: 0,
              }}
            />
            <p
              style={{
                fontFamily: FONT,
                fontSize: LAYOUT.bulletFontSize,
                color: PALETTE.textPrimaryLight,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {b}
            </p>
          </div>
        ))}
      </div>
    </SceneWrapper>
  );
};

// ---------------------------------------------------------------------------
// 3. ComparisonScene
// ---------------------------------------------------------------------------
export const ComparisonScene: React.FC<{ scene: SceneData; slot: AssetSlot }> = ({
  scene,
  slot,
}) => {
  const leftOp = useFadeIn(2);
  const rightOp = useFadeIn(8);

  const PanelBlock = ({
    panel,
    opacity,
    accent,
  }: {
    panel: { label: string; points: string[] };
    opacity: number;
    accent: string;
  }) => (
    <div
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.08)",
        border: `2px solid ${accent}`,
        borderRadius: LAYOUT.borderRadius,
        padding: LAYOUT.panelPadding,
        opacity,
        transform: `translateY(${interpolate(opacity, [0, 1], [30, 0])}px)`,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: LAYOUT.labelFontSize,
          fontWeight: 700,
          color: accent,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {panel.label}
      </div>
      {panel.points.slice(0, 3).map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ color: accent, fontSize: 22, marginTop: 4 }}>▶</span>
          <span
            style={{
              fontFamily: FONT,
              fontSize: LAYOUT.bulletFontSize,
              color: PALETTE.textPrimaryDark,
              lineHeight: 1.5,
            }}
          >
            {p}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <SceneWrapper bg={PALETTE.bgConcept} narration={scene.narration}>
      <SceneTitle text={scene.heading ?? "Compare"} color={PALETTE.textPrimaryDark} />
      {/* Small edge character */}
      <CharacterPlaceholder
        pose={slot.character_pose}
        expression={slot.character_expression}
        position="edge_left"
        scale={0.6}
      />
      <div
        style={{
          position: "absolute",
          left: 200,
          right: LAYOUT.marginRight,
          top: 200,
          bottom: LAYOUT.marginBottom + 40,
          display: "flex",
          gap: 40,
        }}
      >
        <PanelBlock
          panel={scene.left_panel ?? { label: "A", points: [] }}
          opacity={leftOp}
          accent={PALETTE.brandHighlight}
        />
        <PanelBlock
          panel={scene.right_panel ?? { label: "B", points: [] }}
          opacity={rightOp}
          accent={PALETTE.brandAccent}
        />
      </div>
    </SceneWrapper>
  );
};

// ---------------------------------------------------------------------------
// 4. WhiteboardScene
// ---------------------------------------------------------------------------
export const WhiteboardScene: React.FC<{ scene: SceneData; slot: AssetSlot }> = ({
  scene,
  slot,
}) => {
  const boardOp = useFadeIn(4);

  return (
    <SceneWrapper bg={PALETTE.bgWhiteboard} narration={scene.narration}>
      <CharacterPlaceholder
        pose="whiteboard_point"
        expression={slot.character_expression}
        position="edge_left"
        scale={0.85}
      />
      {/* Whiteboard surface */}
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 80,
          right: LAYOUT.marginRight,
          bottom: LAYOUT.marginBottom + 40,
          background: "#FFFFFF",
          border: "3px solid #D0D7E8",
          borderRadius: 12,
          padding: 60,
          boxSizing: "border-box",
          opacity: boardOp,
          boxShadow: "inset 0 2px 20px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        <h2
          style={{
            fontFamily: FONT,
            fontSize: LAYOUT.headingFontSize,
            fontWeight: 700,
            color: PALETTE.brandPrimary,
            margin: 0,
            borderBottom: `3px solid ${PALETTE.brandPrimary}`,
            paddingBottom: 16,
          }}
        >
          {scene.heading ?? "Let me show you..."}
        </h2>
        {scene.body_text && (
          <p
            style={{
              fontFamily: FONT,
              fontSize: LAYOUT.bodyFontSize,
              color: PALETTE.textPrimaryLight,
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            {scene.body_text}
          </p>
        )}
        {scene.diagram_description && (
          <div
            style={{
              flex: 1,
              border: "2px dashed #C0C8E0",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PALETTE.textMuted,
              fontSize: LAYOUT.captionFontSize,
              fontFamily: FONT,
              textAlign: "center",
              padding: 24,
            }}
          >
            📊 {scene.diagram_description}
          </div>
        )}
      </div>
    </SceneWrapper>
  );
};

// ---------------------------------------------------------------------------
// 5. DiagramScene
// ---------------------------------------------------------------------------
export const DiagramScene: React.FC<{ scene: SceneData; slot: AssetSlot }> = ({
  scene,
  slot,
}) => {
  const diagramOp = useFadeIn(4);

  return (
    <SceneWrapper bg={PALETTE.bgClassroom} narration={scene.narration}>
      <SceneTitle text={scene.heading ?? "Diagram"} color={PALETTE.brandPrimary} />
      <CharacterPlaceholder
        pose={slot.character_pose}
        expression={slot.character_expression}
        position="left"
        scale={0.8}
      />
      {/* Diagram zone */}
      <div
        style={{
          position: "absolute",
          left: 560,
          top: 200,
          right: LAYOUT.marginRight,
          bottom: LAYOUT.marginBottom + 40,
          background: PALETTE.panelLight,
          borderRadius: LAYOUT.borderRadius,
          border: `1.5px solid ${PALETTE.panelLightBorder}`,
          padding: 48,
          boxSizing: "border-box",
          opacity: diagramOp,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            fontSize: 60,
            marginBottom: 12,
          }}
        >
          📐
        </div>
        <p
          style={{
            fontFamily: FONT,
            fontSize: LAYOUT.bodyFontSize,
            color: PALETTE.textPrimaryLight,
            textAlign: "center",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {scene.diagram_description ?? "Diagram content"}
        </p>
        {scene.diagram_labels && scene.diagram_labels.length > 0 && (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
            {scene.diagram_labels.map((label, i) => (
              <div
                key={i}
                style={{
                  background: PALETTE.brandPrimary,
                  color: "#fff",
                  padding: "8px 20px",
                  borderRadius: 8,
                  fontFamily: FONT,
                  fontSize: LAYOUT.labelFontSize,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </div>
    </SceneWrapper>
  );
};

// ---------------------------------------------------------------------------
// 6. ExampleScene
// ---------------------------------------------------------------------------
export const ExampleScene: React.FC<{ scene: SceneData; slot: AssetSlot }> = ({
  scene,
  slot,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneWrapper bg={PALETTE.bgClassroom} narration={scene.narration}>
      <SceneTitle text={scene.heading ?? "Example"} color={PALETTE.brandPrimary} />
      <CharacterPlaceholder
        pose={slot.character_pose}
        expression={slot.character_expression}
        position="left"
        scale={slot.character_scale}
      />
      <div
        style={{
          position: "absolute",
          left: 560,
          top: 200,
          right: LAYOUT.marginRight,
          bottom: LAYOUT.marginBottom + 40,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {(scene.example_steps ?? [scene.body_text ?? ""]).slice(0, 3).map((step, i) => {
          const delay = i * 10;
          const stepOp = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 80 } });
          return (
            <div
              key={i}
              style={{
                background: PALETTE.panelLight,
                borderRadius: LAYOUT.borderRadius,
                border: `1.5px solid ${PALETTE.panelLightBorder}`,
                padding: "28px 40px",
                display: "flex",
                alignItems: "flex-start",
                gap: 24,
                opacity: stepOp,
                transform: `translateX(${interpolate(stepOp, [0, 1], [30, 0])}px)`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: PALETTE.brandPrimary,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT,
                  fontSize: 22,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: LAYOUT.bodyFontSize,
                  color: PALETTE.textPrimaryLight,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </SceneWrapper>
  );
};

// ---------------------------------------------------------------------------
// 7. MisconceptionScene
// ---------------------------------------------------------------------------
export const MisconceptionScene: React.FC<{ scene: SceneData; slot: AssetSlot }> = ({
  scene,
  slot,
}) => {
  const wrongOp = useFadeIn(2);
  const correctionOp = useFadeIn(12);

  return (
    <SceneWrapper bg={PALETTE.bgClassroom} narration={scene.narration}>
      <SceneTitle text={scene.heading ?? "Common Mistake"} color={PALETTE.brandPrimary} />
      <CharacterPlaceholder
        pose="surprised"
        expression="surprised"
        position="left"
        scale={slot.character_scale}
      />
      <div
        style={{
          position: "absolute",
          left: 560,
          top: 200,
          right: LAYOUT.marginRight,
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* Wrong answer */}
        <div
          style={{
            background: "#FFF3F3",
            border: `2px solid ${PALETTE.errorRed}`,
            borderRadius: LAYOUT.borderRadius,
            padding: "28px 40px",
            opacity: wrongOp,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: LAYOUT.labelFontSize,
              fontWeight: 700,
              color: PALETTE.errorRed,
              marginBottom: 8,
            }}
          >
            ✗ Common Mistake
          </div>
          <p
            style={{
              fontFamily: FONT,
              fontSize: LAYOUT.bodyFontSize,
              color: "#B71C1C",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {scene.misconception_text ?? scene.body_text ?? ""}
          </p>
        </div>

        {/* Correction */}
        <div
          style={{
            background: "#F3FFF5",
            border: `2px solid ${PALETTE.correctGreen}`,
            borderRadius: LAYOUT.borderRadius,
            padding: "28px 40px",
            opacity: correctionOp,
            transform: `translateY(${interpolate(correctionOp, [0, 1], [20, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: LAYOUT.labelFontSize,
              fontWeight: 700,
              color: PALETTE.correctGreen,
              marginBottom: 8,
            }}
          >
            ✓ Correction
          </div>
          <p
            style={{
              fontFamily: FONT,
              fontSize: LAYOUT.bodyFontSize,
              color: "#1B5E20",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {scene.correction_text ?? ""}
          </p>
        </div>
      </div>
    </SceneWrapper>
  );
};

// ---------------------------------------------------------------------------
// 8. RecapScene
// ---------------------------------------------------------------------------
export const RecapScene: React.FC<{ scene: SceneData; slot: AssetSlot }> = ({
  scene,
  slot,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneWrapper bg={PALETTE.bgRecap} narration={scene.narration}>
      <SceneTitle text={scene.heading ?? "Let's Recap"} color={PALETTE.textPrimaryDark} />
      <CharacterPlaceholder
        pose="recap"
        expression="encouraging"
        position="left"
        scale={0.85}
      />
      <div
        style={{
          position: "absolute",
          left: 560,
          top: 200,
          right: LAYOUT.marginRight,
          bottom: LAYOUT.marginBottom + 60,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 32,
        }}
      >
        {(scene.bullets ?? []).slice(0, 3).map((bullet, i) => {
          const delay = i * 12;
          const op = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 80 } });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity: op,
                transform: `translateX(${interpolate(op, [0, 1], [40, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: PALETTE.brandAccent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT,
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: LAYOUT.bulletFontSize + 2,
                  color: PALETTE.textPrimaryDark,
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {bullet}
              </p>
            </div>
          );
        })}
      </div>
    </SceneWrapper>
  );
};

// ---------------------------------------------------------------------------
// 9. QuizPromptScene
// ---------------------------------------------------------------------------
export const QuizPromptScene: React.FC<{ scene: SceneData; slot: AssetSlot }> = ({
  scene,
  slot,
}) => {
  const cardOp = useFadeIn(4);

  return (
    <SceneWrapper bg={PALETTE.bgConcept} narration={scene.narration} showSubtitle={false}>
      <CharacterPlaceholder
        pose="thinking"
        expression="thinking"
        position="left"
        scale={slot.character_scale}
      />
      <div
        style={{
          position: "absolute",
          left: 560,
          top: "50%",
          transform: "translateY(-50%)",
          right: LAYOUT.marginRight,
          opacity: cardOp,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            border: `2px solid ${PALETTE.brandAccent}`,
            borderRadius: 24,
            padding: "60px 64px",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: LAYOUT.labelFontSize,
              fontWeight: 700,
              color: PALETTE.brandAccent,
              marginBottom: 20,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            🤔 Think About It
          </div>
          <p
            style={{
              fontFamily: FONT,
              fontSize: LAYOUT.headingFontSize - 4,
              fontWeight: 600,
              color: PALETTE.textPrimaryDark,
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {scene.quiz_question ?? scene.heading ?? "What do you think?"}
          </p>
        </div>
      </div>
    </SceneWrapper>
  );
};
