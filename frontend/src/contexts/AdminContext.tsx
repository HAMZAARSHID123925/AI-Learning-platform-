'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { adminCourses } from '@/data/admin';
import { courses as catalog } from '@/data/courses';
import { students as seedStudents } from '@/data/students';
import type { AdminCourse, Grade, StudentRecord } from '@/types';

interface AdminContextValue {
  courses: AdminCourse[];
  students: StudentRecord[];
  courseTitle: (c: AdminCourse) => string;
  createCourse: (c: Omit<AdminCourse, 'id' | 'enrolled' | 'avgProgress'>) => void;
  assignTeacher: (courseId: string, teacherId: string | null) => void;
  toggleStatus: (courseId: string) => void;
  addStudent: (name: string, grade: Grade) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: {children: React.ReactNode;}) {
  const [courses, setCourses] = useState<AdminCourse[]>(adminCourses);
  const [students, setStudents] = useState<StudentRecord[]>(seedStudents);

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
    () => ({ courses, students, courseTitle, createCourse, assignTeacher, toggleStatus, addStudent }),
    [courses, students, courseTitle, createCourse, assignTeacher, toggleStatus, addStudent]
  );
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}