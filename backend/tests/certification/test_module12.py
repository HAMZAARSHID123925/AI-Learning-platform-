"""Teacher dashboard scope and cache boundary regressions, no external services."""
import os,sys,uuid
from pathlib import Path
from types import SimpleNamespace as NS
from unittest.mock import AsyncMock
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
os.environ.setdefault('DATABASE_URL','postgresql+asyncpg://unused:unused@127.0.0.1/unused')
os.environ.setdefault('REDIS_URL','redis://127.0.0.1:6379/15')
import pytest
from app.modules.module4_experience.services import dashboard_service as d
from app.modules.module4_experience.router import get_student_dashboard_for_staff
from app.shared.exceptions import AuthorizationError

@pytest.mark.asyncio
async def test_unassigned_instructor_denied_before_private_queries_or_cache(monkeypatch):
 redis=NS(get=AsyncMock(),setex=AsyncMock());monkeypatch.setattr(d,'get_redis_client',lambda:redis)
 db=NS(get=AsyncMock(return_value=NS(first_name='Controlled',last_name='Student')),execute=AsyncMock(return_value=NS(scalars=lambda:NS(all=lambda:[]))))
 with pytest.raises(AuthorizationError):await d.get_aggregated_student_dashboard(db,uuid.uuid4(),instructor_id=uuid.uuid4())
 assert db.execute.await_count==1
 redis.get.assert_not_called();redis.setex.assert_not_called()

@pytest.mark.asyncio
@pytest.mark.parametrize('admin',[False,True])
async def test_staff_route_passes_explicit_course_scope(monkeypatch,admin):
 uid=uuid.uuid4();sid=uuid.uuid4();aggregate=AsyncMock(return_value=NS());monkeypatch.setattr(d,'get_aggregated_student_dashboard',aggregate)
 user=NS(id=uid,has_role=lambda name:name=='Instructor' or (admin and name=='Admin'))
 await get_student_dashboard_for_staff(sid,user,NS())
 assert aggregate.call_args.kwargs['instructor_id']==(None if admin else uid)
 assert aggregate.call_args.kwargs['use_cache'] is False

@pytest.mark.asyncio
async def test_student_cannot_use_staff_dashboard(monkeypatch):
 aggregate=AsyncMock();monkeypatch.setattr(d,'get_aggregated_student_dashboard',aggregate)
 with pytest.raises(AuthorizationError):await get_student_dashboard_for_staff(uuid.uuid4(),NS(has_role=lambda name:name=='Student'),NS())
 aggregate.assert_not_called()

@pytest.mark.asyncio
async def test_passing_assessment_clears_escalated_intervention_flag():
 from datetime import datetime,timezone
 from app.modules.module6_adaptive.services import weakness_detector as w
 from app.modules.module6_adaptive.models import PlanStatus,WeaknessStatus
 sub=NS(id=uuid.uuid4(),student_id=uuid.uuid4(),submitted_at=datetime.now(timezone.utc))
 score=NS(score=1,max_score=1,skill_id=uuid.uuid4())
 flag=NS(id=uuid.uuid4(),status=WeaknessStatus.active,submission_id=uuid.uuid4(),resolution_submission_id=None)
 plan=NS(status=PlanStatus.escalated,instructor_escalated=True)
 db=NS(execute=AsyncMock(side_effect=[NS(),NS(scalars=lambda:NS(all=lambda:[score])),NS(scalar_one_or_none=lambda:flag),NS(scalars=lambda:[]),NS(scalar_one_or_none=lambda:plan)]),commit=AsyncMock())
 new,resolved=await w.evaluate_submission_skills_for_weaknesses(sub,db)
 assert resolved==[flag] and not new and plan.status==PlanStatus.completed
 assert plan.instructor_escalated is False
