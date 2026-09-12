"""
ELARION AI Learning Platform — Backend
Module: app/modules/module3_live/schemas.py

Purpose:
    Pydantic schemas for Module 3 — Live Online Classes & Synchronous Learning.
    Defines schemas for session creation, updates, room token generation,
    attendance logs, and provider webhooks.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class CreateLiveSessionRequest(BaseModel):
    course_id: uuid.UUID
    title: str = Field(min_length=3, max_length=500, description="Session title")
    description: str | None = Field(default=None, description="Session description")
    scheduled_at: datetime = Field(description="Scheduled start time (UTC)")
    duration_minutes: int = Field(default=60, ge=15, le=360, description="Planned duration in minutes")
    max_participants: int = Field(default=100, ge=2, le=1000, description="Max concurrent participants")


class UpdateLiveSessionRequest(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=500)
    description: str | None = None
    scheduled_at: datetime | None = None
    duration_minutes: int | None = Field(default=None, ge=15, le=360)
    max_participants: int | None = Field(default=None, ge=2, le=1000)


class LiveSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    instructor_id: uuid.UUID
    title: str
    description: str | None = None
    scheduled_at: datetime
    duration_minutes: int
    status: str
    video_provider: str | None = None
    room_id: str | None = None
    room_url: str | None = None
    max_participants: int
    recording_url: str | None = None
    created_at: datetime
    updated_at: datetime


class JoinSessionResponse(BaseModel):
    session_id: uuid.UUID
    room_url: str
    token: str
    is_host: bool
    user_id: uuid.UUID
    provider: str


class AttendanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    session_id: uuid.UUID
    student_id: uuid.UUID
    status: str
    joined_at: datetime | None = None
    left_at: datetime | None = None
    duration_seconds: int | None = None
    attendance_verified: bool


class SessionJoinWebhook(BaseModel):
    session_id: uuid.UUID
    user_id: uuid.UUID
    joined_at: datetime


class SessionLeaveWebhook(BaseModel):
    session_id: uuid.UUID
    user_id: uuid.UUID
    left_at: datetime


class RecordingCompleteWebhook(BaseModel):
    session_id: uuid.UUID
    recording_url: str
    duration_seconds: int
