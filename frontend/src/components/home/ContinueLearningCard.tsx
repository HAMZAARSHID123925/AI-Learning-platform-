import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SubjectArt } from '../SubjectArt';
import { ProgressBar } from '../ProgressBar';
import { Course } from '../../types/learning';
import { buildModules, getCurrentLesson, getSubjectName } from '../../utils/courses';

export function ContinueLearningCard({ course }: { course: Course }) {
  const lesson = getCurrentLesson(buildModules(course));

  return (
    <section
      aria-labelledby="continue-title"
      className="flex h-full flex-col rounded-3xl bg-primary p-5 sm:p-6 md:p-8 text-white shadow-card"
    >
      <div className="flex items-start justify-between gap-4 sm:gap-6">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-white/80">Continue learning</p>
          <p className="mt-3 sm:mt-5 text-sm sm:text-base font-medium text-white/80">{getSubjectName(course.subject)}</p>
          <h2 id="continue-title" className="mt-1 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
            {course.title}
          </h2>
          {lesson && (
            <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-white/90">
              Lesson {lesson.number} · {lesson.title}
            </p>
          )}
        </div>
        <div className="hidden shrink-0 rounded-3xl bg-white/15 p-4 sm:block">
          <SubjectArt subject={course.subject} size={88} tone="inverse" />
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-6 pt-10 sm:flex-row sm:items-end">
        <div className="flex-1">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm text-white/80">Progress</span>
            <span className="text-lg font-semibold tabular-nums">{course.progress}%</span>
          </div>
          <ProgressBar
            value={course.progress}
            label={`${course.title} progress`}
            colorClass="bg-white"
            trackClass="bg-white/25"
            heightClass="h-3"
          />
        </div>
        <Link
          href={`/dashboard/courses/${course.id}/learn`}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-8 text-lg font-semibold text-primary transition-transform duration-150 ease-out-strong hover:bg-primary-soft active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          Continue
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}