'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CheckIcon, ClockIcon, LayersIcon } from 'lucide-react';
import { subjectStyles } from '@/utils/subjects';
import type { Course, CourseCardData, CourseProgress } from '@/types/learning';

interface CourseCardProps {
  course: Course | CourseCardData;
  progress: Pick<CourseProgress, 'completed' | 'total' | 'percent' | 'started'>;
  featured?: boolean;
}

export function CourseCard({ course, progress, featured = false }: CourseCardProps) {
  const s = subjectStyles[course.subject];
  const available = course.lessons.length > 0;
  const minutes = course.lessons.reduce((n, l) => n + l.minutes, 0);
  const done = available && progress.completed === progress.total;
  const cta = done ? 'Review' : progress.started ? 'Continue' : 'Start course';

  return (
    <motion.article
      whileHover={available ? { y: -4 } : undefined}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] border-2 border-line bg-white transition-[box-shadow,border-color] duration-200 ${available ? 'hover:border-ink/15 hover:shadow-lift' : ''}`}>
      
      <div className={`relative ${s.bg}`}>
        <img src={course.image} alt="" className="aspect-[4/3] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
        {featured && <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1 text-xs font-extrabold text-white">Up next</span>}
        {done && <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-science-500 px-3 py-1 text-xs font-extrabold text-white"><CheckIcon className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />Completed</span>}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${s.bg} ${s.text}`}>
          <s.icon className="h-3.5 w-3.5" aria-hidden="true" />
          {s.label}
        </span>
        <h3 className="mt-3 text-2xl font-black tracking-tight text-ink">{course.title}</h3>
        <p className="mt-1.5 text-[15px] text-ink-soft">{course.description}</p>

        {available ?
        <>
            <p className="mt-4 flex items-center gap-4 text-sm font-bold text-ink-muted">
              <span className="inline-flex items-center gap-1.5"><LayersIcon className="h-4 w-4" aria-hidden="true" />{course.lessons.length} lessons</span>
              <span className="inline-flex items-center gap-1.5"><ClockIcon className="h-4 w-4" aria-hidden="true" />{minutes} min</span>
            </p>
            <div className="mt-4" aria-label={`${progress.completed} of ${progress.total} lessons complete`}>
              <ol className="flex items-center gap-1.5" aria-hidden="true">
                {course.lessons.map((l, i) => {
                const isDone = i < progress.completed;
                const current = i === progress.completed;
                return (
                  <li
                    key={l.id}
                    className={`grid h-7 flex-1 place-items-center rounded-lg ${
                    isDone ? s.solid : current ? `border-2 border-dashed ${s.border} ${s.bg}` : 'bg-surface'}`
                    }>
                    
                      {isDone && <CheckIcon className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                    </li>);

              })}
              </ol>
              <p className="mt-2 text-sm font-bold text-ink-muted">
                {progress.completed} of {progress.total} lessons · {progress.percent}%
              </p>
            </div>

            <Link
            href={`/dashboard/courses/${course.id}`}
            className="mt-auto inline-flex items-center gap-1.5 self-start pt-6 text-base font-extrabold text-ink transition-colors duration-150 after:absolute after:inset-0 after:rounded-[28px] hover:text-brand-500 focus-visible:outline-none focus-visible:after:ring-4 focus-visible:after:ring-brand-100">
            
              {cta}
              <ArrowRightIcon className="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </> :

        <p className="mt-auto pt-6 text-sm font-extrabold text-ink-muted">Interactive path coming soon</p>
        }
      </div>
    </motion.article>);

}