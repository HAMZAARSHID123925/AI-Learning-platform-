'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CourseLearnIndex() {
  const params = useParams();
  const router = useRouter();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : (params.courseId || '');

  useEffect(() => {
    if (courseId) {
      router.replace(`/dashboard/courses/${courseId}`);
    }
  }, [courseId, router]);

  return null;
}