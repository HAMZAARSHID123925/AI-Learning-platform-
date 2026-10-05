'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, PlusIcon, UploadIcon, CheckCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/shared/Button';
import { adminApi } from '@/utils/adminApi';
import type { Course } from '@/types/learning';
import { toast } from 'sonner';

export function CourseBuilder({ courseId, backUrl }: { courseId: string; backUrl: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCourse = async () => {
    try {
      const data = await adminApi.getCourseDetail(courseId);
      setCourse(data);
    } catch (e) {
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const handleAddModule = async () => {
    const title = prompt('Module title:');
    if (!title) return;
    try {
      await adminApi.createModule(courseId, { title, sequence_order: (course?.modules?.length || 0) + 1 });
      loadCourse();
    } catch (e) {
      toast.error('Failed to create module');
    }
  };

  const handleAddLesson = async (moduleId: string, currentLessonCount: number) => {
    const title = prompt('Lesson title:');
    if (!title) return;
    try {
      await adminApi.createLesson(moduleId, { title, sequence_order: currentLessonCount + 1 });
      loadCourse();
    } catch (e) {
      toast.error('Failed to create lesson');
    }
  };

  const handleMediaUpload = async (file: File, mediaType: 'lesson_video' | 'lesson_thumbnail' | 'course_thumbnail', lessonId?: string) => {
    if (mediaType === 'lesson_video' && !['video/mp4', 'video/webm'].includes(file.type)) {
      toast.error('Please upload an MP4 or WEBM video');
      return;
    }
    if (mediaType !== 'lesson_video' && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WEBP image');
      return;
    }

    try {
      toast.loading('Uploading media directly...', { id: 'upload' });
      await adminApi.directUpload(courseId, file, mediaType, lessonId);
      toast.success('Media uploaded successfully!', { id: 'upload' });
      loadCourse();
    } catch (err: any) {
      toast.error(`Upload error: ${err.message}`, { id: 'upload' });
    }
  };

  const handleEditMarkdown = async (lessonId: string, currentMarkdown: string) => {
    const newMarkdown = prompt('Edit body markdown:', currentMarkdown || '');
    if (newMarkdown === null) return;
    try {
      await adminApi.updateLesson(lessonId, { body_markdown: newMarkdown });
      toast.success('Markdown updated');
      loadCourse();
    } catch (e) {
      toast.error('Failed to update markdown');
    }
  };

  const handlePublishLesson = async (lesson: any) => {
    if (!lesson.bodyMarkdown) {
      toast.error('Lesson must have markdown content to be published');
      return;
    }
    if (!lesson.videoUrl) {
      toast.error('Lesson must have an uploaded video to be published');
      return;
    }
    try {
      await adminApi.publishLesson(lesson.id);
      toast.success('Lesson published');
      loadCourse();
    } catch (e) {
      toast.error('Failed to publish lesson');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading course builder...</div>;
  if (!course) return <div className="p-10 text-center text-danger-600">Course not found or access denied.</div>;

  return (
    <div className="mx-auto max-w-4xl py-8 space-y-8">
      <Link href={backUrl} className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-muted hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Back to Dashboard
      </Link>
      
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-ink">{course.title} (Builder)</h1>
          <p className="text-ink-soft">{course.description || 'No description'}</p>
          <p className="text-sm font-bold text-ink-muted">Status: {(course as any).status || 'draft'}</p>
        </div>
        <div className="flex items-center gap-2">
          {(course as any).status !== 'published' && (
            <Button variant="brand" onClick={async () => {
              try {
                await adminApi.publishCourse(course.id);
                toast.success('Course published');
                loadCourse();
              } catch (e) {
                toast.error('Failed to publish course');
              }
            }}>
              Publish Course
            </Button>
          )}
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm font-bold text-ink hover:bg-line">
          <UploadIcon className="h-4 w-4" /> Course Thumbnail
          <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleMediaUpload(f, 'course_thumbnail');
          }} />
        </label>
        </div>
      </header>

      <div className="space-y-6">
        {course.modules?.map((m) => (
          <section key={m.id} className="rounded-2xl border-2 border-line bg-surface p-6">
            <h2 className="text-xl font-bold">{m.title}</h2>
            <div className="mt-4 space-y-4">
              {m.lessons?.map((l) => (
                <div key={l.id} className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{l.title}</h3>
                      <p className="text-sm text-ink-muted">
                        Status: {l.status} | Video: {l.videoUrl ? 'Yes' : 'No'} | Thumb: {l.thumbnailUrl ? 'Yes' : 'No'} | Markdown: {l.bodyMarkdown ? 'Yes' : 'No'}
                      </p>
                    </div>
                    {l.status !== 'published' && (
                      <Button variant="secondary" onClick={() => handlePublishLesson(l)}>
                        Publish
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="ghost" onClick={() => handleEditMarkdown(l.id, l.bodyMarkdown || '')}>
                      Edit Markdown
                    </Button>
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm font-bold text-ink hover:bg-line">
                      <UploadIcon className="h-4 w-4" /> Video
                      <input type="file" className="hidden" accept="video/mp4,video/webm" onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleMediaUpload(f, 'lesson_video', l.id);
                      }} />
                    </label>
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm font-bold text-ink hover:bg-line">
                      <UploadIcon className="h-4 w-4" /> Thumbnail
                      <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleMediaUpload(f, 'lesson_thumbnail', l.id);
                      }} />
                    </label>
                  </div>
                </div>
              ))}
              <Button variant="ghost" onClick={() => handleAddLesson(m.id, m.lessons?.length || 0)}>
                <PlusIcon className="h-4 w-4" /> Add Lesson
              </Button>
            </div>
          </section>
        ))}
        <Button onClick={handleAddModule}>
          <PlusIcon className="h-4 w-4" /> Add Module
        </Button>
      </div>
    </div>
  );
}
