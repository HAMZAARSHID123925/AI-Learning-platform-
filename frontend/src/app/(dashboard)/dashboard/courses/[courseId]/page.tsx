"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ChevronLeft, Layers } from 'lucide-react';
import { SubjectArt } from '@/components/SubjectArt';
import { ProgressBar } from '@/components/ProgressBar';
import { LearningPath } from '@/components/course/LearningPath';
import { buildModules, getCourse, getCourseStatus, getCurrentLesson, getSubjectName } from '@/utils/courses';
import { subjectTheme } from '@/utils/subjectTheme';

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const course = courseId ? getCourse(courseId) : undefined;

  if (!course) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center px-5 py-24 text-center">
        <p className="text-2xl font-semibold">Course not found</p>
        <Link
          href="/dashboard/courses"
          className="mt-6 inline-flex h-12 items-center rounded-xl bg-ink px-6 font-semibold text-white"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  const modules = buildModules(course);
  const current = getCurrentLesson(modules);
  const status = getCourseStatus(course);
  const theme = subjectTheme[course.subject];
  const moduleCount = modules.filter((m) => !m.isFinal).length;

  const ctaLabel =
    status === 'completed'
      ? 'Review course'
      : status === 'not-started'
      ? 'Start · Lesson 1'
      : current?.isChallenge
      ? 'Start Final Challenge'
      : `Continue · Lesson ${current?.number}`;

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-10">
      <Link
        href="/dashboard/courses"
        className="-ml-2 inline-flex h-10 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Courses
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-12 lg:gap-12">
        <aside className="self-start lg:sticky lg:top-24 lg:col-span-5">
          <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
            <div className={`flex h-40 items-center justify-center ${theme.softBg}`}>
              <SubjectArt subject={course.subject} size={96} />
            </div>
            <div className="p-6 md:p-7">
              <p className={`text-sm font-semibold ${theme.text}`}>
                {getSubjectName(course.subject)} · Grade {course.grade}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{course.title}</h1>
              <div className="mt-3 flex items-center gap-4 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  {course.lessonCount} lessons
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-4 w-4" aria-hidden="true" />
                  {moduleCount} modules
                </span>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tabular-nums">{course.progress}%</span>
                  <span className="text-sm text-muted">complete</span>
                </div>
                <ProgressBar
                  value={course.progress}
                  label={`${course.title} progress`}
                  colorClass="bg-success"
                  heightClass="h-3"
                />
              </div>

              <Link
                href={`/dashboard/courses/${course.id}/learn`}
                className="mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-lg font-semibold text-white transition-transform duration-150 ease-out-strong hover:bg-primary-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {ctaLabel}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </aside>

        <section aria-labelledby="path-title" className="lg:col-span-7">
          <h2 id="path-title" className="sr-only">
            Lessons
          </h2>
          <LearningPath modules={modules} courseId={course.id} />
        </section>
      </div>
    </div>
  );
}
