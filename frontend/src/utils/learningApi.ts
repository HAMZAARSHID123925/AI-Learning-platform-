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
import type { BackendAssessment, BackendSubmission, BackendWeakness, BackendRemediation, BackendCourse, BackendCourseSummary, BackendLesson, BackendEnrollment, BackendDashboard, BackendNotification, BackendLiveSession, BackendCourseProgress } from '@/types/backend';
import { courses } from '@/data/courses';
import { mathLessons } from '@/data/lessons/mathLessons';
import { scienceLessons } from '@/data/lessons/scienceLessons';
import { englishLessons } from '@/data/lessons/englishLessons';
import { computerLessons } from '@/data/lessons/computerLessons';
import { mathChallenges } from '@/data/challenges/mathChallenges';
import { scienceChallenges } from '@/data/challenges/scienceChallenges';
import { englishChallenges } from '@/data/challenges/englishChallenges';
import { computerChallenges } from '@/data/challenges/computerChallenges';
import { subjectImages } from '@/data/illustrations';
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
  Recommendation, VideoGenerationJob } from
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

function mapBackendCourseToFrontendCourse(b: BackendCourse): Course {
  const local = courses.find((c) => c.slug === b.slug || c.id === b.slug || c.title.toLowerCase() === (b.title || '').toLowerCase());
  
  const t = (b.title || '').toLowerCase();
  const s = (b.slug || '').toLowerCase();
  let subject: Subject = local?.subject || 'science';
  if (s.startsWith('math-') || t.includes('fraction') || t.includes('decimal') || t.includes('geometry') || t.includes('algebra') || t.includes('math') || s.includes('math')) {
    subject = 'math';
  } else if (s.startsWith('science-') || t.includes('plant') || t.includes('photo') || t.includes('body') || t.includes('solar') || t.includes('space') || t.includes('planet') || t.includes('science') || s.includes('science') || s.includes('space')) {
    subject = 'science';
  } else if (s.startsWith('english-') || t.includes('reading') || t.includes('writing') || t.includes('essay') || t.includes('vocab') || t.includes('grammar') || t.includes('english') || s.includes('english')) {
    subject = 'english';
  } else if (s.startsWith('computer-') || t.includes('code') || t.includes('digital') || t.includes('computer') || s.includes('computer')) {
    subject = 'computer';
  }

  return {
    id: b.id,
    slug: b.slug,
    grade: b.grade || 5,
    subject,
    title: b.title,
    description: b.description || local?.description || '',
    image: b.thumbnail_url || local?.image || subjectImages[subject] || subjectImages.math,
    skills: local?.skills || ['core'],
    lessons: []
  };
}

export function mapBackendCourseDetailToFrontendCourse(b: BackendCourse): Course {
  const c = mapBackendCourseToFrontendCourse(b);
  c.modules = (b.modules || []).map((m: NonNullable<BackendCourse["modules"]>[number]) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    lessons: (m.lessons || []).map(mapBackendLessonSummary)
  }));
  c.lessons = c.modules!.flatMap(m => m.lessons);
  return c;
}

function mapBackendLessonSummary(l: BackendLesson): import('@/types/learning').LessonSummary {
  return {
    id: l.id,
    title: l.title,
    minutes: l.estimated_minutes || 5,
    sequence_order: l.sequence_order,
    status: l.status,
    videoUrl: l.video_url,
    thumbnailUrl: l.thumbnail_url,
    durationSeconds: l.duration_seconds,
    skillIds: l.skill_ids || [],
    bodyMarkdown: l.body_markdown
  };
}

