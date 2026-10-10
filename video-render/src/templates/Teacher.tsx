/**
 * ELARION — Teacher character (template asset, v3).
 *
 * Flat-vector explainer style. Rendered ONCE as a seamless transparent loop
 * (TEACHER_LOOP_FRAMES frames) and overlaid on the stage by FFmpeg. Every
 * motion is periodic in the loop length. Box: 520 x 760 (LAYOUT.teacher);
 * the figure is framed from the hips up, cut by the bottom edge.
 */
import React from "react";

export const TEACHER_LOOP_FRAMES = 150; // 5 s at 30 fps
export const TEACHER_VERSION = "elarion-teacher-v3";

const C = {
  skin: "#F4CBA8", skinShade: "#E4B08A", blush: "#EE9E8A",
  hair: "#3B2A24", hairLight: "#5C4339",
  blazer: "#2B4A8C", blazerDark: "#1F3769", blouse: "#FFFFFF", blouseShade: "#E6ECF7",
  trousers: "#2C3756", lanyard: "#E9C761",
  iris: "#4E3524", lips: "#C85A60", mouthIn: "#7A2E35", teeth: "#FFFFFF",
  tablet: "#1E2A44", screen: "#DDE7FA",
};

export interface TeacherProps { frame: number; talking?: boolean }

