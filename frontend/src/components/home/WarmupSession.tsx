import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StepSession } from '../learning/StepSession';
import { useLearning } from '../../contexts/LearningContext';
import { warmupQuestions } from '../../data/warmup';
import { easeOutStrong } from '../../utils/motion';

interface WarmupSessionProps {
  open: boolean;
  onClose: () => void;
}

export function WarmupSession({ open, onClose }: WarmupSessionProps) {
  const { warmupResults, recordWarmupResult } = useLearning();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Daily Warmup"
        className="fixed inset-0 z-50 bg-canvas"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.22, ease: easeOutStrong }}>
        
          <StepSession
          steps={warmupQuestions}
          label="Daily Warmup"
          countLabel="Question"
          initialIndex={warmupResults.length}
          initialResults={warmupResults}
          onClose={onClose}
          onQuestionAnswered={recordWarmupResult}
          finishTitle="Warmup done"
          finishActionLabel="Back to Home"
          onFinish={onClose} />
        
        </motion.div>
      }
    </AnimatePresence>);

}