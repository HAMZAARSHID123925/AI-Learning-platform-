'use client';
import { useCallback, useMemo, useState } from 'react';
import type { ChallengeQuestion } from '@/types/learning';

export function useChallenge(questions: ChallengeQuestion[]) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [current, setCurrent] = useState(0);

  const answeredCount = useMemo(() => answers.filter((a) => a !== null).length, [answers]);
  const unanswered = questions.length - answeredCount;
  const isLast = current === questions.length - 1;

  const select = useCallback((option: number) => {
    setAnswers((prev) => prev.map((a, i) => i === current ? option : a));
  }, [current]);

  const goTo = useCallback((i: number) => setCurrent(Math.max(0, Math.min(questions.length - 1, i))), [questions.length]);
  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  return { answers, current, question: questions[current], answeredCount, unanswered, isLast, select, goTo, next, prev };
}