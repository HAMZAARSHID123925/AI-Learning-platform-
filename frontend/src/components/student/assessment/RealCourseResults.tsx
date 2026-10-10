'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { learningApi } from '@/utils/learningApi';
import type { BackendSubmission, BackendWeakness, BackendRemediation } from '@/types/backend';
import { StateMessage } from '@/components/student/StateMessage';
import { PersonalizedVideoPanel } from './PersonalizedVideoPanel';
import { ButtonLink } from '@/components/student/ButtonLink';
import {
  Star,
  CheckCircle2,
  Sparkles,
  BookOpen,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';

interface ResultData {
  submission: BackendSubmission;
  flags: BackendWeakness[];
  plans: BackendRemediation[];
}

export function RealCourseResults() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = String(params.courseId || '');
  const submissionIdParam = searchParams.get('submissionId');
  const { user } = useAuth();

  return (
    <SavedCourseResults
      key={`${courseId}:${user?.id || ''}:${submissionIdParam || 'latest'}`}
      courseId={courseId}
      submissionIdParam={submissionIdParam}
    />
  );
}

function SavedCourseResults({
  courseId,
  submissionIdParam,
}: {
  courseId: string;
  submissionIdParam: string | null;
}) {
  const { user } = useAuth();
  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const load = async () => {
      try {
        let submissionId = submissionIdParam;
        if (!submissionId) {
          const progress = await learningApi.getCourseProgressStats(courseId);
          if (!progress.latest_submission_id) {
            throw new Error('Please finish the quiz first!');
          }
          submissionId = progress.latest_submission_id;
        }

        const submission = await learningApi.getRealSubmission(submissionId);
        const [flags, plans] = await Promise.all([
          learningApi.getActiveWeaknesses(),
          learningApi.getRemediationPlans(),
        ]);

        const ownFlags = flags.filter((flag) => flag.submission_id === submission.id);
        const ownPlans = plans.filter(
          (plan) =>
            plan.source_submission_id === submission.id &&
            ownFlags.some((flag) => flag.id === plan.weakness_flag_id)
        );

        if (!active) return;
        setData({ submission, flags: ownFlags, plans: ownPlans });
        setError(null);

        if (
          submission.status !== 'graded' ||
          (submission.skill_scores.some(
            (skill) => skill.max_score > 0 && skill.score / skill.max_score < 0.6
          ) &&
            (ownFlags.length === 0 ||
              ownPlans.filter((plan) => Boolean(plan.remedial_course_markdown)).length <
                ownFlags.length))
        ) {
          timer = setTimeout(load, 3000);
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Could not load result.');
      }
    };

    void load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [courseId, user?.id, submissionIdParam, retry]);

  const skillBars = useMemo(() => {
    if (!data?.submission.skill_scores) return [];
    return data.submission.skill_scores.map((skill) => {
      const pct = skill.max_score > 0 ? Math.round((skill.score / skill.max_score) * 100) : 0;
      return {
        id: skill.id,
        name: skill.skill_name || 'Topic',
        pct,
        raw: `${skill.score}/${skill.max_score}`,
        isWeak: pct < 60,
      };
    });
  }, [data?.submission.skill_scores]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <StateMessage
          kind="error"
          message={error}
          onRetry={() => setRetry((n) => n + 1)}
          action={
            <ButtonLink variant="secondary" href={`/dashboard/courses/${courseId}`}>
              Back to Course
            </ButtonLink>
          }
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <StateMessage kind="loading" title="Checking your quiz... 🌟" />
      </div>
    );
  }

  const scorePct = Math.round(data.submission.correct_percentage ?? 0);
  const totalQuestions = data.submission.total_count || 10;
  const correctCount = Math.round((scorePct / 100) * totalQuestions);
  const isHigh = scorePct >= 80;
  const isPass = scorePct >= 60;

  const weakSkills = skillBars.filter((s) => s.isWeak);
  const readyPlans = data.plans.filter((p) => Boolean(p.remedial_course_markdown));
  // ONE combined video per test: request it for the lowest-scoring weakness
  // (stable as plans arrive); the backend script covers every weak skill.
  const primaryFlag = [...data.flags].sort(
    (a, b) => a.score_at_flag - b.score_at_flag || a.id.localeCompare(b.id)
  )[0];
  const primaryPlan = primaryFlag
    ? readyPlans.find((p) => p.weakness_flag_id === primaryFlag.id)
    : undefined;
  const videoTitle =
    weakSkills.length > 1
      ? `Your lesson: ${weakSkills.map((s) => s.name).join(', ')}`
      : primaryPlan?.remedial_course_title || 'Helpful Practice Lesson';

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      {/* 1. Cheerful Top Card */}
      <div className="rounded-3xl border-2 border-line bg-white p-6 sm:p-8 text-center shadow-sm">
        {/* Stars */}
        <div className="flex justify-center gap-2 mb-3">
          {[1, 2, 3].map((star) => {
            const filled =
              isHigh ? true : isPass ? star <= 2 : star <= 1;
            return (
              <Star
                key={star}
                className={`h-9 w-9 ${
                  filled ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                }`}
              />
            );
          })}
        </div>

        {/* Big Score */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-6xl font-black text-ink">{scorePct}%</span>
        </div>
        <p className="mt-1 text-base font-bold text-ink-muted">
          {correctCount} of {totalQuestions} correct
        </p>

        {/* Simple 1-line Cheer */}
        <div className="mt-4 inline-block rounded-full bg-surface px-4 py-1.5 text-sm font-extrabold text-ink">
          {isHigh
            ? '🌟 Awesome Job!'
            : isPass
            ? '👍 Good Work!'
            : '💪 Try Again to Win 3 Stars!'}
        </div>
      </div>

      {/* 2. Super Simple Visual Graph (Bar Meters) */}
      <div className="rounded-3xl border-2 border-line bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-ink mb-4 flex items-center gap-2">
          <span>📊 Your Progress</span>
        </h2>

        <div className="space-y-4">
          {skillBars.map((item) => (
            <div key={item.id} className="space-y-1.5">
              <div className="flex justify-between items-center text-sm font-black">
                <span className="text-ink">{item.name}</span>
                <span
                  className={
                    item.pct >= 80
                      ? 'text-emerald-600'
                      : item.pct >= 60
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }
                >
                  {item.pct}%
                </span>
              </div>

              {/* Clean, Thick Visual Bar */}
              <div className="h-5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-line/40">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max(5, item.pct)}%`,
                    backgroundColor:
                      item.pct >= 80
                        ? '#10b981'
                        : item.pct >= 60
                        ? '#f59e0b'
                        : '#ef4444',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Simple legend */}
        <div className="mt-5 flex justify-center gap-6 border-t border-line/60 pt-4 text-xs font-black">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span>Passed</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-500">
            <span className="h-3 w-3 rounded-full bg-rose-500" />
            <span>Needs Practice</span>
          </div>
        </div>
      </div>

      {/* 3. What to Practice (Only if weak skills exist) */}
      {weakSkills.length > 0 && (
        <div className="rounded-3xl border-2 border-rose-100 bg-rose-50/50 p-5">
          <h3 className="text-sm font-black text-rose-800 flex items-center gap-2">
            <span>🎯 Practice Topic:</span>
          </h3>
          <div className="mt-2 space-y-1.5">
            {weakSkills.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between rounded-xl bg-white p-3 border border-rose-200"
              >
                <span className="font-bold text-sm text-ink">{w.name}</span>
                <span className="text-xs font-black text-rose-600 bg-rose-100 px-2.5 py-1 rounded-full">
                  {w.pct}%
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs font-bold text-rose-700">
            Watch the video lesson below to learn this!
          </p>
        </div>
      )}

      {/* 4. AI Video Lesson */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-ink flex items-center gap-2">
          <span>🎬 Video Lesson</span>
        </h2>

        {!primaryPlan ? (
          <div className="rounded-3xl border-2 border-line bg-white p-6 text-center shadow-sm">
            {weakSkills.length > 0 ? (
              <div className="space-y-3 py-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand animate-pulse">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black text-ink">
                  Making your video lesson...
                </h3>
                <p className="text-xs font-bold text-ink-muted">
                  Please wait a moment! It will appear right here.
                </p>
              </div>
            ) : (
              <div className="py-4 space-y-2">
                <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500" />
                <p className="text-sm font-black text-ink">
                  Great job! You don&apos;t need extra practice.
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
          {user?.id && (
            <PersonalizedVideoPanel
              key={`${data.submission.id}:${primaryPlan.weakness_flag_id}`}
              userId={user.id}
              weaknessId={primaryPlan.weakness_flag_id}
              submissionId={data.submission.id}
              title={videoTitle}
            />
          )}
          {readyPlans.map((plan) => (
            <div key={plan.id} className="space-y-4">

              {plan.remedial_course_markdown && (
                <details className="group rounded-3xl border-2 border-line bg-white p-5 shadow-sm">
                  <summary className="flex cursor-pointer items-center justify-between font-black text-ink text-sm">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-brand" />
                      {plan.remedial_course_title ? `Notes: ${plan.remedial_course_title.replace(/^Remedial Mastery Guide:\s*/i, '')}` : 'Lesson Notes'}
                    </span>
                    <span className="text-xs text-brand font-bold group-open:rotate-90 transition-transform">
                      &rarr;
                    </span>
                  </summary>
                  <div className="mt-3 border-t border-line pt-3 text-xs sm:text-sm text-ink-soft whitespace-pre-wrap font-medium leading-relaxed">
                    {plan.remedial_course_markdown}
                  </div>
                </details>
              )}
            </div>
          ))}
          </>
        )}
      </div>

      {/* 5. Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <ButtonLink variant="secondary" href={`/dashboard/courses/${courseId}`}>
          <span className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Course
          </span>
        </ButtonLink>
        <ButtonLink variant="primary" href={`/dashboard/courses/${courseId}/challenge`}>
          <span className="flex items-center gap-1.5">
            <RotateCcw className="h-4 w-4" /> Try Again
          </span>
        </ButtonLink>
      </div>
    </div>
  );
}
