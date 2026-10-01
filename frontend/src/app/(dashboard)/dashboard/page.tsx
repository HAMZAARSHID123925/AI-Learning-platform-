'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';
import { AiAssistant } from '@/components/home/AiAssistant';
import { ContinueCard } from '@/components/home/ContinueCard';
import { DailyGoalCard } from '@/components/home/DailyGoalCard';
import { WarmupCard } from '@/components/home/WarmupCard';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { useAuth } from '@/contexts/AuthContext';
import { courses } from '@/data/courses';
import { subjectImages } from '@/data/illustrations';
import { profileStats } from '@/data/profile';
import { subjectStyles } from '@/utils/subjects';
import type { Grade } from '@/types';

export default function Home() {
  const { user } = useAuth();
  const grade = (user?.grade ?? 5) as Grade;
  const name = user?.name ?? 'Alex';
  const myCourses = courses.filter((c) => c.grade === grade);
  const current = myCourses.find((c) => c.subject === 'math') ?? myCourses[0];
  const others = myCourses.filter((c) => c.id !== current.id);

  const getCourseHref = (courseId: string) => {
    // Map grade 5 course ids to their respective learning paths
    const map: Record<string, string> = {
      'g5-math': '/dashboard/courses/g5-fractions',
      'g5-science': '/dashboard/courses/g5-plants-animals',
      'g5-english': '/dashboard/courses/g5-reading',
      'g5-computer': '/dashboard/courses/g5-digital-basics'
    };
    return map[courseId] || `/dashboard/courses/${courseId}`;
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-ink sm:text-5xl">Hi, {name} 👋</h1>
        <p className="mt-2 text-lg text-ink-soft">
          Grade {grade} · You’re on a <span className="font-extrabold text-streak-700">{profileStats.streak}-day streak</span>. Keep it going!
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
        <ContinueCard course={current} />
        <div className="flex flex-col gap-5">
          <DailyGoalCard minutes={profileStats.minutesToday} goal={profileStats.dailyGoalMinutes} />
          <WarmupCard grade={grade} />
        </div>
      </div>

      <AiAssistant name={name} grade={grade} />

      <section aria-labelledby="more-title">
        <div className="mb-4 flex items-end justify-between">
          <h2 id="more-title" className="text-2xl font-black text-ink">More in Grade {grade}</h2>
          <Link href="/dashboard/courses" className="inline-flex items-center gap-0.5 text-sm font-extrabold text-brand-500 hover:text-brand-700">
            All courses <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
          {others.map((c) => {
            const s = subjectStyles[c.subject];
            const pct = Math.round((c.completedLessons / c.lessons) * 100);
            return (
              <li key={c.id} className="w-64 shrink-0 snap-start sm:w-auto">
                <Link
                  href={getCourseHref(c.id)}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border-2 border-line bg-white transition-[transform,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-ink/20 cursor-pointer"
                >
                  <img src={subjectImages[c.subject]} alt="" className={`h-32 w-full object-cover ${s.bg}`} />
                  <div className="flex flex-1 flex-col p-4">
                    <span className={`text-xs font-extrabold ${s.text}`}>{s.label}</span>
                    <span className="mt-0.5 text-lg font-black text-ink">{c.title}</span>
                    <div className="mt-auto flex items-center gap-3 pt-4">
                      <ProgressBar value={pct} barClassName={s.solid} label={`${c.title} progress`} />
                      <span className="text-xs font-extrabold text-ink-soft">{pct}%</span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}