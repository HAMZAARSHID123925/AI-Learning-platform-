"""Focused visual contract and private relay boundaries: no provider calls."""
import os
os.environ.setdefault('DATABASE_URL','postgresql+asyncpg://unused:unused@127.0.0.1/unused')
os.environ.setdefault('REDIS_URL','redis://127.0.0.1:6379/15')
from copy import deepcopy
import uuid
import pytest
from app.modules.module6_adaptive.services.script_generation_service import validate_storyboard
from app.modules.module6_adaptive.services.audio_generation_service import reconcile_scene_timing
from app.modules.module2_content.services.media_relay_service import validate_relay
from app.shared.exceptions import ValidationError

def board():
 return {'lesson_plan':{'title':'Fractions'},'scenes':[{'scene_id':str(i),'scene_type':'diagram','heading':'Equal parts','narration':' '.join(['teach']*50),'duration_seconds':25,'visual_version':2,'visual_intent':{},'on_screen_text':['Equal parts make fractions'],'character_pose':'point','transition':'slide','diagram':{'kind':'fraction_bars','labels':['One half','Two fourths'],'values':[1,2],'denominators':[2,4]}} for i in range(8)]}
def test_valid_visual_storyboard():validate_storyboard(board(),require_visuals=True)
@pytest.mark.parametrize('change',['version','text','denominator','values','pose','unknown','words','duplicate'])
def test_reject_malformed_storyboard(change):
 b=board();s=b['scenes'][0]
 if change=='version':s['visual_version']=1
 if change=='text':s['on_screen_text']=[{'unsafe':'markup'}]
 if change=='denominator':s['diagram']['denominators']=[0,4]
 if change=='values':s['diagram']['values']=[3,2]
 if change=='pose':s['character_pose']='arbitrary'
 if change=='unknown':s['diagram']['url']='external'
 if change=='words':s['narration']='Too short'
 if change=='duplicate':s['scene_id']=b['scenes'][1]['scene_id']
 with pytest.raises(ValueError):validate_storyboard(b,require_visuals=True)
def test_audio_source_of_timing_truth():
 assert reconcile_scene_timing(45,12,0.8)==12.8
 assert reconcile_scene_timing(4,12,0.8)==12.8
@pytest.mark.parametrize('failure',['course','lesson','mime','empty','large','traversal'])
def test_private_relay_boundary(failure):
 course=uuid.uuid4();lesson=uuid.uuid4();key=f'course-content/{course}/lessons/{lesson}/video/{uuid.uuid4()}.mp4';mime='video/mp4';size=100
 if failure=='course':course=uuid.uuid4()
 if failure=='lesson':lesson=uuid.uuid4()
 if failure=='mime':mime='text/html'
 if failure=='empty':size=0
 if failure=='large':size=600*1024*1024
 if failure=='traversal':key=key.replace('video/','video/../')
 with pytest.raises(ValidationError):validate_relay(course,lesson,key,'lesson_video',mime,size)
def test_relay_accepts_exact_private_target():
 course=uuid.uuid4();lesson=uuid.uuid4();validate_relay(course,lesson,f'course-content/{course}/lessons/{lesson}/video/{uuid.uuid4()}.mp4','lesson_video','video/mp4',100)

@pytest.mark.asyncio
async def test_result_recovery_does_not_restart_failed_paid_job(monkeypatch):
 from types import SimpleNamespace as NS
 from unittest.mock import AsyncMock,Mock
 from app.modules.module6_adaptive.services import video_job_service as service
 from app.modules.module6_adaptive.models import WeaknessStatus,VideoJobStatus
 student=uuid.uuid4();weak=uuid.uuid4();submission=uuid.uuid4()
 flag=NS(id=weak,student_id=student,status=WeaknessStatus.active,submission_id=submission)
 failed=NS(status=VideoJobStatus.failed,retry_count=1,error_code='VIDEO_SCRIPT_FAILED')
 rows=[flag,None,None,failed]
 db=NS(execute=AsyncMock(side_effect=[NS(scalar_one_or_none=lambda row=row:row) for row in rows]),add=Mock(),commit=AsyncMock())
 context=AsyncMock(side_effect=AssertionError('Saved failed job must not resolve curriculum or call providers'))
 monkeypatch.setattr(service,'build_video_generation_context',context)
 monkeypatch.setattr(service,'get_redis_client',Mock(side_effect=AssertionError('No paid pipeline queue access')))
 result=await service.create_video_generation_job(db,student,weak)
 assert result is failed and result.status==VideoJobStatus.failed and result.retry_count==1
 db.add.assert_not_called();db.commit.assert_not_awaited();context.assert_not_awaited()


