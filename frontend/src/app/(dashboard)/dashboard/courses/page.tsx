'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CourseCard } from '@/components/student/CourseCard';
import { StateMessage } from '@/components/student/StateMessage';
import { useAuth } from '@/contexts/student/AuthContext';
import { useProgress } from '@/contexts/student/ProgressContext';
import { useAsync } from '@/hooks/student/useAsync';
import { learningApi } from '@/utils/student/learningApi';
import { getCourseProgress } from '@/utils/student/progress';
import { subjectOrder, subjectStyles } from '@/utils/student/subjects';
import type { Grade } from '@/types/student';

export default function Courses() {
  const { user, setGrade } = useAuth();
  const grade = (user?.grade ?? 5) as Grade;
  const { lessons } = useProgress();
  const q = useAsync(() => learningApi.listCourses(grade), [grade]);

  const rows = useMemo(
    () => (q.data ?? []).map((c) => ({ course: c, progress: getCourseProgress(c, lessons) })),
    [q.data, lessons]
  );
  const done = rows.reduce((n, r) => n + r.progress.completed, 0);
  const total = rows.reduce((n, r) => n + r.progress.total, 0);
  const featuredId = [...rows]
    .filter((r) => r.progress.nextLesson && r.progress.nextLessonProgress > 0)
    .sort((a, b) => b.progress.nextLessonProgress - a.progress.nextLessonProgress)[0]?.course.id;

  return (
    <div>
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-ink sm:text-5xl">Explore Grade {grade}</h1>
          {q.data && (
            <p className="mt-2 text-lg text-ink-soft">
              {rows.length} learning paths · <span className="font-extrabold text-ink">{done} of {total}</span> lessons done
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 self-start rounded-2xl border-2 border-line bg-surface p-1 sm:self-auto">
          {([1, 2, 3, 4, 5] as Grade[]).map((g) => {
            const isSelected = g === grade;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGrade(g)}
                className={`rounded-xl px-3 py-1.5 text-xs font-black transition-colors ${
                  isSelected
                    ? 'bg-ink text-white shadow-xs'
                    : 'text-ink-soft hover:bg-white hover:text-ink'
                }`}
              >
                Grade {g}
              </button>
            );
          })}
        </div>
      </header>

      {q.loading && <StateMessage kind="loading" title="Loading your learning paths…" />}
      {q.error && <StateMessage kind="error" message={q.error.message} onRetry={q.reload} />}

      {q.data && (
        <div className="space-y-14">
          {subjectOrder.map((subject) => {
            const group = rows.filter((r) => r.course.subject === subject);
            if (!group.length) return null;
            const s = subjectStyles[subject];
            return (
              <section key={subject} aria-labelledby={`sub-${subject}`}>
                <div className="mb-5 flex items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.bg}`} aria-hidden="true">
                    <s.icon className={`h-5 w-5 ${s.text}`} />
                  </span>
                  <h2 id={`sub-${subject}`} className="text-2xl font-black text-ink">{s.label}</h2>
                  <span className="text-sm font-bold text-ink-muted">
                    {group.length} {group.length === 1 ? 'path' : 'paths'}
                  </span>
                </div>
                <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {group.map((r, i) => (
                    <motion.li
                      key={r.course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <CourseCard course={r.course} progress={r.progress} featured={r.course.id === featuredId} />
                    </motion.li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}