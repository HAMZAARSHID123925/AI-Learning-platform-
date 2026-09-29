"use client";

import React, { useState } from 'react';
import { SearchX } from 'lucide-react';
import { SubjectFilter, SubjectTabs } from '@/components/courses/SubjectTabs';
import { CourseGrid } from '@/components/CourseGrid';
import { useLearning } from '@/contexts/LearningContext';
import { getCoursesForGrade, sortByStatus } from '@/utils/courses';

export default function CoursesPage() {
  const { grade } = useLearning();
  const [filter, setFilter] = useState<SubjectFilter>('all');
  const list = sortByStatus(getCoursesForGrade(grade)).filter(
    (c) => filter === 'all' || c.subject === filter
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Courses</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Class {grade}
            </span>
          </div>
          <p className="mt-1 text-base text-muted">All active subjects and lessons for Class {grade}</p>
        </div>
      </header>

      <div className="mt-8">
        <SubjectTabs value={filter} onChange={setFilter} />
      </div>

      <div className="mt-6">
        {list.length > 0 ? (
          <CourseGrid key={`${grade}-${filter}`} courses={list} />
        ) : (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-white px-6 py-16 text-center">
            <SearchX className="h-10 w-10 text-subtle" aria-hidden="true" />
            <p className="mt-4 text-lg font-semibold">No courses here yet</p>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="mt-4 h-11 rounded-xl px-4 font-semibold text-primary transition-colors duration-150 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Show all courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
