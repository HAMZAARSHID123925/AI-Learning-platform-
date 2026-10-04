import type { Grade, Subject } from './index';

/* ---------- Visuals (static explanations) ---------- */

export type ShapeName = 'triangle' | 'square' | 'rectangle' | 'pentagon' | 'hexagon' | 'octagon' | 'circle' | 'rightAngle';

export type IconKey =
'sun' | 'water' | 'air' | 'leaf' | 'sprout' | 'rabbit' | 'bird' | 'fish' | 'snowflake' | 'tree' | 'flower' |
'heart' | 'brain' | 'bone' | 'food' | 'apple' | 'moon' | 'run' | 'keyboard' | 'cpu' | 'monitor' | 'wifi' |
'globe' | 'server' | 'laptop' | 'code' | 'repeat' | 'forward' | 'turn' | 'mouse' | 'app' | 'shield' | 'mountain' | 'waves';

export type Visual =
{type: 'pizza';slices: number;shaded: number;} |
{type: 'fractionBars';bars: {num: number;den: number;}[];} |
{type: 'decimalGrid';shaded: number;} |
{type: 'numberLine';min: number;max: number;step: number;labelAs?: 'decimal' | 'fraction' | 'integer';den?: number;marks?: number[];} |
{type: 'shapes';items: {shape: ShapeName;label?: string;}[];} |
{type: 'balance';left: string;right: string;} |
{type: 'flow';nodes: {icon: IconKey;label: string;}[];} |
{type: 'words';tokens: string[];highlight?: number[];} |
{type: 'passage';text: string;highlight?: string;};

/* ---------- Interactions (hands-on examples) ---------- */

export type Interaction =
{type: 'pizzaShade';slices: number;target: number;} |
{type: 'gridShade';target: number;} |
{type: 'numberLineSlide';min: number;max: number;step: number;target: number;labelAs?: 'decimal' | 'fraction' | 'integer';den?: number;} |
{type: 'balanceSolve';op: '+' | '×';a: number;b: number;max: number;} |
{type: 'flowReveal';nodes: {icon: IconKey;label: string;detail: string;}[];} |
{type: 'wordTap';tokens: string[];targets: number[];};

/* ---------- Lesson steps ---------- */

export interface ConceptStep {
  kind: 'concept';
  title: string;
  body: string;
  visual?: Visual;
}

export interface ExploreStep {
  kind: 'explore';
  title: string;
  prompt: string;
  interaction: Interaction;
  success: string;
}

export interface QuestionStep {
  kind: 'question';
  prompt: string;
  visual?: Visual;
  options: string[];
  answer: number;
  explanation: string;
  skill: string;
  level?: 'core' | 'stretch';
}

export type LessonStep = ConceptStep | ExploreStep | QuestionStep;

/* ---------- Real Backend Types ---------- */

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  status: string;
  sequenceOrder: number;
  contentVersion: number;
  estimatedMinutes?: number | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  skillIds: string[];
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Detail-only
  bodyMarkdown?: string | null;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  sequenceOrder: number;
  lessonCount: number;
  lessons?: Lesson[];
  createdAt: string;
}

export interface Course {
  id: string;
  instructorId: string;
  title: string;
  slug: string;
  description?: string | null;
  status: string;
  grade?: Grade | null;
  thumbnailUrl?: string | null;
  moduleCount: number;
  createdAt: string;
  updatedAt: string;
  // Detail-only
  modules?: CourseModule[];
  // Transformed field for UI mapping
  lessons?: Lesson[];
}

/* ---------- Legacy UI / Static Data Types ---------- */

export interface LegacyLessonSummary {
  id: string;
  title: string;
  minutes: number;
  status?: string;
  isChallenge?: boolean;
}

export interface LegacyCourseData {
  id: string;
  grade: Grade;
  subject: Subject;
  title: string;
  description: string;
  image: string;
  skills: string[];
  lessons: LegacyLessonSummary[];
  progress: number;
  completedLessons: number;
  lessonCount: number;
  lessonTitles?: string[];
  moduleTitles: string[];
}