export const TeacherFigure: React.FC<TeacherProps> = ({ frame, talking = true }) => {
  const L = TEACHER_LOOP_FRAMES;
  const f = ((frame % L) + L) % L;
  const two = Math.PI * 2;
  const breathe = Math.sin((two * f) / L) * 3;
  const sway = Math.sin((two * f) / L) * 1.5;
  const gesture = Math.sin((two * f * 2) / L) * 7 + Math.sin((two * f * 3) / L) * 2;
  const speech = talking ? Math.abs(Math.sin((two * f * 7) / L)) * (0.55 + 0.45 * Math.abs(Math.sin((two * f * 3) / L))) : 0;
  const open = speech * 12;
  const blink = (f >= 48 && f < 53) || (f >= 118 && f < 123);
  const browLift = Math.max(0, Math.sin((two * f * 2) / L)) * 2;
  const headTilt = Math.sin((two * f) / L) * 1.2;

  return (
    <svg viewBox="0 0 520 760" width="520" height="760" aria-label="ELARION teacher" style={{ display: "block" }}>
      <defs>
        <linearGradient id="t3-blazer" x1="0" y1="0" x2="0" y2="1"><stop stopColor={C.blazer} /><stop offset="1" stopColor={C.blazerDark} /></linearGradient>
        <linearGradient id="t3-hair" x1="0" y1="0" x2="0" y2="1"><stop stopColor={C.hairLight} /><stop offset="0.5" stopColor={C.hair} /></linearGradient>
        <radialGradient id="t3-shadow" cx="0.5" cy="0.5" r="0.5"><stop stopColor="#1B2A4A" stopOpacity="0.2" /><stop offset="1" stopColor="#1B2A4A" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="262" cy="750" rx="170" ry="14" fill="url(#t3-shadow)" />

      <g transform={`translate(${sway} ${breathe})`}>
        {/* hair behind the head and shoulders */}
        <path d="M160 250 Q140 120 260 108 Q380 120 360 250 L384 440 Q322 476 260 470 Q198 476 136 440 Z" fill="url(#t3-hair)" />

        {/* trousers / skirt */}
        <path d="M150 600 L140 760 L384 760 L374 600 Z" fill={C.trousers} />

        {/* blouse */}
        <path d="M186 372 L260 450 L334 372 L352 610 L172 610 Z" fill={C.blouse} />
        <path d="M226 400 L260 450 L294 400 L300 610 L222 610 Z" fill={C.blouseShade} />

        {/* blazer body + lapels */}
        <path d="M186 370 Q126 384 118 450 L112 610 L224 610 L246 470 Z" fill="url(#t3-blazer)" />
        <path d="M334 370 Q394 384 402 450 L408 610 L296 610 L274 470 Z" fill="url(#t3-blazer)" />
        <path d="M186 370 L260 462 L224 610 L198 610 Z" fill={C.blazerDark} opacity="0.5" />
        <path d="M334 370 L260 462 L296 610 L322 610 Z" fill={C.blazerDark} opacity="0.5" />

        {/* lanyard and badge */}
        <path d="M240 380 L254 488 M280 380 L266 488" stroke={C.lanyard} strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="234" y="484" width="52" height="36" rx="6" fill="#FFFFFF" stroke="#C7D0E4" strokeWidth="2" />
        <rect x="243" y="494" width="34" height="5" rx="2" fill="#5C6B8F" /><rect x="243" y="504" width="22" height="5" rx="2" fill="#AEB8CF" />

        {/* arms as rounded tubes: left arm bent holding a tablet */}
        <path d="M146 430 L128 548" stroke={C.blazerDark} strokeWidth="58" strokeLinecap="round" fill="none" />
        <path d="M128 548 L236 574" stroke={C.blazer} strokeWidth="54" strokeLinecap="round" fill="none" />
        <g transform="rotate(-10 215 575)">
          <rect x="150" y="528" width="130" height="94" rx="10" fill={C.tablet} />
          <rect x="160" y="538" width="110" height="74" rx="6" fill={C.screen} />
          <rect x="172" y="552" width="60" height="6" rx="3" fill="#8FA4D6" /><rect x="172" y="566" width="80" height="6" rx="3" fill="#B9C7E8" /><rect x="172" y="580" width="44" height="6" rx="3" fill="#B9C7E8" />
        </g>
        <circle cx="244" cy="590" r="21" fill={C.skin} />

        {/* right arm: upper arm fixed, forearm gesturing toward the card */}
        <path d="M376 430 L418 526" stroke={C.blazerDark} strokeWidth="58" strokeLinecap="round" fill="none" />
        <g transform={`rotate(${-8 + gesture} 418 526)`}>
          <path d="M418 526 L486 478" stroke={C.blazer} strokeWidth="54" strokeLinecap="round" fill="none" />
          <circle cx="498" cy="470" r="23" fill={C.skin} />
          <path d="M506 452 Q530 446 532 462 Q530 474 512 476" fill={C.skin} />
        </g>

        {/* neck */}
        <path d="M232 300 L232 372 Q260 396 288 372 L288 300 Z" fill={C.skinShade} />
        <path d="M240 300 L240 356 Q260 372 280 356 L280 300 Z" fill={C.skin} />

        {/* head */}
        <g transform={`rotate(${headTilt} 260 300)`}>
          <ellipse cx="168" cy="236" rx="13" ry="18" fill={C.skinShade} /><ellipse cx="352" cy="236" rx="13" ry="18" fill={C.skinShade} />
          <path d="M172 232 Q172 120 260 118 Q348 120 348 232 Q348 300 300 332 Q260 344 220 332 Q172 300 172 232 Z" fill={C.skin} />
          <path d="M184 282 Q260 330 336 282 Q330 316 300 332 Q260 344 220 332 Q190 316 184 282 Z" fill={C.skinShade} opacity="0.22" />
          <ellipse cx="208" cy="266" rx="18" ry="10" fill={C.blush} opacity="0.3" /><ellipse cx="312" cy="266" rx="18" ry="10" fill={C.blush} opacity="0.3" />

          {/* brows */}
          <g transform={`translate(0 ${-browLift})`}>
            <path d="M196 206 Q220 196 244 206" stroke={C.hair} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />
            <path d="M276 206 Q300 196 324 206" stroke={C.hair} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />
          </g>
          {/* eyes */}
          {blink ? (
            <>
              <path d="M204 236 Q220 244 236 236" stroke={C.hair} strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M284 236 Q300 244 316 236" stroke={C.hair} strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M202 234 Q220 218 238 234 Q220 248 202 234 Z" fill="#FFFFFF" />
              <path d="M282 234 Q300 218 318 234 Q300 248 282 234 Z" fill="#FFFFFF" />
              <circle cx="222" cy="234" r="7.5" fill={C.iris} /><circle cx="302" cy="234" r="7.5" fill={C.iris} />
              <circle cx="223" cy="235" r="3.5" fill="#15100E" /><circle cx="303" cy="235" r="3.5" fill="#15100E" />
              <circle cx="219" cy="231" r="2.2" fill="#FFFFFF" /><circle cx="299" cy="231" r="2.2" fill="#FFFFFF" />
              <path d="M202 234 Q220 218 238 234" stroke={C.hair} strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M282 234 Q300 218 318 234" stroke={C.hair} strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}
          {/* nose */}
          <path d="M258 250 Q250 272 262 276" stroke={C.skinShade} strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* mouth */}
          <path d={`M236 296 Q260 ${290 + open * 0.1} 284 296 Q260 ${300 + open} 236 296 Z`} fill={C.mouthIn} />
          {open > 3 && <path d={`M242 296 Q260 ${294 + open * 0.3} 278 296 Q260 ${298 + open * 0.3} 242 296 Z`} fill={C.teeth} />}
          <path d="M236 296 Q260 288 284 296" stroke={C.lips} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d={`M236 296 Q260 ${300 + open} 284 296`} stroke={C.lips} strokeWidth="4.5" fill="none" strokeLinecap="round" />

          {/* bangs: swept to the side, forehead only */}
          <path d="M172 232 Q168 130 262 116 Q354 126 348 230 Q334 176 290 170 Q262 196 224 180 Q190 186 172 232 Z" fill="url(#t3-hair)" />
          <path d="M290 166 Q330 170 348 226 Q350 190 330 150 Q300 140 290 166 Z" fill={C.hairLight} opacity="0.4" />
        </g>
      </g>
    </svg>
  );
};
