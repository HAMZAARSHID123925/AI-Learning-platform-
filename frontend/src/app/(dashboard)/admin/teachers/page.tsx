'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { AssignTeacherModal } from '@/components/admin/AssignTeacherModal';
import { InviteTeacherModal } from '@/components/admin/InviteTeacherModal';
import { Button } from '@/components/shared/Button';
import { teachers as seedTeachers } from '@/data/admin';
import { initials, subjectStyles } from '@/utils/subjects';
import type { AdminCourse, Subject } from '@/types';
import { UserPlusIcon } from 'lucide-react';

export default function AdminTeachers() {
  const { courses, students, teachers: contextTeachers } = useAdmin();
  const [assigning, setAssigning] = useState<AdminCourse | null>(null);
  const [inviting, setInviting] = useState(false);

  const activeTeachers = contextTeachers.length > 0 ? contextTeachers : seedTeachers;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-ink">Teachers</h1>
          <p className="mt-1 text-lg text-ink-soft">Each teacher only sees the courses assigned to them.</p>
        </div>
        <Button onClick={() => setInviting(true)} className="gap-2 shrink-0">
          <UserPlusIcon className="h-4 w-4" />
          Add Teacher
        </Button>
      </header>

      <ul className="space-y-3">
        {activeTeachers.map((t) => {
          const subjKey = (t.subject as Subject) || 'math';
          const s = subjectStyles[subjKey] || subjectStyles.math;
          const assigned = courses.filter((c) => c.teacherId === t.id).sort((a, b) => a.grade - b.grade);
          const assignedCourseIds = new Set(assigned.map((c) => c.id));
          const studentCount = students.filter((st) => st.courseIds.some((cid) => assignedCourseIds.has(cid))).length;
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
      <InviteTeacherModal open={inviting} onClose={() => setInviting(false)} />
    </div>
  );
}