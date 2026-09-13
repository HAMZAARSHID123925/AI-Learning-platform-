"""
ELARION AI Learning Platform — Backend
tests/factories/course_factory.py

Purpose:
    Test data factories for Course, CourseModule, and Lesson using factory_boy.
    Factories produce ORM instances in-memory with sensible defaults.
"""

from __future__ import annotations

import uuid
import factory

from app.modules.module2_content.models import Course, CourseModule, CourseStatus, Lesson, LessonStatus


class CourseFactory(factory.Factory):
    class Meta:
        model = Course

    id = factory.LazyFunction(uuid.uuid4)
    instructor_id = factory.LazyFunction(uuid.uuid4)
    title = factory.Sequence(lambda n: f"Course Title {n}")
    slug = factory.Sequence(lambda n: f"course-title-{n}")
    description = factory.Faker("paragraph")
    status = CourseStatus.draft
    thumbnail_url = None


class CourseModuleFactory(factory.Factory):
    class Meta:
        model = CourseModule

    id = factory.LazyFunction(uuid.uuid4)
    course_id = factory.LazyFunction(uuid.uuid4)
    title = factory.Sequence(lambda n: f"Module {n}")
    description = factory.Faker("sentence")
    sequence_order = factory.Sequence(lambda n: n + 1)


class LessonFactory(factory.Factory):
    class Meta:
        model = Lesson

    id = factory.LazyFunction(uuid.uuid4)
    module_id = factory.LazyFunction(uuid.uuid4)
    title = factory.Sequence(lambda n: f"Lesson {n}")
    slug = factory.Sequence(lambda n: f"lesson-{n}")
    body_markdown = "# Test Lesson\nContent goes here."
    status = LessonStatus.draft
    sequence_order = factory.Sequence(lambda n: n + 1)
    content_version = 1
    estimated_minutes = 30
