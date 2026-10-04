'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CourseBuilder } from '@/components/teacher/CourseBuilder';

export default function AdminCourseBuilderPage() {
  const { courseId } = useParams() as { courseId: string };
  return <CourseBuilder courseId={courseId} backUrl="/admin/courses" />;
}
