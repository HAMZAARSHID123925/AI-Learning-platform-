'use client';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, LightbulbIcon, XCircleIcon } from 'lucide-react';
import { Button } from '../Button';
import type { LessonStep } from '@/types/student/learning';

interface LessonFooterProps {
  step: LessonStep;
  selected: number | null;
  checked: boolean;
  solved: boolean;
  isCorrect: boolean;
  isLast: boolean;
  onCheck: () => void;
  onNext: () => void;
}

type Tone = 'neutral' | 'success' | 'error';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-white border-line',
  success: 'bg-science-50 border-science-100',
  error: 'bg-danger-50 border-danger-50'
};

export function LessonFooter({ step, selected, checked, solved, isCorrect, isLast, onCheck, onNext }: LessonFooterProps) {
  let tone: Tone = 'neutral';
  let feedback: {title: string;body: string;} | null = null;
  const continueLabel = isLast ? 'Finish' : 'Continue';

  if (step.kind === 'question' && checked) {
    tone = isCorrect ? 'success' : 'error';
    feedback = {
      title: isCorrect ? 'Correct!' : `Not quite — the answer is ${step.options[step.answer]}`,
      body: step.explanation
    };
  }
  if (step.kind === 'explore' && solved) {
    tone = 'success';
    feedback = { title: 'You got it!', body: step.success };
  }

  const Icon = tone === 'success' ? CheckCircle2Icon : XCircleIcon;

  return (
    <footer className={`fixed inset-x-0 bottom-0 z-20 border-t-2 transition-colors duration-200 ${toneClasses[tone]}`}>
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-8 sm:py-5">
        <div className="min-h-[3rem] flex-1" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {feedback ?
            <motion.div
              key={`${tone}-${feedback.title}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="flex items-start gap-3">
              
                <Icon className={`mt-0.5 h-7 w-7 shrink-0 ${tone === 'success' ? 'text-science-500' : 'text-danger-500'}`} aria-hidden="true" />
                <div>
                  <p className={`text-lg font-black ${tone === 'success' ? 'text-science-700' : 'text-danger-700'}`}>{feedback.title}</p>
                  <p className="mt-0.5 text-[15px] text-ink-soft">{feedback.body}</p>
                </div>
              </motion.div> :
            step.kind === 'explore' ?
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex items-center gap-2 text-sm font-bold text-ink-muted">
                <LightbulbIcon className="h-4 w-4" aria-hidden="true" /> Try it above to continue
              </motion.p> :
            null}
          </AnimatePresence>
        </div>

        {step.kind === 'question' && !checked ?
        <Button size="lg" className="w-full sm:w-44" disabled={selected === null} onClick={onCheck}>
            Check
          </Button> :

        <Button size="lg" className="w-full sm:w-44" disabled={step.kind === 'explore' && !solved} onClick={onNext}>
            {continueLabel}
          </Button>
        }
      </div>
    </footer>);

}