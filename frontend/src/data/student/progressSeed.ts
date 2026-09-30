import type { LessonProgress } from '@/types/student/learning';

/** Starting progress for the demo student. Replace with the Student Progress API response. */
export const progressSeed: {lessons: Record<string, LessonProgress>;} = {
  lessons: {
    'fr-1': { status: 'completed', progress: 100, score: { correct: 2, total: 2 } },
    'fr-2': { status: 'completed', progress: 100, score: { correct: 1, total: 2 } },
    'fr-3': { status: 'completed', progress: 100, score: { correct: 3, total: 3 } },
    'fr-4': { status: 'in_progress', progress: 40 },
    'dec-1': { status: 'completed', progress: 100, score: { correct: 2, total: 2 } },
    'dec-2': { status: 'in_progress', progress: 30 },
    'pa-1': { status: 'completed', progress: 100, score: { correct: 2, total: 2 } },
    'pa-2': { status: 'in_progress', progress: 50 },
    'rd-1': { status: 'in_progress', progress: 20 },
    'db-1': { status: 'completed', progress: 100, score: { correct: 2, total: 2 } },
    'db-2': { status: 'in_progress', progress: 30 }
  }
};