import React, { useId, useRef } from 'react';
import { motion } from 'framer-motion';
import { Grade } from '../types/learning';
import { easeOutStrong } from '../utils/motion';

interface GradeSelectorProps {
  value: Grade;
  onChange: (grade: Grade) => void;
  compact?: boolean;
}

const grades: Grade[] = [1, 2, 3, 4, 5];

export function GradeSelector({ value, onChange, compact = false }: GradeSelectorProps) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = (index + dir + grades.length) % grades.length;
    onChange(grades[next]);
    refs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-2 max-w-full">
      <span id={`${id}-label`} className="text-sm font-medium text-muted">
        {compact ? 'Grade' : 'Choose your grade'}
      </span>
      <div className="max-w-full overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
        <div
          role="radiogroup"
          aria-labelledby={`${id}-label`}
          className="inline-flex w-fit rounded-2xl border border-line bg-white p-1 shadow-card"
        >
        
        {grades.map((g, i) => {
          const active = g === value;
          return (
            <button
              key={g}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`Grade ${g}`}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(g)}
              onKeyDown={(e) => handleKey(e, i)}
              className={`relative h-11 min-w-[2.75rem] rounded-xl px-3 text-[15px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              compact ? '' : 'sm:px-4'} ${
              active ? 'text-white' : 'text-muted hover:text-ink'}`}>
              
              {active &&
              <motion.span
                layoutId={`${id}-pill`}
                className="absolute inset-0 rounded-xl bg-primary"
                transition={{ duration: 0.25, ease: easeOutStrong }} />

              }
              <span className="relative whitespace-nowrap">
                {compact ?
                g :

                <>
                    <span className="hidden sm:inline">Grade </span>
                    {g}
                  </>
                }
              </span>
            </button>);

          })}
        </div>
      </div>
    </div>
  );
}