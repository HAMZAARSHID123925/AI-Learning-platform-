"""Real focused-submission idempotence probe on the existing owned retest."""
import certify_module10 as runtime
import asyncio,json,uuid,sys
import httpx
from sqlalchemy import select
from app.database import AsyncSessionLocal,engine
from app.modules.module1_auth.models import User
from app.modules.module5_assessment.models import Question
from app.shared.auth import create_access_token
from app.shared.redis_client import close_redis_pool
OUT=runtime.OUT;STATE=runtime.STATE;checks=[]
def check(name,ok,**detail):
 checks.append({'check':name,'pass':bool(ok),**detail});print(json.dumps(checks[-1]),flush=True)
 if not ok:raise AssertionError(name)
async def main():
 ids=json.loads(STATE.read_text());tid=ids['focused_retest']
 async with AsyncSessionLocal() as db:
  user=await db.get(User,uuid.UUID(ids['users']['student']));token,_=create_access_token(str(user.id),user.email,user.first_name,[],[])
  questions=(await db.execute(select(Question).where(Question.test_id==uuid.UUID(tid)))).scalars().all()
 async with httpx.AsyncClient(transport=httpx.ASGITransport(app=runtime.app),base_url='http://desktop-certification',headers={'Authorization':'Bearer '+token},timeout=240) as c:
  r=await c.get('/api/v1/assessments/tests/'+tid);check('existing real focused retest retrieval',r.status_code==200 and len(r.json()['questions'])==4 and 'is_correct' not in r.text,status=r.status_code)
  public={q['id']:{o['text']:o['id'] for o in q['options']} for q in r.json()['questions']}
  answers=[{'question_id':str(q.id),'selected_option_id':public[str(q.id)][next(o['text'] for o in q.options if not o['is_correct'])]} for q in questions]
  r=await c.post('/api/v1/assessments/'+tid+'/submit',json={'answers':answers});check('real failing focused submission graded',r.status_code==200 and r.json()['overall_score']==0 and r.json()['total_count']==4,status=r.status_code)
  ids['module11_primary_submission']=r.json()['id'];STATE.write_text(json.dumps(ids,indent=2))
  second=await c.post('/api/v1/assessments/'+tid+'/submit',json={'answers':answers})
  if second.status_code==200:ids['module11_duplicate_baseline']=second.json()['id'];STATE.write_text(json.dumps(ids,indent=2))
  check('focused submission retry is idempotent',second.status_code==200 and second.json()['id']==r.json()['id'],status=second.status_code)
async def run():
 try:await main()
 finally:await close_redis_pool();await engine.dispose()
if __name__=='__main__':
 try:asyncio.run(run())
 except Exception as e:print(json.dumps({'stopped':type(e).__name__}));sys.exit(1)
 finally:(OUT/'MODULE11_PROBE.json').write_text(json.dumps(checks,indent=2))
