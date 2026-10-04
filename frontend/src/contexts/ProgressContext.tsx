'use client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { progressSeed } from '@/data/progressSeed';
import { learningApi } from '@/utils/learningApi';
import { useAuth } from '@/contexts/AuthContext';
import type { AssessmentAttempt, LessonProgress } from '@/types/learning';

interface ProgressState {
  lessons: Record<string, LessonProgress>;
  attempts: AssessmentAttempt[];
  practiceDone: string[];
  xpEarned: number;
}

interface ProgressContextValue extends ProgressState {
  updateLessonProgress: (lessonId: string, progress: number) => void;
  completeLesson: (lessonId: string, score?: {correct: number;total: number;}) => void;
  recordAttempt: (attempt: AssessmentAttempt) => void;
  markPracticeDone: (courseId: string, key: string) => void;
  latestAttempt: (courseId: string) => AssessmentAttempt | undefined;
}

const STORAGE_KEY = 'elarion-progress-v2';
const initialState: ProgressState = { lessons: {}, attempts: [], practiceDone: [], xpEarned: 0 };

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: {children: React.ReactNode;}) {
  const [state, setState] = useState<ProgressState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProgressState;
        return { ...initialState, ...parsed, lessons: {} }; // Clear lessons from localStorage
      }
      return initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    // Only persist non-lesson state to local storage
    try {
      const stateToSave = { ...state, lessons: {} };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      /* storage unavailable */
    }
  }, [state]);

  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'Student') {
      learningApi.getCompletedLessons()
        .then(ids => {
          setState(s => {
            const newLessons = { ...s.lessons };
            ids.forEach(id => {
              newLessons[id] = { status: 'completed', progress: 100 };
            });
            return { ...s, lessons: newLessons };
          });
        })
        .catch(console.error);
    }
  }, [user]);

  const updateLessonProgress = useCallback((lessonId: string, progress: number) => {
    setState((s) => {
      const current = s.lessons[lessonId];
      if (current?.status === 'completed' || (current?.progress ?? 0) >= progress) return s;
      const next: LessonProgress = { status: 'in_progress', progress };
      void learningApi.saveLessonProgress(lessonId, next);
      return { ...s, lessons: { ...s.lessons, [lessonId]: next } };
    });
  }, []);

  const completeLesson = useCallback((lessonId: string, score?: {correct: number;total: number;}) => {
    const next: LessonProgress = { status: 'completed', progress: 100, score };
    
    // Optimistic update
    setState((s) => ({ 
      ...s, 
      xpEarned: s.xpEarned + 20 + (score?.correct ?? 0) * 10, 
      lessons: { ...s.lessons, [lessonId]: next } 
    }));

    // Call real backend
    learningApi.completeLesson(lessonId)
      .catch((err) => {
        console.error('Failed to mark lesson complete on backend:', err);
        // Rollback optimistic update
        setState((s) => {
          const newLessons = { ...s.lessons };
          delete newLessons[lessonId];
          return { ...s, lessons: newLessons };
        });
      });
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

  const value = useMemo(
    () => ({ ...state, updateLessonProgress, completeLesson, recordAttempt, markPracticeDone, latestAttempt }),
    [state, updateLessonProgress, completeLesson, recordAttempt, markPracticeDone, latestAttempt]
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}