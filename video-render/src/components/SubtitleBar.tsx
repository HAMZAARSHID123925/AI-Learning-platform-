/**
 * ELARION — Video Render Service
 * src/components/SubtitleBar.tsx
 *
 * Scene-level subtitle / caption strip.
 * Renders at bottom of screen in safe subtitle zone.
 * High contrast, readable, does not overlap character or diagrams.
 */

import React from "react";
import { PALETTE, FONT, LAYOUT } from "../design";

interface SubtitleBarProps {
  text: string;
  maxChars?: number;
}

/** Break narration into readable subtitle chunks (sentence-level) */
function chunkNarration(text: string, maxChars: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > maxChars && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export const SubtitleBar: React.FC<SubtitleBarProps> = ({
  text,
  maxChars = 90,
}) => {
  // For MVP we show the full narration text (truncated to maxChars for readability)
  const display = text.length > maxChars ? text.slice(0, maxChars) + "…" : text;

  return (
    <div
      style={{
        position: "absolute",
        bottom: LAYOUT.safeSubtitleBottom,
        left: 0,
        right: 0,
        height: LAYOUT.subtitleHeight,
        background: PALETTE.subtitleBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 120px",
        boxSizing: "border-box",
      }}
    >
      <p
        style={{
          fontFamily: FONT,
          fontSize: LAYOUT.subtitleFontSize,
          fontWeight: 400,
          color: PALETTE.subtitleText,
          margin: 0,
          textAlign: "center",
          lineHeight: 1.4,
          maxWidth: 1500,
        }}
      >
        {display}
      </p>
    </div>
  );
};
