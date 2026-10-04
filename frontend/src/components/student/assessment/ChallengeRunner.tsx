'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon, Loader2Icon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { FocusTopBar } from '../lesson/FocusTopBar';
import { QuestionStepView } from '../lesson/QuestionStepView';
import { QuestionNav } from './QuestionNav';
import { useProgress } from '@/contexts/ProgressContext';
import { useChallenge } from '@/hooks/useChallenge';
import { scoreAnswers } from '@/utils/assessment';
import { learningApi } from '@/utils/learningApi';
import type { ChallengeQuestion, Course } from '@/types/learning';

export function ChallengeRunner({ course, questions }: {course: Course;questions: ChallengeQuestion[];}) {
  const router = useRouter();
  const { recordAttempt } = useProgress();
  const c = useChallenge(questions);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const total = questions.length;

  const submit = async () => {
    setConfirming(false);
    setSubmitting(true);
    try {
      const saved = await learningApi.submitAssessment({
        id: `att-${Date.now()}`,
        courseId: course.id,
        answers: c.answers,
        questionIds: questions.map((q) => q.id),
        correct: scoreAnswers(questions, c.answers),
        total,
        submittedAt: new Date().toISOString()
      });
      recordAttempt(saved);
      router.replace(`/dashboard/courses/${course.id}/results`);
    } catch {
      setSubmitting(false);
      toast.error('We couldn’t submit your test. Please try again.');
    }
  };

  const requestSubmit = () => c.unanswered > 0 ? setConfirming(true) : void submit();

  return (
    <div className="min-h-screen w-full bg-white">
      <FocusTopBar
        exitTo={`/dashboard/courses/${course.id}`}
        title={`${course.title} · Challenge Test`}
        progress={Math.round(c.answeredCount / total * 100)}
        barClassName="bg-ink"
        right={<span className="hidden shrink-0 text-sm font-extrabold text-ink-soft sm:block">{c.answeredCount}/{total} answered</span>} />
      

      <main className="mx-auto max-w-2xl px-5 pb-40 pt-8 sm:px-8">
        <QuestionNav total={total} current={c.current} answers={c.answers} onJump={c.goTo} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={c.current}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="mt-8">
            
            <QuestionStepView
              step={c.question}
              subject={course.slug?.includes('science') ? 'science' : course.slug?.includes('english') ? 'english' : course.slug?.includes('computer') ? 'computer' : 'math'}
              selected={c.answers[c.current]}
              revealed={false}
              onSelect={c.select}
              eyebrow={<p className="text-sm font-black text-ink-muted">Question {c.current + 1} of {total}</p>} />
            
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-line bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Button variant="secondary" size="lg" onClick={c.prev} disabled={c.current === 0 || submitting}>
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          {c.isLast ?
          <Button variant="brand" size="lg" className="flex-1 sm:flex-none sm:px-10" onClick={requestSubmit} disabled={submitting}>
              {submitting ? <Loader2Icon className="h-5 w-5 animate-spin" aria-label="Submitting" /> : <><SendIcon className="h-5 w-5" aria-hidden="true" /> Submit test</>}
            </Button> :

          <Button size="lg" className="flex-1 sm:flex-none sm:px-10" onClick={c.next}>
              Next <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
            </Button>
          }
        </div>
      </footer>

      <AnimatePresence>
        {confirming &&
        <motion.div
          className="fixed inset-0 z-40 grid place-items-center bg-ink/40 px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setConfirming(false)}>
          
            <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[28px] bg-white p-7 shadow-lift">
            
              <h2 id="confirm-title" className="text-2xl font-black text-ink">Submit with {c.unanswered} unanswered?</h2>
              <p className="mt-2 text-ink-soft">Skipped questions count as incorrect. You can jump back using the numbers at the top.</p>
              <div className="mt-6 flex flex-col gap-3">
                <Button size="lg" autoFocus onClick={() => setConfirming(false)}>Keep going</Button>
                <Button variant="secondary" size="lg" onClick={() => void submit()}>Submit anyway</Button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}