import { fetchWithAuth } from '@/lib/api';
import type { Course, Lesson } from '@/types/learning';

export const adminApi = {
  // Course CRUD
  async createCourse(data: { title: string; description?: string; grade: number; slug?: string }) {
    const res = await fetchWithAuth('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create course');
    return res.json();
  },

  async getCourseDetail(courseId: string): Promise<Course> {
    const res = await fetchWithAuth(`/courses/${courseId}`);
    if (!res.ok) throw new Error('Failed to fetch course details');
    return res.json();
  },

  async updateCourse(courseId: string, data: { title?: string; description?: string; grade?: number; thumbnail_url?: string }) {
    const res = await fetchWithAuth(`/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update course');
    return res.json();
  },

  // Module CRUD
  async createModule(courseId: string, data: { title: string; description?: string; sequence_order: number }) {
    const res = await fetchWithAuth(`/courses/${courseId}/modules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create module');
    return res.json();
  },

  async updateModule(moduleId: string, data: { title?: string; description?: string; sequence_order?: number }) {
    const res = await fetchWithAuth(`/modules/${moduleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update module');
    return res.json();
  },

  async deleteModule(moduleId: string) {
    const res = await fetchWithAuth(`/modules/${moduleId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete module');
  },

  // Lesson CRUD
  async createLesson(moduleId: string, data: { title: string; sequence_order: number; slug?: string }) {
    const res = await fetchWithAuth(`/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create lesson');
    return res.json();
  },

  async updateLesson(lessonId: string, data: { title?: string; body_markdown?: string; sequence_order?: number; estimated_minutes?: number }) {
    const res = await fetchWithAuth(`/lessons/${lessonId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update lesson');
    return res.json();
  },

  async publishLesson(lessonId: string) {
    const res = await fetchWithAuth(`/lessons/${lessonId}/publish`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to publish lesson');
    return res.json();
  },

  async deleteLesson(lessonId: string) {
    const res = await fetchWithAuth(`/lessons/${lessonId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete lesson');
  },

  // Uploads
  async requestPresignedUpload(courseId: string, data: { lesson_id?: string; media_type: string; filename: string; content_type: string; size_bytes: number }) {
    const res = await fetchWithAuth('/uploads/presign', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId, ...data }),
    });
    if (!res.ok) throw new Error('Failed to request upload URL');
    return res.json();
  },

  async confirmUpload(courseId: string, uploadId: string, data: { lesson_id?: string; media_type: string }) {
    const res = await fetchWithAuth('/uploads/confirm', {
      method: 'POST',
      body: JSON.stringify({ upload_id: uploadId, course_id: courseId, ...data }),
    });
    if (!res.ok) throw new Error('Failed to confirm upload');
    return res.json();
  },
};
