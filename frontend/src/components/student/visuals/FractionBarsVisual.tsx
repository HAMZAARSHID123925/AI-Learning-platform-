'use client';
import React from 'react';
import type { SubjectStyle } from '@/utils/subjects';

interface FractionBarsVisualProps {
  bars: {num: number;den: number;}[];
  tone: SubjectStyle;
}

export function FractionBarsVisual({ bars, tone }: FractionBarsVisualProps) {
  return (
    <div className="w-full max-w-md space-y-3" role="img" aria-label={`Fraction bars: ${bars.map((b) => `${b.num}/${b.den}`).join(', ')}`}>
      {bars.map((b, row) =>
      <div key={row} className="flex items-center gap-4">
          <span className="w-12 shrink-0 text-right text-xl font-black text-ink">
            {b.num}/{b.den}
          </span>
          <div className="flex h-11 flex-1 gap-1 rounded-xl bg-white p-1 shadow-card">
            {Array.from({ length: b.den }, (_, i) =>
          <span key={i} className={`flex-1 rounded-lg ${i < b.num ? tone.solid : tone.soft}`} />
          )}
          </div>
        </div>
      )}
    </div>);

}