'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { InteractionProps } from './types';

interface WordTapProps extends InteractionProps {
  tokens: string[];
  targets: number[];
}

export function WordTap({ tokens, targets, solved, onSolved, tone }: WordTapProps) {
  const [found, setFound] = useState<Set<number>>(new Set());
  const [miss, setMiss] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!solved && found.size === targets.length) onSolved();
  }, [found, targets.length, solved, onSolved]);

  const tap = (i: number) => {
    if (solved || found.has(i)) return;
    if (targets.includes(i)) {
      setFound((prev) => new Set(prev).add(i));
    } else {
      setMiss(i);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setMiss(null), 450);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="flex max-w-lg flex-wrap justify-center gap-2">
        {tokens.map((t, i) => {
          const isFound = found.has(i);
          const isMiss = miss === i;
          return (
            <motion.button
              key={`${t}-${i}`}
              type="button"
              onClick={() => tap(i)}
              aria-pressed={isFound}
              animate={isMiss ? { x: [0, -5, 5, -3, 0] } : { x: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-xl px-3 py-2 text-lg font-extrabold transition-[background-color,color,box-shadow,transform] duration-150 active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 ${
              isFound ?
              `${tone.solid} text-white shadow-[0_3px_0_0_rgba(22,24,29,0.25)]` :
              isMiss ?
              'bg-danger-50 text-danger-700 shadow-[0_3px_0_0_#E5484D]' :
              'bg-white text-ink shadow-[0_3px_0_0_#E8E9EE] hover:shadow-[0_3px_0_0_#C9CBD3]'}`
              }>
              
              {t}
            </motion.button>);

        })}
      </p>
      <p className="text-sm font-bold text-ink-muted" aria-live="polite">
        {found.size} of {targets.length} found
      </p>
    </div>);

}