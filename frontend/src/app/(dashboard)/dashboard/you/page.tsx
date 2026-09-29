"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Users, ArrowUpRight, GraduationCap } from 'lucide-react';
import { ProfileHeader } from '@/components/you/ProfileHeader';
import { LearningOverview } from '@/components/you/LearningOverview';
import { CurrentCourse } from '@/components/you/CurrentCourse';
import { StreakCard } from '@/components/you/StreakCard';
import { ActivityChart } from '@/components/you/ActivityChart';
import { CourseProgressList } from '@/components/you/CourseProgressList';
import { useLearning } from '@/contexts/LearningContext';
import { dayAverages, student as defaultStudent, thisWeek } from '@/data/student';
import { getCourse, getCourseStatus, getMyCourses } from '@/utils/courses';

export default function YouPage() {
  const { grade } = useLearning();
  const [studentName, setStudentName] = useState(defaultStudent.name);
  const [streakDays, setStreakDays] = useState(defaultStudent.streakDays);

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
            setStreakDays(parsed.count);
          }
        }
      } catch (e) {
        // fallback
      }
    }
  }, []);

  const myCourses = getMyCourses();
  const currentCourse = getCourse(defaultStudent.currentCourseId);
  const completed = myCourses.filter((c) => getCourseStatus(c) === 'completed');
  const inProgress = myCourses.filter((c) => getCourseStatus(c) === 'in-progress');
  const mostActive = dayAverages.reduce((a, b) => (b.lessons > a.lessons ? b : a), dayAverages[0]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 md:px-8 md:py-10">
      <ProfileHeader name={studentName} grade={grade} />

      <LearningOverview
        completedCourses={completed}
        inProgressCount={inProgress.length}
        skillsPracticed={defaultStudent.skillsPracticed}
        streakDays={streakDays}
        mostActiveDay={mostActive.day}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">{currentCourse && <CurrentCourse course={currentCourse} />}</div>
        <div className="lg:col-span-5">
          <StreakCard days={streakDays} week={thisWeek} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <CourseProgressList courses={myCourses} />
        </div>
        <div className="lg:col-span-5">
          <ActivityChart days={dayAverages} />
        </div>
      </div>

      {/* Staff & Faculty Quick Access Portals */}
      <div className="rounded-3xl border border-line bg-white p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-ink tracking-tight">Staff &amp; Management Portals</h3>
            <p className="text-xs text-muted">Switch directly to faculty classroom studio or super-admin management</p>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-canvas border border-line text-xs font-bold text-muted">
            Internal Access
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <Link
            href="/instructor"
            className="group p-5 rounded-2xl border border-line bg-canvas hover:bg-emerald-50/50 hover:border-emerald-200 transition-all flex items-start justify-between"
          >
            <div className="space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-extrabold text-ink group-hover:text-emerald-800 transition-colors">Teacher &amp; Faculty Studio</h4>
              <p className="text-xs text-muted">Manage your enrolled students, curriculum lessons, and grade assignments.</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-subtle group-hover:text-emerald-700 transition-colors shrink-0" />
          </Link>

          <Link
            href="/admin"
            className="group p-5 rounded-2xl border border-line bg-canvas hover:bg-purple-50/50 hover:border-purple-200 transition-all flex items-start justify-between"
          >
            <div className="space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-extrabold text-ink group-hover:text-purple-800 transition-colors">Admin Control Center 👑</h4>
              <p className="text-xs text-muted">Supervise all teachers, students, course catalogs, and system telemetry.</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-subtle group-hover:text-purple-700 transition-colors shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
