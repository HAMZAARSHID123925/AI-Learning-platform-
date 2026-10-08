"""Failure injection at paid-stage boundaries, without external services."""
import asyncio, json, uuid, threading
from copy import deepcopy
from types import SimpleNamespace as NS
from unittest.mock import AsyncMock, Mock
import pytest
from tests.integration.test_product_contract import board
from app.modules.module6_adaptive.models import VideoJobStatus, VideoGenerationJob, WeaknessFlag, RemediationPlan
from app.modules.module6_adaptive.services import script_generation_service as scripts, render_service as renders, audio_generation_service as audio
from app.modules.module6_adaptive.services.storyboard_schema import validation_errors, apply_field_repair
from app.modules.module6_adaptive.services.pipeline_errors import VideoPipelineError
from app.workers import video_generation_consumer as worker


def job_fixture(status=VideoJobStatus.audio_ready):
    value=board()
    j=NS(id=uuid.uuid4(),student_id=uuid.uuid4(),course_id=uuid.uuid4(),submission_id=uuid.uuid4(),weakness_flag_id=uuid.uuid4(),remediation_plan_id=uuid.uuid4(),status=status,retry_count=0,error_code=None,error_message=None,started_at=None,title='Fractions',target_duration_seconds=180,script_json={'lesson_plan':value['lesson_plan']},scene_json={'scenes':value['scenes']},asset_manifest_json=None,render_manifest_json=None,render_checkpoint_bytes=None)
    j.audio_manifest_json={'is_mock':False,'scenes':[dict(scene_id=str(i),scene_index=i+1,audio_key='private/'+str(i),audio_url='',format='mp3',duration_seconds=20.,planned_duration_seconds=25.,render_duration_seconds=20.8,text_hash='hash',tts_provider='openai_tts',tts_voice_id='alloy',is_mock=False,status='ready',error=None) for i in range(8)]}
    flag=NS(student_id=j.student_id,submission_id=j.submission_id,course_id=j.course_id,status=NS(value='active'))
    plan=NS(student_id=j.student_id,source_submission_id=j.submission_id,status=NS(value='active'))
    async def get(model,key): return flag if model is WeaknessFlag else plan if model is RemediationPlan else j
    db=NS(get=AsyncMock(side_effect=get),commit=AsyncMock(),rollback=AsyncMock(),execute=AsyncMock(side_effect=lambda q:NS(scalar_one_or_none=lambda:j.render_checkpoint_bytes)))
    return j,db

@pytest.mark.asyncio
async def test_two_precise_diagram_errors_targeted_repair_preserves_every_other_field(monkeypatch):
    bad=board(); bad['scenes'][1]['diagram']={'kind':'number_line','labels':['a','b','c','d','e'],'values':[.1,.3,.5,.7,.9],'denominators':[]}
    bad['scenes'][6]['diagram']={'kind':'equation_steps','labels':['Mean','Deviation','Square','Average','Root'],'values':[],'denominators':[]}
    errors=validation_errors(bad)
    assert {tuple(e['path']) for e in errors}=={('scenes',1,'diagram'),('scenes',6,'diagram')}
    patch={'repairs':[{'scene_id':bad['scenes'][i]['scene_id'],'field':'diagram','value':board()['scenes'][i]['diagram']} for i in [1,6]]}
    provider=AsyncMock(return_value=json.dumps(patch));monkeypatch.setattr(scripts,'generate_llm_completion',provider)
    result=await scripts.generate_validated_storyboard('Actual curriculum',bad)
    assert result==board();assert bad['scenes'][1]['diagram']['kind']=='number_line'
    assert provider.await_count==1 and provider.call_args.kwargs['max_retries']==1 and provider.call_args.kwargs['sdk_max_retries']==0

@pytest.mark.asyncio
async def test_malformed_provider_output_is_bounded(monkeypatch):
    provider=AsyncMock(return_value='{bad json');monkeypatch.setattr(scripts,'generate_llm_completion',provider)
    with pytest.raises(ValueError): await scripts.generate_validated_storyboard('Curriculum')
    assert provider.await_count==2

@pytest.mark.asyncio
async def test_script_transient_request_recovers_within_two_calls(monkeypatch):
    provider=AsyncMock(side_effect=[TimeoutError(),json.dumps(board())]);monkeypatch.setattr(scripts,'generate_llm_completion',provider)
    assert await scripts.generate_validated_storyboard('Curriculum')==board()
    assert provider.await_count==2

