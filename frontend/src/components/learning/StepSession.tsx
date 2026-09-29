import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { ProblemVisual } from './ProblemVisual';
import { QuestionStep } from './QuestionStep';
import { FeedbackBar } from './FeedbackBar';
import { ProgressBar } from '../ProgressBar';
import { LearningStep } from '../../types/learning';
import { easeOutStrong } from '../../utils/motion';

interface StepSessionProps {
  steps: LearningStep[];
  label: string;
  countLabel?: string;
  initialIndex?: number;
  initialResults?: boolean[];
  onClose: () => void;
  onQuestionAnswered?: (correct: boolean) => void;
  finishTitle: string;
  finishActionLabel: string;
  onFinish: () => void;
}

export function StepSession({
  steps,
  label,
  countLabel,
  initialIndex = 0,
  initialResults = [],
  onClose,
  onQuestionAnswered,
  finishTitle,
  finishActionLabel,
  onFinish
}: StepSessionProps) {
  const [index, setIndex] = useState(Math.min(initialIndex, steps.length));
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>(initialResults);
  const finished = index >= steps.length;
  const step = finished ? undefined : steps[index];
  const questionCount = useMemo(() => steps.filter((s) => s.kind === 'question').length, [steps]);

  const answered = selected !== null;
  const progress = finished ? 100 : (index + (answered ? 1 : 0)) / steps.length * 100;

  const handleSelect = (i: number) => {
    if (!step || step.kind !== 'question' || answered) return;
    const correct = i === step.answer;
    setSelected(i);
    setResults((prev) => [...prev, correct]);
    onQuestionAnswered?.(correct);
  };

  const handleContinue = () => {
    setSelected(null);
    setIndex((i) => i + 1);
  };

  const mode = !step ?
  'waiting' :
  step.kind === 'explain' ?
  'explain' :
  !answered ?
  'waiting' :
  selected === step.answer ?
  'correct' :
  'wrong';

  return (
    <div className="flex h-full w-full flex-col bg-canvas text-ink">
      <header className="mx-auto flex w-full max-w-3xl items-center gap-4 px-5 pt-5 md:pt-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-muted transition-colors duration-150 hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1">
          <p className="mb-2 truncate text-sm font-medium text-muted">{label}</p>
          <ProgressBar value={progress} label={`${label} progress`} colorClass="bg-success" heightClass="h-2.5" />
        </div>
        {!finished &&
        <span className="shrink-0 pt-6 text-sm font-semibold tabular-nums text-muted">
            {countLabel ? `${countLabel} ` : ''}
            {index + 1} / {steps.length}
          </span>
        }
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-5 py-10">
          <AnimatePresence mode="wait" initial={false}>
            {step &&
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: easeOutStrong }}>
              
                {step.kind === 'question' ?
              <QuestionStep question={step} selected={selected} onSelect={handleSelect} /> :

              <div className="flex flex-col items-center">
                    <div className="flex min-h-[240px] w-full items-center justify-center rounded-3xl border border-line bg-white px-6 py-10">
                      <ProblemVisual visual={step.visual} />
                    </div>
                    <p className="mt-8 max-w-lg text-center text-2xl font-semibold leading-snug tracking-tight md:text-3xl">{step.text}</p>
                  </div>
              }
              </motion.div>
            }

            {finished &&
            <motion.div
              key="finish"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: easeOutStrong }}
              className="flex flex-col items-center text-center">
              
                <span className="grid h-20 w-20 place-items-center rounded-full bg-success text-white">
                  <Check className="h-10 w-10" strokeWidth={3} aria-hidden="true" />
                </span>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight">{finishTitle}</h2>
                {questionCount > 0 &&
              <>
                    <p className="mt-2 text-lg text-muted">
                      {results.filter(Boolean).length} / {questionCount} correct
                    </p>
                    <ul className="mt-5 flex gap-2" aria-label="Results">
                      {results.map((r, i) =>
                  <li
                    key={i}
                    className={`grid h-9 w-9 place-items-center rounded-full text-white ${r ? 'bg-success' : 'bg-danger'}`}
                    aria-label={r ? 'Correct' : 'Incorrect'}>
                    
                          {r ? <Check className="h-4 w-4" strokeWidth={3} /> : <X className="h-4 w-4" strokeWidth={3} />}
                        </li>
                  )}
                    </ul>
                  </>
              }
                <button
                type="button"
                onClick={onFinish}
                autoFocus
                className="mt-10 inline-flex h-14 items-center rounded-2xl bg-ink px-8 text-base font-semibold text-white transition-transform duration-150 ease-out-strong active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                
                  {finishActionLabel}
                </button>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>

      {!finished && step &&
      <FeedbackBar mode={mode} explanation={step.kind === 'question' ? step.explanation : undefined} onContinue={handleContinue} />
      }
    </div>);

}