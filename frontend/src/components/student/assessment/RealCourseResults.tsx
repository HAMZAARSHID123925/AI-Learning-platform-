'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { learningApi } from '@/utils/learningApi';
import type { BackendSubmission, BackendWeakness, BackendRemediation } from '@/types/backend';
import { StateMessage } from '@/components/student/StateMessage';
import { PersonalizedVideoPanel } from './PersonalizedVideoPanel';
import { ButtonLink } from '@/components/student/ButtonLink';

export function RealCourseResults() {
  const courseId = String(useParams().courseId || '');
  const { user } = useAuth();
  return <SavedCourseResults key={courseId + ':' + (user?.id || '')} courseId={courseId} />;
}
function SavedCourseResults({courseId}: {courseId: string}) {
  const { user } = useAuth();
  const [data, setData] = useState<{submission: BackendSubmission; flags: BackendWeakness[]; plans: BackendRemediation[]} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const progress = await learningApi.getCourseProgressStats(courseId);
        if (!progress.latest_submission_id) throw new Error('Complete the final assessment to see results.');
        const submission = await learningApi.getRealSubmission(progress.latest_submission_id);
        const [flags, plans] = await Promise.all([learningApi.getActiveWeaknesses(), learningApi.getRemediationPlans()]);
        const ownFlags = flags.filter(flag => flag.submission_id === submission.id);
        const ownPlans = plans.filter(plan => plan.source_submission_id === submission.id && ownFlags.some(flag => flag.id === plan.weakness_flag_id));
        if (!active) return;
        setData({ submission, flags: ownFlags, plans: ownPlans });
        setError(null);
        // Adaptive work runs asynchronously. Poll real persisted state until notes exist.
        if (submission.status !== 'graded' || (submission.skill_scores.some(skill => skill.max_score > 0 && skill.score / skill.max_score < 0.6) && (ownFlags.length === 0 || ownPlans.filter(plan => Boolean(plan.remedial_course_markdown)).length < ownFlags.length))) {
          timer = setTimeout(load, 5000);
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Could not load results.');
      }
    };
    void load();
    return () => { active = false; clearTimeout(timer); };
  }, [courseId, user?.id, retry]);
  if (error) return <StateMessage kind="error" message={error} onRetry={() => setRetry(n => n + 1)} />;
  if (!data) return <StateMessage kind="loading" title="Loading your saved results…" />;
  return <div className="space-y-8">
    <h1 className="text-4xl font-black text-ink">Your assessment results</h1>
    <section className="rounded-2xl border-2 border-line p-6">
      <p className="text-3xl font-black">{Math.round(data.submission.correct_percentage || 0)}%</p>
      <p>{data.submission.total_count} questions · {data.submission.status}</p>
      <ul className="mt-4 space-y-2">{data.submission.skill_scores.map(skill =>
        <li key={skill.id}>{skill.skill_name || 'Curriculum skill'}: {skill.score}/{skill.max_score}</li>)}</ul>
    </section>
    <h2 className="text-2xl font-black">Personalized learning</h2>
    {data.plans.filter(plan => Boolean(plan.remedial_course_markdown)).length === 0 && <p>{(data.submission.correct_percentage ?? 0) < 60 ? 'Preparing your personalized lesson… We are checking for your saved remediation automatically.' : 'No active remediation for this assessment.'}</p>}
    {data.plans.filter(plan => Boolean(plan.remedial_course_markdown)).map(plan => <div key={plan.id} className="space-y-4">
      {user?.id && <PersonalizedVideoPanel key={data.submission.id + ':' + plan.weakness_flag_id} userId={user.id} weaknessId={plan.weakness_flag_id} submissionId={data.submission.id} title={plan.remedial_course_title || 'Your personalized lesson'} />}
      {plan.remedial_course_markdown && <details className="rounded-2xl border-2 border-line p-5"><summary className="cursor-pointer font-bold">Lesson notes</summary><p className="mt-3 whitespace-pre-wrap">{plan.remedial_course_markdown}</p></details>}
    </div>)}
    <div className="pt-3"><ButtonLink variant="secondary" href={`/dashboard/courses/${courseId}`}>Back to course</ButtonLink></div>
  </div>;
}
