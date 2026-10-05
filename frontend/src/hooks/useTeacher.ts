import { useMemo, useState, useEffect } from 'react';
import { useClasses } from '@/contexts/ClassesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { teachers as seedTeachers } from '@/data/admin';
import { courses as catalogCourses } from '@/data/courses';
import { timeToMinutes } from '@/utils/dates';
import { adminApi } from '@/utils/adminApi';
import type { Teacher, StudentRecord } from '@/types';

export function useTeacher() {
  const { classes } = useClasses();
  const { user } = useAuth();
  const { courses: adminCourses, students: adminStudents, teachers: adminTeachers } = useAdmin();
  const [realStudents, setRealStudents] = useState<StudentRecord[]>(adminStudents);

  useEffect(() => {
    adminApi.listUsers({ page_size: 100 })
      .then((data) => {
        if (data?.items && Array.isArray(data.items)) {
          const learners = data.items.filter((u: any) => !u.roles?.includes('Admin') && !u.roles?.includes('Instructor'));
          const mapped: StudentRecord[] = learners.map((u: any) => ({
            id: u.id,
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
            grade: (u.grade || 5) as any,
            courseIds: catalogCourses.filter((c) => c.grade === (u.grade || 5)).map((c) => c.id),
            progress: 45,
            avgScore: 78,
            weakAreas: ['Fractions word problems'],
            assessments: [],
            lastActive: 'Active today',
          }));
          if (mapped.length > 0) setRealStudents(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const activeTeachers = adminTeachers.length > 0 ? adminTeachers : seedTeachers;

  const teacher: Teacher = useMemo(() => {
    if (user) {
      const match = activeTeachers.find((t) => t.name.toLowerCase() === user.name.toLowerCase() || t.id.includes(user.name.toLowerCase()));
      if (match) return match;
      return {
        id: `t-${user.email.split('@')[0]}`,
        name: user.name || 'Mr Ahmed',
        subject: 'math',
        assignedCourseIds: ['g5-fractions', 'g5-geometry'],
        students: 0,
      };
    }
    return activeTeachers[0] || seedTeachers[0];
  }, [user, activeTeachers]);

  const effectiveCourseIds = useMemo(() => {
    // Check if courses assigned in adminContext
    const assignedInAdmin = adminCourses.filter((c) => c.teacherId === teacher.id).map((c) => c.id);
    if (assignedInAdmin.length > 0) return assignedInAdmin;
    // Default subject courses
    return catalogCourses.filter((c) => c.subject === teacher.subject && c.grade === 5).map((c) => c.id);
  }, [adminCourses, teacher]);

  const myCourses = useMemo(() => {
    const activeRoster = realStudents.length > 0 ? realStudents : adminStudents;

    return catalogCourses
      .filter((c) => effectiveCourseIds.includes(c.id) || effectiveCourseIds.includes(c.slug || ''))
      .sort((a, b) => b.grade - a.grade)
      .map((course) => {
        const roster = activeRoster.filter((s) => s.courseIds.includes(course.id) || s.grade === course.grade);
        const avg = (key: 'progress' | 'avgScore') =>
          roster.length ? Math.round(roster.reduce((n, s) => n + (s[key] || 0), 0) / roster.length) : 0;
        return {
          course,
          roster,
          enrolled: roster.length,
          avgProgress: avg('progress') || 40,
          avgScore: avg('avgScore') || 75,
          needSupport: roster.filter((s) => (s.avgScore || 0) < 70)
        };
      });
  }, [catalogCourses, effectiveCourseIds, realStudents, adminStudents]);

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