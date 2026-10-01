import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { subjectImages } from '@/data/illustrations';
import { subjectStyles } from '@/utils/subjects';
import type { Course } from '@/types';

export function CourseCard({ course, featured = false }: {course: Course;featured?: boolean;}) {
  const s = subjectStyles[course.subject];
  const started = course.completedLessons > 0 || course.nextLesson.progress > 0;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border-2 border-line bg-white transition-[box-shadow,border-color] duration-200 hover:border-ink/15 hover:shadow-lift">
      
      <div className={`relative ${s.bg}`}>
        <img src={subjectImages[course.subject]} alt="" className="h-48 w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
        {featured && <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1 text-xs font-extrabold text-white">Up next</span>}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${s.bg} ${s.text}`}>
          <s.icon className="h-3.5 w-3.5" aria-hidden="true" />
          {s.label}
        </span>
        <h3 className="mt-3 text-2xl font-black tracking-tight text-ink">{course.title}</h3>
        <p className="mt-1.5 text-[15px] text-ink-soft">{course.description}</p>

        <div className="mt-5" aria-label={`${course.completedLessons} of ${course.lessons} lessons complete`}>
          <ol className="flex items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: course.lessons }, (_, i) => {
              const done = i < course.completedLessons;
              const current = i === course.completedLessons;
              return (
                <li
                  key={i}
                  className={`grid h-7 flex-1 place-items-center rounded-lg ${
                  done ? s.solid : current ? `border-2 border-dashed ${s.border} ${s.bg}` : 'bg-surface'}`
                  }>
                  
                  {done && <CheckIcon className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                </li>);

            })}
          </ol>
          <p className="mt-2 text-sm font-bold text-ink-muted">
            {course.completedLessons} of {course.lessons} lessons
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast(`Opening ${course.title} · Lesson ${course.nextLesson.number}`)}
          className="mt-auto inline-flex items-center gap-1.5 self-start pt-6 text-base font-extrabold text-ink transition-colors duration-150 hover:text-brand-500">
          
          {started ? 'Continue' : 'Start course'}
          <ArrowRightIcon className="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </div>
    </motion.article>);

}