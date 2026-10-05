"""Real focused-retake failure, mastery and escalation branches; no new videos."""
import certify_module10 as runtime
import asyncio,json,uuid,sys
from datetime import datetime,timezone
import httpx
from sqlalchemy import select,func
from app.database import AsyncSessionLocal,engine
from app.modules.module1_auth.models import User,Role,UserRole,UserStatus
from app.modules.module4_experience.models import Enrollment,LearningPathState,PathState
from app.modules.module5_assessment.models import Question,Submission,SkillScore,TestGradedOutbox
from app.modules.module6_adaptive.models import WeaknessFlag,RemediationPlan,PlanStatus,WeaknessStatus
from app.shared.auth import create_access_token,hash_password
from app.shared.redis_client import get_redis_client,close_redis_pool
from app.shared.events import publish_graded_outbox
from app.workers.adaptive_consumer import process_test_graded_event
from app.config import get_settings
OUT=runtime.OUT;STATE=runtime.STATE;checks=[];HEADERS={}
def save(ids):STATE.write_text(json.dumps(ids,indent=2))
def check(name,ok,**details):
 checks.append({'check':name,'pass':bool(ok),**details});print(json.dumps(checks[-1]),flush=True)
 if not ok:raise AssertionError(name)
async def req(c,ids,method,path,key='student',body=None):
 if key and key not in HEADERS:
  async with AsyncSessionLocal() as db:
   u=await db.get(User,uuid.UUID(ids['users'][key]));token,_=create_access_token(str(u.id),u.email,u.first_name,[],[]);HEADERS[key]={'Authorization':'Bearer '+token}
 return await c.request(method,'/api/v1'+path,headers=HEADERS.get(key,{}) if key else {},json=body)
async def answers(c,ids,tid,key,correct):
 r=await req(c,ids,'GET','/assessments/tests/'+tid,key);check('owned focused/assessment delivery '+key,r.status_code==200 and 'is_correct' not in r.text and 'rubric' not in r.text,status=r.status_code)
 public={q['id']:{o['text']:o['id'] for o in q['options']} for q in r.json()['questions']}
 async with AsyncSessionLocal() as db:rows=(await db.execute(select(Question).where(Question.test_id==uuid.UUID(tid)))).scalars().all()
 return [{'question_id':str(q.id),'selected_option_id':public[str(q.id)][next(o['text'] for o in q.options if o['is_correct']==correct)]} for q in rows]
async def event(sid):
 redis=get_redis_client();prefix=get_settings().REDIS_KEY_PREFIX;stream=prefix+':events:test_graded'
 async with AsyncSessionLocal() as db:
  row=await db.get(TestGradedOutbox,uuid.UUID(sid))
  if row and row.published_at is None:await publish_graded_outbox(db,uuid.UUID(sid))
 mid=await redis.get(prefix+':events:test_graded:published:'+sid)
 entries=await redis.xrange(stream,min=mid,max=mid,count=1) if mid else await redis.xrevrange(stream,count=20)
 payload=next((json.loads(data['data']) for _,data in entries if json.loads(data['data']).get('submission_id')==sid),None)
 check('real grading event located',payload is not None)
 async with AsyncSessionLocal() as db:result=await process_test_graded_event(payload,db)
 check('actual adaptive event processed',result['status']=='success')
 return payload
async def submit(c,ids,tid,key,correct,count):
 body={'answers':await answers(c,ids,tid,key,correct)}
 r=await req(c,ids,'POST','/assessments/'+tid+'/submit',key,body);check('real deterministic retest submission '+key,r.status_code==200 and r.json()['total_count']==count and r.json()['overall_score']==(1 if correct else 0),status=r.status_code)
 sid=r.json()['id'];r2=await req(c,ids,'POST','/assessments/'+tid+'/submit',key,body)
 if count==4:check('focused duplicate submission returns identical result',r2.status_code==200 and r2.json()['id']==sid,status=r2.status_code)
 return sid,body
