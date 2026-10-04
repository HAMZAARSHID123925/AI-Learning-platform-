'use client';
import React from 'react';
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
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : (params.courseId || '');
  const { lessons, latestAttempt } = useProgress();
  const q = useAsync(async () => {
    const [course, progressStats] = await Promise.all([
      learningApi.getCourse(courseId),
      learningApi.getCourseProgress(courseId)
    ]);
    return { course, progressStats };
  }, [courseId]);

  if (q.loading) return <StateMessage kind="loading" title="Loading learning path…" />;
  if (q.error || !q.data) {
    return <StateMessage kind="error" message={q.error?.message} onRetry={q.reload} action={<ButtonLink href="/dashboard/courses" variant="secondary">All courses</ButtonLink>} />;
  }

  const { course, progressStats } = q.data;
  const subjectStr = course.slug?.includes('science') ? 'science' : course.slug?.includes('english') ? 'english' : course.slug?.includes('computer') ? 'computer' : 'math';
  const s = subjectStyles[subjectStr as 'math' | 'science' | 'english' | 'computer'] || subjectStyles['math'];
  const progress = getCourseProgress(course, lessons);
  const courseLessons = course.lessons || [];
  const minutes = courseLessons.reduce((n, l) => n + (l.estimatedMinutes || 10), 0);
  const complete = progressStats.total_lessons > 0 && progressStats.completed_lessons >= progressStats.total_lessons;

  return (
    <div className="space-y-10">
      <Link href="/dashboard/courses" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-muted transition-colors duration-150 hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> All courses
      </Link>

      <section className={`grid overflow-hidden rounded-[28px] ${s.bg} md:grid-cols-[1.2fr_1fr]`}>
        <div className="flex flex-col p-7 sm:p-9">
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold ${s.soft} ${s.text}`}>
            <s.icon className="h-4 w-4" aria-hidden="true" />
            {courseName((course.grade as any) || 5, subjectStr as any)}
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">{course.title}</h1>
          <p className="mt-2 text-lg text-ink-soft">{course.description}</p>

          {courseLessons.length > 0 &&
          <div className="mt-auto pt-8">
              <div className="mb-2 flex items-center justify-between text-sm font-extrabold">
                <span className="text-ink-soft">{progressStats.completed_lessons} of {progressStats.total_lessons} lessons</span>
                <span className="text-ink">{progressStats.percentage}%</span>
              </div>
              <ProgressBar value={progressStats.percentage} barClassName={s.solid} trackClassName="bg-white" label={`${course.title} progress`} />
              <div className="mt-6">
                {progress.nextLesson ?
                  <ButtonLink href={`/dashboard/learn/${course.id}/${progress.nextLesson.id}`} size="lg">
                    {progress.started ? 'Continue' : 'Start'}: {progress.nextLesson.title} <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                  </ButtonLink> :
                  progressStats.assessment_status === 'completed' ?
                    <ButtonLink href={`/dashboard/courses/${course.id}/results?submissionId=${progressStats.latest_submission_id}`} size="lg" variant="secondary">
                      View Assessment Results <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                    </ButtonLink> :
                  progressStats.assessment_status === 'in_progress' ?
                    <ButtonLink href={`/dashboard/courses/${course.id}/challenge`} size="lg">
                      Continue Final Assessment <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                    </ButtonLink> :
                    <ButtonLink href={`/dashboard/courses/${course.id}/challenge`} size="lg">
                      Start Final Assessment <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                    </ButtonLink>
                }
              </div>
            </div>
          }
        </div>
        <img src={course.thumbnailUrl || ''} alt="" className="order-first h-56 w-full object-cover md:order-none md:h-full" />
      </section>

      {courseLessons.length === 0 ?
      <StateMessage kind="empty" title="This path is being built" message="Interactive lessons for this course are on their way. Check back soon!" /> :

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <section aria-labelledby="path-title">
            <h2 id="path-title" className="mb-8 text-2xl font-black text-ink">Your learning path</h2>
            <LearningPath course={course} lessons={lessons} latestAttempt={undefined} />
          </section>

          <aside className="space-y-8 lg:border-l-2 lg:border-line lg:pl-10">
            <section aria-labelledby="about-title">
              <h2 id="about-title" className="text-sm font-black text-ink-muted">About this path</h2>
              <ul className="mt-3 space-y-2 text-[15px] font-bold text-ink">
                <li className="flex items-center gap-2"><LayersIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />{(course.lessons || []).length} interactive lessons</li>
                <li className="flex items-center gap-2"><ClockIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />About {minutes} minutes</li>
                <li className="flex items-center gap-2"><TrophyIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />10-question Challenge Test</li>
              </ul>
            </section>

            <section aria-labelledby="skills-title">
              <h2 id="skills-title" className="text-sm font-black text-ink-muted">Skills you’ll build</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {['Core Concepts', 'Problem Solving'].map((sk) =>
              <li key={sk} className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${s.bg} ${s.text}`}>{sk}</li>
              )}
              </ul>
            </section>

            <p className="rounded-3xl bg-surface p-5 text-sm font-bold text-ink-soft">
              {!complete ?
                `Finish all ${(course.lessons || []).length} lessons to unlock the Final Assessment.` :
                progressStats.assessment_status === 'completed' ?
                  'Final Assessment completed. Personalized review is unlocked.' :
                  'Every lesson is done. Start the Final Assessment to unlock your personalized learning.'}
            </p>
          </aside>
        </div>
      }
    </div>);

}