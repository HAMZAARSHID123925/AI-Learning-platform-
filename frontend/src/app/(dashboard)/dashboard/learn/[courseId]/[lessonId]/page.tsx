'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { ArrowRightIcon, TrophyIcon } from 'lucide-react';
import { ButtonLink } from '@/components/student/ButtonLink';
import { StateMessage } from '@/components/student/StateMessage';
import { VideoLessonPlayer } from '@/components/student/VideoLessonPlayer';
import { useProgress } from '@/contexts/ProgressContext';
import { useAsync } from '@/hooks/useAsync';
import { learningApi } from '@/utils/learningApi';

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

  return (
    <VideoLessonPlayer
      course={course}
      lesson={lesson}
      index={index}
      exitTo={`/dashboard/courses/${course.id}`}
    />
  );
}
