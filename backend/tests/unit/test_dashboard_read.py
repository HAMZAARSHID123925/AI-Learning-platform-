"""Dashboard SQL, parity and cache tests on isolated fixtures, never live rows."""
import json
import types
import uuid
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock
import pytest
from sqlalchemy import MetaData, create_engine, event, update, insert
from sqlalchemy.orm import Session
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB, ARRAY, INET, UUID as UUIDType
import app.main
from app.database import Base
from app.modules.module1_auth.models import User
from app.modules.module2_content.models import Course, CourseModule, Lesson, LessonStatus
from app.modules.module4_experience.models import Enrollment, StudentProgress, LearningPathState, PathState
from app.modules.module5_assessment.models import Test as Assessment, Submission
from app.modules.module4_experience.services import dashboard_service as dashboard

@compiles(JSONB, 'sqlite')
def sqlite_json(*args, **kw): return 'JSON'
@compiles(ARRAY, 'sqlite')
def sqlite_array(*args, **kw): return 'JSON'
@compiles(UUIDType, 'sqlite')
def sqlite_uuid(*args, **kw): return 'CHAR(32)'
@compiles(INET, 'sqlite')
def sqlite_inet(*args, **kw): return 'TEXT'

UID=uuid.UUID(int=1)
OTHER=uuid.UUID(int=2)
NOW=datetime(2026, 1, 1, tzinfo=timezone.utc)

class Database:
    def __init__(self, session): self.session=session
    async def execute(self, query): return self.session.execute(query)
    async def get(self, model, key): return self.session.get(model,key)
    async def commit(self): self.session.commit()
    async def refresh(self, value): self.session.refresh(value)
    async def rollback(self): self.session.rollback()
    def add(self, value): self.session.add(value)

@pytest.fixture
def data():
    engine=create_engine('sqlite://')
    metadata=MetaData()
    for table in Base.metadata.sorted_tables:
        copy=table.to_metadata(metadata)
        for column in copy.c: column.server_default=None
    metadata.create_all(engine)
    with engine.begin() as conn:
        for uid in (UID, OTHER):
            conn.execute(insert(User),dict(id=uid,email=str(uid.int)+'@example.invalid',password_hash='unused fixture',first_name='Fixture',last_name='Student',grade=3))
    sql=[]
    event.listen(engine,'before_cursor_execute',lambda c,cu,statement,*_:sql.append(statement))
    yield engine,sql
    engine.dispose()


def seed(engine,count):
    with engine.begin() as conn:
        for n in range(count):
            cid=uuid.UUID(int=100+n);mid=uuid.UUID(int=200+n)
            conn.execute(insert(Course),dict(id=cid,instructor_id=OTHER,title='Math '+str(n),slug='math-'+str(n),grade=3,status='published',created_at=NOW+timedelta(days=n)))
            conn.execute(insert(CourseModule),dict(id=mid,course_id=cid,title='Module',sequence_order=1))
            conn.execute(insert(Enrollment),dict(student_id=UID,course_id=cid,enrolled_at=NOW+timedelta(days=n)))
            for j in range(4):
                lid=uuid.UUID(int=1000+n*10+j)
                conn.execute(insert(Lesson),dict(id=lid,module_id=mid,title='Lesson '+str(j),slug=str(lid),sequence_order=j,status='draft' if j==3 else 'published',estimated_minutes=10,body_markdown='Must not load this body'))
                if j==0:conn.execute(insert(StudentProgress),dict(student_id=UID,lesson_id=lid,completed=True))
                if j==1:conn.execute(insert(LearningPathState),dict(student_id=UID,lesson_id=lid,state='locked'))
            tid=uuid.UUID(int=300+n)
            conn.execute(insert(Assessment),dict(id=tid,course_id=cid,title='Fixture'))
            conn.execute(insert(Submission),dict(id=uuid.UUID(int=400+n),test_id=tid,student_id=UID,status='graded',submitted_at=NOW))
            conn.execute(insert(Submission),dict(id=uuid.UUID(int=500+n),test_id=tid,student_id=UID,status='grading',attempt_number=2,submitted_at=NOW+timedelta(days=1)))


def stable(value):
    result=value.model_dump(mode='json');result.pop('cached_at',None);result.pop('course_cards',None);return result