function mapBackendLessonToFrontendLesson(l: BackendLesson, courseId: string): Lesson {
  const summary = mapBackendLessonSummary(l);
  const staticContent = lessonContent.find((c) => c.lessonId === l.id);
  
  // If no hardcoded steps exist (newly created dynamic lesson), generate interactive steps from lesson title & content
  const steps: LessonStep[] = staticContent?.steps || [{
    kind: 'concept', title: l.title, body: l.body_markdown || 'No lesson notes available.'
  }];

  return {
    ...summary,
    courseId,
    steps
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
    const result: Course[] = [];
    let page = 1;
    while (true) {
      const res = await fetchWithAuth(`/courses?grade=${grade}&status_filter=published&page_size=100&page=${page}`);
      if (!res.ok) throw new Error('Could not load courses. Please retry.');
      const data = await res.json();
      const details = await Promise.all(data.items.map(async (item: BackendCourseSummary) => {
        const detail = await fetchWithAuth(`/courses/${item.id}`);
        if (!detail.ok) throw new Error('Could not load course details.');
        return mapBackendCourseDetailToFrontendCourse(await detail.json());
      }));
      result.push(...details.filter(c => Number(c.grade) === Number(grade)));
      if (page * 100 >= data.total || data.items.length === 0) return result;
      page += 1;
    }
  },

  async getCourse(courseId: string): Promise<Course> {
    const res = await fetchWithAuth(`/courses/${courseId}`);
    if (!res.ok) throw new Error('Course unavailable or access denied.');
    return mapBackendCourseDetailToFrontendCourse(await res.json());
  },

  async getLesson(courseId: string, lessonId: string): Promise<{course: Course;lesson: Lesson;index: number;}> {
    const course = await this.getCourse(courseId);
    const index = course.lessons.findIndex(l => l.id === lessonId);
    if (index < 0) throw new NotFoundError('Lesson does not belong to this course.');
    await this.enrollCourse(courseId);
    const res = await fetchWithAuth(`/lessons/${lessonId}`);
    if (!res.ok) throw new Error('Lesson unavailable or access denied.');
    return { course, lesson: mapBackendLessonToFrontendLesson(await res.json(), courseId), index };
  },

  async saveLessonProgress(lessonId: string, progress: LessonProgress): Promise<void> {
    if (progress.status !== 'completed') return;
    const res = await fetchWithAuth(`/lessons/${lessonId}/complete`, {
      method: 'POST', body: JSON.stringify({ time_spent_seconds: 0 })
    });
    if (!res.ok) throw new Error('Could not save completion. Please retry.');
  },

  async getStudentProgress(): Promise<string[]> {
    const res = await fetchWithAuth('/students/me/progress/lessons');
    if (!res.ok) throw new Error('Could not load saved progress.');
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

  async getTest(testId: string): Promise<BackendAssessment> {
    const res = await fetchWithAuth(`/assessments/tests/${testId}`);
    if (!res.ok) throw new Error('Failed to fetch test');
    return res.json();
  },

  async submitRealAssessment(testId: string, payload: {question_id: string;selected_option_id: string}[]): Promise<BackendSubmission> {
    const res = await fetchWithAuth(`/assessments/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers: payload }),
    });
    if (!res.ok) throw new Error('Failed to submit assessment');
    return res.json();
  },

  async getRealSubmission(submissionId: string): Promise<BackendSubmission> {
    const res = await fetchWithAuth(`/submissions/${submissionId}`);
    if (!res.ok) throw new Error('Failed to fetch submission');
    return res.json();
  },

  async getStudentDashboard(): Promise<BackendDashboard> {
    const res = await fetchWithAuth(`/students/me/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch student dashboard');
    return res.json();
  },

  async enrollCourse(courseId: string): Promise<BackendEnrollment> {
    const res = await fetchWithAuth(`/enrollments`, {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    });
    if (res.status === 409) {
      const existing = await this.getMyEnrollments();
      const match = existing.find(e => e.course_id === courseId);
      if (match) return match;
    }
    if (!res.ok) throw new Error('Failed to enroll in course');
    return res.json();
  },

  async getMyEnrollments(): Promise<BackendEnrollment[]> {
    const res = await fetchWithAuth(`/enrollments/me`);
    if (!res.ok) throw new Error('Failed to fetch enrollments');
    return res.json();
  },

  async listLiveSessions(courseId?: string): Promise<BackendLiveSession[]> {
    const url = courseId ? `/live-sessions?course_id=${courseId}` : `/live-sessions`;
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error('Failed to fetch live sessions');
    return res.json();
  },

  async joinLiveSession(sessionId: string): Promise<{room_url: string;token: string;is_host: boolean}> {
    const res = await fetchWithAuth(`/live-sessions/${sessionId}/join`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to join live session');
    return res.json();
  },

  async endLiveSession(sessionId: string): Promise<BackendLiveSession> {
    const res = await fetchWithAuth(`/live-sessions/${sessionId}/end`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to end live session');
    return res.json();
  },

  async getActiveWeaknesses(): Promise<BackendWeakness[]> {
    const res = await fetchWithAuth(`/students/me/weakness-flags`);
    if (!res.ok) throw new Error('Failed to fetch weakness flags');
    return res.json();
  },

  async requestPersonalizedVideo(weaknessFlagId: string, submissionId?: string): Promise<VideoGenerationJob> {
    const res = await fetchWithAuth(`/remediation/video-jobs`, {
      method: 'POST',
      body: JSON.stringify({ weakness_flag_id: weaknessFlagId, submission_id: submissionId })
    });
    if (!res.ok) throw new Error('Failed to create video job');
    return res.json();
  },

  async retryPersonalizedVideo(jobId: string): Promise<VideoGenerationJob> {
    const res = await fetchWithAuth('/remediation/video-jobs/' + jobId + '/retry', {method: 'POST'});
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(typeof body.detail === 'string' ? body.detail : 'Could not retry your lesson. Please try again.');
    }
    return res.json();
  },

  async getPersonalizedVideoJob(jobId: string): Promise<VideoGenerationJob> {
    const res = await fetchWithAuth(`/remediation/video-jobs/${jobId}`);
    if (!res.ok) throw new Error(`Failed to fetch video job (${res.status})`);
    return res.json();
  },

  async getRemediationPlans(): Promise<BackendRemediation[]> {
    const res = await fetchWithAuth(`/students/me/remediation-plans`);
    if (!res.ok) throw new Error('Failed to fetch remediation plans');
    return res.json();
  },

  async completeRemedialStudy(planId: string): Promise<{retest_id: string;message?: string}> {
    const res = await fetchWithAuth(`/remediation-plans/${planId}/complete-study`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to complete remedial study');
    return res.json();
  },

  // Module 4: Notifications & Events
  async listNotifications(unreadOnly = false, page = 1, pageSize = 20): Promise<{items: BackendNotification[];total: number;unread_count: number}> {
    const res = await fetchWithAuth(`/notifications?unread_only=${unreadOnly}&page=${page}&page_size=${pageSize}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(notificationId: string): Promise<BackendNotification> {
    const res = await fetchWithAuth(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to mark notification read');
    return res.json();
  },

  async markAllNotificationsRead(): Promise<{message: string}> {
    const res = await fetchWithAuth(`/notifications/read-all`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to mark all notifications read');
    return res.json();
  },

  async unenrollCourse(courseId: string): Promise<{message: string}> {
    const res = await fetchWithAuth(`/enrollments/${courseId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to unenroll');
    return res.json();
  },

  async getCourseProgressStats(courseId: string): Promise<BackendCourseProgress> {
    const res = await fetchWithAuth(`/courses/${courseId}/progress`);
    if (!res.ok) throw new Error('Failed to fetch course progress');
    return res.json();
  },

  async getLearningPath(): Promise<unknown[]> {
    const res = await fetchWithAuth(`/students/me/learning-path`);
    if (!res.ok) throw new Error('Failed to fetch learning path');
    return res.json();
  },

  // Module 5: Assessments & In-Lesson Quizzes
  async getCourseAssessment(courseId: string): Promise<BackendAssessment> {
    const res = await fetchWithAuth(`/courses/${courseId}/assessment`);
    if (!res.ok) throw new Error('Failed to fetch course assessment');
    return res.json();
  },

  async getLessonAssessment(lessonId: string): Promise<BackendAssessment> {
    const res = await fetchWithAuth(`/lessons/${lessonId}/assessment`);
    if (!res.ok) throw new Error('Failed to fetch lesson assessment');
    return res.json();
  },

  async generateAssessment(lessonId: string, questionCount = 5): Promise<BackendAssessment> {
    const res = await fetchWithAuth(`/assessments/generate`, {
      method: 'POST',
      body: JSON.stringify({ lesson_id: lessonId, question_count: questionCount }),
    });
    if (!res.ok) throw new Error('Failed to generate assessment');
    return res.json();
  },

  // Module 1: Password & Sessions
  async forgotPassword(email: string): Promise<{message: string}> {
    const res = await fetchWithAuth(`/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Failed to request password reset');
    return res.json();
  },

  async resetPassword(token: string, newPassword: string): Promise<{message: string}> {
    const res = await fetchWithAuth(`/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    if (!res.ok) throw new Error('Failed to reset password');
    return res.json();
  },

  async getActiveSessions(): Promise<unknown[]> {
    const res = await fetchWithAuth(`/auth/sessions`);
    if (!res.ok) throw new Error('Failed to fetch active sessions');
    return res.json();
  },

  async revokeOtherSessions(): Promise<{message: string}> {
    const res = await fetchWithAuth(`/auth/sessions/revoke-others`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to revoke other sessions');
    return res.json();
  },

  // Module 4: Staff student dashboard inspection
  async getStudentDashboardForStaff(studentId: string): Promise<BackendDashboard> {
    const res = await fetchWithAuth(`/students/${studentId}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch student dashboard');
    return res.json();
  },
};