"""
ELARION AI Learning Platform — Backend
Module: app/modules/module2_content/schemas.py

Purpose:
    Pydantic v2 schemas for Module 2 — Course & Content Management API.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


# =============================================================================
# Course Schemas
# =============================================================================

class CreateCourseRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=3, max_length=500)
    description: str | None = None
    grade: int | None = Field(default=None, ge=1, le=5)
    slug: str | None = None  # Auto-generated if not provided
    instructor_id: uuid.UUID | None = None

    @field_validator("slug", mode="before")
    @classmethod
    def validate_slug(cls, v: str | None) -> str | None:
        if v is not None:
            import re
            v = re.sub(r"[^a-z0-9-]", "", v.lower().replace(" ", "-"))
        return v or None


class UpdateCourseRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=3, max_length=500)
    description: str | None = None
    grade: int | None = Field(default=None, ge=1, le=5)
    thumbnail_url: str | None = None


class CourseResponse(BaseModel):
    id: uuid.UUID
    instructor_id: uuid.UUID
    title: str
    slug: str
    description: str | None
    status: str
    grade: int | None = None
    thumbnail_url: str | None
    module_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CourseCardLessonResponse(BaseModel):
    """Only fields used by card segments, minutes and in-session progress."""
    id: uuid.UUID
    minutes: int
    completed: bool


class CourseCardResponse(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    description: str | None
    grade: int | None
    thumbnail_url: str | None
    lessons: list[CourseCardLessonResponse]


# =============================================================================
# Course Module Schemas
# =============================================================================

class CreateModuleRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=500)
    description: str | None = None
    sequence_order: int = Field(ge=1)


class UpdateModuleRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = None
    sequence_order: int | None = Field(default=None, ge=1)


class ModuleResponse(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    title: str
    description: str | None
    sequence_order: int
    lesson_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Lesson Schemas
# =============================================================================

class CreateLessonRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=500)
    slug: str | None = None
    body_markdown: str | None = None
    sequence_order: int = Field(ge=1)
    estimated_minutes: int | None = Field(default=None, ge=1, le=600)
    video_url: str | None = None
    thumbnail_url: str | None = None
    duration_seconds: int | None = Field(default=None, ge=0)
    skill_ids: list[uuid.UUID] = Field(default_factory=list)

    @field_validator("slug", mode="before")
    @classmethod
    def validate_slug(cls, v: str | None) -> str | None:
        if v is not None:
            import re
            v = re.sub(r"[^a-z0-9-]", "", v.lower().replace(" ", "-"))
        return v or None


class UpdateLessonRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=1, max_length=500)
    body_markdown: str | None = None
    sequence_order: int | None = Field(default=None, ge=1)
    estimated_minutes: int | None = Field(default=None, ge=1, le=600)
    video_url: str | None = None
    thumbnail_url: str | None = None
    duration_seconds: int | None = Field(default=None, ge=0)
    skill_ids: list[uuid.UUID] | None = None


class LessonResponse(BaseModel):
    id: uuid.UUID
    module_id: uuid.UUID
    title: str
    slug: str
    status: str
    sequence_order: int
    content_version: int
    estimated_minutes: int | None
    body_markdown: str | None = None
    video_url: str | None = None
    thumbnail_url: str | None = None
    duration_seconds: int | None = None
    skill_ids: list[uuid.UUID] = Field(default_factory=list)
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Asset Schemas
# =============================================================================

class AssetResponse(BaseModel):
    id: uuid.UUID
    lesson_id: uuid.UUID
    asset_type: str
    original_filename: str
    file_size_bytes: int | None
    mime_type: str | None
    presigned_url: str | None = None  # Generated on-demand
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LessonDetailResponse(LessonResponse):
    """Full lesson with body and assets — used when a student opens a lesson."""
    body_markdown: str | None = None
    assets: list[AssetResponse] = Field(default_factory=list)


class ModuleWithLessonsResponse(ModuleResponse):
    lessons: list[LessonResponse] = Field(default_factory=list)


class CourseDetailResponse(CourseResponse):
    modules: list[ModuleWithLessonsResponse] = Field(default_factory=list)


# =============================================================================
# Upload Schemas
# =============================================================================

class PresignedUploadRequest(BaseModel):
    course_id: uuid.UUID
    lesson_id: uuid.UUID | None = None
    media_type: str = Field(pattern="^(lesson_video|lesson_thumbnail|course_thumbnail)$")
    filename: str
    content_type: str
    size_bytes: int = Field(gt=0)

class PresignedUploadResponse(BaseModel):
    upload_id: str
    presigned_url: str
    object_key: str
    expires_in: int

class ConfirmUploadRequest(BaseModel):
    upload_id: str
    course_id: uuid.UUID
    lesson_id: uuid.UUID | None = None
    media_type: str = Field(pattern="^(lesson_video|lesson_thumbnail|course_thumbnail)$")
