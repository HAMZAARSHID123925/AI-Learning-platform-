'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PlayCircleIcon, AlertTriangleIcon, SparklesIcon, FileTextIcon } from 'lucide-react';
import { ButtonLink } from '@/components/student/ButtonLink';
import { StateMessage } from '@/components/student/StateMessage';
import { learningApi } from '@/utils/learningApi';
import type { VideoGenerationJob, RemediationPlan } from '@/types/learning';

const friendlyStatus: Record<string, string> = {
  queued: "Preparing your lesson…",
  planning: "Preparing your lesson…",
  scripting: "Creating your personalized explanation…",
  storyboard_ready: "Creating your personalized explanation…",
  assets_preparing: "Preparing your lesson…",
  audio_generating: "Preparing your lesson…",
  audio_ready: "Preparing your lesson…",
  rendering: "Finishing your video…",
  uploading: "Finishing your video…"
};

function PersonalizedVideoPlayer({ job, onFallback }: { job: VideoGenerationJob, onFallback: () => void }) {
  // DEV PLACEHOLDER UI NOTE: M3.5 character asset is DEV PLACEHOLDER.
  return (
    <div className="flex flex-col overflow-hidden rounded-[28px] border-2 border-line bg-ink shadow-lg">
      <div className="aspect-video w-full bg-black relative flex items-center justify-center">
        {job.video_url ? (
          <video 
            src={job.video_url} 
            poster={job.thumbnail_url || undefined}
            controls 
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="text-white text-center p-8 flex flex-col items-center">
            <AlertTriangleIcon className="h-12 w-12 text-warning-400 mb-4" />
            <p className="text-xl font-bold">Video file is missing.</p>
            <p className="mt-2 text-ink-soft">We couldn't load the video player.</p>
          </div>
        )}
      </div>
      <div className="bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-ink">{job.title || 'Personalized Review'}</h3>
          {process.env.NODE_ENV === 'development' && (
            <span className="mt-2 inline-block rounded bg-warning-100 px-2 py-0.5 text-xs font-bold text-warning-800">
              DEV PLACEHOLDER Character
            </span>
          )}
        </div>
        <button 
          onClick={onFallback}
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
        >
          <FileTextIcon className="h-4 w-4" />
          Review Notes Instead
        </button>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const params = useParams();
  const jobId = Array.isArray(params.jobId) ? params.jobId[0] : (params.jobId || '');
  
  const [job, setJob] = useState<VideoGenerationJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [plan, setPlan] = useState<RemediationPlan | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const timerRef = useRef<number | null>(null);

  const fetchJob = async () => {
    try {
      const data = await learningApi.getPersonalizedVideoJob(jobId);
      setJob(data);
      return data;
    } catch (e: any) {
      if (e.message?.includes('403') || e.message?.includes('404')) {
        setError("You don't have access to this lesson.");
      } else {
        // Soft fail for temporary network issues if already polling
        if (!job) setError("We couldn't load your review right now.");
      }
      return null;
    }
  };

  const fetchFallback = async (flagId: string) => {
    try {
      const plans = await learningApi.getRemediationPlans();
      const match = plans.find(p => p.weakness_flag_id === flagId);
      if (match) setPlan(match);
    } catch (e) {
      console.error('Failed to load fallback plan', e);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const poll = async () => {
      if (!mounted) return;
      const currentJob = await fetchJob();
      
      if (currentJob) {
        if (currentJob.weakness_flag_id && !plan) {
           await fetchFallback(currentJob.weakness_flag_id);
        }
        if (currentJob.status === 'ready' || currentJob.status === 'failed') {
          // Stop polling
        } else {
          // Continue polling
          timerRef.current = window.setTimeout(poll, 4000);
        }
      }
    };
    
    poll();
    
    return () => {
      mounted = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [jobId]);

  if (error) {
    return (
      <div className="min-h-screen w-full bg-white pt-24">
        <StateMessage 
          kind="error" 
          message={error} 
          action={<ButtonLink href="/dashboard" variant="secondary">Back to Dashboard</ButtonLink>} 
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen w-full bg-white pt-24">
        <StateMessage kind="loading" title="Loading..." />
      </div>
    );
  }

  const isFailed = job.status === 'failed';
  const isReady = job.status === 'ready';
  const isGenerating = !isReady && !isFailed;

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-20 pt-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-muted transition-colors duration-150 hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> Back to Dashboard
      </Link>

      <header>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-extrabold text-brand-700">
          <SparklesIcon className="h-4 w-4 fill-brand-500 text-brand-500" aria-hidden="true" /> Personalized Review
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
          {job.title || 'Let\'s review this topic'}
        </h1>
        <p className="mt-2 text-lg text-ink-soft">
          This short lesson focuses on the concept that caused difficulty in your assessment.
        </p>
      </header>

      {isGenerating && (
        <div className="flex flex-col items-center justify-center rounded-[28px] bg-brand-50 p-12 text-center shadow-inner">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 shadow-sm">
            <div className="absolute h-full w-full animate-ping rounded-full bg-brand-400 opacity-20"></div>
            <SparklesIcon className="h-10 w-10 text-brand-600" />
          </div>
          <h2 className="text-2xl font-black text-ink">
            {friendlyStatus[job.status] || "Preparing your lesson…"}
          </h2>
          <p className="mt-3 max-w-md text-ink-soft">
            Elo is analyzing your results and creating a video just for you. This usually takes less than a minute.
          </p>
        </div>
      )}

      {isReady && !showNotes && (
        <PersonalizedVideoPlayer job={job} onFallback={() => setShowNotes(true)} />
      )}

      {(isFailed || showNotes) && (
        <div className="rounded-[28px] border-2 border-line bg-white p-8 sm:p-12">
          <div className="mb-6">
            {isFailed && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl bg-danger-50 p-4 text-danger-900">
                <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-danger-500" />
                <div>
                  <h3 className="font-bold">We couldn't prepare your personalized video.</h3>
                  <p className="mt-1 text-sm text-danger-700">However, you can still review the notes below.</p>
                </div>
              </div>
            )}
            <h2 className="text-2xl font-black text-ink">Review Notes</h2>
          </div>
          
          {plan?.remedial_course_markdown ? (
            <div className="prose prose-lg prose-brand max-w-none text-ink">
              {/* Note: ReactMarkdown should be used here, simulating with div for MVP */}
              <div dangerouslySetInnerHTML={{ __html: plan.remedial_course_markdown.replace(/\n/g, '<br/>') }} />
            </div>
          ) : (
            <p className="text-ink-soft">No review notes available.</p>
          )}
        </div>
      )}

      {(isReady || showNotes) && plan && (
        <div className="flex justify-end pt-8">
          <button 
            onClick={async () => {
              try {
                setIsStarting(true);
                const res = await learningApi.completeRemedialStudy(plan.id);
                if (res.retest_id) {
                  window.location.href = `/dashboard/practice/${res.retest_id}`;
                } else {
                  alert(res.message);
                }
              } catch (e) {
                alert('Failed to start focused practice.');
              } finally {
                setIsStarting(false);
              }
            }}
            disabled={isStarting}
            className="inline-flex items-center justify-center rounded-full bg-brand-500 px-8 py-3 text-base font-extrabold text-white shadow-sm transition-all hover:bg-brand-600 disabled:opacity-50"
          >
            {isStarting ? 'Preparing...' : 'Try Focused Practice'}
          </button>
        </div>
      )}
    </div>
  );
}
