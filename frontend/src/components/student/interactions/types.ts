import type { SubjectStyle } from '@/utils/subjects';

export interface InteractionProps {
  solved: boolean;
  onSolved: () => void;
  tone: SubjectStyle;
}