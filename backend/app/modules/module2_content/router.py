"""
ELARION AI Learning Platform — Backend
Module: app/modules/module2_content/router.py

Purpose:
    FastAPI router for Module 2 — Course & Content Management.
    Endpoints for courses, modules, lessons, and file uploads.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.modules.module2_content.schemas import (
    AssetResponse,
    CourseResponse,
    CreateCourseRequest,
    CreateLessonRequest,
    CreateModuleRequest,
    LessonDetailResponse,
    LessonResponse,
    ModuleResponse,
    UpdateCourseRequest,
    UpdateLessonRequest,
    UpdateModuleRequest,
)
from app.modules.module2_content.services import asset_service, course_service, lesson_service
from app.shared.dependencies import get_current_user, require_permission
from app.shared.pagination import PaginatedResponse, PaginationParams

router = APIRouter()


def _is_admin(user) -> bool:
    return user.has_role("Admin")


def _is_instructor_or_admin(user) -> bool:
    return user.has_role("Admin") or user.has_role("Instructor")


# =============================================================================
# Course Endpoints
# =============================================================================

@router.post(
    "/courses",
    response_model=CourseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new course",
    tags=["Courses"],
    dependencies=[Depends(require_permission("course:create"))],
)
async def create_course(
    body: CreateCourseRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    course = await course_service.create_course(
        db=db,
        instructor_id=current_user.id,
        title=body.title,
        description=body.description,
        slug=body.slug,
    )
    return CourseResponse(
        id=course.id,
        instructor_id=course.instructor_id,
        title=course.title,
        slug=course.slug,
        description=course.description,
        status=course.status.value,
        thumbnail_url=course.thumbnail_url,
        module_count=0,
        created_at=course.created_at,
        updated_at=course.updated_at,
    )


@router.get(
    "/courses",
    response_model=PaginatedResponse[CourseResponse],
    summary="List courses",
    tags=["Courses"],
)
async def list_courses(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    page: int = 1,
    page_size: int = 20,
    status_filter: str | None = None,
):
    """
    Students see only published courses.
    Instructors see their own courses (all statuses).
    Admins see all courses.
    """
    params = PaginationParams(page=page, page_size=page_size)
    instructor_id = None

    if current_user.has_role("Instructor") and not _is_admin(current_user):
        instructor_id = current_user.id
    elif current_user.has_role("Student"):
        status_filter = "published"

    courses, total = await course_service.list_courses(
        db=db, params=params, instructor_id=instructor_id, status_filter=status_filter
    )

    items = [
        CourseResponse(
            id=c.id,
            instructor_id=c.instructor_id,
            title=c.title,
            slug=c.slug,
            description=c.description,
            status=c.status.value,
            thumbnail_url=c.thumbnail_url,
            module_count=len(c.modules) if hasattr(c, "modules") and c.modules else 0,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in courses
    ]
    return PaginatedResponse.create(items=items, total=total, params=params)


@router.get(
    "/courses/{course_id}",
    response_model=CourseResponse,
    summary="Get course by ID",
    tags=["Courses"],
)
async def get_course(
    course_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    course = await course_service.get_course(db, course_id)
    return CourseResponse(
        id=course.id,
        instructor_id=course.instructor_id,
        title=course.title,
        slug=course.slug,
        description=course.description,
        status=course.status.value,
        thumbnail_url=course.thumbnail_url,
        module_count=len(course.modules),
        created_at=course.created_at,
        updated_at=course.updated_at,
    )


@router.patch(
    "/courses/{course_id}",
    response_model=CourseResponse,
    summary="Update course",
    tags=["Courses"],
    dependencies=[Depends(require_permission("course:create"))],
)
async def update_course(
    course_id: uuid.UUID,
    body: UpdateCourseRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    course = await course_service.update_course(
        db=db, course_id=course_id, actor_id=current_user.id,
        is_admin=_is_admin(current_user), title=body.title,
        description=body.description, thumbnail_url=body.thumbnail_url,
    )
    return CourseResponse(
        id=course.id, instructor_id=course.instructor_id, title=course.title,
        slug=course.slug, description=course.description, status=course.status.value,
        thumbnail_url=course.thumbnail_url, module_count=len(course.modules),
        created_at=course.created_at, updated_at=course.updated_at,
    )


@router.post(
    "/courses/{course_id}/publish",
    response_model=CourseResponse,
    summary="Publish a course",
    tags=["Courses"],
    dependencies=[Depends(require_permission("course:create"))],
)
async def publish_course(
    course_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    course = await course_service.publish_course(
        db=db, course_id=course_id, actor_id=current_user.id, is_admin=_is_admin(current_user)
    )
    return CourseResponse(
        id=course.id, instructor_id=course.instructor_id, title=course.title,
        slug=course.slug, description=course.description, status=course.status.value,
        thumbnail_url=course.thumbnail_url, module_count=len(course.modules),
        created_at=course.created_at, updated_at=course.updated_at,
    )


# =============================================================================
# Module Endpoints
# =============================================================================

@router.post(
    "/courses/{course_id}/modules",
    response_model=ModuleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a module within a course",
    tags=["Modules"],
    dependencies=[Depends(require_permission("course:create"))],
)
async def create_module(
    course_id: uuid.UUID,
    body: CreateModuleRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    module = await course_service.create_module(
        db=db, course_id=course_id, actor_id=current_user.id,
        is_admin=_is_admin(current_user), title=body.title,
        description=body.description, sequence_order=body.sequence_order,
    )
    return ModuleResponse(
        id=module.id, course_id=module.course_id, title=module.title,
        description=module.description, sequence_order=module.sequence_order,
        lesson_count=0, created_at=module.created_at,
    )


# =============================================================================
# Lesson Endpoints
# =============================================================================

@router.post(
    "/modules/{module_id}/lessons",
    response_model=LessonResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a lesson in a module",
    tags=["Lessons"],
    dependencies=[Depends(require_permission("course:create"))],
)
async def create_lesson(
    module_id: uuid.UUID,
    body: CreateLessonRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lesson = await lesson_service.create_lesson(
        db=db, module_id=module_id, actor_id=current_user.id,
        is_admin=_is_admin(current_user), title=body.title, slug=body.slug,
        body_markdown=body.body_markdown, sequence_order=body.sequence_order,
        estimated_minutes=body.estimated_minutes, skill_ids=body.skill_ids,
    )
    skill_ids = [ls.skill_id for ls in lesson.lesson_skills]
    return LessonResponse(
        id=lesson.id, module_id=lesson.module_id, title=lesson.title,
        slug=lesson.slug, status=lesson.status.value, sequence_order=lesson.sequence_order,
        content_version=lesson.content_version, estimated_minutes=lesson.estimated_minutes,
        skill_ids=skill_ids, published_at=lesson.published_at,
        created_at=lesson.created_at, updated_at=lesson.updated_at,
    )


@router.get(
    "/lessons/{lesson_id}",
    response_model=LessonDetailResponse,
    summary="Get lesson detail",
    tags=["Lessons"],
)
async def get_lesson(
    lesson_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a lesson. Students are blocked from locked lessons (403 LESSON_LOCKED).
    This check is enforced by check_lesson_access called within the service.
    """
    # Lesson gating: enforced for Student role
    if current_user.has_role("Student"):
        from app.modules.module4_experience.services.progress_service import check_lesson_access
        await check_lesson_access(db=db, lesson_id=lesson_id, user=current_user)

    lesson = await lesson_service.get_lesson(db, lesson_id)
    skill_ids = [ls.skill_id for ls in lesson.lesson_skills]
    return LessonDetailResponse(
        id=lesson.id, module_id=lesson.module_id, title=lesson.title,
        slug=lesson.slug, status=lesson.status.value, sequence_order=lesson.sequence_order,
        content_version=lesson.content_version, estimated_minutes=lesson.estimated_minutes,
        skill_ids=skill_ids, published_at=lesson.published_at,
        body_markdown=lesson.body_markdown,
        created_at=lesson.created_at, updated_at=lesson.updated_at,
    )


