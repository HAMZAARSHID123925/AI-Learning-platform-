'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeftIcon, RotateCcwIcon, SparklesIcon } from 'lucide-react';
import { ButtonLink } from '@/components/student/ButtonLink';
import { StateMessage } from '@/components/student/StateMessage';
import { PracticeList } from '@/components/student/assessment/PracticeList';
import { useProgress } from '@/contexts/ProgressContext';
import { useAsync } from '@/hooks/useAsync';
import { learningApi } from '@/utils/learningApi';
import { subjectStyles } from '@/utils/subjects';

export default function Personalized() {
  const params = useParams();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : (params.courseId || '');
  const { latestAttempt, attempts, practiceDone } = useProgress();
  const attempt = latestAttempt(courseId);
  const q = useAsync(
    () => attempt ? learningApi.getPersonalizedPlan(attempt) : Promise.reject(new Error('no-attempt')),
    [attempt?.id]
  );

  if (!attempt) {
    return (
      <StateMessage
        kind="empty"
        title="Your plan starts with a test"
        message="Take the Challenge Test and Elo will build practice just for you."
        action={<ButtonLink href={`/dashboard/courses/${courseId}/challenge`}>Take the Challenge Test</ButtonLink>} />);


  }
  if (q.loading) return <StateMessage kind="loading" title="Building your personalized plan…" />;
  if (q.error || !q.data) return <StateMessage kind="error" message="We couldn’t load your plan right now." onRetry={q.reload} />;

  const { course, analysis, plan } = q.data;
  const s = subjectStyles[course.subject];
  const isDone = (key: string) => practiceDone.includes(`${course.id}:${key}`);
  const doneCount = plan.items.filter((i) => isDone(i.key)).length;
  const history = attempts.filter((a) => a.courseId === course.id).sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const best = Math.max(...history.map((a) => a.correct));
  const weak = [...analysis.needsWork, ...analysis.developing];
  const readyForRetest = doneCount === plan.items.length;

  return (
    <div className="space-y-12">
      <Link href={`/dashboard/courses/${course.id}`} className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-muted transition-colors duration-150 hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> {course.title} path
      </Link>

      <header>
        <h1 className="text-4xl font-black tracking-tight text-ink sm:text-5xl">My Personalized Learning</h1>
        <p className="mt-2 text-lg text-ink-soft">
          Based on your {course.title} Challenge Test · {format(new Date(attempt.submittedAt), 'MMM d, h:mm a')}
        </p>
      </header>

      <section aria-labelledby="focus-title" className={`rounded-[28px] ${s.bg} p-7 sm:p-9`}>
        <p className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-soft">
          <SparklesIcon className="h-4 w-4" aria-hidden="true" /> Based on your performance
        </p>
        <h2 id="focus-title" className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">{plan.headline}</h2>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">{analysis.summary}</p>
        {weak.length > 0 &&
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Skills to practice">
            {weak.map((w) =>
          <li key={w.skill} className="rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-ink">
                {w.skill} · {w.correct}/{w.total}
              </li>
          )}
          </ul>
        }
      </section>

      <section aria-labelledby="practice-title">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="practice-title" className="text-2xl font-black text-ink">Practice</h2>
          <span className="text-sm font-bold text-ink-muted">{doneCount} of {plan.items.length} done</span>
        </div>
        <PracticeList courseId={course.id} items={plan.items} done={isDone} />
      </section>

      <section aria-labelledby="retest-title" className="grid gap-6 rounded-[28px] border-2 border-line p-7 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 id="retest-title" className="text-2xl font-black text-ink">Retest</h2>
          <p className="mt-1 text-ink-soft">
            {readyForRetest ?
            'You’ve finished your practice. Take the Challenge Test again to see how much you’ve grown.' :
            'Finish your practice first for the best result — or retake the test whenever you feel ready.'}
          </p>
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            <div>
              <dt className="text-xs font-extrabold text-ink-muted">Last score</dt>
              <dd className="text-2xl font-black text-ink">{attempt.correct}/{attempt.total}</dd>
            </div>
            <div>
              <dt className="text-xs font-extrabold text-ink-muted">Best score</dt>
              <dd className="text-2xl font-black text-ink">{best}/{attempt.total}</dd>
            </div>
            <div>
              <dt className="text-xs font-extrabold text-ink-muted">Attempts</dt>
              <dd className="text-2xl font-black text-ink">{history.length}</dd>
            </div>
          </dl>
          {history.length > 1 &&
          <ol className="mt-5 flex flex-wrap gap-2" aria-label="Attempt history">
              {history.map((a, i) =>
            <li key={a.id} className="rounded-xl bg-surface px-3 py-1.5 text-sm font-bold text-ink-soft">
                  Try {i + 1}: <span className="font-black text-ink">{a.correct}/{a.total}</span>
                </li>
            )}
            </ol>
          }
        </div>
        <ButtonLink href={`/dashboard/courses/${course.id}/challenge`} size="lg" variant={readyForRetest ? 'primary' : 'secondary'}>
          <RotateCcwIcon className="h-5 w-5" aria-hidden="true" /> Retake Challenge Test
        </ButtonLink>
      </section>
    </div>);

}