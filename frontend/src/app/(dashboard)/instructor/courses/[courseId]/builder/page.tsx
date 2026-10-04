'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CourseBuilder } from '@/components/teacher/CourseBuilder';

export default function CourseBuilderPage() {
  const { courseId } = useParams() as { courseId: string };
  return <CourseBuilder courseId={courseId} backUrl={`/dashboard/instructor/courses/${courseId}`} />;
}