@pytest.mark.asyncio
@pytest.mark.parametrize('count',[0,1,6])
async def test_set_reads_preserve_fixture_semantics_and_do_not_grow_per_course(data,count):
    engine,sql=data;seed(engine,count)
    sql.clear()
    with Session(engine) as session: new=await dashboard.get_aggregated_student_dashboard(Database(session),UID,use_cache=False)
    assert [c.course_id for c in new.enrolled_courses]==[uuid.UUID(int=100+n) for n in reversed(range(count))]
    assert new.overall_completion_percentage==(33.3 if count else 0.0)
    assert new.skill_mastery_radar==[] and new.active_remediations==[] and new.unread_notifications_count==0
    if not count:assert new.enrolled_courses==[] and new.next_recommended_lesson is None and new.course_cards==[]
    assert len(sql)<=11
    assert all('body_markdown' not in statement and 'content_assets' not in statement for statement in sql)
    if count:
        assert new.enrolled_courses[0].course_id==uuid.UUID(int=100+count-1)
        assert new.enrolled_courses[0].completed_lessons==1
        assert new.enrolled_courses[0].locked_lessons==1
        assert new.enrolled_courses[0].assessment_status=='in_progress'
        assert new.next_recommended_lesson.lesson_id==uuid.UUID(int=1000+(count-1)*10+2)
        assert len(new.course_cards[0].lessons)==3
        assert new.course_cards[0].lessons[1].locked

@pytest.mark.asyncio
async def test_grade_catalog_and_empty_enrollment_semantics(data):
    engine,_=data;seed(engine,2)
    with engine.begin() as conn:
        conn.execute(update(Course).where(Course.id==uuid.UUID(int=101)).values(grade=4))
        conn.execute(update(Enrollment).values(status='inactive'))
    with Session(engine) as session: result=await dashboard.get_aggregated_student_dashboard(Database(session),UID,use_cache=False)
    assert result.enrolled_courses==[] and result.next_recommended_lesson is None
    assert [card.id for card in result.course_cards]==[uuid.UUID(int=100)]

@pytest.mark.asyncio
async def test_instructor_scope_preserved_and_never_caches(data,monkeypatch):
    engine,_=data;seed(engine,1)
    monkeypatch.setattr(dashboard,'get_redis_client',lambda:pytest.fail('Staff view must not cache'))
    with Session(engine) as session:
        result=await dashboard.get_aggregated_student_dashboard(Database(session),UID,instructor_id=OTHER)
    assert len(result.enrolled_courses)==1 and result.course_cards==[] and result.unread_notifications_count==0
    from app.shared.exceptions import AuthorizationError
    with Session(engine) as session:
        with pytest.raises(AuthorizationError):await dashboard.get_aggregated_student_dashboard(Database(session),UID,instructor_id=uuid.UUID(int=999))

class Cache:
    def __init__(self):self.values={};self.writes=0
    async def mget(self,*keys):return [self.values.get(k) for k in keys]
    async def eval(self,script,num,key,revision,*args):
        if "INCR" in script:
            self.values[revision]=str(int(self.values.get(revision,'0'))+1);self.values.pop(key,None);return 1
        if self.values.get(revision,'0')==args[0]:self.values[key]=args[2];self.writes+=1;return 1
        return 0

@pytest.mark.asyncio
@pytest.mark.parametrize('mutation',['completion','assessment','grade','enrollment','gating'])
async def test_cache_invalidation_scoping_and_refresh(data,monkeypatch,mutation):
    engine,sql=data;seed(engine,1);cache=Cache();monkeypatch.setattr(dashboard,'get_redis_client',lambda:cache)
    with Session(engine) as session:before=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    sql.clear()
    with Session(engine) as session:hit=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    assert stable(hit)==stable(before) and len(sql)==1
    with Session(engine) as session:other=await dashboard.get_aggregated_student_dashboard(Database(session),OTHER)
    assert other.student_id==OTHER and other.enrolled_courses==[]
    with engine.begin() as conn:
        if mutation=='completion':conn.execute(update(StudentProgress).values(completed=False))
        if mutation=='assessment':conn.execute(update(Submission).where(Submission.id==uuid.UUID(int=500)).values(status='graded'))
        if mutation=='grade':conn.execute(update(User).where(User.id==UID).values(grade=4))
        if mutation=='enrollment':conn.execute(update(Enrollment).values(status='inactive'))
        if mutation=='gating':conn.execute(update(LearningPathState).values(state='unlocked'))
    if mutation!='grade':await dashboard.invalidate_dashboard_cache(UID)
    with Session(engine) as session:after=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    if mutation=='grade':assert after.course_cards==[]
    else:assert stable(after)!=stable(before)
    assert cache.values.get(dashboard.get_dashboard_cache_key(OTHER))

