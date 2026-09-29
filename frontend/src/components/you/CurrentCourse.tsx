import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SubjectArt } from '../SubjectArt';
import { Course } from '../../types/learning';
import { buildModules, getCurrentLesson, getSubjectName } from '../../utils/courses';

export function CurrentCourse({ course }: { course: Course }) {
  const lesson = getCurrentLesson(buildModules(course));

  return (
    <section
      aria-labelledby="current-course-title"
      className="flex h-full flex-col rounded-3xl border-2 border-primary bg-primary-soft p-6 md:p-8"
    >
      <p className="text-sm font-semibold text-primary">Currently learning</p>
      <div className="mt-5 flex items-center gap-5">
        <span className="shrink-0 rounded-2xl bg-white p-3">
          <SubjectArt subject={course.subject} size={56} />
        </span>
        <div className="min-w-0">
          <h2 id="current-course-title" className="text-3xl font-semibold tracking-tight">
            {course.title}
          </h2>
          <p className="text-muted">
            {getSubjectName(course.subject)} · Lesson {lesson?.number ?? course.completedLessons} of{' '}
            {course.lessonCount}
          </p>
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="text-muted">
            {course.completedLessons} of {course.lessonCount} lessons done
          </span>
          <span className="text-base font-semibold tabular-nums">{course.progress}%</span>
        </div>
        <ol
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${course.lessonCount}, minmax(0, 1fr))` }}
          aria-label="Lessons"
        >
          {Array.from({ length: course.lessonCount }).map((_, i) => {
            const n = i + 1;
            const cls =
              n <= course.completedLessons
                ? 'bg-primary'
                : n === lesson?.number
                ? 'bg-primary/40'
                : 'bg-white';
            return <li key={n} className={`h-3 rounded-full ${cls}`} aria-label={`Lesson ${n}`} />;
          })}
        </ol>
      </div>

      <div className="mt-auto pt-8">
        <Link
          href={`/dashboard/courses/${course.id}/learn`}
          className="inline-flex h-14 items-center gap-2 rounded-2xl bg-primary px-8 text-lg font-semibold text-white transition-transform duration-150 ease-out-strong hover:bg-primary-strong active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Continue
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}