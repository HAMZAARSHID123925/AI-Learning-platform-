import { Grade } from './learning';

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