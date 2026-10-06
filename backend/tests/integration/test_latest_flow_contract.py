
"""Focused current grade and completion boundaries, without external services."""
import os,sys,uuid
from pathlib import Path
from types import SimpleNamespace as NS
from unittest.mock import AsyncMock
from datetime import datetime,timezone
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
os.environ.setdefault('DATABASE_URL','postgresql+asyncpg://unused:unused@127.0.0.1/unused')
os.environ.setdefault('REDIS_URL','redis://127.0.0.1:6379/15')
import pytest
from fastapi import HTTPException
from app.modules.module2_content import router as content
from app.modules.module4_experience import router as experience
from app.modules.module5_assessment.services import access_service
from app.shared.exceptions import AuthorizationError
@pytest.mark.asyncio
@pytest.mark.parametrize('grade',[1,4,5])
async def test_student_course_list_uses_profile_grade(monkeypatch,grade):
 listing=AsyncMock(return_value=([],0));monkeypatch.setattr(content.course_service,'list_courses',listing)
 user=NS(grade=grade,has_role=lambda name:name=='Student')
 response=await content.list_courses(user,NS(),1,100,'draft',3)
 assert response.items==[] and listing.call_args.kwargs['grade']==grade
 assert listing.call_args.kwargs['status_filter']=='published'
@pytest.mark.asyncio
async def test_student_without_grade_cannot_list_every_grade(monkeypatch):
 listing=AsyncMock();monkeypatch.setattr(content.course_service,'list_courses',listing)
 response=await content.list_courses(NS(grade=None,has_role=lambda name:name=='Student'),NS(),1,100,None,None)
 assert response.total==0 and response.pages==0
 listing.assert_not_awaited()
@pytest.mark.asyncio
async def test_admin_grade_preview_preserved(monkeypatch):
 listing=AsyncMock(return_value=([],0));monkeypatch.setattr(content.course_service,'list_courses',listing)
 await content.list_courses(NS(grade=4,has_role=lambda name:name in ['Student','Admin']),NS(),1,100,'draft',5)
 assert listing.call_args.kwargs['grade']==5 and listing.call_args.kwargs['status_filter']=='draft'
@pytest.mark.asyncio
async def test_denied_completion_does_not_write(monkeypatch):
 access=AsyncMock(side_effect=HTTPException(403,'Denied'));persist=AsyncMock()
 monkeypatch.setattr(access_service,'require_target_access',access)
 monkeypatch.setattr(experience.progress_service,'mark_lesson_complete',persist)
 with pytest.raises(HTTPException):
  await experience.complete_lesson(uuid.uuid4(),NS(time_spent_seconds=0),NS(id=uuid.uuid4(),has_role=lambda name:name=='Student'),NS())
 persist.assert_not_awaited()
 assert access.call_args.kwargs['student_mode'] is True
@pytest.mark.asyncio
async def test_completion_authorized_before_persist(monkeypatch):
 calls=[]
 async def access(*args,**kwargs):calls.append('authorize')
 async def persist(**kwargs):calls.append('persist');return NS(completed_at=datetime.now(timezone.utc))
 monkeypatch.setattr(access_service,'require_target_access',access)
 monkeypatch.setattr(experience.progress_service,'mark_lesson_complete',persist)
 lid=uuid.uuid4()
 result=await experience.complete_lesson(lid,NS(time_spent_seconds=0),NS(id=uuid.uuid4(),has_role=lambda name:name=='Student'),NS())
 assert calls==['authorize','persist'] and result.lesson_id==lid
@pytest.mark.asyncio
async def test_nonstudent_cannot_complete(monkeypatch):
 persist=AsyncMock();monkeypatch.setattr(experience.progress_service,'mark_lesson_complete',persist)
 with pytest.raises(AuthorizationError):
  await experience.complete_lesson(uuid.uuid4(),NS(time_spent_seconds=0),NS(has_role=lambda name:name=='Admin'),NS())
 persist.assert_not_awaited()


def test_registration_preserves_password_whitespace_for_login():
    from app.modules.module1_auth.schemas import RegisterRequest, LoginRequest
    password = " StrongPassword1! "
    registration = RegisterRequest(email="signup-check@example.com", first_name="Check", last_name="User", password=password)
    login = LoginRequest(email=registration.email, password=password)
    assert registration.password == password == login.password


def test_registration_still_rejects_weak_password():
    import pytest
    from pydantic import ValidationError
    from app.modules.module1_auth.schemas import RegisterRequest
    with pytest.raises(ValidationError):
        RegisterRequest(email="signup-check@example.com", first_name="Check", last_name="User", password="alllowercase1!")


@pytest.mark.parametrize('texts,correct,valid',[
    (['2/3','3/4','4/8','1/2'],3,False),
    (['2/3','3/4','3/8','1/2'],3,True),
    (['2/3','3/4','3/8','1/2'],0,False),
])
def test_equivalent_fraction_options_have_one_true_answer(texts,correct,valid):
    from app.modules.module5_assessment.services.generation_service import validate_generated_mcqs
    data={'questions':[{'prompt':'What is the equivalent fraction of 2/4?', 'question_type':'mcq','max_score':1,'options':[{'id':str(i),'text':value,'is_correct':i==correct} for i,value in enumerate(texts)]}]}
    if valid: validate_generated_mcqs(data,1)
    else:
        with pytest.raises(ValueError,match='mathematically correct'): validate_generated_mcqs(data,1)
