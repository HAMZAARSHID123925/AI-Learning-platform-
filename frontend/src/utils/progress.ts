import type { CourseProgress, LessonProgress } from '@/types/learning';

export type LessonNodeState = 'completed' | 'current' | 'locked';

interface ProgressCourse {
  lessons?: { id: string; title?: string }[];
}

export function getCourseProgress(course: ProgressCourse, lessons: Record<string, LessonProgress>): CourseProgress {
  const courseLessons = course.lessons || [];
  const total = courseLessons.length;
  const completed = courseLessons.filter((l) => lessons[l.id]?.status === 'completed').length;
  const nextIndex = courseLessons.findIndex((l) => lessons[l.id]?.status !== 'completed');
  const nextLesson = nextIndex >= 0 ? courseLessons[nextIndex] as any : null;
  const nextLessonProgress = nextLesson ? lessons[nextLesson.id]?.progress ?? 0 : 100;
  return {
    completed,
    total,
    percent: total ? Math.round(completed / total * 100) : 0,
    nextLesson,
    nextLessonNumber: nextIndex >= 0 ? nextIndex + 1 : total,
    nextLessonProgress,
    started: completed > 0 || nextLessonProgress > 0
  };
}

export function getLessonState(course: ProgressCourse, index: number, lessons: Record<string, LessonProgress>): LessonNodeState {
  const courseLessons = course.lessons || [];
  const lesson = courseLessons[index];
  if (!lesson) return 'locked';
  if (lessons[lesson.id]?.status === 'completed') return 'completed';
  const firstOpen = courseLessons.findIndex((l) => lessons[l.id]?.status !== 'completed');
  return index === firstOpen ? 'current' : 'locked';
}

export function isCourseComplete(course: ProgressCourse, lessons: Record<string, LessonProgress>): boolean {
  const courseLessons = course.lessons || [];
  return courseLessons.length > 0 && courseLessons.every((l) => lessons[l.id]?.status === 'completed');
}