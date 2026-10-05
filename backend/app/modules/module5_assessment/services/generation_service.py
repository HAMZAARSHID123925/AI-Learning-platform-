"""
ELARION AI Learning Platform â€” Backend
Module: app/modules/module5_assessment/services/generation_service.py

Purpose:
    Generates AI-powered assessments grounded in lesson curriculum via RAG.
    Produces validated MCQ-only assessments with deterministic grading.
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
2. Produce ONLY Multiple Choice Questions (MCQ). Do NOT generate short answer questions.
3. For MCQ: Provide 4 options. Exactly ONE option must have "is_correct": true. Provide realistic distractors. Every option must have an "id" and "text".
4. Output MUST be strictly valid JSON matching the requested schema. Do not include markdown codeblocks or commentary outside the JSON.
"""


def validate_generated_mcqs(data: dict, count: int, skill_names: set[str] | None = None) -> None:
    """Reject malformed or duplicate output before writing any questions."""
    questions = data.get("questions")
    if not isinstance(questions, list) or len(questions) != count:
        raise ValueError("Incorrect question count")
    prompts = set()
    for question in questions:
        if skill_names is not None and question.get("skill_name", "").casefold() not in skill_names:
            raise ValueError("Questions must reference a tagged curriculum skill")
        prompt = question.get("prompt")
        if not isinstance(prompt, str) or not prompt.strip() or prompt.strip().casefold() in prompts:
            raise ValueError("Question prompts must be nonempty and unique")
        prompts.add(prompt.strip().casefold())
        if question.get("question_type") != "mcq" or float(question.get("max_score", 1)) != 1.0:
            raise ValueError("Only unit-score MCQs are allowed")
        options = question.get("options")
        if not isinstance(options, list) or len(options) != 4:
            raise ValueError("Exactly four options are required")
        if any(not isinstance(o.get("is_correct"), bool) for o in options):
            raise ValueError("Correctness flags must be booleans")
        if sum(o["is_correct"] for o in options) != 1:
            raise ValueError("Exactly one correct option is required")
        for key in ("id", "text"):
            values = [o.get(key) for o in options]
            if any(not isinstance(v, str) or not v.strip() for v in values) or len({v.strip().casefold() for v in values}) != 4:
                raise ValueError("Option identifiers and texts must be nonempty and unique")


async def generate_lesson_assessment(
    lesson_id: uuid.UUID,
    db: AsyncSession,
    is_focused_retest: bool = False,
    skill_filter: list[uuid.UUID] | None = None,
    num_questions: int = 10,
    commit: bool = True
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

    if not skills_map or (skill_filter and set(skill_filter) != set(skills_map)):
        raise BusinessRuleError("Assessment requires valid lesson skill tags")

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
    ) or f"Lesson Content: {lesson.body_markdown or lesson.title}"

    if not chunks and not (lesson.body_markdown or "").strip():
        raise BusinessRuleError("Assessment requires authoritative lesson content")
    source_chunk_ids = [str(c.chunk_id) for c in chunks]

    # 3. Construct prompt
    user_prompt = f"""
LESSON TITLE: {lesson.title}
TARGET SKILLS TO ASSESS:
{chr(10).join(f"- {s.name}: {s.description}" for s in target_skill_list)}

AUTHORITATIVE CURRICULUM CONTEXT:
{rag_text}

Generate a structured test with exactly {num_questions} Multiple Choice Questions (MCQ) ONLY. Do not generate short answer questions.

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
    }}
  ]
}}
"""

    # 4. Invoke LLM with retry validation
    max_retries = 3
    data = None
    import asyncio
    for attempt in range(max_retries):
        try:
            raw_response = await generate_llm_completion(
                system_prompt=ASSESSMENT_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.2,
                json_mode=True
            )
            data = json.loads(raw_response)
            validate_generated_mcqs(data, num_questions, {s.name.casefold() for s in target_skill_list})
            questions = data.get("questions", [])
            if len(questions) != num_questions:
                raise ValueError(f"Expected {num_questions} questions, got {len(questions)}")

            for q in questions:
                if q.get("question_type") != "mcq":
                    raise ValueError(f"Expected MCQ only, got {q.get('question_type')}")
                opts = q.get("options")
                if not opts or len(opts) != 4:
                    raise ValueError("MCQ must have exactly 4 options")
                if sum(1 for o in opts if o.get("is_correct")) != 1:
                    raise ValueError("Exactly ONE option must be correct")
                for o in opts:
                    if "id" not in o or "text" not in o:
                        raise ValueError("Options must have id and text")

            # Validation passed
            break
        except Exception as e:
            logger.warning("llm_validation_failed", attempt=attempt, error=str(e))
            if attempt == max_retries - 1:
                logger.error("llm_json_parse_failed", error=str(e))
                raise BusinessRuleError(f"AI generation failed to produce valid structured JSON: {e}")
            await asyncio.sleep(1)

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

    await db.flush()
    if commit:
        await db.commit()
    await db.refresh(test_obj, attribute_names=["questions"])
    logger.info("test_generated_successfully", test_id=str(test_obj.id), title=test_obj.title)
    return test_obj


