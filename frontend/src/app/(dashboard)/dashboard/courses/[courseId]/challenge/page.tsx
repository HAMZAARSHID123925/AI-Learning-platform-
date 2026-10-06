'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ButtonLink } from '@/components/student/ButtonLink';
import { StateMessage } from '@/components/student/StateMessage';
import { RealChallengeRunner } from '@/components/student/assessment/RealChallengeRunner';
import { useAsync } from '@/hooks/useAsync';
import { learningApi } from '@/utils/learningApi';
export default function Challenge() {
  const params = useParams();
  const courseId = String(params.courseId || '');
  const { user } = useAuth();
  const q = useAsync(async () => {
    const course = await learningApi.getCourse(courseId);
    const assessment = await learningApi.getCourseAssessment(courseId);
    if (assessment.questions.length !== 10 || assessment.questions.some(question => question.question_type !== 'mcq' || question.options?.length !== 4)) {
      throw new Error('The final assessment must contain exactly 10 multiple-choice questions.');
    }
    return { course, assessment };
  }, [courseId, user?.id]);
  if (q.loading) return <StateMessage kind="loading" title="Preparing your final assessment…" />;
  if (q.error || !q.data) return <StateMessage kind="error" message={q.error?.message} onRetry={q.reload}
    action={<ButtonLink href={`/dashboard/courses/${courseId}`}>Back to course</ButtonLink>} />;
  return <RealChallengeRunner key={q.data.assessment.id} course={q.data.course} assessment={q.data.assessment} />;
}
