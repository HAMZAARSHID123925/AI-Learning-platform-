'use client';
import React from 'react';
import { OptionButton, type OptionState } from './OptionButton';
import { Visual, VisualStage } from '../visuals/Visual';
import type { Subject } from '@/types/student';
import type { QuestionStep } from '@/types/student/learning';

interface QuestionStepViewProps {
  step: QuestionStep;
  subject: Subject;
  selected: number | null;
  /** When true, reveal correct / wrong states. */
  revealed: boolean;
  onSelect: (i: number) => void;
  eyebrow?: React.ReactNode;
}

export function QuestionStepView({ step, subject, selected, revealed, onSelect, eyebrow }: QuestionStepViewProps) {
  const stateFor = (i: number): OptionState => {
    if (revealed) {
      if (i === step.answer) return 'correct';
      if (i === selected) return 'wrong';
      return 'dimmed';
    }
    return i === selected ? 'selected' : 'idle';
  };
  const compact = step.options.every((o) => o.length <= 14);

  return (
    <div className="space-y-6">
      {eyebrow}
      <h1 className="text-2xl font-black leading-snug tracking-tight text-ink sm:text-[28px]">{step.prompt}</h1>
      {step.visual &&
      <VisualStage subject={subject}>
          <Visual visual={step.visual} subject={subject} />
        </VisualStage>
      }
      <div role="radiogroup" aria-label="Answer options" className={`grid gap-3 ${compact ? 'sm:grid-cols-2' : ''}`}>
        {step.options.map((opt, i) =>
        <OptionButton key={`${opt}-${i}`} index={i} label={opt} state={stateFor(i)} disabled={revealed} onSelect={() => onSelect(i)} />
        )}
      </div>
    </div>);

}