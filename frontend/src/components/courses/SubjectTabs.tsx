import React from 'react';
import { motion } from 'framer-motion';
import { subjects } from '../../data/subjects';
import { SubjectId } from '../../types/learning';
import { easeOutStrong } from '../../utils/motion';

export type SubjectFilter = SubjectId | 'all';

interface SubjectTabsProps {
  value: SubjectFilter;
  onChange: (value: SubjectFilter) => void;
}

export function SubjectTabs({ value, onChange }: SubjectTabsProps) {
  const options: {id: SubjectFilter;name: string;}[] = [{ id: 'all', name: 'All' }, ...subjects];

  return (
    <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
      <div role="group" aria-label="Filter by subject" className="flex w-max gap-2">
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.id)}
              className={`relative h-11 whitespace-nowrap rounded-full px-5 text-[15px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              active ? 'text-white' : 'border border-line bg-white text-muted hover:text-ink'}`
              }>
              
              {active &&
              <motion.span layoutId="subject-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.25, ease: easeOutStrong }} />
              }
              <span className="relative">{opt.name}</span>
            </button>);

        })}
      </div>
    </div>);

}