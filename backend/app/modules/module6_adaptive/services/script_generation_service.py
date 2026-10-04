import uuid
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.modules.module6_adaptive.models import VideoGenerationJob, VideoJobStatus, WeaknessFlag, RemediationPlan
from app.modules.shared_models.skill_taxonomy import SkillTaxonomy
from app.modules.module2_content.models import Course, Lesson
from app.modules.module5_assessment.models import Submission, Question, QuestionType
from app.modules.module5_assessment.services.rag_service import retrieve_course_chunks
from app.shared.ai_client import generate_llm_completion
from app.shared.logging_config import get_logger

logger = get_logger(__name__)

async def _build_authoritative_context(job: VideoGenerationJob, db: AsyncSession):
    # Fetch flag, skill, course
    flag = await db.get(WeaknessFlag, job.weakness_flag_id)
    skill = await db.get(SkillTaxonomy, job.skill_id)
    course = await db.get(Course, job.course_id)
    
    # Fetch submission
    submission = await db.execute(
        select(Submission)
        .options(selectinload(Submission.test).selectinload(Test.questions))
        .where(Submission.id == job.submission_id)
    )
    submission = submission.scalar_one_or_none()
    
    # Extract mistakes
    mistakes = []
    if submission and submission.answers:
        for q in submission.test.questions:
            if q.skill_id == skill.id:
                ans = submission.answers.get(str(q.id))
                if ans:
                    # In a real app we'd verify it's incorrect. For context we include it.
                    # We can check correctness if rubric is available.
                    mistakes.append({
                        "prompt": q.prompt,
                        "student_answer": ans.get("selected_option_id") or ans.get("text_response"),
                        "options": q.options,
                        "rubric": q.rubric
                    })
    
    # Retrieve RAG chunks
    query_text = f"Skill: {skill.name}. {skill.description}. Mistakes: {json.dumps(mistakes)}"
    chunks = await retrieve_course_chunks(course.id, query_text, db=db, top_k=4)
    
    # Return authoritative dict
    return {
        "course_title": course.title,
        "skill_name": skill.name,
        "skill_description": skill.description,
        "mistakes": mistakes,
        "source_chunks": [{"text": c.text, "lesson_id": str(c.lesson_id)} for c in chunks],
        "target_duration_seconds": job.target_duration_seconds
    }

SYSTEM_PROMPT = """You are an expert curriculum designer and educational scriptwriter for grades 1-5.
Your goal is to transform a student's weakness into a concise, highly targeted remedial video lesson.
The output MUST be a strict JSON object. No markdown wrapping.
You must ground your lesson strictly in the provided Source Chunks. Do not hallucinate external curriculum.

JSON Schema:
{
  "lesson_plan": {
    "title": "String",
    "target_skill_name": "String",
    "learning_objectives": ["String"],
    "student_misconceptions": ["String"],
    "teaching_strategy": "String",
    "target_duration_seconds": 120
  },
  "scenes": [
    {
      "scene_id": "scene-1",
      "scene_type": "intro | concept | comparison | diagram | example | misconception_correction | recap",
      "duration_seconds": 15,
      "heading": "String",
      "narration": "String (the exact script to be spoken)",
      "visual_intent": {
        "type": "String (abstract visual intent)",
        "concepts": ["String"]
      },
      "on_screen_text": ["String"]
    }
  ],
  "validation": {
    "grounding_check": "String (Explain how scenes use source chunks)",
    "misconception_alignment": "String (Explain how it targets the student's mistakes)",
    "grade_level_check": "String (Verify language is simple)"
  }
}

Quality Rules:
1. Target length approx 130 words per minute of target_duration_seconds.
2. Scene duration must match narration length.
3. No character design details in visual_intent.
4. One core idea per scene.
5. Simple vocabulary (Grades 1-5).
"""

async def generate_personalized_script_and_scenes(job_id: uuid.UUID, db: AsyncSession) -> None:
    job = await db.get(VideoGenerationJob, job_id)
    if not job:
        raise ValueError(f"Job {job_id} not found")
        
    try:
        # Build context
        from app.modules.module5_assessment.models import Test # local import to avoid circular issues
        
        flag = await db.get(WeaknessFlag, job.weakness_flag_id)
        skill = await db.get(SkillTaxonomy, job.skill_id)
        course = await db.get(Course, job.course_id)
        
        submission_res = await db.execute(
            select(Submission).options(selectinload(Submission.test).selectinload(Test.questions)).where(Submission.id == job.submission_id)
        )
        submission = submission_res.scalar_one_or_none()
        
        mistakes = []
        if submission and submission.answers:
            for q in submission.test.questions:
                if str(q.skill_id) == str(skill.id):
                    ans = submission.answers.get(str(q.id))
                    if ans:
                        mistakes.append({
                            "prompt": q.prompt,
                            "student_answer": ans.get("selected_option_id") or ans.get("text_response"),
                            "options": q.options,
                            "rubric": q.rubric
                        })

        query_text = f"Skill: {skill.name}. {skill.description}. Mistakes: {json.dumps(mistakes)}"
        chunks = await retrieve_course_chunks(course.id, query_text, db=db, top_k=4)
        
        context = {
            "course_title": course.title,
            "skill_name": skill.name,
            "skill_description": skill.description,
            "mistakes": mistakes,
            "source_chunks": [{"text": c.text, "lesson_id": str(c.lesson_id)} for c in chunks],
            "target_duration_seconds": job.target_duration_seconds
        }
        
        user_prompt = f"Generation Context:\n{json.dumps(context, indent=2)}"
        
        job.status = VideoJobStatus.scripting
        await db.commit()
        
        # Single LLM call for cost control & structure
        response_text = await generate_llm_completion(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.3,
            max_tokens=4000,
            json_mode=True
        )
        
        if not response_text:
            raise Exception("Empty response from LLM")
            
        data = json.loads(response_text)
        
        # Educational Quality Validation Logic
        if "scenes" not in data or "lesson_plan" not in data:
            raise ValueError("Malformed output: missing required keys")
            
        # Basic duration check
        total_duration = sum(s.get("duration_seconds", 0) for s in data["scenes"])
        if total_duration < 10 or total_duration > 600:
            raise ValueError(f"Invalid total duration: {total_duration}")

        # Persist results
        job.script_json = {"lesson_plan": data["lesson_plan"], "validation": data.get("validation", {})}
        job.scene_json = {"scenes": data["scenes"]}
        
        # Update remediation plan markdown if applicable
        if job.remediation_plan_id:
            plan = await db.get(RemediationPlan, job.remediation_plan_id)
            if plan:
                md = f"# {data['lesson_plan'].get('title', 'Remedial Lesson')}\n\n"
                md += f"**Target Skill:** {data['lesson_plan'].get('target_skill_name')}\n\n"
                for scene in data["scenes"]:
                    md += f"## {scene.get('heading', 'Scene')}\n"
                    md += f"_{scene.get('visual_intent', {}).get('type', '')}_\n\n"
                    md += f"{scene.get('narration', '')}\n\n"
                plan.remedial_course_markdown = md
        
        job.status = VideoJobStatus.storyboard_ready
        await db.commit()
        logger.info("script_generation_success", job_id=str(job_id))
        
    except Exception as e:
        logger.error("script_generation_failed", job_id=str(job_id), error=str(e))
        job.status = VideoJobStatus.failed
        job.error_message = f"Script generation failed: {str(e)}"
        await db.commit()
        raise e
