import type { LessonProgress } from '@/types/learning';

/** Per signed-in identity: share a pending save and remember confirmed completion. */
export function createLessonCompletionSaver(persist: (id: string, progress: LessonProgress) => Promise<void>) {
  const saves = new Map<string, Promise<void>>();
  return (id: string, score: { correct: number; total: number }): Promise<void> => {
    const existing = saves.get(id);
    if (existing) return existing;
    const save = Promise.resolve().then(() => persist(id, { status: 'completed', progress: 100, score })).catch(error => {
      saves.delete(id);
      throw error;
    });
    saves.set(id, save);
    return save;
  };
}
