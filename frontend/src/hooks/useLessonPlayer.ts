'use client';
import { useCallback, useMemo, useState } from 'react';
import type { LessonStep } from '@/types/learning';

export function useLessonPlayer(steps: LessonStep[], onProgress?: (percent: number) => void) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = steps[index];
  const totalQuestions = useMemo(() => steps.filter((s) => s.kind === 'question').length, [steps]);
  const isCorrect = step?.kind === 'question' && checked && selected === step.answer;

  const canContinue =
  step?.kind === 'concept' ? true : step?.kind === 'explore' ? solved : checked;

  const select = useCallback((i: number) => {
    if (!checked) setSelected(i);
  }, [checked]);

  const check = useCallback(() => {
    if (step?.kind !== 'question' || selected === null || checked) return;
    setChecked(true);
    if (selected === step.answer) setCorrect((c) => c + 1);
  }, [step, selected, checked]);

  const markSolved = useCallback(() => setSolved(true), []);

  const next = useCallback(() => {
    if (!canContinue) return;
    const done = index + 1;
    onProgress?.(Math.round(done / steps.length * 100));
    if (index === steps.length - 1) {
      setFinished(true);
      return;
    }
    setIndex(done);
    setSelected(null);
    setChecked(false);
    setSolved(false);
  }, [canContinue, index, steps.length, onProgress]);

  const restart = useCallback(() => {
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setSolved(false);
    setCorrect(0);
    setFinished(false);
  }, []);

  const progress = Math.round((index + (canContinue ? 1 : 0)) / steps.length * 100);

  return { step, index, selected, checked, solved, correct, totalQuestions, isCorrect, canContinue, finished, progress, select, check, markSolved, next, restart };
}