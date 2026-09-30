'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TargetIcon } from 'lucide-react';

export function DailyGoalCard({ minutes, goal }: {minutes: number;goal: number;}) {
  const pct = Math.min(1, minutes / goal);
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <section aria-labelledby="goal-title" className="flex items-center gap-5 rounded-[28px] bg-science-50 p-6">
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 72 72" className="h-20 w-20 -rotate-90" aria-hidden="true">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#BDEBD7" strokeWidth="8" />
          <motion.circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="#1FA971"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} />
          
        </svg>
        <TargetIcon className="absolute inset-0 m-auto h-7 w-7 text-science-700" aria-hidden="true" />
      </div>
      <div>
        <h2 id="goal-title" className="text-sm font-extrabold text-science-700">Daily learning goal</h2>
        <p className="mt-0.5 text-2xl font-black text-ink">
          {minutes} <span className="text-base font-bold text-ink-soft">of {goal} min</span>
        </p>
        <p className="mt-1 text-sm text-ink-soft">{goal - minutes > 0 ? `${goal - minutes} more minutes to hit today’s goal` : 'Goal reached — amazing!'}</p>
      </div>
    </section>);

}