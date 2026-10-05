"""Run with --noconftest: legacy integration fixtures are destructive."""
import os, sys, uuid
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
os.environ.setdefault("DATABASE_URL","postgresql+asyncpg://unused:unused@127.0.0.1/unused")
os.environ.setdefault("REDIS_URL","redis://127.0.0.1:6379/15")
import pytest
from pydantic import ValidationError
from app.modules.module5_assessment.schemas import AssessmentGenerateRequest, QuestionStudentView
from app.modules.module5_assessment.services.generation_service import validate_generated_mcqs
from app.modules.module5_assessment.models import Question, QuestionType
from app.modules.module5_assessment.services.grading_service import grade_mcq_deterministic

def sample():
 return {"questions":[{"question_type":"mcq","prompt":f"Distinct concept {i}?","max_score":1,"skill_name":"Hardware","options":[{"id":str(j),"text":f"Choice {j}","is_correct":j==0} for j in range(4)]} for i in range(10)]}

def test_exact_ten_and_exclusive_target():
 assert AssessmentGenerateRequest(lesson_id=uuid.uuid4()).num_questions==10
 for payload in ({},{"lesson_id":uuid.uuid4(),"course_id":uuid.uuid4()},{"lesson_id":uuid.uuid4(),"num_questions":5},{"lesson_id":uuid.uuid4(),"is_focused_retest":True}):
  with pytest.raises(ValidationError): AssessmentGenerateRequest(**payload)

@pytest.mark.parametrize("fault",["count","duplicate_prompt","duplicate_option","truthy_flag","two_correct","empty_prompt","empty_option","written","unknown_skill"])
def test_invalid_provider_output(fault):
 data=sample();q=data['questions'][0]
 if fault=='count': data['questions'].pop()
 if fault=='duplicate_prompt': data['questions'][1]['prompt']=q['prompt']
 if fault=='duplicate_option': q['options'][1]['id']=q['options'][0]['id']
 if fault=='truthy_flag': q['options'][0]['is_correct']='true'
 if fault=='two_correct': q['options'][1]['is_correct']=True
 if fault=='empty_prompt': q['prompt']=' '
 if fault=='empty_option': q['options'][0]['text']=' '
 if fault=='written': q['question_type']='short_answer'
 if fault=='unknown_skill': q['skill_name']='Untaught skill'
 with pytest.raises(ValueError): validate_generated_mcqs(data,10,{'hardware'})

def test_anti_cheat_feedback():
 raw=sample()['questions'][0]
 q=Question(id=uuid.uuid4(),skill_id=uuid.uuid4(),question_type=QuestionType.mcq,prompt=raw['prompt'],options=raw['options'],max_score=1,rubric='SECRET')
 rendered=QuestionStudentView.from_orm_model(q).model_dump_json()
 assert 'is_correct' not in rendered and 'SECRET' not in rendered and 'rubric' not in rendered
 assert grade_mcq_deterministic(q,'0')[0]==1
 score,feedback=grade_mcq_deterministic(q,'1')
 assert score==0 and 'Choice 0' not in feedback

@pytest.mark.asyncio
async def test_decimal_grading_event_is_json_and_failures_propagate(monkeypatch):
 from decimal import Decimal
 from unittest.mock import AsyncMock
 import app.shared.events as events
 import json
 client=type("Client",(),{})()
 client.eval=AsyncMock(return_value="1-0")
 monkeypatch.setattr(events,"get_redis_client",lambda:client)
 args=dict(submission_id=uuid.uuid4(),test_id=uuid.uuid4(),student_id=uuid.uuid4(),attempt_number=1,overall_score=Decimal('0.5'),is_focused_retest=False,skill_scores=[])
 assert await events.emit_test_graded_event(**args)=='1-0'
 assert json.loads(client.eval.call_args.args[-1])['overall_score']==0.5
 client.eval.side_effect=ConnectionError('unavailable')
 with pytest.raises(RuntimeError): await events.emit_test_graded_event(**args)

def test_redis_never_silently_replaces_security_store(monkeypatch):
 import app.shared.redis_client as module
 monkeypatch.setattr(module,'_get_pool',lambda:None)
 with pytest.raises(RuntimeError): module.get_redis_client()

def test_choices_hide_predictable_provider_ids_and_bind_to_student(monkeypatch):
 from app.modules.module5_assessment.schemas import student_option_id
 from app.config import get_settings
 from pathlib import Path
 from types import SimpleNamespace as NS
 import app.config as config
 monkeypatch.setattr(config,'get_settings',lambda:NS(jwt_private_key='TEST_ONLY_KEY'))
 raw=sample()['questions'][0]
 user=uuid.uuid4();other=uuid.uuid4()
 q=Question(id=uuid.uuid4(),skill_id=uuid.uuid4(),question_type=QuestionType.mcq,prompt=raw['prompt'],options=raw['options'],max_score=1)
 a=QuestionStudentView.from_orm_model(q,user)
 b=QuestionStudentView.from_orm_model(q,other)
 assert len(a.options)==4 and len({o.id for o in a.options})==4
 assert not {o.id for o in a.options} & {o['id'] for o in raw['options']}
 assert {o.id for o in a.options}.isdisjoint({o.id for o in b.options})
 assert a.model_dump()==QuestionStudentView.from_orm_model(q,user).model_dump()
 assert sorted(o.text for o in a.options)==sorted(o['text'] for o in raw['options'])
 assert 'is_correct' not in a.model_dump_json()

@pytest.mark.asyncio
async def test_failed_written_grader_never_fabricates_credit(monkeypatch):
 from types import SimpleNamespace as NS
 from unittest.mock import AsyncMock
 import app.modules.module5_assessment.services.grading_service as grading
 monkeypatch.setattr(grading,'generate_llm_completion',AsyncMock(side_effect=TimeoutError('controlled failure')))
 question=NS(id=uuid.uuid4(),prompt='Explain the CPU',max_score=1,rubric='Explain its function')
 with pytest.raises(RuntimeError):await grading.grade_short_answer_llm(question,{'text_answer':'The CPU executes instructions.'})

@pytest.mark.asyncio
async def test_redis_tls_cleanup_timeout_clears_pool(monkeypatch):
 from unittest.mock import AsyncMock
 from types import SimpleNamespace as NS
 from redis.exceptions import TimeoutError as RedisTimeoutError
 import app.shared.redis_client as module
 monkeypatch.setattr(module,'_redis_pool',NS(aclose=AsyncMock(side_effect=RedisTimeoutError('controlled TLS close timeout'))))
 await module.close_redis_pool()
 assert module._redis_pool is None

def test_provider_first_correct_position_is_not_preserved(monkeypatch):
 from types import SimpleNamespace as NS
 import app.config as config
 monkeypatch.setattr(config,'get_settings',lambda:NS(jwt_private_key='TEST_ONLY_KEY'))
 positions=[]
 for i in range(1,11):
  raw=sample()['questions'][0]
  q=Question(id=uuid.UUID(int=i),skill_id=uuid.UUID(int=100),question_type=QuestionType.mcq,prompt=raw['prompt'],options=raw['options'],max_score=1)
  view=QuestionStudentView.from_orm_model(q,uuid.UUID(int=42))
  positions.append(next(j for j,o in enumerate(view.options) if o.text=='Choice 0'))
 assert len(set(positions))>1
