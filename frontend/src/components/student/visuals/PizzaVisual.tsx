'use client';
import React from 'react';

interface PizzaVisualProps {
  slices: number;
  /** Indices of shaded slices. */
  shaded: Set<number>;
  onToggle?: (index: number) => void;
  disabled?: boolean;
}

const SIZE = 240;
const C = SIZE / 2;
const R = 104;

function point(angle: number, radius: number) {
  return { x: C + radius * Math.cos(angle), y: C + radius * Math.sin(angle) };
}

function wedgePath(i: number, n: number): string {
  const a0 = -Math.PI / 2 + i / n * Math.PI * 2;
  const a1 = -Math.PI / 2 + (i + 1) / n * Math.PI * 2;
  const p0 = point(a0, R);
  const p1 = point(a1, R);
  const large = 1 / n > 0.5 ? 1 : 0;
  return `M ${C} ${C} L ${p0.x} ${p0.y} A ${R} ${R} 0 ${large} 1 ${p1.x} ${p1.y} Z`;
}

export function PizzaVisual({ slices, shaded, onToggle, disabled }: PizzaVisualProps) {
  const interactive = Boolean(onToggle) && !disabled;
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-56 w-56 sm:h-64 sm:w-64" role={interactive ? 'group' : 'img'} aria-label={`Pizza cut into ${slices} equal slices, ${shaded.size} shaded`}>
      <circle cx={C} cy={C} r={R + 10} fill="#E8A33D" />
      {Array.from({ length: slices }, (_, i) => {
        const on = shaded.has(i);
        const mid = -Math.PI / 2 + (i + 0.5) / slices * Math.PI * 2;
        const pep = point(mid, R * 0.6);
        return (
          <g key={i}>
            <path
              d={wedgePath(i, slices)}
              fill={on ? '#F5A300' : '#FFE8B0'}
              stroke="#FFFFFF"
              strokeWidth={3}
              strokeLinejoin="round"
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-pressed={interactive ? on : undefined}
              aria-label={interactive ? `Slice ${i + 1}` : undefined}
              onClick={interactive ? () => onToggle?.(i) : undefined}
              onKeyDown={
              interactive ?
              (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggle?.(i);
                }
              } :
              undefined
              }
              className={interactive ? 'cursor-pointer outline-none transition-[fill] duration-150 hover:brightness-95 focus-visible:[stroke:#16181D]' : 'transition-[fill] duration-150'} />
            
            {on && <circle cx={pep.x} cy={pep.y} r={slices > 8 ? 6 : 9} fill="#F2604C" pointerEvents="none" />}
          </g>);

      })}
    </svg>);

}