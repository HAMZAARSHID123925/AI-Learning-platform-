import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { courses } from '@/data/courses';
import type { Grade } from '@/types';
const student = { courses: [], grade: 5 as Grade };
interface LearningContextValue {
  grade: Grade;
  setGrade: (grade: Grade) => void;
  warmupResults: boolean[];
  recordWarmupResult: (correct: boolean) => void;
  resetWarmup: () => void;
}

const LearningContext = createContext<LearningContextValue | null>(null);

export function LearningProvider({ children }: {children: React.ReactNode;}) {
  const [grade, setGradeState] = useState<Grade>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('student_grade');
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (parsed >= 1 && parsed <= 5) return parsed as Grade;
        }
      } catch (e) {}
    }
    return student.grade;
  });

  const setGrade = useCallback((newGrade: Grade) => {
    setGradeState(newGrade);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('student_grade', String(newGrade));
      } catch (e) {}
    }
  }, []);

  const [warmupResults, setWarmupResults] = useState<boolean[]>([]);

  const recordWarmupResult = useCallback((correct: boolean) => {
    setWarmupResults((prev) => [...prev, correct]);
  }, []);

  const resetWarmup = useCallback(() => setWarmupResults([]), []);

  const value = useMemo(
    () => ({ grade, setGrade, warmupResults, recordWarmupResult, resetWarmup }),
    [grade, warmupResults, recordWarmupResult, resetWarmup]
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning(): LearningContextValue {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error('useLearning must be used inside LearningProvider');
  return ctx;
}