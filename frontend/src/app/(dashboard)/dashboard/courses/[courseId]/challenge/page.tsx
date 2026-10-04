'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { ButtonLink } from '@/components/student/ButtonLink';
import { StateMessage } from '@/components/student/StateMessage';
import { RealChallengeRunner } from '@/components/student/assessment/RealChallengeRunner';
import { useAsync } from '@/hooks/useAsync';
import { learningApi } from '@/utils/learningApi';

export default function Challenge() {
  const params = useParams();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : (params.courseId || '');
  
  const q = useAsync(async () => {
    const [course, assessment] = await Promise.all([
      learningApi.getCourse(courseId),
      learningApi.getCourseAssessment(courseId)
    ]);
    return { course, assessment };
  }, [courseId]);

  if (q.loading) {
    return (
      <div className="min-h-screen w-full bg-white pt-24">
        <StateMessage kind="loading" title="Preparing your Final Assessment…" />
      </div>
    );
  }
  if (q.error || !q.data) {
    return (
      <div className="min-h-screen w-full bg-white px-5 pt-24">
        <StateMessage 
          kind="error" 
          message={q.error?.message || 'Failed to load assessment'} 
          onRetry={q.reload} 
          action={<ButtonLink href={`/dashboard/courses/${courseId}`} variant="secondary">Back to course</ButtonLink>} 
        />
      </div>
    );
  }
  
  return <RealChallengeRunner key={q.data.assessment.id} course={q.data.course} assessment={q.data.assessment} />;
}