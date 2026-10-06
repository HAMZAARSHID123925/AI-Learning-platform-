'use client';
import type { BackendDashboard } from '@/types/backend';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';
import { AiAssistant } from '@/components/student/AiAssistant';
import { DailyGoalCard } from '@/components/student/DailyGoalCard';
import { WarmupCard } from '@/components/student/WarmupCard';
import { ContinueCard } from '@/components/student/ContinueCard';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import { StateMessage } from '@/components/student/StateMessage';
import { useAsync } from '@/hooks/useAsync';
import { subjectImages } from '@/data/illustrations';
import { profileStats } from '@/data/profile';
import { getCourseProgress } from '@/utils/progress';
import { learningApi } from '@/utils/learningApi';
import { subjectStyles } from '@/utils/subjects';
import type { Grade } from '@/types';

export default function Home() {
  const { user } = useAuth();
  const { lessons } = useProgress();
  const [backendDashboard, setBackendDashboard] = React.useState<BackendDashboard | null>(null);
  const grade = (user?.grade ?? 5) as Grade;
  const name = user?.name ?? 'Learner';
  const courseQuery = useAsync(() => learningApi.listCourses(grade), [grade, user?.id]);
  React.useEffect(() => {
    if (!user) return;
    let active = true;
    learningApi.getStudentDashboard().then(data => { if (active) setBackendDashboard(data); }).catch(() => {});
    return () => { active = false; };
  }, [user?.id]);
  const activeCourses = courseQuery.data || [];
  const current = activeCourses[0];
  const currentProgress = current ? getCourseProgress(current, lessons) : null;
  const others = activeCourses.slice(1);


  const getCourseHref = (courseId: string) => {
    return `/dashboard/courses/${courseId}`;
  };

  const completedCount = Object.values(lessons).filter((l) => l.status === 'completed').length;
  // Dynamic streak and minutes today based on student activity
  const streak = backendDashboard?.streak_days ?? (completedCount > 0 ? Math.min(completedCount, 7) : 0);
  const minutesToday = completedCount * 8; // approx 8 min per completed lesson

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-ink sm:text-5xl">Hi, {name} 👋</h1>
        <p className="mt-2 text-lg text-ink-soft">
          Grade {grade} · You’re on a <span className="font-extrabold text-streak-700">{streak}-day streak</span>. Keep it going!
        </p>
      </header>

      {courseQuery.loading && <StateMessage kind="loading" title="Loading your courses…" />}
      {courseQuery.error && <StateMessage kind="error" message={courseQuery.error.message} onRetry={courseQuery.reload} />}
      {courseQuery.data?.length === 0 && <StateMessage kind="empty" title="No published courses for your grade yet" />}
      <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
        {current && currentProgress && (
          <ContinueCard course={current} progress={currentProgress} />
        )}
        <div className="flex flex-col gap-5">
          <DailyGoalCard minutes={minutesToday} goal={profileStats.dailyGoalMinutes} />
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
            const subj = (c.subject || 'math') as import('@/types/learning').Subject;
            const s = subjectStyles[subj] || subjectStyles.math;
            const prog = getCourseProgress(c, lessons);
            return (
              <li key={c.id} className="w-64 shrink-0 snap-start sm:w-auto">
                <Link
                  href={getCourseHref(c.id)}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border-2 border-line bg-white transition-[transform,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-ink/20 cursor-pointer"
                >
                  <img src={c.image || subjectImages[subj] || subjectImages.math} alt="" className={`h-32 w-full object-cover ${s.bg}`} />
                  <div className="flex flex-1 flex-col p-4">
                    <span className={`text-xs font-extrabold ${s.text}`}>{s.label}</span>
                    <span className="mt-0.5 text-lg font-black text-ink">{c.title}</span>
                    <div className="mt-auto flex items-center gap-3 pt-4">
                      <ProgressBar value={prog.percent} barClassName={s.solid} label={`${c.title} progress`} />

                      <span className="text-xs font-extrabold text-ink-soft">{prog.percent}%</span>
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