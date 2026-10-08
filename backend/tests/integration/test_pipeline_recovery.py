"""Focused pipeline recovery tests: no provider calls or database resets."""
import asyncio
import uuid
from datetime import datetime,timezone,timedelta
from types import SimpleNamespace as NS
from unittest.mock import AsyncMock,Mock
import pytest
from app.modules.module6_adaptive.models import VideoJobStatus,WeaknessStatus,PlanStatus
from app.modules.module6_adaptive.services import video_job_service as jobs

def scalar(value):
    return NS(scalar_one_or_none=lambda:value,scalar_one=lambda:value)
def rows(values):
    return NS(scalars=lambda:NS(all=lambda:values,__iter__=lambda self:iter(values)))

@pytest.mark.asyncio
@pytest.mark.parametrize("status",[VideoJobStatus.failed,VideoJobStatus.rendering,VideoJobStatus.queued])
async def test_explicit_retry_preserves_checkpoints_and_history(monkeypatch,status):
    student=uuid.uuid4();sub=uuid.uuid4();flag_id=uuid.uuid4();plan_id=uuid.uuid4()
    job=NS(id=uuid.uuid4(),student_id=student,submission_id=sub,weakness_flag_id=flag_id,remediation_plan_id=plan_id,status=status,retry_count=3,error_code="VIDEO_SCRIPT_FAILED",error_message="specific failure",started_at=datetime.now(timezone.utc)-timedelta(hours=1),created_at=datetime.now(timezone.utc)-timedelta(hours=2),completed_at=None,script_json={"candidate_storyboard":"saved"},audio_manifest_json={"saved":"audio"})
    flag=NS(id=flag_id,student_id=student,submission_id=sub,status=WeaknessStatus.active)
    plan=NS(student_id=student,status=PlanStatus.active,source_submission_id=sub)
    db=NS(get=AsyncMock(side_effect=[job,plan]),execute=AsyncMock(side_effect=[scalar(flag),scalar(None)]),refresh=AsyncMock(),commit=AsyncMock())
    broker=NS(get=AsyncMock(return_value=None))
    enqueue=AsyncMock()
    monkeypatch.setattr(jobs,"get_redis_client",lambda:broker)
    monkeypatch.setattr(jobs,"enqueue_video_job",enqueue)
    result=await jobs.retry_video_generation_job(db,student,job.id)
    assert result is job and job.status==VideoJobStatus.queued
    assert job.retry_count==3 and job.script_json=={"candidate_storyboard":"saved"} and job.audio_manifest_json=={"saved":"audio"}
    assert job.error_code is None and job.error_message is None
    enqueue.assert_awaited_once_with(db,job)

@pytest.mark.asyncio
@pytest.mark.parametrize("boundary",["owner","lifecycle","live_lease","fresh"])
async def test_retry_does_not_cross_owner_lifecycle_or_running_worker(monkeypatch,boundary):
    student=uuid.uuid4();sub=uuid.uuid4()
    job=NS(id=uuid.uuid4(),student_id=uuid.uuid4() if boundary=="owner" else student,submission_id=sub,weakness_flag_id=uuid.uuid4(),status=VideoJobStatus.rendering,started_at=datetime.now(timezone.utc)-timedelta(hours=1),created_at=datetime.now(timezone.utc))
    flag=NS(student_id=student,submission_id=uuid.uuid4() if boundary=="lifecycle" else sub,status=WeaknessStatus.active)
    if boundary=="fresh":job.started_at=datetime.now(timezone.utc)
    db=NS(get=AsyncMock(return_value=job),execute=AsyncMock(return_value=scalar(flag)),refresh=AsyncMock(),commit=AsyncMock())
    monkeypatch.setattr(jobs,"get_redis_client",lambda:NS(get=AsyncMock(return_value="another-owner")))
    enqueue=AsyncMock();monkeypatch.setattr(jobs,"enqueue_video_job",enqueue)
    if boundary in ("owner","lifecycle"):
        with pytest.raises(Exception):await jobs.retry_video_generation_job(db,student,job.id)
    else:assert await jobs.retry_video_generation_job(db,student,job.id) is job
    enqueue.assert_not_awaited();db.commit.assert_not_awaited()

