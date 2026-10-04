'use client';
import React from 'react';

interface QuestionNavProps {
  total: number;
  current: number;
  answers: (number | null)[];
  onJump: (i: number) => void;
}

export function QuestionNav({ total, current, answers, onJump }: QuestionNavProps) {
  return (
    <nav aria-label="Questions" className="flex flex-wrap gap-2">
      {Array.from({ length: total }, (_, i) => {
        const answered = answers[i] !== null;
        const active = i === current;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onJump(i)}
            aria-current={active ? 'step' : undefined}
            aria-label={`Question ${i + 1}${answered ? ', answered' : ''}`}
            className={`grid h-9 w-9 place-items-center rounded-xl text-sm font-black transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 ${
            active ?
            'bg-ink text-white' :
            answered ?
            'bg-brand-50 text-brand-700 hover:bg-brand-100' :
            'bg-surface text-ink-muted hover:text-ink'}`
            }>
            
            {i + 1}
          </button>);

      })}
    </nav>);

}