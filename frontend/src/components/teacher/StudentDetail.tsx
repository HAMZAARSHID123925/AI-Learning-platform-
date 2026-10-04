'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangleIcon } from 'lucide-react';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { initials, performanceLabel } from '@/utils/subjects';
import type { StudentRecord } from '@/types';

export function StudentDetail({ student }: {student: StudentRecord;}) {
  const perf = performanceLabel(student.avgScore);
  return (
    <motion.div
      key={student.id}
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-[28px] border-2 border-line bg-white p-6">
      
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-lg font-black text-brand-700">{initials(student.name)}</span>
        <div>
          <h3 className="text-xl font-black text-ink">{student.name}</h3>
          <p className="text-sm text-ink-muted">Grade {student.grade} · Active {student.lastActive}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-surface p-4">
          <p className="text-xs font-extrabold text-ink-muted">Progress</p>
          <p className="text-2xl font-black text-ink">{student.progress}%</p>
          <div className="mt-2"><ProgressBar value={student.progress} label="Course progress" /></div>
        </div>
        <div className="rounded-2xl bg-surface p-4">
          <p className="text-xs font-extrabold text-ink-muted">Avg score</p>
          <p className="text-2xl font-black text-ink">{student.avgScore}%</p>
          <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold ${perf.className}`}>{perf.label}</span>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-black text-ink">Weak areas</h4>
        <ul className="mt-2 flex flex-wrap gap-2">
          {student.weakAreas.map((w) =>
          <li key={w} className="inline-flex items-center gap-1.5 rounded-full bg-math-50 px-3 py-1.5 text-sm font-bold text-math-700">
              <AlertTriangleIcon className="h-3.5 w-3.5" aria-hidden="true" /> {w}
            </li>
          )}
        </ul>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-black text-ink">Assessment results</h4>
        {student.assessments.length === 0 ?
        <p className="mt-2 text-sm text-ink-muted">No assessments taken yet.</p> :

        <ul className="mt-3 space-y-4">
            {student.assessments.map((a) => {
            const pct = Math.round(a.score / a.total * 100);
            return (
              <li key={a.title}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-bold text-ink">{a.title}</span>
                    <span className="shrink-0 font-black text-ink">{a.score}/{a.total}</span>
                  </div>
                  <ProgressBar value={pct} barClassName={pct >= 85 ? 'bg-science-500' : pct >= 70 ? 'bg-brand-500' : 'bg-danger-500'} label={`${a.title} score`} />
                </li>);

          })}
          </ul>
        }
      </div>
    </motion.div>);

}