@pytest.mark.asyncio
async def test_permanent_provider_failure_does_not_retry(monkeypatch):
    provider=AsyncMock(side_effect=ValueError('credentials invalid'));monkeypatch.setattr(scripts,'generate_llm_completion',provider)
    with pytest.raises(VideoPipelineError,match='ValueError'):await scripts.generate_validated_storyboard('Curriculum')
    assert provider.await_count==1

@pytest.mark.parametrize('mutation',['unknown','fraction','duration','foreign_patch'])
def test_content_guard_and_unrequested_repair_rejected(mutation):
    value=board()
    if mutation=='unknown':value['scenes'][0]['url']='https://arbitrary.example'
    elif mutation=='fraction':value['scenes'][0]['diagram']['labels'][0]='3/4'
    elif mutation=='duration':value['scenes'][0]['duration_seconds']=float('nan')
    else:
        with pytest.raises(ValueError):apply_field_repair(value,{'repairs':[{'scene_id':'0','field':'narration','value':'Changed'}]},{('0','diagram')})
        return
    assert validation_errors(value)

@pytest.mark.asyncio
async def test_upload_failure_then_retry_reuses_durable_mp4_without_render(monkeypatch):
    j,db=job_fixture()
    async def render(input_path,output_path):
        from pathlib import Path
        Path(output_path).write_bytes(b'validated mp4')
        return NS(success=True)
    renderer=AsyncMock(side_effect=render)
    uploader=AsyncMock(side_effect=[ValueError('Injected permanent upload failure'),('private-final','')])
    monkeypatch.setattr(renders,'await_render_completion',renderer);monkeypatch.setattr(renders,'upload_verified_bytes',uploader)
    monkeypatch.setattr(renders,'object_exists',AsyncMock(return_value=True))
    import app.shared.s3_client as storage
    monkeypatch.setattr(storage,'generate_presigned_url',AsyncMock(return_value='https://private.example/audio'))
    monkeypatch.setattr(renders,'validate_mp4_with_ffprobe',lambda *a:NS(valid=True,file_size_bytes=13,duration_seconds=166.4))
    with pytest.raises(VideoPipelineError) as failure: await renders.render_video(j.id,db)
    assert failure.value.code=='VIDEO_UPLOAD_FAILED' and j.render_checkpoint_bytes==b'validated mp4'
    j.status=VideoJobStatus.audio_ready
    await renders.render_video(j.id,db)
    assert renderer.await_count==1 and uploader.await_count==2
    assert j.status==VideoJobStatus.ready and j.render_checkpoint_bytes is None and j.video_object_key=='private-final'

@pytest.mark.asyncio
async def test_worker_render_failure_and_restart_preserve_valid_script_audio(monkeypatch):
    j,db=job_fixture()
    paid_script=AsyncMock(side_effect=AssertionError('No script regeneration'))
    tts=AsyncMock(side_effect=AssertionError('No TTS regeneration'))
    async def render(job_id,session):
        if renderer.await_count==1:raise VideoPipelineError('VIDEO_RENDER_FAILED','Controlled renderer failure')
        j.status=VideoJobStatus.ready
    renderer=AsyncMock(side_effect=render)
    from app.shared.tts_client import _text_hash,sanitize_narration
    for clip in j.audio_manifest_json['scenes']:clip['text_hash']=_text_hash(sanitize_narration(j.scene_json['scenes'][0]['narration']))
    monkeypatch.setattr(audio,'get_settings',lambda:NS(TTS_AUDIO_OBJECT_PREFIX='personalized-video',TTS_MOCK_MODE=False,TTS_PROVIDER='openai_tts',OPENAI_TTS_VOICE='alloy',TTS_SCENE_PADDING_SECONDS=.8))
    monkeypatch.setattr(audio,'object_exists',AsyncMock(return_value=True));monkeypatch.setattr(audio,'synthesize_narration',tts)
    monkeypatch.setattr(worker,'generate_personalized_script_and_scenes',paid_script);monkeypatch.setattr(worker,'generate_scene_audio',audio.generate_scene_audio);monkeypatch.setattr(worker,'render_video',renderer)
    assert (await worker._process_owned_job(j.id,db))['reason']=='VIDEO_RENDER_FAILED'
    j.status=VideoJobStatus.rendering  # worker restart at persisted stage
    assert await worker._process_owned_job(j.id,db)=={'status':'success'}
    assert renderer.await_count==2
    paid_script.assert_not_awaited();tts.assert_not_awaited()
    # Audio checkpoint is checked on resumed path, without calling the provider.
    # The real audio service is responsible for clip reuse.

