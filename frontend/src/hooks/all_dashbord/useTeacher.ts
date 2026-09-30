'use client';

import { useMemo } from 'react';
import { useClasses } from '@/contexts/ClassesContext';
import { adminCourses, teachers } from '@/data/all_dashbord/admin';
import { courses } from '@/data/all_dashbord/courses';
import { students } from '@/data/all_dashbord/students';
import { timeToMinutes } from '@/utils/all_dashbord/dates';

const CURRENT_TEACHER_ID = 't-ahmed';

export function useTeacher() {
  const { classes } = useClasses();
  const teacher = teachers.find((t) => t.id === CURRENT_TEACHER_ID)!;

  const myCourses = useMemo(
    () =>
    courses.
    filter((c) => teacher.assignedCourseIds.includes(c.id)).
    sort((a, b) => b.grade - a.grade).
    map((course) => {
      const roster = students.filter((s) => s.courseIds.includes(course.id));
      const avg = (key: 'progress' | 'avgScore') => roster.length ? Math.round(roster.reduce((n, s) => n + s[key], 0) / roster.length) : 0;
      return {
        course,
        roster,
        enrolled: adminCourses.find((a) => a.id === course.id)?.enrolled ?? roster.length,
        avgProgress: avg('progress'),
        avgScore: avg('avgScore'),
        needSupport: roster.filter((s) => s.avgScore < 70)
      };
    }),
    [teacher]
  );

  const myClasses = useMemo(
    () =>
    classes.
    filter((c) => c.teacher === teacher.name && c.dayOffset >= 0).
    sort((a, b) => Number(!!b.isLive) - Number(!!a.isLive) || a.dayOffset - b.dayOffset || timeToMinutes(a.time) - timeToMinutes(b.time)),
    [classes, teacher]
  );

  return { teacher, myCourses, myClasses };
}