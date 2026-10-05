import os
import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.modules.module2_content.models import Course, CourseModule, CourseStatus, Lesson, LessonStatus
from app.modules.module5_assessment.models import Question, QuestionType, Test
from app.modules.module1_auth.models import User, UserStatus
from app.modules.module1_auth.services.auth_service import create_access_token

@pytest.fixture
async def seeded_lesson(db: AsyncSession):
    inst = User(email="mod7_inst@test.com", password_hash="1", first_name="I", last_name="I", status=UserStatus.active)
    stud = User(email="mod7_stud@test.com", password_hash="1", first_name="S", last_name="S", status=UserStatus.active)
    db.add_all([inst, stud])
    await db.flush()
    
    await db.execute(text("INSERT INTO user_roles (user_id, role_id) SELECT :uid, id FROM roles WHERE name='Instructor' ON CONFLICT DO NOTHING"), {"uid": inst.id})
    await db.commit()
    
    course = Course(title="Mod7 Course", slug=f"m7-c-{uuid.uuid4().hex[:6]}", instructor_id=inst.id, status=CourseStatus.published)
    db.add(course)
    await db.flush()
    mod = CourseModule(course_id=course.id, title="M", sequence_order=1)
    db.add(mod)
    await db.flush()
    
    realistic_body = """# Quantum Physics Foundations

Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. 
1. **Wave-Particle Duality**: Every particle or quantum entity may be described as either a particle or a wave.
2. **Quantization**: Energy, momentum, angular momentum, and other quantities of a bound system are restricted to discrete values.
3. **Uncertainty Principle**: Proposed by Werner Heisenberg, it states that you cannot simultaneously know both the position and momentum of a particle with absolute precision.
4. **Superposition**: A quantum system can be in multiple states at the same time until it is measured.
5. **Entanglement**: Particles can become entangled, meaning the state of one particle instantly influences the state of another, no matter the distance.
6. **Schrödinger's Cat**: A thought experiment illustrating superposition, where a cat is simultaneously alive and dead until observed.
7. **Planck's Constant**: A fundamental physical constant denoted as 'h', which relates the energy of a photon to its frequency.
8. **Quantum Tunneling**: The quantum mechanical phenomenon where a wavefunction can propagate through a potential barrier.
9. **Fermions and Bosons**: Particles are divided into two types based on their spin. Fermions have half-integer spin (like electrons), while bosons have integer spin (like photons).
10. **The Standard Model**: The theoretical framework describing three of the four known fundamental forces (electromagnetic, weak, and strong interactions).
"""
    lesson = Lesson(module_id=mod.id, title="L", slug=f"l-{uuid.uuid4().hex[:6]}", body_markdown=realistic_body, sequence_order=1, status=LessonStatus.published, content_version=1)
    db.add(lesson)
    await db.commit()
    
    inst_token = create_access_token(user_id=str(inst.id), email=inst.email, first_name=inst.first_name, roles=["Instructor"], permissions=[])
    stud_token = create_access_token(user_id=str(stud.id), email=stud.email, first_name=stud.first_name, roles=["Student"], permissions=[])
    
    return lesson, inst_token, stud_token

@pytest.mark.asyncio
async def test_module07_full_flow(client: AsyncClient, seeded_lesson, db: AsyncSession):
    lesson, inst_token, stud_token = seeded_lesson
    
    resp = await client.post("/api/v1/assessments/generate", headers={"Authorization": f"Bearer {inst_token}"}, json={"lesson_id": str(lesson.id), "is_focused_retest": False, "target_weakness_flags": []})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    
    questions = data.get("questions", [])
    assert len(questions) == 10
    for q in questions:
        assert q["question_type"] == "mcq"
        assert q["prompt"]
        assert len(q["options"]) > 0
    
    test_id = data["id"]
    
    resp_stud = await client.get(f"/api/v1/assessments/tests/{test_id}", headers={"Authorization": f"Bearer {stud_token}"})
    assert resp_stud.status_code == 200
    stud_data = resp_stud.json()
    for q in stud_data["questions"]:
        assert "rubric" not in q
        for opt in q["options"]:
            assert "is_correct" not in opt
            
    answers = []
    for q in data["questions"]:
        correct_opt = next(opt for opt in q["options"] if opt["is_correct"])
        answers.append({"question_id": q["id"], "selected_option_id": correct_opt["id"]})
        
    submit_resp = await client.post(f"/api/v1/assessments/{test_id}/submit", headers={"Authorization": f"Bearer {stud_token}"}, json={"answers": answers})
    assert submit_resp.status_code == 200, submit_resp.text
    sub_data = submit_resp.json()
    assert sub_data["status"] == "graded"
    assert sub_data["overall_score"] == 1.0 
    
    sub_id = sub_data["id"]
    
    bad_resp = await client.post(f"/api/v1/assessments/{test_id}/submit", headers={"Authorization": f"Bearer {stud_token}"}, json={"answers": answers[:5]})
    assert bad_resp.status_code == 400
    
    fetch_sub = await client.get(f"/api/v1/submissions/{sub_id}", headers={"Authorization": f"Bearer {stud_token}"})
    assert fetch_sub.status_code == 200
    assert fetch_sub.json()["overall_score"] == 1.0
    
    l_resp = await client.get(f"/api/v1/lessons/{lesson.id}/assessment", headers={"Authorization": f"Bearer {stud_token}"})
    assert l_resp.status_code == 200
    
    c_resp = await client.get(f"/api/v1/courses/{lesson.module.course_id}/assessment", headers={"Authorization": f"Bearer {stud_token}"})
    assert c_resp.status_code == 200
