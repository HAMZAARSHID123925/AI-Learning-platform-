"""
ELARION AI Learning Platform â€” Backend
Module: app/modules/module5_assessment/services/grading_service.py

Purpose:
    Dual-engine grading pipeline:
    1. Deterministic instant grading for Multiple Choice Questions (0 LLM tokens, <2ms).
    2. Claude LLM-as-a-grader for short answers evaluated against pedagogical rubrics.
    3. Persists per-skill scores and triggers TestGraded event emission to Redis Streams.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.module5_assessment.models import (
    GraderType,
    Question,
    QuestionType,
    SkillScore,
    Submission,
    SubmissionStatus,
    Test,
    TestGradedOutbox,
)
from app.shared.ai_client import generate_llm_completion
from app.shared.events import emit_test_graded_event, publish_graded_outbox
from app.shared.exceptions import NotFoundError
from app.shared.logging_config import get_logger

logger = get_logger(__name__)

GRADING_SYSTEM_PROMPT = """
You are an expert pedagogical evaluator for the ELARION Adaptive Learning Platform.
Your task is to grade a student's short-answer response against an authoritative grading rubric.

EVALUATION RULES:
1. Adhere strictly to the rubric criteria.
2. Score between 0.0 (no credit) and 1.0 (full credit).
3. Provide constructive, encouraging student-facing feedback explaining what was correct and what was missed.
4. Provide a brief internal reasoning justification.
5. Return strictly valid JSON matching the schema:
   {"score": 0.85, "feedback": "...", "llm_reasoning": "..."}
"""


def grade_mcq_deterministic(question: Question, student_answer: Any) -> tuple[float, str]:
    """
    Evaluates Multiple Choice Question deterministically without touching an LLM.
    Returns (score, feedback).
    """
    if not student_answer or not question.options:
        return 0.0, "No answer selected."

    # Extract chosen option identifier
    chosen_id = ""
    if isinstance(student_answer, dict):
        chosen_id = str(student_answer.get("selected_option_id") or student_answer.get("id") or "")
    else:
        chosen_id = str(student_answer)

    # Find the correct option in question.options
    correct_option = None
    chosen_option = None
    for opt in question.options:
        if opt.get("is_correct") is True:
            correct_option = opt
        if str(opt.get("id")) == chosen_id or str(opt.get("text")) == chosen_id:
            chosen_option = opt

    if not correct_option:
        return 0.0, "Evaluation error: Question has no correct answer configured."

    if chosen_option and str(chosen_option.get("id")) == str(correct_option.get("id")):
        return float(question.max_score), "Correct! Excellent grasp of the concept."

    return 0.0, "Incorrect. Review the lesson concepts before trying again."


async def grade_short_answer_llm(question: Question, student_answer: Any) -> tuple[float, str, str]:
    """
    Evaluates an open-ended/short-answer question using Claude LLM against the rubric.
    Returns (score, feedback, llm_reasoning).
    """
    text_answer = ""
    if isinstance(student_answer, dict):
        text_answer = str(student_answer.get("text_answer") or student_answer.get("answer") or "")
    else:
        text_answer = str(student_answer or "")

    if not text_answer.strip():
        return 0.0, "No response provided for this question.", "Empty submission."

    user_prompt = f"""
QUESTION PROMPT:
{question.prompt}

MAX SCORE: {question.max_score}

AUTHORITATIVE GRADING RUBRIC:
{question.rubric or 'Evaluate for conceptual accuracy and clarity.'}

STUDENT SUBMITTED ANSWER:
{text_answer}

