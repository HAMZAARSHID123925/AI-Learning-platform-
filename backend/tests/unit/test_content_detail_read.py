"""Isolated detail contract, query count and authorization regressions."""
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock
import pytest
from sqlalchemy import insert, update
from sqlalchemy.orm import Session
from tests.unit.test_dashboard_read import data, seed, Database, UID, OTHER, NOW
from app.modules.module2_content import router
from app.modules.module2_content.models import Course, CourseModule, Lesson, ContentAsset
from app.modules.module2_content.services import course_service, lesson_service
from app.shared.exceptions import PermissionDeniedError, ResourceNotFoundError

CID=uuid.UUID(int=100)
LID=uuid.UUID(int=1000)

def viewer(uid=UID, roles=("Student",)):
    return SimpleNamespace(id=uid, has_role=lambda role:role in roles)

@pytest.mark.asyncio
@pytest.mark.parametrize("roles,owner,draft", [
    (None,False,False), (("Student",),False,False), (("Student",),True,True),
    (("Instructor",),True,False), (("Instructor",),True,True),
    (("Instructor",),False,False), (("Admin",),False,True),
])
async def test_course_exact_legacy_parity_and_bounded_query(data,monkeypatch,roles,owner,draft):
    engine,sql=data;seed(engine,1)
    with engine.begin() as conn:
        conn.execute(insert(CourseModule),dict(id=uuid.UUID(int=999),course_id=CID,title="Empty module",sequence_order=2))
        if draft:conn.execute(update(Course).where(Course.id==CID).values(status="draft"))
        for i in range(2):
            skill=uuid.UUID(int=900+i)
            conn.execute(insert(SkillTaxonomy),dict(id=skill,name="Course skill "+str(i),slug="course-skill-"+str(i)))
            conn.execute(insert(LessonSkill),dict(lesson_id=LID,skill_id=skill))
        conn.execute(insert(ContentAsset),dict(id=uuid.UUID(int=800),lesson_id=LID,asset_type="pdf",original_filename="notes.pdf",storage_key="fixture-not-secret",created_at=NOW))
    user=None if roles is None else viewer(OTHER if owner else UID,roles)
    loader=course_service.get_course_detail
    async def legacy(db,cid,**kwargs):return await course_service.get_course(db,cid)
    monkeypatch.setattr(course_service,"get_course_detail",legacy)
    with Session(engine) as session:old=await router.get_course(CID,user,Database(session))
    monkeypatch.setattr(course_service,"get_course_detail",loader);sql.clear()
    with Session(engine) as session:new=await router.get_course(CID,user,Database(session))
    assert new.model_dump()==old.model_dump()
    assert len(sql)==1 and "content_assets" not in sql[0]
    if roles is None or roles==("Student",):assert "body_markdown" not in sql[0]
    assert new.modules[1].lessons==[]
    assert len(new.modules[0].lessons[0].skill_ids)==2
    staff=roles is not None and ("Admin" in roles or "Instructor" in roles and owner)
    assert len(new.modules[0].lessons)==(4 if staff else 3)
    assert all((l.body_markdown is not None)==staff for l in new.modules[0].lessons)

@pytest.mark.asyncio
@pytest.mark.parametrize("user",[None,viewer(),viewer(UID,("Instructor",))])
async def test_course_draft_access_unchanged(data,user):
    engine,_=data;seed(engine,1)
    with engine.begin() as conn:conn.execute(update(Course).values(status="draft"))
    with Session(engine) as session:
        with pytest.raises(PermissionDeniedError):await router.get_course(CID,user,Database(session))

@pytest.mark.asyncio
async def test_course_missing_and_empty(data):
    engine,sql=data
    with Session(engine) as session:
        with pytest.raises(ResourceNotFoundError):await router.get_course(CID,None,Database(session))
    with engine.begin() as conn:conn.execute(insert(Course),dict(id=CID,instructor_id=OTHER,title="Empty",slug="empty",status="published",grade=4))
    with Session(engine) as session:course=await router.get_course(CID,viewer(),Database(session))
    assert course.modules==[] and course.module_count==0 and course.grade==4




from sqlalchemy import select
from fastapi import HTTPException
from app.modules.module2_content.models import LessonSkill
from app.modules.shared_models.skill_taxonomy import SkillTaxonomy
from app.modules.module4_experience.models import LearningPathState, StudentProgress
from app.modules.module4_experience.services.progress_service import check_lesson_access
from app.shared.exceptions import LessonLockedError

