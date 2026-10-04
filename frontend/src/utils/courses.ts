import { courses } from '../data/courses';
import { subjects } from '../data/subjects';
import { student } from '../data/student';
import type { LegacyCourseData, LegacyLessonData } from '../types/learning';
import type { Grade, Subject } from '../types';

export type SubjectId = Subject;
export type CourseStatus = 'completed' | 'not-started' | 'in-progress';
export type LessonStatus = 'completed' | 'current' | 'upcoming' | 'locked';

export interface LegacyCourseModule {
  id: string;
  label: string;
  title: string;
  lessons: LegacyLessonData[];
  isFinal: boolean;
}

export function getCourse(id: string): LegacyCourseData | undefined {
  return courses.find((c) => c.id === id);
}

export function getCoursesForGrade(grade: Grade): LegacyCourseData[] {
  return courses.filter((c) => c.grade === grade);
}

export function getMyCourses(): LegacyCourseData[] {
  return courses.filter((c) => c.progress > 0 || c.grade === student.grade);
}

export function getCourseStatus(course: LegacyCourseData): CourseStatus {
  if (course.progress >= 100) return 'completed';
  if (course.progress <= 0) return 'not-started';
  return 'in-progress';
}

export function getActionLabel(status: CourseStatus): string {
  if (status === 'completed') return 'Review';
  if (status === 'not-started') return 'Start';
  return 'Continue';
}

export function getSubjectName(id: SubjectId): string {
  return subjects.find((s) => s.id === id)?.name ?? id;
}

const statusOrder: Record<CourseStatus, number> = { 'in-progress': 0, 'not-started': 1, completed: 2 };

export function sortByStatus(list: LegacyCourseData[]): LegacyCourseData[] {
  return [...list].sort((a, b) => statusOrder[getCourseStatus(a)] - statusOrder[getCourseStatus(b)]);
}

export function buildModules(course: LegacyCourseData): LegacyCourseModule[] {
  const regularCount = course.lessonCount - 1;
  const done = course.completedLessons;

  const statusFor = (n: number, isChallenge: boolean): LessonStatus => {
    if (n <= done) return 'completed';
    if (isChallenge) return done >= regularCount ? 'current' : 'locked';
    if (n === done + 1) return 'current';
    return 'upcoming';
  };

  const makeLesson = (n: number, isChallenge: boolean): any => ({
    id: `${course.id}-l${n}`,
    number: n,
    title: isChallenge ? 'Final Challenge' : course.lessonTitles?.[n - 1] ?? `Lesson ${n}`,
    status: statusFor(n, isChallenge),
    isChallenge
  });

  const moduleCount = course.moduleTitles.length;
  const base = Math.floor(regularCount / moduleCount);
  const extra = regularCount % moduleCount;

  const modules: LegacyCourseModule[] = [];
  let next = 1;
  course.moduleTitles.forEach((title, i) => {
    const size = base + (i < extra ? 1 : 0);
    const lessons: any[] = [];
    for (let k = 0; k < size; k++) lessons.push(makeLesson(next++, false));
    modules.push({ id: `${course.id}-m${i + 1}`, label: `Module ${i + 1}`, title, lessons, isFinal: false });
  });

  modules.push({
    id: `${course.id}-final`,
    label: 'Final',
    title: 'Final Challenge',
    lessons: [makeLesson(course.lessonCount, true)],
    isFinal: true
  });

  return modules;
}

export function getCurrentLesson(modules: LegacyCourseModule[]): any | undefined {
  for (const m of modules) {
    const found = m.lessons.find((l: any) => l.status === 'current');
    if (found) return found;
  }
  return undefined;
}