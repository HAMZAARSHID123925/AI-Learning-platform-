"""Real projected ORM SQL and nested dependency tests on isolated fixtures."""
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock
import pytest
import httpx
from fastapi import FastAPI, Depends
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import create_engine, text, event, select, inspect
from sqlalchemy.orm import Session, selectinload
import app.main
from app.database import get_db
from app.modules.module1_auth.models import User, UserRole, Role, RolePermission
from app.shared import dependencies as deps
from app.shared.redis_client import get_auth_redis
from app.shared.exceptions import ElarionError, AccountSuspendedError, TokenInvalidError

IDS=[uuid.UUID(int=n) for n in (1,2,3)]

@pytest.fixture
def auth_sql():
    engine=create_engine('sqlite://')
    with engine.begin() as c:
        c.execute(text('CREATE TABLE users (id CHAR(32), email TEXT, password_hash TEXT, first_name TEXT, last_name TEXT, status TEXT, grade INTEGER, email_verified BOOLEAN, parental_consent BOOLEAN, last_login_at TEXT, created_at TEXT, updated_at TEXT)'))
        c.execute(text('CREATE TABLE roles (id CHAR(32), name TEXT, description TEXT)'))
        c.execute(text('CREATE TABLE permissions (id CHAR(32), code TEXT, description TEXT)'))
        c.execute(text('CREATE TABLE user_roles (user_id CHAR(32), role_id CHAR(32))'))
        c.execute(text('CREATE TABLE role_permissions (role_id CHAR(32), permission_id CHAR(32))'))
        for n,role,permission in [(1,'Student','course:read'),(2,'Instructor','course:create'),(3,'Admin','user:read')]:
            c.execute(text('INSERT INTO users VALUES (:id,:email,"unused fixture hash","Fixture","User","active",3,true,false,NULL,"2026-01-01","2026-01-01")'),{'id':IDS[n-1].hex,'email':str(n)+'@example.invalid'})
            rid=uuid.UUID(int=100+n).hex;pid=uuid.UUID(int=200+n).hex
            c.execute(text('INSERT INTO roles VALUES (:id,:name,"unused description")'),{'id':rid,'name':role})
            c.execute(text('INSERT INTO permissions VALUES (:id,:code,"unused description")'),{'id':pid,'code':permission})
            c.execute(text('INSERT INTO user_roles VALUES (:u,:r)'),{'u':IDS[n-1].hex,'r':rid})
            c.execute(text('INSERT INTO role_permissions VALUES (:r,:p)'),{'r':rid,'p':pid})
    statements=[]
    event.listen(engine,'before_cursor_execute',lambda conn,cursor,statement,*_:statements.append(statement))
    yield engine,statements
    engine.dispose()

class DB:
    def __init__(self,session):self.session=session
    async def execute(self,q):return self.session.execute(q)

async def legacy(db,uid):
    result=await db.execute(select(User).where(User.id==uid).options(selectinload(User.user_roles).selectinload(UserRole.role).selectinload(Role.role_permissions).selectinload(RolePermission.permission)))
    return result.scalar_one_or_none()

@pytest.mark.asyncio
@pytest.mark.parametrize('uid',IDS)
async def test_authoritative_projection_matches_five_query_graph(auth_sql,uid):
    engine,sql=auth_sql
    with Session(engine) as session:
        old=await legacy(DB(session),uid)
        expected=(old.id,old.status,old.grade,old.full_name,old.email,deps.get_user_role_names(old),old.get_permissions())
        assert len(sql)==5
    sql.clear()
    with Session(engine) as session:
        new=await deps._load_auth_user(DB(session),uid)
        assert (new.id,new.status,new.grade,new.full_name,new.email,deps.get_user_role_names(new),new.get_permissions())==expected
        assert len(sql)==1
        assert 'password_hash' not in sql[0]
        assert 'description' not in sql[0]
        assert 'password_hash' in inspect(new).unloaded

@pytest.mark.asyncio
async def test_multiple_roles_and_duplicate_permissions_are_additive(auth_sql):
    engine,sql=auth_sql
    with engine.begin() as c:
        c.execute(text('INSERT INTO user_roles VALUES (:u,:r)'),{'u':IDS[0].hex,'r':uuid.UUID(int=102).hex})
        c.execute(text('INSERT INTO role_permissions VALUES (:r,:p)'),{'r':uuid.UUID(int=102).hex,'p':uuid.UUID(int=201).hex})
    sql.clear()
    with Session(engine) as session:
        principal=await deps._load_auth_user(DB(session),IDS[0])
        assert deps.get_user_role_names(principal)=={'Student','Instructor'}
        assert principal.get_permissions()=={'course:read','course:create'}
        assert len(sql)==1

@pytest.mark.asyncio
async def test_role_and_permission_changes_are_seen_next_request(auth_sql):
    engine,sql=auth_sql
    with Session(engine) as session:
        assert (await deps._load_auth_user(DB(session),IDS[0])).get_permissions()=={'course:read'}
    with engine.begin() as c:c.execute(text('DELETE FROM role_permissions WHERE role_id=:r'),{'r':uuid.UUID(int=101).hex})
    with Session(engine) as session:
        assert (await deps._load_auth_user(DB(session),IDS[0])).get_permissions()==set()
    with engine.begin() as c:c.execute(text('DELETE FROM user_roles WHERE user_id=:u'),{'u':IDS[0].hex})
    with Session(engine) as session:
        assert deps.get_user_role_names(await deps._load_auth_user(DB(session),IDS[0]))==set()

