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

/* ---------- Courses & lessons ---------- */

export interface LessonSummary {
  id: string;
  title: string;
  minutes: number;
}

export interface Course {
  id: string;
  grade: Grade;
  subject: Subject;
  title: string;
  description: string;
  image: string;
  skills: string[];
  lessons: LessonSummary[];
}

export interface LessonContent {
  lessonId: string;
  steps: LessonStep[];
}

export interface Lesson extends LessonSummary {
  courseId: string;
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