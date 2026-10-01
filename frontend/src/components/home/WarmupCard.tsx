import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcwIcon, TrophyIcon, ZapIcon } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { earlyWarmup, upperWarmup } from '@/data/warmup';
import type { Grade } from '@/types';

type Status = 'idle' | 'playing' | 'done';

export function WarmupCard({ grade }: {grade: Grade;}) {
  const questions = grade <= 3 ? earlyWarmup : upperWarmup;
  const [status, setStatus] = useState<Status>('idle');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const timer = useRef<any>(null);

  const answered = status === 'done' ? questions.length : index + (picked !== null ? 1 : 0);
  const q = questions[index];

  const start = () => {
    setStatus('playing');
    setIndex(0);
    setCorrect(0);
    setPicked(null);
  };

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setCorrect((c) => c + 1);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (index === questions.length - 1) setStatus('done');else
      setIndex((n) => n + 1);
      setPicked(null);
    }, 750);
  };

  return (
    <section aria-labelledby="warmup-title" className="flex flex-col rounded-[28px] border-2 border-line bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-streak-50" aria-hidden="true">
            <ZapIcon className="h-6 w-6 fill-streak-500 text-streak-500" />
          </span>
          <div>
            <h2 id="warmup-title" className="text-lg font-black text-ink">Daily Warmup</h2>
            <p className="text-sm text-ink-muted">5 quick questions</p>
          </div>
        </div>
        <span className="text-sm font-extrabold text-ink-soft">{answered}/{questions.length}</span>
      </div>

      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        {questions.map((_, i) =>
        <span key={i} className={`h-2 flex-1 rounded-full transition-colors duration-200 ${i < answered ? 'bg-streak-500' : 'bg-black/[0.07]'}`} />
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <AnimatePresence mode="wait">
          {status === 'idle' &&
          <motion.div key="idle" exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="mt-auto">
              <Button onClick={start} className="w-full">Start</Button>
            </motion.div>
          }

          {status === 'playing' &&
          <motion.div
            key={`q-${index}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}>
            
              <p className="text-base font-extrabold text-ink">{q.prompt}</p>
              <div className="mt-3 grid gap-2">
                {q.options.map((opt, i) => {
                const isPicked = picked === i;
                const reveal = picked !== null;
                const state = reveal && i === q.answer ? 'correct' : isPicked ? 'wrong' : 'idle';
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => pick(i)}
                    disabled={reveal}
                    className={`rounded-xl border-2 px-4 py-2.5 text-left text-[15px] font-bold transition-[border-color,background-color,transform] duration-150 active:scale-[0.98] ${
                    state === 'correct' ?
                    'border-science-500 bg-science-50 text-science-700' :
                    state === 'wrong' ?
                    'border-danger-500 bg-danger-50 text-danger-700' :
                    'border-line text-ink hover:border-ink/30'}`
                    }>
                    
                      {opt}
                    </button>);

              })}
              </div>
            </motion.div>
          }

          {status === 'done' &&
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-1 flex-col items-center justify-center text-center">
            
              <TrophyIcon className="h-10 w-10 text-math-500" aria-hidden="true" />
              <p className="mt-2 text-xl font-black text-ink">{correct}/{questions.length} correct!</p>
              <p className="text-sm font-bold text-streak-700">+{correct * 5} XP earned</p>
              <Button variant="secondary" size="sm" onClick={start} className="mt-4">
                <RotateCcwIcon className="h-4 w-4" aria-hidden="true" /> Play again
              </Button>
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </section>);

}