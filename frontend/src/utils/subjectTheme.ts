import { SubjectId } from '../types/learning';

interface SubjectTheme {
  text: string;
  bar: string;
  softBg: string;
  hex: string;
  mid: string;
}

export const subjectTheme: Record<SubjectId, SubjectTheme> = {
  math: { text: 'text-math', bar: 'bg-math', softBg: 'bg-math-soft', hex: '#6D5AE6', mid: '#CFC8F8' },
  science: { text: 'text-science', bar: 'bg-science', softBg: 'bg-science-soft', hex: '#1F9D6B', mid: '#BDE5D2' },
  english: { text: 'text-english', bar: 'bg-english', softBg: 'bg-english-soft', hex: '#E0673A', mid: '#F6CDBC' },
  cs: { text: 'text-cs', bar: 'bg-cs', softBg: 'bg-cs-soft', hex: '#1A8BB5', mid: '#BEE0EE' }
};