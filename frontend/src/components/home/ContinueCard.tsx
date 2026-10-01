import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/shared/Button';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { subjectImages } from '@/data/illustrations';
import { subjectStyles } from '@/utils/subjects';
import type { Course } from '@/types';

export function ContinueCard({ course }: {course: Course;}) {
  const s = subjectStyles[course.subject];
  const { nextLesson } = course;
  return (
    <motion.section
      aria-labelledby="continue-title"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className={`relative grid overflow-hidden rounded-[28px] ${s.bg} sm:grid-cols-[1.1fr_1fr]`}>
      
      <div className="flex flex-col p-7 sm:p-9">
        <p className="text-sm font-extrabold text-ink-soft">Continue Learning</p>
        <span className={`mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold ${s.soft} ${s.text}`}>
          <s.icon className="h-4 w-4" aria-hidden="true" />
          {s.label}
        </span>
        <h2 id="continue-title" className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">
          {course.title}
        </h2>
        <p className="mt-2 text-lg font-bold text-ink-soft">
          Lesson {nextLesson.number}: <span className="text-ink">{nextLesson.title}</span>
        </p>

        <div className="mt-auto pt-8">
          <div className="mb-2 flex items-center justify-between text-sm font-extrabold">
            <span className="text-ink-soft">Progress</span>
            <span className="text-ink">{nextLesson.progress}%</span>
          </div>
          <ProgressBar value={nextLesson.progress} barClassName={s.solid} trackClassName="bg-white" label={`${course.title} lesson progress`} />
          <Link href="/dashboard/learn/g5-fractions/fr-1" className="inline-block mt-6">
            <Button size="lg">
              Continue <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
      <img src={subjectImages[course.subject]} alt="" className="order-first h-52 w-full object-cover sm:order-none sm:h-full" />
    </motion.section>);

}