'use client';
import React from 'react';
import type { ShapeName } from '@/types/student/learning';

interface ShapesVisualProps {
  items: {shape: ShapeName;label?: string;}[];
  toneHex: string;
  softHex: string;
}

function polygon(n: number, offset = 0): string {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + offset + i / n * Math.PI * 2;
    return `${50 + 40 * Math.cos(a)},${52 + 40 * Math.sin(a)}`;
  }).join(' ');
}

function ShapeSvg({ shape, stroke, fill }: {shape: ShapeName;stroke: string;fill: string;}) {
  const common = { stroke, fill, strokeWidth: 4, strokeLinejoin: 'round' as const };
  switch (shape) {
    case 'triangle':
      return <polygon points={polygon(3)} {...common} />;
    case 'square':
      return <rect x={16} y={16} width={68} height={68} rx={4} {...common} />;
    case 'rectangle':
      return <rect x={6} y={26} width={88} height={52} rx={4} {...common} />;
    case 'pentagon':
      return <polygon points={polygon(5)} {...common} />;
    case 'hexagon':
      return <polygon points={polygon(6)} {...common} />;
    case 'octagon':
      return <polygon points={polygon(8, Math.PI / 8)} {...common} />;
    case 'circle':
      return <circle cx={50} cy={50} r={38} {...common} />;
    case 'rightAngle':
      return (
        <g>
          <path d="M 20 14 L 20 84 L 90 84" stroke={stroke} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x={20} y={66} width={18} height={18} fill={fill} stroke={stroke} strokeWidth={3} />
        </g>);

  }
}

export function ShapesVisual({ items, toneHex, softHex }: ShapesVisualProps) {
  return (
    <ul className="flex flex-wrap items-end justify-center gap-6 sm:gap-8">
      {items.map((item, i) =>
      <li key={`${item.shape}-${i}`} className="flex flex-col items-center gap-2">
          <svg viewBox="0 0 100 100" className={items.length > 2 ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-32 w-32 sm:h-40 sm:w-40'} role="img" aria-label={item.label ? `${item.shape}, ${item.label}` : item.shape}>
            <ShapeSvg shape={item.shape} stroke={toneHex} fill={softHex} />
          </svg>
          {item.label && <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-ink shadow-card">{item.label}</span>}
        </li>
      )}
    </ul>);

}