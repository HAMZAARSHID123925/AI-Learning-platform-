"""
ELARION AI Learning Platform — Backend
Module: app/modules/module3_live/router.py

Purpose:
    FastAPI router for Module 3 — Live Online Classes & Synchronous Learning.
    Endpoints for live session scheduling, token generation for room joining,
    attendance queries, and secure HMAC-verified provider webhooks.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.modules.module3_live.models import SessionStatus
from app.modules.module3_live.schemas import (
    AttendanceResponse,
    CreateLiveSessionRequest,
    JoinSessionResponse,
    LiveSessionResponse,
    RecordingCompleteWebhook,
    SessionJoinWebhook,
    SessionLeaveWebhook,
    UpdateLiveSessionRequest,
)
from app.modules.module3_live.services import session_service, webhook_service
from app.shared.dependencies import get_current_user, require_permission
from app.shared.exceptions import AuthorizationError

router = APIRouter(tags=["Live Online Classes"])


# =============================================================================
# Session Management Endpoints
# =============================================================================

@router.post(
    "/live-sessions",
    response_model=LiveSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule a new live class session",
    dependencies=[Depends(require_permission("course:create"))],
)
async def create_session(
    body: CreateLiveSessionRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Schedules a new live class session and provisions a room on the video provider.
    Restricted to Instructors and Admins.
    """
    return await session_service.create_live_session(
        db=db,
        instructor_id=current_user.id,
        course_id=body.course_id,
        title=body.title,
        description=body.description,
        scheduled_at=body.scheduled_at,
        duration_minutes=body.duration_minutes,
        max_participants=body.max_participants,
    )


@router.get(
    "/live-sessions",
    response_model=list[LiveSessionResponse],
    summary="List live sessions with filters",
)
async def list_sessions(
    course_id: uuid.UUID | None = None,
    from_dt: datetime | None = None,
    to_dt: datetime | None = None,
    session_status: SessionStatus | None = None,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists scheduled and live class sessions. Accessible to all authenticated users.
    """
    return await session_service.list_live_sessions(
        db=db,
        course_id=course_id,
        from_dt=from_dt,
        to_dt=to_dt,
        status=session_status,
    )


@router.get(
    "/live-sessions/{session_id}",
    response_model=LiveSessionResponse,
    summary="Get live session details",
)
async def get_session(
    session_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns session metadata, scheduled time, and room details.
    """
    return await session_service.get_live_session(db, session_id)


@router.patch(
    "/live-sessions/{session_id}",
    response_model=LiveSessionResponse,
    summary="Update live session details",
)
async def update_session(
    session_id: uuid.UUID,
    body: UpdateLiveSessionRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Updates session metadata. Restricted to the host instructor or Admins.
    """
    return await session_service.update_live_session(
        db=db,
        session_id=session_id,
        user=current_user,
        **body.model_dump(exclude_unset=True),
    )


@router.delete(
    "/live-sessions/{session_id}",
    response_model=LiveSessionResponse,
    summary="Cancel scheduled live session",
)
async def cancel_session(
    session_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Cancels a scheduled session. Live sessions must be ended, not cancelled.
    """
    return await session_service.cancel_live_session(db, session_id, current_user)


@router.post(
    "/live-sessions/{session_id}/join",
    response_model=JoinSessionResponse,
    summary="Join live session and retrieve WebRTC token",
)
async def join_session(
    session_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generates WebRTC room credentials and records student attendance.
    """
    session, token = await session_service.join_live_session(db, session_id, current_user)
    is_host = (session.instructor_id == current_user.id) or current_user.has_role("Admin")
    return JoinSessionResponse(
        session_id=session.id,
        room_url=session.room_url or "",
        token=token,
        is_host=is_host,
        user_id=current_user.id,
        provider=session.video_provider or "mock",
    )


@router.post(
    "/live-sessions/{session_id}/end",
    response_model=LiveSessionResponse,
    summary="End live session and close room",
)
async def end_session(
    session_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Terminates a live session and closes the virtual room. Restricted to host or Admin.
    """
    return await session_service.end_live_session(db, session_id, current_user)


@router.get(
    "/live-sessions/{session_id}/attendance",
    response_model=list[AttendanceResponse],
    summary="View verified attendance logs",
)
async def get_attendance(
    session_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns participant attendance logs and verified attendance flags. Restricted to host or Admin.
    """
    attendances = await session_service.get_session_attendance(db, session_id, current_user)
    return [
        AttendanceResponse(
            id=a.id,
            session_id=a.session_id,
            student_id=a.student_id,
            status=a.status.value,
            joined_at=a.joined_at,
            left_at=a.left_at,
            duration_seconds=a.duration_seconds,
            attendance_verified=a.attendance_verified,
        )
        for a in attendances
    ]


# =============================================================================
# Video Provider Webhooks (Zero-Trust HMAC Verified)
# =============================================================================

@router.post(
    "/webhooks/session-join",
    status_code=status.HTTP_200_OK,
    summary="Provider webhook: Participant joined",
    tags=["Webhooks"],
)
async def webhook_session_join(
    request: Request,
    body: SessionJoinWebhook,
    db: AsyncSession = Depends(get_db),
    x_provider_signature: Annotated[str | None, Header()] = None,
):
    raw_bytes = await request.body()
    if not webhook_service.verify_webhook_signature(raw_bytes, x_provider_signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook signature")

    await webhook_service.handle_session_join(
        db=db,
        session_id=body.session_id,
        user_id=body.user_id,
        joined_at=body.joined_at,
    )
    return {"status": "recorded"}


@router.post(
    "/webhooks/session-leave",
    status_code=status.HTTP_200_OK,
    summary="Provider webhook: Participant left",
    tags=["Webhooks"],
)
async def webhook_session_leave(
    request: Request,
    body: SessionLeaveWebhook,
    db: AsyncSession = Depends(get_db),
    x_provider_signature: Annotated[str | None, Header()] = None,
):
    raw_bytes = await request.body()
    if not webhook_service.verify_webhook_signature(raw_bytes, x_provider_signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook signature")

    await webhook_service.handle_session_leave(
        db=db,
        session_id=body.session_id,
        user_id=body.user_id,
        left_at=body.left_at,
    )
    return {"status": "recorded"}


@router.post(
    "/webhooks/recording-complete",
    status_code=status.HTTP_200_OK,
    summary="Provider webhook: Recording complete & archival",
    tags=["Webhooks"],
)
async def webhook_recording_complete(
    request: Request,
    body: RecordingCompleteWebhook,
    db: AsyncSession = Depends(get_db),
    x_provider_signature: Annotated[str | None, Header()] = None,
):
    raw_bytes = await request.body()
    if not webhook_service.verify_webhook_signature(raw_bytes, x_provider_signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook signature")

    await webhook_service.handle_recording_complete(
        db=db,
        session_id=body.session_id,
        recording_url=body.recording_url,
        duration_seconds=body.duration_seconds,
    )
    return {"status": "archived"}
