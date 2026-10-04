"""
ELARION AI Learning Platform — Backend
Module: app/modules/module5_assessment/schemas.py

Purpose:
    Pydantic schemas for Module 5 — AI Assessment Generation & Grading.
    Includes strict Anti-Cheat serialization (student views never receive answer keys or rubrics).
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.modules.module5_assessment.models import GraderType, QuestionType, SubmissionStatus


# =============================================================================
# Request Schemas
# =============================================================================

class AssessmentGenerateRequest(BaseModel):
    lesson_id: uuid.UUID | None = None
    course_id: uuid.UUID | None = None
    is_focused_retest: bool = False
    skill_filter: list[uuid.UUID] | None = None
    num_questions: int = Field(default=5, ge=1, le=20)


class SubmissionAnswerItem(BaseModel):
    question_id: uuid.UUID
    selected_option_id: str | None = None
    text_answer: str | None = None


class SubmissionCreateRequest(BaseModel):
    answers: list[SubmissionAnswerItem]


# =============================================================================
# Anti-Cheat Student Views (Answer Keys & Rubrics Stripped)
# =============================================================================

class QuestionOptionStudentView(BaseModel):
    id: str
    text: str
    # Note: is_correct is strictly excluded here to prevent client-side inspection


class QuestionStudentView(BaseModel):
    id: uuid.UUID
    skill_id: uuid.UUID
    question_type: QuestionType
    prompt: str
    options: list[QuestionOptionStudentView] | None = None
    max_score: float

    @classmethod
    def from_orm_model(cls, question: Any) -> QuestionStudentView:
        opts = None
        if question.options:
            opts = [
                QuestionOptionStudentView(
                    id=str(o.get("id", "")),
                    text=str(o.get("text", ""))
                )
                for o in question.options
            ]
        return cls(
            id=question.id,
            skill_id=question.skill_id,
            question_type=question.question_type,
            prompt=question.prompt,
            options=opts,
            max_score=float(question.max_score)
        )


class AssessmentStudentViewResponse(BaseModel):
    id: uuid.UUID
    lesson_id: uuid.UUID | None = None
    course_id: uuid.UUID | None = None
    title: str
    is_focused_retest: bool
    questions: list[QuestionStudentView]


# =============================================================================
# Submission & Grading Responses
# =============================================================================

class SkillScoreResponse(BaseModel):
    id: uuid.UUID
    skill_id: uuid.UUID
    skill_name: str | None = None
    skill_slug: str | None = None
    score: float
    max_score: float
    grader_type: GraderType
    llm_feedback: str | None = None


class SubmissionDetailResponse(BaseModel):
    id: uuid.UUID
    test_id: uuid.UUID
    student_id: uuid.UUID
    attempt_number: int
    status: SubmissionStatus
    overall_score: float | None = None
    submitted_at: datetime
    graded_at: datetime | None = None
    skill_scores: list[SkillScoreResponse] = []
