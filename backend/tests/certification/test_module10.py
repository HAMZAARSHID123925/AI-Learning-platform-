"""Module10 regressions: no live provider calls or destructive fixtures."""
import os,sys,uuid,json
from pathlib import Path
from types import SimpleNamespace as NS
from unittest.mock import AsyncMock
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
os.environ.setdefault('DATABASE_URL','postgresql+asyncpg://unused:unused@127.0.0.1/unused')
os.environ.setdefault('REDIS_URL','redis://127.0.0.1:6379/15')
import pytest
from app.main import app
from app.modules.module6_adaptive.models import VideoJobStatus as S
from app.modules.module6_adaptive import router
from app.modules.module6_adaptive.services import audio_generation_service as audio,script_generation_service as script,video_job_service as jobs
from app.shared.tts_client import TTSSynthesisResult

@pytest.mark.asyncio
async def test_status_uses_actual_user_role_api():
 uid=uuid.uuid4();job=NS(id=uuid.uuid4(),student_id=uid,course_id=uuid.uuid4(),weakness_flag_id=uuid.uuid4(),status=S.queued,title=None,target_duration_seconds=180,video_url=None,thumbnail_url=None,error_code=None,created_at='2026-10-04T00:00:00Z',started_at=None,completed_at=None)
 user=NS(id=uid,has_role=lambda r:r=='Student');db=NS(get=AsyncMock(return_value=job))
 result=await router.get_video_job_status(job.id,db,user)
 assert result.id==job.id

@pytest.mark.asyncio
async def test_script_accepts_actual_rag_chunk_field(monkeypatch):
 jid,sid,cid,fid=[uuid.uuid4() for _ in range(4)];job=NS(id=jid,weakness_flag_id=fid,skill_id=sid,course_id=cid,submission_id=uuid.uuid4(),target_duration_seconds=180,remediation_plan_id=None,status=S.planning)
 skill=NS(id=sid,name='Hardware',description='CPU and RAM');course=NS(id=cid,title='Hardware');sub=NS(answers={},test=NS(questions=[]))
 db=NS(get=AsyncMock(side_effect=lambda model,id:job if id==jid else skill if id==sid else course if id==cid else NS()),execute=AsyncMock(return_value=NS(scalar_one_or_none=lambda:sub)),commit=AsyncMock())
 monkeypatch.setattr(script,'retrieve_course_chunks',AsyncMock(return_value=[NS(chunk_text='CPU processes instructions.',lesson_id=uuid.uuid4())]))
 monkeypatch.setattr(script,'generate_llm_completion',AsyncMock(return_value=json.dumps({'lesson_plan':{'title':'CPU','target_skill_name':'Hardware'},'scenes':[{'scene_id':'s1','scene_type':'intro','duration_seconds':10,'heading':'CPU','narration':'The CPU processes instructions.','visual_intent':{'type':'concept','concepts':['CPU']},'on_screen_text':['CPU']}]})))
 await script.generate_personalized_script_and_scenes(jid,db)
 assert job.status==S.storyboard_ready

@pytest.mark.asyncio
async def test_uploaded_audio_uses_returned_private_object_key(monkeypatch):
 job=NS(id=uuid.uuid4(),status=S.storyboard_ready,scene_json={'scenes':[{'scene_id':'s1','narration':'The CPU processes instructions.','duration_seconds':5}]},audio_manifest_json=None,target_duration_seconds=5)
 db=NS(get=AsyncMock(return_value=job),commit=AsyncMock())
 monkeypatch.setattr(audio,'synthesize_narration',AsyncMock(return_value=TTSSynthesisResult(provider='openai_tts',voice_id='nova',audio_bytes=b'audio',format='mp3',duration_seconds=5,text_hash='hash',is_mock=False)))
 monkeypatch.setattr(audio,'upload_file',AsyncMock(return_value=('private/job/audio.mp3','https://private.invalid/audio')))
 manifest=await audio.generate_scene_audio(job.id,db)
 assert manifest.scenes[0].audio_key=='private/job/audio.mp3'
 assert job.status==S.audio_ready
 job.status=S.storyboard_ready
 await audio.generate_scene_audio(job.id,db)
 assert audio.synthesize_narration.await_count==1 and audio.upload_file.await_count==1

from app.workers import video_generation_consumer as worker

@pytest.mark.asyncio
@pytest.mark.parametrize('failed_stage',['script','audio','render','upload'])
async def test_worker_persists_sanitized_failure_once(monkeypatch,failed_stage):
 job=NS(id=uuid.uuid4(),status=S.queued,started_at=None,retry_count=0,scene_json=None,script_json=None)
 db=NS(get=AsyncMock(return_value=job),commit=AsyncMock(),rollback=AsyncMock())
 async def scripts(jid,db):
  if failed_stage=='script':raise RuntimeError('SECRET_SENTINEL must not reach response')
  job.scene_json={'scenes':[]};job.script_json={};job.status=S.storyboard_ready
 async def tts(jid,db):
  if failed_stage=='audio':raise RuntimeError('SECRET_SENTINEL must not reach response')
  job.status=S.audio_ready
 async def render(jid,db):raise RuntimeError('SECRET_SENTINEL must not reach response')
 monkeypatch.setattr(worker,'generate_personalized_script_and_scenes',scripts);monkeypatch.setattr(worker,'generate_scene_audio',tts);monkeypatch.setattr(worker,'render_video',render)
 result=await worker._process_owned_job(job.id,db)
 assert result['status']=='error' and job.status==S.failed and job.retry_count==1
 assert 'SECRET_SENTINEL' not in str(result)+job.error_message