async def generate_course_assessment(
    course_id: uuid.UUID,
    db: AsyncSession
) -> Test:
    """
    Generates a course-level assessment with exactly 10 MCQs.
    """
    from app.modules.module2_content.models import Course

    query = (
        select(Course)
        .where(Course.id == course_id)
    )
    res = await db.execute(query)
    course = res.scalar_one_or_none()
    if not course:
        raise NotFoundError("Course", course_id)

    from app.modules.module2_content.models import CourseModule, LessonSkill, LessonStatus
    lessons = list((await db.execute(select(Lesson).join(CourseModule).where(CourseModule.course_id == course.id, Lesson.status == LessonStatus.published).options(selectinload(Lesson.lesson_skills)))).scalars().all())
    tagged_ids = {tag.skill_id for lesson in lessons for tag in lesson.lesson_skills}
    course_skills = list((await db.execute(select(SkillTaxonomy).where(SkillTaxonomy.id.in_(tagged_ids)))).scalars().all())
    if not course_skills:
        raise BusinessRuleError("Course assessment requires published lessons with skill tags")
    skill_names = [skill.name for skill in course_skills]

    # Retrieve authoritative chunks via RAG across the course
    from app.modules.module5_assessment.services.rag_service import retrieve_course_chunks
    chunks = await retrieve_course_chunks(
        course_id=course.id,
        query_text=f"{course.title} comprehensive test",
        db=db,
        top_k=20
    )

    rag_text = "\n\n".join(
        f"[Source Chunk #{c.chunk_index}]:\n{c.chunk_text}" for c in chunks
    ) or "\n\n".join(f"{lesson.title}: {lesson.body_markdown or ''}" for lesson in lessons)

    source_chunk_ids = [str(c.chunk_id) for c in chunks]

    user_prompt = f"""
COURSE TITLE: {course.title}
TARGET SKILLS TO ASSESS:
{chr(10).join(f"- {s}" for s in skill_names)}

AUTHORITATIVE CURRICULUM CONTEXT:
{rag_text}

Generate a structured test with EXACTLY 10 questions. ALL 10 questions MUST be "mcq".
Do NOT generate any short_answer questions.

JSON SCHEMA TO RETURN:
{{
  "title": "{course.title} - Final Assessment",
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
      "skill_name": "{skill_names[0]}"
    }}
  ]
}}
"""

    max_retries = 3
    data = None
    import asyncio
    for attempt in range(max_retries):
        try:
            raw_response = await generate_llm_completion(
                system_prompt=ASSESSMENT_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.2,
                json_mode=True
            )
            data = json.loads(raw_response)
            validate_generated_mcqs(data, 10, {s.name.casefold() for s in course_skills})
            questions = data.get("questions", [])
            if len(questions) != 10:
                raise ValueError(f"Expected 10 questions, got {len(questions)}")

            for q in questions:
                if q.get("question_type") != "mcq":
                    raise ValueError(f"Expected MCQ only, got {q.get('question_type')}")
                opts = q.get("options")
                if not opts or len(opts) != 4:
                    raise ValueError("MCQ must have exactly 4 options")
                if sum(1 for o in opts if o.get("is_correct")) != 1:
                    raise ValueError("Exactly ONE option must be correct")
                for o in opts:
                    if "id" not in o or "text" not in o:
                        raise ValueError("Options must have id and text")

            break
        except Exception as e:
            logger.warning("llm_course_validation_failed", attempt=attempt, error=str(e))
            if attempt == max_retries - 1:
                logger.error("llm_json_parse_failed", error=str(e))
                raise BusinessRuleError(f"AI generation failed to produce valid structured JSON: {e}")
            await asyncio.sleep(1)

    # We need a default Skill ID for the DB relationship
    default_skill_id = course_skills[0].id

    test_title = data.get("title", f"{course.title} Final Assessment")
    test_obj = Test(
        course_id=course.id,
        title=test_title,
        is_focused_retest=False
    )
    db.add(test_obj)
    await db.flush()

    for q_data in data.get("questions", []):
        question_obj = Question(
            test_id=test_obj.id,
            skill_id=next((skill.id for skill in course_skills if skill.name.casefold() == q_data.get("skill_name", "").casefold()), default_skill_id),
            question_type=QuestionType.mcq,
            prompt=q_data.get("prompt", "Question Prompt"),
            options=q_data.get("options"),
            rubric=None,
            max_score=float(q_data.get("max_score", 1.0)),
            source_chunk_ids=source_chunk_ids
        )
        db.add(question_obj)

    await db.commit()
    await db.refresh(test_obj, attribute_names=["questions"])
    logger.info("course_test_generated", test_id=str(test_obj.id))
    return test_obj
