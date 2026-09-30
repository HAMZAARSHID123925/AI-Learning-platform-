'use client';

import React, { useEffect, useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { useAdmin } from '@/contexts/AdminContext';
import { teachers } from '@/data/all_dashbord/admin';
import { courseName, initials, subjectStyles } from '@/utils/all_dashbord/subjects';
import type { AdminCourse } from '@/types/all_dashbord/index';

export function AssignTeacherModal({ course, onClose }: {course: AdminCourse | null;onClose: () => void;}) {
  const { assignTeacher, courses } = useAdmin();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(course?.teacherId ?? null);
  }, [course]);

  const eligible = course ? teachers.filter((t) => t.subject === course.subject) : [];

  const save = () => {
    if (!course) return;
    assignTeacher(course.id, selected);
    const name = teachers.find((t) => t.id === selected)?.name;
    toast.success(name ? `${name} now teaches ${courseName(course.grade, course.subject)}` : 'Teacher removed');
    onClose();
  };

  return (
    <Modal
      open={!!course}
      onClose={onClose}
      title="Assign a teacher"
      description={course ? `${courseName(course.grade, course.subject)} · showing ${subjectStyles[course.subject].label} teachers` : undefined}>
      
      <div role="radiogroup" aria-label="Teacher" className="space-y-2">
        {eligible.length === 0 && <p className="rounded-2xl bg-surface p-5 text-center text-sm font-bold text-ink-soft">No teachers for this subject yet.</p>}
        {eligible.map((t) => {
          const active = selected === t.id;
          const load = courses.filter((c) => c.teacherId === t.id).length;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(t.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors duration-150 ${active ? 'border-ink bg-surface' : 'border-line hover:border-ink/30'}`}>
              
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-sm font-black text-brand-700">{initials(t.name)}</span>
              <span className="flex-1">
                <span className="block font-extrabold text-ink">{t.name}</span>
                <span className="block text-xs text-ink-muted">{load} course{load === 1 ? '' : 's'} assigned</span>
              </span>
              {active && <CheckIcon className="h-5 w-5 text-ink" aria-hidden="true" />}
            </button>);

        })}
      </div>
      <div className="mt-6 flex items-center justify-between gap-2">
        {course?.teacherId ?
        <Button variant="ghost" onClick={() => setSelected(null)} className="text-danger-700 hover:text-danger-700">Unassign</Button> :

        <span />
        }
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>
    </Modal>);

}