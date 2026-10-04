'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRightIcon, CalendarPlusIcon, RadioIcon } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { ClassList } from '@/components/teacher/ClassList';
import { ScheduleClassModal } from '@/components/teacher/ScheduleClassModal';
import { useTeacher } from '@/hooks/useTeacher';
import { adminApi } from '@/utils/adminApi';
import { subjectImages } from '@/data/illustrations';
import { courseName, initials, subjectStyles } from '@/utils/subjects';

export default function TeacherDashboard() {
  const { teacher, myCourses, myClasses } = useTeacher();
  const [modal, setModal] = useState<null | 'schedule' | 'now'>(null);
  const [escalations, setEscalations] = useState<any[]>([]);
  const subject = subjectStyles[teacher.subject];

  React.useEffect(() => {
    adminApi.listEscalations()
      .then((data) => {
        if (Array.isArray(data)) setEscalations(data);
      })
      .catch(() => {});
  }, []);

  const needSupport = myCourses.flatMap((m) => m.needSupport.map((s) => ({ student: s, course: m.course })));

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`text-sm font-extrabold ${subject.text}`}>{subject.label} Instructor</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-ink">Welcome back, {teacher.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setModal('schedule')}>
            <CalendarPlusIcon className="h-4 w-4" aria-hidden="true" /> Schedule
          </Button>
          <Button variant="brand" onClick={() => setModal('now')}>
            <RadioIcon className="h-4 w-4" aria-hidden="true" /> Go live
          </Button>
        </div>
      </header>

      <section aria-labelledby="my-courses">
        <h2 id="my-courses" className="text-2xl font-black text-ink">My Courses</h2>
        <ul className="mt-5 grid gap-6 md:grid-cols-2">
          {myCourses.map(({ course, enrolled, avgProgress, avgScore }) => {
            const s = subjectStyles[course.subject];
            return (
              <li key={course.id}>
                <Link
                  href={`/instructor/courses/${course.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[28px] border-2 border-line bg-white transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-ink/15 hover:shadow-lift">
                  
                  <div className={`flex items-center gap-4 p-6 ${s.bg}`}>
                    <img src={subjectImages[course.subject]} alt="" className="h-20 w-24 rounded-2xl object-cover" />
                    <div>
                      <p className={`text-sm font-extrabold ${s.text}`}>{courseName(course.grade, course.subject)}</p>
                      <p className="text-2xl font-black text-ink">{course.title}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <dl className="grid grid-cols-3 gap-4">
                      <div>
                        <dt className="text-xs font-extrabold text-ink-muted">Enrolled</dt>
                        <dd className="text-2xl font-black text-ink">{enrolled}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-extrabold text-ink-muted">Avg progress</dt>
                        <dd className="text-2xl font-black text-ink">{avgProgress}%</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-extrabold text-ink-muted">Avg score</dt>
                        <dd className="text-2xl font-black text-ink">{avgScore}%</dd>
                      </div>
                    </dl>
                    <div className="mt-4">
                      <ProgressBar value={avgProgress} barClassName={s.solid} label="Average progress" />
                    </div>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-extrabold text-ink group-hover:text-brand-500">
                      Open course <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </li>);

          })}
        </ul>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="classes-title">
          <div className="flex items-center justify-between">
            <h2 id="classes-title" className="text-xl font-black text-ink">Your live classes</h2>
            <Link href="/instructor/classes" className="text-sm font-extrabold text-brand-500 hover:text-brand-700">See all</Link>
          </div>
          <div className="mt-2">
            <ClassList classes={myClasses.slice(0, 4)} emptyText="No classes yet — schedule your first one." />
          </div>
        </section>

        <section aria-labelledby="support-title" className="rounded-[28px] bg-danger-50 p-6">
          <h2 id="support-title" className="text-xl font-black text-ink">Needs a little help</h2>
          <p className="mt-1 text-sm text-ink-soft">Students averaging under 70%.</p>
          <ul className="mt-4 space-y-2">
            {needSupport.map(({ student, course }) =>
            <li key={`${student.id}-${course.id}`}>
                <Link
                href={`/instructor/courses/${course.id}?student=${student.id}`}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 transition-transform duration-150 hover:-translate-y-0.5">
                
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-danger-50 text-sm font-black text-danger-700">{initials(student.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold text-ink">{student.name}</p>
                    <p className="truncate text-xs text-ink-muted">{student.weakAreas.join(', ')}</p>
                  </div>
                  <span className="text-sm font-black text-danger-700">{student.avgScore}%</span>
                </Link>
              </li>
            )}
          </ul>
        </section>
      </div>

      <ScheduleClassModal
        open={modal !== null}
        onClose={() => setModal(null)}
        courses={myCourses.map((m) => m.course)}
        teacherName={teacher.name}
        defaultMode={modal ?? 'schedule'} />
      
    </div>);

}