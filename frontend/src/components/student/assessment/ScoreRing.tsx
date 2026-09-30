'use client';
import React from 'react';
import { motion } from 'framer-motion';

export function ScoreRing({ percent, hex, size = 160 }: {percent: number;hex: string;size?: number;}) {
  const r = 64;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#E8E9EE" strokeWidth="14" />
        <motion.circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke={hex}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - percent / 100) }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} />
        
      </svg>
      <span className="absolute inset-0 grid place-items-center text-4xl font-black text-ink">{percent}%</span>
    </div>);

}