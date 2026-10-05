import uuid
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.modules.module6_adaptive.models import VideoGenerationJob, VideoJobStatus, WeaknessFlag, RemediationPlan
from app.modules.shared_models.skill_taxonomy import SkillTaxonomy
from app.modules.module2_content.models import Course, Lesson, CourseModule
from app.modules.module5_assessment.services.grading_service import grade_mcq_deterministic
from app.modules.module5_assessment.models import Submission, Question, QuestionType, Test
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
                if ans and grade_mcq_deterministic(q, ans)[0] < float(q.max_score):
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
        "source_chunks": [{"text": c.chunk_text, "lesson_id": str(c.lesson_id)} for c in chunks],
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
0. Teach underlying curriculum. Never reveal quiz answers, option IDs, answer keys or internal assessment metadata.
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
                    if ans and grade_mcq_deterministic(q, ans)[0] < float(q.max_score):
                        mistakes.append({
                            "prompt": q.prompt,
                            "student_answer": ans.get("selected_option_id") or ans.get("text_response"),
                            "options": q.options,
                            "rubric": q.rubric
                        })

        query_text = f"Skill: {skill.name}. {skill.description}. Mistakes: {json.dumps(mistakes)}"
        chunks = await retrieve_course_chunks(course.id, query_text, db=db, top_k=4)
        
        source_chunks = [{"text": c.chunk_text, "lesson_id": str(c.lesson_id)} for c in chunks]
        if not source_chunks:
            lessons = (await db.execute(select(Lesson).join(CourseModule, CourseModule.id == Lesson.module_id).where(CourseModule.course_id == course.id, Lesson.status == "published").order_by(CourseModule.sequence_order, Lesson.sequence_order))).scalars().all()
            source_chunks = [{"text": l.body_markdown, "lesson_id": str(l.id)} for l in lessons if l.body_markdown]
        if not source_chunks:
            raise ValueError("No authoritative curriculum text is available")
        plan = await db.get(RemediationPlan, job.remediation_plan_id) if job.remediation_plan_id else None
        context = {
            "course_title": course.title,
            "skill_name": skill.name,
            "skill_description": skill.description,
            "mistakes": mistakes,
            "source_chunks": source_chunks,
            "written_remediation": plan.remedial_course_markdown if plan else None,
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

        validate_storyboard(data)
        # Persist results
        job.title = data["lesson_plan"]["title"]
        job.script_json = {"lesson_plan": data["lesson_plan"], "validation": data.get("validation", {})}
        job.scene_json = {"scenes": data["scenes"]}
        
        job.status = VideoJobStatus.storyboard_ready
        await db.commit()
        logger.info("script_generation_success", job_id=str(job_id))
        
    except Exception as e:
        logger.error("script_generation_failed", job_id=str(job_id), error=str(e))
        job.status = VideoJobStatus.failed
        job.error_message = f"Script generation failed: {str(e)}"
        await db.commit()
        raise e


def validate_storyboard(data: dict) -> None:
    if not isinstance(data, dict) or not isinstance(data.get('lesson_plan'), dict):
        raise ValueError('Invalid lesson plan')
    title=data['lesson_plan'].get('title')
    if not isinstance(title,str) or not title.strip():raise ValueError('Missing title')
    scenes=data.get('scenes');seen=set()
    if not isinstance(scenes,list) or not 1 <= len(scenes) <= 20:raise ValueError('Invalid scene count')
    for scene in scenes:
        if not isinstance(scene,dict):raise ValueError('Invalid scene')
        sid=scene.get('scene_id')
        if not isinstance(sid,str) or not sid.strip() or sid in seen:raise ValueError('Duplicate or missing scene ID')
        seen.add(sid)
        for key in ('heading','narration'):
            if not isinstance(scene.get(key),str) or not scene[key].strip():raise ValueError('Missing scene text')
        duration=scene.get('duration_seconds')
        if isinstance(duration,bool) or not isinstance(duration,(int,float)) or not 0 < duration <= 600:raise ValueError('Invalid duration')
        if scene.get('scene_type') not in {'intro','concept','comparison','diagram','example','misconception_correction','recap'}:raise ValueError('Invalid scene type')
        if not isinstance(scene.get('visual_intent'),dict) or not isinstance(scene.get('on_screen_text'),list):raise ValueError('Invalid visual intent')
    if not 10 <= sum(s['duration_seconds'] for s in scenes) <= 600:raise ValueError('Invalid total duration')
