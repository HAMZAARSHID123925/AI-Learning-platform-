'use client';
import React from 'react';
import { CheckIcon, XIcon } from 'lucide-react';

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed';

interface OptionButtonProps {
  index: number;
  label: string;
  state: OptionState;
  disabled?: boolean;
  onSelect: () => void;
}

const stateClasses: Record<OptionState, string> = {
  idle: 'border-line bg-white text-ink shadow-[0_3px_0_0_#E8E9EE] hover:border-ink/30',
  selected: 'border-ink bg-surface text-ink shadow-[0_3px_0_0_#16181D]',
  correct: 'border-science-500 bg-science-50 text-science-700 shadow-[0_3px_0_0_#1FA971]',
  wrong: 'border-danger-500 bg-danger-50 text-danger-700 shadow-[0_3px_0_0_#E5484D]',
  dimmed: 'border-line bg-white text-ink-muted shadow-none opacity-60'
};

const badgeClasses: Record<OptionState, string> = {
  idle: 'bg-surface text-ink-soft',
  selected: 'bg-ink text-white',
  correct: 'bg-science-500 text-white',
  wrong: 'bg-danger-500 text-white',
  dimmed: 'bg-surface text-ink-muted'
};

export function OptionButton({ index, label, state, disabled, onSelect }: OptionButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={state === 'selected' || state === 'correct' || state === 'wrong'}
      disabled={disabled}
      onClick={onSelect}
      className={`flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left text-lg font-extrabold transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out active:translate-y-[3px] active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 disabled:active:translate-y-0 ${stateClasses[state]}`}>
      
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-black ${badgeClasses[state]}`} aria-hidden="true">
        {state === 'correct' ? <CheckIcon className="h-4 w-4" strokeWidth={3} /> : state === 'wrong' ? <XIcon className="h-4 w-4" strokeWidth={3} /> : String.fromCharCode(65 + index)}
      </span>
      <span className="min-w-0 flex-1">{label}</span>
    </button>);

}