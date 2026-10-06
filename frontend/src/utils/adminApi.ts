import { fetchWithAuth } from '@/lib/api';
import type { Course } from '@/types/learning';
import { mapBackendCourseDetailToFrontendCourse } from './learningApi';

async function getErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return typeof data.detail === 'string' ? data.detail : data.message || (Array.isArray(data.detail) ? data.detail.map((item: {msg: string}) => item.msg).join(' ') : fallback);
  } catch {
    return fallback;
  }
}

const pendingUploads = new WeakMap<File,Map<string,{presign:{presigned_url:string;upload_id:string};uploaded:boolean}>>();
export const adminApi = {
  async listSkills(): Promise<{id: string; name: string}[]> {
    const res = await fetchWithAuth('/skills');
    if (!res.ok) throw new Error('Could not load curriculum skills.');
    return res.json();
  },
  async uploadMedia(courseId: string, file: File, mediaType: string, lessonId?: string) {
    const target=courseId+':'+mediaType+':'+(lessonId || '');
    let pending=pendingUploads.get(file);if(!pending){pending=new Map();pendingUploads.set(file,pending);}
    let entry=pending.get(target);
    if(!entry){entry={presign:await this.requestPresignedUpload(courseId,{
      lesson_id:lessonId,media_type:mediaType,filename:file.name,content_type:file.type,size_bytes:file.size,
    }),uploaded:false};pending.set(target,entry);}
    const presign=entry.presign;
    let uploaded = entry.uploaded;
    if(!uploaded) try {
      const response = await fetch(presign.presigned_url, {
        method: 'PUT', headers: { 'Content-Type': file.type }, body: file,
      });
      uploaded = response.ok;
    } catch { /* The authenticated relay handles browser-to-storage CORS failures. */ }
    if (!uploaded) {
      const form = new FormData();
      form.set('file', file); form.set('course_id', courseId); form.set('upload_id', presign.upload_id);
      form.set('media_type', mediaType); if (lessonId) form.set('lesson_id', lessonId);
      const response = await fetchWithAuth('/uploads/relay', {method: 'POST', body: form});
      if (!response.ok) throw new Error(await getErrorMessage(response, 'Storage upload failed. Your draft is saved; please retry.'));
    }
    entry.uploaded=true;
    const confirmed=await this.confirmUpload(courseId,presign.upload_id,{lesson_id:lessonId,media_type:mediaType});
    pending.delete(target);
    return confirmed;
  },
  async listCourses(params?: { grade?: number; status_filter?: string; page?: number; page_size?: number }) {
    const q = new URLSearchParams();
    if (params?.grade) q.set('grade', String(params.grade));
    if (params?.status_filter) q.set('status_filter', params.status_filter);
    if (params?.page) q.set('page', String(params.page));
    if (params?.page_size) q.set('page_size', String(params.page_size));
    const url = `/courses${q.toString() ? `?${q.toString()}` : ''}`;
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to fetch courses'));
    return res.json();
  },

  async createCourse(data: { title: string; description?: string; grade: number; slug?: string; instructor_id?: string }) {
    const res = await fetchWithAuth('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to create course'));
    return res.json();
  },

  async getCourseDetail(courseId: string): Promise<Course> {
    const res = await fetchWithAuth(`/courses/${courseId}`);
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to fetch course details'));
    const data = await res.json();
    return { ...mapBackendCourseDetailToFrontendCourse(data), status: data.status };
  },

  async updateCourse(courseId: string, data: { title?: string; description?: string; grade?: number; thumbnail_url?: string }) {
    const res = await fetchWithAuth(`/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to update course'));
    return res.json();
  },

  // Module CRUD
  async publishCourse(courseId: string) {
    const res = await fetchWithAuth(`/courses/${courseId}/publish`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to publish course'));
    return res.json();
  },

  async createModule(courseId: string, data: { title: string; description?: string; sequence_order: number }) {
    const res = await fetchWithAuth(`/courses/${courseId}/modules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to create module'));
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
  async createLesson(moduleId: string, data: { title: string; sequence_order: number; slug?: string; skill_ids?: string[] }) {
    const res = await fetchWithAuth(`/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to create lesson'));
    return res.json();
  },

  async updateLesson(lessonId: string, data: { title?: string; body_markdown?: string; sequence_order?: number; estimated_minutes?: number; skill_ids?: string[] }) {
    const res = await fetchWithAuth(`/lessons/${lessonId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to update lesson'));
    return res.json();
  },

  async publishLesson(lessonId: string) {
    const res = await fetchWithAuth(`/lessons/${lessonId}/publish`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to publish lesson'));
    return res.json();
  },

  async deleteLesson(lessonId: string) {
    const res = await fetchWithAuth(`/lessons/${lessonId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to delete lesson'));
  },

  // Uploads
  async requestPresignedUpload(courseId: string, data: { lesson_id?: string; media_type: string; filename: string; content_type: string; size_bytes: number }) {
    const res = await fetchWithAuth('/uploads/presign', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId, ...data }),
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to request upload URL'));
    return res.json();
  },

  async confirmUpload(courseId: string, uploadId: string, data: { lesson_id?: string; media_type: string }) {
    const res = await fetchWithAuth('/uploads/confirm', {
      method: 'POST',
      body: JSON.stringify({ upload_id: uploadId, course_id: courseId, ...data }),
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to confirm upload'));
    return res.json();
  },

  async directUpload(courseId: string, file: File, mediaType: string, lessonId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('media_type', mediaType);
    if (lessonId) formData.append('lesson_id', lessonId);

    const res = await fetchWithAuth(`/courses/${courseId}/direct-upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Direct upload failed'));
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