@pytest.mark.asyncio
async def test_suspension_seen_next_request_despite_active_jwt_claim(auth_sql,monkeypatch):
    engine,_=auth_sql
    monkeypatch.setattr(deps,'decode_access_token',lambda _:dict(sub=str(IDS[0]),jti='controlled',status='active',roles=['Admin']))
    with engine.begin() as c:c.execute(text('UPDATE users SET status="suspended" WHERE id=:u'),{'u':IDS[0].hex})
    with Session(engine) as session:
        with pytest.raises(AccountSuspendedError):
            await deps.get_current_user(credentials=HTTPAuthorizationCredentials(scheme='Bearer',credentials='controlled'),db=DB(session),redis=SimpleNamespace(exists=AsyncMock(return_value=0)))

@pytest.mark.asyncio
async def test_deleted_user_rejected(auth_sql,monkeypatch):
    engine,_=auth_sql
    monkeypatch.setattr(deps,'decode_access_token',lambda _:dict(sub=str(uuid.UUID(int=999)),jti='controlled'))
    with Session(engine) as session:
        with pytest.raises(TokenInvalidError):
            await deps.get_current_user(credentials=HTTPAuthorizationCredentials(scheme='Bearer',credentials='controlled'),db=DB(session),redis=SimpleNamespace(exists=AsyncMock(return_value=0)))

@pytest.mark.asyncio
async def test_nested_dependencies_reuse_one_principal_and_isolate_requests(auth_sql,monkeypatch):
    engine,sql=auth_sql
    monkeypatch.setattr(deps,'decode_access_token',lambda token:dict(sub=str(IDS[int(token)-1]),jti='controlled-'+token,roles=['Admin'],permissions=['user:read']))
    redis=SimpleNamespace(exists=AsyncMock(return_value=0))
    app=FastAPI()
    async def database():
        with Session(engine) as session:yield DB(session)
    app.dependency_overrides[get_db]=database
    app.dependency_overrides[get_auth_redis]=lambda:redis
    @app.exception_handler(ElarionError)
    async def denied(request,error):return JSONResponse({'code':error.code},status_code=403)
    @app.get('/nested')
    async def nested(principal=Depends(deps.get_current_user),permission=Depends(deps.require_permission('course:read')),role=Depends(deps.require_any_role('Student'))):
        assert principal is permission is role
        return {'id':str(principal.id)}
    @app.get('/admin')
    async def admin(principal=Depends(deps.get_current_user),role=Depends(deps.require_any_role('Admin'))):
        assert principal is role
        return {'id':str(principal.id)}
    @app.get('/users')
    async def users(principal=Depends(deps.require_permission('user:read'))):return {'id':str(principal.id)}
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://fixture') as client:
        sql.clear();redis.exists.reset_mock()
        response=await client.get('/nested',headers={'Authorization':'Bearer 1'})
        assert response.status_code==200 and response.json()['id']==str(IDS[0]);assert len(sql)==1;redis.exists.assert_awaited_once()
        for token,expected in [('1',403),('2',403),('3',200),('1',403)]:
            for path in ['/admin','/users']:
                sql.clear();redis.exists.reset_mock()
                response=await client.get(path,headers={'Authorization':'Bearer '+token})
                assert response.status_code==expected;assert len(sql)==1;redis.exists.assert_awaited_once()
                if expected==200:assert response.json()['id']==str(IDS[2])


@pytest.mark.asyncio
async def test_existing_profile_write_commits_and_exception_rolls_back(auth_sql,monkeypatch):
    from app import database as database_module
    from app.modules.module1_auth.router import router as auth_router
    from fastapi import HTTPException
    engine,_=auth_sql
    lifecycle=[]
    class Adapter(DB):
        async def commit(self):self.session.commit();lifecycle.append('commit')
        async def rollback(self):self.session.rollback();lifecycle.append('rollback')
        async def close(self):self.session.close();lifecycle.append('close')
    monkeypatch.setattr(database_module,'AsyncSessionLocal',lambda:Adapter(Session(engine,expire_on_commit=False)))
    monkeypatch.setattr(deps,'decode_access_token',lambda _:dict(sub=str(IDS[0]),jti='controlled'))
    app=FastAPI();app.include_router(auth_router)
    app.dependency_overrides[get_auth_redis]=lambda:SimpleNamespace(exists=AsyncMock(return_value=0))
    @app.get('/controlled-exception')
    async def controlled_exception(db=Depends(get_db)):
        await db.execute(text('UPDATE users SET first_name="Rollback" WHERE id=:id').bindparams(id=IDS[0].hex))
        raise HTTPException(418,'Controlled fixture rollback')
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://fixture',headers={'Authorization':'Bearer controlled'}) as client:
        response=await client.patch('/users/me',json={'first_name':'Changed'})
        assert response.status_code==200 and response.json()['first_name']=='Changed'
        assert lifecycle==['commit','close']
        with engine.connect() as c:assert c.execute(text('SELECT first_name FROM users WHERE id=:id'),{'id':IDS[0].hex}).scalar_one()=='Changed'
        lifecycle.clear()
        response=await client.get('/users/me');assert response.status_code==200
        assert lifecycle==['commit','close']  # existing read lifecycle deliberately unchanged
        lifecycle.clear()
        response=await client.get('/controlled-exception');assert response.status_code==418
        assert lifecycle==['rollback','close']
        with engine.connect() as c:assert c.execute(text('SELECT first_name FROM users WHERE id=:id'),{'id':IDS[0].hex}).scalar_one()=='Changed'