@pytest.mark.asyncio
@pytest.mark.parametrize('status',[VideoJobStatus.failed,VideoJobStatus.ready])
async def test_terminal_duplicate_delivery_makes_no_paid_calls(monkeypatch,status):
    j,db=job_fixture(status)
    paid=AsyncMock(side_effect=AssertionError('Terminal duplicate must not generate'))
    monkeypatch.setattr(worker,'generate_personalized_script_and_scenes',paid);monkeypatch.setattr(worker,'generate_scene_audio',paid);monkeypatch.setattr(worker,'render_video',paid)
    assert (await worker._process_owned_job(j.id,db))['status']=='skipped'
    paid.assert_not_awaited()

@pytest.mark.asyncio
async def test_concurrent_queue_delivery_has_only_one_expensive_owner(monkeypatch):
    started=asyncio.Event();release=asyncio.Event();owned=False
    async def claim(*a,**kw):
        nonlocal owned
        if owned:return False
        owned=True;return True
    broker=NS(set=AsyncMock(side_effect=claim),eval=AsyncMock(return_value=1))
    async def process(*a):started.set();await release.wait();return {'status':'success'}
    paid=AsyncMock(side_effect=process)
    monkeypatch.setattr(worker,'get_redis_client',lambda:broker);monkeypatch.setattr(worker,'_process_owned_job',paid)
    event={'job_id':str(uuid.uuid4())}
    first=asyncio.create_task(worker.process_video_generation_job(event,None));await started.wait()
    assert await worker.process_video_generation_job(event,None)=={'status':'busy'}
    release.set();assert await first=={'status':'success'};assert paid.await_count==1

@pytest.mark.asyncio
async def test_tts_transient_retry_has_one_owner_and_measured_audio(monkeypatch):
    from app.shared import tts_client
    settings=NS(TTS_MOCK_MODE=False,is_production=False,TTS_PROVIDER='openai_tts',OPENAI_TTS_VOICE='alloy')
    monkeypatch.setattr(tts_client,'get_settings',lambda:settings)
    provider=AsyncMock(side_effect=[TimeoutError(),b'mp3'])
    monkeypatch.setattr(tts_client,'_synthesize_openai',provider);monkeypatch.setattr(tts_client,'measure_mp3_duration',lambda _:20.)
    result=await tts_client.synthesize_narration('A sufficiently long test narration for the synthesis provider.')
    assert result.duration_seconds==20. and provider.await_count==2

@pytest.mark.asyncio
async def test_audio_upload_retry_reuses_paid_clip_and_preserves_future_clips(monkeypatch):
    j,db=job_fixture(VideoJobStatus.storyboard_ready)
    settings=NS(TTS_AUDIO_OBJECT_PREFIX='personalized-video',TTS_MOCK_MODE=False,TTS_PROVIDER='openai_tts',OPENAI_TTS_VOICE='alloy',TTS_SCENE_PADDING_SECONDS=.8)
    monkeypatch.setattr(audio,'get_settings',lambda:settings)
    from app.shared.tts_client import _text_hash,sanitize_narration,TTSSynthesisResult
    h=_text_hash(sanitize_narration(j.scene_json['scenes'][0]['narration']))
    for clip in j.audio_manifest_json['scenes']:clip['text_hash']=h
    j.audio_manifest_json['scenes'][0]['status']='failed'
    paid=AsyncMock(return_value=TTSSynthesisResult(provider='openai_tts',voice_id='alloy',audio_bytes=b'mp3',format='mp3',duration_seconds=20.,text_hash=h,is_mock=False))
    monkeypatch.setattr(audio,'synthesize_narration',paid);monkeypatch.setattr(audio,'object_exists',AsyncMock(return_value=True))
    upload=AsyncMock(side_effect=ValueError('Injected upload failure'));monkeypatch.setattr(audio,'upload_verified_bytes',upload)
    with pytest.raises(VideoPipelineError):await audio.generate_scene_audio(j.id,db)
    assert j.audio_manifest_json.get('pending_audio_upload') and len(j.audio_manifest_json['scenes'])==8
    upload.side_effect=None;upload.return_value=('private-new','')
    await audio.generate_scene_audio(j.id,db)
    assert paid.await_count==1 and upload.await_count==2 and j.status==VideoJobStatus.audio_ready
    assert [c['audio_key'] for c in j.audio_manifest_json['scenes'][1:]]==['private/'+str(i) for i in range(1,8)]

def test_ready_is_terminal_even_for_failure_transition():
    j=VideoGenerationJob(status=VideoJobStatus.ready)
    with pytest.raises(ValueError):j.status=VideoJobStatus.failed



