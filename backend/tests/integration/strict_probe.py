"""Read-only DB evidence for the course created and assessed through the browser."""
import asyncio,json,sys
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import text
ROOT=Path(__file__).resolve().parents[3];sys.path.insert(0,str(ROOT/'backend'));load_dotenv(ROOT/'backend/.env')
from app.database import engine,AsyncSessionLocal
engine.echo=False
async def main():
 state=Path(__file__).with_name('strict_runtime_state.json');ids=json.loads(state.read_text());out={}
 async with AsyncSessionLocal() as db:
  rows=(await db.execute(text('select t.id, (select count(*) from questions q where q.test_id=t.id) as question_count from tests t where t.course_id=:c'),{'c':ids['course']})).mappings().all();out['tests']=[dict(r) for r in rows]
  rows=(await db.execute(text('select s.id,s.status,s.test_id from submissions s join tests t on s.test_id=t.id where t.course_id=:c and s.student_id=:u order by s.submitted_at desc'),{'c':ids['course'],'u':ids['users']['student']})).mappings().all();out['submissions']=[dict(r) for r in rows]
  if rows:
   ids['submission']=str(rows[0]['id']);ids['assessment']=str(rows[0]['test_id'])
   out['skill_scores']=[dict(r) for r in (await db.execute(text('select score,max_score,grader_type from skill_scores where submission_id=:s'),{'s':ids['submission']})).mappings().all()]
   flags=(await db.execute(text('select id,status from weakness_flags where submission_id=:s'),{'s':ids['submission']})).mappings().all();out['weaknesses']=[dict(r) for r in flags]
   jobs=(await db.execute(text('select id,status,error_code,error_message,retry_count,scene_json,audio_manifest_json,video_object_key is not null as private_video from video_generation_jobs where submission_id=:s order by created_at desc'),{'s':ids['submission']})).mappings().all()
   out['job_count']=len(jobs);out['jobs']=[]
   for j in jobs:
    scenes=(j['scene_json'] or {}).get('scenes',[]);audio=(j['audio_manifest_json'] or {}).get('scenes',[])
    out['jobs'].append({'id':j['id'],'status':j['status'],'error_code':j['error_code'],'error_message':j['error_message'],'retry_count':j['retry_count'],'scene_count':len(scenes),'diagram_kinds':[s.get('diagram',{}).get('kind') for s in scenes],'audio_count':len(audio),'private_video':j['private_video']})
   if jobs:ids['video_job']=str(jobs[0]['id'])
   if flags:ids['weakness']=str(flags[0]['id'])
 state.write_text(json.dumps(ids,indent=2));Path(__file__).with_name('strict_pipeline_evidence.json').write_text(json.dumps(out,indent=2,default=str));print(json.dumps(out,default=str));await engine.dispose()
asyncio.run(main())
