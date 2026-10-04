'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface NumberLineVisualProps {
  min: number;
  max: number;
  step: number;
  labelAs?: 'decimal' | 'fraction' | 'integer';
  den?: number;
  marks?: number[];
  value?: number;
  toneHex: string;
}

const W = 600;
const PAD = 32;

export function formatTick(v: number, labelAs: NumberLineVisualProps['labelAs'], den = 1): string {
  if (labelAs === 'fraction') {
    const k = Math.round(v * den);
    if (k === 0) return '0';
    if (k === den) return '1';
    return `${k}/${den}`;
  }
  if (labelAs === 'decimal') {
    if (v === 0 || v === 1) return String(v);
    return v.toFixed(1);
  }
  return String(Math.round(v));
}

export function NumberLineVisual({ min, max, step, labelAs = 'integer', den, marks = [], value, toneHex }: NumberLineVisualProps) {
  const count = Math.round((max - min) / step);
  const x = (v: number) => PAD + (v - min) / (max - min) * (W - PAD * 2);
  return (
    <svg viewBox={`0 0 ${W} 110`} className="w-full max-w-xl" role="img" aria-label={`Number line from ${min} to ${max}`}>
      <line x1={PAD} x2={W - PAD} y1={60} y2={60} stroke="#16181D" strokeWidth={4} strokeLinecap="round" />
      {Array.from({ length: count + 1 }, (_, i) => {
        const v = min + i * step;
        return (
          <g key={i}>
            <line x1={x(v)} x2={x(v)} y1={50} y2={70} stroke="#16181D" strokeWidth={3} strokeLinecap="round" />
            <text x={x(v)} y={96} textAnchor="middle" fontSize={count > 12 ? 15 : 17} fontWeight={800} fill="#4A4F5C">
              {formatTick(v, labelAs, den)}
            </text>
          </g>);

      })}
      {marks.map((m) =>
      <circle key={m} cx={x(m)} cy={60} r={11} fill={toneHex} stroke="#FFFFFF" strokeWidth={4} />
      )}
      {value !== undefined &&
      <motion.g initial={false} animate={{ x: x(value) }} transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}>
          <path d="M 0 40 L -12 18 L 12 18 Z" fill="#16181D" />
          <circle cx={0} cy={60} r={10} fill={toneHex} stroke="#16181D" strokeWidth={3} />
        </motion.g>
      }
    </svg>);

}