async def main():
 gate=json.loads((OUT/'MODULE10_EVIDENCE.json').read_text());check('Module10 passed before Module11',any(x['check']=='Module10 closed' and x['pass'] for x in gate))
 ids=json.loads(STATE.read_text());rounds=ids.setdefault('module11_rounds',[{'test':ids['focused_retest'],'submission':ids['module11_primary_submission']}])
 async with httpx.AsyncClient(transport=httpx.ASGITransport(app=runtime.app),base_url='http://desktop-certification',timeout=300) as c:
  for number in range(ids.get('module11_processed_rounds',0)+1,4):
   if len(rounds)<number:
    r=await req(c,ids,'POST','/remediation-plans/'+ids['plan']+'/complete-study');check('real next focused handoff',r.status_code==200 and bool(r.json()['retest_id']) and r.json()['plan']['retest_attempt_count']==number,status=r.status_code)
    rounds.append({'test':r.json()['retest_id']});save(ids)
   current=rounds[number-1];sid,body=await submit(c,ids,current['test'],'student',False,4);current['submission']=sid;current['body']=body;save(ids)
   if number==1:
    changed={'answers':await answers(c,ids,current['test'],'student',True)};r=await req(c,ids,'POST','/assessments/'+current['test']+'/submit','student',changed);check('changing answers after focused submission denied',r.status_code==409,status=r.status_code)
   await event(sid)
   async with AsyncSessionLocal() as db:
    p=await db.get(RemediationPlan,uuid.UUID(ids['plan']));f=await db.get(WeaknessFlag,uuid.UUID(ids['flag']));check('failing focused attempt preserves active weakness and plan',f.status==WeaknessStatus.active and p.status==PlanStatus.active and p.retest_attempt_count==number and not p.study_completed,attempt_count=p.retest_attempt_count)
   ids['module11_processed_rounds']=number;save(ids)
  r=await req(c,ids,'POST','/remediation-plans/'+ids['plan']+'/complete-study');check('three failed retests escalate without a fourth generation',r.status_code==200 and r.json()['retest_id'] is None and r.json()['plan']['instructor_escalated'] and r.json()['plan']['status']=='escalated' and r.json()['plan']['retest_attempt_count']==3,status=r.status_code)
  await event(rounds[-1]['submission'])
  r=await req(c,ids,'POST','/remediation-plans/'+ids['plan']+'/complete-study');check('escalation completion replay is idempotent',r.status_code==200 and r.json()['retest_id'] is None and r.json()['plan']['retest_attempt_count']==3)
  async with AsyncSessionLocal() as db:
   p=await db.get(RemediationPlan,uuid.UUID(ids['plan']));count=(await db.execute(select(func.count(RemediationPlan.id)).where(RemediationPlan.weakness_flag_id==uuid.UUID(ids['flag'])))).scalar_one();check('failure event replay does not create another remediation',count==1 and p.status==PlanStatus.escalated,plans=count)
   if 'module11_pass' not in ids['users']:
    role=(await db.execute(select(Role).where(Role.name=='Student'))).scalar_one();u=User(email=f"cert-{ids['tag']}-module11-pass@example.invalid",password_hash=hash_password(uuid.uuid4().hex),first_name='Certification',last_name='Passing retest',status=UserStatus.active,email_verified=True,grade=4);db.add(u);await db.flush();db.add(UserRole(user_id=u.id,role_id=role.id));db.add(Enrollment(student_id=u.id,course_id=uuid.UUID(ids['course']),status='active'));await db.commit();ids['users']['module11_pass']=str(u.id);save(ids)
  if 'module11_pass_plan' not in ids:
   r=await req(c,ids,'POST','/lessons/'+ids['lesson']+'/complete','module11_pass',{'time_spent_seconds':120});check('passing-branch real lesson completion',r.status_code==200,status=r.status_code)
   body={'answers':await answers(c,ids,ids['test'],'module11_pass',False)};r=await req(c,ids,'POST','/assessments/'+ids['test']+'/submit','module11_pass',body);check('passing branch starts with real weak ten-MCQ result',r.status_code==200 and r.json()['overall_score']==0 and r.json()['total_count']==10);ids['module11_pass_original']=r.json()['id'];save(ids);await event(r.json()['id'])
   async with AsyncSessionLocal() as db:
    p=(await db.execute(select(RemediationPlan).where(RemediationPlan.student_id==uuid.UUID(ids['users']['module11_pass']),RemediationPlan.status==PlanStatus.active))).scalar_one();ids['module11_pass_plan']=str(p.id);ids['module11_pass_flag']=str(p.weakness_flag_id);save(ids)
  if 'module11_pass_retest' not in ids:
   r=await req(c,ids,'POST','/remediation-plans/'+ids['module11_pass_plan']+'/complete-study','module11_pass');check('passing branch has real four-MCQ handoff',r.status_code==200 and bool(r.json()['retest_id']));ids['module11_pass_retest']=r.json()['retest_id'];save(ids)
  tid=ids['module11_pass_retest']
  for key,expected in ((None,403),('student',403),('other',403),('foreign_instructor',403),('instructor',200),('admin',200)):
   r=await req(c,ids,'GET','/assessments/tests/'+tid,key);check('focused retrieval role/ownership '+str(key),r.status_code==expected,status=r.status_code)
  if 'module11_pass_submission' not in ids:
   sid,body=await submit(c,ids,tid,'module11_pass',True,4);ids['module11_pass_submission']=sid;save(ids)
  await event(ids['module11_pass_submission'])
  async with AsyncSessionLocal() as db:
   p=await db.get(RemediationPlan,uuid.UUID(ids['module11_pass_plan']));f=await db.get(WeaknessFlag,uuid.UUID(ids['module11_pass_flag']));check('passing retest resolves weakness and completes remediation',f.status==WeaknessStatus.resolved and str(f.resolution_submission_id)==ids['module11_pass_submission'] and p.status==PlanStatus.completed)
   before=(await db.execute(select(SkillScore).where(SkillScore.submission_id==uuid.UUID(ids['module11_pass_original'])))).scalar_one();after=(await db.execute(select(SkillScore).where(SkillScore.submission_id==uuid.UUID(ids['module11_pass_submission'])))).scalar_one();check('source-defined skill threshold improvement',float(before.score)==0 and float(after.score)==1 and float(after.score)/float(after.max_score)>=get_settings().WEAKNESS_THRESHOLD,before_score=float(before.score),after_score=float(after.score),threshold=get_settings().WEAKNESS_THRESHOLD)
   paths=(await db.execute(select(LearningPathState).where(LearningPathState.student_id==uuid.UUID(ids['users']['module11_pass'])))).scalars().all();states={str(x.lesson_id):x.state for x in paths};check('mastered upstream preserved and downstream unlocked',states.get(ids['lesson'])==PathState.mastered and states.get(ids['downstream'])==PathState.unlocked)
   subcount=(await db.execute(select(func.count(Submission.id)).where(Submission.test_id==uuid.UUID(tid),Submission.student_id==uuid.UUID(ids['users']['module11_pass'])))).scalar_one();outbox=await db.get(TestGradedOutbox,uuid.UUID(ids['module11_pass_submission']));check('one passing submission and durable published event',subcount==1 and outbox.published_at is not None,submissions=subcount)
  for key,expected in (('module11_pass',200),('student',403),('instructor',200),('foreign_instructor',403),('admin',200)):
   r=await req(c,ids,'GET','/submissions/'+ids['module11_pass_submission'],key);check('focused result ownership '+key,r.status_code==expected,status=r.status_code)
  check('Module11 closed',True)
async def run():
 try:await main()
 finally:await close_redis_pool();await engine.dispose()
if __name__=='__main__':
 try:asyncio.run(run())
 except Exception as exc:print(json.dumps({'stopped':type(exc).__name__}),flush=True);sys.exit(1)
 finally:(OUT/'MODULE11_EVIDENCE.json').write_text(json.dumps(checks,indent=2))
