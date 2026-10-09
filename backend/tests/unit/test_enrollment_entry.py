"""Enrollment idempotency, transactions and real fixture concurrency; no live writes."""
import asyncio
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock
import pytest
from sqlalchemy import create_engine, MetaData, event, insert, select, delete, update, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy.dialects.postgresql import Insert, dialect
from tests.unit.test_dashboard_read import data, seed, Database, UID, OTHER
from app.database import Base
from app.modules.module1_auth.models import User
from app.modules.module2_content.models import Course, Lesson
from app.modules.module4_experience.models import Enrollment, StudentProgress, LearningPathState
from app.modules.module4_experience.schemas import EnrollCourseRequest
from app.modules.module4_experience import router
from app.modules.module4_experience.services import enrollment_service as service
from app.modules.module4_experience.services.progress_service import get_course_progress
from app.modules.module2_content import router as content
from app.modules.module5_assessment.models import Submission
from app.shared.exceptions import BusinessRuleError, ResourceNotFoundError, LessonLockedError

CID=uuid.UUID(int=100)
LID=uuid.UUID(int=1000)

def user(uid=UID,roles=('Student',),grade=3):
    return SimpleNamespace(id=uid,grade=grade,has_role=lambda role:role in roles)

def remove_enrollment(engine):
    with engine.begin() as conn:conn.execute(delete(Enrollment))

@pytest.mark.asyncio
async def test_first_create_repeat_progress_and_lesson_flow(data,monkeypatch):
    engine,sql=data;seed(engine,1);remove_enrollment(engine)
    with engine.begin() as conn:
        conn.execute(delete(StudentProgress));conn.execute(delete(LearningPathState));conn.execute(delete(Submission))
    cache=AsyncMock();monkeypatch.setattr(service,'invalidate_dashboard_cache',cache)
    with Session(engine) as session:
        db=Database(session)
        assert session.scalar(select(func.count()).select_from(Enrollment))==0
        first=await router.enroll_course(EnrollCourseRequest(course_id=CID),user(),db)
        assert first.student_id==UID and first.course_id==CID and first.status=='active'
        assert first.course_title=='Math 0' and first.course_slug=='math-0'
        assert session.scalar(select(func.count()).select_from(Enrollment))==1
        saved=session.execute(select(Enrollment.__table__)).one()
        sql.clear();again=await router.enroll_course(EnrollCourseRequest(course_id=CID),user(),db)
        assert again==first and len(sql)==1 and 'body_markdown' not in sql[0]
        assert 'content_assets' not in sql[0] and 'users' not in sql[0]
        assert session.execute(select(Enrollment.__table__)).one()==saved
        progress=await get_course_progress(db,UID,CID)
        assert progress['completed_lessons']==0 and progress['percentage']==0 and progress['locked_lessons']==0
        assert progress['assessment_status']=='not_started' and progress['latest_submission_id'] is None
        assert (await content.get_lesson(LID,user(),db)).id==LID
    cache.assert_awaited_once_with(UID)

@pytest.mark.asyncio
async def test_existing_is_read_only_and_viewer_scoped(data,monkeypatch):
    engine,sql=data;seed(engine,1)
    cache=AsyncMock();monkeypatch.setattr(service,'invalidate_dashboard_cache',cache)
    with Session(engine) as session:
        saved=session.execute(select(Enrollment.__table__)).one();sql.clear()
        response=await service.enroll_student(Database(session),UID,CID)
        assert response.id==saved.id and response.status==saved.status
        assert len(sql)==1 and all(not q.startswith(('INSERT','UPDATE','DELETE')) for q in sql)
        assert session.execute(select(Enrollment.__table__)).one()==saved
    cache.assert_not_awaited()

@pytest.mark.asyncio
@pytest.mark.parametrize('status',['draft','archived'])
@pytest.mark.parametrize('roles',[('Student',),('Instructor',),('Admin',)])
async def test_nonpublished_course_never_ensures_even_for_existing_or_staff(data,monkeypatch,status,roles):
    engine,_=data;seed(engine,1)
    with engine.begin() as conn:conn.execute(update(Course).values(status=status))
    cache=AsyncMock();monkeypatch.setattr(service,'invalidate_dashboard_cache',cache)
    with Session(engine) as session:
        with pytest.raises(BusinessRuleError):await router.enroll_course(EnrollCourseRequest(course_id=CID),user(roles=roles),Database(session))
        assert session.scalar(select(func.count()).select_from(Enrollment))==1
    cache.assert_not_awaited()

@pytest.mark.asyncio
async def test_missing_course_and_inactive_enrollment_fail_without_grant(data,monkeypatch):
    engine,_=data;seed(engine,1)
    with engine.begin() as conn:conn.execute(update(Enrollment).values(status='inactive'))
    with Session(engine) as session:
        db=Database(session)
        with pytest.raises(ResourceNotFoundError):await service.enroll_student(db,UID,uuid.UUID(int=99999))
        with pytest.raises(BusinessRuleError):await service.enroll_student(db,UID,CID)
        assert session.scalar(select(Enrollment.status))=='inactive'