@pytest.mark.asyncio
async def test_invalid_diagram_does_not_hide_aggregate_narration_error(monkeypatch):
    value=board()
    for scene in value['scenes']:scene['narration']=' '.join(['grounded']*44)
    value['scenes'][2]['diagram']={'kind':'number_line','labels':['a','b','c','d','e'],'values':[.1,.3,.5,.7,.9],'denominators':[]}
    errors=validation_errors(value)
    assert any(e['path']==['scenes',2,'diagram'] for e in errors)
    assert any('Substantial narration required' in e['message'] for e in errors)
    repairs=[{'scene_id':s['scene_id'],'field':'narration','value':board()['scenes'][i]['narration']} for i,s in enumerate(value['scenes'])]
    repairs.append({'scene_id':'2','field':'diagram','value':board()['scenes'][2]['diagram']})
    provider=AsyncMock(return_value=json.dumps({'repairs':repairs}));monkeypatch.setattr(scripts,'generate_llm_completion',provider)
    assert await scripts.generate_validated_storyboard('Actual curriculum',value)==board()
    assert provider.await_count==1


@pytest.mark.asyncio
async def test_cancelled_render_stops_owned_process_before_releasing_files(monkeypatch,tmp_path):
    monkeypatch.setattr(renders,"renderer_command",lambda:["node","tsx","render.ts"])
    from pathlib import Path
    input_path=tmp_path/'input.json';input_path.write_text(json.dumps({'audio_manifest':{'scenes':[{'render_duration_seconds':180}]}}))
    started=threading.Event();stopped=threading.Event()
    proc=Mock(pid=987654,returncode=1);proc.poll.return_value=None
    def communicate(**kwargs):
        started.set()
        assert stopped.wait(3), 'owned renderer must stop promptly on cancellation'
        return '', 'cancelled'
    proc.communicate.side_effect=communicate
    def kill(cmd,**kwargs):
        assert cmd==['taskkill','/PID','987654','/T','/F']
        stopped.set()
    monkeypatch.setattr(renders.subprocess,'Popen',Mock(return_value=proc))
    if renders.os.name=='nt':monkeypatch.setattr(renders.subprocess,'run',Mock(side_effect=kill))
    else:monkeypatch.setattr(renders.os,'killpg',lambda pid,sig:stopped.set())
    task=asyncio.create_task(renders.await_render_completion(str(input_path),str(tmp_path/'video.mp4')))
    for _ in range(1000):
        if started.is_set():break
        await asyncio.sleep(.001)
    assert started.is_set()
    task.cancel()
    with pytest.raises(asyncio.CancelledError):await asyncio.wait_for(task,4)
    assert stopped.is_set()

@pytest.mark.asyncio
async def test_private_upload_ambiguous_success_is_confirmed_without_reupload(monkeypatch):
    import hashlib
    from contextlib import asynccontextmanager
    from app.shared import s3_client as storage
    data=b'validated artifact'
    head={'ContentLength':len(data),'ContentType':'video/mp4','Metadata':{'sha256':hashlib.sha256(data).hexdigest()}}
    client=NS(head_object=AsyncMock(return_value=head),put_object=AsyncMock())
    @asynccontextmanager
    async def connect():yield client
    monkeypatch.setattr(storage,'_get_s3_client',connect)
    assert await storage.upload_verified_bytes(data,'personalized-video/job/final/video.mp4','video/mp4')==('personalized-video/job/final/video.mp4','')
    client.put_object.assert_not_awaited()

@pytest.mark.asyncio
async def test_private_upload_head_mismatch_never_claims_ready(monkeypatch):
    from contextlib import asynccontextmanager
    from app.shared import s3_client as storage
    client=NS(head_object=AsyncMock(return_value={'ContentLength':0}),put_object=AsyncMock())
    @asynccontextmanager
    async def connect():yield client
    monkeypatch.setattr(storage,'_get_s3_client',connect)
    with pytest.raises(RuntimeError,match='confirmation mismatch'):await storage.upload_verified_bytes(b'artifact','personalized-video/job/final/video.mp4','video/mp4')
    assert 'ACL' not in client.put_object.call_args.kwargs


@pytest.mark.parametrize('equality',['1/2 = 2/3','1/0 = 2/4'])
def test_incorrect_fraction_equality_rejected_before_tts(equality):
    value=board();value['scenes'][0]['diagram']={'kind':'equation_steps','labels':[equality,'Compare equal quantities'],'values':[],'denominators':[]}
    assert any('mathematically incorrect' in e['message'] for e in validation_errors(value))


