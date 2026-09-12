"""
Unit tests for Module 5 Dual-Engine Grading (Deterministic MCQ + LLM Rubric).
"""

import uuid
import pytest
from app.modules.module5_assessment.models import Question, QuestionType
from app.modules.module5_assessment.services.grading_service import (
    grade_mcq_deterministic,
    grade_short_answer_llm,
)


def test_grade_mcq_correct_selection():
    question = Question(
        id=uuid.uuid4(),
        test_id=uuid.uuid4(),
        skill_id=uuid.uuid4(),
        question_type=QuestionType.mcq,
        prompt="What is a thesis statement?",
        options=[
            {"id": "opt-1", "text": "Central argument", "is_correct": True},
            {"id": "opt-2", "text": "Bibliography list", "is_correct": False},
        ],
        max_score=1.0,
    )

    score, feedback = grade_mcq_deterministic(question, {"selected_option_id": "opt-1"})
    assert score == 1.0
    assert "Correct" in feedback


def test_grade_mcq_incorrect_selection():
    question = Question(
        id=uuid.uuid4(),
        test_id=uuid.uuid4(),
        skill_id=uuid.uuid4(),
        question_type=QuestionType.mcq,
        prompt="What is a thesis statement?",
        options=[
            {"id": "opt-1", "text": "Central argument", "is_correct": True},
            {"id": "opt-2", "text": "Bibliography list", "is_correct": False},
        ],
        max_score=1.0,
    )

    score, feedback = grade_mcq_deterministic(question, {"selected_option_id": "opt-2"})
    assert score == 0.0
    assert "Incorrect" in feedback


def test_grade_mcq_empty_selection():
    question = Question(
        id=uuid.uuid4(),
        test_id=uuid.uuid4(),
        skill_id=uuid.uuid4(),
        question_type=QuestionType.mcq,
        prompt="What is a thesis statement?",
        options=[
            {"id": "opt-1", "text": "Central argument", "is_correct": True},
        ],
        max_score=1.0,
    )

    score, feedback = grade_mcq_deterministic(question, None)
    assert score == 0.0
    assert "No answer selected" in feedback


@pytest.mark.asyncio
async def test_grade_short_answer_empty():
    question = Question(
        id=uuid.uuid4(),
        test_id=uuid.uuid4(),
        skill_id=uuid.uuid4(),
        question_type=QuestionType.short_answer,
        prompt="Explain cohesive devices.",
        rubric="Must mention transition words.",
        max_score=1.0,
    )

    score, feedback, reasoning = await grade_short_answer_llm(question, {"text_answer": ""})
    assert score == 0.0
    assert "No response provided" in feedback
