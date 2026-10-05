"""Desktop batch runtime; real auth/DB/Valkey, sanitized evidence, no provider generation."""
import certify_module10 as runtime
import asyncio,json,uuid,sys,hashlib
from pathlib import Path
from datetime import datetime,timezone,timedelta
import httpx
from sqlalchemy import select,func
from app.database import AsyncSessionLocal,engine
from app.modules.module1_auth.models import User,Role,UserRole,UserStatus
from app.shared.auth import create_access_token,hash_password
from app.shared.redis_client import close_redis_pool,get_redis_client
OUT=runtime.OUT;STATE=OUT/'FINAL_BATCH_STATE.json';HEADERS={};app=runtime.app

def state():return json.loads((STATE if STATE.exists() else runtime.STATE).read_text())
def save(ids):STATE.write_text(json.dumps(ids,indent=2))
async def header(ids,key):
 if not key:return {}
 if key not in HEADERS:
  async with AsyncSessionLocal() as db:u=await db.get(User,uuid.UUID(ids['users'][key]))
  token,_=create_access_token(str(u.id),u.email,u.first_name,[],[]);HEADERS[key]={'Authorization':'Bearer '+token}
 return HEADERS[key]
async def req(c,ids,method,path,key='admin',body=None,**kwargs):return await c.request(method,'/api/v1'+path,headers=await header(ids,key),**({'json':body} if body is not None else {}),**kwargs)
async def matrix(c,ids,method,path,body,expected,checks,**kwargs):
 keys=[None,'student','instructor','admin']
 results=await asyncio.gather(*(req(c,ids,method,path,k,body,**kwargs) for k in keys))
 for k,r in zip(keys,results):
  okay=r.status_code in (expected[k] if isinstance(expected[k],list) else [expected[k]])
  checks.append({'check':method+' '+path+' role '+str(k),'pass':okay,'status':r.status_code})
  print(json.dumps(checks[-1]),flush=True)
 return results[-1]
async def fixture_user(ids,key,roles=('Student',)):
 if key in ids['users']:return
 async with AsyncSessionLocal() as db:
  u=User(email='cert-'+ids['tag']+'-'+key+'@example.invalid',password_hash=hash_password(uuid.uuid4().hex),first_name='Certification',last_name=key,status=UserStatus.active,email_verified=True,grade=4);db.add(u);await db.flush()
  for name in roles:
   role=(await db.execute(select(Role).where(Role.name==name))).scalar_one();db.add(UserRole(user_id=u.id,role_id=role.id))
  await db.commit();ids['users'][key]=str(u.id);save(ids)
async def close():await close_redis_pool();await engine.dispose()
def classify_api():
 rows=[]
 for path,methods in app.openapi()['paths'].items():
  for method,op in methods.items():
   if method not in ['get','post','patch','put','delete']:continue
   if path.startswith('/health'):category='00'
   elif '/live-sessions' in path or '/webhooks/' in path:category='14'
   elif '/users/' in path and (path.endswith('/roles') or '/roles/' in path) or path=='/api/v1/users' or path=='/api/v1/users/{user_id}':category='13'
   elif '/auth/' in path or '/users/me' in path:category='01'
   elif '/uploads/' in path or '/assets' in path:category='05'
   elif path.endswith('/assessment') or '/assessments' in path or '/submissions/' in path:category='07/11'
   elif '/video-jobs' in path:category='10'
   elif '/weakness' in path:category='08'
   elif '/escalations' in path or '/students/{student_id}' in path:category='12/13'
   elif '/remediation' in path or '/learning-path' in path:category='09/11'
   elif '/students/me/' in path or '/notifications' in path or '/enrollments' in path or path.endswith('/complete') or path.endswith('/progress'):category='06'
   elif '/lessons/' in path:category='04'
   elif '/modules/' in path or path.endswith('/modules'):category='03'
   elif '/courses' in path:category='02'
   else:category='15'
   rows.append({'method':method.upper(),'path':path,'category':category,'summary':op.get('summary')})
 return rows
