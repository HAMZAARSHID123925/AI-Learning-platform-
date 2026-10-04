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
    CourseDetailResponse,
    CourseResponse,
    CreateCourseRequest,
    CreateLessonRequest,
    CreateModuleRequest,
    LessonDetailResponse,
    LessonResponse,
    ModuleResponse,
    ModuleWithLessonsResponse,
    UpdateCourseRequest,
    UpdateLessonRequest,
    UpdateModuleRequest,
    PresignedUploadRequest,
    PresignedUploadResponse,
    ConfirmUploadRequest,
)
from app.modules.module2_content.services import asset_service, course_service, lesson_service
from app.shared.dependencies import get_current_user, get_optional_current_user, require_permission
from app.shared.pagination import PaginatedResponse, PaginationParams
from app.shared.s3_client import generate_presigned_upload_url, object_exists, generate_presigned_url
from app.shared.exceptions import ValidationError

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
    """
    Create a new course in 'draft' status.
    Requires course:create permission (Instructor or Admin).
    """
    course = await course_service.create_course(
        db=db,
        instructor_id=current_user.id,
        title=body.title,
        description=body.description,
        slug=body.slug,
        grade=body.grade,
    )
    return CourseResponse(
        id=course.id,
        instructor_id=course.instructor_id,
        title=course.title,
        slug=course.slug,
        description=course.description,
        status=course.status.value,
        grade=course.grade,
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
    current_user=Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
    page: int = 1,
    page_size: int = 20,
    status_filter: str | None = None,
    grade: int | None = None,
):
    """
    Public visitors and Students see only published courses.
    Instructors see their own courses (all statuses).
    Admins see all courses.
    """
    params = PaginationParams(page=page, page_size=page_size)
    instructor_id = None

    if current_user is None:
        status_filter = "published"
    elif current_user.has_role("Instructor") and not _is_admin(current_user):
        instructor_id = current_user.id
    elif current_user.has_role("Student"):
        status_filter = "published"

    courses, total = await course_service.list_courses(
        db=db, params=params, instructor_id=instructor_id, status_filter=status_filter, grade=grade
    )

    items = [
        CourseResponse(
            id=c.id,
            instructor_id=c.instructor_id,
            title=c.title,
            slug=c.slug,
            description=c.description,
            status=c.status.value,
            grade=c.grade,
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
    response_model=CourseDetailResponse,
    summary="Get course detail with full syllabus",
    tags=["Courses"],
)
async def get_course(
    course_id: uuid.UUID,
    current_user=Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    course = await course_service.get_course(db, course_id)

    modules_data: list[ModuleWithLessonsResponse] = []
    is_staff = current_user is not None and (_is_admin(current_user) or current_user.has_role("Instructor"))

    for m in (course.modules or []):
        lessons_data = [
            LessonResponse(
                id=l.id,
                module_id=l.module_id,
                title=l.title,
                slug=l.slug,
                status=l.status.value,
                sequence_order=l.sequence_order,
                content_version=l.content_version,
                estimated_minutes=l.estimated_minutes,
                video_url=l.video_url,
                thumbnail_url=l.thumbnail_url,
                duration_seconds=l.duration_seconds,
                skill_ids=[ls.skill_id for ls in l.lesson_skills] if "lesson_skills" in l.__dict__ else [],
                published_at=l.published_at,
                created_at=l.created_at,
                updated_at=l.updated_at,
            )
            for l in (m.lessons or [])
        ]
        modules_data.append(
            ModuleWithLessonsResponse(
                id=m.id,
                course_id=m.course_id,
                title=m.title,
                description=m.description,
                sequence_order=m.sequence_order,
                lesson_count=len(lessons_data),
                lessons=lessons_data,
                created_at=m.created_at,
            )
        )

    return CourseDetailResponse(
        id=course.id,
        instructor_id=course.instructor_id,
        title=course.title,
        slug=course.slug,
        description=course.description,
        status=course.status.value,
        grade=course.grade,
        thumbnail_url=course.thumbnail_url,
        module_count=len(course.modules),
        modules=modules_data,
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
        description=body.description, grade=body.grade, thumbnail_url=body.thumbnail_url,
    )
    return CourseResponse(
        id=course.id, instructor_id=course.instructor_id, title=course.title,
        slug=course.slug, description=course.description, status=course.status.value,
        grade=course.grade, thumbnail_url=course.thumbnail_url, module_count=len(course.modules),
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
        grade=course.grade, thumbnail_url=course.thumbnail_url, module_count=len(course.modules),
        created_at=course.created_at, updated_at=course.updated_at,
    )


@router.delete(
    "/courses/{course_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a course",
    tags=["Courses"],
    dependencies=[Depends(require_permission("course:create"))],
)
async def delete_course(
    course_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await course_service.delete_course(
        db=db, course_id=course_id, actor_id=current_user.id, is_admin=_is_admin(current_user)
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
    return LessonResponse(
        id=lesson.id, module_id=lesson.module_id, title=lesson.title,
        slug=lesson.slug, status=lesson.status.value, sequence_order=lesson.sequence_order,
        content_version=lesson.content_version, estimated_minutes=lesson.estimated_minutes,
        skill_ids=body.skill_ids or [], published_at=lesson.published_at,
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

    # Ownership check: Unassigned teacher denied
    if current_user.has_role("Instructor") and not _is_admin(current_user):
        # We need to get the course instructor
        from app.modules.module2_content.models import CourseModule, Course
        from sqlalchemy import select
        result = await db.execute(
            select(Course.instructor_id)
            .join(CourseModule, CourseModule.course_id == Course.id)
            .where(CourseModule.id == lesson.module_id)
        )
        instructor_id = result.scalar()
        if instructor_id != current_user.id:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this lesson's course")

    skill_ids = [ls.skill_id for ls in lesson.lesson_skills]

    # Generate presigned URLs for all attached media/document assets
    from app.config import get_settings
    settings = get_settings()
    
    assets_data: list[AssetResponse] = []
    for a in (lesson.assets or []):
        url = await generate_presigned_url(a.storage_key, expires_in=settings.MEDIA_SIGNED_URL_TTL_SECONDS) if a.storage_key else None
        assets_data.append(
            AssetResponse(
                id=a.id,
                lesson_id=a.lesson_id,
                asset_type=a.asset_type.value,
                original_filename=a.original_filename,
                file_size_bytes=a.file_size_bytes,
                mime_type=a.mime_type,
                presigned_url=url,
                created_at=a.created_at,
            )
        )
        
    # Generate signed urls for lesson media
    video_url = lesson.video_url
    thumbnail_url = lesson.thumbnail_url
    if getattr(lesson, 'video_object_key', None):
        video_url = await generate_presigned_url(lesson.video_object_key, expires_in=settings.MEDIA_SIGNED_URL_TTL_SECONDS)
    if getattr(lesson, 'thumbnail_object_key', None):
        thumbnail_url = await generate_presigned_url(lesson.thumbnail_object_key, expires_in=settings.MEDIA_SIGNED_URL_TTL_SECONDS)

    return LessonDetailResponse(
        id=lesson.id, module_id=lesson.module_id, title=lesson.title,
        slug=lesson.slug, status=lesson.status.value, sequence_order=lesson.sequence_order,
        content_version=lesson.content_version, estimated_minutes=lesson.estimated_minutes,
        skill_ids=skill_ids, published_at=lesson.published_at,
        body_markdown=lesson.body_markdown,
        assets=assets_data,
        video_url=video_url,
        thumbnail_url=thumbnail_url,
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
    skill_ids = body.skill_ids if body.skill_ids is not None else ([ls.skill_id for ls in lesson.lesson_skills] if "lesson_skills" in lesson.__dict__ else [])
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
    skill_ids = [ls.skill_id for ls in lesson.lesson_skills] if "lesson_skills" in lesson.__dict__ else []
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


# =============================================================================
# Presigned Upload Endpoints
# =============================================================================

@router.post(
    "/uploads/presign",
    response_model=PresignedUploadResponse,
    summary="Request a presigned URL for direct S3 upload",
    tags=["Assets"],
    dependencies=[Depends(require_permission("course:create"))],
)
async def request_presigned_upload(
    body: PresignedUploadRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    course = await course_service.get_course(db, body.course_id)
    if not _is_admin(current_user) and course.instructor_id != current_user.id:
        raise ValidationError("You do not have permission to upload to this course")
    
    # File type validation
    if body.media_type == "lesson_video":
        if body.content_type not in ["video/mp4", "video/webm"]:
            raise ValidationError("Invalid video format")
    elif body.media_type in ["lesson_thumbnail", "course_thumbnail"]:
        if body.content_type not in ["image/jpeg", "image/png", "image/webp"]:
            raise ValidationError("Invalid image format")
            
    from app.config import get_settings
    settings = get_settings()

    # File size validation (from config)
    if body.media_type == "lesson_video" and body.size_bytes > settings.MAX_VIDEO_SIZE_BYTES:
        raise ValidationError(f"Video file too large (max {settings.MAX_VIDEO_SIZE_BYTES // (1024*1024)}MB)")
    elif body.media_type in ["lesson_thumbnail", "course_thumbnail"] and body.size_bytes > settings.MAX_IMAGE_SIZE_BYTES:
        raise ValidationError(f"Image file too large (max {settings.MAX_IMAGE_SIZE_BYTES // (1024*1024)}MB)")

    # Generate object key
    ext = body.filename.rsplit(".", 1)[-1].lower() if "." in body.filename else "bin"
    file_uuid = uuid.uuid4()
    if body.media_type == "course_thumbnail":
        object_key = f"course-content/{body.course_id}/thumbnail/{file_uuid}.{ext}"
    else:
        if not body.lesson_id:
            raise ValidationError("lesson_id is required for lesson media")
        
        # Verify lesson belongs to course
        lesson = await lesson_service.get_lesson(db, body.lesson_id)
        if lesson.module.course_id != body.course_id:
            raise ValidationError("Lesson does not belong to course")
            
        folder = "video" if body.media_type == "lesson_video" else "thumbnail"
        object_key = f"course-content/{body.course_id}/lessons/{body.lesson_id}/{folder}/{file_uuid}.{ext}"

    presigned_url = await generate_presigned_upload_url(object_key, body.content_type, expires_in=900)
    
    return PresignedUploadResponse(
        upload_id=object_key,
        presigned_url=presigned_url,
        object_key=object_key,
        expires_in=900
    )


@router.post(
    "/uploads/confirm",
    response_model=dict,
    summary="Confirm a direct S3 upload",
    tags=["Assets"],
    dependencies=[Depends(require_permission("course:create"))],
)
async def confirm_upload(
    body: ConfirmUploadRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    course = await course_service.get_course(db, body.course_id)
    if not _is_admin(current_user) and course.instructor_id != current_user.id:
        raise ValidationError("You do not have permission to confirm upload for this course")

    object_key = body.upload_id

    # Security check: the key must actually belong to the claimed course
    if not object_key.startswith(f"course-content/{body.course_id}/"):
        raise ValidationError("Invalid upload key for this course")
        
    exists = await object_exists(object_key)
    if not exists:
        raise ValidationError("Uploaded file not found in storage")
        
    # Build final url (we also store object_key for generating signed URLs later)
    from app.config import get_settings
    settings = get_settings()
    if settings.S3_ENDPOINT_URL:
        final_url = f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{object_key}"
    else:
        final_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.S3_REGION}.amazonaws.com/{object_key}"
        
    # Update entity
    if body.media_type == "course_thumbnail":
        await course_service.update_course(
            db, body.course_id, current_user.id, _is_admin(current_user), 
            thumbnail_url=final_url, thumbnail_object_key=object_key
        )
    else:
        if not body.lesson_id:
            raise ValidationError("lesson_id is required")
        lesson = await lesson_service.get_lesson(db, body.lesson_id)
        if lesson.module.course_id != body.course_id:
            raise ValidationError("Lesson does not belong to course")
            
        if body.media_type == "lesson_video":
            await lesson_service.update_lesson(
                db, body.lesson_id, current_user.id, _is_admin(current_user), 
                video_url=final_url, video_object_key=object_key
            )
        else:
            await lesson_service.update_lesson(
                db, body.lesson_id, current_user.id, _is_admin(current_user), 
                thumbnail_url=final_url, thumbnail_object_key=object_key
            )

    return {"status": "success", "url": final_url}