@pytest.mark.parametrize('label,valid', [('6/8 ÷ 2',False), ('(6 ÷ 2)/(8 ÷ 2)',True)])
def test_simplification_diagram_does_not_divide_whole_fraction(label,valid):
    value=board();value['scenes'][0]['diagram']={'kind':'equation_steps','labels':[label,'= 3/4'],'values':[],'denominators':[]}
    if valid: validate_storyboard(value,require_visuals=True)
    else:
        with pytest.raises(ValueError,match='numerator and denominator'):validate_storyboard(value,require_visuals=True)

# Script repair uses mocked provider responses; no paid AI/audio/render calls.
import json
from unittest.mock import AsyncMock
from app.modules.module6_adaptive.services import script_generation_service as scripts

def narration_patch(value=None):
    value=value or board()
    return {'narrations':[{'scene_id':scene['scene_id'],'narration':scene['narration']} for scene in value['scenes']]}

def short_board():
    value=board()
    for scene in value['scenes']:scene['narration']=' '.join(['teach']*44)
    return value

@pytest.mark.asyncio
async def test_script_repairs_short_provider_response_before_tts(monkeypatch):
    provider=AsyncMock(side_effect=[json.dumps(short_board()),json.dumps(narration_patch())]);retained=AsyncMock()
    monkeypatch.setattr(scripts,'generate_llm_completion',provider)
    result=await scripts.generate_validated_storyboard('Authoritative AI lesson context',retain_candidate=retained)
    validate_storyboard(result,require_visuals=True)
    assert provider.await_count==2 and retained.await_count==2
    prompt=provider.call_args.kwargs['user_prompt']
    assert 'Authoritative AI lesson context' in prompt and '352' in prompt and 'Substantial narration required' in prompt

@pytest.mark.asyncio
async def test_script_retry_repairs_saved_candidate(monkeypatch):
    provider=AsyncMock(return_value=json.dumps(narration_patch()));monkeypatch.setattr(scripts,'generate_llm_completion',provider)
    result=await scripts.generate_validated_storyboard('Grounded curriculum',short_board())
    assert provider.await_count==1 and result==board()
    assert '352' in provider.call_args.kwargs['user_prompt']

@pytest.mark.asyncio
async def test_script_reuses_valid_candidate_without_provider_call(monkeypatch):
    provider=AsyncMock();monkeypatch.setattr(scripts,'generate_llm_completion',provider)
    assert await scripts.generate_validated_storyboard('Grounded curriculum',board())==board()
    provider.assert_not_awaited()

@pytest.mark.asyncio
async def test_script_repair_is_bounded_and_keeps_quality_validation(monkeypatch):
    provider=AsyncMock(side_effect=[json.dumps(short_board()),json.dumps(narration_patch(short_board()))]);monkeypatch.setattr(scripts,'generate_llm_completion',provider)
    with pytest.raises(ValueError,match='Substantial narration required'):
        await scripts.generate_validated_storyboard('Grounded curriculum')
    assert provider.await_count==2

@pytest.mark.asyncio
async def test_script_repairs_invalid_json_without_fabricating_output(monkeypatch):
    provider=AsyncMock(side_effect=['not JSON',json.dumps(board())]);monkeypatch.setattr(scripts,'generate_llm_completion',provider)
    assert await scripts.generate_validated_storyboard('Grounded curriculum')==board()
    assert provider.await_count==2

@pytest.mark.parametrize('failure',['missing','duplicate','foreign'])
def test_narration_repair_rejects_wrong_scene_identity(failure):
    patch=narration_patch()
    if failure=='missing':patch['narrations'].pop()
    if failure=='duplicate':patch['narrations'][1]['scene_id']=patch['narrations'][0]['scene_id']
    if failure=='foreign':patch['narrations'][0]['scene_id']='foreign-scene'
    with pytest.raises(ValueError):scripts.apply_narration_repair(short_board(),patch)

def test_narration_repair_preserves_curriculum_visuals_and_original_draft():
    draft=short_board();repaired=scripts.apply_narration_repair(draft,narration_patch())
    assert repaired['lesson_plan']==draft['lesson_plan']
    assert repaired['scenes'][0]['diagram']==draft['scenes'][0]['diagram']
    assert len(draft['scenes'][0]['narration'].split())==44
    validate_storyboard(repaired,require_visuals=True)

