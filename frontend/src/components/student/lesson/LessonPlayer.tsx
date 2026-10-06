'use client';
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FocusTopBar } from './FocusTopBar';
import { LessonFooter } from './LessonFooter';
import { QuestionStepView } from './QuestionStepView';
import { Interaction } from '../interactions/Interaction';
import { Visual, VisualStage } from '../visuals/Visual';
import { useLessonPlayer } from '@/hooks/useLessonPlayer';
import { subjectStyles } from '@/utils/subjects';
import type { Subject } from '@/types';
import type { LessonStep } from '@/types/learning';

interface LessonPlayerProps {
  title: string;
  subtitle?: string;
  subject: Subject;
  steps: LessonStep[];
  exitTo: string;
  onProgress?: (percent: number) => void;
  onComplete: (score: {correct: number;total: number;}) => void | Promise<void>;
  renderComplete: (score: {correct: number;total: number;}, restart: () => void) => React.ReactNode;
}

export function LessonPlayer({ title, subtitle, subject, steps, exitTo, onProgress, onComplete, renderComplete }: LessonPlayerProps) {
  const player = useLessonPlayer(steps, onProgress);
  const { step, finished, correct, totalQuestions } = player;
  const s = subjectStyles[subject];

  const [saveState, setSaveState] = useState<'pending' | 'saved' | 'error'>('pending');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  useEffect(() => {
    if (!finished) return;
    let active = true;
    Promise.resolve().then(() => onComplete({ correct, total: totalQuestions })).then(() => {
      if (active) setSaveState('saved');
    }).catch((error: unknown) => {
      if (active) {
        setSaveError(error instanceof Error ? error.message : 'Could not save completion. Please retry.');
        setSaveState('error');
      }
    });
    return () => { active = false; };
    // Completion is triggered by finishing/retrying, not callback identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, correct, totalQuestions, retryCount]);

  if (finished && saveState !== 'saved') {
    return (
      <div className="min-h-screen w-full bg-white">
        <FocusTopBar exitTo={exitTo} title={title} subtitle={subtitle} progress={100} barClassName={s.solid} />
        <main className="mx-auto max-w-2xl px-5 pt-20 text-center space-y-4">
          {saveState === 'error' ? <>
            <p role="alert" className="text-red-700">{saveError}</p>
            <button className="rounded-full bg-brand-500 px-6 py-3 font-bold text-white" onClick={() => {
              setSaveState('pending'); setSaveError(null); setRetryCount(count => count + 1);
            }}>Retry saving completion</button>
          </> : <p role="status">Saving your lesson completion…</p>}
        </main>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen w-full bg-white">
        <FocusTopBar exitTo={exitTo} title={title} subtitle={subtitle} progress={100} barClassName={s.solid} />
        {renderComplete({ correct, total: totalQuestions }, () => { setSaveState('pending'); setSaveError(null); player.restart(); })}
      </div>);

  }

  if (!step) {
    return (
      <div className="min-h-screen w-full bg-white">
        <FocusTopBar exitTo={exitTo} title={title} subtitle={subtitle} progress={100} barClassName={s.solid} />
        <main className="mx-auto max-w-2xl px-5 pt-20 text-center space-y-4">
          <h2 className="text-2xl font-black text-ink">Lesson content coming soon</h2>
          <p className="text-ink-soft">Interactive steps for this lesson are being built.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <FocusTopBar exitTo={exitTo} title={title} subtitle={subtitle} progress={player.progress} barClassName={s.solid} />
      <main className="mx-auto max-w-2xl px-5 pb-56 pt-10 sm:px-8 sm:pb-44">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={player.index}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>
            
            {step?.kind === 'concept' &&
            <div className="space-y-6">
                <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">{step.title}</h1>
                {step.visual &&
              <VisualStage subject={subject}>
                    <Visual visual={step.visual} subject={subject} />
                  </VisualStage>
              }
                <p className="text-lg leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            }

            {step.kind === 'explore' &&
            <div className="space-y-6">
                <p className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-extrabold ${s.bg} ${s.text}`}>Try it</p>
                <h1 className="-mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">{step.title}</h1>
                <p className="text-lg font-bold text-ink-soft">{step.prompt}</p>
                <VisualStage subject={subject}>
                  <Interaction interaction={step.interaction} subject={subject} solved={player.solved} onSolved={player.markSolved} />
                </VisualStage>
              </div>
            }

            {step.kind === 'question' &&
            <QuestionStepView step={step} subject={subject} selected={player.selected} revealed={player.checked} onSelect={player.select} />
            }
          </motion.div>
        </AnimatePresence>
      </main>

      <LessonFooter
        step={step}
        selected={player.selected}
        checked={player.checked}
        solved={player.solved}
        isCorrect={player.isCorrect}
        isLast={player.index === steps.length - 1}
        onCheck={player.check}
        onNext={player.next} />
      
    </div>);

}