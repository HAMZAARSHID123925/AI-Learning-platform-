'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface ProgressBarProps {
  value: number;
  barClassName?: string;
  trackClassName?: string;
  label?: string;
}

export function ProgressBar({ value, barClassName, trackClassName, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progress'}
      className={twMerge('h-2.5 w-full overflow-hidden rounded-full bg-black/[0.07]', trackClassName)}>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className={twMerge('h-full rounded-full bg-ink', barClassName)} />
      
    </div>);

}