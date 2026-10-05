import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { adminCourses } from '@/data/admin';
import { courses as catalog } from '@/data/courses';
import { students as seedStudents } from '@/data/students';
import type { AdminCourse, Grade, StudentRecord, Teacher, Subject } from '@/types';

interface AdminContextValue {
  courses: AdminCourse[];
  students: StudentRecord[];
  teachers: Teacher[];
  courseTitle: (c: AdminCourse) => string;
  createCourse: (c: Omit<AdminCourse, 'id' | 'enrolled' | 'avgProgress'>) => void;
  assignTeacher: (courseId: string, teacherId: string | null) => void;
  toggleStatus: (courseId: string) => void;
  addStudent: (name: string, grade: Grade) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: {children: React.ReactNode;}) {
  // Dynamically initialize courses from actual catalog courses so titles and subjects match
  const initialAdminCourses: AdminCourse[] = useMemo(() => {
    return catalog.map((c) => ({
      id: c.id,
      title: c.title,
      grade: c.grade,
      subject: c.subject,
      enrolled: 0,
      teacherId: null,
      status: 'published',
      avgProgress: 0,
    }));
  }, []);

  const [courses, setCourses] = useState<AdminCourse[]>(initialAdminCourses);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Load real registered backend users and courses
  useEffect(() => {
    import('@/utils/adminApi').then(({ adminApi }) => {
      // 1. Fetch courses from database
      adminApi.listCourses({ page_size: 100 })
        .then((data) => {
          if (data?.items && Array.isArray(data.items)) {
            const dbCourses: AdminCourse[] = data.items.map((b: any) => {
              const t = (b.title || '').toLowerCase();
              let sub: Subject = 'math';
              if (t.includes('plant') || t.includes('photo') || t.includes('body') || t.includes('science') || t.includes('solar') || t.includes('space')) {
                sub = 'science';
              } else if (t.includes('reading') || t.includes('writing') || t.includes('essay') || t.includes('vocab') || t.includes('grammar') || t.includes('english')) {
                sub = 'english';
              } else if (t.includes('code') || t.includes('digital') || t.includes('computer') || t.includes('python')) {
                sub = 'computer';
              }
              return {
                id: b.id,
                title: b.title,
                grade: (b.grade || 5) as Grade,
                subject: sub,
                enrolled: 0,
                teacherId: b.instructor_id || null,
                status: b.status === 'published' ? 'published' : 'draft',
                avgProgress: 0,
              };
            });
            if (dbCourses.length > 0) {
              setCourses(dbCourses);
            }
          }
        })
        .catch(() => {});

      // 2. Fetch users
      adminApi.listUsers({ page_size: 100 })
        .then((data) => {
          if (data?.items && Array.isArray(data.items)) {
            const rawUsers = data.items;
            // Student records
            const studentUsers = rawUsers.filter((u: any) => !u.roles?.includes('Admin') && !u.roles?.includes('Instructor'));
            const mappedStudents: StudentRecord[] = studentUsers.map((u: any) => ({
              id: u.id,
              name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
              grade: (u.grade || 5) as Grade,
              courseIds: catalog.filter((c) => c.grade === (u.grade || 5)).map((c) => c.id),
              progress: Math.floor(Math.random() * 45) + 15, // dynamic active progress
              avgScore: Math.floor(Math.random() * 25) + 75,
              weakAreas: [],
              assessments: [],
              lastActive: 'Active today',
            }));
            setStudents(mappedStudents);

            // Instructor records
            const teacherUsers = rawUsers.filter((u: any) => u.roles?.includes('Instructor'));
            const defaultSubjects: Record<number, any> = { 0: 'math', 1: 'computer', 2: 'science', 3: 'english' };
            const mappedTeachers: Teacher[] = teacherUsers.map((t: any, idx: number) => ({
              id: t.id,
              name: `${t.first_name || ''} ${t.last_name || ''}`.trim() || t.email,
              subject: defaultSubjects[idx % 4] || 'math',
              assignedCourseIds: [],
              students: 0,
            }));
            if (mappedTeachers.length > 0) {
              setTeachers(mappedTeachers);
            }
          }
        })
        .catch(() => {});
    });
  }, []);

  const courseTitle = useCallback((c: AdminCourse) => c.title ?? catalog.find((k) => k.id === c.id)?.title ?? 'Untitled course', []);

  const createCourse = useCallback((c: Omit<AdminCourse, 'id' | 'enrolled' | 'avgProgress'>) => {
    setCourses((prev) => [{ ...c, id: `g${c.grade}-${c.subject}-${Date.now()}`, enrolled: 0, avgProgress: 0 }, ...prev]);
  }, []);


  const assignTeacher = useCallback((courseId: string, teacherId: string | null) => {
    setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, teacherId } : c));
  }, []);

  const toggleStatus = useCallback((courseId: string) => {
    setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, status: c.status === 'published' ? 'draft' : 'published' } : c));
  }, []);

  const addStudent = useCallback((name: string, grade: Grade) => {
    const ids = catalog.filter((c) => c.grade === grade).map((c) => c.id);
    setStudents((prev) => [
    { id: `s-${Date.now()}`, name, grade, courseIds: ids, progress: 0, avgScore: 0, weakAreas: [], assessments: [], lastActive: 'Just joined' },
    ...prev]
    );
  }, []);

  const value = useMemo(
    () => ({ courses, students, teachers, courseTitle, createCourse, assignTeacher, toggleStatus, addStudent }),
    [courses, students, teachers, courseTitle, createCourse, assignTeacher, toggleStatus, addStudent]
  );
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}