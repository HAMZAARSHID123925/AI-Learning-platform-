'use client';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon, LayersIcon, SparklesIcon, TrophyIcon } from 'lucide-react';
import { ButtonLink } from '@/components/student/ButtonLink';
import { ProgressBar } from '@/components/student/ProgressBar';
import { StateMessage } from '@/components/student/StateMessage';
import { LearningPath } from '@/components/student/course/LearningPath';
import { useProgress } from '@/contexts/ProgressContext';
import { useAsync } from '@/hooks/useAsync';
import { learningApi } from '@/utils/learningApi';
import { getCourseProgress, isCourseComplete } from '@/utils/progress';
import { courseName, subjectStyles } from '@/utils/subjects';

export default function CourseDetail() {
  const params = useParams();
  const { user } = useAuth();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : (params.courseId || '');
  const { lessons, latestAttempt } = useProgress();
  const savedProgress = useAsync(() => learningApi.getCourseProgressStats(courseId), [courseId, user?.id]);
  const q = useAsync(() => learningApi.getCourse(courseId), [courseId, user?.id]);

  if (q.loading) return <StateMessage kind="loading" title="Loading learning path…" />;
  if (q.error || !q.data) {
    return <StateMessage kind="error" message={q.error?.message} onRetry={q.reload} action={<ButtonLink href="/dashboard/courses" variant="secondary">All courses</ButtonLink>} />;
  }

  const course = q.data;
  const s = subjectStyles[course.subject];
  const progress = getCourseProgress(course, lessons);
  const attempt = latestAttempt(course.id);
  const hasSubmission = Boolean(savedProgress.data?.latest_submission_id);
  const minutes = course.lessons.reduce((n, l) => n + l.minutes, 0);
  const complete = isCourseComplete(course, lessons);

  return (
    <div className="space-y-10">
      <Link href="/dashboard/courses" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-muted transition-colors duration-150 hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> All courses
      </Link>

      <section className={`grid overflow-hidden rounded-[28px] ${s.bg} md:grid-cols-[1.2fr_1fr]`}>
        <div className="flex flex-col p-7 sm:p-9">
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold ${s.soft} ${s.text}`}>
            <s.icon className="h-4 w-4" aria-hidden="true" />
            {courseName(course.grade, course.subject)}
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">{course.title}</h1>
          <p className="mt-2 text-lg text-ink-soft">{course.description}</p>

          {course.lessons.length > 0 &&
          <div className="mt-auto pt-8">
              <div className="mb-2 flex items-center justify-between text-sm font-extrabold">
                <span className="text-ink-soft">{progress.completed} of {progress.total} lessons</span>
                <span className="text-ink">{progress.percent}%</span>
              </div>
              <ProgressBar value={progress.percent} barClassName={s.solid} trackClassName="bg-white" label={`${course.title} progress`} />
              <div className="mt-6">
                {progress.nextLesson ?
              <ButtonLink
                href={`/dashboard/learn/${course.id}/${progress.nextLesson.id}`}
                size="lg"
              >
                    {progress.started ? 'Continue' : 'Start'}: {progress.nextLesson.title} <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                  </ButtonLink> :

              <ButtonLink href={hasSubmission ? `/dashboard/courses/${course.id}/personalized` : `/dashboard/courses/${course.id}/challenge`} size="lg">
                    {hasSubmission ? 'My personalized learning' : 'Take the Challenge Test'} <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                  </ButtonLink>
              }
              </div>
            </div>
          }
        </div>
        <img src={course.image} alt="" className="order-first h-56 w-full object-cover md:order-none md:h-full" />
      </section>

      {course.lessons.length === 0 ?
      <StateMessage kind="empty" title="This path is being built" message="Interactive lessons for this course are on their way. Check back soon!" /> :

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <section aria-labelledby="path-title">
            <h2 id="path-title" className="mb-8 text-2xl font-black text-ink">Your learning path</h2>
            <LearningPath course={course} lessons={lessons} latestAttempt={attempt} />
          </section>

          <aside className="space-y-8 lg:border-l-2 lg:border-line lg:pl-10">
            <section aria-labelledby="about-title">
              <h2 id="about-title" className="text-sm font-black text-ink-muted">About this path</h2>
              <ul className="mt-3 space-y-2 text-[15px] font-bold text-ink">
                <li className="flex items-center gap-2"><LayersIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />{course.lessons.length} interactive lessons</li>
                <li className="flex items-center gap-2"><ClockIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />About {minutes} minutes</li>
                <li className="flex items-center gap-2"><TrophyIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />10-question Challenge Test</li>
              </ul>
            </section>

            <section aria-labelledby="skills-title">
              <h2 id="skills-title" className="text-sm font-black text-ink-muted">Skills you’ll build</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {course.skills.map((sk) =>
              <li key={sk} className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${s.bg} ${s.text}`}>{sk}</li>
              )}
              </ul>
            </section>

            {attempt ?
          <section aria-labelledby="last-title" className="rounded-3xl bg-surface p-5">
                <h2 id="last-title" className="text-sm font-black text-ink-muted">Latest Challenge Test</h2>
                <p className="mt-1 text-3xl font-black text-ink">
                  {attempt.correct}
                  <span className="text-lg text-ink-muted">/{attempt.total}</span>
                </p>
                <Link href={`/dashboard/courses/${course.id}/results`} className="mt-3 inline-flex items-center gap-1 text-sm font-extrabold text-brand-500 hover:text-brand-700">
                  <SparklesIcon className="h-4 w-4" aria-hidden="true" /> View AI analysis
                </Link>
              </section> :

          <p className="rounded-3xl bg-surface p-5 text-sm font-bold text-ink-soft">
                {complete ?
            'Every lesson is done. Take the Challenge Test to unlock your personalized learning.' :
            `Finish all ${course.lessons.length} lessons to unlock the Challenge Test.`}
              </p>
          }
          </aside>
        </div>
      }
    </div>);

}