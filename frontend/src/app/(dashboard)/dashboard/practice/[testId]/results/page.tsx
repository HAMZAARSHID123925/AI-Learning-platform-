'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, ArrowLeftIcon, TrendingUpIcon, AlertCircleIcon } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { learningApi } from '@/utils/learningApi';
import { ButtonLink } from '@/components/student/ButtonLink';
import { StateMessage } from '@/components/student/StateMessage';

export default function PracticeResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');

  const q = useAsync(async () => {
    if (!submissionId) throw new Error('No submission ID provided');
    const [submission, weaknesses] = await Promise.all([
      learningApi.getRealSubmission(submissionId),
      learningApi.getActiveWeaknesses()
    ]);
    return { submission, weaknesses };
  }, [submissionId]);

  if (q.loading) {
    return (
      <div className="min-h-screen w-full bg-white pt-24">
        <StateMessage kind="loading" title="Analyzing your results..." />
      </div>
    );
  }

  if (q.error || !q.data) {
    return (
      <div className="min-h-screen w-full bg-white px-5 pt-24">
        <StateMessage 
          kind="error" 
          message={q.error?.message || 'Failed to load results'} 
          action={<ButtonLink href={`/dashboard`} variant="secondary">Back to Dashboard</ButtonLink>} 
        />
      </div>
    );
  }

  const { submission, weaknesses } = q.data;

  // For focused practice, there's typically 1 skill being assessed
  const targetSkill = submission.skill_scores?.[0];
  if (!targetSkill) {
    return (
      <div className="min-h-screen w-full bg-white pt-24 text-center">
        <p>No skill data found.</p>
        <ButtonLink href="/dashboard" className="mt-4">Back to Dashboard</ButtonLink>
      </div>
    );
  }

  const flag = weaknesses.find((w) => w.skill_id === targetSkill.skill_id);
  
  const newScore = targetSkill.score / (targetSkill.max_score || 1);
  const previousScore = flag ? flag.score_at_flag : 0;
  const threshold = flag ? flag.threshold : 0.6;
  const improvement = newScore - previousScore;
  
  const isResolved = newScore >= threshold;
  const hasImproved = improvement > 0;

  let title = "";
  let message = "";
  let Icon = TrendingUpIcon;
  let iconColor = "text-brand-500";
  let bgIcon = "bg-brand-100";

  if (isResolved) {
    title = "Great work!";
    message = "You've successfully improved your understanding. This skill is now stronger.";
    Icon = CheckCircleIcon;
    iconColor = "text-success-600";
    bgIcon = "bg-success-100";
  } else if (hasImproved) {
    title = "Good progress!";
    message = "You improved, but let's review this concept once more to fully master it.";
    Icon = TrendingUpIcon;
    iconColor = "text-warning-600";
    bgIcon = "bg-warning-100";
  } else {
    title = "Keep practicing!";
    message = "This concept is tricky. We'll try a different approach next time.";
    Icon = AlertCircleIcon;
    iconColor = "text-danger-500";
    bgIcon = "bg-danger-100";
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-20 pt-12 px-5">
      <header className="text-center">
        <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-sm ${bgIcon}`}>
          <Icon className={`h-12 w-12 ${iconColor}`} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-ink">{title}</h1>
        <p className="mt-4 text-xl text-ink-soft max-w-lg mx-auto">{message}</p>
      </header>

      <div className="rounded-[32px] border-2 border-line bg-white p-8 sm:p-12 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-widest text-ink-muted mb-8 text-center">Improvement Report</h2>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
          <div className="text-center">
            <p className="text-sm font-bold text-ink-muted mb-2">Previous Score</p>
            <p className="text-4xl font-black text-ink-soft">{Math.round(previousScore * 100)}%</p>
          </div>
          
          <div className="hidden sm:block">
            <ArrowRightIcon className="h-8 w-8 text-line" />
          </div>
          
          <div className="text-center">
            <p className="text-sm font-bold text-ink-muted mb-2">New Score</p>
            <p className={`text-5xl font-black ${isResolved ? 'text-success-600' : (hasImproved ? 'text-warning-600' : 'text-danger-500')}`}>
              {Math.round(newScore * 100)}%
            </p>
          </div>
        </div>

        {improvement !== 0 && (
          <div className="mt-8 text-center">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-extrabold ${improvement > 0 ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
              {improvement > 0 ? '+' : ''}{Math.round(improvement * 100)}% change
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-8">
        <ButtonLink href="/dashboard" className="px-12 py-4 text-lg">
          Return to Dashboard
        </ButtonLink>
      </div>
    </div>
  );
}

// ArrowRightIcon local mock since it might not be imported above
function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
}
