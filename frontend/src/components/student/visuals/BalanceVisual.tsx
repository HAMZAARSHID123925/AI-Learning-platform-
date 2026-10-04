'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface BalanceVisualProps {
  left: string;
  right: string;
  /** Degrees. Negative lowers the left pan. */
  tilt?: number;
  toneHex: string;
}

export function BalanceVisual({ left, right, tilt = 0, toneHex }: BalanceVisualProps) {
  return (
    <svg viewBox="0 0 340 200" className="w-full max-w-sm" role="img" aria-label={`Balance scale: ${left} on the left, ${right} on the right${tilt === 0 ? ', balanced' : ''}`}>
      <path d="M 170 60 L 140 176 L 200 176 Z" fill="#16181D" />
      <rect x={110} y={172} width={120} height={12} rx={6} fill="#16181D" />
      <motion.g initial={false} animate={{ rotate: tilt }} transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }} style={{ originX: '170px', originY: '60px', transformBox: 'view-box' }}>
        <rect x={30} y={54} width={280} height={12} rx={6} fill="#16181D" />
        <line x1={60} y1={60} x2={60} y2={96} stroke="#16181D" strokeWidth={3} />
        <line x1={280} y1={60} x2={280} y2={96} stroke="#16181D" strokeWidth={3} />
        <rect x={10} y={96} width={100} height={44} rx={14} fill={toneHex} />
        <rect x={230} y={96} width={100} height={44} rx={14} fill="#FFFFFF" stroke="#16181D" strokeWidth={3} />
        <text x={60} y={125} textAnchor="middle" fontSize={20} fontWeight={900} fill="#16181D">{left}</text>
        <text x={280} y={125} textAnchor="middle" fontSize={20} fontWeight={900} fill="#16181D">{right}</text>
      </motion.g>
      <circle cx={170} cy={60} r={9} fill="#FFFFFF" stroke="#16181D" strokeWidth={4} />
    </svg>);

}