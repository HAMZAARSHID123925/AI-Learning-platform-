'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, SparklesIcon, ZapIcon } from 'lucide-react';
import { ButtonLink } from '@/components/student/ButtonLink';
import { StateMessage } from '@/components/student/StateMessage';
import { ScoreRing } from '@/components/student/assessment/ScoreRing';
import { useProgress } from '@/contexts/ProgressContext';
import { useAsync } from '@/hooks/useAsync';
import { learningApi } from '@/utils/learningApi';
import { subjectStyles } from '@/utils/subjects';
import type { RealSubmissionResult, Course } from '@/types/learning';

function scoreMessage(percent: number): string {
  if (percent >= 90) return 'Brilliant work — you really know this!';
  if (percent >= 70) return 'Great job! A little practice will make it perfect.';
  if (percent >= 50) return 'Good effort. Let’s strengthen a few spots.';
  return 'Every mistake is a clue. Let’s learn from them together.';
}

export default function ChallengeResults() {
  const params = useParams();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : (params.courseId || '');

  const q = useAsync(async () => {
    const course = await learningApi.getCourse(courseId);
    if (!submissionId) {
      throw new Error('No submission found.');
    }
    const submission = await learningApi.getRealSubmission(submissionId);
    const weaknesses = await learningApi.getActiveWeaknesses();
    return { course, submission, weaknesses };
  }, [courseId, submissionId]);

  if (q.loading) {
    return (
      <div className="min-h-screen w-full bg-white pt-24">
        <StateMessage kind="loading" title="Fetching your results..." />
      </div>
    );
  }

  if (q.error || !q.data) {
    return (
      <div className="min-h-screen w-full bg-white pt-24">
         <StateMessage 
          kind="error" 
          message="We couldn't load your results right now." 
          onRetry={q.reload} 
          action={<ButtonLink href={`/dashboard/courses/${courseId}`} variant="secondary">Back to course</ButtonLink>} 
        />
      </div>
    );
  }

  const { course, submission, weaknesses } = q.data;
  const subjectStr = course.slug?.includes('science') ? 'science' : course.slug?.includes('english') ? 'english' : course.slug?.includes('computer') ? 'computer' : 'math';
  const s = subjectStyles[subjectStr as 'math' | 'science' | 'english' | 'computer'] || subjectStyles['math'];
  const percent = submission.overall_score * 100;
  
  const [startingFlagId, setStartingFlagId] = useState<string | null>(null);

  let correctCount = 0;
  let totalCount = 0;
  const strong: typeof submission.skill_scores = [];
  const developing: typeof submission.skill_scores = [];
  const needsWork: typeof submission.skill_scores = [];

  for (const sk of submission.skill_scores) {
    correctCount += sk.score;
    totalCount += sk.max_score;
    const ratio = sk.max_score > 0 ? sk.score / sk.max_score : 0;
    if (ratio >= 0.8) strong.push(sk);
    else if (ratio >= 0.6) developing.push(sk);
    else needsWork.push(sk);
  }

  return (
    <div className="space-y-10 pb-20">
      <Link href={`/dashboard/courses/${course.id}`} className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-muted transition-colors duration-150 hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> {course.title} path
      </Link>

      <header>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold ${s.bg} ${s.text}`}>
          <s.icon className="h-4 w-4" aria-hidden="true" /> {course.title} · Final Assessment Results
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">Your results</h1>
      </header>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <section aria-label="Score" className="flex flex-col items-center rounded-[28px] border-2 border-line p-7 text-center">
          <ScoreRing percent={percent} hex={s.hex} />
          <p className="mt-5 text-2xl font-black text-ink">
            {correctCount} of {totalCount} correct
          </p>
          <p className="mt-1 text-ink-soft">{scoreMessage(percent)}</p>
          <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-extrabold text-brand-700">
            <ZapIcon className="h-4 w-4 fill-brand-500 text-brand-500" aria-hidden="true" /> +{Math.round(percent)} XP
          </p>
        </section>
        
        <div className="flex flex-col justify-center rounded-[28px] bg-brand-50 p-8 sm:p-12">
          <div className="mb-6 flex justify-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-500 shadow-[0_4px_0_0_#2438B0]">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-center text-2xl font-black tracking-tight text-ink">Personalized review is being prepared</h2>
          <p className="mx-auto mt-2 text-center text-lg text-ink-soft">
            Elo is analyzing your performance to generate a personalized video to strengthen areas that need work.
          </p>

          <div className="mt-8 space-y-6">
            {needsWork.length > 0 && (
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-danger-600">Needs Practice</h3>
                <ul className="mt-4 space-y-4">
                  {needsWork.map(sk => {
                    const flag = weaknesses.find(w => w.submission_id === submission.id && w.skill_id === sk.skill_id);
                    return (
                      <li key={sk.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-line">
                        <span className="font-bold text-ink text-lg">{sk.skill_name || 'Unknown Topic'}</span>
                        {flag && (
                          <button 
                            onClick={async () => {
                              try {
                                setStartingFlagId(flag.id);
                                const job = await learningApi.createPersonalizedVideoJob(flag.id);
                                window.location.href = `/dashboard/review/${job.id}`;
                              } catch (e) {
                                alert('Could not start review. Please try again.');
                                setStartingFlagId(null);
                              }
                            }}
                            disabled={startingFlagId !== null}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-brand-500 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            {startingFlagId === flag.id ? 'Preparing...' : 'Start Personalized Review'}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {strong.length > 0 && (
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-science-600">Strong Areas</h3>
                <ul className="mt-2 space-y-1">
                  {strong.map(sk => (
                    <li key={sk.id} className="font-bold text-ink">{sk.skill_name || 'Unknown Topic'}</li>
                  ))}
                </ul>
              </div>
            )}
            {developing.length > 0 && (
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-math-600">Developing Areas</h3>
                <ul className="mt-2 space-y-1">
                  {developing.map(sk => (
                    <li key={sk.id} className="font-bold text-ink">{sk.skill_name || 'Unknown Topic'}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row pt-8">
        <ButtonLink href={`/dashboard/courses/${course.id}`} size="lg" variant="secondary">Back to learning path</ButtonLink>
      </div>
    </div>
  );
}