@pytest.mark.asyncio
async def test_concurrent_invalidation_cannot_repopulate_stale_cache(data,monkeypatch):
    engine,_=data;seed(engine,1);cache=Cache();monkeypatch.setattr(dashboard,'get_redis_client',lambda:cache)
    class MutatingDatabase(Database):
        async def execute(self,query):
            result=await super().execute(query)
            if 'FROM notifications' in str(query):await dashboard.invalidate_dashboard_cache(UID)
            return result
    with Session(engine) as session:await dashboard.get_aggregated_student_dashboard(MutatingDatabase(session),UID)
    assert dashboard.get_dashboard_cache_key(UID) not in cache.values and cache.writes==0

@pytest.mark.asyncio
async def test_media_signed_after_cache_and_never_cached_as_signed_url(data,monkeypatch):
    from app.shared import s3_client
    engine,_=data;seed(engine,1);cache=Cache();monkeypatch.setattr(dashboard,'get_redis_client',lambda:cache)
    sign=AsyncMock(side_effect=['https://example.invalid/first','https://example.invalid/second']);monkeypatch.setattr(s3_client,'generate_presigned_url',sign)
    with engine.begin() as conn:conn.execute(update(Course).values(thumbnail_object_key='fixture/image'))
    with Session(engine) as session:first=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    with Session(engine) as session:second=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    assert first.course_cards[0].thumbnail_url!=second.course_cards[0].thumbnail_url
    assert 'example.invalid' not in cache.values[dashboard.get_dashboard_cache_key(UID)]
    assert 'thumbnail_object_key' not in second.model_dump()['course_cards'][0]

@pytest.mark.asyncio
async def test_actual_remediation_completion_invalidates_after_commit(data,monkeypatch):
    from app.modules.module6_adaptive.models import RemediationPlan, WeaknessFlag
    from app.modules.shared_models.skill_taxonomy import SkillTaxonomy
    from app.modules.module6_adaptive.services.retest_service import complete_remedial_study_and_trigger_retest
    engine,_=data;seed(engine,1);cache=Cache();monkeypatch.setattr(dashboard,'get_redis_client',lambda:cache)
    skill=uuid.UUID(int=700);flag=uuid.UUID(int=701);plan=uuid.UUID(int=702)
    with engine.begin() as conn:
        conn.execute(insert(SkillTaxonomy),dict(id=skill,name='Fixture skill',slug='fixture-skill'))
        conn.execute(insert(WeaknessFlag),dict(id=flag,student_id=UID,course_id=uuid.UUID(int=100),skill_id=skill,submission_id=uuid.UUID(int=400),score_at_flag=0.2))
        conn.execute(insert(RemediationPlan),dict(id=plan,student_id=UID,weakness_flag_id=flag,status='active',remedial_course_markdown='Fixture study',retest_attempt_count=3))
    with Session(engine) as session:old=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    with Session(engine) as session:await complete_remedial_study_and_trigger_retest(Database(session),UID,plan)
    assert dashboard.get_dashboard_cache_key(UID) not in cache.values
    with Session(engine) as session:new=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    assert not old.active_remediations[0].study_completed and new.active_remediations[0].study_completed

@pytest.mark.asyncio
async def test_actual_unlock_invalidates_after_commit(data,monkeypatch):
    from app.modules.module6_adaptive.services.path_gating_service import unlock_lessons_if_clear
    from app.modules.shared_models.skill_taxonomy import SkillTaxonomy
    from app.modules.module2_content.models import LessonSkill
    engine,_=data;seed(engine,1);cache=Cache();monkeypatch.setattr(dashboard,'get_redis_client',lambda:cache)
    skill=uuid.UUID(int=700)
    with engine.begin() as conn:
        conn.execute(insert(SkillTaxonomy),dict(id=skill,name='Fixture skill',slug='fixture-skill'))
        conn.execute(insert(LessonSkill),dict(lesson_id=uuid.UUID(int=1001),skill_id=skill))
    with Session(engine) as session:old=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    with Session(engine) as session:assert await unlock_lessons_if_clear(Database(session),UID,skill)==1
    with Session(engine) as session:new=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    assert old.enrolled_courses[0].locked_lessons==1 and new.enrolled_courses[0].locked_lessons==0

