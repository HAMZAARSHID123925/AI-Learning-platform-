import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { SubjectArt } from '../SubjectArt';
import { ProgressBar } from '../ProgressBar';
import { Course, CourseStatus } from '../../types/learning';
import { getActionLabel, getCourseStatus, getSubjectName } from '../../utils/courses';
import { subjectTheme } from '../../utils/subjectTheme';

const groups: { status: CourseStatus; label: string }[] = [
  { status: 'in-progress', label: 'Learning now' },
  { status: 'completed', label: 'Completed' },
  { status: 'not-started', label: 'Not started' },
];

export function CourseProgressList({ courses }: { courses: Course[] }) {
  return (
    <section aria-labelledby="my-courses-title" className="rounded-3xl border border-line bg-white p-6 shadow-card md:p-8">
      <h2 id="my-courses-title" className="text-lg font-semibold">
        My courses
      </h2>

      <div className="mt-4 divide-y divide-line">
        {groups.map((group) => {
          const list = courses.filter((c) => getCourseStatus(c) === group.status);
          if (list.length === 0) return null;
          return (
            <div key={group.status} className="py-4 first:pt-2 last:pb-0">
              <h3 className="mb-1 text-sm text-muted">{group.label}</h3>
              <ul>
                {list.map((course) => {
                  const theme = subjectTheme[course.subject];
                  return (
                    <li key={course.id}>
                      <Link
                        href={`/dashboard/courses/${course.id}`}
                        className="-mx-3 flex items-center gap-4 rounded-2xl p-3 transition-colors duration-150 hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${theme.softBg}`}>
                          <SubjectArt subject={course.subject} size={32} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="truncate font-semibold">{course.title}</p>
                            {group.status === 'in-progress' && (
                              <span className="shrink-0 text-sm font-semibold tabular-nums">{course.progress}%</span>
                            )}
                            {group.status === 'completed' && (
                              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-success">
                                <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                                Completed
                              </span>
                            )}
                          </div>
                          {group.status === 'in-progress' ? (
                            <ProgressBar
                              value={course.progress}
                              label={`${course.title} progress`}
                              colorClass={theme.bar}
                              className="mt-2"
                            />
                          ) : (
                            <p className="text-sm text-muted">
                              {getSubjectName(course.subject)} · Grade {course.grade}
                            </p>
                          )}
                        </div>
                        <span
                          className={`hidden w-20 shrink-0 text-right text-sm font-semibold sm:block ${
                            group.status === 'in-progress' ? 'text-primary' : 'text-muted'
                          }`}
                        >
                          {getActionLabel(group.status)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}