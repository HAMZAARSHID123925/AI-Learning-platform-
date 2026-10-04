'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { useAdmin } from '@/contexts/AdminContext';
import { teachers } from '@/data/admin';
import { subjectStyles } from '@/utils/subjects';
import type { Grade, Subject } from '@/types';

const fieldClass = 'h-12 w-full rounded-2xl border-2 border-line bg-white px-4 text-base text-ink outline-none transition-colors duration-150 focus:border-ink';
const subjects: Subject[] = ['math', 'science', 'english', 'computer'];
const grades: Grade[] = [1, 2, 3, 4, 5];

export function CreateCourseModal({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { createCourse } = useAdmin();
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState<Grade>(5);
  const [subject, setSubject] = useState<Subject>('math');
  const [teacherId, setTeacherId] = useState('');
  const [publish, setPublish] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setGrade(5);
      setSubject('math');
      setTeacherId('');
      setPublish(false);
      setError(null);
    }
  }, [open]);

  const eligible = teachers.filter((t) => t.subject === subject);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError('Give the course a title');
    createCourse({ title: title.trim(), grade, subject, teacherId: teacherId || null, status: publish ? 'published' : 'draft' });
    toast.success(`${title.trim()} created for Grade ${grade}`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create a course" description="New courses start as drafts unless you publish them.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="course-title" className="mb-1.5 block text-sm font-bold text-ink">Course title</label>
          <input id="course-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Decimals & Money" className={fieldClass} aria-invalid={!!error} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="course-grade" className="mb-1.5 block text-sm font-bold text-ink">Grade</label>
            <select id="course-grade" value={grade} onChange={(e) => setGrade(Number(e.target.value) as Grade)} className={fieldClass}>
              {grades.map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="course-subject" className="mb-1.5 block text-sm font-bold text-ink">Subject</label>
            <select
              id="course-subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value as Subject);
                setTeacherId('');
              }}
              className={fieldClass}>
              
              {subjects.map((s) => <option key={s} value={s}>{subjectStyles[s].label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="course-teacher" className="mb-1.5 block text-sm font-bold text-ink">Teacher</label>
          <select id="course-teacher" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={fieldClass}>
            <option value="">Assign later</option>
            {eligible.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-surface p-4">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="h-5 w-5 accent-[#16181D]" />
          <span>
            <span className="block text-sm font-extrabold text-ink">Publish now</span>
            <span className="block text-xs text-ink-muted">Students in this grade will see it right away.</span>
          </span>
        </label>
        {error && <p role="alert" className="text-sm font-semibold text-danger-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create course</Button>
        </div>
      </form>
    </Modal>);

}