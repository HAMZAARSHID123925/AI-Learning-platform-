import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';
import { easeOutStrong } from '../../utils/motion';

type FeedbackMode = 'waiting' | 'correct' | 'wrong' | 'explain';

interface FeedbackBarProps {
  mode: FeedbackMode;
  explanation?: string;
  onContinue: () => void;
}

const praise = ['Nice work!', 'Correct!', 'You got it!', 'Great thinking!'];

export function FeedbackBar({ mode, explanation, onContinue }: FeedbackBarProps) {
  // Stable per answer so re-renders don't swap the message
  const praiseText = useMemo(() => praise[Math.floor(Math.random() * praise.length)], [mode, explanation]);
  const isResult = mode === 'correct' || mode === 'wrong';
  const bg = mode === 'correct' ? 'bg-success-soft' : mode === 'wrong' ? 'bg-danger-soft' : 'bg-white';

  return (
    <div className={`border-t border-line transition-colors duration-200 ${bg}`}>
      <div className="mx-auto flex min-h-[96px] max-w-2xl items-center justify-between gap-4 px-5 py-4">
        <AnimatePresence mode="wait" initial={false}>
          {mode === 'waiting' &&
          <motion.p key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full text-center text-muted">
              Choose an answer
            </motion.p>
          }

          {isResult &&
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: easeOutStrong }}
            className="flex w-full items-center justify-between gap-4"
            role="status">
            
              <div className="flex min-w-0 items-center gap-3">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-white ${mode === 'correct' ? 'bg-success' : 'bg-danger'}`}>
                  {mode === 'correct' ? <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" /> : <X className="h-6 w-6" strokeWidth={3} aria-hidden="true" />}
                </span>
                <div className="min-w-0">
                  <p className={`text-lg font-semibold ${mode === 'correct' ? 'text-success' : 'text-danger'}`}>
                    {mode === 'correct' ? praiseText : 'Not quite'}
                  </p>
                  {mode === 'wrong' && explanation && <p className="text-sm text-ink">{explanation}</p>}
                </div>
              </div>
              <ContinueButton onClick={onContinue} />
            </motion.div>
          }

          {mode === 'explain' &&
          <motion.div key="explain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex w-full justify-end">
              <ContinueButton onClick={onContinue} />
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}

function ContinueButton({ onClick }: {onClick: () => void;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      autoFocus
      className="inline-flex h-14 shrink-0 items-center gap-2 rounded-2xl bg-ink px-7 text-base font-semibold text-white transition-transform duration-150 ease-out-strong active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
      
      Continue
      <ArrowRight className="h-5 w-5" aria-hidden="true" />
    </button>);


}