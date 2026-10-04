"""
ELARION AI Learning Platform — Backend
Module: app/modules/module4_experience/schemas.py

Purpose:
    Pydantic schemas for Module 4 — Student Learning Experience & Dashboard.
    Defines response schemas for aggregated student dashboards, course progress,
    notifications, and real-time event streams.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class CompleteLessonRequest(BaseModel):
    time_spent_seconds: int | None = Field(default=None, ge=0, description="Time spent on lesson in seconds")


class CompleteLessonResponse(BaseModel):
    message: str
    lesson_id: uuid.UUID
    completed_at: datetime | None = None


class CourseProgressSummary(BaseModel):
    course_id: uuid.UUID
    course_title: str
    course_slug: str
    total_lessons: int
    completed_lessons: int
    locked_lessons: int
    percentage: float = Field(ge=0.0, le=100.0)
    assessment_status: str = Field(
        default="not_started",
        description="'not_started', 'in_progress', or 'completed'"
    )
    latest_submission_id: uuid.UUID | None = None


class NextRecommendedLesson(BaseModel):
    lesson_id: uuid.UUID
    course_id: uuid.UUID
    course_title: str
    module_title: str
    lesson_title: str
    lesson_slug: str
    sequence_order: int
    estimated_minutes: int


class SkillMasteryItem(BaseModel):
    skill_id: uuid.UUID
    skill_name: str
    score: float = Field(ge=0.0, le=1.0)
    status: str = Field(description="'mastered', 'learning', or 'needs_remediation'")


class ActiveRemediationSummary(BaseModel):
    remediation_plan_id: uuid.UUID
    skill_id: uuid.UUID
    skill_name: str
    title: str
    study_completed: bool
    retest_attempt_count: int
    instructor_escalated: bool


class StudentDashboardResponse(BaseModel):
    student_id: uuid.UUID
    student_name: str
    enrolled_courses: list[CourseProgressSummary]
    overall_completion_percentage: float = Field(ge=0.0, le=100.0)
    next_recommended_lesson: NextRecommendedLesson | None = None
    skill_mastery_radar: list[SkillMasteryItem] = Field(default_factory=list)
    active_remediations: list[ActiveRemediationSummary] = Field(default_factory=list)
    unread_notifications_count: int = Field(default=0, ge=0)
    cached_at: datetime | None = None


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    notification_type: str
    title: str
    body: str
    payload: dict[str, Any] | None = None
    read: bool
    read_at: datetime | None = None
    created_at: datetime


class NotificationListResponse(BaseModel):
    items: list[NotificationResponse]
    total: int
    unread_count: int
    page: int
    page_size: int


# =============================================================================
# Enrollment Schemas
# =============================================================================

class EnrollCourseRequest(BaseModel):
    course_id: uuid.UUID


class EnrollmentResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    course_id: uuid.UUID
    status: str
    enrolled_at: datetime
    course_title: str | None = None
    course_slug: str | None = None

    model_config = ConfigDict(from_attributes=True)
