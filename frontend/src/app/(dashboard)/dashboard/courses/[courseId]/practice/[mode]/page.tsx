'use client';
import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { RotateCcwIcon } from 'lucide-react';
import { Button } from '@/components/student/Button';
import { ButtonLink } from '@/components/student/ButtonLink';
import { StateMessage } from '@/components/student/StateMessage';
import { CompletionScreen } from '@/components/student/lesson/CompletionScreen';
import { LessonPlayer } from '@/components/student/lesson/LessonPlayer';
import { useProgress } from '@/contexts/student/ProgressContext';
import { useAsync } from '@/hooks/student/useAsync';
import { learningApi } from '@/utils/student/learningApi';
import type { PracticeMode } from '@/types/student/learning';

const modes: PracticeMode[] = ['skill', 'visual', 'challenge'];

export default function Practice() {
  const params = useParams();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : (params.courseId || '');
  const rawMode = Array.isArray(params.mode) ? params.mode[0] : (params.mode || '');
  const searchParams = useSearchParams();
  const skill = searchParams.get('skill') ?? undefined;
  const mode = modes.includes(rawMode as PracticeMode) ? rawMode as PracticeMode : null;
  const { markPracticeDone } = useProgress();
  const planPath = `/dashboard/courses/${courseId}/personalized`;

  const q = useAsync(
    () => mode ? learningApi.getPracticeSet(courseId, mode, skill) : Promise.reject(new Error('Unknown practice type.')),
    [courseId, mode, skill]
  );

  if (q.loading) {
    return (
      <div className="min-h-screen w-full bg-white pt-24">
        <StateMessage kind="loading" title="Picking your practice questions…" />
      </div>);

  }
  if (q.error || !q.data || !mode) {
    return (
      <div className="min-h-screen w-full bg-white px-5 pt-24">
        <StateMessage kind="error" message={q.error?.message} action={<ButtonLink href={planPath} variant="secondary">Back to my plan</ButtonLink>} />
      </div>);

  }

  const { course, title, steps } = q.data;
  const key = mode === 'skill' ? `skill:${skill}` : mode;

  return (
    <LessonPlayer
      key={`${mode}-${skill ?? ''}`}
      title={title}
      subtitle={course.title}
      subject={course.subject}
      steps={steps}
      exitTo={planPath}
      onComplete={() => markPracticeDone(course.id, key)}
      renderComplete={(score, restart) =>
      <CompletionScreen
        subject={course.subject}
        heading="Practice complete!"
        message={score.correct === score.total ? 'Perfect round — this skill is clicking.' : 'Nice work. Every round makes it stick a little more.'}
        score={score}
        xp={15}
        actions={
        <>
              <ButtonLink href={planPath} size="lg">Back to my plan</ButtonLink>
              <Button variant="secondary" size="lg" onClick={restart}>
                <RotateCcwIcon className="h-5 w-5" aria-hidden="true" /> Practice again
              </Button>
            </>
        } />

      } />);


}