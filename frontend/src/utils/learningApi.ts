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
import { fetchWithAuth } from '@/lib/api';
import { courses } from '@/data/courses';
import { mathLessons } from '@/data/lessons/mathLessons';
import { scienceLessons } from '@/data/lessons/scienceLessons';
import { englishLessons } from '@/data/lessons/englishLessons';
import { computerLessons } from '@/data/lessons/computerLessons';
import { mathChallenges } from '@/data/challenges/mathChallenges';
import { scienceChallenges } from '@/data/challenges/scienceChallenges';
import { englishChallenges } from '@/data/challenges/englishChallenges';
import { computerChallenges } from '@/data/challenges/computerChallenges';
import { analyzeAttempt, buildPlan, buildPracticeSteps, practiceTitle } from './assessment';
import { buildRecommendations } from './recommendations';
import type { Grade } from '@/types';
import type {
  AssessmentAttempt,
  ChallengeQuestion,
  Course,
  LearningAnalysis,
  LegacyCourseData,
  Lesson,
  LessonProgress,
  LessonStep,
  PersonalizedPlan,
  PracticeMode,
  Recommendation,
  RealAssessment,
  RealSubmissionAnswer,
  RealSubmissionResult,
  WeaknessFlag,
  VideoGenerationJob,
  RemediationPlan
} from '@/types/learning';

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

function findCourse(courseId: string): LegacyCourseData {
  const course = courses.find((c) => c.id === courseId);
  if (!course) throw new NotFoundError('We couldn’t find that course.');
  return course;
}

function courseSteps(course: LegacyCourseData): LessonStep[] {
  return course.lessons ? course.lessons.flatMap((l) => lessonContent.find((c) => c.lessonId === l.id)?.steps ?? []) : [];
}

function challengeFor(courseId: string): ChallengeQuestion[] {
  return challengeSets.find((s) => s.courseId === courseId)?.questions ?? [];
}

function mapLessonResponse(l: any, courseId: string, moduleId: string): Lesson {
  return {
    id: l.id,
    moduleId: l.module_id || moduleId,
    title: l.title,
    slug: l.slug,
    status: l.status,
    sequenceOrder: l.sequence_order,
    contentVersion: l.content_version,
    estimatedMinutes: l.estimated_minutes,
    videoUrl: l.video_url,
    thumbnailUrl: l.thumbnail_url,
    durationSeconds: l.duration_seconds,
    skillIds: l.skill_ids || [],
    publishedAt: l.published_at,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
    bodyMarkdown: l.body_markdown
  };
}

function mapCourseResponse(backendCourse: any): Course {
  const modules = backendCourse.modules ? backendCourse.modules.map((m: any) => ({
    id: m.id,
    courseId: m.course_id,
    title: m.title,
    description: m.description,
    sequenceOrder: m.sequence_order,
    lessonCount: m.lesson_count,
    createdAt: m.created_at,
    lessons: (m.lessons || []).map((l: any) => mapLessonResponse(l, backendCourse.id, m.id))
  })) : undefined;

  let allLessons: Lesson[] | undefined = undefined;
  if (modules) {
    allLessons = modules.flatMap((m: any) => m.lessons || []);
  }

  return {
    id: backendCourse.id,
    instructorId: backendCourse.instructor_id,
    title: backendCourse.title,
    slug: backendCourse.slug,
    description: backendCourse.description,
    status: backendCourse.status,
    grade: backendCourse.grade,
    thumbnailUrl: backendCourse.thumbnail_url,
    moduleCount: backendCourse.module_count || 0,
    createdAt: backendCourse.created_at,
    updatedAt: backendCourse.updated_at,
    modules,
    lessons: allLessons
  };
}

