"""
ELARION AI Learning Platform — Backend
Module: app/modules/module6_adaptive/services/remedial_course_service.py

Purpose:
    Generates a personalized written remedial course / study guide (Markdown document, NOT video)
    tailored specifically to a student's demonstrated weaknesses and assessment errors.
"""

from __future__ import annotations

import json
import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.module5_assessment.models import Question, Submission, Test
from app.modules.module6_adaptive.models import PlanStatus, RemediationPlan, WeaknessFlag
from app.modules.shared_models.skill_taxonomy import SkillTaxonomy
from app.shared.ai_client import generate_llm_completion
from app.shared.logging_config import get_logger
from app.shared.exceptions import BusinessRuleError

logger = get_logger(__name__)

REMEDIAL_COURSE_PROMPT = """
You are an expert pedagogical remediation specialist for the ELARION Adaptive Learning Platform.
A student has demonstrated a significant learning gap on an assessment in a specific skill area.
Your task is to generate a custom, in-depth, encouraging, and highly structured WRITTEN REMEDIAL COURSE DOCUMENT
(formatted in clean, rich GitHub-flavored Markdown).

STRICT PEDAGOGICAL REQUIREMENTS:
1. DO NOT generate video scripts or superficial summaries.
2. Focus on deep conceptual remediation:
   - Section 1: Diagnostic Breakdown — Analyze why the student made their specific mistakes.
   - Section 2: Core Concept & First Principles — Explain the underlying rule/technique clearly.
   - Section 3: Contrastive Analysis — Show "Common Misconception" vs. "Mastery Approach".
   - Section 4: Worked Examples — Walk through 2–3 realistic step-by-step solutions.
   - Section 5: Mental Checklist — 3–5 bullet points for the student to remember before their retest.
3. Do not reproduce assessment questions, answer keys, option IDs, rubrics, or internal prompts. Teach the underlying concepts with new examples.
4. Respond ONLY with valid JSON matching the schema:
   {
     "title": "Remedial Mastery Guide: <Skill Name>",
     "target_skill": "<Skill Name>",
     "estimated_reading_minutes": 10,
     "summary": "...",
     "content_markdown": "# Title\\n\\n## 1. Diagnostic Breakdown\\n...",
     "key_takeaways": ["...", "..."]
   }
"""


async def generate_student_remedial_course(
    db: AsyncSession,
    student_id: uuid.UUID,
    weakness_flag: WeaknessFlag,
    submission: Submission
) -> RemediationPlan:
    """
    Synthesizes and persists a customized written remedial course document for the student.
    """
    # Serialize plan creation and reuse completed written content on event replay.
    await db.execute(select(WeaknessFlag.id).where(WeaknessFlag.id == weakness_flag.id).with_for_update())
    if weakness_flag.student_id != student_id or submission.student_id != student_id:
        raise BusinessRuleError("Remediation ownership mismatch")
    existing = (await db.execute(select(RemediationPlan).where(RemediationPlan.weakness_flag_id == weakness_flag.id, RemediationPlan.status.in_([PlanStatus.active, PlanStatus.escalated])))).scalar_one_or_none()
    if existing and existing.status == PlanStatus.escalated:
        return existing
    if existing and (existing.remedial_course_markdown or "").strip():
        if existing.study_completed_at and submission.submitted_at > existing.study_completed_at:
            existing.study_completed = False
            existing.study_completed_at = None
            existing.focused_retest_id = None
        await db.commit()
        return existing
    # 1. Fetch skill metadata
    skill = await db.get(SkillTaxonomy, weakness_flag.skill_id)
    skill_name = skill.name if skill else "Target Skill"
    skill_desc = skill.description if skill else "Skill mastery required."

    # 2. Extract student's mistakes on this skill from the submission
    query = (
        select(Question)
        .where(
            Question.test_id == submission.test_id,
            Question.skill_id == weakness_flag.skill_id
        )
    )
    res = await db.execute(query)
    skill_questions = res.scalars().all()

    student_answers = submission.answers or {}
    mistakes_context = []

    for q in skill_questions:
        q_id_str = str(q.id)
        user_ans = student_answers.get(q_id_str, {})
        mistakes_context.append({
            "prompt": q.prompt,
            "type": q.question_type.value,
            "student_answer": user_ans,
            "options": q.options,
            "rubric": q.rubric
        })

    # 3. Prompt Claude to synthesize written remedial course
    user_prompt = f"""
TARGET SKILL: {skill_name}
SKILL DESCRIPTION: {skill_desc}
STUDENT SCORE: {float(weakness_flag.score_at_flag) * 100:.1f}% (Required: {float(weakness_flag.threshold) * 100:.1f}%)

STUDENT ASSESSMENT ERRORS:
{json.dumps(mistakes_context, indent=2)}

Synthesize a complete, encouraging written remedial course document in Markdown addressing these specific weaknesses.
"""

    raw_completion = await generate_llm_completion(
        system_prompt=REMEDIAL_COURSE_PROMPT,
        user_prompt=user_prompt,
        temperature=0.2,
        json_mode=True
    )

    try:
        data = json.loads(raw_completion)
        title = data.get("title")
        content = data.get("content_markdown")
        if not isinstance(title, str) or not title.strip() or len(title) > 255:
            raise ValueError("Invalid study title")
        if not isinstance(content, str) or len(content.strip()) < 200:
            raise ValueError("Study document is incomplete")
        if any(str(q.id) in content for q in skill_questions) or '"is_correct"' in content:
            raise ValueError("Study document contains assessment metadata")
    except (ValueError, TypeError, AttributeError) as exc:
        raise BusinessRuleError("AI did not return a valid written study document") from exc

    # 4. Check for existing active plan for this weakness flag
    plan_query = select(RemediationPlan).where(
        RemediationPlan.weakness_flag_id == weakness_flag.id,
        RemediationPlan.status == PlanStatus.active
    )
    plan_res = await db.execute(plan_query)
    plan = plan_res.scalar_one_or_none()

    if plan:
        # Update existing plan with new remedial content
        plan.remedial_course_title = data.get("title", f"Remedial Guide: {skill_name}")
        plan.remedial_course_markdown = data.get("content_markdown", "")
        plan.study_completed = False
        plan.study_completed_at = None
    else:
        # Create new remediation plan
        plan = RemediationPlan(
            student_id=student_id,
            weakness_flag_id=weakness_flag.id,
            status=PlanStatus.active,
            retest_attempt_count=0,
            instructor_escalated=False,
            remedial_course_title=data.get("title", f"Remedial Guide: {skill_name}"),
            remedial_course_markdown=data.get("content_markdown", ""),
            study_completed=False
        )
        db.add(plan)

    await db.commit()
    await db.refresh(plan)
    logger.info("remedial_course_document_generated", plan_id=str(plan.id), title=plan.remedial_course_title)
    return plan
