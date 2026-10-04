import type { Subject } from '@/types';

export interface SubjectItem {
  id: Subject | 'cs';
  name: string;
}

export const subjects: SubjectItem[] = [
{ id: 'math', name: 'Math' },
{ id: 'science', name: 'Science' },
{ id: 'english', name: 'English' },
{ id: 'cs', name: 'Computer Science' }];