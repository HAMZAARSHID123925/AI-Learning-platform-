import type { Course, CourseProgress, LessonProgress } from '@/types/student/learning';

export type LessonNodeState = 'completed' | 'current' | 'locked';

export function getCourseProgress(course: Course, lessons: Record<string, LessonProgress>): CourseProgress {
  const total = course.lessons.length;
  const completed = course.lessons.filter((l) => lessons[l.id]?.status === 'completed').length;
  const nextIndex = course.lessons.findIndex((l) => lessons[l.id]?.status !== 'completed');
  const nextLesson = nextIndex >= 0 ? course.lessons[nextIndex] : null;
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

export function getLessonState(course: Course, index: number, lessons: Record<string, LessonProgress>): LessonNodeState {
  const lesson = course.lessons[index];
  if (lessons[lesson.id]?.status === 'completed') return 'completed';
  const firstOpen = course.lessons.findIndex((l) => lessons[l.id]?.status !== 'completed');
  return index === firstOpen ? 'current' : 'locked';
}

export function isCourseComplete(course: Course, lessons: Record<string, LessonProgress>): boolean {
  return course.lessons.length > 0 && course.lessons.every((l) => lessons[l.id]?.status === 'completed');
}