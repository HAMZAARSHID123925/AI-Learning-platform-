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
  async publishCourse(courseId: string) {
    const res = await fetchWithAuth(`/courses/${courseId}/publish`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to publish course');
    return res.json();
  },

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

  // User & Role Management (Module 1)
  async listUsers(params?: { status_filter?: string; page?: number; page_size?: number }) {
    const q = new URLSearchParams();
    if (params?.status_filter) q.set('status_filter', params.status_filter);
    if (params?.page) q.set('page', String(params.page));
    if (params?.page_size) q.set('page_size', String(params.page_size));
    const url = `/users${q.toString() ? `?${q.toString()}` : ''}`;
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async getUser(userId: string) {
    const res = await fetchWithAuth(`/users/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async updateUser(userId: string, data: { first_name?: string; last_name?: string; is_active?: boolean; grade?: number }) {
    const res = await fetchWithAuth(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  async assignRole(userId: string, roleName: string) {
    const res = await fetchWithAuth(`/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify({ role_name: roleName }),
    });
    if (!res.ok) throw new Error('Failed to assign role');
    return res.json();
  },

  async revokeRole(userId: string, roleName: string) {
    const res = await fetchWithAuth(`/users/${userId}/roles/${roleName}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to revoke role');
    return res.json();
  },

  async deleteCourse(courseId: string) {
    const res = await fetchWithAuth(`/courses/${courseId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete course');
    return res.json();
  },

  // Instructor Escalations (Module 6)
  async listEscalations() {
    const res = await fetchWithAuth('/escalations');
    if (!res.ok) throw new Error('Failed to fetch escalations');
    return res.json();
  },

  // Live Session Scheduling (Module 3)
  async createLiveSession(data: {
    course_id: string;
    title: string;
    scheduled_at: string;
    duration_minutes?: number;
    description?: string;
  }) {
    const res = await fetchWithAuth('/live-sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create live session');
    return res.json();
  },

  async cancelLiveSession(sessionId: string) {
    const res = await fetchWithAuth(`/live-sessions/${sessionId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to cancel live session');
    return res.json();
  },

  async getLiveSessionAttendance(sessionId: string) {
    const res = await fetchWithAuth(`/live-sessions/${sessionId}/attendance`);
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },
};