export const learningApi = {
  async listCourses(grade: Grade): Promise<Course[]> {
    const res = await fetchWithAuth(`/courses?grade=${grade}`);
    if (!res.ok) throw new Error('Failed to fetch learning paths');
    const data = await res.json();
    return (data.items || []).map(mapCourseResponse);
  },

  async getCourse(courseId: string): Promise<Course> {
    const res = await fetchWithAuth(`/courses/${courseId}`);
    if (res.status === 404) throw new NotFoundError('We couldn’t find that course.');
    if (!res.ok) throw new Error('Failed to load course details');
    const data = await res.json();
    return mapCourseResponse(data);
  },

  async getLesson(courseId: string, lessonId: string): Promise<{course: Course;lesson: Lesson;index: number;}> {
    const [course, res] = await Promise.all([
      learningApi.getCourse(courseId),
      fetchWithAuth(`/lessons/${lessonId}`)
    ]);
    
    if (res.status === 404) throw new NotFoundError('This lesson isn’t available yet.');
    if (!res.ok) throw new Error('Failed to load lesson details');
    
    const data = await res.json();
    const lesson = mapLessonResponse(data, courseId, data.module_id);
    const index = course.lessons ? course.lessons.findIndex((l) => l.id === lessonId) : 0;
    
    return { course, index: index >= 0 ? index : 0, lesson };
  },

  async getCompletedLessons(): Promise<string[]> {
    const res = await fetchWithAuth('/students/me/progress/lessons');
    if (!res.ok) throw new Error('Failed to load completed lessons');
    return res.json();
  },

  async getCourseProgress(courseId: string): Promise<{total_lessons: number; completed_lessons: number; percentage: number; locked_lessons: number; assessment_status: string; latest_submission_id?: string}> {
    const res = await fetchWithAuth(`/courses/${courseId}/progress`);
    if (!res.ok) throw new Error('Failed to load course progress');
    return res.json();
  },

  async completeLesson(lessonId: string, timeSpentSeconds: number = 0): Promise<void> {
    const res = await fetchWithAuth(`/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ time_spent_seconds: timeSpentSeconds })
    });
    if (!res.ok) throw new Error('Failed to mark lesson complete');
  },

  saveLessonProgress(_lessonId: string, _progress: LessonProgress): Promise<void> {
    // Legacy mock progress tracking - keeping as no-op for now
    return respond(() => undefined, 0);
  },

  getChallenge(courseId: string): Promise<{course: LegacyCourseData;questions: ChallengeQuestion[];}> {
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

  async getCourseAssessment(courseId: string): Promise<RealAssessment> {
    const res = await fetchWithAuth(`/courses/${courseId}/assessment`);
    if (res.status === 400 || res.status === 403) throw new Error('Course is not fully completed.');
    if (!res.ok) throw new Error('Failed to load assessment');
    const data = await res.json();
    return {
      id: data.id,
      courseId: data.course_id || courseId,
      title: data.title,
      questions: data.questions.map((q: any) => ({
        id: q.id,
        skillId: q.skill_id,
        questionType: q.question_type,
        prompt: q.prompt,
        options: q.options || [],
        maxScore: q.max_score
      }))
    };
  },

  async getTest(testId: string): Promise<RealAssessment> {
    const res = await fetchWithAuth(`/assessments/tests/${testId}`);
    if (!res.ok) throw new Error('Failed to load focused practice test');
    const data = await res.json();
    return {
      id: data.id,
      courseId: data.course_id || 'unknown',
      title: data.title,
      questions: data.questions.map((q: any) => ({
        id: q.id,
        skillId: q.skill_id,
        questionType: q.question_type,
        prompt: q.prompt,
        options: q.options || [],
        maxScore: q.max_score
      }))
    };
  },

  async submitRealAssessment(testId: string, answers: RealSubmissionAnswer[]): Promise<RealSubmissionResult> {
    const res = await fetchWithAuth(`/assessments/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
    if (!res.ok) throw new Error('Failed to submit assessment');
    return res.json();
  },

  async getRealSubmission(submissionId: string): Promise<RealSubmissionResult> {
    const res = await fetchWithAuth(`/submissions/${submissionId}`);
    if (!res.ok) throw new Error('Failed to load submission results');
    return res.json();
  },

  analyzeAssessment(attempt: AssessmentAttempt): Promise<{course: LegacyCourseData;questions: ChallengeQuestion[];analysis: LearningAnalysis;}> {
    return respond(() => {
      const course = findCourse(attempt.courseId);
      const questions = challengeFor(attempt.courseId);
      return { course, questions, analysis: analyzeAttempt(course, questions, attempt) };
    }, 1100);
  },

  getPersonalizedPlan(attempt: AssessmentAttempt): Promise<{course: LegacyCourseData;analysis: LearningAnalysis;plan: PersonalizedPlan;}> {
    return respond(() => {
      const course = findCourse(attempt.courseId);
      const questions = challengeFor(attempt.courseId);
      const analysis = analyzeAttempt(course, questions, attempt);
      return { course, analysis, plan: buildPlan(course, analysis, courseSteps(course), questions) };
    });
  },

  getPracticeSet(courseId: string, mode: PracticeMode, skill?: string): Promise<{course: LegacyCourseData;title: string;steps: LessonStep[];}> {
    return respond(() => {
      const course = findCourse(courseId);
      const steps = buildPracticeSteps(mode, skill, courseSteps(course), challengeFor(courseId));
      if (!steps.length) throw new NotFoundError('No practice questions are ready for this yet.');
      return { course, title: practiceTitle(mode, skill), steps };
    });
  },

  getRecommendations(grade: Grade, lessons: Record<string, LessonProgress>, attempts: AssessmentAttempt[]): Promise<Recommendation[]> {
    return respond(() => buildRecommendations(courses.filter((c) => c.grade === grade), lessons, attempts, challengeSets), 450);
  },

  async getActiveWeaknesses(): Promise<WeaknessFlag[]> {
    const res = await fetchWithAuth('/students/me/weakness-flags');
    if (!res.ok) throw new Error('Failed to load weaknesses');
    return res.json();
  },

  async createPersonalizedVideoJob(weaknessFlagId: string): Promise<VideoGenerationJob> {
    const res = await fetchWithAuth('/remediation/video-jobs', {
      method: 'POST',
      body: JSON.stringify({ weakness_flag_id: weaknessFlagId })
    });
    if (!res.ok) throw new Error('Failed to create video job');
    return res.json();
  },

  async getPersonalizedVideoJob(jobId: string): Promise<VideoGenerationJob> {
    const res = await fetchWithAuth(`/remediation/video-jobs/${jobId}`);
    if (!res.ok) throw new Error('Failed to fetch video job');
    return res.json();
  },

  async getRemediationPlans(): Promise<RemediationPlan[]> {
    const res = await fetchWithAuth('/students/me/remediation-plans');
    if (!res.ok) throw new Error('Failed to fetch remediation plans');
    return res.json();
  },

  async completeRemedialStudy(planId: string): Promise<{ message: string, retest_id?: string }> {
    const res = await fetchWithAuth(`/remediation-plans/${planId}/complete-study`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to complete study');
    return res.json();
  }
};