@router.patch(
    "/lessons/{lesson_id}",
    response_model=LessonResponse,
    summary="Update a lesson",
    tags=["Lessons"],
    dependencies=[Depends(require_permission("course:create"))],
)
async def update_lesson(
    lesson_id: uuid.UUID,
    body: UpdateLessonRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lesson = await lesson_service.update_lesson(
        db=db, lesson_id=lesson_id, actor_id=current_user.id,
        is_admin=_is_admin(current_user), title=body.title,
        body_markdown=body.body_markdown, sequence_order=body.sequence_order,
        estimated_minutes=body.estimated_minutes, skill_ids=body.skill_ids,
    )
    skill_ids = [ls.skill_id for ls in lesson.lesson_skills]
    return LessonResponse(
        id=lesson.id, module_id=lesson.module_id, title=lesson.title,
        slug=lesson.slug, status=lesson.status.value, sequence_order=lesson.sequence_order,
        content_version=lesson.content_version, estimated_minutes=lesson.estimated_minutes,
        skill_ids=skill_ids, published_at=lesson.published_at,
        created_at=lesson.created_at, updated_at=lesson.updated_at,
    )


@router.post(
    "/lessons/{lesson_id}/publish",
    response_model=LessonResponse,
    summary="Publish a lesson (triggers embedding pipeline)",
    tags=["Lessons"],
    dependencies=[Depends(require_permission("course:create"))],
)
async def publish_lesson(
    lesson_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Publish a lesson. Atomically writes an EmbeddingOutbox row
    in the same transaction (Outbox Pattern).
    """
    lesson = await lesson_service.publish_lesson(
        db=db, lesson_id=lesson_id, actor_id=current_user.id, is_admin=_is_admin(current_user)
    )
    skill_ids = [ls.skill_id for ls in lesson.lesson_skills]
    return LessonResponse(
        id=lesson.id, module_id=lesson.module_id, title=lesson.title,
        slug=lesson.slug, status=lesson.status.value, sequence_order=lesson.sequence_order,
        content_version=lesson.content_version, estimated_minutes=lesson.estimated_minutes,
        skill_ids=skill_ids, published_at=lesson.published_at,
        created_at=lesson.created_at, updated_at=lesson.updated_at,
    )


# =============================================================================
# Asset Upload Endpoint
# =============================================================================

@router.post(
    "/lessons/{lesson_id}/assets",
    response_model=AssetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a file asset to a lesson",
    tags=["Assets"],
    dependencies=[Depends(require_permission("course:create"))],
)
async def upload_asset(
    lesson_id: uuid.UUID,
    asset_type: str = Form(...),
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a PDF, video, image, or audio file to a lesson."""
    asset = await asset_service.upload_lesson_asset(
        db=db, lesson_id=lesson_id, file=file, asset_type_str=asset_type
    )
    url = await asset_service.generate_presigned_url(asset.storage_key) if asset else None
    return AssetResponse(
        id=asset.id, lesson_id=asset.lesson_id, asset_type=asset.asset_type.value,
        original_filename=asset.original_filename, file_size_bytes=asset.file_size_bytes,
        mime_type=asset.mime_type, presigned_url=None, created_at=asset.created_at,
    )
