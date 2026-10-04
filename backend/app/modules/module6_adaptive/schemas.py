"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/schemas.py

Purpose:
    Pydantic response and request models for Module 6 — Adaptive Learning Engine.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel

from app.modules.module4_experience.models import PathState
from app.modules.module6_adaptive.models import PlanStatus, WeaknessStatus, VideoJobStatus


class WeaknessFlagResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    skill_id: uuid.UUID
    submission_id: uuid.UUID
    score_at_flag: float
    threshold: float
    status: WeaknessStatus
    created_at: datetime
    resolved_at: datetime | None = None


class RemediationPlanResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    weakness_flag_id: uuid.UUID
    status: PlanStatus
    remedial_course_title: str | None = None
    remedial_course_markdown: str | None = None
    study_completed: bool
    study_completed_at: datetime | None = None
    retest_attempt_count: int
    instructor_escalated: bool
    created_at: datetime
    completed_at: datetime | None = None


class CompleteStudyResponse(BaseModel):
    message: str
    plan: RemediationPlanResponse
    retest_id: uuid.UUID | None = None
    instructor_escalated: bool


class LearningPathStateResponse(BaseModel):
    lesson_id: uuid.UUID
    state: PathState
    locked_reason: str | None = None
    updated_at: datetime


class EscalationResponse(BaseModel):
    plan_id: uuid.UUID
    student_id: uuid.UUID
    weakness_flag_id: uuid.UUID
    retest_attempt_count: int
    created_at: datetime


class VideoGenerationJobCreateRequest(BaseModel):
    weakness_flag_id: uuid.UUID


class VideoGenerationJobResponse(BaseModel):
    id: uuid.UUID
    weakness_flag_id: uuid.UUID
    status: VideoJobStatus
    title: str | None = None
    target_duration_seconds: int | None = None
    video_url: str | None = None
    thumbnail_url: str | None = None
    error_code: str | None = None
    created_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None