def media_fixture(engine):
    with engine.begin() as conn:
        conn.execute(update(Lesson).where(Lesson.id==LID).values(video_object_key="fixture-video",thumbnail_object_key="fixture-thumbnail",body_markdown="Teaching body **must survive**",duration_seconds=40))
        for i in range(2):
            skill=uuid.UUID(int=900+i)
            conn.execute(insert(SkillTaxonomy),dict(id=skill,name="Skill "+str(i),slug="skill-"+str(i)))
            conn.execute(insert(LessonSkill),dict(lesson_id=LID,skill_id=skill))
            conn.execute(insert(ContentAsset),dict(id=uuid.UUID(int=800+i),lesson_id=LID,asset_type="pdf",original_filename="notes-"+str(i)+".pdf",storage_key="fixture-asset-"+str(i),mime_type="application/pdf",file_size_bytes=42,created_at=NOW))

@pytest.mark.asyncio
@pytest.mark.parametrize("roles,uid",[(('Student',),UID),(('Instructor',),OTHER),(('Admin',),UID),(('Student','Instructor'),OTHER)])
async def test_lesson_legacy_content_media_parity_and_two_queries(data,monkeypatch,roles,uid):
    engine,sql=data;seed(engine,1);media_fixture(engine)
    sign=AsyncMock(return_value="https://example.invalid/private-fixture");monkeypatch.setattr(router,'generate_presigned_url',sign)
    loader=lesson_service.get_lesson_detail
    async def legacy(db,lid,viewer_id):
        lesson=await lesson_service.get_lesson(db,lid)
        state=(await db.execute(select(LearningPathState).where(LearningPathState.student_id==viewer_id,LearningPathState.lesson_id==lid))).scalar_one_or_none()
        owner=(await db.execute(select(Course.instructor_id).join(CourseModule,CourseModule.course_id==Course.id).where(CourseModule.id==lesson.module_id))).scalar()
        return lesson,state,owner
    user=viewer(uid,roles)
    monkeypatch.setattr(lesson_service,'get_lesson_detail',legacy)
    with Session(engine) as session:old=await router.get_lesson(LID,user,Database(session))
    monkeypatch.setattr(lesson_service,'get_lesson_detail',loader);sign.reset_mock();sql.clear()
    with Session(engine) as session:new=await router.get_lesson(LID,user,Database(session))
    assert new.model_dump()==old.model_dump()
    assert len(sql)==2
    assert new.body_markdown=="Teaching body **must survive**" and len(new.skill_ids)==2 and len(new.assets)==2
    assert new.duration_seconds is None  # Existing detail contract default.
    assert sign.await_count==4 and new.video_url and new.thumbnail_url
    assert all(a.presigned_url and a.mime_type=='application/pdf' for a in new.assets)

@pytest.mark.asyncio
@pytest.mark.parametrize("case",['locked','unpublished','unassigned_instructor','dual_role_unassigned'])
async def test_lesson_denied_before_any_media_grant(data,monkeypatch,case):
    engine,_=data;seed(engine,1);media_fixture(engine)
    sign=AsyncMock();monkeypatch.setattr(router,'generate_presigned_url',sign)
    lid=LID;user=viewer()
    if case=='locked':lid=uuid.UUID(int=1001)
    if case=='unpublished':
        with engine.begin() as conn:conn.execute(update(Lesson).where(Lesson.id==LID).values(status='draft'))
    if case=='unassigned_instructor':user=viewer(UID,('Instructor',))
    if case=='dual_role_unassigned':user=viewer(UID,('Student','Instructor'))
    with Session(engine) as session:
        with pytest.raises((LessonLockedError,HTTPException)) as denied:await router.get_lesson(lid,user,Database(session))
    assert isinstance(denied.value,LessonLockedError) or denied.value.status_code==403
    assert sign.await_count==0