Grade this response and return JSON with keys: 'score', 'feedback', 'llm_reasoning'.
"""

    try:
        raw_completion = await generate_llm_completion(
            system_prompt=GRADING_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.1,
            json_mode=True
        )
        data = json.loads(raw_completion)
        score = float(data.get("score", 0.0))
        # Ensure score stays bounded [0.0, max_score]
        score = max(0.0, min(float(question.max_score), score))
        feedback = data.get("feedback", "Evaluation complete.")
        reasoning = data.get("llm_reasoning", "")
        return score, feedback, reasoning
    except Exception as e:
        logger.error("llm_grading_call_failed", question_id=str(question.id), error=str(e))
        raise RuntimeError("Written-answer grading is unavailable") from e


async def grade_submission(submission_id: uuid.UUID, db: AsyncSession) -> Submission:
    """
    Executes the dual-engine grading pipeline for a submission:
    1. Loads submission and test questions.
    2. Grades each question (MCQ -> Deterministic, Short Answer -> Claude).
    3. Writes SkillScore records.
    4. Computes overall score and marks submission as 'graded'.
    5. Emits TestGraded event to Redis Streams.
    """
    query = (
        select(Submission)
        .where(Submission.id == submission_id)
        .options(
            selectinload(Submission.test).selectinload(Test.questions)
        )
    )
    result = await db.execute(query)
    submission = result.scalar_one_or_none()
    if not submission:
        raise NotFoundError("Submission", submission_id)

    if submission.status == SubmissionStatus.graded:
        return submission
    submission.status = SubmissionStatus.grading
    await db.commit()

    try:
        test = submission.test
        student_answers = submission.answers or {}
        skill_score_accum: dict[uuid.UUID, list[tuple[float, float, GraderType, str]]] = {}
        persisted_skill_scores = []
        total_score = 0.0
        max_possible_score = 0.0

        for question in test.questions:
            q_key = str(question.id)
            user_ans = student_answers.get(q_key)

            if question.question_type == QuestionType.mcq:
                score, feedback = grade_mcq_deterministic(question, user_ans)
                grader = GraderType.deterministic
            else:
                score, feedback, _ = await grade_short_answer_llm(question, user_ans)
                grader = GraderType.llm

            total_score += score
            max_possible_score += float(question.max_score)

            # One normalized row per submission/skill (matches uq_skill_score).
            bucket = skill_score_accum.setdefault(question.skill_id, [])
            bucket.append((score, float(question.max_score), grader, feedback))

        for skill_id, scores in skill_score_accum.items():
            maximum = sum(row[1] for row in scores)
            normalized = sum(row[0] for row in scores) / maximum if maximum else 0.0
            db.add(SkillScore(
                submission_id=submission.id, skill_id=skill_id,
                score=round(normalized, 4), max_score=1.0,
                grader_type=GraderType.llm if any(row[2] == GraderType.llm for row in scores) else GraderType.deterministic,
                llm_feedback="\n".join(row[3] for row in scores),
            ))
            persisted_skill_scores.append({"skill_id": skill_id, "score": round(normalized, 4), "max_score": 1.0})

        # Calculate final overall score
        overall_pct = (total_score / max_possible_score) if max_possible_score > 0 else 0.0
        submission.overall_score = round(overall_pct, 4)
        submission.status = SubmissionStatus.graded
        submission.graded_at = datetime.now(timezone.utc)

        event_arguments = dict(submission_id=str(submission.id), test_id=str(test.id), student_id=str(submission.student_id), attempt_number=submission.attempt_number, overall_score=float(submission.overall_score), is_focused_retest=test.is_focused_retest, skill_scores=[{"skill_id":str(x["skill_id"]),"score":float(x["score"]),"max_score":float(x["max_score"])} for x in persisted_skill_scores])
        db.add(TestGradedOutbox(submission_id=submission.id,payload=event_arguments))
        await db.commit()
        await db.refresh(submission)

        logger.info(
            "submission_graded_successfully",
            submission_id=str(submission.id),
            overall_score=submission.overall_score
        )

        # Broker outages leave a durable pending event; a worker retries it.
        try:await publish_graded_outbox(db,submission.id)
        except Exception as exc:
            await db.rollback()
            logger.warning('graded_event_delivery_deferred',submission_id=str(submission_id),error_type=type(exc).__name__)
            submission=await db.get(Submission,submission_id)

        return submission

    except Exception as e:
        await db.rollback()
        logger.error("submission_grading_failed", submission_id=str(submission_id), error=str(e))
        failed_sub = await db.get(Submission, submission_id)
        if failed_sub:
            failed_sub.status = SubmissionStatus.error
            await db.commit()
        raise
