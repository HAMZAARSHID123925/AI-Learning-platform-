"""Boundary regressions; no live DB, provider, or destructive fixtures."""
import os, sys, uuid, json
from pathlib import Path
from types import SimpleNamespace as NS
from unittest.mock import AsyncMock
from datetime import datetime, timezone
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
os.environ.setdefault('DATABASE_URL','postgresql+asyncpg://unused:unused@127.0.0.1/unused')
os.environ.setdefault('REDIS_URL','redis://127.0.0.1:6379/15')
import pytest
from app.main import app
from app.modules.module6_adaptive.models import PlanStatus
from app.modules.module6_adaptive.services import retest_service as retests
from app.shared.exceptions import BusinessRuleError

def db_for(plan):
 return NS(execute=AsyncMock(return_value=NS(scalar_one_or_none=lambda:plan)),get=AsyncMock(),commit=AsyncMock(),refresh=AsyncMock(),add=lambda value:None)

def plan_fixture(**changes):
 plan=NS(id=uuid.uuid4(),student_id=uuid.uuid4(),status=PlanStatus.active,study_completed=False,study_completed_at=None,focused_retest_id=None,instructor_escalated=False,retest_attempt_count=0,remedial_course_markdown='A genuine written study guide',weakness_flag=NS(submission_id=uuid.uuid4(),skill_id=uuid.uuid4()))
 for k,v in changes.items():setattr(plan,k,v)
 return plan

@pytest.mark.asyncio
async def test_duplicate_completion_uses_persisted_owned_reference(monkeypatch):
 target=uuid.uuid4();plan=plan_fixture(study_completed=True,focused_retest_id=target,retest_attempt_count=1)
 db=db_for(plan);db.get.return_value=NS(id=target)
 generator=AsyncMock();monkeypatch.setattr(retests,'generate_lesson_assessment',generator)
 actual,test=await retests.complete_remedial_study_and_trigger_retest(db,plan.student_id,plan.id)
 assert actual is plan and test.id==target and plan.retest_attempt_count==1
 generator.assert_not_called()

@pytest.mark.asyncio
async def test_attempt_limit_does_not_consume_an_extra_attempt(monkeypatch):
 plan=plan_fixture(retest_attempt_count=3)
 db=db_for(plan);generator=AsyncMock();monkeypatch.setattr(retests,'generate_lesson_assessment',generator)
 actual,test=await retests.complete_remedial_study_and_trigger_retest(db,plan.student_id,plan.id)
 assert test is None and actual.instructor_escalated and actual.retest_attempt_count==3 and actual.status==PlanStatus.escalated
 generator.assert_not_called()

@pytest.mark.asyncio
async def test_course_origin_uses_a_published_lesson_with_target_skill(monkeypatch):
 plan=plan_fixture();lesson_id=uuid.uuid4();course_id=uuid.uuid4()
 db=db_for(plan)
 db.execute.side_effect=[NS(scalar_one_or_none=lambda:plan),NS(scalar_one_or_none=lambda:lesson_id)]
 db.get.side_effect=[NS(test_id=uuid.uuid4()),NS(lesson_id=None,course_id=course_id)]
 generator=AsyncMock(return_value=NS(id=uuid.uuid4()));monkeypatch.setattr(retests,'generate_lesson_assessment',generator)
 await retests.complete_remedial_study_and_trigger_retest(db,plan.student_id,plan.id)
 assert generator.call_args.kwargs['lesson_id']==lesson_id
 assert generator.call_args.kwargs['skill_filter']==[plan.weakness_flag.skill_id]
 assert generator.call_args.kwargs['commit'] is False
 assert plan.study_completed and plan.retest_attempt_count==1 and plan.focused_retest_id==generator.return_value.id

@pytest.mark.asyncio
async def test_missing_document_and_broken_handoff_never_generate(monkeypatch):
 generator=AsyncMock();monkeypatch.setattr(retests,'generate_lesson_assessment',generator)
 for plan in (plan_fixture(remedial_course_markdown=''),plan_fixture(study_completed=True)):
  with pytest.raises(BusinessRuleError):await retests.complete_remedial_study_and_trigger_retest(db_for(plan),plan.student_id,plan.id)
 generator.assert_not_called()

@pytest.mark.asyncio
async def test_malformed_remediation_is_not_replaced_with_fake_content(monkeypatch):
 from app.modules.module6_adaptive.services import remedial_course_service as service
 student=uuid.uuid4();flag=NS(id=uuid.uuid4(),student_id=student,skill_id=uuid.uuid4(),score_at_flag=0,threshold=.6)
 submission=NS(student_id=student,id=uuid.uuid4(),test_id=uuid.uuid4(),answers={})
 db=NS(execute=AsyncMock(side_effect=[NS(),NS(scalar_one_or_none=lambda:None),NS(scalars=lambda:NS(all=lambda:[]))]),get=AsyncMock(return_value=NS(name='Hardware',description='CPU and RAM')),commit=AsyncMock(),add=AsyncMock())
 monkeypatch.setattr(service,'generate_llm_completion',AsyncMock(return_value='{not JSON'))
 with pytest.raises(BusinessRuleError):await service.generate_student_remedial_course(db,student,flag,submission)
 db.add.assert_not_called();db.commit.assert_not_called()

