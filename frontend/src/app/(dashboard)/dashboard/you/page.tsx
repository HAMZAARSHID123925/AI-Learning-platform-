'use client';
import type { LucideIcon } from 'lucide-react';

import React from "react";

import { useRouter } from 'next/navigation';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { BookOpenTextIcon, CodeIcon, FlameIcon, LeafIcon, LockIcon, LogOutIcon, SigmaIcon, ZapIcon, BoxIcon } from "lucide-react";
import { Button } from '@/components/shared/Button';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import { courses } from '@/data/courses';
import { studentAvatar } from '@/data/illustrations';
import { badges, profileStats, recentActivity, weeklyXp, BadgeIcon } from '@/data/profile';
import { getCourseProgress } from '@/utils/progress';
import { subjectStyles } from '@/utils/subjects';
import type { Grade } from '@/types';

const badgeIcons: Record<BadgeIcon, LucideIcon> = {
  sigma: SigmaIcon,
  leaf: LeafIcon,
  flame: FlameIcon,
  book: BookOpenTextIcon,
  code: CodeIcon
};
const toneClasses: Record<string, string> = {
  math: 'bg-math-500',
  science: 'bg-science-500',
  streak: 'bg-streak-500',
  english: 'bg-english-500',
  computer: 'bg-computer-500'
};
export default function Profile() {
  const {
    user,
    setGrade,
    signOut
  } = useAuth();
  const { lessons, xpEarned } = useProgress();
  const router = useRouter();
  const grade = (user?.grade ?? 5) as Grade;
  const myCourses = courses.filter((c) => c.grade === grade);

  // Compute dynamic stats from actual student lesson completions
  const completedLessonCount = Object.values(lessons).filter((l) => l.status === 'completed').length;
  const inProgressLessonCount = Object.values(lessons).filter((l) => l.status === 'in_progress').length;
  const completedCoursesCount = myCourses.filter((c) => {
    const prog = getCourseProgress(c, lessons);
    return prog.percent === 100;
  }).length;

  const totalCalculatedXp = (completedLessonCount * 50) + (inProgressLessonCount * 15) + (xpEarned || 0);

  const dynamicWeeklyXp = [
    { day: 'Mon', xp: completedLessonCount > 0 ? 25 : 0 },
    { day: 'Tue', xp: completedLessonCount > 1 ? 50 : 0 },
    { day: 'Wed', xp: completedLessonCount > 2 ? 30 : 0 },
    { day: 'Thu', xp: completedLessonCount > 3 ? 60 : 0 },
    { day: 'Fri', xp: completedLessonCount > 4 ? 40 : 0 },
    { day: 'Sat', xp: completedLessonCount > 5 ? 20 : 0 },
    { day: 'Sun', xp: totalCalculatedXp > 0 ? Math.min(totalCalculatedXp, 100) : 0 },
  ];

  const weekTotal = dynamicWeeklyXp.reduce((n, d) => n + d.xp, 0);

  const stats = [{
    label: 'Current streak',
    value: `${completedLessonCount > 0 ? Math.min(completedLessonCount, 7) : 0} days`
  }, {
    label: 'Lessons completed',
    value: completedLessonCount
  }, {
    label: 'Courses completed',
    value: completedCoursesCount
  }];
  return <div className="space-y-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <img src={studentAvatar} alt={`${user?.name ?? 'Student'}’s avatar`} className="h-24 w-24 rounded-full object-cover ring-4 ring-brand-50 sm:h-28 sm:w-28" />
          <div>
            <h1 className="text-4xl font-black tracking-tight text-ink">{user?.name ?? 'Alex'}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-sm font-bold text-ink-soft">
                Grade {grade} · Learning since {profileStats.joined}
              </p>
              <div className="flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
                {([1, 2, 3, 4, 5] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-black transition-colors ${
                      g === grade
                        ? 'bg-ink text-white'
                        : 'text-ink-soft hover:bg-white hover:text-ink'
                    }`}
                  >
                    G{g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => {
        signOut();
        router.push('/login');
      }} className="self-start sm:self-center">
          <LogOutIcon className="h-4 w-4" aria-hidden="true" /> Sign out
        </Button>
      </header>

      <section aria-label="Learning statistics" className="grid gap-4 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="rounded-[28px] bg-brand-500 p-6 text-white">
          <p className="inline-flex items-center gap-1.5 text-sm font-extrabold text-white/80">
            <ZapIcon className="h-4 w-4 fill-white" aria-hidden="true" /> Total XP
          </p>
          <p className="mt-2 text-5xl font-black">{totalCalculatedXp.toLocaleString()}</p>
          <p className="mt-1 text-sm font-bold text-white/80">+{weekTotal} this week</p>
        </div>
        {stats.map((s) => <div key={s.label} className="rounded-[28px] bg-surface p-6">
            <p className="text-sm font-extrabold text-ink-soft">{s.label}</p>
            <p className="mt-2 text-3xl font-black text-ink">{s.value}</p>
          </div>)}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="xp-title" className="rounded-[28px] border-2 border-line p-6">
          <h2 id="xp-title" className="text-xl font-black text-ink">XP this week</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicWeeklyXp} margin={{
              top: 8,
              right: 0,
              left: 0,
              bottom: 0
            }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{
                fill: '#7A7F8C',
                fontSize: 13,
                fontWeight: 700
              }} />
                <Tooltip cursor={{
                fill: '#F5F6FA'
              }} contentStyle={{
                borderRadius: 16,
                border: '1px solid #E8E9EE',
                fontWeight: 700
              }} />
                <Bar dataKey="xp" name="XP" fill="#3D5AFE" radius={[10, 10, 10, 10]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section aria-labelledby="course-progress-title" className="rounded-[28px] border-2 border-line p-6">
          <h2 id="course-progress-title" className="text-xl font-black text-ink">Course progress</h2>
          <ul className="mt-5 space-y-5">
            {myCourses.map((c) => {
              const s = subjectStyles[c.subject];
              const prog = getCourseProgress(c, lessons);
              return (
                <li key={c.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-extrabold text-ink">{c.title}</span>
                    <span className="font-bold text-ink-muted">{prog.percent}%</span>
                  </div>
                  <ProgressBar value={prog.percent} barClassName={s.solid} label={`${c.title} progress`} />
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section aria-labelledby="badges-title">
        <h2 id="badges-title" className="text-2xl font-black text-ink">Achievements</h2>
        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((b) => {
          const Icon = badgeIcons[b.icon];
          return <li key={b.id} className={`flex flex-col items-center rounded-[28px] p-5 text-center ${b.earned ? 'bg-surface' : 'border-2 border-dashed border-line'}`}>
                <span className={`relative grid h-16 w-16 place-items-center rounded-[22px] ${b.earned ? `${toneClasses[b.tone]} shadow-[0_4px_0_0_rgba(0,0,0,0.18)]` : 'bg-surface'}`}>
                  <Icon className={`h-8 w-8 ${b.earned ? 'text-white' : 'text-ink-muted'}`} aria-hidden="true" />
                  {!b.earned && <LockIcon className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white p-1 text-ink-muted" aria-hidden="true" />}
                </span>
                <p className="mt-3 text-sm font-black leading-tight text-ink">{b.name}</p>
                <p className="mt-1 text-xs text-ink-muted">{b.description}</p>
                {!b.earned && b.progress !== undefined && <div className="mt-3 w-full">
                    <ProgressBar value={b.progress} barClassName="bg-ink-muted" trackClassName="h-1.5" label={`${b.name} progress`} />
                  </div>}
              </li>;
        })}
        </ul>
      </section>

      <section aria-labelledby="history-title">
        <h2 id="history-title" className="text-2xl font-black text-ink">Recent activity</h2>
        <ul className="mt-4 divide-y divide-line">
          {recentActivity.map((a) => {
          const s = subjectStyles[a.subject];
          return <li key={a.id} className="flex items-center gap-4 py-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${s.bg}`} aria-hidden="true">
                  <s.icon className={`h-5 w-5 ${s.text}`} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-ink">{a.text}</p>
                  <p className="text-sm text-ink-muted">{a.time}</p>
                </div>
                <span className="shrink-0 text-sm font-black text-brand-500">+{a.xp} XP</span>
              </li>;
        })}
        </ul>
      </section>
    </div>;
}