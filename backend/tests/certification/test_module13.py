"""Admin and privileged-content boundary tests; no external providers."""
import os,sys,uuid
from pathlib import Path
from types import SimpleNamespace as NS
from unittest.mock import AsyncMock
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
os.environ.setdefault('DATABASE_URL','postgresql+asyncpg://unused:unused@127.0.0.1/unused');os.environ.setdefault('REDIS_URL','redis://127.0.0.1:6379/15')
import pytest
from app.modules.module2_content import router as content
from app.modules.module1_auth.services import user_service
from app.shared.exceptions import PermissionDeniedError

@pytest.mark.asyncio
async def test_foreign_teacher_upload_rejected_before_storage(monkeypatch):
 actor=NS(id=uuid.uuid4(),has_role=lambda name:name=='Instructor')
 lesson=NS(module=NS(course_id=uuid.uuid4()));course=NS(instructor_id=uuid.uuid4())
 monkeypatch.setattr(content.lesson_service,'get_lesson',AsyncMock(return_value=lesson));monkeypatch.setattr(content.course_service,'get_course',AsyncMock(return_value=course))
 upload=AsyncMock(side_effect=AssertionError('Storage reached before ownership check'));monkeypatch.setattr(content.asset_service,'upload_lesson_asset',upload)
 with pytest.raises(PermissionDeniedError):await content.upload_asset(uuid.uuid4(),'pdf',NS(),actor,NS())
 upload.assert_not_called()

@pytest.mark.asyncio
async def test_admin_grade_update_is_persisted(monkeypatch):
 user=NS(grade=4,id=uuid.uuid4());monkeypatch.setattr(user_service,'get_user_by_id',AsyncMock(return_value=user))
 actual=await user_service.update_user(NS(),user.id,grade=3)
 assert actual.grade==3

@pytest.mark.asyncio
async def test_foreign_teacher_cannot_provision_room_for_admin_course(monkeypatch):
 from datetime import datetime,timezone,timedelta
 from app.modules.module3_live.services import session_service as live
 from app.shared.exceptions import AuthorizationError
 course=NS(id=uuid.uuid4(),instructor_id=uuid.uuid4())
 provider=NS(create_room=AsyncMock(side_effect=AssertionError('Room provisioning reached before ownership')))
 monkeypatch.setattr(live,'get_video_provider',lambda:provider)
 with pytest.raises(AuthorizationError):await live.create_live_session(NS(get=AsyncMock(return_value=course)),uuid.uuid4(),course.id,'Controlled scope',None,datetime.now(timezone.utc)+timedelta(hours=1))
 provider.create_room.assert_not_called()

@pytest.mark.asyncio
async def test_admin_with_student_role_keeps_explicit_global_course_filter(monkeypatch):
 listing=AsyncMock(return_value=([],0));monkeypatch.setattr(content.course_service,'list_courses',listing)
 actor=NS(id=uuid.uuid4(),has_role=lambda name:name in ['Admin','Student'])
 await content.list_courses(actor,NS(),1,20,'draft',None)
 assert listing.call_args.kwargs['status_filter']=='draft'
 assert listing.call_args.kwargs['instructor_id'] is None

@pytest.mark.asyncio
async def test_admin_student_can_preview_unpublished_lesson(monkeypatch):
 from datetime import datetime,timezone
 from app.modules.module2_content.models import LessonStatus
 now=datetime.now(timezone.utc);lid=uuid.uuid4()
 lesson=NS(id=lid,module_id=uuid.uuid4(),status=LessonStatus.draft,lesson_skills=[],assets=[],video_url=None,thumbnail_url=None,title='Controlled draft',slug='controlled-draft',content_version=1,sequence_order=1,estimated_minutes=15,published_at=None,body_markdown='Private draft',created_at=now,updated_at=now)
 monkeypatch.setattr(content.lesson_service,'get_lesson',AsyncMock(return_value=lesson))
 actor=NS(id=uuid.uuid4(),has_role=lambda name:name in ['Admin','Student'])
 response=await content.get_lesson(lid,actor,NS())
 assert response.id==lid and response.status=='draft'

@pytest.mark.asyncio
async def test_admin_assessment_generation_uses_validated_ten_question_path(monkeypatch):
 from app.modules.module5_assessment import router as assessment
 from app.modules.module5_assessment.services import access_service
 from app.modules.module5_assessment.schemas import AssessmentGenerateRequest
 guard=AsyncMock();monkeypatch.setattr(access_service,'require_target_access',guard)
 test=NS(id=uuid.uuid4(),title='Validated assessment',questions=[NS() for _ in range(10)],is_focused_retest=False)
 generate=AsyncMock(return_value=test);monkeypatch.setattr(assessment,'generate_lesson_assessment',generate)
 body=AssessmentGenerateRequest(lesson_id=uuid.uuid4());actor=NS(id=uuid.uuid4(),has_role=lambda name:name=='Admin')
 result=await assessment.generate_assessment_endpoint(body,NS(),actor)
 assert result['question_count']==10 and result['test_id']==test.id
 assert guard.call_args.kwargs['generation'] is True
 assert generate.call_args.kwargs['num_questions']==10
