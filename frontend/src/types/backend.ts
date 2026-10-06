import type { Grade } from './index';
export interface BackendProfile { id: string; email: string; first_name: string; last_name: string; roles: string[]; grade?: Grade | null; }
export interface BackendAssessment {
  id: string; course_id: string | null; lesson_id: string | null; title: string; is_focused_retest: boolean;
  questions: { id: string; skill_id: string; question_type: string; prompt: string; options: {id: string; text: string}[]; max_score: number }[];
}
export interface BackendSubmission {
  id: string; test_id: string; student_id: string; status: string; total_count: number; correct_percentage: number | null;
  skill_scores: {id: string; skill_id: string; skill_name: string | null; score: number; max_score: number}[];
}
export interface BackendWeakness {id: string; skill_id: string; submission_id: string; status: string; score_at_flag: number; threshold: number;}
export interface BackendRemediation {source_submission_id?: string | null;id: string; weakness_flag_id: string; status: string; remedial_course_title: string | null; remedial_course_markdown: string | null;}
export interface BackendCourseSummary { id: string; title: string; slug: string; grade: Grade; instructor_id: string; status: 'draft' | 'published' | 'archived'; }

export interface BackendLesson {
 id: string; title: string; estimated_minutes?: number; sequence_order?: number; status?: 'draft' | 'published'; video_url?: string; thumbnail_url?: string; duration_seconds?: number; skill_ids?: string[]; body_markdown?: string;
}
export interface BackendCourse extends BackendCourseSummary {
 description?: string; thumbnail_url?: string; modules?: {id: string;title: string;description?: string;lessons: BackendLesson[]}[];
}
export interface BackendEnrollment {id: string;course_id: string;student_id: string;status: string;}
export interface BackendCourseProgress {course_id: string;course_title: string;course_slug: string;total_lessons: number;completed_lessons: number;percentage: number;assessment_status: string;latest_submission_id: string | null;}
export interface BackendDashboard {
 student_id: string; student_name: string; streak_days?: number; enrolled_courses: BackendCourseProgress[];overall_completion_percentage: number;
 next_recommended_lesson: {lesson_id: string;course_id: string;lesson_title: string;course_title: string} | null;
 skill_mastery_radar: {skill_id: string;skill_name: string;score: number;status: string}[];
 active_remediations: {remediation_plan_id: string;skill_id: string;skill_name: string;title: string}[];unread_notifications_count: number;
}
export interface BackendNotification {id: string;title: string;body: string;read: boolean;created_at: string;}
export interface BackendLiveSession {id: string;course_id: string;instructor_id: string;instructor_name?: string;current_participants?: number;title: string;scheduled_at: string;duration_minutes: number;status: string;room_url: string | null;}
