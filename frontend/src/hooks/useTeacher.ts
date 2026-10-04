'use client';

import { useMemo } from 'react';
import { useClasses } from '@/contexts/ClassesContext';
import { useAuth } from '@/contexts/AuthContext';
import { teachers as seedTeachers } from '@/data/admin';
import { courses } from '@/data/courses';
import { students } from '@/data/students';
import { timeToMinutes } from '@/utils/dates';
import type { Teacher } from '@/types';

export function useTeacher() {
  const { classes } = useClasses();
  const { user } = useAuth();

  const teacher: Teacher = useMemo(() => {
    if (user) {
      const match = seedTeachers.find((t) => t.name.toLowerCase() === user.name.toLowerCase());
      if (match) return match;
      return {
        id: `t-${user.email.split('@')[0]}`,
        name: user.name,
        subject: 'math',
        assignedCourseIds: ['g5-fractions', 'g5-decimals'],
        students: 0,
      };
    }
    return seedTeachers[0];
  }, [user]);


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
        enrolled: roster.length,
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