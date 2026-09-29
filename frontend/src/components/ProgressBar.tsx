import React from 'react';
import { motion } from 'framer-motion';
import { easeOutStrong } from '../utils/motion';

interface ProgressBarProps {
  value: number;
  label: string;
  colorClass?: string;
  trackClass?: string;
  heightClass?: string;
  className?: string;
}

export function ProgressBar({
  value,
  label,
  colorClass = 'bg-primary',
  trackClass = 'bg-line',
  heightClass = 'h-2',
  className = ''
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full overflow-hidden rounded-full ${trackClass} ${heightClass} ${className}`}>
      
      <motion.div
        className={`h-full rounded-full ${colorClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.3, ease: easeOutStrong }} />
      
    </div>);

}