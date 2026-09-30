'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon, ZapIcon } from 'lucide-react';
import type { Subject } from '@/types/student';
import { subjectStyles } from '@/utils/student/subjects';

interface CompletionScreenProps {
  subject: Subject;
  heading: string;
  message: string;
  score: {correct: number;total: number;};
  xp: number;
  actions: React.ReactNode;
}

export function CompletionScreen({ subject, heading, message, score, xp, actions }: CompletionScreenProps) {
  const s = subjectStyles[subject];
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-5 py-16 text-center sm:py-24">
      <motion.span
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className={`grid h-24 w-24 place-items-center rounded-[28px] ${s.solid} shadow-[0_6px_0_0_rgba(22,24,29,0.2)]`}
        aria-hidden="true">
        
        <TrophyIcon className="h-12 w-12 text-white" />
      </motion.span>
      <h1 className="mt-8 text-4xl font-black tracking-tight text-ink">{heading}</h1>
      <p className="mt-2 text-lg text-ink-soft">{message}</p>

      <dl className="mt-8 grid w-full grid-cols-2 gap-3">
        <div className="rounded-3xl bg-surface p-5">
          <dt className="text-sm font-extrabold text-ink-soft">Correct answers</dt>
          <dd className="mt-1 text-3xl font-black text-ink">
            {score.correct}
            <span className="text-lg text-ink-muted">/{score.total}</span>
          </dd>
        </div>
        <div className="rounded-3xl bg-brand-50 p-5">
          <dt className="inline-flex items-center gap-1 text-sm font-extrabold text-brand-700">
            <ZapIcon className="h-4 w-4 fill-brand-500 text-brand-500" aria-hidden="true" /> XP earned
          </dt>
          <dd className="mt-1 text-3xl font-black text-ink">+{xp}</dd>
        </div>
      </dl>

      <div className="mt-8 flex w-full flex-col gap-3">{actions}</div>
    </main>);

}