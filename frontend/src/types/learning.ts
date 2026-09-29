export type Grade = 1 | 2 | 3 | 4 | 5;

export type SubjectId = 'math' | 'science' | 'english' | 'cs';

export interface Subject {
  id: SubjectId;
  name: string;
}

export interface Course {
  id: string;
  title: string;
  subject: SubjectId;
  grade: Grade;
  /** Includes the final challenge as the last lesson */
  lessonCount: number;
  completedLessons: number;
  progress: number;
  moduleTitles: [string, string, string];
  lessonTitles?: string[];
}

export type CourseStatus = 'in-progress' | 'completed' | 'not-started';

export type LessonStatus = 'completed' | 'current' | 'upcoming' | 'locked';

export interface Lesson {
  id: string;
  number: number;
  title: string;
  status: LessonStatus;
  isChallenge: boolean;
}

export interface CourseModule {
  id: string;
  label: string;
  title: string;
  lessons: Lesson[];
  isFinal: boolean;
}

export type IconKey =
'sun' |
'droplets' |
'leaf' |
'sprout' |
'paw' |
'keyboard' |
'mouse' |
'monitor' |
'book';

export type ShapeKind = 'circle' | 'square' | 'triangle';

export type ProblemVisualData =
{type: 'pie';parts: number;filled: number;} |
{type: 'bar';parts: number;filled: number;} |
{type: 'dots';rows: number;cols: number;} |
{type: 'pattern';items: ShapeKind[];} |
{type: 'word';text: string;} |
{type: 'icon';icon: IconKey;};

export interface QuestionStepData {
  kind: 'question';
  id: string;
  prompt: string;
  visual?: ProblemVisualData;
  options: string[];
  answer: number;
  explanation: string;
}

export interface ExplainStepData {
  kind: 'explain';
  id: string;
  text: string;
  visual: ProblemVisualData;
}

export type LearningStep = QuestionStepData | ExplainStepData;