"use client";

import React, { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Video, FileCheck, Award, Flame, CheckCircle2, 
  Sparkles, Calendar, Clock, Star, Trophy, BookOpen
} from 'lucide-react';
import { GradeSelector } from '@/components/GradeSelector';
import { ContinueLearningCard } from '@/components/home/ContinueLearningCard';
import { WarmupCard } from '@/components/home/WarmupCard';
import { WarmupSession } from '@/components/home/WarmupSession';
import { AIChatCard } from '@/components/home/AIChatCard';
import { CourseGrid } from '@/components/CourseGrid';
import { useLearning } from '@/contexts/LearningContext';
import { student as defaultStudent } from '@/data/student';
import { getCourse, getCoursesForGrade } from '@/utils/courses';

export default function DashboardHomePage() {
  const { grade, setGrade } = useLearning();
  const [warmupOpen, setWarmupOpen] = useState(false);
  const closeWarmup = useCallback(() => setWarmupOpen(false), []);
  
  const [studentName, setStudentName] = useState(defaultStudent.name);
  const [streakCount, setStreakCount] = useState<number>(defaultStudent.streakDays || 5);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('user_name');
      if (storedName && storedName.trim()) {
        const clean = storedName.trim();
        if (clean.toLowerCase() !== 'admin' && clean.toLowerCase() !== 'administrator') {
          setStudentName(clean.split(' ')[0]);
        }
      }
      try {
        const storedStreak = localStorage.getItem('streak_data');
        if (storedStreak) {
          const parsed = JSON.parse(storedStreak);
          if (parsed && typeof parsed.count === 'number') {
            setStreakCount(parsed.count);
          }
        }
      } catch (e) {
        // fallback
      }
    }
  }, []);

  const currentCourse = getCourse(defaultStudent.currentCourseId);
  const explore = getCoursesForGrade(grade).slice(0, 4);

  // Simple daily goal check: 1 warmup + 1 lesson
  const dailyGoalTarget = 3;
  const dailyGoalCompleted = 2;

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-7 px-4 sm:px-6 md:px-8 py-5 sm:py-7 md:py-8">
      
      {/* 1. TOP GREETING & SIMPLE GRADE SELECTOR */}
      <header className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Salam, {studentName}! 👋
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Class {grade}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted font-medium">
            Welcome! Pick a lesson to start learning today.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <GradeSelector value={grade} onChange={setGrade} />
        </div>
      </header>

      {/* 2. VERY SIMPLE LIVE CLASS & HOMEWORK NOTICES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        {/* Live Class Notice - Super Simple Language */}
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-primary block">
                Live Video Class • 4:00 PM
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-ink truncate mt-0.5">
                Math &amp; Logic Workshop
              </h3>
            </div>
          </div>

          <Link
            href="/dashboard/live"
            className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shrink-0 transition-transform active:scale-95"
          >
            Join Class
          </Link>
        </div>

        {/* Teacher Homework Notice - Super Simple Language */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-800 block">
                Teacher Checked Homework ⭐
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-ink truncate mt-0.5">
                Grade A+ (95%) • Great Job!
              </h3>
            </div>
          </div>

          <Link
            href="/dashboard/assignments"
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition-transform active:scale-95"
          >
            See Marks
          </Link>
        </div>

      </div>

      {/* 3. DAILY PRACTICE BAR (Simple Streak & Easy Dots) */}
      <div className="p-4 rounded-2xl bg-white border border-line shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Streak Flame */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shrink-0">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-ink">{streakCount} Days in a row!</span>
              <span className="text-xs text-amber-600 font-bold">🔥</span>
            </div>
            <p className="text-[11px] text-muted">Do 1 lesson today to keep your streak.</p>
          </div>
        </div>

        {/* 3 Simple Goals */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2.5 sm:pt-0 border-line">
          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-ink block">Today&apos;s Goal</span>
            <span className="text-[11px] text-muted">{dailyGoalCompleted} of {dailyGoalTarget} tasks done</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((step) => {
              const isDone = step <= dailyGoalCompleted;
              return (
                <div
                  key={step}
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    isDone 
                      ? 'bg-emerald-500 text-white shadow-2xs' 
                      : 'bg-canvas border border-line'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setWarmupOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-canvas hover:bg-slate-200/60 border border-line text-xs font-bold text-ink transition-colors cursor-pointer"
          >
            Quick 2-Min Quiz
          </button>
        </div>

      </div>

      {/* 4. MAIN LEARNING CARD + 2-MIN DAILY QUIZ */}
      <div className="grid gap-5 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-8">
          {currentCourse && <ContinueLearningCard course={currentCourse} />}
        </div>
        <div className="lg:col-span-4">
          <WarmupCard onStart={() => setWarmupOpen(true)} />
        </div>
      </div>

      {/* 5. AI HELPER - SIMPLE QUESTIONS */}
      <AIChatCard name={studentName} />

      {/* 6. SUBJECTS FOR THIS CLASS */}
      <section aria-labelledby="explore-title" className="pt-1">
        <div className="mb-3.5 flex items-end justify-between gap-4">
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

      {/* 7. SIMPLE BADGES (Stars & Medals) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-line shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-ink">Your Medals &amp; Stars</h3>
              <p className="text-[11px] text-muted">Stars you won by finishing lessons</p>
            </div>
          </div>
          <Link href="/dashboard/you" className="text-xs font-bold text-primary hover:underline">
            See all medals &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { title: "Math Star", desc: "Finished fractions", color: "bg-blue-50 text-blue-800 border-blue-200", icon: "📐" },
            { title: "5 Days Hero", desc: "Learned 5 days in a row", color: "bg-amber-50 text-amber-800 border-amber-200", icon: "🔥" },
            { title: "Science Star", desc: "Learned about plants", color: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: "🌱" },
            { title: "Computer Star", desc: "Made a code loop", color: "bg-purple-50 text-purple-800 border-purple-200", icon: "💻" },
          ].map((b, idx) => (
            <div key={idx} className={`p-3 rounded-xl border ${b.color} space-y-0.5`}>
              <div className="text-lg">{b.icon}</div>
              <h4 className="text-xs font-extrabold">{b.title}</h4>
              <p className="text-[10px] opacity-80">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <WarmupSession open={warmupOpen} onClose={closeWarmup} />
    </div>
  );
}
