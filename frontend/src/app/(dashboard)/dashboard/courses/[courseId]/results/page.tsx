'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon, SparklesIcon, ZapIcon } from 'lucide-react';
import { ButtonLink } from '@/components/student/ButtonLink';
import { ProgressBar } from '@/components/student/ProgressBar';
import { StateMessage } from '@/components/student/StateMessage';
import { AnalysisPanel } from '@/components/student/assessment/AnalysisPanel';
import { AnswerReview } from '@/components/student/assessment/AnswerReview';
import { ScoreRing } from '@/components/student/assessment/ScoreRing';
import { useProgress } from '@/contexts/student/ProgressContext';
import { useAsync } from '@/hooks/student/useAsync';
import { learningApi } from '@/utils/student/learningApi';
import { subjectStyles } from '@/utils/student/subjects';
import type { SkillResult } from '@/types/student/learning';

const levelBar: Record<SkillResult['level'], string> = {
  strong: 'bg-science-500',
  developing: 'bg-math-500',
  needs_work: 'bg-danger-500'
};
const levelLabel: Record<SkillResult['level'], string> = {
  strong: 'Strong',
  developing: 'Getting there',
  needs_work: 'Needs practice'
};

function scoreMessage(percent: number): string {
  if (percent >= 90) return 'Brilliant work — you really know this!';
  if (percent >= 70) return 'Great job! A little practice will make it perfect.';
  if (percent >= 50) return 'Good effort. Let’s strengthen a few spots.';
  return 'Every mistake is a clue. Let’s learn from them together.';
}

export default function ChallengeResults() {
  const params = useParams();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : (params.courseId || '');
  const { latestAttempt } = useProgress();
  const attempt = latestAttempt(courseId);
  const q = useAsync(
    () => attempt ? learningApi.analyzeAssessment(attempt) : Promise.reject(new Error('no-attempt')),
    [attempt?.id]
  );

  if (!attempt) {
    return (
      <StateMessage
        kind="empty"
        title="No Challenge Test yet"
        message="Take the Challenge Test and Elo will analyze your strengths."
        action={<ButtonLink href={`/dashboard/courses/${courseId}/challenge`}>Start the test</ButtonLink>} />);


  }

  if (q.loading) {
    return (
      <div role="status" className="mx-auto flex max-w-md flex-col items-center rounded-[28px] bg-brand-50 px-8 py-14 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-500 shadow-[0_4px_0_0_#2438B0]" aria-hidden="true">
          <SparklesIcon className="h-8 w-8 text-white" />
        </span>
        <p className="mt-5 text-xl font-black text-ink">Elo is analyzing your answers</p>
        <p className="mt-1 text-ink-soft">Looking for your strengths and the skills to practice next.</p>
        <div className="mt-5 flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) =>
          <motion.span key={i} className="h-2.5 w-2.5 rounded-full bg-brand-500" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'linear' }} />
          )}
        </div>
      </div>);

  }

  if (q.error || !q.data) return <StateMessage kind="error" message="We couldn’t analyze this test right now." onRetry={q.reload} />;

  const { course, questions, analysis } = q.data;
  const s = subjectStyles[course.subject];

  return (
    <div className="space-y-10">
      <Link href={`/dashboard/courses/${course.id}`} className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-muted transition-colors duration-150 hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> {course.title} path
      </Link>

      <header>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold ${s.bg} ${s.text}`}>
          <s.icon className="h-4 w-4" aria-hidden="true" /> {course.title} · Challenge Test
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">Your results</h1>
      </header>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <section aria-label="Score" className="flex flex-col items-center rounded-[28px] border-2 border-line p-7 text-center">
          <ScoreRing percent={analysis.scorePercent} hex={s.hex} />
          <p className="mt-5 text-2xl font-black text-ink">
            {attempt.correct} of {attempt.total} correct
          </p>
          <p className="mt-1 text-ink-soft">{scoreMessage(analysis.scorePercent)}</p>
          <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-extrabold text-brand-700">
            <ZapIcon className="h-4 w-4 fill-brand-500 text-brand-500" aria-hidden="true" /> +{attempt.correct * 10} XP
          </p>
        </section>
        <AnalysisPanel analysis={analysis} />
      </div>

      <section aria-labelledby="skills-title">
        <h2 id="skills-title" className="text-2xl font-black text-ink">Skill breakdown</h2>
        <ul className="mt-5 grid gap-x-10 gap-y-5 md:grid-cols-2">
          {analysis.skills.map((sk) =>
          <li key={sk.skill}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="font-extrabold text-ink">{sk.skill}</span>
                <span className="font-bold text-ink-muted">{levelLabel[sk.level]} · {sk.correct}/{sk.total}</span>
              </div>
              <ProgressBar value={sk.percent} barClassName={levelBar[sk.level]} label={`${sk.skill} score`} />
            </li>
          )}
        </ul>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={`/dashboard/courses/${course.id}/personalized`} size="lg">
          <SparklesIcon className="h-5 w-5" aria-hidden="true" /> See my personalized learning <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
        </ButtonLink>
        <ButtonLink href={`/dashboard/courses/${course.id}`} size="lg" variant="secondary">Back to learning path</ButtonLink>
      </div>

      <AnswerReview questions={questions} attempt={attempt} />
    </div>);

}