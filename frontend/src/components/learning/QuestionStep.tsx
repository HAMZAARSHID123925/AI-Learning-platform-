import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { ProblemVisual } from './ProblemVisual';
import { QuestionStepData } from '../../types/learning';

interface QuestionStepProps {
  question: QuestionStepData;
  selected: number | null;
  onSelect: (index: number) => void;
}

type OptionState = 'idle' | 'correct' | 'wrong' | 'reveal' | 'dim';

const optionClasses: Record<OptionState, string> = {
  idle: 'border-line bg-white hover:border-primary hover:bg-primary-soft',
  correct: 'border-success bg-success-soft',
  wrong: 'border-danger bg-danger-soft',
  reveal: 'border-success bg-white',
  dim: 'border-line bg-white opacity-50'
};

export function QuestionStep({ question, selected, onSelect }: QuestionStepProps) {
  const answered = selected !== null;

  const stateFor = (i: number): OptionState => {
    if (!answered) return 'idle';
    if (i === selected) return i === question.answer ? 'correct' : 'wrong';
    if (i === question.answer) return 'reveal';
    return 'dim';
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">{question.prompt}</h2>

      {question.visual &&
      <div className="mt-8 flex min-h-[200px] w-full items-center justify-center rounded-3xl border border-line bg-white px-6 py-8">
          <ProblemVisual visual={question.visual} />
        </div>
      }

      <div role="group" aria-label="Answers" className="mt-8 grid w-full gap-3 sm:grid-cols-2">
        {question.options.map((option, i) => {
          const state = stateFor(i);
          return (
            <motion.button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => onSelect(i)}
              whileTap={answered ? undefined : { scale: 0.98 }}
              animate={
              state === 'correct' ?
              { scale: [1, 1.03, 1] } :
              state === 'wrong' ?
              { x: [0, -6, 6, -3, 3, 0] } :
              { scale: 1, x: 0 }
              }
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex min-h-[68px] items-center justify-between gap-3 rounded-2xl border-2 px-5 text-left text-lg font-medium transition-[background-color,border-color,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-default ${optionClasses[state]}`}>
              
              <span>{option}</span>
              {(state === 'correct' || state === 'reveal') &&
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-success text-white">
                  <Check className="h-4 w-4" strokeWidth={3} aria-label="Correct answer" />
                </span>
              }
              {state === 'wrong' &&
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-danger text-white">
                  <X className="h-4 w-4" strokeWidth={3} aria-label="Your answer" />
                </span>
              }
            </motion.button>);

        })}
      </div>
    </div>);

}