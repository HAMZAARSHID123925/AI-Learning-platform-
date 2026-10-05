"""One real queued video through Desktop production code. No destructive fixtures."""
import os,sys,asyncio,json,uuid,tempfile,subprocess
from pathlib import Path
from dotenv import load_dotenv
BACKEND=Path(__file__).resolve().parents[2];sys.path.insert(0,str(BACKEND));load_dotenv(BACKEND/'.env')
os.environ['PYTHONDONTWRITEBYTECODE']='1'
from app.main import app
from app.database import AsyncSessionLocal,engine
engine.echo=False
from app.modules.module1_auth.models import User
from app.modules.module6_adaptive.models import VideoGenerationJob,VideoJobStatus
from app.shared.auth import create_access_token
from app.shared.redis_client import get_redis_client,close_redis_pool
from app.shared.s3_client import generate_presigned_url
from app.config import get_settings
from app.workers.video_generation_consumer import process_video_generation_job
import httpx
OUT=BACKEND/'tests/certification';STATE=OUT/'BATCH_STATE.json';checks=[]

def check(name,ok,**details):
 checks.append({'check':name,'pass':bool(ok),**details});print(json.dumps(checks[-1]),flush=True)
 if not ok:raise AssertionError(name)
async def main():
 if (OUT/'MODULE10_EVIDENCE.json').exists():
  checks.extend(x for x in json.loads((OUT/'MODULE10_EVIDENCE.json').read_text()) if x.get('pass'))
 if STATE.exists():ids=json.loads(STATE.read_text())
 else:
  ids=json.loads(Path(r'C:\Users\ali\.codex\worktrees\elarion-latest-backend-cert\AI-Learning-platform-git\backend\tests\certification\artifacts\state.json').read_text());STATE.write_text(json.dumps(ids,indent=2))
 headers={}
 async with AsyncSessionLocal() as db:
  for key in ('student','other','instructor','foreign_instructor','admin'):
   user=await db.get(User,uuid.UUID(ids['users'][key]));token,_=create_access_token(str(user.id),user.email,user.first_name,[],[]);headers[key]={'Authorization':'Bearer '+token}
 async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://desktop-certification',timeout=1200) as c:
  async def req(method,path,key='student',body=None):return await c.request(method,'/api/v1'+path,headers=headers[key] if key else {},json=body)
  spec=(await c.get('/openapi.json')).json();routes=[x for x in spec['paths'] if '/remediation/video-jobs' in x];check('actual OpenAPI has two video routes',len(routes)==2,active_endpoints=len(routes))
  for key in (None,'instructor','admin'):
   r=await req('POST','/remediation/video-jobs',key,{'weakness_flag_id':ids['flag']});check('video creation role '+str(key),r.status_code in (401,403),status=r.status_code)
  for key in (None,'other'):
   if key is None:
    r=await req('GET',f"/remediation/video-jobs/{uuid.uuid4()}",key);check('unauthenticated status denied',r.status_code in (401,403),status=r.status_code)
   else:
    r=await req('POST','/remediation/video-jobs',key,{'weakness_flag_id':ids['flag']});check('cross-student weakness cannot create job',r.status_code in (403,422),status=r.status_code)
  r=await req('POST','/remediation/video-jobs','student',{'weakness_flag_id':str(uuid.uuid4())});check('nonexistent weakness rejected',r.status_code==404,status=r.status_code)
  if 'video_job' not in ids:
   r=await req('POST','/remediation/video-jobs','student',{'weakness_flag_id':ids['flag']});check('one real job created',r.status_code==201,status=r.status_code)
   ids['video_job']=r.json()['id'];STATE.write_text(json.dumps(ids,indent=2));check('new job queued',r.json()['status']=='queued')
  jid=uuid.UUID(ids['video_job'])
  for key,expected in (('student',200),('other',403),('instructor',200),('foreign_instructor',403),('admin',200)):
   r=await req('GET',f'/remediation/video-jobs/{jid}',key);check('video status ownership '+key,r.status_code==expected,status=r.status_code)
  r=await req('POST','/remediation/video-jobs','student',{'weakness_flag_id':ids['flag']});check('duplicate create returns same job',r.status_code==201 and r.json()['id']==str(jid),status=r.status_code)
  async with AsyncSessionLocal() as db:
   job=await db.get(VideoGenerationJob,jid);check('real plan/course/student linkage',str(job.remediation_plan_id)==ids['plan'] and str(job.course_id)==ids['course'] and str(job.student_id)==ids['users']['student'])
   already_ready=job.status==VideoJobStatus.ready
  redis=get_redis_client();stream=f"{get_settings().REDIS_KEY_PREFIX}:video_generation:jobs"
  if not already_ready:
   messages=await redis.xrevrange(stream,count=10)
   found=next(((mid,data) for mid,data in messages if json.loads(data.get('data','{}')).get('job_id')==str(jid)),None);check('real queue message present',found is not None)
   mid,data=found;ms,seq=map(int,str(mid).split('-'));previous=f'{ms}-{seq-1}' if seq else f'{ms-1}-0';group='cert-module10-'+jid.hex
   try:await redis.xgroup_create(stream,group,id=previous)
   except Exception as exc:
    if 'BUSYGROUP' not in str(exc):raise
   entries=await redis.xreadgroup(group,'controlled-worker',{stream:'>'},count=1,block=1000)
   if entries:consumed_mid,consumed_data=entries[0][1][0]
   else:consumed_mid,consumed_data=mid,data
   payload=json.loads(consumed_data['data']);check('scoped worker consumes intended queue message',payload.get('job_id')==str(jid))
   async with AsyncSessionLocal() as db:result=await process_video_generation_job(payload,db)
   check('real worker completes pipeline',result['status']=='success',worker_status=result['status'])
   await redis.xack(stream,group,consumed_mid)
  async with AsyncSessionLocal() as db:
   job=await db.get(VideoGenerationJob,jid);check('final DB state ready',job.status==VideoJobStatus.ready and bool(job.video_object_key) and job.completed_at is not None)
   check('real storyboard and TTS persisted',bool(job.script_json) and bool(job.scene_json['scenes']) and not job.audio_manifest_json['is_mock'] and all(x['tts_provider']=='openai_tts' for x in job.audio_manifest_json['scenes']),scenes=len(job.scene_json['scenes']))
   url=await generate_presigned_url(job.video_object_key,expires_in=120);unsigned=job.video_url
   result=await process_video_generation_job({'job_id':str(jid)},db);check('duplicate delivery skips paid pipeline',result['status']=='skipped')
  r=await req('GET',f'/remediation/video-jobs/{jid}');check('owner receives signed ready playback',r.status_code==200 and r.json()['status']=='ready' and 'X-Amz-Signature=' in r.json()['video_url'])
  r=await req('POST','/remediation/video-jobs','student',{'weakness_flag_id':ids['flag']});check('ready job is reused without new paid generation',r.status_code==201 and r.json()['id']==str(jid))
 async with httpx.AsyncClient(timeout=180) as external:
  r=await external.get(unsigned);check('unsigned private object retrieval denied',r.status_code in (400,401,403),status=r.status_code)
  r=await external.get(url);check('signed private MP4 retrieval succeeds',r.status_code==200 and len(r.content)>0,status=r.status_code,bytes=len(r.content))
  with tempfile.TemporaryDirectory(prefix='elarion-video-cert-') as td:
   video=Path(td)/'certified.mp4';video.write_bytes(r.content)
   probe=subprocess.run(['ffprobe','-v','quiet','-print_format','json','-show_format','-show_streams',str(video)],capture_output=True,text=True,timeout=30);info=json.loads(probe.stdout)
   streams=info['streams'];duration=float(info['format']['duration']);check('real MP4 has video/audio and valid duration',probe.returncode==0 and duration>0 and any(x['codec_type']=='video' for x in streams) and any(x['codec_type']=='audio' for x in streams),duration_seconds=duration)
 await close_redis_pool();await engine.dispose();check('Module10 closed',True)
