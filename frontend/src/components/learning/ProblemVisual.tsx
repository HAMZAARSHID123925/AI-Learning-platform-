import React from "react";
import { BookOpenText, Droplets, Keyboard, Leaf, Monitor, Mouse, PawPrint, Sprout, Sun, LucideIcon } from "lucide-react";
import { IconKey, ProblemVisualData, ShapeKind } from "../../types/learning";
const FILL = '#2D5BE3';
const EMPTY = '#FFFFFF';
const STROKE = '#2B303B';
const iconMap: Record<IconKey, LucideIcon> = {
  sun: Sun,
  droplets: Droplets,
  leaf: Leaf,
  sprout: Sprout,
  paw: PawPrint,
  keyboard: Keyboard,
  mouse: Mouse,
  monitor: Monitor,
  book: BookOpenText
};
function wedgePath(i: number, n: number, r = 56, c = 64): string {
  const a0 = i / n * Math.PI * 2 - Math.PI / 2;
  const a1 = (i + 1) / n * Math.PI * 2 - Math.PI / 2;
  const x0 = c + r * Math.cos(a0);
  const y0 = c + r * Math.sin(a0);
  const x1 = c + r * Math.cos(a1);
  const y1 = c + r * Math.sin(a1);
  const large = 1 / n > 0.5 ? 1 : 0;
  return `M${c} ${c} L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}
function renderShape(kind: ShapeKind, key: number) {
  return <svg key={key} width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
      {kind === 'circle' && <circle cx="24" cy="24" r="17" fill={FILL} />}
      {kind === 'square' && <rect x="8" y="8" width="32" height="32" rx="5" fill="#D96A1E" />}
      {kind === 'triangle' && <path d="M24 7 L41 39 H7 Z" fill="#1F9D6B" />}
    </svg>;
}
export function ProblemVisual({
  visual


}: {visual: ProblemVisualData;}) {
  switch (visual.type) {
    case 'pie':
      return <svg width="168" height="168" viewBox="0 0 128 128" role="img" aria-label={`Circle with ${visual.filled} of ${visual.parts} parts shaded`}>
          {Array.from({
          length: visual.parts
        }).map((_, i) => <path key={i} d={wedgePath(i, visual.parts)} fill={i < visual.filled ? FILL : EMPTY} stroke={STROKE} strokeWidth="2" strokeLinejoin="round" />)}
        </svg>;
    case 'bar':
      {
        const w = 232 / visual.parts;
        return <svg width="240" height="64" viewBox="0 0 240 64" className="max-w-full" role="img" aria-label={`Bar with ${visual.filled} of ${visual.parts} parts shaded`}>
          {Array.from({
            length: visual.parts
          }).map((_, i) => <rect key={i} x={4 + i * w} y="6" width={w} height="52" fill={i < visual.filled ? FILL : EMPTY} stroke={STROKE} strokeWidth="2" />)}
        </svg>;
      }
    case 'dots':
      {
        const gap = 30;
        return <svg width={visual.cols * gap + 8} height={visual.rows * gap + 8} role="img" aria-label={`${visual.rows} rows of ${visual.cols} dots`}>
          {Array.from({
            length: visual.rows * visual.cols
          }).map((_, i) => <circle key={i} cx={4 + gap / 2 + i % visual.cols * gap} cy={4 + gap / 2 + Math.floor(i / visual.cols) * gap} r="10" fill={FILL} />)}
        </svg>;
      }
    case 'pattern':
      return <div className="flex flex-wrap items-center justify-center gap-2" role="img" aria-label={`Pattern: ${visual.items.join(', ')}, then a missing shape`}>
          {visual.items.map((kind, i) => renderShape(kind, i))}
          <span className="grid h-12 w-12 place-items-center rounded-lg border-2 border-dashed border-subtle text-lg font-semibold text-muted">?</span>
        </div>;
    case 'word':
      return <p className="max-w-md px-4 text-center text-2xl font-semibold leading-snug md:text-3xl">{visual.text}</p>;
    case 'icon':
      {
        const Icon = iconMap[visual.icon];
        return <span className="grid h-28 w-28 place-items-center rounded-full bg-primary-soft text-primary">
          <Icon className="h-14 w-14" strokeWidth={1.75} aria-hidden="true" />
        </span>;
      }
    default:
      return null;
  }
}