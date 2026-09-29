"use client";

import React, { useState } from 'react';
import { SearchX } from 'lucide-react';
import { GradeSelector } from '@/components/GradeSelector';
import { SubjectFilter, SubjectTabs } from '@/components/courses/SubjectTabs';
import { CourseGrid } from '@/components/CourseGrid';
import { useLearning } from '@/contexts/LearningContext';
import { getCoursesForGrade, sortByStatus } from '@/utils/courses';

export default function CoursesPage() {
  const { grade, setGrade } = useLearning();
  const [filter, setFilter] = useState<SubjectFilter>('all');
  const list = sortByStatus(getCoursesForGrade(grade)).filter(
    (c) => filter === 'all' || c.subject === filter
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Courses</h1>
          <p className="mt-1 text-lg text-muted">Pick one to start</p>
        </div>
        <GradeSelector value={grade} onChange={setGrade} compact />
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
