"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { StepSession } from '@/components/learning/StepSession';
import { lessonStepsBySubject } from '@/data/lessonSteps';
import { buildModules, getCourse, getCurrentLesson } from '@/utils/courses';

interface CourseLearnPageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseLearnPage({ params }: CourseLearnPageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const router = useRouter();
  const course = courseId ? getCourse(courseId) : undefined;

  if (!course) {
    if (typeof window !== 'undefined') {
      router.replace('/dashboard/courses');
    }
    return null;
  }

  const modules = buildModules(course);
  const lesson = getCurrentLesson(modules) ?? modules[0].lessons[0];
  const steps = lessonStepsBySubject[course.subject];
  const backToCourse = () => router.push(`/dashboard/courses/${course.id}`);

  return (
    <div className="h-[100dvh] w-full bg-canvas fixed inset-0 z-50 overflow-hidden">
      <StepSession
        steps={steps}
        label={`${course.title} · ${lesson.title}`}
        onClose={backToCourse}
        finishTitle="Lesson complete"
        finishActionLabel="Back to course"
        onFinish={backToCourse}
      />
    </div>
  );
}