@pytest.mark.asyncio
async def test_fresh_gates_scoped_to_viewer_and_staff_bypass(data,monkeypatch):
    engine,_=data;seed(engine,1)
    with engine.begin() as conn:conn.execute(insert(LearningPathState),dict(student_id=UID,lesson_id=LID,state='locked',locked_reason='Current gate'))
    with Session(engine) as session:
        with pytest.raises(LessonLockedError):await router.get_lesson(LID,viewer(),Database(session))
    for user in (viewer(OTHER),viewer(OTHER,('Instructor',)),viewer(UID,('Admin',))):
        with Session(engine) as session:assert (await router.get_lesson(LID,user,Database(session))).id==LID
    with engine.begin() as conn:conn.execute(update(LearningPathState).where(LearningPathState.lesson_id==LID).values(state='in_progress'))
    with Session(engine) as session:assert (await router.get_lesson(LID,viewer(),Database(session))).id==LID

@pytest.mark.asyncio
async def test_completion_does_not_replace_authoritative_gate(data):
    engine,_=data;seed(engine,1)
    with engine.begin() as conn:conn.execute(update(StudentProgress).values(completed=False))
    with Session(engine) as session:assert (await router.get_lesson(LID,viewer(),Database(session))).id==LID
    with engine.begin() as conn:
        conn.execute(update(StudentProgress).values(completed=True))
        conn.execute(insert(LearningPathState),dict(student_id=UID,lesson_id=LID,state='locked'))
    with Session(engine) as session:
        with pytest.raises(LessonLockedError):await router.get_lesson(LID,viewer(),Database(session))

@pytest.mark.asyncio
async def test_gating_original_lookup_and_joined_state_match_and_reject_mismatch(data):
    engine,sql=data;seed(engine,1)
    with Session(engine) as session:
        db=Database(session)
        with pytest.raises(LessonLockedError):await check_lesson_access(db,uuid.UUID(int=1001),viewer())
        sql.clear();await check_lesson_access(db,LID,viewer(),loaded_state=None);assert sql==[]
        mismatch=LearningPathState(student_id=OTHER,lesson_id=LID,state='locked')
        with pytest.raises(ValueError):await check_lesson_access(db,LID,viewer(),loaded_state=mismatch)

@pytest.mark.asyncio
async def test_lesson_missing_static_media_and_sign_failure_fallback(data,monkeypatch):
    engine,_=data;seed(engine,1)
    sign=AsyncMock(side_effect=RuntimeError('Fixture signing unavailable'));monkeypatch.setattr(router,'generate_presigned_url',sign)
    with Session(engine) as session:
        with pytest.raises(ResourceNotFoundError):await router.get_lesson(uuid.UUID(int=99999),viewer(),Database(session))
    with engine.begin() as conn:conn.execute(update(Lesson).where(Lesson.id==LID).values(video_url='/static/uploads/video.mp4',video_object_key='fixture-video',thumbnail_url='https://example.invalid/fallback',thumbnail_object_key='fixture-thumbnail'))
    with Session(engine) as session:result=await router.get_lesson(LID,viewer(),Database(session))
    assert result.video_url=='/static/uploads/video.mp4' and result.thumbnail_url=='https://example.invalid/fallback' and sign.await_count==1



@pytest.mark.asyncio
async def test_saved_course_progress_and_assessment_access_remain_authoritative(data):
    from app.modules.module4_experience.services.progress_service import get_course_progress
    from app.modules.module5_assessment.services.access_service import require_target_access
    engine,_=data;seed(engine,1)
    with Session(engine) as session:
        db=Database(session);progress=await get_course_progress(db,UID,CID)
        assert progress['total_lessons']==3 and progress['completed_lessons']==1
        assert progress['percentage']==33.3 and progress['locked_lessons']==1
        assert progress['latest_submission_id']==uuid.UUID(int=500) and progress['assessment_status']=='in_progress'
        user=viewer();user.grade=3
        assert (await require_target_access(db,user,course_id=CID)).id==CID
        user.grade=4
        with pytest.raises(HTTPException) as denied:await require_target_access(db,user,course_id=CID)
        assert denied.value.status_code==403
        # Public syllabus and lesson detail have no grade rule in the existing
        # policy; grade-restricted assessment delivery is a separate check.
        assert (await router.get_course(CID,user,db)).id==CID
        assert (await router.get_lesson(LID,user,db)).id==LID

@pytest.mark.asyncio
async def test_assessment_student_mode_keeps_dual_role_gating(data):
    engine,_=data;seed(engine,1)
    with Session(engine) as session:
        with pytest.raises(LessonLockedError):
            await check_lesson_access(Database(session),uuid.UUID(int=1001),viewer(UID,('Student','Instructor')),as_student=True)
