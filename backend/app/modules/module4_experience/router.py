"""
ELARION AI Learning Platform — Backend
Module: app/modules/module4_experience/router.py

Purpose:
    FastAPI router for Module 4 — Student Learning Experience & Dashboard.
    Endpoints:
      - Student aggregated dashboard (with Redis cache)
      - Enrolled courses progress
      - Real-time Server-Sent Events (SSE) notification streaming
      - Lesson completion and progress tracking
      - Paginated notifications and read-state management
      - Instructor / Admin student dashboard inspection
"""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.modules.module4_experience.schemas import (
    CompleteLessonRequest,
    CompleteLessonResponse,
    CourseProgressSummary,
    NotificationListResponse,
    NotificationResponse,
    StudentDashboardResponse,
)
from app.modules.module4_experience.services import dashboard_service, notification_service, progress_service, sse_service
from app.shared.dependencies import get_current_user
from app.shared.exceptions import AuthorizationError

router = APIRouter(tags=["Student Experience & Dashboard"])


# =============================================================================
# Dashboard & Courses
# =============================================================================

@router.get(
    "/students/me/dashboard",
    response_model=StudentDashboardResponse,
    summary="Get aggregated student dashboard (Redis-cached)",
)
async def get_my_dashboard(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns student's complete aggregated dashboard:
    enrolled courses, progress %, next recommended lesson,
    skill mastery radar, active remediations, and unread notifications.
    Sub-50ms response via Redis cache.
    """
    return await dashboard_service.get_aggregated_student_dashboard(
        db=db,
        student_id=current_user.id,
        use_cache=True,
    )


@router.get(
    "/students/me/courses",
    response_model=list[CourseProgressSummary],
    summary="Get enrolled courses with progress",
)
async def get_my_courses(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns list of courses the student is learning with completed and locked lesson counts.
    """
    dashboard = await dashboard_service.get_aggregated_student_dashboard(
        db=db,
        student_id=current_user.id,
        use_cache=True,
    )
    return dashboard.enrolled_courses


@router.get(
    "/students/me/events",
    summary="Real-time Server-Sent Events (SSE) stream",
    response_class=StreamingResponse,
)
async def stream_student_events(
    current_user=Depends(get_current_user),
):
    """
    Establishes a persistent Server-Sent Events (SSE) stream.
    Pushes real-time notifications (test graded, remediation ready, lesson unlocked)
    from Redis Pub/Sub directly to the client without polling.
    """
    return StreamingResponse(
        sse_service.student_event_generator(current_user.id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get(
    "/students/{student_id}/dashboard",
    response_model=StudentDashboardResponse,
    summary="View specific student dashboard (Instructor / Admin only)",
)
async def get_student_dashboard_for_staff(
    student_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Allows Instructors and Admins to inspect any student's learning progress,
    skill mastery radar, and active remediation plans.
    """
    if not (current_user.has_role("Instructor") or current_user.has_role("Admin")):
        raise AuthorizationError("Only Instructors and Admins can inspect other students' dashboards.")

    return await dashboard_service.get_aggregated_student_dashboard(
        db=db,
        student_id=student_id,
        use_cache=False,
    )


# =============================================================================
# Lesson Progress
# =============================================================================

@router.post(
    "/lessons/{lesson_id}/complete",
    response_model=CompleteLessonResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark a lesson as completed",
)
async def complete_lesson(
    lesson_id: uuid.UUID,
    body: CompleteLessonRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Marks a lesson as completed for the student.
    Idempotent: safe to call multiple times.
    Updates LearningPathState to 'mastered' and automatically invalidates Redis dashboard cache.
    """
    progress = await progress_service.mark_lesson_complete(
        db=db,
        student_id=current_user.id,
        lesson_id=lesson_id,
        time_spent_seconds=body.time_spent_seconds,
    )
    return CompleteLessonResponse(
        message="Lesson marked as completed.",
        lesson_id=lesson_id,
        completed_at=progress.completed_at,
    )


@router.get(
    "/courses/{course_id}/progress",
    summary="Get course completion statistics",
)
async def get_course_progress(
    course_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return completion statistics (total, completed, locked, percentage) for a course."""
    return await progress_service.get_course_progress(
        db=db,
        student_id=current_user.id,
        course_id=course_id,
    )


# =============================================================================
# Notifications
# =============================================================================

@router.get(
    "/notifications",
    response_model=NotificationListResponse,
    summary="Get paginated student notifications",
)
async def list_notifications(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    unread_only: Annotated[bool, Query()] = False,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists student in-app notifications with read status and unread count.
    """
    items, total, unread_count = await notification_service.get_student_notifications(
        db=db,
        student_id=current_user.id,
        page=page,
        page_size=page_size,
        unread_only=unread_only,
    )
    return NotificationListResponse(
        items=[
            NotificationResponse(
                id=n.id,
                student_id=n.student_id,
                notification_type=n.notification_type.value,
                title=n.title,
                body=n.body,
                payload=n.payload,
                read=n.read,
                read_at=n.read_at,
                created_at=n.created_at,
            )
            for n in items
        ],
        total=total,
        unread_count=unread_count,
        page=page,
        page_size=page_size,
    )


@router.patch(
    "/notifications/{notification_id}/read",
    response_model=NotificationResponse,
    summary="Mark notification as read",
)
async def mark_read(
    notification_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Marks a single notification as read.
    """
    notif = await notification_service.mark_notification_as_read(
        db=db,
        student_id=current_user.id,
        notification_id=notification_id,
    )
    return NotificationResponse(
        id=notif.id,
        student_id=notif.student_id,
        notification_type=notif.notification_type.value,
        title=notif.title,
        body=notif.body,
        payload=notif.payload,
        read=notif.read,
        read_at=notif.read_at,
        created_at=notif.created_at,
    )


@router.post(
    "/notifications/read-all",
    summary="Mark all notifications as read",
)
async def mark_all_read(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Bulk marks all unread notifications as read for current student.
    """
    count = await notification_service.mark_all_notifications_as_read(
        db=db,
        student_id=current_user.id,
    )
    return {
        "message": "All notifications marked as read.",
        "updated_count": count,
    }