@pytest.mark.asyncio
async def test_course_owner_preview_is_allowed_but_other_instructor_is_denied():
 import httpx
 from app.database import get_db
 from app.shared.dependencies import get_current_user
 from app.modules.module1_auth.models import User
 from app.modules.module2_content.models import Lesson, CourseModule, Course
 from app.modules.module5_assessment.models import Submission, Test
 from app.modules.module6_adaptive.models import RemediationPlan, WeaknessFlag
 actor=NS(id=uuid.uuid4(),has_role=lambda name:name=='Instructor',user_roles=[NS(role=NS(name='Instructor'))])
 owner=actor.id;student=uuid.uuid4();pid=uuid.uuid4();fid=uuid.uuid4()
 plan=NS(id=pid,student_id=student,weakness_flag_id=fid,status=PlanStatus.active,remedial_course_title='Study guide',remedial_course_markdown='A study document',study_completed=False,study_completed_at=None,retest_attempt_count=0,instructor_escalated=False,created_at=datetime.now(timezone.utc),completed_at=None)
 records={RemediationPlan:plan,WeaknessFlag:NS(submission_id=uuid.uuid4()),Submission:NS(test_id=uuid.uuid4()),Test:NS(lesson_id=uuid.uuid4(),course_id=None),Lesson:NS(module_id=uuid.uuid4()),CourseModule:NS(course_id=uuid.uuid4()),Course:NS(id=uuid.uuid4(),instructor_id=owner)}
 db=NS(get=AsyncMock(side_effect=lambda model,key:records[model]))
 async def auth():return actor
 async def database():yield db
 original=app.dependency_overrides.copy()
 app.dependency_overrides[get_current_user]=auth;app.dependency_overrides[get_db]=database
 try:
  async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://test') as client:
   response=await client.get(f'/api/v1/remediation-plans/{pid}')
   assert response.status_code==200
   actor.id=uuid.uuid4()
   response=await client.get(f'/api/v1/remediation-plans/{pid}')
   assert response.status_code==403
   actor.id=plan.student_id
   actor.has_role=lambda name:name in ('Student','Instructor')
   actor.user_roles=[NS(role=NS(name='Student')),NS(role=NS(name='Instructor'))]
   response=await client.get(f'/api/v1/remediation-plans/{pid}')
   assert response.status_code==200
 finally:
  app.dependency_overrides.clear();app.dependency_overrides.update(original)

@pytest.mark.asyncio
async def test_unhandled_errors_never_expose_internal_details():
 import httpx
 from app.main import create_app
 isolated=create_app()
 @isolated.get('/test-internal-error')
 async def broken():raise RuntimeError('PRIVATE_INTERNAL_DETAIL')
 async with httpx.AsyncClient(transport=httpx.ASGITransport(app=isolated,raise_app_exceptions=False),base_url='http://test') as client:
  response=await client.get('/test-internal-error')
  assert response.status_code==500 and 'PRIVATE_INTERNAL_DETAIL' not in response.text

@pytest.mark.asyncio
async def test_mixed_role_learner_access_does_not_grant_private_focus(monkeypatch):
 from fastapi import HTTPException
 from app.modules.module2_content.models import CourseStatus
 from app.modules.module5_assessment.services.access_service import require_target_access, require_test_access
 user=NS(id=uuid.uuid4(),grade=4,has_role=lambda name:name in ('Student','Instructor'))
 course=NS(id=uuid.uuid4(),instructor_id=uuid.uuid4(),status=CourseStatus.published,grade=4)
 db=NS(get=AsyncMock(return_value=course),execute=AsyncMock(return_value=NS(scalar_one_or_none=lambda:uuid.uuid4())))
 assert await require_target_access(db,user,course_id=course.id) is course
 db.execute.side_effect=[NS(scalar_one_or_none=lambda:uuid.uuid4()),NS(scalar_one_or_none=lambda:None)]
 test=NS(lesson_id=None,course_id=course.id,id=uuid.uuid4(),is_focused_retest=True)
 with pytest.raises(HTTPException) as error:await require_test_access(db,user,test)
 assert error.value.status_code==403

@pytest.mark.asyncio
async def test_admin_student_cannot_use_preview_privilege_to_submit_unenrolled():
 from fastapi import HTTPException
 from app.modules.module2_content.models import CourseStatus
 from app.modules.module5_assessment.services.access_service import require_target_access
 user=NS(id=uuid.uuid4(),grade=4,has_role=lambda name:name in ('Student','Admin'))
 course=NS(id=uuid.uuid4(),instructor_id=uuid.uuid4(),status=CourseStatus.published,grade=4)
 db=NS(get=AsyncMock(return_value=course),execute=AsyncMock(return_value=NS(scalar_one_or_none=lambda:None)))
 assert await require_target_access(db,user,course_id=course.id) is course
 with pytest.raises(HTTPException):await require_target_access(db,user,course_id=course.id,student_mode=True)

@pytest.mark.asyncio
async def test_learner_mode_cannot_bypass_lesson_gate_with_instructor_role():
 from app.modules.module4_experience.models import PathState
 from app.modules.module4_experience.services.progress_service import check_lesson_access
 from app.shared.exceptions import LessonLockedError
 user=NS(id=uuid.uuid4(),has_role=lambda name:name in ('Student','Instructor'))
 db=NS(execute=AsyncMock(return_value=NS(scalar_one_or_none=lambda:NS(state=PathState.locked,locked_reason='A prerequisite is weak'))))
 with pytest.raises(LessonLockedError):await check_lesson_access(db,uuid.uuid4(),user,as_student=True)
