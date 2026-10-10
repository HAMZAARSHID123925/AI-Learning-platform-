/**
 * ELARION — Decorative set dressing (template asset).
 *
 * A floating shelf with classroom objects in the top-right corner, plus soft
 * background shapes. Drawn on the stage layer (static, so it costs no frames).
 */
import React from "react";
import { staticFile } from "remotion";
import { THEME, LAYOUT } from "./theme";

/** Soft shapes behind everything; subtle so text stays readable. */
export const BackgroundShapes: React.FC = () => (
  <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
    <circle cx="1700" cy="900" r="320" fill="#DCE6FF" opacity="0.35" />
    <circle cx="120" cy="140" r="180" fill="#FFE4C8" opacity="0.5" />
    <circle cx="1480" cy="60" r="90" fill="#FFD9BE" opacity="0.45" />
    <path d="M0 980 Q480 900 960 980 T1920 980 L1920 1080 L0 1080 Z" fill="#E4ECFF" opacity="0.6" />
  </svg>
);

/** Top-right shelf: books, plant, globe, alarm clock, pencil cup. Origin = shelf's left edge. */
export const Shelf: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg viewBox="0 0 560 170" width="560" height="170" style={{ position: "absolute", left: x, top: y }}>
    <defs>
      <linearGradient id="dc-globe" cx="0.4" cy="0.4"><stop stopColor="#8DB4FF" /><stop offset="1" stopColor="#3F6ED8" /></linearGradient>
    </defs>
    {/* shelf board + shadow */}
    <rect x="0" y="140" width="560" height="16" rx="4" fill="#D9B98F" />
    <rect x="0" y="152" width="560" height="8" rx="3" fill="#B8975F" />
    <rect x="30" y="156" width="500" height="10" rx="5" fill="#1B2A4A" opacity="0.08" />

    {/* books, leaning stack */}
    <rect x="22" y="58" width="22" height="82" rx="3" fill="#E6705C" />
    <rect x="46" y="48" width="24" height="92" rx="3" fill="#3F6ED8" />
    <rect x="72" y="66" width="20" height="74" rx="3" fill="#F2B84B" />
    <rect x="94" y="54" width="22" height="86" rx="3" fill="#53B98E" transform="rotate(8 105 140)" />
    <rect x="30" y="74" width="6" height="36" rx="3" fill="#FFFFFF" opacity="0.45" />
    <rect x="55" y="62" width="6" height="52" rx="3" fill="#FFFFFF" opacity="0.4" />

    {/* plant */}
    <path d="M164 140 L158 104 L212 104 L206 140 Z" fill="#E59A6D" />
    <rect x="154" y="98" width="62" height="12" rx="4" fill="#F0B189" />
    <path d="M185 100 Q150 90 148 48 Q186 56 185 100 Z" fill="#4CB58A" />
    <path d="M185 100 Q220 84 230 40 Q192 50 185 100 Z" fill="#3A9B74" />
    <path d="M185 100 Q172 60 190 28 Q206 60 185 100 Z" fill="#5CC79A" />

    {/* globe */}
    <circle cx="300" cy="86" r="44" fill="url(#dc-globe)" />
    <path d="M266 76 Q288 60 310 78 Q326 94 318 112 Q300 118 290 104 Q272 96 266 76 Z" fill="#6FD39C" opacity="0.9" />
    <path d="M304 46 Q330 60 326 92" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.35" />
    <path d="M258 60 Q244 86 258 118" stroke="#8C98B4" strokeWidth="5" fill="none" strokeLinecap="round" />
    <rect x="284" y="128" width="32" height="12" rx="4" fill="#5C6B8F" />
    <rect x="296" y="118" width="8" height="12" fill="#5C6B8F" />

    {/* alarm clock */}
    <circle cx="398" cy="96" r="36" fill="#F4F7FF" stroke="#E6705C" strokeWidth="8" />
    <path d="M374 64 L364 54 M422 64 L432 54" stroke="#E6705C" strokeWidth="8" strokeLinecap="round" />
    <path d="M398 76 L398 98 L414 106" stroke="#2A3550" strokeWidth="4" fill="none" strokeLinecap="round" />
    <circle cx="398" cy="98" r="3" fill="#2A3550" />
    <path d="M380 132 L372 140 M416 132 L424 140" stroke="#E6705C" strokeWidth="6" strokeLinecap="round" />

    {/* pencil cup */}
    <rect x="462" y="90" width="52" height="50" rx="6" fill="#5C6B8F" />
    <rect x="470" y="62" width="8" height="34" rx="2" fill="#F2B84B" /><path d="M470 62 L474 50 L478 62 Z" fill="#F4CBA8" />
    <rect x="484" y="56" width="8" height="40" rx="2" fill="#3F6ED8" /><path d="M484 56 L488 44 L492 56 Z" fill="#F4CBA8" />
    <rect x="498" y="66" width="8" height="30" rx="2" fill="#E6705C" /><path d="M498 66 L502 54 L506 66 Z" fill="#F4CBA8" />
  </svg>
);

/** Brand mark for the header: the school logo with the name beside it. */
export const BrandMark: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
    <img src={staticFile("logo.png")} style={{ height: LAYOUT.header.logoHeight, width: "auto", display: "block" }} />
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
      <span style={{ fontSize: 34, fontWeight: 900, letterSpacing: 2, color: THEME.brandNavy }}>{THEME.brandName}</span>
      <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 6, color: THEME.brandGold, marginTop: 6 }}>{THEME.brandSub}</span>
    </div>
  </div>
);