def test_trivial_integer_json_format_normalizes_without_changing_math():
    from app.modules.module6_adaptive.services.storyboard_schema import normalize_storyboard
    value=board();value['scenes'][0]['diagram']['values']=[1.0,2.0];value['scenes'][0]['diagram']['denominators']=[2.0,4.0]
    assert normalize_storyboard(value)==board()

@pytest.mark.asyncio
async def test_malformed_repair_identifier_gets_bounded_retry(monkeypatch):
    value=board();value['scenes'][0]['heading']='x'*66
    bad={'repairs':[{'scene_id':[],'field':'heading','value':'Equal parts'}]}
    good={'repairs':[{'scene_id':'0','field':'heading','value':'Equal parts'}]}
    provider=AsyncMock(side_effect=[json.dumps(bad),json.dumps(good)]);monkeypatch.setattr(scripts,'generate_llm_completion',provider)
    assert await scripts.generate_validated_storyboard('Grounded curriculum',value)==board()
    assert provider.await_count==2


@pytest.mark.asyncio
@pytest.mark.parametrize('status',[VideoJobStatus.rendering,VideoJobStatus.ready,VideoJobStatus.failed])
async def test_repeated_create_reuses_same_saved_job_without_provider_or_queue(monkeypatch,status):
    from app.modules.module6_adaptive.services import video_job_service as jobs
    from app.modules.module6_adaptive.models import WeaknessStatus
    j,_=job_fixture(status)
    flag=NS(id=j.weakness_flag_id,student_id=j.student_id,submission_id=j.submission_id,status=WeaknessStatus.active)
    async def query(statement):
        entity=statement.column_descriptions[0]['entity']
        if entity is WeaknessFlag:value=flag
        else:
            filter_status=statement.compile().params.get('status_1')
            value=j if (isinstance(filter_status,list) and j.status in filter_status) or filter_status==j.status else None
        return NS(scalar_one_or_none=lambda:value)
    db=NS(execute=AsyncMock(side_effect=query),add=Mock(),commit=AsyncMock())
    paid=AsyncMock(side_effect=AssertionError('No provider work for repeated saved request'))
    monkeypatch.setattr(jobs,'build_video_generation_context',paid);monkeypatch.setattr(jobs,'enqueue_video_job',paid)
    for _ in range(3):assert await jobs.create_video_generation_job(db,j.student_id,j.weakness_flag_id,j.submission_id) is j
    paid.assert_not_awaited();db.add.assert_not_called()


def test_render_checkpoint_identity_includes_voice():
    j,_=job_fixture();before=renders.render_fingerprint(j)
    j.audio_manifest_json['scenes'][0]['tts_voice_id']='another-voice'
    assert renders.render_fingerprint(j)!=before


@pytest.mark.asyncio
async def test_durable_dispatch_recovers_orphaned_active_job_but_preserves_live_owner(monkeypatch):
    from app.modules.module6_adaptive.services import video_job_service as jobs
    queued,_=job_fixture(VideoJobStatus.queued);live,_=job_fixture(VideoJobStatus.rendering);orphan,_=job_fixture(VideoJobStatus.audio_ready)
    db=NS(execute=AsyncMock(return_value=NS(scalars=lambda:NS(all=lambda:[queued,live,orphan]))))
    redis=NS(get=AsyncMock(side_effect=['healthy-owner',None]))
    enqueue=AsyncMock();monkeypatch.setattr(jobs,'get_redis_client',lambda:redis);monkeypatch.setattr(jobs,'enqueue_video_job',enqueue)
    await jobs.dispatch_pending_video_jobs(db)
    assert [c.args[1].id for c in enqueue.await_args_list]==[queued.id,orphan.id]
    assert orphan.status==VideoJobStatus.audio_ready and live.status==VideoJobStatus.rendering

@pytest.mark.asyncio
async def test_missing_durable_narration_never_invokes_renderer(monkeypatch):
    j,db=job_fixture()
    renderer=AsyncMock(side_effect=AssertionError("Cannot render missing narration"))
    monkeypatch.setattr(renders,"object_exists",AsyncMock(return_value=False))
    monkeypatch.setattr(renders,"await_render_completion",renderer)
    with pytest.raises(VideoPipelineError,match="narration object is missing"):
        await renders.render_video(j.id,db)
    renderer.assert_not_awaited()
    assert j.status==VideoJobStatus.failed and j.asset_manifest_json