@pytest.mark.asyncio
async def test_cache_failure_falls_back_to_authoritative_display(data,monkeypatch):
    engine,_=data;seed(engine,1)
    def unavailable():raise RuntimeError('Controlled cache outage')
    monkeypatch.setattr(dashboard,'get_redis_client',unavailable)
    with Session(engine) as session:result=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    assert len(result.enrolled_courses)==1

@pytest.mark.asyncio
async def test_actual_grading_invalidates_display_cache(data,monkeypatch):
    from app.modules.module5_assessment.services import grading_service
    engine,_=data;seed(engine,1);cache=Cache();monkeypatch.setattr(dashboard,'get_redis_client',lambda:cache)
    monkeypatch.setattr(grading_service,'publish_graded_outbox',AsyncMock())
    with Session(engine) as session:old=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    with Session(engine,expire_on_commit=False) as session:await grading_service.grade_submission(uuid.UUID(int=500),Database(session))
    with Session(engine) as session:new=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    assert old.enrolled_courses[0].assessment_status=='in_progress' and new.enrolled_courses[0].assessment_status=='completed'

@pytest.mark.asyncio
async def test_actual_auto_enrollment_invalidates_display_cache(data,monkeypatch):
    from app.modules.module5_assessment.services.access_service import require_target_access
    from sqlalchemy import delete
    engine,_=data;seed(engine,1);cache=Cache();monkeypatch.setattr(dashboard,'get_redis_client',lambda:cache)
    with engine.begin() as conn:conn.execute(delete(Enrollment))
    with Session(engine) as session:old=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    user=types.SimpleNamespace(id=UID,grade=3,has_role=lambda name:name=='Student')
    with Session(engine,expire_on_commit=False) as session:await require_target_access(Database(session),user,course_id=uuid.UUID(int=100))
    with Session(engine) as session:new=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    assert old.enrolled_courses==[] and len(new.enrolled_courses)==1

@pytest.mark.asyncio
async def test_dashboard_cache_never_authorizes_locked_lesson(data,monkeypatch):
    from app.modules.module5_assessment.services.access_service import require_target_access
    from app.shared.exceptions import LessonLockedError
    engine,_=data;seed(engine,1);cache=Cache();monkeypatch.setattr(dashboard,'get_redis_client',lambda:cache)
    with Session(engine) as session:await dashboard.get_aggregated_student_dashboard(Database(session),UID)
    key=dashboard.get_dashboard_cache_key(UID);payload=json.loads(cache.values[key]);payload['payload']['course_cards'][0]['lessons'][1]['locked']=False;cache.values[key]=json.dumps(payload)
    user=types.SimpleNamespace(id=UID,grade=3,has_role=lambda name:name=='Student')
    with Session(engine) as session:
        cached=await dashboard.get_aggregated_student_dashboard(Database(session),UID)
        assert not cached.course_cards[0].lessons[1].locked
        with pytest.raises(LessonLockedError):await require_target_access(Database(session),user,lesson_id=uuid.UUID(int=1001))

@pytest.mark.asyncio
async def test_latest_lesson_submission_is_ranked_with_course_submissions(data):
    engine,_=data;seed(engine,1)
    with engine.begin() as conn:
        conn.execute(insert(Assessment),dict(id=uuid.UUID(int=900),lesson_id=uuid.UUID(int=1002),title='Lesson assessment'))
        conn.execute(insert(Submission),dict(id=uuid.UUID(int=901),test_id=uuid.UUID(int=900),student_id=UID,status='graded',submitted_at=NOW+timedelta(days=2)))
    with Session(engine) as session:result=await dashboard.get_aggregated_student_dashboard(Database(session),UID,use_cache=False)
    assert result.enrolled_courses[0].latest_submission_id==uuid.UUID(int=901)
    assert result.enrolled_courses[0].assessment_status=='completed'

@pytest.mark.asyncio
async def test_unselected_grade_retains_existing_dashboard_grade_five_fallback(data):
    engine,_=data;seed(engine,1)
    with engine.begin() as conn:
        conn.execute(update(User).where(User.id==UID).values(grade=None))
        conn.execute(update(Course).values(grade=5))
    with Session(engine) as session:result=await dashboard.get_aggregated_student_dashboard(Database(session),UID,use_cache=False)
    assert [card.grade for card in result.course_cards]==[5]
