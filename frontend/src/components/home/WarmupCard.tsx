import React from 'react';
import { Zap } from 'lucide-react';
import { useLearning } from '../../contexts/LearningContext';
import { warmupQuestions } from '../../data/warmup';

export function WarmupCard({ onStart }: {onStart: () => void;}) {
  const { warmupResults, resetWarmup } = useLearning();
  const total = warmupQuestions.length;
  const answered = warmupResults.length;
  const done = answered >= total;
  const correct = warmupResults.filter(Boolean).length;

  const actionLabel = done ? 'Practice again' : answered > 0 ? 'Resume' : 'Start';

  const handleClick = () => {
    if (done) resetWarmup();
    onStart();
  };

  return (
    <section aria-labelledby="warmup-title" className="flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-card md:p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-streak-soft text-streak">
          <Zap className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h2 id="warmup-title" className="text-lg font-semibold">Daily Warmup</h2>
          <p className="text-sm text-muted">{total} quick questions</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted">{done ? 'Done for today' : 'Progress'}</span>
          <span className="text-2xl font-semibold tabular-nums">
            {done ? correct : answered}
            <span className="text-base text-muted"> / {total}</span>
          </span>
        </div>
        <ol className="mt-3 grid grid-cols-5 gap-1.5" aria-label="Warmup answers">
          {Array.from({ length: total }).map((_, i) => {
            const r = warmupResults[i];
            const cls = r === undefined ? 'bg-line' : r ? 'bg-success' : 'bg-danger';
            const label = r === undefined ? 'Not answered' : r ? 'Correct' : 'Incorrect';
            return <li key={i} aria-label={`Question ${i + 1}: ${label}`} className={`h-2.5 rounded-full transition-colors duration-200 ${cls}`} />;
          })}
        </ol>
      </div>

      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex h-14 w-full items-center justify-center rounded-2xl text-lg font-semibold transition-transform duration-150 ease-out-strong active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          done ? 'border-2 border-line bg-white text-ink hover:border-ink' : 'bg-ink text-white'}`
          }>
          
          {actionLabel}
        </button>
      </div>
    </section>);

}