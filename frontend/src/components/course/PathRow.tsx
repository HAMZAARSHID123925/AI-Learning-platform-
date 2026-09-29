import React from 'react';
import { motion } from 'framer-motion';
import { easeOutStrong } from '../../utils/motion';

export type RailLine = 'none' | 'reached' | 'pending';

interface PathRowProps {
  node: React.ReactNode;
  top: RailLine;
  bottom: RailLine;
  index: number;
  children: React.ReactNode;
}

export function PathRow({ node, top, bottom, index, children }: PathRowProps) {
  const lineClass = (line: RailLine) => line === 'reached' ? 'bg-success' : 'bg-line';

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.03, 0.3), ease: easeOutStrong }}
      className="flex gap-4">
      
      <div className="relative flex w-12 shrink-0 items-center justify-center">
        {top !== 'none' && <span aria-hidden="true" className={`absolute left-1/2 top-0 h-1/2 w-[3px] -translate-x-1/2 ${lineClass(top)}`} />}
        {bottom !== 'none' && <span aria-hidden="true" className={`absolute bottom-0 left-1/2 h-1/2 w-[3px] -translate-x-1/2 ${lineClass(bottom)}`} />}
        <div className="relative z-10">{node}</div>
      </div>
      <div className="min-w-0 flex-1 py-2">{children}</div>
    </motion.li>);

}