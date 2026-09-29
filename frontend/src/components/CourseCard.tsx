import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Check } from 'lucide-react';
import { SubjectArt } from './SubjectArt';
import { ProgressBar } from './ProgressBar';
import { Course } from '../types/learning';
import { getActionLabel, getCourseStatus, getSubjectName } from '../utils/courses';
import { subjectTheme } from '../utils/subjectTheme';

export function CourseCard({ course }: { course: Course }) {
  const status = getCourseStatus(course);
  const theme = subjectTheme[course.subject];

  return (
    <Link
      href={`/dashboard/courses/${course.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card transition-[transform,box-shadow] duration-200 ease-out-strong hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className={`flex h-32 items-center justify-center ${theme.softBg}`}>
        <SubjectArt subject={course.subject} size={72} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug">{course.title}</h3>
        <p className="mt-1 text-sm text-muted">
          {getSubjectName(course.subject)} · Grade {course.grade}
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          {course.lessonCount} lessons
        </p>

        <div className="mt-auto pt-5">
          {status === 'completed' ? (
            <div className="flex h-9 items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                Completed
              </span>
              <span className="text-sm font-medium text-muted transition-colors duration-150 group-hover:text-ink">
                Review
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold tabular-nums">{course.progress}%</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    status === 'in-progress' ? 'text-primary' : 'text-ink'
                  }`}
                >
                  {getActionLabel(status)}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-150 ease-out-strong group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </div>
              <ProgressBar
                value={course.progress}
                label={`${course.title} progress`}
                colorClass={theme.bar}
                className="mt-2"
              />
            </>
          )}
        </div>
      </div>
    </Link>
  );
}