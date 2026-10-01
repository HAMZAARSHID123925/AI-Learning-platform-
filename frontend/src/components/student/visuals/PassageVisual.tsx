'use client';
import React from 'react';
import type { SubjectStyle } from '@/utils/subjects';

interface PassageVisualProps {
  text: string;
  highlight?: string;
  tone: SubjectStyle;
}

export function PassageVisual({ text, highlight, tone }: PassageVisualProps) {
  const parts = highlight && text.includes(highlight) ? text.split(highlight) : [text];
  return (
    <blockquote className="max-w-lg rounded-3xl bg-white p-6 text-lg leading-relaxed text-ink shadow-card">
      {parts.map((p, i) =>
      <React.Fragment key={i}>
          {p}
          {i < parts.length - 1 && <mark className={`rounded-md px-1 font-extrabold text-ink ${tone.soft}`}>{highlight}</mark>}
        </React.Fragment>
      )}
    </blockquote>);

}