@pytest.mark.asyncio
@pytest.mark.parametrize('roles',[('Student',),('Instructor',),('Admin',)])
async def test_existing_endpoint_role_and_grade_semantics_are_preserved(data,roles):
    engine,_=data;seed(engine,1)
    # Existing endpoint accepts any authenticated role on published courses;
    # matching-grade assessment authorization remains a separate requirement.
    with Session(engine) as session:
        result=await router.enroll_course(EnrollCourseRequest(course_id=CID),user(roles=roles,grade=4),Database(session))
        assert result.course_id==CID and result.student_id==UID

@pytest.mark.asyncio
async def test_unrelated_integrity_conflict_not_swallowed(data,monkeypatch):
    engine,_=data;seed(engine,1)
    with Session(engine) as session:
        existing_id=session.scalar(select(Enrollment.id))
        class Collision(Database):
            async def execute(self,query):
                if isinstance(query,Insert):query=query.values(id=existing_id)
                return await super().execute(query)
        cache=AsyncMock();monkeypatch.setattr(service,'invalidate_dashboard_cache',cache)
        with pytest.raises(IntegrityError):await service.enroll_student(Collision(session),OTHER,CID)
        session.rollback();assert session.scalar(select(func.count()).select_from(Enrollment))==1
    cache.assert_not_awaited()

@pytest.mark.asyncio
async def test_commit_failure_cannot_return_success_or_invalidate(data,monkeypatch):
    engine,_=data;seed(engine,1);remove_enrollment(engine)
    cache=AsyncMock();monkeypatch.setattr(service,'invalidate_dashboard_cache',cache)
    with Session(engine) as session:
        db=Database(session);db.commit=AsyncMock(side_effect=RuntimeError('Fixture commit failure'))
        with pytest.raises(RuntimeError):await service.enroll_student(db,UID,CID)
        await db.rollback()
    with Session(engine) as session:assert session.scalar(select(func.count()).select_from(Enrollment))==0
    cache.assert_not_awaited()

@pytest.mark.asyncio
async def test_enrollment_does_not_unlock_or_publish_lesson(data,monkeypatch):
    engine,_=data;seed(engine,1);remove_enrollment(engine)
    monkeypatch.setattr(service,'invalidate_dashboard_cache',AsyncMock())
    with Session(engine) as session:
        db=Database(session);await service.enroll_student(db,UID,CID)
        with pytest.raises(LessonLockedError):await content.get_lesson(uuid.UUID(int=1001),user(),db)
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as unpublished:await content.get_lesson(uuid.UUID(int=1003),user(),db)
        assert unpublished.value.status_code==403

class ConcurrentDatabase:
    def __init__(self,session,barrier):self.session=session;self.barrier=barrier;self.read=False;self.count=0;self.statement=None
    async def execute(self,query):
        self.count+=1
        if isinstance(query,Insert):self.statement=str(query.compile(dialect=dialect()))
        result=await asyncio.to_thread(self.session.execute,query)
        if not self.read:
            self.read=True;await self.barrier.wait()
        return result
    async def commit(self):await asyncio.to_thread(self.session.commit)

def concurrent_engine(tmp_path):
    engine=create_engine('sqlite:///'+str(tmp_path/'enrollment-concurrency.db'),connect_args={'check_same_thread':False,'timeout':15})
    @event.listens_for(engine,'connect')
    def settings(conn,record):conn.execute('PRAGMA foreign_keys=ON');conn.execute('PRAGMA busy_timeout=15000')
    metadata=MetaData()
    for table in Base.metadata.sorted_tables:
        copied=table.to_metadata(metadata)
        for column in copied.c:column.server_default=None
    metadata.create_all(engine)
    with engine.begin() as conn:
        for uid in (UID,OTHER):
            conn.execute(insert(User),dict(id=uid,email=str(uid.int)+'@example.invalid',password_hash='unused fixture',first_name='Fixture',last_name='Student',grade=3))
    seed(engine,1);remove_enrollment(engine)
    return engine

