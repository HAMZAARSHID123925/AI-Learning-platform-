'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ButtonLink } from '@/components/student/ButtonLink';
import { StateMessage } from '@/components/student/StateMessage';
import { RealChallengeRunner } from '@/components/student/assessment/RealChallengeRunner';
import { useAsync } from '@/hooks/useAsync';
import { learningApi } from '@/utils/learningApi';
import type { Course } from '@/types/learning';

const DUMMY_COURSE: Course = {
  id: 'focused-practice',
  title: 'Focused Practice',
  description: '',
  grade: 5,
  subject: 'math',
  image: '',
  skills: [],
  lessons: []
};

export default function PracticeTestPage() {
  const params = useParams();
  const testId = Array.isArray(params.testId) ? params.testId[0] : (params.testId || '');
  const router = useRouter();
  
  const q = useAsync(async () => {
    return await learningApi.getTest(testId);
  }, [testId]);

  if (q.loading) {
    return (
      <div className="min-h-screen w-full bg-white pt-24">
        <StateMessage kind="loading" title="Loading Practice…" />
      </div>
    );
  }
  
  if (q.error || !q.data) {
    return (
      <div className="min-h-screen w-full bg-white px-5 pt-24">
        <StateMessage 
          kind="error" 
          message={q.error?.message || 'Failed to load practice test'} 
          onRetry={q.reload} 
          action={<ButtonLink href={`/dashboard`} variant="secondary">Back to Dashboard</ButtonLink>} 
        />
      </div>
    );
  }
  
  const test = q.data;
  
  return (
    <RealChallengeRunner 
      key={test.id} 
      course={{...DUMMY_COURSE, title: test.title}} 
      assessment={test} 
      onFinished={(submissionId) => {
        router.replace(`/dashboard/practice/${test.id}/results?submissionId=${submissionId}`);
      }}
    />
  );
}
