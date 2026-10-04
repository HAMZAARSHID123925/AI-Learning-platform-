'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon, Loader2Icon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { FocusTopBar } from '../lesson/FocusTopBar';
import { OptionButton, type OptionState } from '../lesson/OptionButton';
import { QuestionNav } from './QuestionNav';
import { learningApi } from '@/utils/learningApi';
import type { RealAssessment, Course } from '@/types/learning';

export function RealChallengeRunner({ course, assessment, onFinished }: {course: Course;assessment: RealAssessment; onFinished?: (submissionId: string) => void;}) {
  const router = useRouter();
  const questions = assessment.questions;
  const total = questions.length;
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const unanswered = total - answeredCount;
  const isLast = current === total - 1;
  const question = questions[current];

  const select = useCallback((optionId: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
  }, [question.id]);

  const goTo = useCallback((i: number) => setCurrent(Math.max(0, Math.min(total - 1, i))), [total]);
  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  const submit = async () => {
    setConfirming(false);
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([qId, oId]) => ({
        question_id: qId,
        selected_option_id: oId
      }));
      const result = await learningApi.submitRealAssessment(assessment.id, payload);
      if (onFinished) {
        onFinished(result.id);
      } else {
        router.replace(`/dashboard/courses/${course.id}/results?submissionId=${result.id}`);
      }
    } catch {
      setSubmitting(false);
      toast.error('We couldn’t submit your test. Please try again.');
    }
  };

  const requestSubmit = () => unanswered > 0 ? setConfirming(true) : void submit();

  const getOptionState = (optId: string): OptionState => answers[question.id] === optId ? 'selected' : 'idle';

  return (
    <div className="min-h-screen w-full bg-white">
      <FocusTopBar
        exitTo={`/dashboard/courses/${course.id}`}
        title={`${course.title} · Final Assessment`}
        progress={Math.round(answeredCount / total * 100)}
        barClassName="bg-ink"
        right={<span className="hidden shrink-0 text-sm font-extrabold text-ink-soft sm:block">{answeredCount}/{total} answered</span>} />
      
      <main className="mx-auto max-w-2xl px-5 pb-40 pt-8 sm:px-8">
        <QuestionNav total={total} current={current} answers={questions.map(q => answers[q.id] ? 1 : null)} onJump={goTo} />
        
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="mt-8">
            
            <div className="space-y-6">
              <p className="text-sm font-black text-ink-muted">Question {current + 1} of {total}</p>
              <h1 className="text-2xl font-black leading-snug tracking-tight text-ink sm:text-[28px]">{question.prompt}</h1>
              
              <div role="radiogroup" aria-label="Answer options" className="grid gap-3 sm:grid-cols-2">
                {question.options.map((opt, i) =>
                  <OptionButton 
                    key={opt.id} 
                    index={i} 
                    label={opt.text} 
                    state={getOptionState(opt.id)} 
                    disabled={false} 
                    onSelect={() => select(opt.id)} 
                  />
                )}
              </div>
            </div>
            
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-line bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Button variant="secondary" size="lg" onClick={prev} disabled={current === 0 || submitting}>
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          {isLast ?
          <Button variant="brand" size="lg" className="flex-1 sm:flex-none sm:px-10" onClick={requestSubmit} disabled={submitting}>
              {submitting ? <Loader2Icon className="h-5 w-5 animate-spin" aria-label="Submitting" /> : <><SendIcon className="h-5 w-5" aria-hidden="true" /> Submit test</>}
            </Button> :

          <Button size="lg" className="flex-1 sm:flex-none sm:px-10" onClick={next}>
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
            
              <h2 id="confirm-title" className="text-2xl font-black text-ink">Submit with {unanswered} unanswered?</h2>
              <p className="mt-2 text-ink-soft">Skipped questions count as incorrect. You can jump back using the numbers at the top.</p>
              <div className="mt-6 flex flex-col gap-3">
                <Button size="lg" autoFocus onClick={() => setConfirming(false)}>Keep going</Button>
                <Button variant="secondary" size="lg" onClick={() => void submit()}>Submit anyway</Button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>
  );
}
