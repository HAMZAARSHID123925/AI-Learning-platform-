import type { BackendProfile, BackendCourseSummary } from '@/types/backend';
import { useMemo } from 'react';
import { useClasses } from '@/contexts/ClassesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { courses as catalogCourses } from '@/data/courses';
import { timeToMinutes } from '@/utils/dates';
import type { Teacher, StudentRecord } from '@/types';

export function useTeacher() {
  const { classes } = useClasses();
  const { user } = useAuth();
  const { courses: adminCourses, students: adminStudents, teachers: adminTeachers } = useAdmin();

  const teacher: Teacher = useMemo(() => {
    if (user) {
      const match = adminTeachers.find(
        (t) => t.id === user.id || t.name.toLowerCase() === user.name.toLowerCase()
      );
      if (match) return match;
      return {
        id: user.id || 'current-teacher',
        name: user.name || 'Instructor',
        subject: 'math',
        assignedCourseIds: [],
        students: 0,
      };
    }
    return adminTeachers[0] || {
      id: 'default-teacher',
      name: 'Faculty Teacher',
      subject: 'math',
      assignedCourseIds: [],
      students: 0,
    };
  }, [user, adminTeachers]);

  const effectiveCourseIds = useMemo(() => {
    const assignedInAdmin = adminCourses.filter((c) => c.teacherId === teacher.id).map((c) => c.id);
    if (assignedInAdmin.length > 0) return assignedInAdmin;
    return catalogCourses.filter((c) => c.subject === teacher.subject && c.grade === 5).map((c) => c.id);
  }, [adminCourses, teacher]);

  const myCourses = useMemo(() => {
    return catalogCourses
      .filter((c) => effectiveCourseIds.includes(c.id) || effectiveCourseIds.includes(c.slug || ''))
      .sort((a, b) => b.grade - a.grade)
      .map((course) => {
        const roster = adminStudents.filter((s) => s.courseIds.includes(course.id) || s.grade === course.grade);
        const avg = (key: 'progress' | 'avgScore') =>
          roster.length ? Math.round(roster.reduce((n, s) => n + (s[key] || 0), 0) / roster.length) : 0;
        return {
          course,
          roster,
          enrolled: roster.length,
          avgProgress: avg('progress'),
          avgScore: avg('avgScore'),
          needSupport: roster.filter((s) => (s.avgScore || 0) < 70)
        };
      });
  }, [effectiveCourseIds, adminStudents]);

  const myClasses = useMemo(() => {
    const tName = (teacher.name || '').toLowerCase().trim();
    return classes
      .filter((c) => {
        const classTeacher = (c.teacher || '').toLowerCase().trim();
        const matchesTeacher = classTeacher === tName || classTeacher.includes(tName) || tName.includes(classTeacher);
        const matchesSubject = c.subject === teacher.subject;
        return (matchesTeacher || matchesSubject) && c.dayOffset >= 0;
      })
      .sort((a, b) => Number(!!b.isLive) - Number(!!a.isLive) || a.dayOffset - b.dayOffset || timeToMinutes(a.time) - timeToMinutes(b.time));
  }, [classes, teacher]);

  return { teacher, myCourses, myClasses };
}