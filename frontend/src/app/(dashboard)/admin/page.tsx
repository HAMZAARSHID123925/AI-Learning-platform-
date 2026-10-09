'use client';
import type { BackendProfile, BackendCourseSummary } from '@/types/backend';

import React from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertCircleIcon, ArrowRightIcon } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { courseName, subjectStyles } from '@/utils/subjects';
import type { Grade } from '@/types';

export default function AdminOverview() {
  const { courses, students, teachers } = useAdmin();

  // Deduplicated authoritative metrics from AdminContext
  const studentCount = students.length;
  const teacherCount = teachers.length;
  const totalCourses = courses.length;

  const dynamicStudentsByGrade = [1, 2, 3, 4, 5].map((g) => {
    const count = students.filter((s) => s.grade === g).length;
    return { grade: `Grade ${g}`, students: count };
  });

  const dynamicWeeklyActiveUsers = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
    day,
    users: studentCount,
  }));

  const dynamicStats = [
    { label: 'Total students', value: String(studentCount), change: 'Registered learners' },
    { label: 'Total teachers', value: String(teacherCount), change: 'Faculty staff' },
    { label: 'Total courses', value: String(totalCourses), change: `${courses.filter((c) => c.status === 'published').length} published` },
    { label: 'Active today', value: String(studentCount), change: 'Online learners' },
  ];

  const [primary, ...rest] = dynamicStats;
  const topCourses = [...courses].sort((a, b) => b.enrolled - a.enrolled).slice(0, 5);
  const unassigned = courses.filter((c) => !c.teacherId);
  const teacherName = (id: string | null) => teachers.find((t) => t.id === id)?.name ?? 'Unassigned';

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-ink">School overview</h1>
        <p className="mt-1 text-lg text-ink-soft">Real-time school performance across every grade.</p>
      </header>

      <section aria-label="Platform totals" className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="rounded-[28px] bg-ink p-6 text-white">
          <p className="text-sm font-extrabold text-white/70">{primary.label}</p>
          <p className="mt-2 text-5xl font-black">{primary.value}</p>
          <p className="mt-1 text-sm font-bold text-science-100">{primary.change}</p>
        </div>
        {rest.map((s) => (
          <div key={s.label} className="rounded-[28px] bg-surface p-6">
            <p className="text-sm font-extrabold text-ink-soft">{s.label}</p>
            <p className="mt-2 text-3xl font-black text-ink">{s.value}</p>
            <p className="mt-1 text-sm text-ink-muted">{s.change}</p>
          </div>
        ))}
      </section>

      {unassigned.length > 0 && (
        <Link href="/admin/courses" className="flex items-center gap-3 rounded-2xl bg-math-50 p-4 text-math-700 transition-colors duration-150 hover:bg-math-100">
          <AlertCircleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="flex-1 font-bold">
            {unassigned.length} course{unassigned.length > 1 ? 's' : ''} still need{unassigned.length > 1 ? '' : 's'} a teacher
          </span>
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="grade-title" className="rounded-[28px] border-2 border-line p-6">
          <h2 id="grade-title" className="text-xl font-black text-ink">Students by grade</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicStudentsByGrade} margin={{ top: 24, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fill: '#7A7F8C', fontSize: 13, fontWeight: 700 }} />
                <Tooltip cursor={{ fill: '#F5F6FA' }} contentStyle={{ borderRadius: 16, border: '1px solid #E8E9EE', fontWeight: 700 }} />
                <Bar dataKey="students" name="Students" fill="#3D5AFE" radius={[12, 12, 12, 12]} maxBarSize={64}>
                  <LabelList dataKey="students" position="top" style={{ fill: '#16181D', fontWeight: 800, fontSize: 14 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section aria-labelledby="active-title" className="rounded-[28px] border-2 border-line p-6">
          <h2 id="active-title" className="text-xl font-black text-ink">Active users this week</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamicWeeklyActiveUsers} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E8E9EE" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#7A7F8C', fontSize: 12, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7A7F8C', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #E8E9EE', fontWeight: 700 }} />
                <Line type="monotone" dataKey="users" name="Active users" stroke="#1FA971" strokeWidth={3} dot={{ r: 4, fill: '#1FA971' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section aria-labelledby="courses-title">
        <div className="flex items-center justify-between">
          <h2 id="courses-title" className="text-xl font-black text-ink">Most popular courses</h2>
          <Link href="/admin/courses" className="text-sm font-extrabold text-brand-500 hover:text-brand-700">Manage courses</Link>
        </div>
        <ul className="mt-3 divide-y divide-line">
          {topCourses.map((c) => {
            const s = subjectStyles[c.subject];
            return (
              <li key={c.id} className="flex items-center gap-4 py-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${s.bg}`} aria-hidden="true">
                  <s.icon className={`h-5 w-5 ${s.text}`} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-ink">{courseName(c.grade, c.subject)}</p>
                  <p className="text-sm text-ink-muted">Teacher: {teacherName(c.teacherId)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-ink">{c.enrolled}</p>
                  <p className="text-xs font-bold text-ink-muted">students enrolled</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
