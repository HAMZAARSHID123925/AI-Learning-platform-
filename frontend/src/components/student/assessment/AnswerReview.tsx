'use client';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';
import type { AssessmentAttempt, ChallengeQuestion } from '@/types/student/learning';

export function AnswerReview({ questions, attempt }: {questions: ChallengeQuestion[];attempt: AssessmentAttempt;}) {
  const [open, setOpen] = useState(false);
  const byId = new Map(questions.map((q) => [q.id, q]));
  return (
    <section aria-labelledby="review-title" className="rounded-[28px] border-2 border-line">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 rounded-[28px] p-6 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100">
        
        <span>
          <span id="review-title" className="block text-xl font-black text-ink">Review your answers</span>
          <span className="mt-0.5 block text-sm font-bold text-ink-muted">See every question with the explanation</span>
        </span>
        <ChevronDownIcon className={`h-6 w-6 shrink-0 text-ink-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open &&
        <motion.ol
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="divide-y divide-line overflow-hidden border-t border-line">
          
            {attempt.questionIds.map((id, i) => {
            const q = byId.get(id);
            if (!q) return null;
            const answer = attempt.answers[i];
            const right = answer === q.answer;
            return (
              <li key={id} className="flex gap-4 px-6 py-5">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${right ? 'bg-science-500' : 'bg-danger-500'}`} aria-label={right ? 'Correct' : 'Incorrect'}>
                    {right ? <CheckIcon className="h-4 w-4 text-white" strokeWidth={3} /> : <XIcon className="h-4 w-4 text-white" strokeWidth={3} />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-ink-muted">Question {i + 1} · {q.skill}</p>
                    <p className="mt-0.5 font-black text-ink">{q.prompt}</p>
                    <p className="mt-1 text-sm text-ink-soft">
                      Your answer: <span className={`font-extrabold ${right ? 'text-science-700' : 'text-danger-700'}`}>{answer === null ? 'Skipped' : q.options[answer]}</span>
                      {!right && <> · Correct: <span className="font-extrabold text-ink">{q.options[q.answer]}</span></>}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">{q.explanation}</p>
                  </div>
                </li>);

          })}
          </motion.ol>
        }
      </AnimatePresence>
    </section>);

}