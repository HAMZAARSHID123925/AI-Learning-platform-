import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Lock, Play, Trophy } from 'lucide-react';
import { PathRow, RailLine } from './PathRow';
import { Lesson } from '../../types/learning';

interface LessonItemProps {
  lesson: Lesson;
  courseId: string;
  top: RailLine;
  bottom: RailLine;
  index: number;
}

export function LessonItem({ lesson, courseId, top, bottom, index }: LessonItemProps) {
  const eyebrow = lesson.isChallenge ? 'Final' : `Lesson ${lesson.number}`;

  if (lesson.status === 'current') {
    return (
      <PathRow
        index={index}
        top={top}
        bottom={bottom}
        node={
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-white ring-4 ring-canvas">
            {lesson.isChallenge ? (
              <Trophy className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
            )}
          </span>
        }
      >
        <div className="flex flex-col gap-4 rounded-2xl border-2 border-primary bg-primary-soft p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
          <div>
            <p className="text-sm font-semibold text-primary">You’re here · {eyebrow}</p>
            <p className="mt-0.5 text-lg font-semibold">{lesson.title}</p>
          </div>
          <Link
            href={`/dashboard/courses/${courseId}/learn`}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-white transition-transform duration-150 ease-out-strong hover:bg-primary-strong active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {lesson.isChallenge ? 'Start challenge' : 'Continue'}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </PathRow>
    );
  }

  const node =
    lesson.status === 'completed' ? (
      <span className="grid h-10 w-10 place-items-center rounded-full bg-success text-white ring-4 ring-canvas">
        {lesson.isChallenge ? (
          <Trophy className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
        )}
      </span>
    ) : lesson.status === 'locked' ? (
      <span className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-subtle ring-4 ring-canvas">
        <Lock className="h-4 w-4" aria-hidden="true" />
      </span>
    ) : (
      <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-line bg-white text-sm font-semibold text-muted ring-4 ring-canvas">
        {lesson.number}
      </span>
    );

  return (
    <PathRow index={index} top={top} bottom={bottom} node={node}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-sm ${lesson.status === 'locked' ? 'text-subtle' : 'text-muted'}`}>{eyebrow}</p>
          <p
            className={`truncate font-medium ${
              lesson.status === 'locked'
                ? 'text-subtle'
                : lesson.status === 'upcoming'
                ? 'text-muted'
                : 'text-ink'
            }`}
          >
            {lesson.title}
          </p>
        </div>
        {lesson.status === 'completed' && <span className="shrink-0 text-sm font-medium text-success">Done</span>}
        {lesson.status === 'locked' && <span className="shrink-0 text-sm text-subtle">Locked</span>}
      </div>
    </PathRow>
  );
}