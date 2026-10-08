'use client';
import React, { useEffect, useState } from 'react';
import { findOrCreateVideo, videoView, videoCanResume } from '@/utils/personalizedVideo';
import { learningApi } from '@/utils/learningApi';
import type { VideoGenerationJob } from '@/types/learning';
import { Loader2, Video, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Film, Mic, Play, Smile } from 'lucide-react';

interface Props {
  userId: string;
  weaknessId: string;
  submissionId: string;
  title: string;
}

const GENERATION_STEPS = [
  { key: 'planning', label: '1. Thinking', desc: 'Finding what to teach', icon: Smile },
  { key: 'scripting', label: '2. Writing', desc: 'Making an easy lesson', icon: Sparkles },
  { key: 'audio', label: '3. Talking', desc: 'Recording the teacher voice', icon: Mic },
  { key: 'rendering', label: '4. Drawing', desc: 'Making the cartoon & video', icon: Film },
];

function getActiveStepIndex(status: string): number {
  switch (status) {
    case 'queued':
    case 'planning':
      return 0;
    case 'scripting':
    case 'storyboard_ready':
      return 1;
    case 'assets_preparing':
    case 'audio_generating':
    case 'audio_ready':
      return 2;
    case 'rendering':
    case 'uploading':
      return 3;
    case 'ready':
      return 4;
    default:
      return 0;
  }
}

export function PersonalizedVideoPanel({ userId, weaknessId, submissionId, title }: Props) {
  const [job, setJob] = useState<VideoGenerationJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [abandoned, setAbandoned] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const display = (value: VideoGenerationJob) => {
      if (!active) return;
      setJob(value);
      setError(null);
      setAbandoned(videoCanResume(value));
      if (videoView(value) === 'preparing') {
        timer = setTimeout(() => void poll(value.id), 4000);
      }
    };

    const poll = async (id: string) => {
      try {
        display(await learningApi.getPersonalizedVideoJob(id));
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Could not check your lesson.');
          timer = setTimeout(() => void poll(id), 12000);
        }
      }
    };

    void findOrCreateVideo(userId, weaknessId, submissionId)
      .then(display)
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Could not prepare your lesson.');
      });

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [userId, weaknessId, submissionId, retry]);

  const restart = async () => {
    if (!job || retrying) return;
    setRetrying(true);
    try {
      setJob(await learningApi.retryPersonalizedVideo(job.id));
      setError(null);
      setRetry((n) => n + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not retry your lesson.');
    } finally {
      setRetrying(false);
    }
  };

  const refreshPlayback = async () => {
    if (!job) return;
    try {
      const refreshed = await learningApi.getPersonalizedVideoJob(job.id);
      setJob(refreshed);
      setPlaybackError(false);
    } catch {
      setError('Could not refresh playback. Please try again.');
    }
  };

  const view = job ? videoView(job) : 'preparing';
  const currentStep = job ? getActiveStepIndex(job.status) : 0;

  return (
    <section
      aria-label="Personalized video lesson"
      className="overflow-hidden rounded-3xl border-2 border-line bg-white p-6 shadow-sm transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-ink">{job?.title || title}</h3>
            <p className="text-xs font-bold text-ink-muted">Fun Video Lesson Made Just For You!</p>
          </div>
        </div>

        {view === 'preparing' && (
          <div className="flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-black text-brand animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Making your video lesson...</span>
          </div>
        )}

        {view === 'ready' && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Ready to Watch! 🎉
          </span>
        )}
      </div>

      {error ? (
        <div role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" />
            <div>
              <p className="font-bold text-sm">Oops!</p>
              <p className="text-xs sm:text-sm mt-1">{error}</p>
              <button
                disabled={retrying}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-rose-700 disabled:opacity-50"
                onClick={() => (view === 'failed' ? void restart() : setRetry((n) => n + 1))}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${retrying ? 'animate-spin' : ''}`} />
                {view === 'failed' ? (retrying ? 'Retrying…' : 'Try Again') : 'Check Again'}
              </button>
            </div>
          </div>
        </div>
      ) : view === 'ready' && job?.video_url ? (
        <div className="mt-5 space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-md">
            <video
              key={job.video_url}
              aria-label="Your personalized lesson"
              className="h-full w-full object-contain"
              controls
              playsInline
              preload="metadata"
              src={job.video_url}
              poster={job.thumbnail_url || undefined}
              onError={() => setPlaybackError(true)}
            />
          </div>

          {playbackError && (
            <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <p className="text-xs sm:text-sm font-bold">
                Video could not play. Click the button to reload!
              </p>
              <button
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold shadow-sm hover:bg-amber-100"
                onClick={() => void refreshPlayback()}
              >
                <RefreshCw className="h-3 w-3" /> Reload Video
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs font-bold text-ink-muted">
            <Play className="h-3.5 w-3.5 text-brand" />
            <span>Click play above to watch your teacher explain this topic!</span>
          </div>
        </div>
      ) : view === 'failed' ? (
        <div role="alert" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <p className="font-bold text-sm">We are working on this lesson!</p>
          <p className="mt-1 text-xs sm:text-sm">
            Please click try again below or check the notes under this video.
          </p>
          <button
            disabled={retrying}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-700 disabled:opacity-50"
            onClick={() => void restart()}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying…' : 'Try Again'}
          </button>
        </div>
      ) : (
        /* Friendly Kid-Appropriate Pipeline */
        <div role="status" aria-live="polite" className="mt-5 space-y-5">
          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white shadow-sm">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-ink">Making Your Cartoon Lesson... 🎨</h4>
                  <p className="text-xs font-bold text-brand">Almost ready for you to watch!</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-ink">
                  Step {Math.min(currentStep + 1, 4)} of 4
                </span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-brand transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(95, Math.max(20, (currentStep + 1) * 25))}%`,
                }}
              />
            </div>
          </div>

          {/* 4 Simple Steps */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {GENERATION_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div
                  key={step.key}
                  className={`flex flex-col rounded-2xl border-2 p-3 transition-all ${
                    isCurrent
                      ? 'border-brand bg-brand/5 shadow-sm'
                      : isPast
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-line bg-surface/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-xl ${
                        isCurrent
                          ? 'bg-brand text-white'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-ink-muted'
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>
                    {isCurrent && (
                      <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-black text-brand">
                        Now
                      </span>
                    )}
                    {isPast && (
                      <span className="text-[10px] font-black text-emerald-700">Done ✓</span>
                    )}
                  </div>

                  <p className="mt-2 text-xs font-black text-ink">{step.label}</p>
                  <p className="text-[11px] font-semibold text-ink-muted">{step.desc}</p>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs font-bold text-ink-muted">
            ✨ Your video will start playing automatically when it finishes! Please wait a moment.
          </p>
        </div>
      )}
    </section>
  );
}
