'use client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { progressSeed } from '@/data/progressSeed';
import { learningApi } from '@/utils/learningApi';
import type { AssessmentAttempt, LessonProgress } from '@/types/learning';

interface ProgressState {
  lessons: Record<string, LessonProgress>;
  attempts: AssessmentAttempt[];
  practiceDone: string[];
  xpEarned: number;
}

interface ProgressContextValue extends ProgressState {
  updateLessonProgress: (lessonId: string, progress: number) => void;
  completeLesson: (lessonId: string, score: {correct: number;total: number;}) => void;
  recordAttempt: (attempt: AssessmentAttempt) => void;
  markPracticeDone: (courseId: string, key: string) => void;
  latestAttempt: (courseId: string) => AssessmentAttempt | undefined;
  resetProgress: () => void;
}

const STORAGE_KEY = 'elarion-progress-v2';
const emptyState: ProgressState = { lessons: {}, attempts: [], practiceDone: [], xpEarned: 0 };
const initialState: ProgressState = { lessons: progressSeed.lessons, attempts: [], practiceDone: [], xpEarned: 0 };

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: {children: React.ReactNode;}) {
  const [state, setState] = useState<ProgressState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...initialState, ...(JSON.parse(raw) as ProgressState) } : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {

      /* storage unavailable */}
  }, [state]);

  const updateLessonProgress = useCallback((lessonId: string, progress: number) => {
    setState((s) => {
      const current = s.lessons[lessonId];
      if (current?.status === 'completed' || (current?.progress ?? 0) >= progress) return s;
      const next: LessonProgress = { status: 'in_progress', progress };
      void learningApi.saveLessonProgress(lessonId, next);
      return { ...s, lessons: { ...s.lessons, [lessonId]: next } };
    });
  }, []);

  const completeLesson = useCallback((lessonId: string, score: {correct: number;total: number;}) => {
    const next: LessonProgress = { status: 'completed', progress: 100, score };
    void learningApi.saveLessonProgress(lessonId, next);
    setState((s) => ({ ...s, xpEarned: s.xpEarned + 20 + score.correct * 10, lessons: { ...s.lessons, [lessonId]: next } }));
  }, []);

  const recordAttempt = useCallback((attempt: AssessmentAttempt) => {
    setState((s) => ({
      ...s,
      xpEarned: s.xpEarned + attempt.correct * 10,
      attempts: [...s.attempts, attempt],
      practiceDone: s.practiceDone.filter((k) => !k.startsWith(`${attempt.courseId}:`))
    }));
  }, []);

  const markPracticeDone = useCallback((courseId: string, key: string) => {
    setState((s) => {
      const id = `${courseId}:${key}`;
      return s.practiceDone.includes(id) ? s : { ...s, xpEarned: s.xpEarned + 15, practiceDone: [...s.practiceDone, id] };
    });
  }, []);

  const latestAttempt = useCallback(
    (courseId: string) =>
    [...state.attempts].filter((a) => a.courseId === courseId).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0],
    [state.attempts]
  );

  const resetProgress = useCallback(() => {
    setState(emptyState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyState));
    } catch {}
  }, []);

  const value = useMemo(
    () => ({ ...state, updateLessonProgress, completeLesson, recordAttempt, markPracticeDone, latestAttempt, resetProgress }),
    [state, updateLessonProgress, completeLesson, recordAttempt, markPracticeDone, latestAttempt, resetProgress]
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}