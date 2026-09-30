import type { SubjectStyle } from '@/utils/student/subjects';

export interface InteractionProps {
  solved: boolean;
  onSolved: () => void;
  tone: SubjectStyle;
}