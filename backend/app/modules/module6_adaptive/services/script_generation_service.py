import uuid
import json
import asyncio, time
from app.modules.module6_adaptive.services.storyboard_schema import normalize_storyboard, validation_errors, repair_fields, apply_field_repair
from app.modules.module6_adaptive.services.pipeline_errors import VideoPipelineError, safe_error, is_transient
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

SYSTEM_PROMPT = """You design grounded, helpful educational videos for Grades 1-5.
Return ONE strict JSON object only, following this exact visual schema. Replace example text with real curriculum content. Every scene MUST include visual_version=2, diagram, character_pose and transition. Do not omit any required field.
{
 "lesson_plan":{"title":"Lesson title","target_skill_name":"Skill","learning_objectives":["Objective"],"student_misconceptions":["Misconception"],"teaching_strategy":"Strategy","target_duration_seconds":180},
 "scenes":[{
  "scene_id":"scene-1","visual_version":2,"scene_type":"intro","duration_seconds":25,
  "heading":"Short heading","narration":"Write a complete spoken paragraph of 50 to 58 words here, grounded in the actual supplied lesson. Introduce the concept, explain what the learner will understand, and describe the first visual. Include enough explanatory sentences for a real teacher to speak naturally. Replace this instruction with the real educational narration.",
  "visual_intent":{"type":"none","concepts":["Core concept"]},
  "on_screen_text":["Short teaching point"],
  "diagram":{"kind":"none","labels":[],"values":[],"denominators":[]},
  "character_pose":"welcome","transition":"fade"
 }],
 "validation":{"grounding_check":"How source is used","misconception_alignment":"How mistakes are addressed","grade_level_check":"Why vocabulary is suitable"}
}
Generate exactly 8 scenes and 400-460 TOTAL spoken narration words. Write 50-58 words for EVERY scene, including the introduction and recap. Each scene must have 40-75 spoken words, never a short slogan. Include a hook, concept explanation, two visual worked examples, comparison, misconception correction and recap. Ground the lesson strictly in Source Chunks and written remediation. Teach reasoning; never disclose quiz answer keys, option IDs or internal metadata.
Allowed scene_type: intro, concept, comparison, diagram, example, misconception_correction, recap.
Heading <=65 characters. on_screen_text: 1-3 short teaching strings <=80 characters each, not transcripts.
Diagram has EXACTLY four keys: kind, labels, values, denominators. Allowed kinds: none, fraction_bars, number_line, equation_steps, process, cycle, comparison.
At least TWO scenes must contain useful structured diagrams. Include different useful diagram kinds suitable for the topic.
For none all arrays are empty.
For fraction_bars: 1-3 labels <=48 characters, selected-part integer values and denominator integers 1-12. All arrays have equal length. Values must be 0 through denominator inclusive. Labels and quantities must agree. Example: {"kind":"fraction_bars","labels":["One half","Two fourths"],"values":[1,2],"denominators":[2,4]}.
For number_line: 1-4 labels and equally many positions in [0,1], denominators empty. Example: {"kind":"number_line","labels":["1/2","2/3"],"values":[0.5,0.6667],"denominators":[]}.
For equation_steps, process, cycle or comparison: 2-4 short labels <=48 characters, values and denominators empty. Correct sourced equations, simple vocabulary, one core idea per scene. For simplification show division of BOTH numerator and denominator: (6 ÷ 2)/(8 ÷ 2) = 3/4. Never label this as 6/8 ÷ 2, which changes the fraction value.
character_pose: explain, point, welcome or recap. transition: fade or slide. Narration duration is advisory; measured TTS determines render timing.
Before returning COUNT narration words: TOTAL 400-460 across 8 scenes, each 40-75. Check every scene has visual_version 2 and complete diagram data.
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
        if plan and plan.source_submission_id != job.submission_id:
            raise ValueError("Written remediation belongs to another submission")
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
        
        # Retain rejected structured drafts internally, so a repair can target the
        # actual validation failure instead of losing a paid provider response.
        candidate = (job.script_json or {}).get("candidate_storyboard")
        if candidate is None and job.scene_json:
            candidate = {**(job.script_json or {}), **job.scene_json}
        async def retain_candidate(data):
            job.script_json = {"candidate_storyboard": data}
            await db.commit()
            logger.info("storyboard_word_counts", job_id=str(job_id), words=_narration_word_counts(data))

        data = await generate_validated_storyboard(user_prompt, candidate, retain_candidate, job_id=str(job_id))
        # Persist results
        job.title = data["lesson_plan"]["title"]
        job.script_json = {"lesson_plan": data["lesson_plan"], "validation": data.get("validation", {})}
        job.scene_json = {"scenes": data["scenes"]}
        
        job.status = VideoJobStatus.storyboard_ready
        await db.commit()
        logger.info("script_generation_success", job_id=str(job_id))
        
    except Exception as e:
        logger.error("script_generation_failed", job_id=str(job_id), error_type=type(e).__name__, error=safe_error(e))
        job.status = VideoJobStatus.failed
        job.error_code = e.code if isinstance(e,VideoPipelineError) else "VIDEO_STORYBOARD_INVALID" if isinstance(e,ValueError) else "VIDEO_SCRIPT_FAILED"
        job.error_message = "Script generation failed: " + safe_error(e)
        await db.commit()
        raise e


def _narration_word_counts(data) -> list[int]:
    scenes = data.get("scenes") if isinstance(data, dict) else None
    if not isinstance(scenes, list):
        return []
    return [len(scene["narration"].split()) for scene in scenes
            if isinstance(scene, dict) and isinstance(scene.get("narration"), str)]


NARRATION_REPAIR_PROMPT = """You repair narration in grounded educational storyboards.
Return ONLY JSON: {"narrations":[{"scene_id":"the exact supplied ID","narration":"the rewritten spoken paragraph"}]}.
Rewrite EVERY supplied scene narration as a NEW complete 50-58 word paragraph. Aim for 55 words per scene and 400-460 total words across 8 scenes.
Do not copy the old paragraphs unchanged. Expand sourced explanations and worked-example reasoning using ONLY supplied curriculum and remediation.
Keep the same teaching sequence, learner misconceptions and meaning. Never add answer IDs, quiz answer keys, unrelated facts, padding or repeated filler.
Return each scene ID exactly once. Do not return lesson_plan, diagrams or full storyboard objects. Count words before returning.
"""


def apply_narration_repair(draft: dict, patch: dict) -> dict:
    """Replace narration only; refuse missing, duplicate or foreign scene IDs."""
    import copy
    if not isinstance(patch,dict) or set(patch)!={"narrations"}:raise ValueError("Narration repair requires only a narrations array")
    rows = patch.get("narrations")
    if not isinstance(rows, list):
        raise ValueError("Narration repair must supply all scene narrations")
    replacements = {}
    for row in rows:
        if not isinstance(row, dict) or set(row)!={"scene_id","narration"} or not isinstance(row.get("scene_id"), str) or not isinstance(row.get("narration"), str) or not row["narration"].strip():
            raise ValueError("Invalid narration repair")
        if row["scene_id"] in replacements:
            raise ValueError("Duplicate narration repair scene ID")
        replacements[row["scene_id"]] = row["narration"]
    if set(replacements) != {scene["scene_id"] for scene in draft["scenes"]}:
        raise ValueError("Narration repair scene IDs do not match the storyboard")
    repaired = copy.deepcopy(draft)
    for scene in repaired["scenes"]:
        scene["narration"] = replacements[scene["scene_id"]]
    return repaired


async def generate_validated_storyboard(user_prompt: str, candidate=None, retain_candidate=None, job_id=None) -> dict:
    """At most two provider requests, including repair or transient recovery."""
    draft=normalize_storyboard(candidate); failure=None; errors=[]
    if candidate is not None:
        try: validate_storyboard(draft,True); return draft
        except ValueError as exc: failure=str(exc);errors=validation_errors(draft)
    for attempt in range(2):
        started=time.monotonic(); allowed=repair_fields(draft,errors) if failure else None
        narration_only=bool(failure and errors and all(not e["path"] and "Substantial narration required" in e["message"] for e in errors) and isinstance(draft,dict) and isinstance(draft.get("scenes"),list) and len(draft["scenes"])==8)
        prompt=user_prompt;system=SYSTEM_PROMPT
        if failure:
            counts=_narration_word_counts(draft)
            prompt += "\nRepair ONLY the rejected fields using the original curriculum. Validation errors: " + json.dumps(errors or [{"message":failure}]) + "\nNarration word counts: " + json.dumps(counts) + "; total: " + str(sum(counts)) + "\nSaved draft: " + json.dumps(draft)
            if narration_only:
                system=NARRATION_REPAIR_PROMPT; prompt += "\nReturn only the narrations array; preserve all exact scene IDs."
            elif allowed:
                system = SYSTEM_PROMPT + """
