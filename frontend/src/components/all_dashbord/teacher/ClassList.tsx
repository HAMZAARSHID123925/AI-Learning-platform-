'use client';

import React from 'react';
import { format } from 'date-fns';
import { ClockIcon } from 'lucide-react';
import { courseName, subjectStyles } from '@/utils/all_dashbord/subjects';
import { dateFromOffset, relativeDayLabel } from '@/utils/all_dashbord/dates';
import type { LiveClass } from '@/types/all_dashbord/index';

export function ClassList({ classes, emptyText }: {classes: LiveClass[];emptyText: string;}) {
  if (classes.length === 0) {
    return <p className="rounded-3xl bg-surface p-6 text-center text-sm font-bold text-ink-soft">{emptyText}</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {classes.map((c) => {
        const s = subjectStyles[c.subject];
        return (
          <li key={c.id} className="flex items-center gap-4 py-4">
            <div className="w-14 shrink-0 text-center">
              <p className="text-xs font-extrabold text-ink-muted">{format(dateFromOffset(c.dayOffset), 'MMM')}</p>
              <p className="text-2xl font-black leading-none text-ink">{format(dateFromOffset(c.dayOffset), 'd')}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-black text-ink">{c.title}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-ink-soft">
                <span className="inline-flex items-center gap-1 font-bold text-ink">
                  <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {relativeDayLabel(c.dayOffset)}, {c.time}
                </span>
                <span className={`font-bold ${s.text}`}>{courseName(c.grade, c.subject)}</span>
              </p>
            </div>
            {c.isLive &&
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-danger-500 px-2.5 py-1 text-xs font-extrabold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live
              </span>
            }
          </li>);

      })}
    </ul>);

}