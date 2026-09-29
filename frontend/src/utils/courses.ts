import { courses } from '../data/courses';
import { subjects } from '../data/subjects';
import { student } from '../data/student';
import { Course, CourseModule, CourseStatus, Grade, Lesson, LessonStatus, SubjectId } from '../types/learning';

export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function getCoursesForGrade(grade: Grade): Course[] {
  return courses.filter((c) => c.grade === grade);
}

export function getMyCourses(): Course[] {
  return courses.filter((c) => c.progress > 0 || c.grade === student.grade);
}

export function getCourseStatus(course: Course): CourseStatus {
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

export function sortByStatus(list: Course[]): Course[] {
  return [...list].sort((a, b) => statusOrder[getCourseStatus(a)] - statusOrder[getCourseStatus(b)]);
}

export function buildModules(course: Course): CourseModule[] {
  const regularCount = course.lessonCount - 1;
  const done = course.completedLessons;

  const statusFor = (n: number, isChallenge: boolean): LessonStatus => {
    if (n <= done) return 'completed';
    if (isChallenge) return done >= regularCount ? 'current' : 'locked';
    if (n === done + 1) return 'current';
    return 'upcoming';
  };

  const makeLesson = (n: number, isChallenge: boolean): Lesson => ({
    id: `${course.id}-l${n}`,
    number: n,
    title: isChallenge ? 'Final Challenge' : course.lessonTitles?.[n - 1] ?? `Lesson ${n}`,
    status: statusFor(n, isChallenge),
    isChallenge
  });

  const moduleCount = course.moduleTitles.length;
  const base = Math.floor(regularCount / moduleCount);
  const extra = regularCount % moduleCount;

  const modules: CourseModule[] = [];
  let next = 1;
  course.moduleTitles.forEach((title, i) => {
    const size = base + (i < extra ? 1 : 0);
    const lessons: Lesson[] = [];
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

export function getCurrentLesson(modules: CourseModule[]): Lesson | undefined {
  for (const m of modules) {
    const found = m.lessons.find((l) => l.status === 'current');
    if (found) return found;
  }
  return undefined;
}