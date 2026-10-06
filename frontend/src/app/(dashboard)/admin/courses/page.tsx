'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PlusIcon, UserPlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AssignTeacherModal } from '@/components/admin/AssignTeacherModal';
import { CreateCourseModal } from '@/components/admin/CreateCourseModal';
import { Button } from '@/components/shared/Button';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { useAdmin } from '@/contexts/AdminContext';
import { teachers } from '@/data/admin';
import { courseName, subjectStyles } from '@/utils/subjects';
import type { AdminCourse, Grade } from '@/types';

const gradeFilters: (Grade | 'all')[] = ['all', 1, 2, 3, 4, 5];

export default function AdminCourses() {
  const { courses, toggleStatus, refreshCourses, coursesError, teachers: contextTeachers } = useAdmin();
  const [grade, setGrade] = useState<Grade | 'all'>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [assigning, setAssigning] = useState<AdminCourse | null>(null);

  const activeTeachers = contextTeachers.length > 0 ? contextTeachers : teachers;
  const visible = courses.filter((c) => grade === 'all' || c.grade === grade).sort((a, b) => b.grade - a.grade);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-ink">Courses & content</h1>
          <p className="mt-1 text-lg text-ink-soft">Create courses, assign teachers and choose what students see.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon className="h-4 w-4" aria-hidden="true" /> New course
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void refreshCourses().catch(() => {})}>Refresh courses</Button>
        {coursesError && <p role="alert">{coursesError}</p>}
      </div>
      <div role="tablist" aria-label="Filter by grade" className="flex flex-wrap gap-2">
        {gradeFilters.map((g) =>
        <button
          key={g}
          role="tab"
          aria-selected={grade === g}
          onClick={() => setGrade(g)}
          className={`h-10 rounded-full px-4 text-sm font-extrabold transition-colors duration-150 ${grade === g ? 'bg-ink text-white' : 'bg-surface text-ink-soft hover:text-ink'}`}>
          
            {g === 'all' ? 'All grades' : `Grade ${g}`}
          </button>
        )}
      </div>

      <ul className="divide-y divide-line">
        {visible.map((c) => {
          const s = subjectStyles[c.subject];
          const teacher = activeTeachers.find((t) => t.id === c.teacherId);
          const published = c.status === 'published';
          return (
            <li key={c.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 py-5 md:grid-cols-[auto_1.4fr_1fr_1fr_auto]">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${s.bg}`} aria-hidden="true">
                <s.icon className={`h-6 w-6 ${s.text}`} />
              </span>
              <div className="min-w-0">
                <Link href={`/admin/courses/${c.id}/builder`} className="block truncate font-black text-ink hover:text-brand-500">{c.title || courseName(c.grade, c.subject)}</Link>
                <p className="truncate text-sm text-ink-muted">{courseName(c.grade, c.subject)}</p>
              </div>


              <div className="col-span-3 md:col-span-1">
                {teacher ?
                <button type="button" onClick={() => setAssigning(c)} className="text-left text-sm font-extrabold text-ink hover:text-brand-500">
                    {teacher.name}
                    <span className="block text-xs font-bold text-ink-muted">Change teacher</span>
                  </button> :

                <button
                  type="button"
                  onClick={() => setAssigning(c)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-math-50 px-3 py-1.5 text-sm font-extrabold text-math-700 hover:bg-math-100">
                  
                    <UserPlusIcon className="h-4 w-4" aria-hidden="true" /> Assign teacher
                  </button>
                }
              </div>

              <div className="col-span-3 flex items-center gap-3 md:col-span-1">
                <ProgressBar value={c.avgProgress} barClassName={s.solid} label={`${courseName(c.grade, c.subject)} average progress`} />
                <span className="w-10 shrink-0 text-right text-sm font-extrabold text-ink-soft">{c.avgProgress}%</span>
              </div>

              <div className="col-start-3 row-start-1 flex items-center gap-2 md:col-start-auto md:row-start-auto">
                <span className={`hidden text-xs font-extrabold sm:inline ${published ? 'text-science-700' : 'text-ink-muted'}`}>{published ? 'Published' : c.status === 'archived' ? 'Archived' : 'Draft'}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={published}
                  aria-label={`${courseName(c.grade, c.subject)} visible to students`}
                  disabled={published || c.status === 'archived'}
                  onClick={async () => {
                    try { await toggleStatus(c.id); toast.success('Published — students can see it now'); }
                    catch (error) { toast.error(error instanceof Error ? error.message : 'Could not publish course'); }
                  }}
                  className={`relative h-7 w-12 rounded-full transition-colors duration-150 ${published ? 'bg-science-500' : 'bg-line'}`}>
                  
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ease-out ${published ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </li>);

        })}
      </ul>

      <CreateCourseModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <AssignTeacherModal course={assigning} onClose={() => setAssigning(null)} />
    </div>);

}