import type { BackendProfile, BackendCourseSummary } from '@/types/backend';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { adminApi } from '@/utils/adminApi';
import { courses as catalog } from '@/data/courses';
import type { AdminCourse, Grade, StudentRecord, Teacher, Subject } from '@/types';

interface AdminContextValue {
  courses: AdminCourse[];
  refreshCourses: () => Promise<void>;
  coursesError: string | null;
  students: StudentRecord[];
  teachers: Teacher[];
  courseTitle: (c: AdminCourse) => string;
  createCourse: (c: Omit<AdminCourse, 'id' | 'enrolled' | 'avgProgress'>) => void;
  assignTeacher: (courseId: string, teacherId: string | null) => void;
  toggleStatus: (courseId: string) => Promise<void>;
  addStudent: (name: string, grade: Grade) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: {children: React.ReactNode;}) {
  const { user } = useAuth();
  return <AdminIdentityProvider key={user?.id || 'signed-out'}>{children}</AdminIdentityProvider>;
}
function AdminIdentityProvider({ children }: {children: React.ReactNode;}) {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const { user } = useAuth();
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const refreshCourses = useCallback(async () => {
    try {
    const items = await adminApi.listAllCourses();
    setCourses(items.map((b: BackendCourseSummary) => ({
      id: b.id, title: b.title, grade: b.grade,
      subject: (['math','science','english','computer'].includes(b.slug?.split('-')[0]) ? b.slug.split('-')[0] : 'science') as Subject,
      enrolled: 0, teacherId: b.instructor_id, status: b.status, avgProgress: 0,
    })));
    setCoursesError(null);
    } catch (cause) {
      setCoursesError(cause instanceof Error ? cause.message : 'Could not load shared courses.');
      throw cause;
    }
  }, []);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Load real registered backend users and courses
  useEffect(() => {
    if (!user || user.role === 'student') return;
    import('@/utils/adminApi').then(({ adminApi }) => {
      // Fetch the complete shared list from the authenticated backend.
      void refreshCourses().catch(() => {});
      // 2. Fetch users
      adminApi.listUsers({ page_size: 100 })
        .then((data) => {
          if (data?.items && Array.isArray(data.items)) {
            const rawUsers = data.items;
            // Student records
            const studentUsers = rawUsers.filter((u: BackendProfile) => !u.roles?.includes('Admin') && !u.roles?.includes('Instructor'));
            const mappedStudents: StudentRecord[] = studentUsers.map((u: BackendProfile) => ({
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
            const teacherUsers = rawUsers.filter((u: BackendProfile) => u.roles?.includes('Instructor'));
            const defaultSubjects: Record<number, Subject> = { 0: 'math', 1: 'computer', 2: 'science', 3: 'english' };
            const mappedTeachers: Teacher[] = teacherUsers.map((t: BackendProfile, idx: number) => ({
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
  }, [user?.email, user?.role, refreshCourses]);

  const courseTitle = useCallback((c: AdminCourse) => c.title ?? catalog.find((k) => k.id === c.id)?.title ?? 'Untitled course', []);

  const createCourse = useCallback((c: Omit<AdminCourse, 'id' | 'enrolled' | 'avgProgress'>) => {
    setCourses((prev) => [{ ...c, id: `g${c.grade}-${c.subject}-${Date.now()}`, enrolled: 0, avgProgress: 0 }, ...prev]);
  }, []);


  const assignTeacher = useCallback((courseId: string, teacherId: string | null) => {
    setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, teacherId } : c));
  }, []);

  const toggleStatus = useCallback(async (courseId: string) => {
    const detail = await adminApi.getCourseDetail(courseId);
    if (detail.status === 'published') return;
    if (!detail.lessons.some(lesson => lesson.status === 'published')) throw new Error('Publish a lesson in the course builder first.');
    await adminApi.publishCourse(courseId);
    await refreshCourses();
  }, [refreshCourses]);

  const addStudent = useCallback((name: string, grade: Grade) => {
    const ids = catalog.filter((c) => c.grade === grade).map((c) => c.id);
    setStudents((prev) => [
    { id: `s-${Date.now()}`, name, grade, courseIds: ids, progress: 0, avgScore: 0, weakAreas: [], assessments: [], lastActive: 'Just joined' },
    ...prev]
    );
  }, []);

  const value = useMemo(
    () => ({ courses, students, teachers, courseTitle, createCourse, assignTeacher, toggleStatus, addStudent, refreshCourses, coursesError }),
    [courses, students, teachers, courseTitle, createCourse, assignTeacher, toggleStatus, addStudent, refreshCourses, coursesError]
  );
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}