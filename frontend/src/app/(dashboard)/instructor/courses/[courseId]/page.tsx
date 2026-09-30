"use client";

import React, { useState } from 'react';
import Link from 'next/link'
import { useParams } from 'next/navigation';
import { ArrowLeftIcon, CalendarPlusIcon, LockIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/components/all_dashbord/Button';
import { ProgressBar } from '@/components/all_dashbord/ProgressBar';
import { ScheduleClassModal } from '@/components/all_dashbord/teacher/ScheduleClassModal';
import { StudentDetail } from '@/components/all_dashbord/teacher/StudentDetail';
import { useTeacher } from '@/hooks/all_dashbord/useTeacher';
import { courseName, initials, performanceLabel, subjectStyles } from '@/utils/all_dashbord/subjects';

import { useRouter, useSearchParams } from 'next/navigation';

export default function TeacherCourse() {
  const { courseId } = useParams() as { courseId: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentParam = searchParams.get('student');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(studentParam);
  const { teacher, myCourses } = useTeacher();
  const [query, setQuery] = useState('');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const data = myCourses.find((m) => m.course.id === courseId);

  if (!data) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <LockIcon className="mx-auto h-10 w-10 text-ink-muted" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-black text-ink">This course isn’t assigned to you</h1>
        <p className="mt-2 text-ink-soft">You can only view courses you teach.</p>
        <Link href="/teacher" className="mt-6 inline-block font-extrabold text-brand-500">Back to dashboard</Link>
      </div>);

  }

  const { course, roster, enrolled, avgProgress, avgScore, needSupport } = data;
  const s = subjectStyles[course.subject];
  const filtered = roster.filter((st) => st.name.toLowerCase().includes(query.toLowerCase()));
  const selected = roster.find((st) => st.id === (selectedStudentId ?? studentParam)) ?? roster[0];

  const stats = [
  { label: 'Enrolled students', value: enrolled },
  { label: 'Average progress', value: `${avgProgress}%` },
  { label: 'Average performance', value: `${avgScore}%` },
  { label: 'Need support', value: needSupport.length }];


  return (
    <div className="space-y-8">
      <Link href="/teacher" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-muted hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> Dashboard
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`inline-flex items-center gap-1.5 text-sm font-extrabold ${s.text}`}>
            <s.icon className="h-4 w-4" aria-hidden="true" /> {courseName(course.grade, course.subject)}
          </p>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-ink">{course.title}</h1>
        </div>
        <Button variant="secondary" onClick={() => setScheduleOpen(true)}>
          <CalendarPlusIcon className="h-4 w-4" aria-hidden="true" /> Schedule class
        </Button>
      </header>

      <dl className="grid grid-cols-2 divide-line rounded-[28px] bg-surface md:grid-cols-4 md:divide-x">
        {stats.map((st) =>
        <div key={st.label} className="p-5 sm:p-6">
            <dt className="text-sm font-extrabold text-ink-muted">{st.label}</dt>
            <dd className="mt-1 text-3xl font-black text-ink">{st.value}</dd>
          </div>
        )}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <section aria-labelledby="roster-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="roster-title" className="text-xl font-black text-ink">Students enrolled</h2>
              <p className="text-sm text-ink-muted">Showing {roster.length} most active of {enrolled}</p>
            </div>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              <label htmlFor="roster-search" className="sr-only">Search students</label>
              <input
                id="roster-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students"
                className="h-10 w-full rounded-xl border-2 border-line pl-9 pr-3 text-sm outline-none transition-colors duration-150 focus:border-ink sm:w-56" />
              
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {filtered.length === 0 && <li className="rounded-2xl bg-surface p-6 text-center text-sm font-bold text-ink-soft">No students match “{query}”.</li>}
            {filtered.map((st) => {
              const perf = performanceLabel(st.avgScore);
              const active = st.id === selected?.id;
              return (
                <li key={st.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(st.id);
                      router.replace(`/instructor/courses/${course.id}?student=${st.id}`, { scroll: false });
                    }}
                    aria-pressed={active}
                    className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border-2 p-3 text-left transition-colors duration-150 sm:grid-cols-[auto_1.2fr_1fr_auto] ${
                    active ? 'border-ink bg-white' : 'border-transparent bg-surface hover:border-line'}`
                    }>
                    
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-black text-ink">{initials(st.name)}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-extrabold text-ink">{st.name}</span>
                      <span className="block text-xs text-ink-muted">{st.progress}% complete</span>
                    </span>
                    <span className="hidden sm:block">
                      <ProgressBar value={st.progress} barClassName={s.solid} trackClassName="bg-white" label={`${st.name} progress`} />
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${perf.className}`}>{st.avgScore}%</span>
                  </button>
                </li>);

            })}
          </ul>
        </section>

        <aside aria-label="Student details" className="lg:sticky lg:top-8 lg:self-start">
          {selected && <StudentDetail student={selected} />}
        </aside>
      </div>

      <ScheduleClassModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        courses={myCourses.map((m) => m.course)}
        teacherName={teacher.name}
        defaultCourseId={course.id} />
      
    </div>);

}