THIS IS A TARGETED REPAIR, not a new storyboard.
Return ONLY {"repairs":[{"scene_id":"exact requested ID","field":"diagram","value":{"kind":"process","labels":["Sourced step one","Sourced step two"],"values":[],"denominators":[]}}]}.
The value MUST be the actual JSON object/array/number/string appropriate to that field, never stringified JSON.
Address every requested scene/field exactly once. Return no complete storyboard, extra fields or markdown.
Preserve all unrequested fields and original scene IDs. Keep the curriculum's exact teaching meaning.
You MAY change an invalid diagram's kind to another allowed kind to faithfully express the same idea.
A fraction bar represents only a quantity from zero to one: selected integer <= denominator integer <=12.
A quantity greater than one cannot be represented by a unit fraction bar. Use sourced equation_steps/process instead; NEVER change the correct numerical answer to fit the diagram.
Number lines have at most four labelled positions, each in [0,1]. If an example needs more entries, use another valid structured representation; preserve its teaching meaning in 2-4 labels.
All diagram objects have exactly kind,labels,values,denominators. Structured diagram labels have 2-4 entries, each <=48 characters; numeric arrays are empty.
Recheck ALL supplied validation errors before returning the targeted patch.
"""

                prompt += "\nRequested fields: " + json.dumps([{"scene_id":sid,"field":field} for sid,field in sorted(allowed)])
            else: prompt += "\nReturn a complete corrected storyboard using the canonical schema."
        try:
            response=await generate_llm_completion(system_prompt=system,user_prompt=prompt,temperature=0.2,max_tokens=8000,json_mode=True,max_retries=1,sdk_max_retries=0)
        except Exception as exc:
            logger.warning("video_provider_request_failed",job_id=job_id,stage="script",attempt=attempt+1,duration_seconds=round(time.monotonic()-started,3),error_type=type(exc).__name__)
            if attempt==1 or not is_transient(exc): raise VideoPipelineError("VIDEO_SCRIPT_FAILED","Storyboard provider request failed: "+type(exc).__name__) from exc
            await asyncio.sleep(1);continue
        data=None
        try:
            if not isinstance(response,str) or not response.strip() or len(response)>100000: raise ValueError("Empty or oversized provider response")
            import re
            response=re.sub(r"^```(?:json)?\s*([\s\S]*?)\s*```$",r"\1",response.strip(),flags=re.IGNORECASE)
            parsed=json.loads(response)
            data=apply_narration_repair(draft,parsed) if narration_only else apply_field_repair(draft,parsed,allowed) if allowed else parsed
            data=normalize_storyboard(data)
            if isinstance(data,dict) and retain_candidate: await retain_candidate(data)
            validate_storyboard(data,True)
            logger.info("video_storyboard_validated",job_id=job_id,stage="script",attempt=attempt+1,repair_used=bool(failure),duration_seconds=round(time.monotonic()-started,3))
            return data
        except ValueError as exc:
            if isinstance(data,dict): draft=data
            failure=str(exc);errors=validation_errors(draft)
            logger.warning("video_storyboard_rejected",job_id=job_id,stage="script",attempt=attempt+1,validation_errors=errors,repair_error=safe_error(exc))
            if attempt==1: raise
    raise ValueError("No valid storyboard generated")


def validate_storyboard(data: dict, require_visuals: bool = False) -> None:
    if require_visuals:
        typed_errors = validation_errors(data)
        if typed_errors:
            raise ValueError('; '.join('.'.join(map(str,e['path'])) + ': ' + e['message'] for e in typed_errors))
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

    if require_visuals or any(s.get('visual_version') == 2 for s in scenes):
        import math
        diagram_count = 0
        for scene in scenes:
            if scene.get('visual_version') != 2: raise ValueError('Visual schema version required')
            if len(scene['heading']) > 65: raise ValueError('Heading too long')
            text = scene['on_screen_text']
            if not 1 <= len(text) <= 3 or any(not isinstance(t,str) or not t.strip() or len(t)>80 for t in text): raise ValueError('Invalid teaching text')
            if not 35 <= len(scene['narration'].split()) <= 85: raise ValueError('Narration length invalid')
            if scene.get('character_pose') not in {'explain','point','welcome','recap'}: raise ValueError('Invalid teacher pose')
            if scene.get('transition') not in {'fade','slide'}: raise ValueError('Invalid transition')
            diagram=scene.get('diagram')
            if not isinstance(diagram,dict) or set(diagram) != {'kind','labels','values','denominators'}: raise ValueError('Invalid diagram schema')
            kind=diagram['kind']; labels=diagram['labels']; values=diagram['values']; denominators=diagram['denominators']
            if kind not in {'none','fraction_bars','number_line','equation_steps','process','cycle','comparison'}: raise ValueError('Invalid diagram kind')
            if not isinstance(labels,list) or any(not isinstance(t,str) or not t.strip() or len(t)>48 for t in labels): raise ValueError('Invalid diagram labels')
            if not isinstance(values,list) or any(isinstance(v,bool) or not isinstance(v,(int,float)) or not math.isfinite(v) for v in values): raise ValueError('Invalid diagram values')
            if not isinstance(denominators,list) or any(type(v) is not int or not 1<=v<=12 for v in denominators): raise ValueError('Invalid denominator')
            if kind=='none':
                if labels or values or denominators: raise ValueError('Empty diagram must have no data')
            elif kind=='fraction_bars':
                if not 1<=len(labels)<=3 or len(labels)!=len(values) or len(labels)!=len(denominators) or any(type(v) is not int or not 0<=v<=d for v,d in zip(values,denominators)): raise ValueError('Invalid fractions')
            elif kind=='number_line':
                if not 1<=len(labels)<=4 or len(labels)!=len(values) or denominators or any(not 0<=v<=1 for v in values): raise ValueError('Invalid number line')
            elif not 2<=len(labels)<=4 or values or denominators: raise ValueError('Invalid diagram steps')
            if kind == 'equation_steps':
                import re
                if any(re.fullmatch(r"\s*\d+\s*/\s*\d+\s*÷\s*\d+\s*", label) for label in labels):
                    raise ValueError('Simplification must divide numerator and denominator explicitly')
            if kind!='none': diagram_count+=1
        if diagram_count < 2: raise ValueError('Educational diagrams required')
        if not 360 <= sum(len(s['narration'].split()) for s in scenes) <= 480: raise ValueError('Substantial narration required')
