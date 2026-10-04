'use client';
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { flowIcons } from '../visuals/flowIcons';
import type { IconKey } from '@/types/learning';
import type { InteractionProps } from './types';

interface FlowRevealProps extends InteractionProps {
  nodes: {icon: IconKey;label: string;detail: string;}[];
}

export function FlowReveal({ nodes, solved, onSolved, tone }: FlowRevealProps) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!solved && revealed.size === nodes.length) onSolved();
  }, [revealed, nodes.length, solved, onSolved]);

  return (
    <div className="flex flex-col items-center gap-5">
      <ol className="flex flex-wrap items-start justify-center gap-x-2 gap-y-5">
        {nodes.map((n, i) => {
          const Icon = flowIcons[n.icon];
          const open = revealed.has(i);
          return (
            <li key={`${n.label}-${i}`} className="flex items-start gap-2">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setRevealed((prev) => new Set(prev).add(i))}
                className="group flex w-28 flex-col items-center gap-2 text-center focus-visible:outline-none">
                
                <span
                  className={`grid h-16 w-16 place-items-center rounded-2xl transition-[background-color,transform,box-shadow] duration-150 ease-out active:translate-y-[3px] active:shadow-none group-focus-visible:ring-4 group-focus-visible:ring-brand-100 ${
                  open ? `${tone.solid} shadow-[0_4px_0_0_rgba(22,24,29,0.25)]` : 'bg-white shadow-[0_4px_0_0_rgba(22,24,29,0.12)] group-hover:-translate-y-0.5'}`
                  }>
                  
                  <Icon className={`h-8 w-8 ${open ? 'text-white' : tone.text}`} aria-hidden="true" />
                </span>
                <span className="text-sm font-extrabold leading-tight text-ink">{n.label}</span>
                <AnimatePresence initial={false}>
                  {open &&
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                    className="text-xs font-bold leading-snug text-ink-soft">
                    
                      {n.detail}
                    </motion.span>
                  }
                </AnimatePresence>
              </button>
              {i < nodes.length - 1 && <ArrowRightIcon className="mt-5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />}
            </li>);

        })}
      </ol>
      <p className="text-sm font-bold text-ink-muted" aria-live="polite">
        {revealed.size} of {nodes.length} explored
      </p>
    </div>);

}