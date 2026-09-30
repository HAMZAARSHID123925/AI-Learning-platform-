/**
 * ELARION learning API client.
 *
 * Every screen reads and writes learning data through this module only.
 * Today each method resolves from local mock data; to go live, replace the
 * body of each method with a fetch() to the matching endpoint — the
 * signatures (and therefore every component) stay the same.
 *
 *   Course API               → listCourses, getCourse, getLesson
 *   Student progress API     → saveLessonProgress
 *   Assessment API           → getChallenge, submitAssessment
 *   AI analysis API          → analyzeAssessment
 *   Personalized learning API→ getPersonalizedPlan, getPracticeSet, getRecommendations
 */
import { courses } from '@/data/student/courses';
import { mathLessons } from '@/data/student/lessons/mathLessons';
import { scienceLessons } from '@/data/student/lessons/scienceLessons';
import { englishLessons } from '@/data/student/lessons/englishLessons';
import { computerLessons } from '@/data/student/lessons/computerLessons';
import { mathChallenges } from '@/data/student/challenges/mathChallenges';
import { scienceChallenges } from '@/data/student/challenges/scienceChallenges';
import { englishChallenges } from '@/data/student/challenges/englishChallenges';
import { computerChallenges } from '@/data/student/challenges/computerChallenges';
import { analyzeAttempt, buildPlan, buildPracticeSteps, practiceTitle } from './assessment';
import { buildRecommendations } from './recommendations';
import type { Grade } from '@/types/student';
import type {
  AssessmentAttempt,
  ChallengeQuestion,
  Course,
  LearningAnalysis,
  Lesson,
  LessonProgress,
  LessonStep,
  PersonalizedPlan,
  PracticeMode,
  Recommendation } from
'@/types/student/learning';

const lessonContent = [...mathLessons, ...scienceLessons, ...englishLessons, ...computerLessons];
const challengeSets = [...mathChallenges, ...scienceChallenges, ...englishChallenges, ...computerChallenges];

export class NotFoundError extends Error {}

function respond<T>(produce: () => T, latency = 220): Promise<T> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      try {
        resolve(produce());
      } catch (err) {
        reject(err);
      }
    }, latency);
  });
}

function findCourse(courseId: string): Course {
  const course = courses.find((c) => c.id === courseId);
  if (!course) throw new NotFoundError('We couldn’t find that course.');
  return course;
}

function courseSteps(course: Course): LessonStep[] {
  return course.lessons.flatMap((l) => lessonContent.find((c) => c.lessonId === l.id)?.steps ?? []);
}

function challengeFor(courseId: string): ChallengeQuestion[] {
  return challengeSets.find((s) => s.courseId === courseId)?.questions ?? [];
}

export const learningApi = {
  listCourses(grade: Grade): Promise<Course[]> {
    return respond(() => courses.filter((c) => c.grade === grade));
  },

  getCourse(courseId: string): Promise<Course> {
    return respond(() => findCourse(courseId));
  },

  getLesson(courseId: string, lessonId: string): Promise<{course: Course;lesson: Lesson;index: number;}> {
    return respond(() => {
      const course = findCourse(courseId);
      const index = course.lessons.findIndex((l) => l.id === lessonId);
      const content = lessonContent.find((c) => c.lessonId === lessonId);
      if (index < 0 || !content) throw new NotFoundError('This lesson isn’t available yet.');
      return { course, index, lesson: { ...course.lessons[index], courseId, steps: content.steps } };
    });
  },

  saveLessonProgress(_lessonId: string, _progress: LessonProgress): Promise<void> {
    return respond(() => undefined, 0);
  },

  getChallenge(courseId: string): Promise<{course: Course;questions: ChallengeQuestion[];}> {
    return respond(() => {
      const course = findCourse(courseId);
      const questions = challengeFor(courseId);
      if (!questions.length) throw new NotFoundError('The Challenge Test for this course is coming soon.');
      return { course, questions };
    });
  },

  submitAssessment(attempt: AssessmentAttempt): Promise<AssessmentAttempt> {
    return respond(() => attempt, 300);
  },

  analyzeAssessment(attempt: AssessmentAttempt): Promise<{course: Course;questions: ChallengeQuestion[];analysis: LearningAnalysis;}> {
    return respond(() => {
      const course = findCourse(attempt.courseId);
      const questions = challengeFor(attempt.courseId);
      return { course, questions, analysis: analyzeAttempt(course, questions, attempt) };
    }, 1100);
  },

  getPersonalizedPlan(attempt: AssessmentAttempt): Promise<{course: Course;analysis: LearningAnalysis;plan: PersonalizedPlan;}> {
    return respond(() => {
      const course = findCourse(attempt.courseId);
      const questions = challengeFor(attempt.courseId);
      const analysis = analyzeAttempt(course, questions, attempt);
      return { course, analysis, plan: buildPlan(course, analysis, courseSteps(course), questions) };
    });
  },

  getPracticeSet(courseId: string, mode: PracticeMode, skill?: string): Promise<{course: Course;title: string;steps: LessonStep[];}> {
    return respond(() => {
      const course = findCourse(courseId);
      const steps = buildPracticeSteps(mode, skill, courseSteps(course), challengeFor(courseId));
      if (!steps.length) throw new NotFoundError('No practice questions are ready for this yet.');
      return { course, title: practiceTitle(mode, skill), steps };
    });
  },

  getRecommendations(grade: Grade, lessons: Record<string, LessonProgress>, attempts: AssessmentAttempt[]): Promise<Recommendation[]> {
    return respond(() => buildRecommendations(courses.filter((c) => c.grade === grade), lessons, attempts, challengeSets), 450);
  }
};