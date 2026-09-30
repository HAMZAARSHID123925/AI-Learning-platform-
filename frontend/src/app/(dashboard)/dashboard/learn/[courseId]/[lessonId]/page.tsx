'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { ArrowRightIcon, TrophyIcon } from 'lucide-react';
import { ButtonLink } from '@/components/student/ButtonLink';
import { StateMessage } from '@/components/student/StateMessage';
import { CompletionScreen } from '@/components/student/lesson/CompletionScreen';
import { LessonPlayer } from '@/components/student/lesson/LessonPlayer';
import { useProgress } from '@/contexts/student/ProgressContext';
import { useAsync } from '@/hooks/student/useAsync';
import { learningApi } from '@/utils/student/learningApi';

export default function LearnPage() {
  const params = useParams();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : (params.courseId || '');
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : (params.lessonId || '');
  const { updateLessonProgress, completeLesson } = useProgress();
  const q = useAsync(() => learningApi.getLesson(courseId, lessonId), [courseId, lessonId]);

  if (q.loading) {
    return (
      <div className="min-h-screen w-full bg-white pt-24">
        <StateMessage kind="loading" title="Getting your lesson ready…" />
      </div>
    );
  }

  if (q.error || !q.data) {
    return (
      <div className="min-h-screen w-full bg-white px-5 pt-24">
        <StateMessage
          kind="error"
          message={q.error?.message}
          onRetry={q.reload}
          action={
            <ButtonLink href={`/dashboard/courses/${courseId}`} variant="secondary">
              Back to course
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const { course, lesson, index } = q.data;
  const next = course.lessons[index + 1];

  return (
    <LessonPlayer
      key={lesson.id}
      title={course.title}
      subtitle={`Lesson ${index + 1}: ${lesson.title}`}
      subject={course.subject}
      steps={lesson.steps}
      exitTo={`/dashboard/courses/${course.id}`}
      onProgress={(p) => p < 100 && updateLessonProgress(lesson.id, p)}
      onComplete={(score) => completeLesson(lesson.id, score)}
      renderComplete={(score) => (
        <CompletionScreen
          subject={course.subject}
          heading="Lesson complete!"
          message={
            next
              ? `You finished “${lesson.title}”. Up next: ${next.title}.`
              : `That’s every lesson in ${course.title}. Time to show what you know!`
          }
          score={score}
          xp={20 + score.correct * 10}
          actions={
            <>
              {next ? (
                <ButtonLink href={`/dashboard/learn/${course.id}/${next.id}`} size="lg">
                  Next lesson <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                </ButtonLink>
              ) : (
                <ButtonLink href={`/dashboard/courses/${course.id}/challenge`} size="lg" variant="brand">
                  <TrophyIcon className="h-5 w-5" aria-hidden="true" /> Take the Challenge Test
                </ButtonLink>
              )}
              <ButtonLink href={`/dashboard/courses/${course.id}`} size="lg" variant="secondary">
                Back to learning path
              </ButtonLink>
            </>
          }
        />
      )}
    />
  );
}
