'use client';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';
import { ArrowRightIcon, TrophyIcon } from 'lucide-react';
import { ButtonLink } from '@/components/student/ButtonLink';
import { StateMessage } from '@/components/student/StateMessage';
import { CompletionScreen } from '@/components/student/lesson/CompletionScreen';
import { LessonPlayer } from '@/components/student/lesson/LessonPlayer';
import { VideoLessonPlayer } from '@/components/student/VideoLessonPlayer';
import { useProgress } from '@/contexts/ProgressContext';
import { useAsync } from '@/hooks/useAsync';
import { learningApi } from '@/utils/learningApi';

export default function Lesson() {
  const params = useParams();
  const { user } = useAuth();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : (params.courseId || '');
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : (params.lessonId || '');
  const previewMode = Boolean(user && user.role !== 'student');
  const { updateLessonProgress, completeLesson } = useProgress();
  const q = useAsync(() => learningApi.getLesson(courseId, lessonId), [courseId, lessonId, user?.id]);

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
          action={<ButtonLink href={`/dashboard/courses/${courseId}`} variant="secondary">Back to course</ButtonLink>}
        />
      </div>
    );
  }

  const { course, lesson, index } = q.data;
  const next = course.lessons[index + 1];

  if (lesson.videoUrl) {
    return (
      <VideoLessonPlayer
        key={lesson.id}
        previewMode={previewMode}
        course={course}
        lesson={lesson}
        index={index}
        exitTo={`/dashboard/courses/${course.id}`}
      />
    );
  }

  return (
    <LessonPlayer
      key={lesson.id}
      title={course.title}
      subtitle={`Lesson ${index + 1}: ${lesson.title}`}
      subject={course.subject}
      steps={lesson.steps}
      exitTo={`/dashboard/courses/${course.id}`}
      onProgress={(p) => !previewMode && p < 100 && updateLessonProgress(lesson.id, p)}
      onComplete={(score) => previewMode ? Promise.resolve() : completeLesson(lesson.id, score)}
      renderComplete={(score) => (
        <CompletionScreen
          subject={course.subject}
          heading={previewMode ? "Lesson preview finished" : "Lesson complete!"}
          message={
            next
              ? `You finished “${lesson.title}”. Up next: ${next.title}.`
              : `That’s every lesson in ${course.title}. Time to show what you know!`
          }
          score={score}
          xp={previewMode ? 0 : 20 + score.correct * 10}
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
