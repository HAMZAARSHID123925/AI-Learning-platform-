"""Real Desktop teacher scope certification; no provider generation or destructive cleanup."""
import certify_module11 as t
import asyncio,json,uuid,sys
from app.modules.module2_content.models import Course,CourseModule,Lesson,CourseStatus,LessonStatus
from app.modules.module4_experience.models import Enrollment
from app.modules.module6_adaptive.models import RemediationPlan,WeaknessFlag,PlanStatus,WeaknessStatus,VideoGenerationJob,VideoJobStatus
from sqlalchemy import select
checks=[]
def check(name,ok,**details):
 checks.append({'check':name,'pass':bool(ok),**details});print(json.dumps(checks[-1]),flush=True)
 if not ok:raise AssertionError(name)
async def main():
 ids=json.loads(t.STATE.read_text())
 check('Module11 closed before Module12',any(x['check']=='Module11 closed' and x['pass'] for x in json.loads((t.OUT/'MODULE11_EVIDENCE.json').read_text())))
 async with t.httpx.AsyncClient(transport=t.httpx.ASGITransport(app=t.runtime.app),base_url='http://desktop-certification',timeout=300) as c:
  evidence=t.OUT/'MODULE12_EVIDENCE.json'
  if 'module12_resolution_submission' in ids and evidence.exists():
   previous=json.loads(evidence.read_text());checks.extend(x for x in previous if x.get('pass'))
  else:
   spec=(await c.get('/openapi.json')).json();check('two current teacher-specific endpoints',all('/api/v1'+p in spec['paths'] for p in ['/escalations','/students/{student_id}/dashboard']),active_endpoints=2)
   for key,expected in [(None,403),('student',403),('foreign_instructor',403),('instructor',200),('admin',200)]:
    r=await t.req(c,ids,'GET','/students/'+ids['users']['student']+'/dashboard',key);check('assigned dashboard authorization '+str(key),r.status_code==expected,status=r.status_code)
    if key=='instructor':
     d=r.json();check('teacher sees actual completed progress and graded assessment',d['enrolled_courses'][0]['completed_lessons']>0 and d['enrolled_courses'][0]['assessment_status']=='completed' and bool(d['enrolled_courses'][0]['latest_submission_id']))
     check('teacher sees escalated remediation with three attempts',any(p['remediation_plan_id']==ids['plan'] and p['instructor_escalated'] and p['retest_attempt_count']==3 for p in d['active_remediations']))
     check('teacher sees real assessed weak skill',any(s['skill_id']==ids['skill'] and s['status']=='needs_remediation' and s['score']<0.6 for s in d['skill_mastery_radar']))
   for key,expected in [(None,403),('student',403),('instructor',200),('foreign_instructor',200),('admin',200)]:
    r=await t.req(c,ids,'GET','/escalations',key);check('escalation role '+str(key),r.status_code==expected,status=r.status_code)
    if expected==200:check('escalation course scope '+key,(any(p['plan_id']==ids['plan'] for p in r.json()))==(key!='foreign_instructor'))
   if 'module12_course_b' not in ids:
    r=await t.req(c,ids,'POST','/courses','foreign_instructor',{'title':'Certification teacher B scope','grade':4,'slug':'cert-'+ids['tag']+'-teacher-b'});check('teacher creates own controlled course',r.status_code==201,status=r.status_code);ids['module12_course_b']=r.json()['id'];t.save(ids)
    async with t.AsyncSessionLocal() as db:
     course=await db.get(Course,uuid.UUID(ids['module12_course_b']));course.status=CourseStatus.published
     m=CourseModule(course_id=course.id,title='Controlled teacher scope',sequence_order=1);db.add(m);await db.flush()
     for n,status in [(1,LessonStatus.published),(2,LessonStatus.draft)]:db.add(Lesson(module_id=m.id,title='Controlled scope lesson '+str(n),slug='cert-'+ids['tag']+'-teacher-b-'+str(n),sequence_order=n,status=status,body_markdown='Controlled course scope fixture.'))
     db.add(Enrollment(student_id=uuid.UUID(ids['users']['module11_pass']),course_id=course.id,status='active'));await db.commit()
   for key,courses in [('instructor',{ids['course']}),('foreign_instructor',{ids['module12_course_b']}),('admin',{ids['course'],ids['module12_course_b']})]:
    r=await t.req(c,ids,'GET','/students/'+ids['users']['module11_pass']+'/dashboard',key);check('multi-instructor student dashboard scoped '+key,r.status_code==200 and {x['course_id'] for x in r.json()['enrolled_courses']}==courses,status=r.status_code)
    if key=='foreign_instructor':check('no foreign assessment skill or remediation leak',not r.json()['skill_mastery_radar'] and not r.json()['active_remediations'] and r.json()['unread_notifications_count']==0 and r.json()['enrolled_courses'][0]['assessment_status']=='not_started')
   r=await t.req(c,ids,'GET','/students/me/dashboard','module11_pass');check('staff views do not poison student cache',r.status_code==200 and {x['course_id'] for x in r.json()['enrolled_courses']}=={ids['course'],ids['module12_course_b']})
   for key,expected_drafts in [('instructor',0),('foreign_instructor',1),('admin',1),(None,0)]:
    r=await t.req(c,ids,'GET','/courses/'+ids['module12_course_b'],key);check('draft syllabus scope '+str(key),r.status_code==200 and sum(l['status']=='draft' for m in r.json()['modules'] for l in m['lessons'])==expected_drafts)
   denied=[('POST','/users/'+ids['users']['instructor']+'/roles',{'role_name':'Admin'}),('GET','/users',None),('GET','/users/'+ids['users']['other'],None),('PATCH','/users/'+ids['users']['other'],{'first_name':'Unauthorized'}),('PATCH','/courses/'+ids['module12_course_b'],{'title':'Unauthorized change'}),('POST','/courses/'+ids['module12_course_b']+'/publish',None)]
   for method,path,body in denied:
    r=await t.req(c,ids,method,path,'instructor',body);check('teacher denied unauthorized '+method+' '+path,r.status_code==403,status=r.status_code)
   for path in ['/submissions/'+ids['module11_pass_submission'],'/remediation-plans/'+ids['module11_pass_plan'],'/assessments/tests/'+ids['module11_pass_retest'],'/remediation/video-jobs/'+ids['video_job']]:
    for key,expected in [('instructor',200),('foreign_instructor',403),('admin',200)]:
     r=await t.req(c,ids,'GET',path,key);check('private results/remediation/retest/video scope '+key+' '+path,r.status_code==expected,status=r.status_code)
   check('Module12 teacher baseline closed',True)
  # Reuse actual ten-MCQ test to resolve an escalated plan; no new AI/video calls.
  if 'module12_resolution_submission' not in ids:
   body={'answers':await t.answers(c,ids,ids['test'],'student',True)};r=await t.req(c,ids,'POST','/assessments/'+ids['test']+'/submit','student',body);check('real normal assessment closes escalated weakness',r.status_code==200 and r.json()['overall_score']==1);ids['module12_resolution_submission']=r.json()['id'];t.save(ids)
  await t.event(ids['module12_resolution_submission'])
  async with t.AsyncSessionLocal() as db:
   p=await db.get(RemediationPlan,uuid.UUID(ids['plan']));f=await db.get(WeaknessFlag,uuid.UUID(ids['flag']));check('escalated plan completed and weakness resolved',p.status==PlanStatus.completed and f.status==WeaknessStatus.resolved)
   job=await db.get(VideoGenerationJob,uuid.UUID(ids['video_job']));check('one existing real video remains ready',job.status==VideoJobStatus.ready and str(job.remediation_plan_id)==ids['plan'])
  r=await t.req(c,ids,'GET','/escalations','instructor');check('resolved weakness removed from active teacher escalations',r.status_code==200 and not any(p['plan_id']==ids['plan'] for p in r.json()))
  for key in ['instructor','foreign_instructor','admin']:
   r=await t.req(c,ids,'GET','/escalations',key);check('current escalation scope after resolution '+key,r.status_code==200 and not any(p['plan_id']==ids['plan'] for p in r.json()))
  for key in ['student','module11_pass']:
   r=await t.req(c,ids,'GET','/students/'+ids['users'][key]+'/dashboard','instructor');check('resolved skill dashboard reflects latest passing grade '+key,r.status_code==200 and any(s['skill_id']==ids['skill'] and s['score']==1 and s['status']=='mastered' for s in r.json()['skill_mastery_radar']))
  check('Module12 closed',True)
  from app.modules.module4_experience.models import LearningPathState,PathState,StudentProgress
  from app.modules.module5_assessment.models import Submission,SubmissionStatus,Test,SkillScore
  from sqlalchemy import func
  async with t.AsyncSessionLocal() as db:
   original=await db.get(Submission,uuid.UUID(ids['wrong_submission']));test=await db.get(Test,uuid.UUID(ids['test']));plan=await db.get(RemediationPlan,uuid.UUID(ids['plan']));job=await db.get(VideoGenerationJob,uuid.UUID(ids['video_job']));passing=await db.get(Submission,uuid.UUID(ids['module11_pass_submission']))
   progress=(await db.execute(select(StudentProgress).where(StudentProgress.student_id==uuid.UUID(ids['users']['student']),StudentProgress.lesson_id==uuid.UUID(ids['lesson'])))).scalar_one()
   check('compact E2E actual lesson and ten-MCQ failing grade',progress.completed and original.status==SubmissionStatus.graded and float(original.overall_score)==0 and test.lesson_id==uuid.UUID(ids['lesson']))
   check('compact E2E persisted weakness written study and one video relationship',bool(plan.remedial_course_markdown) and plan.study_completed and job.weakness_flag_id==plan.weakness_flag_id and job.remediation_plan_id==plan.id and job.submission_id==original.id and job.status==VideoJobStatus.ready and bool(job.video_object_key) and bool(job.audio_manifest_json) and bool(job.scene_json))
   count=(await db.execute(select(func.count(VideoGenerationJob.id)).where(VideoGenerationJob.student_id==original.student_id,VideoGenerationJob.weakness_flag_id==plan.weakness_flag_id))).scalar_one();check('compact E2E exactly one real video',count==1,count=count)
   paths=(await db.execute(select(LearningPathState).where(LearningPathState.student_id==original.student_id))).scalars().all();states={str(x.lesson_id):x.state for x in paths};check('compact E2E primary resolution preserves mastery and unlocks downstream',states.get(ids['lesson'])==PathState.mastered and states.get(ids['downstream'])==PathState.unlocked)
   check('compact E2E real focused passing result retained',passing.status==SubmissionStatus.graded and float(passing.overall_score)==1)
  r=await t.req(c,ids,'GET','/remediation/video-jobs/'+ids['video_job'],'student');check('compact E2E ready authorized signed playback remains available',r.status_code==200 and r.json()['status']=='ready' and bool(r.json()['video_url']))
  check('Compact 10-12 E2E persisted chain verified without regeneration',True)
async def run():
 try:await main()
 finally:await t.close_redis_pool();await t.engine.dispose()
if __name__=='__main__':
 try:asyncio.run(run())
 except Exception as exc:print(json.dumps({'stopped':type(exc).__name__,'reason':str(exc)[:200]}),flush=True);sys.exit(1)
 finally:(t.OUT/'MODULE12_EVIDENCE.json').write_text(json.dumps(checks,indent=2))