@pytest.mark.asyncio
@pytest.mark.parametrize('persist_detail',[True,False])
async def test_video_worker_retains_safe_service_failure_diagnostics(monkeypatch,persist_detail):
    from types import SimpleNamespace
    from app.workers import video_generation_consumer as worker
    from app.modules.module6_adaptive.models import VideoJobStatus
    job=SimpleNamespace(id=uuid.uuid4(),student_id=uuid.uuid4(),course_id=uuid.uuid4(),submission_id=uuid.uuid4(),weakness_flag_id=uuid.uuid4(),remediation_plan_id=uuid.uuid4(),status=VideoJobStatus.audio_ready,retry_count=0,error_message=None,error_code=None,scene_json={"scenes":board()["scenes"]},script_json={"lesson_plan":board()["lesson_plan"]})
    flag=SimpleNamespace(student_id=job.student_id,course_id=job.course_id,submission_id=job.submission_id,status=SimpleNamespace(value="active"))
    plan=SimpleNamespace(student_id=job.student_id,source_submission_id=job.submission_id,status=SimpleNamespace(value="active"))
    db=SimpleNamespace(get=AsyncMock(side_effect=lambda model,key: flag if model.__name__=="WeaknessFlag" else plan if model.__name__=="RemediationPlan" else job),rollback=AsyncMock(),commit=AsyncMock())
    async def fail_render(*args):
        if persist_detail:
            job.status=VideoJobStatus.failed
            job.error_message='Render failed: encoder error https://storage.example/video?secret=token Bearer sensitive-token sk-secretkey'
        raise RuntimeError('render failure')
    monkeypatch.setattr(worker,'render_video',fail_render)
    result=await worker._process_owned_job(job.id,db)
    assert result['reason']=='VIDEO_RENDER_FAILED' and job.retry_count==1
    if persist_detail:
        assert 'encoder error' in job.error_message
        assert 'secret=token' not in job.error_message and 'sensitive-token' not in job.error_message and 'sk-secretkey' not in job.error_message
    else:assert job.error_message=='render: RuntimeError'

@pytest.mark.asyncio
async def test_render_cancellation_keeps_output_directory_until_thread_finishes(monkeypatch,tmp_path):
    import asyncio,threading
    from app.modules.module6_adaptive.services import render_service
    started=threading.Event();release=threading.Event()
    def render(input_path,output_path,cancel_event=None):
        started.set()
        assert release.wait(5)
        from pathlib import Path
        Path(output_path).write_bytes(b"render finished")
        return None
    monkeypatch.setattr(render_service,'invoke_remotion_render',render)
    task=asyncio.create_task(render_service.await_render_completion(str(tmp_path/'input.json'),str(tmp_path/'video.mp4')))
    while not started.is_set():await asyncio.sleep(0.001)
    task.cancel()
    await asyncio.sleep(0.01)
    assert not task.done()
    release.set()
    with pytest.raises(asyncio.CancelledError):await task
    assert (tmp_path/'video.mp4').read_bytes()==b"render finished"

@pytest.mark.asyncio
@pytest.mark.parametrize('broker_mode',['transient','lost','expired'])
async def test_video_lease_transient_retry_and_confirmed_ownership_loss(monkeypatch,broker_mode):
    import asyncio
    from types import SimpleNamespace
    from unittest.mock import AsyncMock
    from redis.exceptions import TimeoutError
    from app.workers import video_generation_consumer as worker
    real_sleep=asyncio.sleep;real_loop=asyncio.get_running_loop()
    clock=[0];renewals=[0];finished=asyncio.Event();cancelled=[]
    async def fast_sleep(delay):
        clock[0]+=delay
        await real_sleep(0)
    async def eval_lease(script,*args):
        if "'del'" in script:return 1
        renewals[0]+=1
        if broker_mode=='expired' or renewals[0]==1:raise TimeoutError('temporary timeout')
        if broker_mode=='lost':return 0
        finished.set()
        return 1
    async def process(*args):
        try:
            await finished.wait()
            return {'status':'success'}
        except asyncio.CancelledError:
            cancelled.append(True)
            raise
    redis=SimpleNamespace(set=AsyncMock(return_value=True),eval=AsyncMock(side_effect=eval_lease))
    monkeypatch.setattr(worker,'get_redis_client',lambda:redis)
    monkeypatch.setattr(worker,'_process_owned_job',process)
    monkeypatch.setattr(worker.asyncio,'sleep',fast_sleep)
    monkeypatch.setattr(worker.asyncio,'get_running_loop',lambda:SimpleNamespace(time=lambda:clock[0]))
    if broker_mode=='transient':
        assert await worker.process_video_generation_job({'job_id':str(uuid.uuid4())},None)=={'status':'success'}
        assert renewals[0]>=2 and not cancelled
    else:
        with pytest.raises(RuntimeError,match='ownership unavailable'):
            await worker.process_video_generation_job({'job_id':str(uuid.uuid4())},None)
        assert cancelled
        if broker_mode=='expired':assert 80 <= clock[0] < 120
