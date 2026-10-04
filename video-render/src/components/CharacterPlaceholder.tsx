/**
 * ELARION — Video Render Service
 * src/components/CharacterPlaceholder.tsx
 *
 * ⚠ DEV PLACEHOLDER — Production character assets not yet created.
 *
 * This component renders a styled placeholder in place of the real
 * 3D cartoon ELARION teacher character (elarion-teacher-v1).
 *
 * The placeholder is explicitly labeled and visually distinct.
 * It must NEVER be used in production videos.
 *
 * When real character assets are approved and rendered, replace this
 * component with an <Img /> referencing the actual asset files.
 *
 * Character spec: M3.3 visual/character.py — ELARION_TEACHER_V1
 *   - Female, age 17–18, 3D cartoon, navy ELARION shirt
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { PALETTE, FONT } from "../design";

interface CharacterPlaceholderProps {
  pose: string;
  expression: string;
  position: "left" | "right" | "center" | "edge_left" | "edge_right";
  scale?: number;
}

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  left: { left: 40, bottom: 80 },
  right: { right: 40, bottom: 80 },
  center: { left: "50%", transform: "translateX(-50%)", bottom: 80 },
  edge_left: { left: 0, bottom: 80 },
  edge_right: { right: 0, bottom: 80 },
};

export const CharacterPlaceholder: React.FC<CharacterPlaceholderProps> = ({
  pose,
  expression,
  position,
  scale = 1.0,
}) => {
  const posStyle = POSITION_STYLES[position] ?? POSITION_STYLES.left;

  return (
    <div
      style={{
        position: "absolute",
        width: 320 * scale,
        height: 560 * scale,
        ...posStyle,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        fontFamily: FONT,
      }}
    >
      {/* Character body placeholder */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(180deg, #3949AB 0%, #1A237E 100%)",
          borderRadius: 24,
          border: "3px solid rgba(255,255,255,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          boxSizing: "border-box",
          opacity: 0.85,
        }}
      >
        {/* Head */}
        <div
          style={{
            width: 100 * scale,
            height: 100 * scale,
            borderRadius: "50%",
            background: "#C68642",
            border: "2px solid rgba(255,255,255,0.3)",
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36 * scale,
          }}
        >
          {expression === "friendly_smile" || expression === "celebrating"
            ? "😊"
            : expression === "thinking"
            ? "🤔"
            : expression === "surprised"
            ? "😲"
            : expression === "confused_demo"
            ? "😕"
            : "🙂"}
        </div>

        {/* Body / shirt */}
        <div
          style={{
            flex: 1,
            width: "80%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 12,
          }}
        >
          {/* ELARION shirt label */}
          <div
            style={{
              fontSize: 14 * scale,
              color: "rgba(255,255,255,0.9)",
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            ELARION
          </div>
        </div>

        {/* DEV PLACEHOLDER label */}
        <div
          style={{
            fontSize: 10,
            color: "rgba(255,200,0,0.9)",
            fontWeight: 700,
            textAlign: "center",
            padding: "4px 8px",
            background: "rgba(0,0,0,0.4)",
            borderRadius: 6,
            marginBottom: 8,
          }}
        >
          ⚠ DEV PLACEHOLDER
          {"\n"}pose: {pose}
        </div>
      </div>
    </div>
  );
};
