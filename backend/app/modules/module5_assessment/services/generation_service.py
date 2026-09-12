"""
ELARION AI Learning Platform — Backend
Module: app/modules/module5_assessment/services/generation_service.py

Purpose:
    Generates AI-powered assessments grounded in lesson curriculum via RAG.
    Produces balanced tests with deterministic MCQs and rubric-evaluated short answers.
"""

from __future__ import annotations

import json
import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.module2_content.models import Lesson
from app.modules.module5_assessment.models import Question, QuestionType, Test
from app.modules.module5_assessment.services.rag_service import retrieve_relevant_chunks
from app.modules.shared_models.skill_taxonomy import SkillTaxonomy
from app.shared.ai_client import generate_llm_completion
from app.shared.exceptions import BusinessRuleError, NotFoundError
from app.shared.logging_config import get_logger

logger = get_logger(__name__)

ASSESSMENT_SYSTEM_PROMPT = """
You are an expert psychometric assessment engineer for the ELARION Adaptive Learning Platform.
Your mission is to generate a rigorous, fair, and curriculum-grounded assessment based strictly
on the provided authoritative lesson excerpts.

RULES:
1. Every question must directly test concepts present in the provided context excerpts.
2. Produce a mix of Multiple Choice Questions (MCQ) and Short Answer Questions.
3. For MCQ: Provide 4 options. Exactly ONE option must have "is_correct": true. Provide realistic distractors.
4. For Short Answer: Provide a clear, granular rubric explaining criteria for 1.0 (full credit), 0.5 (partial credit), and 0.0 (no credit).
5. Output MUST be strictly valid JSON matching the requested schema. Do not include markdown codeblocks or commentary outside the JSON.
"""


async def generate_lesson_assessment(
    lesson_id: uuid.UUID,
    db: AsyncSession,
    is_focused_retest: bool = False,
    skill_filter: list[uuid.UUID] | None = None,
    num_questions: int = 5
) -> Test:
    """
    RAG-grounded test generation workflow:
    1. Fetches lesson and attached skills.
    2. Retrieves top-k semantic chunks from pgvector.
    3. Prompts Claude with RAG chunks and taxonomy context.
    4. Validates structured JSON response.
    5. Persists Test and Question records to database.
    """
    # 1. Fetch lesson
    query = (
        select(Lesson)
        .where(Lesson.id == lesson_id)
        .options(selectinload(Lesson.lesson_skills))
    )
    res = await db.execute(query)
    lesson = res.scalar_one_or_none()
    if not lesson:
        raise NotFoundError("Lesson", lesson_id)

    # Resolve target skills
    skill_ids = skill_filter or [ls.skill_id for ls in lesson.lesson_skills]
    skills_map = {}
    if skill_ids:
        s_query = select(SkillTaxonomy).where(SkillTaxonomy.id.in_(skill_ids))
        s_res = await db.execute(s_query)
        skills_map = {s.id: s for s in s_res.scalars().all()}

    # Fallback to any default platform skill if lesson has none attached
    if not skills_map:
        fallback_res = await db.execute(select(SkillTaxonomy).limit(1))
        def_skill = fallback_res.scalar_one_or_none()
        if def_skill:
            skills_map = {def_skill.id: def_skill}

    target_skill_list = list(skills_map.values())
    default_skill_id = target_skill_list[0].id if target_skill_list else uuid.uuid4()

    # 2. Retrieve authoritative chunks via RAG
    query_topic = lesson.title
    chunks = await retrieve_relevant_chunks(
        lesson_id=lesson.id,
        query_text=query_topic,
        db=db,
        skill_ids=skill_ids,
        top_k=6
    )

    rag_text = "\n\n".join(
        f"[Source Chunk #{c.chunk_index}]:\n{c.chunk_text}" for c in chunks
    ) or f"Lesson Content: {lesson.body_text or lesson.title}"

    source_chunk_ids = [str(c.chunk_id) for c in chunks]

    # 3. Construct prompt
    user_prompt = f"""
LESSON TITLE: {lesson.title}
TARGET SKILLS TO ASSESS:
{chr(10).join(f"- {s.name}: {s.description}" for s in target_skill_list)}

AUTHORITATIVE CURRICULUM CONTEXT:
{rag_text}

Generate a structured test with {num_questions} questions (e.g. 3 MCQs and 2 Short Answer questions).

JSON SCHEMA TO RETURN:
{{
  "title": "{lesson.title} - Mastery Assessment",
  "questions": [
    {{
      "question_type": "mcq",
      "prompt": "Question text here?",
      "options": [
        {{"id": "opt-1", "text": "Correct explanation", "is_correct": true}},
        {{"id": "opt-2", "text": "Distractor 1", "is_correct": false}},
        {{"id": "opt-3", "text": "Distractor 2", "is_correct": false}},
        {{"id": "opt-4", "text": "Distractor 3", "is_correct": false}}
      ],
      "rubric": null,
      "max_score": 1.0,
      "skill_name": "{target_skill_list[0].name if target_skill_list else 'Core Knowledge'}"
    }},
    {{
      "question_type": "short_answer",
      "prompt": "Open-ended prompt asking student to explain or apply a concept?",
      "options": null,
      "rubric": "Full credit (1.0) requires... Partial credit (0.5) if... No credit (0.0) if...",
      "max_score": 1.0,
      "skill_name": "{target_skill_list[0].name if target_skill_list else 'Core Knowledge'}"
    }}
  ]
}}
"""

    # 4. Invoke LLM
    raw_response = await generate_llm_completion(
        system_prompt=ASSESSMENT_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        temperature=0.2,
        json_mode=True
    )

    try:
        data = json.loads(raw_response)
    except Exception as e:
        logger.error("llm_json_parse_failed", error=str(e), raw=raw_response[:200])
        raise BusinessRuleError("AI generation failed to produce valid structured JSON")

    # 5. Persist Test and Questions
    test_title = data.get("title", f"{lesson.title} Assessment")
    test_obj = Test(
        lesson_id=lesson.id,
        lesson_version=lesson.content_version,
        title=test_title,
        is_focused_retest=is_focused_retest
    )
    db.add(test_obj)
    await db.flush()

    # Create questions
    for q_data in data.get("questions", []):
        q_type_str = q_data.get("question_type", "mcq")
        q_type = QuestionType.mcq if q_type_str == "mcq" else QuestionType.short_answer

        # Find matching skill ID or default
        matched_skill_id = default_skill_id
        skill_name_lower = q_data.get("skill_name", "").lower()
        for s_id, s_obj in skills_map.items():
            if s_obj.name.lower() in skill_name_lower or skill_name_lower in s_obj.name.lower():
                matched_skill_id = s_id
                break

        question_obj = Question(
            test_id=test_obj.id,
            skill_id=matched_skill_id,
            question_type=q_type,
            prompt=q_data.get("prompt", "Question Prompt"),
            options=q_data.get("options") if q_type == QuestionType.mcq else None,
            rubric=q_data.get("rubric") if q_type == QuestionType.short_answer else None,
            max_score=float(q_data.get("max_score", 1.0)),
            source_chunk_ids=source_chunk_ids
        )
        db.add(question_obj)

    await db.commit()
    await db.refresh(test_obj)
    logger.info("test_generated_successfully", test_id=str(test_obj.id), title=test_obj.title)
    return test_obj
