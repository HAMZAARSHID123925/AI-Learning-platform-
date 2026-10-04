'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { ButtonLink } from './ButtonLink';
import { ProgressBar } from './ProgressBar';
import { courseName, subjectStyles } from '@/utils/subjects';
import type { Course, CourseProgress } from '@/types/learning';

export function ContinueCard({ course, progress }: {course: Course;progress: CourseProgress;}) {
  const s = subjectStyles[course.subject];
  const { nextLesson } = progress;
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
          {courseName(course.grade, course.subject)}
        </span>
        <h2 id="continue-title" className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">
          {course.title}
        </h2>
        {nextLesson &&
        <p className="mt-2 text-lg font-bold text-ink-soft">
            Lesson {progress.nextLessonNumber}: <span className="text-ink">{nextLesson.title}</span>
          </p>
        }

        <div className="mt-auto pt-8">
          <div className="mb-2 flex items-center justify-between text-sm font-extrabold">
            <span className="text-ink-soft">Lesson progress</span>
            <span className="text-ink">{progress.nextLessonProgress}%</span>
          </div>
          <ProgressBar value={progress.nextLessonProgress} barClassName={s.solid} trackClassName="bg-white" label={`${course.title} lesson progress`} />
          <p className="mt-2 text-sm font-bold text-ink-muted">
            {progress.completed} of {progress.total} lessons complete
          </p>
          {nextLesson &&
          <ButtonLink href={`/dashboard/learn/${course.id}/${nextLesson.id}`} size="lg" className="mt-6">
              Continue <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
            </ButtonLink>
          }
        </div>
      </div>
      <img src={course.image} alt="" className="order-first h-52 w-full object-cover sm:order-none sm:h-full" />
    </motion.section>);

}