"""Focused lifecycle/outbox regressions without external services."""
import os,sys,uuid
from pathlib import Path
from types import SimpleNamespace as NS
from unittest.mock import AsyncMock
from datetime import datetime,timezone
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
os.environ.setdefault('DATABASE_URL','postgresql+asyncpg://unused:unused@127.0.0.1/unused');os.environ.setdefault('REDIS_URL','redis://127.0.0.1:6379/15')
import pytest
from app.main import app
from app.modules.module5_assessment.models import SubmissionStatus
from app.modules.module5_assessment.services import grading_service as grade
from app.modules.module6_adaptive.models import PlanStatus
from app.modules.module6_adaptive.services import remedial_course_service as guides
from app.shared import events

@pytest.mark.asyncio
async def test_graded_submission_is_not_graded_or_emitted_twice(monkeypatch):
 submission=NS(id=uuid.uuid4(),status=SubmissionStatus.graded)
 db=NS(execute=AsyncMock(return_value=NS(scalar_one_or_none=lambda:submission)),commit=AsyncMock())
 publish=AsyncMock();monkeypatch.setattr(grade,'publish_graded_outbox',publish)
 assert await grade.grade_submission(submission.id,db) is submission
 db.commit.assert_not_called();publish.assert_not_called()

@pytest.mark.asyncio
async def test_broker_failure_keeps_outbox_pending_for_retry(monkeypatch):
 row=NS(submission_id=uuid.uuid4(),payload={'submission_id':str(uuid.uuid4())},published_at=None)
 db=NS(execute=AsyncMock(return_value=NS(scalar_one_or_none=lambda:row)),commit=AsyncMock())
 emit=AsyncMock(side_effect=ConnectionError('controlled broker failure'));monkeypatch.setattr(events,'emit_test_graded_event',emit)
 with pytest.raises(ConnectionError):await events.publish_graded_outbox(db,row.submission_id)
 assert row.published_at is None;db.commit.assert_not_called()
 emit.side_effect=None
 assert await events.publish_graded_outbox(db,row.submission_id)
 assert row.published_at is not None and db.commit.await_count==1

@pytest.mark.asyncio
async def test_escalated_guide_replay_cannot_regenerate_or_reset(monkeypatch):
 uid=uuid.uuid4();flag=NS(id=uuid.uuid4(),student_id=uid);submission=NS(student_id=uid)
 plan=NS(status=PlanStatus.escalated,study_completed=True,remedial_course_markdown='Existing actual guide')
 db=NS(execute=AsyncMock(return_value=NS(scalar_one_or_none=lambda:plan)))
 llm=AsyncMock();monkeypatch.setattr(guides,'generate_llm_completion',llm)
 assert await guides.generate_student_remedial_course(db,uid,flag,submission) is plan
 llm.assert_not_called();assert plan.study_completed
