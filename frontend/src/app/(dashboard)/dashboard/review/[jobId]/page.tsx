'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { learningApi } from '@/utils/learningApi';
import type { VideoGenerationJob } from '@/types/learning';
import type { BackendRemediation } from '@/types/backend';
import { ButtonLink } from '@/components/student/ButtonLink';
import { StateMessage } from '@/components/student/StateMessage';

export default function ReviewPage() {
  const jobId = String(useParams().jobId || '');
  const { user } = useAuth();
  return <SavedVideoReview key={jobId + ':' + (user?.id || '')} jobId={jobId} />;
}
function SavedVideoReview({jobId}: {jobId: string}) {
  const { user } = useAuth();
  const [job, setJob] = useState<VideoGenerationJob | null>(null);
  const [plan, setPlan] = useState<BackendRemediation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const current = await learningApi.getPersonalizedVideoJob(jobId);
        if (!active) return;
        setJob(current); setError(null); setMediaError(false);
        if (current.weakness_flag_id) {
          const plans = await learningApi.getRemediationPlans();
          if (active) setPlan(plans.find(p => p.weakness_flag_id === current.weakness_flag_id) || null);
        }
        if (active && current.status !== 'ready' && current.status !== 'failed') timer = setTimeout(poll, 5000);
      } catch (e) {
        if (!active) return;
        const message = e instanceof Error ? e.message : 'Could not load your video.';
        setError(message);
        if (!message.includes('(403)') && !message.includes('(404)')) timer = setTimeout(poll, 10000);
      }
    };
    void poll();
    return () => { active = false; clearTimeout(timer); };
  }, [jobId, user?.id, retry]);
  if (!job) return error
    ? <StateMessage kind="error" message={error} onRetry={() => setRetry(n => n + 1)} />
    : <StateMessage kind="loading" title="Loading your personalized review…" />;
  return <div className="mx-auto max-w-4xl space-y-8">
    <ButtonLink href="/dashboard" variant="secondary">Back to dashboard</ButtonLink>
    <h1 className="text-4xl font-black text-ink">{job.title || 'Your personalized review'}</h1>
    {error && <p role="alert">{error}</p>}
    {job.status === 'ready' && job.video_url ? <section className="overflow-hidden rounded-2xl border-2 border-line">
      <video src={job.video_url} poster={job.thumbnail_url || undefined} controls playsInline preload="metadata"
        className="aspect-video w-full bg-black" onError={() => setMediaError(true)} />
      {mediaError && <p role="alert" className="p-4">Could not play the video.
        <button className="ml-2 underline" onClick={() => setRetry(n => n + 1)}>Refresh playback link</button>
      </p>}
    </section> : job.status === 'failed' ? <p role="alert">We could not prepare your video. You can still review the notes below.</p>
      : <StateMessage kind="loading" title="Preparing your personalized video…" message="You can leave this page and return while it is being prepared." />}
    {plan?.remedial_course_markdown && <section className="rounded-2xl border-2 border-line p-6">
      <h2 className="text-xl font-black">{plan.remedial_course_title || 'Review notes'}</h2>
      <p className="mt-3 whitespace-pre-wrap">{plan.remedial_course_markdown}</p>
      <button className="mt-4 rounded-full bg-brand-500 px-6 py-3 font-bold text-white" onClick={async () => {
        try {
          const result = await learningApi.completeRemedialStudy(plan.id);
          if (result.retest_id) window.location.href = `/dashboard/practice/${result.retest_id}`;
        } catch { setError('Could not start focused practice. Please retry.'); }
      }}>Try focused practice</button>
    </section>}
  </div>;
}