@pytest.mark.asyncio
async def test_queue_outage_keeps_durable_queued_job_for_reconnect(monkeypatch):
    job=NS(id=uuid.uuid4(),retry_count=1,status=VideoJobStatus.queued,error_code=None)
    db=NS(commit=AsyncMock())
    broker=NS(eval=AsyncMock(side_effect=TimeoutError("temporary network outage")))
    monkeypatch.setattr(jobs,"get_redis_client",lambda:broker)
    await jobs.enqueue_video_job(db,job)
    assert job.status==VideoJobStatus.queued and job.error_code=="VIDEO_ENQUEUE_PENDING"
    broker.eval.side_effect=None;broker.eval.return_value="message"
    await jobs.enqueue_video_job(db,job)
    assert broker.eval.await_count==2

@pytest.mark.asyncio
async def test_assessment_reuses_valid_saved_final_without_provider(monkeypatch):
    from app.modules.module5_assessment.services import generation_service as gen
    from app.modules.module5_assessment.models import QuestionType
    questions=[NS(question_type=QuestionType.mcq,prompt=f"Question {i}?",max_score=1,options=[{"id":str(n),"text":f"Choice {n}","is_correct":n==0} for n in range(4)]) for i in range(10)]
    valid=NS(id=uuid.uuid4(),questions=questions)
    malformed=NS(questions=questions[:9])
    db=NS(execute=AsyncMock(side_effect=[scalar(NS(id=uuid.uuid4())),rows([malformed,valid])]))
    provider=AsyncMock(side_effect=AssertionError("Saved valid test must be reused"))
    monkeypatch.setattr(gen,"generate_llm_completion",provider)
    assert await gen.generate_course_assessment(uuid.uuid4(),db) is valid
    provider.assert_not_awaited()

@pytest.mark.asyncio
async def test_two_courses_sharing_a_skill_keep_independent_weaknesses():
    from app.modules.module6_adaptive.services.weakness_detector import evaluate_submission_skills_for_weaknesses
    from app.modules.module6_adaptive.models import WeaknessFlag
    from app.modules.module5_assessment.models import SkillScore,Test,Submission
    student=uuid.uuid4();skill=uuid.uuid4();course_a=uuid.uuid4();course_b=uuid.uuid4()
    test_ids={uuid.uuid4():course_a,uuid.uuid4():course_b}
    flags=[]
    class DB:
        async def get(self,model,key):return NS(course_id=test_ids[key],lesson_id=None)
        async def execute(self,query):
            entity=query.column_descriptions[0]["entity"]
            if entity is SkillScore:return rows([NS(skill_id=skill,score=0,max_score=1)])
            if entity is WeaknessFlag:
                params=query.compile().params
                course=params.get("course_id_1")
                return scalar(next((f for f in flags if f.course_id==course),None))
            if entity is Submission:return rows([])
            return scalar(student)
        def add(self,value):flags.append(value)
        async def flush(self):
            for flag in flags:
                if not flag.id:flag.id=uuid.uuid4()
        async def commit(self):pass
    db=DB()
    submissions=[NS(id=uuid.uuid4(),student_id=student,test_id=t,submitted_at=datetime.now(timezone.utc)) for t in test_ids]
    first,_=await evaluate_submission_skills_for_weaknesses(submissions[0],db)
    second,_=await evaluate_submission_skills_for_weaknesses(submissions[1],db)
    assert len(first)==len(second)==1 and len(flags)==2
    assert first[0].course_id==course_a and second[0].course_id==course_b
    assert first[0].submission_id==submissions[0].id and second[0].submission_id==submissions[1].id

