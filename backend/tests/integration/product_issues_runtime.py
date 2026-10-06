
"""Scoped latest learning-flow probe. No schema resets, no historical recertification."""
import asyncio,json,os,sys,uuid,secrets,logging
from pathlib import Path
from dotenv import load_dotenv
ROOT=Path(__file__).resolve().parents[3]
BACKEND=ROOT/'backend'
sys.path.insert(0,str(BACKEND));load_dotenv(BACKEND/'.env')
from app.database import AsyncSessionLocal,engine
engine.echo=False
logging.disable(logging.CRITICAL)
from sqlalchemy import select
from app.modules.module1_auth.models import User,Role,UserRole,UserStatus
from app.shared.auth import hash_password
from app.shared.redis_client import get_redis_client,close_redis_pool
from app.config import get_settings
OUT=Path(__file__).parent;STATE=OUT/'product_issues_state.json'
LOCAL=Path(os.environ['TEMP'])/'elarion-latest-flow';LOCAL.mkdir(exist_ok=True)
def state(): return json.loads(STATE.read_text()) if STATE.exists() else {'tag':'latest-f849-'+uuid.uuid4().hex[:8]}
def save(data): STATE.write_text(json.dumps(data,indent=2))
async def fixtures():
 ids=state()
 if 'users' not in ids:
  credentials={};ids['users']={}
  async with AsyncSessionLocal() as db:
   for key,role,grade in [('admin','Admin',None),('student','Student',5),('other','Student',4)]:
    password='E2e!'+secrets.token_hex(18)+'9'
    user=User(email=ids['tag']+'-'+key+'@example.com',password_hash=hash_password(password),first_name='Latest E2E',last_name=key,status=UserStatus.active,email_verified=True,grade=grade)
    db.add(user);await db.flush()
    role_id=(await db.execute(select(Role.id).where(Role.name==role))).scalar_one()
    db.add(UserRole(user_id=user.id,role_id=role_id))
    ids['users'][key]=str(user.id);credentials[key]={'email':user.email,'password':password}
   await db.commit()
  (LOCAL/'accounts.json').write_text(json.dumps(credentials))
  save(ids)
 else:
  credentials=json.loads((LOCAL/'accounts.json').read_text())
  async with AsyncSessionLocal() as db:
   for key,uid in ids['users'].items():
    user=await db.get(User,uuid.UUID(uid))
    if user.email.endswith('@example.invalid'):
     user.email=user.email.replace('@example.invalid','@example.com')
     credentials[key]['email']=user.email
   await db.commit()
  (LOCAL/'accounts.json').write_text(json.dumps(credentials))
 print(json.dumps({'fixture_users':ids['users'],'passwords':'LOCAL_TEMP_ONLY'}),flush=True)
async def adaptive():
 from app.workers.adaptive_consumer import process_test_graded_event
 ids=state();redis=get_redis_client();settings=get_settings()
 messages=await redis.xrevrange(settings.REDIS_KEY_PREFIX+':events:test_graded',count=100)
 match=next(((mid,json.loads(data['data'])) for mid,data in messages if json.loads(data.get('data','{}')).get('submission_id')==ids['submission']),None)
 if not match: raise RuntimeError('Controlled graded event missing from real queue')
 mid,payload=match
 print(json.dumps({'real_graded_queue_event':True}),flush=True)
 async with AsyncSessionLocal() as db:
  result=await process_test_graded_event(payload,db)
 if result.get('status')!='success': raise RuntimeError('Adaptive worker failed')
 print(json.dumps({'adaptive_worker':result}),flush=True)
async def video():
 from app.workers.video_generation_consumer import process_video_generation_job
 from app.modules.module6_adaptive.models import VideoGenerationJob,VideoJobStatus
 ids=state();settings=get_settings()
 if settings.LLM_PROVIDER!='openai' or settings.TTS_PROVIDER!='openai_tts': raise RuntimeError('Real providers not configured')
 redis=get_redis_client();stream=settings.REDIS_KEY_PREFIX+':video_generation:jobs'
 messages=await redis.xrevrange(stream,count=100)
 match=next(((mid,json.loads(data['data'])) for mid,data in messages if json.loads(data.get('data','{}')).get('job_id')==ids['video_job']),None)
 if not match: raise RuntimeError('Controlled video queue message missing')
 mid,payload=match
 print(json.dumps({'real_video_queue_event':True,'providers':['openai','openai_tts']}),flush=True)
 async with AsyncSessionLocal() as db:
  job=await db.get(VideoGenerationJob,uuid.UUID(ids['video_job']))
  if job.status==VideoJobStatus.ready: print('READY_JOB_REUSED',flush=True);return
  if job.status not in (VideoJobStatus.queued,VideoJobStatus.failed): raise RuntimeError('Job already running')
  if job.status==VideoJobStatus.failed:
   if job.error_code=='VIDEO_SCRIPT_FAILED' and not job.audio_manifest_json and not job.video_object_key:
    proof=json.loads((OUT/'product_provider_safety.json').read_text())
    if proof['destination_host']!='api.openai.com' or not proof['controlled_course_matches'] or not proof['controlled_test_student'] or proof['audio_clips_generated']!=0 or proof['video_already_rendered']:
     raise RuntimeError('Provider/content proof missing')
    print('EXPLICIT_SAME_CONTROLLED_JOB_RETEST_AFTER_SCHEMA_FIX_NO_PREVIOUS_AUDIO_OR_VIDEO',flush=True)
   elif not job.scene_json or not job.audio_manifest_json or job.audio_manifest_json.get('is_mock'):
    raise RuntimeError('Cannot resume without safe cached assets')
  from app.modules.module6_adaptive.services import render_service
  import re
  invoke=render_service.invoke_remotion_render
  def diagnose(input_path,output_path):
   import shutil
   shutil.copyfile(input_path,LOCAL/'product-render-input.json')
   result=invoke(input_path,output_path)
   report={'success':result.success,'error':re.sub(r'https?://[^\s]+','[URL REDACTED]',result.error or '')}
   (OUT/'product_issues_render_diagnostics.json').write_text(json.dumps(report,indent=2))
   print(json.dumps({'render_diagnostic':report}),flush=True)
   return result
  render_service.invoke_remotion_render=diagnose
  result=await process_video_generation_job(payload,db)
  if result.get('status')!='success': raise RuntimeError('Real video worker failed')
  await db.refresh(job)
  audio=job.audio_manifest_json
  ids['video_duration_seconds']=audio.get('total_render_duration_seconds')
  save(ids)
  print(json.dumps({'video_ready':job.status==VideoJobStatus.ready,'real_audio':not audio.get('is_mock',True),'duration_seconds':ids['video_duration_seconds']}),flush=True)
async def main():
 try: await {'fixtures':fixtures,'adaptive':adaptive,'video':video}[sys.argv[1]]()
 finally: await close_redis_pool();await engine.dispose()
if __name__=='__main__':
 try: asyncio.run(main())
 except Exception as exc: print(json.dumps({'FAILED':type(exc).__name__}),flush=True);sys.exit(1)
