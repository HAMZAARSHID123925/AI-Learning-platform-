'use client';
import React from 'react';
import { FlameIcon, GraduationCapIcon, UserRoundIcon } from 'lucide-react';
import { studentAvatar } from '@/data/student/illustrations';
import type { Grade } from '@/types/student';

interface WelcomeHeaderProps {
  name: string;
  grade: Grade;
  streak: number;
}

export function WelcomeHeader({ name, grade, streak }: WelcomeHeaderProps) {
  const firstName = name.split(' ')[0] || 'Student';
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <img src={studentAvatar} alt="" className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-brand-50" />
      <div>
        <h1 className="text-4xl font-black tracking-tight text-ink sm:text-5xl">Hi, {firstName} 👋</h1>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Your details">
          <li className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-extrabold text-ink">
            <UserRoundIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            {name}
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-extrabold text-ink">
            <GraduationCapIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            Grade {grade}
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full bg-streak-50 px-3 py-1.5 text-sm font-extrabold text-streak-700">
            <FlameIcon className="h-4 w-4 fill-streak-500 text-streak-500" aria-hidden="true" />
            {streak}-day learning streak
          </li>
        </ul>
      </div>
    </header>);

}