def test_real_render_budget_scales_with_measured_audio_and_stays_bounded(monkeypatch,tmp_path):
    import json
    from app.modules.module6_adaptive.services import render_service as service
    monkeypatch.setattr(service,"renderer_command",lambda:["node","tsx","render.ts"])
    from unittest.mock import Mock
    payload=tmp_path/"input.json"
    payload.write_text(json.dumps({"audio_manifest":{"scenes":[{"render_duration_seconds":200}]}}))
    process=Mock(returncode=0)
    process.communicate.return_value=(json.dumps({"success":True,"is_mock_audio":False}),"")
    monkeypatch.setattr(service.subprocess,"Popen",Mock(return_value=process))
    assert service.invoke_remotion_render(str(payload),str(tmp_path/"video.mp4")).success
    process.communicate.assert_called_once_with(timeout=1800)

def test_render_timeout_terminates_own_process_tree_before_retry(monkeypatch,tmp_path):
    import json,subprocess
    from app.modules.module6_adaptive.services import render_service as service
    monkeypatch.setattr(service,"renderer_command",lambda:["node","tsx","render.ts"])
    from unittest.mock import Mock
    payload=tmp_path/"input.json"
    payload.write_text(json.dumps({"audio_manifest":{"scenes":[{"render_duration_seconds":180}]}}))
    process=Mock(pid=12345,returncode=1)
    process.poll.return_value=None
    process.communicate.side_effect=[subprocess.TimeoutExpired("render",1080),("","")]
    monkeypatch.setattr(service.subprocess,"Popen",Mock(return_value=process))
    kill=Mock();monkeypatch.setattr(service.subprocess,"run",kill)
    result=service.invoke_remotion_render(str(payload),str(tmp_path/"video.mp4"))
    assert not result.success and "1620s" in result.error
    if service.os.name=="nt":assert kill.call_args.args[0]==["taskkill","/PID","12345","/T","/F"]
    else:process.kill.assert_called_once()
    assert process.communicate.call_count==2

@pytest.mark.asyncio
async def test_course_vector_retrieval_uses_migrated_embedding_column(monkeypatch):
    from contextlib import asynccontextmanager
    from app.modules.module5_assessment.services import rag_service as rag
    chunk = NS(id=uuid.uuid4(),lesson_id=uuid.uuid4(),lesson_version=1,chunk_index=0,chunk_text="Authoritative lesson",similarity=0.9)
    class DB:
        @asynccontextmanager
        async def begin_nested(self):
            yield
        async def execute(self,query,params=None):
            sql=str(query)
            if "information_schema.columns" in sql:
                return NS(scalar_one=lambda:True)
            assert "ce.embedding <=>" in sql and "ce.vector" not in sql
            assert params["course_id"]==course and params["top_k"]==4
            return NS(fetchall=lambda:[chunk])
    course=uuid.uuid4()
    monkeypatch.setattr(rag,"get_embedding",AsyncMock(return_value=[0.1]*384))
    result=await rag.retrieve_course_chunks(course,"Hardware",DB(),4)
    assert len(result)==1 and result[0].chunk_text==chunk.chunk_text and result[0].similarity==0.9
@pytest.mark.asyncio
async def test_course_without_optional_pgvector_uses_saved_text_without_provider(monkeypatch):
    from contextlib import asynccontextmanager
    from app.modules.module5_assessment.services import rag_service as rag
    chunk=NS(id=uuid.uuid4(),lesson_id=uuid.uuid4(),lesson_version=1,chunk_index=0,chunk_text="Saved curriculum",similarity=0)
    class DB:
        @asynccontextmanager
        async def begin_nested(self):yield
        async def execute(self,query):
            if "information_schema.columns" in str(query):return NS(scalar_one=lambda:False)
            return rows([chunk])
    provider=AsyncMock(side_effect=AssertionError("Unavailable vectors must not require provider"))
    monkeypatch.setattr(rag,"get_embedding",provider)
    result=await rag.retrieve_course_chunks(uuid.uuid4(),"CPU",DB(),4)
    assert result[0].chunk_text=="Saved curriculum" and result[0].similarity==0
    provider.assert_not_awaited()