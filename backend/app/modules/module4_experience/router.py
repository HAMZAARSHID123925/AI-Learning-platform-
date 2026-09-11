"""
ELARION AI Learning Platform — Backend
Module: app/modules/module4_experience/router.py

Purpose:
    FastAPI router for Module 4 — Student Learning Experience.
    Endpoints: lesson completion, progress, notifications.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.modules.module4_experience.services import progress_service
from app.shared.dependencies import get_current_user

router = APIRouter()


class CompleteLessonRequest(BaseModel):
    time_spent_seconds: int | None = None


@router.post(
    "/lessons/{lesson_id}/complete",
    status_code=status.HTTP_200_OK,
    summary="Mark a lesson as completed",
    tags=["Progress"],
)
async def complete_lesson(
    lesson_id: uuid.UUID,
    body: CompleteLessonRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Mark a lesson as completed for the authenticated student.
    Idempotent: safe to call multiple times.
    Updates LearningPathState to 'mastered'.
    """
    progress = await progress_service.mark_lesson_complete(
        db=db,
        student_id=current_user.id,
        lesson_id=lesson_id,
        time_spent_seconds=body.time_spent_seconds,
    )
    return {
        "message": "Lesson marked as completed.",
        "lesson_id": str(lesson_id),
        "completed_at": progress.completed_at.isoformat() if progress.completed_at else None,
    }


@router.get(
    "/courses/{course_id}/progress",
    summary="Get student progress for a course",
    tags=["Progress"],
)
async def get_course_progress(
    course_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return completion statistics for a student in a course."""
    result = await progress_service.get_course_progress(
        db=db,
        student_id=current_user.id,
        course_id=course_id,
    )
    return result
