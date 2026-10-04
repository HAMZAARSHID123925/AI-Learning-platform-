'use client';
import React from 'react';
import { PlayIcon, SparklesIcon, TrophyIcon } from 'lucide-react';
import { PathNode, type PathNodeState } from './PathNode';
import { getLessonState, isCourseComplete } from '@/utils/progress';
import { subjectStyles } from '@/utils/subjects';
import type { AssessmentAttempt, Course, LessonProgress } from '@/types/learning';

interface LearningPathProps {
  course: Course;
  lessons: Record<string, LessonProgress>;
  latestAttempt?: AssessmentAttempt;
}

const offsets = ['sm:ml-0', 'sm:ml-16', 'sm:ml-28', 'sm:ml-16'];

export function LearningPath({ course, lessons, latestAttempt }: LearningPathProps) {
  const s = subjectStyles[course.subject];
  const allDone = isCourseComplete(course, lessons);
  const challengeState: PathNodeState = latestAttempt ? 'completed' : allDone ? 'current' : 'locked';
  const planState: PathNodeState = latestAttempt ? 'current' : 'locked';
  const n = course.lessons.length;

  return (
    <ol className="flex flex-col gap-7" aria-label={`${course.title} learning path`}>
      {course.lessons.map((l, i) => {
        const state = getLessonState(course, i, lessons);
        const p = lessons[l.id];
        const note =
        state === 'completed' && p?.score ? `${p.score.correct}/${p.score.total} correct` :
        state === 'current' && p?.progress ? `${p.progress}% done` :
        undefined;
        return (
          <PathNode
            key={l.id}
            state={state}
            href={`/dashboard/learn/${course.id}/${l.id}`}
            icon={PlayIcon}
            meta={`Lesson ${i + 1} · ${l.minutes} min`}
            title={l.title}
            note={note}
            cta={p?.progress ? 'Continue' : 'Start'}
            solidClass={s.solid}
            ringClass={s.ring}
            offsetClass={offsets[i % offsets.length]} />);


      })}
      <PathNode
        state={challengeState}
        href={`/dashboard/courses/${course.id}/challenge`}
        icon={TrophyIcon}
        meta="Challenge Test · 10 questions"
        title={`${course.title} Challenge`}
        note={
        latestAttempt ?
        `Last score ${latestAttempt.correct}/${latestAttempt.total}` :
        allDone ?
        'All lessons done — you’re ready!' :
        'Unlocks after every lesson'
        }
        cta="Start test"
        solidClass="bg-ink"
        ringClass="ring-black/10"
        offsetClass={offsets[n % offsets.length]} />
      
      <PathNode
        state={planState}
        href={`/dashboard/courses/${course.id}/personalized`}
        icon={SparklesIcon}
        meta="Made for you by Elo"
        title="My Personalized Learning"
        note={latestAttempt ? 'Practice built from your test results' : 'Unlocks after the Challenge Test'}
        cta="Open plan"
        solidClass="bg-brand-500"
        ringClass="ring-brand-100"
        offsetClass={offsets[(n + 1) % offsets.length]} />
      
    </ol>);

}