'use client';
import React from 'react';
import type { SubjectStyle } from '@/utils/student/subjects';

interface DecimalGridVisualProps {
  shaded: number;
  tone: SubjectStyle;
}

export function DecimalGridVisual({ shaded, tone }: DecimalGridVisualProps) {
  return (
    <div
      role="img"
      aria-label={`Hundred grid with ${shaded} of 100 squares shaded`}
      className="grid w-56 grid-cols-10 gap-[3px] rounded-2xl bg-white p-2 shadow-card sm:w-64">
      
      {Array.from({ length: 100 }, (_, i) => {
        const row = Math.floor(i / 10);
        const col = i % 10;
        const filled = col * 10 + row < shaded;
        return <span key={i} className={`aspect-square rounded-[3px] transition-colors duration-100 ${filled ? tone.solid : 'bg-surface'}`} />;
      })}
    </div>);

}