@pytest.mark.asyncio
async def test_worker_resumes_saved_storyboard_and_skips_ready_duplicate(monkeypatch):
 job=NS(id=uuid.uuid4(),status=S.storyboard_ready,started_at=None,retry_count=0,scene_json={'scenes':[]},script_json={'lesson_plan':{}},audio_manifest_json=None)
 db=NS(get=AsyncMock(return_value=job),commit=AsyncMock(),rollback=AsyncMock())
 llm=AsyncMock();monkeypatch.setattr(worker,'generate_personalized_script_and_scenes',llm)
 async def tts(jid,db):job.status=S.audio_ready
 async def render(jid,db):job.status=S.ready
 tts_mock=AsyncMock(side_effect=tts);render_mock=AsyncMock(side_effect=render)
 monkeypatch.setattr(worker,'generate_scene_audio',tts_mock);monkeypatch.setattr(worker,'render_video',render_mock)
 assert (await worker._process_owned_job(job.id,db))['status']=='success'
 assert (await worker._process_owned_job(job.id,db))['status']=='skipped'
 llm.assert_not_called();assert tts_mock.await_count==render_mock.await_count==1

@pytest.mark.parametrize('fault',['duplicate_id','empty_narration','wrong_type','bad_duration'])
def test_malformed_storyboard_rejected(fault):
 data={'lesson_plan':{'title':'CPU'},'scenes':[{'scene_id':'s1','scene_type':'intro','duration_seconds':10,'heading':'CPU','narration':'The CPU runs instructions.','visual_intent':{},'on_screen_text':[]}]}
 if fault=='duplicate_id':data['scenes'].append(dict(data['scenes'][0]))
 if fault=='empty_narration':data['scenes'][0]['narration']=' '
 if fault=='wrong_type':data['scenes'][0]['scene_type']='arbitrary'
 if fault=='bad_duration':data['scenes'][0]['duration_seconds']=-1
 with pytest.raises(ValueError):script.validate_storyboard(data)

@pytest.mark.asyncio
async def test_worker_queue_setup_failure_is_not_hidden(monkeypatch):
 redis=NS(xgroup_create=AsyncMock(side_effect=TimeoutError('controlled unavailable broker')))
 monkeypatch.setattr(worker,'get_redis_client',lambda:redis)
 with pytest.raises(TimeoutError):await worker.run_consumer_loop()

@pytest.mark.asyncio
async def test_render_service_persists_private_upload_failure(monkeypatch):
 from app.modules.module6_adaptive.services import render_service as render
 from app.shared import s3_client
 job=NS(id=uuid.uuid4(),status=S.audio_ready,title='CPU',scene_json={'scenes':[{'scene_id':'s1','scene_type':'intro','narration':'CPU'}]},audio_manifest_json={'is_mock':False,'scenes':[{'scene_id':'s1','audio_key':'private/audio.mp3','render_duration_seconds':10}]},asset_manifest_json={'character_version':'placeholder','scene_slots':[{'scene_id':'s1','template_id':'intro-v1'}]},retry_count=0)
 db=NS(get=AsyncMock(return_value=job),commit=AsyncMock())
 monkeypatch.setattr(s3_client,'generate_presigned_url',AsyncMock(return_value='https://private.invalid/signed'))
 def rendered(inp,out):
  Path(out).write_bytes(b'controlled-mp4')
  return NS(success=True,duration_seconds=10,file_size_bytes=14,is_mock_audio=False,character_version='placeholder')
 monkeypatch.setattr(render,'invoke_remotion_render',rendered)
 monkeypatch.setattr(render,'validate_mp4_with_ffprobe',lambda *a:NS(valid=True,width=1920,height=1080,fps=30,duration_seconds=10))
 monkeypatch.setattr(render,'upload_file',AsyncMock(side_effect=RuntimeError('controlled private storage failure')))
 with pytest.raises(RuntimeError):await render.render_video(job.id,db)
 assert job.status==S.failed and 'S3 upload failed' in job.error_message
 assert db.commit.await_count>=3

@pytest.mark.asyncio
async def test_correct_answers_are_not_labeled_student_mistakes():
 uid,sid,qid,cid=[uuid.uuid4() for _ in range(4)]
 question=NS(id=qid,skill_id=sid,prompt='What does a CPU do?',rubric=None,max_score=1,options=[{'id':'correct','text':'Runs instructions','is_correct':True},{'id':'wrong','text':'Stores files','is_correct':False}])
 submission=NS(id=uuid.uuid4(),student_id=uid,answers={str(qid):{'selected_option_id':'correct'}},test=NS(questions=[question],course_id=cid,lesson_id=None))
 flag=NS(student_id=uid,skill_id=sid,submission_id=submission.id,id=uuid.uuid4())
 db=NS(get=AsyncMock(return_value=NS(id=sid,name='CPU',description='Processor')),execute=AsyncMock(return_value=NS(scalar_one_or_none=lambda:submission)))
 context=await jobs.build_video_generation_context(db,flag)
 assert context['student_mistakes']==[]

@pytest.mark.asyncio
async def test_renewable_lease_blocks_duplicate_and_releases_on_completion(monkeypatch):
 redis=NS(set=AsyncMock(return_value=True),eval=AsyncMock(return_value=1))
 monkeypatch.setattr(worker,'get_redis_client',lambda:redis)
 process=AsyncMock(return_value={'status':'success'});monkeypatch.setattr(worker,'_process_owned_job',process)
 assert (await worker.process_video_generation_job({'job_id':str(uuid.uuid4())},NS()))['status']=='success'
 assert redis.eval.await_count==1
 redis.set.return_value=False
 assert (await worker.process_video_generation_job({'job_id':str(uuid.uuid4())},NS()))['status']=='busy'
 assert process.await_count==1
