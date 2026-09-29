import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { student } from '../data/student';
import { Grade } from '../types/learning';

interface LearningContextValue {
  grade: Grade;
  setGrade: (grade: Grade) => void;
  warmupResults: boolean[];
  recordWarmupResult: (correct: boolean) => void;
  resetWarmup: () => void;
}

const LearningContext = createContext<LearningContextValue | null>(null);

export function LearningProvider({ children }: {children: React.ReactNode;}) {
  const [grade, setGrade] = useState<Grade>(student.grade);
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