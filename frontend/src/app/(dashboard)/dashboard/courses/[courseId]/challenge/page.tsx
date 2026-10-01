'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { ButtonLink } from '@/components/student/ButtonLink';
import { StateMessage } from '@/components/student/StateMessage';
import { ChallengeRunner } from '@/components/student/assessment/ChallengeRunner';
import { useAsync } from '@/hooks/useAsync';
import { learningApi } from '@/utils/learningApi';

export default function Challenge() {
  const params = useParams();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : (params.courseId || '');
  const q = useAsync(() => learningApi.getChallenge(courseId), [courseId]);

  if (q.loading) {
    return (
      <div className="min-h-screen w-full bg-white pt-24">
        <StateMessage kind="loading" title="Preparing your Challenge Test…" />
      </div>);

  }
  if (q.error || !q.data) {
    return (
      <div className="min-h-screen w-full bg-white px-5 pt-24">
        <StateMessage kind="error" message={q.error?.message} onRetry={q.reload} action={<ButtonLink href={`/dashboard/courses/${courseId}`} variant="secondary">Back to course</ButtonLink>} />
      </div>);

  }
  return <ChallengeRunner key={q.data.course.id} course={q.data.course} questions={q.data.questions} />;
}