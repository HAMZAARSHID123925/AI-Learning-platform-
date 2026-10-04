'use client';

import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { useClasses } from '@/contexts/ClassesContext';
import { courseName } from '@/utils/subjects';
import { formatTime24, offsetFromDate } from '@/utils/dates';
import type { LegacyCourseData } from '@/types/learning';

interface ScheduleClassModalProps {
  open: boolean;
  onClose: () => void;
  courses: LegacyCourseData[];
  teacherName: string;
  defaultCourseId?: string;
  defaultMode?: 'schedule' | 'now';
}

const fieldClass =
'h-12 w-full rounded-2xl border-2 border-line bg-white px-4 text-base text-ink outline-none transition-colors duration-150 focus:border-ink aria-[invalid=true]:border-danger-500';

export function ScheduleClassModal({ open, onClose, courses, teacherName, defaultCourseId, defaultMode = 'schedule' }: ScheduleClassModalProps) {
  const { addClass } = useClasses();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [mode, setMode] = useState<'schedule' | 'now'>(defaultMode);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('10:00');
  const [courseId, setCourseId] = useState(defaultCourseId ?? courses[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setTitle('');
      setDate(today);
      setTime('10:00');
      setCourseId(defaultCourseId ?? courses[0]?.id ?? '');
      setError(null);
    }
    // Reset only when the modal opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.id === courseId);
    if (!title.trim()) return setError('Give your class a title');
    if (!course) return setError('Choose a course');
    const dayOffset = mode === 'now' ? 0 : offsetFromDate(parseISO(date));
    if (mode === 'schedule' && dayOffset < 0) return setError('Pick today or a future date');

    addClass({
      grade: course.grade,
      subject: course.subject,
      title: title.trim(),
      teacher: teacherName,
      dayOffset,
      time: mode === 'now' ? format(new Date(), 'h:mm a') : formatTime24(time),
      duration: 45,
      isLive: mode === 'now',
      attendees: 0
    });
    toast.success(mode === 'now' ? `“${title.trim()}” is live — students can join now` : `“${title.trim()}” scheduled`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={mode === 'now' ? 'Start a live class' : 'Schedule a class'} description="Students in the course will see it on their Live page.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div role="radiogroup" aria-label="When" className="grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1">
          {(['schedule', 'now'] as const).map((m) =>
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => setMode(m)}
            className={`h-10 rounded-xl text-sm font-extrabold transition-colors duration-150 ${mode === m ? 'bg-white text-ink shadow-card' : 'text-ink-muted hover:text-ink'}`}>
            
              {m === 'schedule' ? 'Schedule for later' : 'Go live now'}
            </button>
          )}
        </div>

        <div>
          <label htmlFor="class-title" className="mb-1.5 block text-sm font-bold text-ink">Title</label>
          <input id="class-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fraction Pizza Party" className={fieldClass} aria-invalid={!!error && !title.trim()} />
        </div>

        <div>
          <label htmlFor="class-course" className="mb-1.5 block text-sm font-bold text-ink">Course</label>
          <select id="class-course" value={courseId} onChange={(e) => setCourseId(e.target.value)} className={fieldClass}>
            {courses.map((c) =>
            <option key={c.id} value={c.id}>{courseName(c.grade, c.subject)} · {c.title}</option>
            )}
          </select>
        </div>

        {mode === 'schedule' &&
        <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="class-date" className="mb-1.5 block text-sm font-bold text-ink">Date</label>
              <input id="class-date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="class-time" className="mb-1.5 block text-sm font-bold text-ink">Time</label>
              <input id="class-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldClass} />
            </div>
          </div>
        }

        {error && <p role="alert" className="text-sm font-semibold text-danger-700">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant={mode === 'now' ? 'brand' : 'primary'}>{mode === 'now' ? 'Start class' : 'Schedule class'}</Button>
        </div>
      </form>
    </Modal>);

}