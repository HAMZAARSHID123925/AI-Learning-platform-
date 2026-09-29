"use client";

import React, { useEffect, useState } from 'react';
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
    </div>
  );
}
