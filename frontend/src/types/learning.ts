import type { Grade, Subject } from './index';

export type { Grade, Subject };
export type SubjectId = Subject;
export type CourseStatus = 'published' | 'draft' | 'archived';
export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  lessons: LessonSummary[];
}

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
export type LearningStep = LessonStep;

/* ---------- Courses & lessons ---------- */

export interface LessonSummary {
  skillIds?: string[];
  id: string;
  title: string;
  minutes: number;
  sequence_order?: number;
  status?: string;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  bodyMarkdown?: string | null;
}

export interface Course {
  status?: CourseStatus;
  id: string;
  slug?: string;
  grade: Grade;
  subject: Subject;
  title: string;
  description: string;
  image: string;
  skills: string[];
  lessons: LessonSummary[];
  modules?: CourseModule[];
}

export interface LessonContent {
  lessonId: string;
  steps: LessonStep[];
}

export interface Lesson extends LessonSummary {
  courseId: string;
  steps: LessonStep[];
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  bodyMarkdown?: string | null;
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
  nextLesson: LessonSummary | null;
  nextLessonNumber: number;
  nextLessonProgress: number;
  started: boolean;
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

export interface RealAssessmentOption {
  id: string;
  text: string;
}

export interface RealAssessmentQuestion {
  id: string;
  prompt: string;
  options: RealAssessmentOption[];
}

export interface RealAssessment {
  id: string;
  lessonId: string | null;
  courseId: string;
  title: string;
  isFocusedRetest: boolean;
  questions: RealAssessmentQuestion[];
}

export interface RealSubmission {
  id: string;
  testId: string;
  studentId: string;
  scorePercent: number;
  isPassed: boolean;
  feedbackSummary: string;
  createdAt?: string;
  answers?: {question_id: string;selected_option_id: string}[];
  weaknesses?: WeaknessFlag[];
}

export interface WeaknessFlag {
  id: string;
  skillId: string;
  skillName: string;
  severity: string;
  description: string;
}

export interface RemediationPlan {
  weakness_flag_id?: string;
  id: string;
  remedial_course_markdown: string;
}

export interface VideoGenerationJob {
  updated_at?: string | null;
  created_at?: string;
  started_at?: string | null;
  weakness_flag_id?: string;
  error_code?: string | null;
  id: string;
  status: string;
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
}

export interface LegacyCourseData {
  id: string;
  subject: Subject;
  grade: Grade;
  title: string;
  description: string;
  image: string;
  skills: string[];
  lessons: LessonSummary[];
}
