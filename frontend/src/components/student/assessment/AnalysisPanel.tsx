'use client';
import React from 'react';
import { CheckCircle2Icon, SparklesIcon, TrendingUpIcon } from 'lucide-react';
import type { LearningAnalysis, SkillResult } from '@/types/student/learning';

function SkillList({ items, empty }: {items: SkillResult[];empty: string;}) {
  if (!items.length) return <p className="text-sm font-bold text-ink-muted">{empty}</p>;
  return (
    <ul className="space-y-2">
      {items.map((s) =>
      <li key={s.skill} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
          <span className="font-extrabold text-ink">{s.skill}</span>
          <span className="shrink-0 text-sm font-black text-ink-soft">{s.correct}/{s.total}</span>
        </li>
      )}
    </ul>);

}

export function AnalysisPanel({ analysis }: {analysis: LearningAnalysis;}) {
  const improve = [...analysis.needsWork, ...analysis.developing];
  return (
    <section aria-labelledby="analysis-title" className="rounded-[28px] bg-brand-50 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-500 shadow-[0_4px_0_0_#2438B0]" aria-hidden="true">
          <SparklesIcon className="h-6 w-6 text-white" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-brand-700">Elo · AI Learning Analysis</p>
          <h2 id="analysis-title" className="mt-0.5 text-2xl font-black text-ink">Here’s what your answers tell us</h2>
        </div>
      </div>
      <p className="mt-5 text-lg leading-relaxed text-ink">{analysis.summary}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <h3 className="mb-3 inline-flex items-center gap-1.5 text-sm font-black text-science-700">
            <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" /> Strong
          </h3>
          <SkillList items={analysis.strong} empty="Keep practicing — strengths will show up here." />
        </div>
        <div>
          <h3 className="mb-3 inline-flex items-center gap-1.5 text-sm font-black text-danger-700">
            <TrendingUpIcon className="h-4 w-4" aria-hidden="true" /> Needs improvement
          </h3>
          <SkillList items={improve} empty="Nothing! Every skill is strong." />
        </div>
      </div>
    </section>);

}