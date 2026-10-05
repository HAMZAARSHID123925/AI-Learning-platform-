"""
ELARION AI Learning Platform â€” Backend
tests/integration/module5/test_assessment_flow.py

Purpose:
    Integration tests for Module 5 AI Assessment Generation & Grading.
    Verifies:
    1. Anti-Cheat serialization (answer keys and rubrics stripped from student view).
    2. Assessment submission intake and dual-engine grading execution.
    3. Retrieval of graded submission details and skill scores.
"""

from __future__ import annotations

import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.module2_content.models import Course, CourseModule, CourseStatus, Lesson, LessonStatus
from app.modules.module5_assessment.models import Question, QuestionType, Test


@pytest.mark.asyncio
class TestAssessmentFlow:
    async def _setup_student(self, client: AsyncClient, email="student_assessment@test.com"):
        await client.post("/api/v1/auth/register", json={
            "email": email,
            "password": "Password1",
            "first_name": "Test",
            "last_name": "Student",
        })
        login_res = await client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "Password1",
        })
        return login_res.json()["access_token"]

    async def _seed_lesson_with_assessment(self, db: AsyncSession) -> tuple[Lesson, Test]:
        # 1. Course & Lesson
        course = Course(
            instructor_id=uuid.uuid4(),
            title="IELTS Academic Masterclass",
            slug=f"ielts-masterclass-{uuid.uuid4().hex[:6]}",
            status=CourseStatus.published
        )
        db.add(course)
        await db.flush()

        module = CourseModule(
            course_id=course.id,
            title="Writing Task 2",
            sequence_order=1
        )
        db.add(module)
        await db.flush()

        lesson = Lesson(
            module_id=module.id,
            title="Essay Introductions",
            slug=f"essay-intro-{uuid.uuid4().hex[:6]}",
            body_text="An introduction must state the thesis clearly and use cohesive linking words.",
            sequence_order=1,
            status=LessonStatus.published,
            content_version=1
        )
        db.add(lesson)
        await db.flush()

        # 2. Test & Questions
        test = Test(
            lesson_id=lesson.id,
            lesson_version=1,
            title="Essay Introductions Mastery Quiz",
            is_focused_retest=False
        )
        db.add(test)
        await db.flush()

        q_mcq = Question(
            test_id=test.id,
            skill_id=uuid.uuid4(),
            question_type=QuestionType.mcq,
            prompt="What is the central purpose of a thesis statement?",
            options=[
                {"id": "opt-1", "text": "States the central claim of the essay", "is_correct": True},
                {"id": "opt-2", "text": "Provides anecdotal humor", "is_correct": False},
            ],
            rubric=None,
            max_score=1.0
        )
        db.add(q_mcq)

        q_sa = Question(
            test_id=test.id,
            skill_id=uuid.uuid4(),
            question_type=QuestionType.short_answer,
            prompt="Explain how cohesive devices link paragraphs together.",
            options=None,
            rubric="Full credit if transition words and examples are provided.",
            max_score=1.0
        )
        db.add(q_sa)
        await db.commit()

        return lesson, test

    async def test_get_assessment_anti_cheat(self, client: AsyncClient, seeded_db: AsyncSession):
        """Student endpoint must strictly omit 'is_correct' and 'rubric' keys."""
        token = await self._setup_student(client, "anti_cheat_student@test.com")
        lesson, test = await self._seed_lesson_with_assessment(seeded_db)

        resp = await client.get(
            f"/api/v1/lessons/{lesson.id}/assessment",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == str(test.id)
        assert len(data["questions"]) == 2

        for q in data["questions"]:
            # Guardrail: rubric must NEVER be exposed
            assert "rubric" not in q
            assert "source_chunk_ids" not in q
            if q["options"]:
                for opt in q["options"]:
                    # Guardrail: is_correct must NEVER be exposed
                    assert "is_correct" not in opt
                    assert "id" in opt
                    assert "text" in opt

    async def test_submit_assessment_and_grading(self, client: AsyncClient, seeded_db: AsyncSession):
        """Student submits answers; deterministic MCQ and rubric grading execute."""
        token = await self._setup_student(client, "grading_student@test.com")
        lesson, test = await self._seed_lesson_with_assessment(seeded_db)

        # Submit answers
        payload = {
            "answers": [
                {
                    "question_id": str(test.questions[0].id),
                    "selected_option_id": "opt-1"  # Correct MCQ answer
                },
                {
                    "question_id": str(test.questions[1].id),
                    "text_answer": "Cohesive devices such as 'Furthermore' create smooth logical transitions between paragraphs."
                }
            ]
        }

        resp = await client.post(
            f"/api/v1/assessments/{test.id}/submit",
            headers={"Authorization": f"Bearer {token}"},
            json=payload
        )
        assert resp.status_code == 200
        result = resp.json()
        assert result["test_id"] == str(test.id)
        assert result["status"] == "graded"
        assert result["overall_score"] is not None
        assert result["overall_score"] >= 0.5  # High score expected
        assert len(result["skill_scores"]) == 2

        # Verify submission can be fetched directly
        sub_id = result["id"]
        detail_resp = await client.get(
            f"/api/v1/submissions/{sub_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert detail_resp.status_code == 200
        detail_data = detail_resp.json()
        assert detail_data["id"] == sub_id
        assert detail_data["overall_score"] == result["overall_score"]
    async def test_generate_assessment_openblas(self, client: AsyncClient, seeded_db: AsyncSession):
        token = await self._setup_student(client, "gen_teacher@test.com")
        await seeded_db.execute(text("INSERT INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'gen_teacher@test.com' AND r.name = 'Instructor' ON CONFLICT DO NOTHING"))
        await seeded_db.commit()
        lesson, _ = await self._seed_lesson_with_assessment(seeded_db)

        resp = await client.post(
            "/api/v1/assessments/generate",
            headers={"Authorization": f"Bearer {token}"},
            json={"lesson_id": str(lesson.id), "is_focused_retest": False, "target_weakness_flags": []}
        )
        print("GENERATE STATUS:", resp.status_code)
        print("GENERATE BODY:", resp.json())
        assert resp.status_code == 200
