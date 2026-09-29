import React from 'react';
import { CalendarDays, Check, Flame } from 'lucide-react';
import { Course } from '../../types/learning';

interface LearningOverviewProps {
  completedCourses: Course[];
  inProgressCount: number;
  skillsPracticed: number;
  streakDays: number;
  mostActiveDay: string;
}

export function LearningOverview({ completedCourses, inProgressCount, skillsPracticed, streakDays, mostActiveDay }: LearningOverviewProps) {
  const stats = [
  { label: 'In progress', value: String(inProgressCount), icon: null },
  { label: 'Skills practiced', value: String(skillsPracticed), icon: null },
  { label: 'Day streak', value: String(streakDays), icon: <Flame className="h-5 w-5 text-streak" aria-hidden="true" /> },
  { label: 'Most active', value: mostActiveDay.slice(0, 3), icon: <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" /> }];


  return (
    <section aria-labelledby="overview-title" className="rounded-3xl border border-line bg-white p-6 shadow-card md:p-8">
      <h2 id="overview-title" className="text-lg font-semibold">Your progress</h2>
      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className="text-7xl font-semibold leading-none tracking-tight tabular-nums">{completedCourses.length}</p>
          <p className="mt-2 text-lg text-muted">Courses completed</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {completedCourses.map((c) =>
            <li key={c.id} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-success-soft px-3 text-sm font-medium text-success">
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                {c.title}
              </li>
            )}
          </ul>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:col-span-7">
          {stats.map((s) =>
          <div key={s.label} className="bg-white p-5">
              <dt className="text-sm text-muted">{s.label}</dt>
              <dd className="mt-1 flex items-center gap-2 text-3xl font-semibold tabular-nums">
                {s.icon}
                {s.value}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>);

}