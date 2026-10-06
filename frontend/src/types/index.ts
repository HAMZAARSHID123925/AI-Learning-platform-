export type Role = 'student' | 'teacher' | 'admin';
export type Grade = 1 | 2 | 3 | 4 | 5;
export type Subject = 'math' | 'science' | 'english' | 'computer';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: Role;
  grade?: Grade;
}

export interface LiveClass {
  id: string;
  grade: Grade;
  subject: Subject;
  title: string;
  teacher: string;
  dayOffset: number;
  time: string;
  duration: number;
  isLive?: boolean;
  attendees?: number;
}

export interface WarmupQuestion {
  prompt: string;
  options: string[];
  answer: number;
}

export interface Assessment {
  title: string;
  score: number;
  total: number;
}

export interface StudentRecord {
  id: string;
  name: string;
  grade: Grade;
  courseIds: string[];
  progress: number;
  avgScore: number;
  weakAreas: string[];
  assessments: Assessment[];
  lastActive: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: Subject;
  assignedCourseIds: string[];
  students: number;
}

export interface AdminCourse {
  id: string;
  title?: string;
  grade: Grade;
  subject: Subject;
  enrolled: number;
  teacherId: string | null;
  status: 'published' | 'draft';
  avgProgress: number;
}

export type { Course, LessonSummary, Lesson, LessonProgress, CourseProgress } from './learning';