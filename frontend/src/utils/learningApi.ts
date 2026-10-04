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
  Lesson,
  LessonProgress,
  LessonStep,
  PersonalizedPlan,
  PracticeMode,
  Subject,
  Recommendation } from
'@/types/learning';

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

// ADAPTERS

function mapBackendCourseToFrontendCourse(b: any): Course {
  const t = (b.title || '').toLowerCase();
  let subject: Subject = 'computer';
  if (t.includes('math')) subject = 'math';
  else if (t.includes('science')) subject = 'science';
  else if (t.includes('english')) subject = 'english';

  return {
    id: b.id,
    grade: b.grade || 5,
    subject,
    title: b.title,
    description: b.description || '',
    image: b.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop',
    skills: ['core'], // simplified for now
    lessons: []
  };
}

function mapBackendCourseDetailToFrontendCourse(b: any): Course {
  const c = mapBackendCourseToFrontendCourse(b);
  c.modules = (b.modules || []).map((m: any) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    lessons: (m.lessons || []).map(mapBackendLessonSummary)
  }));
  c.lessons = c.modules!.flatMap(m => m.lessons);
  return c;
}

function mapBackendLessonSummary(l: any): import('@/types/learning').LessonSummary {
  return {
    id: l.id,
    title: l.title,
    minutes: l.estimated_minutes || 5,
    sequence_order: l.sequence_order,
    status: l.status,
    videoUrl: l.video_url,
    thumbnailUrl: l.thumbnail_url,
    durationSeconds: l.duration_seconds,
    bodyMarkdown: l.body_markdown
  };
}

function mapBackendLessonToFrontendLesson(l: any, courseId: string): Lesson {
  const summary = mapBackendLessonSummary(l);
  // Find static steps if they exist, otherwise empty
  const staticContent = lessonContent.find((c) => c.lessonId === l.id);
  return {
    ...summary,
    courseId,
    steps: staticContent?.steps || []
  };
}

function courseSteps(course: Course): LessonStep[] {
  return course.lessons.flatMap((l) => lessonContent.find((c) => c.lessonId === l.id)?.steps ?? []);
}

function challengeFor(courseId: string): ChallengeQuestion[] {
  return challengeSets.find((s) => s.courseId === courseId)?.questions ?? [];
}

export const learningApi = {
  async listCourses(grade: Grade): Promise<Course[]> {
    const res = await fetchWithAuth(`/courses?grade=${grade}&status_filter=published`);
    if (!res.ok) throw new Error('Failed to fetch courses');
    const data = await res.json();
    return data.items.map(mapBackendCourseToFrontendCourse);
  },

  async getCourse(courseId: string): Promise<Course> {
    const res = await fetchWithAuth(`/courses/${courseId}`);
    if (!res.ok) {
      if (res.status === 404) throw new NotFoundError('We couldn’t find that course.');
      throw new Error('Failed to fetch course');
    }
    const data = await res.json();
    return mapBackendCourseDetailToFrontendCourse(data);
  },

  async getLesson(courseId: string, lessonId: string): Promise<{course: Course;lesson: Lesson;index: number;}> {
    // 1. Fetch course to get the index and full context
    const course = await this.getCourse(courseId);
    
    // 2. Fetch the specific lesson details from backend
    const res = await fetchWithAuth(`/lessons/${lessonId}`);
    if (!res.ok) {
      if (res.status === 404) throw new NotFoundError('This lesson isn’t available yet.');
      throw new Error('Failed to fetch lesson');
    }
    const data = await res.json();
    
    const lesson = mapBackendLessonToFrontendLesson(data, courseId);
    const index = course.lessons.findIndex((l) => l.id === lessonId);
    
    return { course, lesson, index: index >= 0 ? index : 0 };
  },

  async saveLessonProgress(lessonId: string, progress: LessonProgress): Promise<void> {
    if (progress.status === 'completed') {
      await fetchWithAuth(`/lessons/${lessonId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ time_spent_seconds: 0 })
      });
    }
  },

  async getStudentProgress(): Promise<string[]> {
    const res = await fetchWithAuth(`/students/me/progress/lessons`);
    if (!res.ok) throw new Error('Failed to load progress');
    return res.json();
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
  },

  async getTest(testId: string): Promise<any> {
    const res = await fetchWithAuth(`/assessments/tests/${testId}`);
    if (!res.ok) throw new Error('Failed to fetch test');
    return res.json();
  },

  async submitRealAssessment(testId: string, payload: any[]): Promise<any> {
    const res = await fetchWithAuth(`/assessments/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers: payload }),
    });
    if (!res.ok) throw new Error('Failed to submit assessment');
    return res.json();
  },

  async getRealSubmission(submissionId: string): Promise<any> {
    const res = await fetchWithAuth(`/assessments/submissions/${submissionId}`);
    if (!res.ok) throw new Error('Failed to fetch submission');
    return res.json();
  },

  async getActiveWeaknesses(): Promise<any[]> {
    const res = await fetchWithAuth(`/students/me/weakness-flags`);
    if (!res.ok) throw new Error('Failed to fetch weakness flags');
    return res.json();
  },

  async requestPersonalizedVideo(weaknessFlagId: string): Promise<any> {
    const res = await fetchWithAuth(`/remediation/video-jobs`, {
      method: 'POST',
      body: JSON.stringify({ weakness_flag_id: weaknessFlagId })
    });
    if (!res.ok) throw new Error('Failed to create video job');
    return res.json();
  },

  async getPersonalizedVideoJob(jobId: string): Promise<any> {
    const res = await fetchWithAuth(`/remediation/video-jobs/${jobId}`);
    if (!res.ok) throw new Error('Failed to fetch video job');
    return res.json();
  },

  async getRemediationPlans(): Promise<any[]> {
    const res = await fetchWithAuth(`/students/me/remediation-plans`);
    if (!res.ok) throw new Error('Failed to fetch remediation plans');
    return res.json();
  },

  async completeRemedialStudy(planId: string): Promise<any> {
    const res = await fetchWithAuth(`/remediation-plans/${planId}/complete-study`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to complete remedial study');
    return res.json();
  }
};