async def playback_only():
 checks.extend(x for x in json.loads((OUT/'MODULE10_EVIDENCE.json').read_text()) if x.get('pass'))
 ids=json.loads(STATE.read_text());jid=uuid.UUID(ids['video_job'])
 from sqlalchemy import text
 async with AsyncSessionLocal() as db:
  job=await db.get(VideoGenerationJob,jid)
  check('resumed video remains ready',job.status==VideoJobStatus.ready)
  url=await generate_presigned_url(job.video_object_key,expires_in=180);unsigned=job.video_url;expected=job.audio_manifest_json['total_render_duration_seconds']
  count=(await db.execute(text('SELECT count(*) FROM video_generation_jobs WHERE weakness_flag_id=:id'),{'id':uuid.UUID(ids['flag'])})).scalar_one();check('exactly one controlled real video job',count==1,count=count)
  revision=(await db.execute(text('SELECT version_num FROM alembic_version'))).scalar_one();check('Module10 Alembic at head',revision=='017_video_job_live_uniqueness')
 async with httpx.AsyncClient(timeout=180) as c:
  r=await c.get(unsigned);check('unsigned private object retrieval denied',r.status_code in (400,401,403),status=r.status_code)
  r=await c.get(url);check('signed private MP4 retrieval succeeds',r.status_code==200 and len(r.content)>0,status=r.status_code,bytes=len(r.content))
  with tempfile.TemporaryDirectory(prefix='elarion-video-cert-') as td:
   video=Path(td)/'certified.mp4';video.write_bytes(r.content)
   probe=subprocess.run(['ffprobe','-v','quiet','-print_format','json','-show_format','-show_streams',str(video)],capture_output=True,text=True,timeout=30);info=json.loads(probe.stdout);streams=info['streams'];duration=float(info['format']['duration'])
   check('real MP4 has video/audio and expected duration',probe.returncode==0 and abs(duration-expected)<1 and any(x['codec_type']=='video' for x in streams) and any(x['codec_type']=='audio' for x in streams),duration_seconds=duration)
 redis=get_redis_client();stream=f"{get_settings().REDIS_KEY_PREFIX}:video_generation:jobs";group='cert-module10-'+jid.hex
 for mid,data in await redis.xrevrange(stream,count=10):
  if json.loads(data.get('data','{}')).get('job_id')==str(jid):await redis.xack(stream,group,mid)
 check('Module10 closed',True)

async def run():
 try:await playback_only() if len(sys.argv)>1 and sys.argv[1]=='playback-only' else await main()
 finally:await close_redis_pool();await engine.dispose()
if __name__=='__main__':
 try:asyncio.run(run())
 except Exception as exc:print(json.dumps({'stopped':type(exc).__name__}),flush=True);sys.exit(1)
 finally:(OUT/'MODULE10_EVIDENCE.json').write_text(json.dumps(checks,indent=2))
