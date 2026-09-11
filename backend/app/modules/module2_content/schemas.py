"""
ELARION AI Learning Platform — Backend
Module: app/modules/module2_content/schemas.py

Purpose:
    Pydantic v2 schemas for Module 2 — Course & Content Management API.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator, model_config


# =============================================================================
# Course Schemas
# =============================================================================

class CreateCourseRequest(BaseModel):
    model_config = model_config(str_strip_whitespace=True)

    title: str = Field(min_length=3, max_length=500)
    description: str | None = None
    slug: str | None = None  # Auto-generated if not provided

    @field_validator("slug", mode="before")
    @classmethod
    def validate_slug(cls, v: str | None) -> str | None:
        if v is not None:
            import re
            v = re.sub(r"[^a-z0-9-]", "", v.lower().replace(" ", "-"))
        return v or None


class UpdateCourseRequest(BaseModel):
    model_config = model_config(str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=3, max_length=500)
    description: str | None = None
    thumbnail_url: str | None = None


class CourseResponse(BaseModel):
    id: uuid.UUID
    instructor_id: uuid.UUID
    title: str
    slug: str
    description: str | None
    status: str
    thumbnail_url: str | None
    module_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = model_config(from_attributes=True)


# =============================================================================
# Course Module Schemas
# =============================================================================

class CreateModuleRequest(BaseModel):
    model_config = model_config(str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=500)
    description: str | None = None
    sequence_order: int = Field(ge=1)


class UpdateModuleRequest(BaseModel):
    model_config = model_config(str_strip_whitespace=True)

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

    model_config = model_config(from_attributes=True)


# =============================================================================
# Lesson Schemas
# =============================================================================

class CreateLessonRequest(BaseModel):
    model_config = model_config(str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=500)
    slug: str | None = None
    body_markdown: str | None = None
    sequence_order: int = Field(ge=1)
    estimated_minutes: int | None = Field(default=None, ge=1, le=600)
    skill_ids: list[uuid.UUID] = Field(default_factory=list)

    @field_validator("slug", mode="before")
    @classmethod
    def validate_slug(cls, v: str | None) -> str | None:
        if v is not None:
            import re
            v = re.sub(r"[^a-z0-9-]", "", v.lower().replace(" ", "-"))
        return v or None


class UpdateLessonRequest(BaseModel):
    model_config = model_config(str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=1, max_length=500)
    body_markdown: str | None = None
    sequence_order: int | None = Field(default=None, ge=1)
    estimated_minutes: int | None = Field(default=None, ge=1, le=600)
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
    skill_ids: list[uuid.UUID] = Field(default_factory=list)
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = model_config(from_attributes=True)


class LessonDetailResponse(LessonResponse):
    """Full lesson with body — used when a student opens a lesson."""
    body_markdown: str | None


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

    model_config = model_config(from_attributes=True)
