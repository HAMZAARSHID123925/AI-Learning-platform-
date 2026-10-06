'use client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createLessonCompletionSaver } from '@/lib/lesson-completion';
import { learningApi } from '@/utils/learningApi';
import { useAuth } from './AuthContext';
import type { AssessmentAttempt, LessonProgress } from '@/types/learning';
interface ProgressState { lessons: Record<string, LessonProgress>; attempts: AssessmentAttempt[]; practiceDone: string[]; xpEarned: number; }
interface ProgressContextValue extends ProgressState {
  updateLessonProgress: (lessonId: string, progress: number) => void;
  completeLesson: (lessonId: string, score: {correct: number; total: number}) => Promise<void>;
  recordAttempt: (attempt: AssessmentAttempt) => void;
  markPracticeDone: (courseId: string, key: string) => void;
  latestAttempt: (courseId: string) => AssessmentAttempt | undefined;
  resetProgress: () => void;
}
const emptyState: ProgressState = { lessons: {}, attempts: [], practiceDone: [], xpEarned: 0 };
const Context = createContext<ProgressContextValue | null>(null);
export function ProgressProvider({ children }: {children: React.ReactNode}) {
  const { user } = useAuth();
  return <ProgressIdentityProvider key={user?.id || 'signed-out'}>{children}</ProgressIdentityProvider>;
}
function ProgressIdentityProvider({ children }: {children: React.ReactNode}) {
  const { user } = useAuth();
  const [saveCompletion] = useState(() => createLessonCompletionSaver((id, progress) => learningApi.saveLessonProgress(id, progress)));
  const [state, setState] = useState<ProgressState>(emptyState);
  useEffect(() => {
    let active = true;
    if (user?.role === 'student') learningApi.getStudentProgress().then(ids => {
      if (active) setState(s => ({ ...s, lessons: {...s.lessons, ...Object.fromEntries(ids.map(id => [id, {status: 'completed', progress: 100}]))} }));
    }).catch(() => {});
    return () => { active = false; };
  }, [user?.id, user?.email, user?.role]);
  const updateLessonProgress = useCallback((id: string, progress: number) => {
    setState(s => s.lessons[id]?.status === 'completed' ? s : ({...s, lessons: {...s.lessons, [id]: {status: 'in_progress', progress}}}));
  }, []);
  const completeLesson = useCallback(async (id: string, score: {correct: number; total: number}) => {
    await saveCompletion(id, score);
    setState(s => ({ ...s, lessons: {...s.lessons, [id]: {status: 'completed', progress: 100, score}} }));
  }, [saveCompletion]);
  const recordAttempt = useCallback((a: AssessmentAttempt) => setState(s => ({...s, attempts: [...s.attempts, a]})), []);
  const markPracticeDone = useCallback((id: string, key: string) => setState(s => ({...s, practiceDone: [...s.practiceDone, `${id}:${key}`]})), []);
  const latestAttempt = useCallback((id: string) => state.attempts.filter(a => a.courseId === id).at(-1), [state.attempts]);
  const resetProgress = useCallback(() => setState(emptyState), []);
  const value = useMemo(() => ({...state, updateLessonProgress, completeLesson, recordAttempt, markPracticeDone, latestAttempt, resetProgress}), [state, updateLessonProgress, completeLesson, recordAttempt, markPracticeDone, latestAttempt, resetProgress]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useProgress() {
  const context = useContext(Context);
  if (!context) throw new Error('useProgress must be used inside ProgressProvider');
  return context;
}