export interface LessonContent {
  lessonId: string;
  steps: LessonStep[];
}

export interface LegacyLessonData extends LegacyLessonSummary {
  courseId: string;
  moduleId: string;
  bodyMarkdown?: string | null;
  steps: LessonStep[];
}

/* ---------- Progress ---------- */

export interface LessonProgress {
  status: 'in_progress' | 'completed';
  progress: number;
  score?: {correct: number;total: number;};
}

export interface CourseProgress {
  completed: number;
  total: number;
  percent: number;
  nextLesson: any | null;
  nextLessonNumber: number;
  nextLessonProgress: number;
  started: boolean;
  assessment_status?: string;
  latest_submission_id?: string;
}

/* ---------- Assessment ---------- */

export interface ChallengeQuestion extends QuestionStep {
  id: string;
}

export interface ChallengeSet {
  courseId: string;
  questions: ChallengeQuestion[];
}

export interface AssessmentAttempt {
  id: string;
  courseId: string;
  answers: (number | null)[];
  questionIds: string[];
  correct: number;
  total: number;
  submittedAt: string;
}

export interface SkillResult {
  skill: string;
  correct: number;
  total: number;
  percent: number;
  level: 'strong' | 'developing' | 'needs_work';
}

export interface RealQuestionOption {
  id: string;
  text: string;
}

export interface RealQuestion {
  id: string;
  skillId?: string;
  questionType: string;
  prompt: string;
  options: RealQuestionOption[];
  maxScore: number;
}

export interface RealAssessment {
  id: string;
  courseId: string;
  title: string;
  questions: RealQuestion[];
}

export interface RealSubmissionAnswer {
  question_id: string;
  selected_option_id?: string;
  text_answer?: string;
}

export interface SkillScoreResponse {
  id: string;
  skill_id: string;
  skill_name?: string;
  skill_slug?: string;
  score: number;
  max_score: number;
  grader_type: string;
  llm_feedback?: string;
}

export interface RealSubmissionResult {
  id: string;
  test_id: string;
  student_id: string;
  attempt_number: number;
  status: string;
  overall_score: number;
  submitted_at: string;
  graded_at?: string;
  skill_scores: SkillScoreResponse[];
}

export interface LearningAnalysis {
  attemptId: string;
  scorePercent: number;
  strong: SkillResult[];
  developing: SkillResult[];
  needsWork: SkillResult[];
  skills: SkillResult[];
  summary: string;
}

/* ---------- Personalized learning ---------- */

export type PracticeMode = 'skill' | 'visual' | 'challenge';

export interface PracticeItem {
  key: string;
  mode: PracticeMode;
  skill?: string;
  title: string;
  reason: string;
  questionCount: number;
}

export interface PersonalizedPlan {
  courseId: string;
  focusSkill: string | null;
  headline: string;
  items: PracticeItem[];
}

export interface Recommendation {
  id: string;
  subject: Subject;
  title: string;
  reason: string;
  cta: string;
  to: string;
}

export interface WeaknessFlag {
  id: string;
  student_id: string;
  skill_id: string;
  submission_id: string;
  score_at_flag: number;
  threshold: number;
  status: string;
}

export interface VideoGenerationJob {
  id: string;
  weakness_flag_id: string;
  status: string;
  title: string;
  target_duration_seconds: number;
  video_url?: string;
  thumbnail_url?: string;
  error_code?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface RemediationPlan {
  id: string;
  student_id: string;
  weakness_flag_id: string;
  status: string;
  remedial_course_title?: string;
  remedial_course_markdown?: string;
  study_completed: boolean;
  study_completed_at?: string;
  retest_attempt_count: number;
  instructor_escalated: boolean;
  created_at: string;
  completed_at?: string;
}