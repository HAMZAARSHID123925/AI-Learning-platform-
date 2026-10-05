"""Admin shared endpoint certification using controlled Desktop data."""
import certify_final_common as r
import asyncio,json,uuid,sys,base64
from datetime import datetime,timezone,timedelta
from app.modules.module1_auth.models import AuditLog
from app.modules.module2_content.models import Course,CourseModule,Lesson,LessonStatus,ContentAsset
checks=[]
def check(name,okay,**details):
 checks.append({'check':name,'pass':bool(okay),**details});print(json.dumps(checks[-1]),flush=True)
 if not okay:raise AssertionError(name)
async def main():
 ids=r.state();await r.fixture_user(ids,'admin_target')
 rows=r.classify_api();(r.OUT/'FINAL_API_INVENTORY.json').write_text(json.dumps(rows,indent=2));check('current API inventory discovers eleven live routes',sum(x['category']=='14' for x in rows)==11)
 async with r.httpx.AsyncClient(transport=r.httpx.ASGITransport(app=r.app,raise_app_exceptions=False),base_url='http://desktop-certification',timeout=300) as c:
  target=ids['users']['admin_target'];missing=str(uuid.uuid4())
  for method,path,body in [('GET','/users',None),('GET','/users/'+target,None),('PATCH','/users/'+target,{'grade':3,'first_name':'Admin checked'}),('POST','/users/'+target+'/roles',{'role_name':'Instructor'}),('DELETE','/users/'+target+'/roles/Instructor',None)]:
   result=await r.matrix(c,ids,method,path,body,{None:403,'student':403,'instructor':403,'admin':200},checks)
   if method=='PATCH':check('Admin grade persists in response',result.status_code==200 and result.json()['grade']==3)
  for path in ['/users?page=0','/users?page_size=101','/users?status_filter=INVALID','/users/not-a-uuid','/courses?page=0','/courses?status_filter=INVALID','/courses?grade=9']:
   resp=await r.req(c,ids,'GET',path);check('clean invalid filter/id '+path,resp.status_code==422,status=resp.status_code)
  for method,path,body,expected in [('GET','/users/'+missing,None,404),('POST','/users/'+missing+'/roles',{'role_name':'Instructor'},404),('DELETE','/users/'+missing+'/roles/Instructor',None,404),('POST','/users/'+target+'/roles',{'role_name':'SuperAdmin'},422)]:
   resp=await r.req(c,ids,method,path,body=body);check('clean invalid user/role '+method,resp.status_code==expected,status=resp.status_code)
  for key in ['student','instructor']:
   resp=await r.req(c,ids,'POST','/users/'+ids['users'][key]+'/roles',key,{'role_name':'Admin'});check('cannot self promote '+key,resp.status_code==403)
  result=await r.req(c,ids,'GET','/users?page=999999');check('user pagination empty state',result.status_code==200 and result.json()['items']==[])
  result=await r.req(c,ids,'GET','/users/'+target);check('no user secret disclosure',result.status_code==200 and all(k not in result.text for k in ['password_hash','refresh_token','api_key']))
  await asyncio.gather(*(r.req(c,ids,'POST','/users/'+target+'/roles',body={'role_name':'Instructor'}) for _ in range(2)))
  async with r.AsyncSessionLocal() as db:
   role=(await db.execute(r.select(r.Role).where(r.Role.name=='Instructor'))).scalar_one();count=(await db.execute(r.select(r.func.count(r.UserRole.user_id)).where(r.UserRole.user_id==uuid.UUID(target),r.UserRole.role_id==role.id))).scalar_one();check('concurrent duplicate role assignment is one row',count==1)
  if 'module13_course' not in ids:
   result=await r.matrix(c,ids,'POST','/courses',{'title':'Final Admin controlled course','grade':4,'slug':'cert-'+ids['tag']+'-final-admin'},{None:403,'student':403,'instructor':201,'admin':201},checks);check('Admin course created',result.status_code==201);ids['module13_course']=result.json()['id'];r.save(ids)
  cid=ids['module13_course']
  await r.matrix(c,ids,'GET','/courses',None,{None:200,'student':200,'instructor':200,'admin':200},checks)
  for method,path,body,admin in [('GET','/courses/'+cid,None,200),('PATCH','/courses/'+cid,{'description':'Admin updated controlled draft'},200)]:await r.matrix(c,ids,method,path,body,{None:403,'student':403,'instructor':403,'admin':admin},checks)
  if 'module13_module' not in ids:
   result=await r.matrix(c,ids,'POST','/courses/'+cid+'/modules',{'title':'Admin controlled module','sequence_order':1},{None:403,'student':403,'instructor':403,'admin':201},checks);check('Admin module created',result.status_code==201);ids['module13_module']=result.json()['id'];r.save(ids)
  if 'module13_lesson' not in ids:
   result=await r.matrix(c,ids,'POST','/modules/'+ids['module13_module']+'/lessons',{'title':'Admin controlled lesson','sequence_order':1,'body_markdown':'Controlled media and live-class certification lesson.'},{None:403,'student':403,'instructor':403,'admin':201},checks);check('Admin lesson created',result.status_code==201);ids['module13_lesson']=result.json()['id'];r.save(ids)
  lid=ids['module13_lesson']
  for method,path,body in [('GET','/lessons/'+lid,None),('PATCH','/lessons/'+lid,{'title':'Admin updated controlled lesson'}),('POST','/lessons/'+lid+'/publish',None),('POST','/courses/'+cid+'/publish',None)]:
   resp=await r.matrix(c,ids,method,path,body,{None:403,'student':403,'instructor':403,'admin':200},checks);check('Admin content mutation/read '+method+' '+path,resp.status_code==200)
  png=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN9sAAAAASUVORK5CYII=')
  resp=await r.matrix(c,ids,'POST','/lessons/'+lid+'/assets',None,{None:403,'student':403,'instructor':403,'admin':201},checks,data={'asset_type':'image'},files={'file':('cert.png',png,'image/png')});check('Admin real private image asset upload',resp.status_code==201);ids['module13_asset']=resp.json()['id'];r.save(ids)
  body={'course_id':cid,'lesson_id':lid,'media_type':'lesson_thumbnail','filename':'cert.png','content_type':'image/png','size_bytes':len(png)}
  resp=await r.matrix(c,ids,'POST','/uploads/presign',body,{None:403,'student':403,'instructor':403,'admin':200},checks);check('Admin presign succeeds',resp.status_code==200);upload=resp.json()
  result=await c.put(upload['presigned_url'],content=png,headers={'Content-Type':'image/png'});check('real signed image PUT',result.status_code==200)
  body={'course_id':cid,'lesson_id':lid,'media_type':'lesson_thumbnail','upload_id':upload['upload_id']}
  resp=await r.matrix(c,ids,'POST','/uploads/confirm',body,{None:403,'student':403,'instructor':403,'admin':200},checks);check('Admin confirms controlled media',resp.status_code==200);ids['module13_thumbnail_key']=upload['upload_id'];r.save(ids)
  for path in ['/lessons/'+ids['lesson']+'/assessment','/courses/'+ids['course']+'/assessment','/assessments/tests/'+ids['module11_pass_retest'],'/submissions/'+ids['module11_pass_submission'],'/remediation-plans/'+ids['module11_pass_plan'],'/remediation/video-jobs/'+ids['video_job'],'/students/'+ids['users']['module11_pass']+'/dashboard','/escalations']:
   # Private positive student's records; original student is a different owner.
   student=200 if path.endswith('/assessment') or path=='/escalations' and False else 403
   if path.startswith('/courses/') and path.endswith('/assessment'):student=[200,400]
   if path=='/escalations':student=403
   resp=await r.matrix(c,ids,'GET',path,None,{None:403,'student':student,'instructor':200,'admin':200},checks);check('Admin broad intended visibility '+path,resp.status_code==200)
   check('no raw internal answer/provider secrets '+path,all(k not in resp.text for k in ['password_hash','refresh_token','is_correct','rubric','api_key']))
  resp=await r.matrix(c,ids,'POST','/assessments/generate',{'lesson_id':missing},{None:403,'student':403,'instructor':404,'admin':404},checks);check('Admin generation authorization without paid duplicate',resp.status_code==404)
  # Live administrative role scope, not the lifecycle/time/attendance certification.
  if 'module13_live' not in ids:
   body={'course_id':cid,'title':'Admin scoped scheduled class','scheduled_at':(datetime.now(timezone.utc)+timedelta(hours=1)).isoformat()}
   resp=await r.matrix(c,ids,'POST','/live-sessions',body,{None:403,'student':403,'instructor':403,'admin':201},checks);ids['module13_live']=resp.json()['id'] if resp.status_code==201 else None;r.save(ids)
  sid=ids['module13_live']
  for method,path,body,expected in [('GET','/live-sessions',None,{None:403,'student':200,'instructor':200,'admin':200}),('GET','/live-sessions/'+sid,None,{None:403,'student':403,'instructor':403,'admin':200}),('PATCH','/live-sessions/'+sid,{'title':'Admin scoped updated class'},{None:403,'student':403,'instructor':403,'admin':200}),('GET','/live-sessions/'+sid+'/attendance',None,{None:403,'student':403,'instructor':403,'admin':200}),('POST','/live-sessions/'+sid+'/join',None,{None:403,'student':403,'instructor':403,'admin':200}),('POST','/live-sessions/'+sid+'/end',None,{None:403,'student':403,'instructor':403,'admin':200})]:
   resp=await r.matrix(c,ids,method,path,body,expected,checks)
   if method=='GET' and path=='/live-sessions':
    for key in ['student','instructor']:
     response=await r.req(c,ids,'GET',path,key);check('private live scheduling not globally disclosed '+key,response.status_code==200 and not any(x['id']==sid for x in response.json()))
  if 'module13_cancel_live' not in ids:
   resp=await r.req(c,ids,'POST','/live-sessions',body={'course_id':cid,'title':'Admin cancellation controlled class','scheduled_at':(datetime.now(timezone.utc)+timedelta(hours=2)).isoformat()});check('Admin controlled cancel fixture',resp.status_code==201);ids['module13_cancel_live']=resp.json()['id'];r.save(ids)
  await r.matrix(c,ids,'DELETE','/live-sessions/'+ids['module13_cancel_live'],None,{None:403,'student':403,'instructor':403,'admin':200},checks)
  # Delete only a newly created empty certification course, never existing project data.
  resp=await r.req(c,ids,'POST','/courses',body={'title':'Disposable Admin deletion fixture','grade':4});check('controlled empty delete fixture created',resp.status_code==201)
  await r.matrix(c,ids,'DELETE','/courses/'+resp.json()['id'],None,{None:403,'student':403,'instructor':403,'admin':204},checks)
  check('every Admin-relevant role matrix passed',all(x['pass'] for x in checks))
  check('Module13 closed',True)
async def run():
 try:await main()
 finally:await r.close()
if __name__=='__main__':
 try:asyncio.run(run())
 except Exception as exc:print(json.dumps({'stopped':type(exc).__name__,'reason':str(exc)[:180]}),flush=True);sys.exit(1)
 finally:(r.OUT/'MODULE13_EVIDENCE.json').write_text(json.dumps(checks,indent=2))
