export type Role = 'student' | 'teacher' | 'admin';
export type Grade = 1 | 2 | 3 | 4 | 5;
export type Subject = 'math' | 'science' | 'english' | 'computer';

export interface User {
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

export interface Student {
  name: string;
  grade: Grade;
  streakDays: number;
  skillsPracticed: number;
  currentCourseId: string;
}

export interface WeekDay {
  short: string;
  done: boolean;
  isToday: boolean;
}

export interface DayAverage {
  day: string;
  short: string;
  lessons: number;
}