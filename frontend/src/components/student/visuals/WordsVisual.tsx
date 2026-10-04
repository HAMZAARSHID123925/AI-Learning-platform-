'use client';
import React from 'react';
import type { SubjectStyle } from '@/utils/subjects';

interface WordsVisualProps {
  tokens: string[];
  highlight?: number[];
  tone: SubjectStyle;
}

export function WordsVisual({ tokens, highlight = [], tone }: WordsVisualProps) {
  return (
    <p className="flex max-w-lg flex-wrap justify-center gap-2">
      {tokens.map((t, i) =>
      <span
        key={`${t}-${i}`}
        className={`rounded-xl px-3 py-2 text-lg font-extrabold ${highlight.includes(i) ? `${tone.solid} text-white` : 'bg-white text-ink shadow-card'}`}>
        
          {t}
        </span>
      )}
    </p>);

}