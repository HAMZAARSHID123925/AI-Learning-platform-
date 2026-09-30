'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { AssignTeacherModal } from '@/components/all_dashbord/admin/AssignTeacherModal';
import { teachers } from '@/data/all_dashbord/admin';
import { initials, subjectStyles } from '@/utils/all_dashbord/subjects';
import type { AdminCourse } from '@/types/all_dashbord/index';

export default function AdminTeachers() {
  const { courses } = useAdmin();
  const [assigning, setAssigning] = useState<AdminCourse | null>(null);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-ink">Teachers</h1>
        <p className="mt-1 text-lg text-ink-soft">Each teacher only sees the courses assigned to them.</p>
      </header>

      <ul className="space-y-3">
        {teachers.map((t) => {
          const s = subjectStyles[t.subject];
          const assigned = courses.filter((c) => c.teacherId === t.id).sort((a, b) => a.grade - b.grade);
          const studentCount = assigned.reduce((n, c) => n + c.enrolled, 0);
          const openCourses = courses.filter((c) => c.subject === t.subject && !c.teacherId);
          return (
            <li key={t.id} className="grid gap-4 rounded-[28px] bg-surface p-5 md:grid-cols-[1.2fr_2fr_auto] md:items-center">
              <div className="flex items-center gap-4">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-base font-black ${s.soft} ${s.text}`}>{initials(t.name)}</span>
                <div>
                  <p className="text-lg font-black text-ink">{t.name}</p>
                  <p className={`inline-flex items-center gap-1 text-sm font-bold ${s.text}`}>
                    <s.icon className="h-3.5 w-3.5" aria-hidden="true" /> {s.label}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-extrabold text-ink-muted">Assigned courses</p>
                <ul className="flex flex-wrap gap-2">
                  {assigned.length === 0 && <li className="text-sm font-bold text-ink-muted">None yet</li>}
                  {assigned.map((c) =>
                  <li key={c.id}>
                      <button
                      type="button"
                      onClick={() => setAssigning(c)}
                      className="rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-ink transition-colors duration-150 hover:text-brand-500">
                      
                        Grade {c.grade}
                      </button>
                    </li>
                  )}
                  {openCourses.map((c) =>
                  <li key={c.id}>
                      <button
                      type="button"
                      onClick={() => setAssigning(c)}
                      className="rounded-full border-2 border-dashed border-ink/15 px-3 py-1 text-sm font-extrabold text-ink-muted transition-colors duration-150 hover:border-ink/40 hover:text-ink">
                      
                        + Grade {c.grade}
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              <div className="md:text-right">
                <p className="text-2xl font-black text-ink">{studentCount}</p>
                <p className="text-xs font-bold text-ink-muted">students</p>
              </div>
            </li>);

        })}
      </ul>

      <AssignTeacherModal course={assigning} onClose={() => setAssigning(null)} />
    </div>);

}