@pytest.mark.asyncio
@pytest.mark.parametrize('same_student',[True,False])
async def test_two_real_fixture_transactions_race_safely(tmp_path,monkeypatch,same_student):
    engine=concurrent_engine(tmp_path);barrier=asyncio.Barrier(2)
    cache=AsyncMock();monkeypatch.setattr(service,'invalidate_dashboard_cache',cache)
    sessions=[Session(engine),Session(engine)];dbs=[ConcurrentDatabase(s,barrier) for s in sessions]
    async def ensure(db,uid):
        result=await service.enroll_student(db,uid,CID);await db.commit();return result
    try:
        responses=await asyncio.wait_for(asyncio.gather(ensure(dbs[0],UID),ensure(dbs[1],UID if same_student else OTHER)),timeout=20)
        assert (responses[0].id==responses[1].id)==same_student
        with Session(engine) as session:assert session.scalar(select(func.count()).select_from(Enrollment))==(1 if same_student else 2)
        assert cache.await_count==(1 if same_student else 2)
        assert sorted(db.count for db in dbs)==([2,3] if same_student else [2,2])
        for db in dbs:assert 'ON CONFLICT (student_id, course_id) DO NOTHING' in db.statement
    finally:
        for session in sessions:session.close()
        engine.dispose()


@pytest.mark.asyncio
@pytest.mark.parametrize('case',['invalid','expired','revoked'])
async def test_endpoint_denies_bad_tokens_before_any_enrollment_work(data,monkeypatch,case):
    import httpx
    from app.main import app
    from app.database import get_db
    from app.shared import dependencies as deps
    from app.shared.redis_client import get_auth_redis
    from app.shared.exceptions import TokenInvalidError,TokenExpiredError
    engine,sql=data;seed(engine,1);remove_enrollment(engine)
    redis=SimpleNamespace(exists=AsyncMock(return_value=1 if case=='revoked' else 0))
    def decode(token):
        if case=='invalid':raise TokenInvalidError()
        if case=='expired':raise TokenExpiredError()
        return {'sub':str(UID),'jti':'controlled-fixture'}
    monkeypatch.setattr(deps,'decode_access_token',decode)
    async def database():
        with Session(engine) as session:
            db=Database(session)
            try:yield db;await db.commit()
            except Exception:await db.rollback();raise
    async def auth_redis():yield redis
    previous=dict(app.dependency_overrides)
    app.dependency_overrides[get_db]=database;app.dependency_overrides[get_auth_redis]=auth_redis
    sql.clear()
    try:
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://fixture') as client:
            r=await client.post('/api/v1/enrollments',json={'course_id':str(CID)},headers={'Authorization':'Bearer controlled-fixture'})
            assert r.status_code==401 and sql==[]
    finally:app.dependency_overrides.clear();app.dependency_overrides.update(previous)
    with Session(engine) as session:assert session.scalar(select(func.count()).select_from(Enrollment))==0

@pytest.mark.asyncio
async def test_http_create_repeat_binds_current_identity_and_keeps_contract(data,monkeypatch):
    import httpx
    from app.main import app
    from app.database import get_db
    from app.shared.dependencies import get_current_user
    engine,_=data;seed(engine,1);remove_enrollment(engine)
    cache=AsyncMock();monkeypatch.setattr(service,'invalidate_dashboard_cache',cache)
    async def database():
        with Session(engine) as session:
            db=Database(session)
            try:yield db;await db.commit()
            except Exception:await db.rollback();raise
    async def identity():return user()
    previous=dict(app.dependency_overrides);app.dependency_overrides[get_db]=database;app.dependency_overrides[get_current_user]=identity
    try:
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://fixture') as client:
            first=await client.post('/api/v1/enrollments',json={'course_id':str(CID),'student_id':str(OTHER)})
            again=await client.post('/api/v1/enrollments',json={'course_id':str(CID)})
            assert first.status_code==again.status_code==201 and first.json()==again.json()
            assert first.json()['student_id']==str(UID) and first.json()['course_title']=='Math 0'
    finally:app.dependency_overrides.clear();app.dependency_overrides.update(previous)
    with Session(engine) as session:assert session.scalar(select(func.count()).select_from(Enrollment))==1
    cache.assert_awaited_once_with(UID)

@pytest.mark.asyncio
async def test_invalidation_observes_committed_first_enrollment(data,monkeypatch):
    engine,_=data;seed(engine,1);remove_enrollment(engine)
    observations=[]
    async def invalidate(uid):
        with Session(engine) as fresh:observations.append(fresh.scalar(select(func.count()).select_from(Enrollment)))
    monkeypatch.setattr(service,'invalidate_dashboard_cache',invalidate)
    with Session(engine) as session:await service.enroll_student(Database(session),UID,CID)
    assert observations==[1]

@pytest.mark.asyncio
async def test_foreign_key_failure_does_not_become_success(tmp_path,monkeypatch):
    engine=concurrent_engine(tmp_path)
    monkeypatch.setattr(service,'invalidate_dashboard_cache',AsyncMock())
    try:
        with Session(engine) as session:
            with pytest.raises(IntegrityError):await service.enroll_student(Database(session),uuid.UUID(int=99999),CID)
            session.rollback();assert session.scalar(select(func.count()).select_from(Enrollment))==0
    finally:engine.dispose()
