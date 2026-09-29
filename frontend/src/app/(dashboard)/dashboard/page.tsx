"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AIChatCard } from '@/components/home/AIChatCard';
import { CourseGrid } from '@/components/CourseGrid';
import { useLearning } from '@/contexts/LearningContext';
import { student as defaultStudent } from '@/data/student';
import { getCoursesForGrade } from '@/utils/courses';

export default function DashboardHomePage() {
  const { grade } = useLearning();
  const [studentName, setStudentName] = useState(defaultStudent.name);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('user_name');
      const storedRole = localStorage.getItem('user_role');
      
      const genericRoles = ['instructor', 'teacher', 'admin', 'administrator', 'student', 'user'];
      
      if (storedName && storedName.trim()) {
        const clean = storedName.trim();
        const first = clean.split(' ')[0];
        if (!genericRoles.includes(first.toLowerCase())) {
          setStudentName(first);
          return;
        }
      }

      // If user_name is just "Instructor" or "Student", try extracting from email or fallback to learner name
      const token = localStorage.getItem('access_token');
      const savedEmail = localStorage.getItem('user_email');
      if (savedEmail && savedEmail.includes('@')) {
        const raw = savedEmail.split('@')[0];
        if (!genericRoles.includes(raw.toLowerCase())) {
          const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1);
          setStudentName(capitalized);
          return;
        }
      }

      // Default friendly learner name
      setStudentName('Alex');
    }
  }, []);

  const explore = getCoursesForGrade(grade).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8 px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
      
      {/* 1. TOP GREETING & ACTIVE GRADE BADGE */}
      <header className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Hello, {studentName}! 👋
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Class {grade}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted font-medium">
            Welcome! Here are your lessons and daily challenges for Class {grade}.
          </p>
        </div>
      </header>

      {/* 2. AI HELPER - SIMPLE QUESTIONS */}
      <AIChatCard name={studentName} />

      {/* 4. SUBJECTS FOR THIS CLASS */}
      <section aria-labelledby="explore-title" className="pt-1">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="explore-title" className="text-lg sm:text-xl font-extrabold tracking-tight text-ink">
              Subjects for Class {grade}
            </h2>
            <p className="text-xs text-muted">
              Math, Science, English, and Computer
            </p>
          </div>
          <Link
            href="/dashboard/courses"
            className="inline-flex h-9 items-center gap-1 rounded-xl px-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary-soft"
          >
            All Lessons
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        <CourseGrid courses={explore} columns={4} />
      </section>
    </div>
  );
}
