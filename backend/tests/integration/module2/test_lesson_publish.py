"""
ELARION AI Learning Platform — Backend
tests/integration/module2/test_lesson_publish.py

Purpose:
    Integration tests for lesson publishing, state machine transitions,
    and the transactional Outbox pattern.
"""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

import uuid
from app.modules.module1_auth.models import User, UserStatus
from app.modules.module2_content.models import (
    Course,
    CourseModule,
    CourseStatus,
    EmbeddingOutbox,
    Lesson,
    LessonStatus,
    OutboxStatus,
)
from app.modules.module2_content.services.lesson_service import publish_lesson
from app.shared.exceptions import InvalidStateTransitionError, PermissionDeniedError


def make_test_user(email: str | None = None) -> User:
    return User(
        email=email or f"instructor_{uuid.uuid4().hex[:8]}@test.elarion.io",
        password_hash="dummy_hash_for_tests",
        first_name="Test",
        last_name="Instructor",
        status=UserStatus.active,
        email_verified=True,
    )


@pytest.mark.asyncio
class TestLessonPublish:
    async def test_publish_lesson_outbox_transaction(self, seeded_db: AsyncSession):
        """
        Publishing a draft lesson must:
        1. Set lesson status to 'published'
        2. Set published_at timestamp
        3. Insert an EmbeddingOutbox row in the SAME transaction with status='pending'
        """
        # Create an instructor user
        user = make_test_user()
        seeded_db.add(user)
        await seeded_db.flush()

        # Create Course -> Module -> Lesson
        course = Course(
            instructor_id=user.id,
            title="AI Foundations",
            slug="ai-foundations-test",
            status=CourseStatus.published,
        )
        seeded_db.add(course)
        await seeded_db.flush()

        module = CourseModule(
            course_id=course.id,
            title="Module 1",
            sequence_order=1,
        )
        seeded_db.add(module)
        await seeded_db.flush()

        lesson = Lesson(
            module_id=module.id,
            title="Introduction to Machine Learning",
            slug="intro-to-ml",
            body_markdown="# ML Intro\nWelcome to AI.",
            sequence_order=1,
            status=LessonStatus.draft,
            content_version=1,
        )
        seeded_db.add(lesson)
        await seeded_db.flush()

        # Execute publish
        published = await publish_lesson(
            db=seeded_db,
            lesson_id=lesson.id,
            actor_id=user.id,
            is_admin=False,
        )

        assert published.status == LessonStatus.published
        assert published.published_at is not None
        assert published.content_version == 1

        # Check outbox entry was created in the same session
        outbox_res = await seeded_db.execute(
            select(EmbeddingOutbox).where(EmbeddingOutbox.lesson_id == lesson.id)
        )
        outbox = outbox_res.scalar_one_or_none()
        assert outbox is not None
        assert outbox.status == OutboxStatus.pending
        assert outbox.lesson_version == 1

    async def test_republish_increments_version(self, seeded_db: AsyncSession):
        """Re-publishing an already published lesson increments content_version."""
        user = make_test_user()
        seeded_db.add(user)
        await seeded_db.flush()

        course = Course(
            instructor_id=user.id,
            title="Python Advanced",
            slug="py-adv-test",
            status=CourseStatus.published,
        )
        seeded_db.add(course)
        await seeded_db.flush()

        module = CourseModule(
            course_id=course.id,
            title="Module 2",
            sequence_order=1,
        )
        seeded_db.add(module)
        await seeded_db.flush()

        lesson = Lesson(
            module_id=module.id,
            title="AsyncIO Deep Dive",
            slug="asyncio-deep-dive",
            body_markdown="Deep dive into async event loops.",
            sequence_order=1,
            status=LessonStatus.published,
            content_version=1,
        )
        seeded_db.add(lesson)
        await seeded_db.flush()

        # Re-publish
        republished = await publish_lesson(
            db=seeded_db,
            lesson_id=lesson.id,
            actor_id=user.id,
            is_admin=False,
        )
        assert republished.content_version == 2

    async def test_cannot_publish_archived_lesson(self, seeded_db: AsyncSession):
        """Archived lessons cannot transition to published."""
        user = make_test_user()
        seeded_db.add(user)
        await seeded_db.flush()

        course = Course(
            instructor_id=user.id,
            title="Deprecated Course",
            slug="dep-course-test",
            status=CourseStatus.archived,
        )
        seeded_db.add(course)
        await seeded_db.flush()

        module = CourseModule(
            course_id=course.id,
            title="Module Old",
            sequence_order=1,
        )
        seeded_db.add(module)
        await seeded_db.flush()

        lesson = Lesson(
            module_id=module.id,
            title="Old Lesson",
            slug="old-lesson",
            sequence_order=1,
            status=LessonStatus.archived,
            content_version=1,
        )
        seeded_db.add(lesson)
        await seeded_db.flush()

        with pytest.raises(InvalidStateTransitionError):
            await publish_lesson(
                db=seeded_db,
                lesson_id=lesson.id,
                actor_id=user.id,
                is_admin=False,
            )
