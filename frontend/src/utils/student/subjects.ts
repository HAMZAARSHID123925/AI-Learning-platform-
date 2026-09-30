import { BookOpenTextIcon, LeafIcon, MonitorIcon, SigmaIcon, type LucideIcon } from 'lucide-react';
import type { Grade, Subject } from '@/types/student';

export interface SubjectStyle {
  label: string;
  bg: string;
  soft: string;
  text: string;
  solid: string;
  border: string;
  ring: string;
  hex: string;
  softHex: string;
  icon: LucideIcon;
}

export const subjectStyles: Record<Subject, SubjectStyle> = {
  math: { label: 'Mathematics', bg: 'bg-math-50', soft: 'bg-math-100', text: 'text-math-700', solid: 'bg-math-500', border: 'border-math-100', ring: 'ring-math-100', hex: '#F5A300', softHex: '#FFE8B0', icon: SigmaIcon },
  science: { label: 'Science', bg: 'bg-science-50', soft: 'bg-science-100', text: 'text-science-700', solid: 'bg-science-500', border: 'border-science-100', ring: 'ring-science-100', hex: '#1FA971', softHex: '#BDEBD7', icon: LeafIcon },
  english: { label: 'English', bg: 'bg-english-50', soft: 'bg-english-100', text: 'text-english-700', solid: 'bg-english-500', border: 'border-english-100', ring: 'ring-english-100', hex: '#F2604C', softHex: '#FFD0C7', icon: BookOpenTextIcon },
  computer: { label: 'Computer Science', bg: 'bg-computer-50', soft: 'bg-computer-100', text: 'text-computer-700', solid: 'bg-computer-500', border: 'border-computer-100', ring: 'ring-computer-100', hex: '#7A5CF5', softHex: '#D9D0FF', icon: MonitorIcon }
};

export const subjectOrder: Subject[] = ['math', 'science', 'english', 'computer'];

export function courseName(grade: Grade, subject: Subject): string {
  return `Grade ${grade} ${subjectStyles[subject].label}`;
}

export function initials(name: string): string {
  return name.
  replace(/^(Mr|Ms|Mrs)\s+/, '').
  split(' ').
  map((p) => p[0]).
  join('').
  slice(0, 2).
  toUpperCase();
}