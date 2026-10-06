import asyncio
import uuid
from sqlalchemy import select, text
from app.database import engine, Base
from app.database import AsyncSessionLocal
from app.modules.module1_auth.models import User, UserStatus
from app.modules.module2_content.models import Course, CourseModule, Lesson, CourseStatus, LessonStatus
from app.main import app
from httpx import AsyncClient, ASGITransport

async def run_certification():
    # DROP AND CREATE ALL TABLES TO FORCE FRESH ENUMS
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    # Dispose the engine to clear any asyncpg type caches
    await engine.dispose()
    
    async with AsyncSessionLocal() as db:
        # Create user
        email = f"teacher_{uuid.uuid4().hex[:6]}@test.com"
        inst = User(email=email, password_hash="1", first_name="I", last_name="I", status=UserStatus.active)
        stud = User(email=f"student_{uuid.uuid4().hex[:6]}@test.com", password_hash="1", first_name="S", last_name="S", status=UserStatus.active)
        db.add_all([inst, stud])
        await db.flush()
        
        # Instructor role
        await db.execute(text("INSERT INTO roles (name) VALUES ('Instructor'), ('Student'), ('Admin') ON CONFLICT DO NOTHING"))
        await db.execute(text("INSERT INTO user_roles (user_id, role_id) SELECT :uid, id FROM roles WHERE name='Instructor' ON CONFLICT DO NOTHING"), {"uid": inst.id})
        await db.execute(text("INSERT INTO user_roles (user_id, role_id) SELECT :uid, id FROM roles WHERE name='Student' ON CONFLICT DO NOTHING"), {"uid": stud.id})
        
        # Course
        course = Course(title="Mod7 Certification", slug=f"m7-cert-{uuid.uuid4().hex[:6]}", instructor_id=inst.id, status=CourseStatus.published)
        db.add(course)
        await db.flush()
        
        # Module
        mod = CourseModule(course_id=course.id, title="Module 1", sequence_order=1)
        db.add(mod)
        await db.flush()
        
        # Lesson
        body = '''# Advanced Machine Learning\n\n1. Support Vector Machines are supervised learning models.\n2. Random Forests are ensemble learning methods.\n3. Gradient Boosting builds trees sequentially.\n4. Neural Networks use backpropagation.\n5. K-Means is an unsupervised clustering algorithm.\n6. PCA is used for dimensionality reduction.\n7. Dropout is a regularization technique.\n8. L1 regularization adds an absolute value penalty.\n9. L2 regularization adds a squared magnitude penalty.\n10. Convolutional Neural Networks are primarily used for image recognition.\n'''
        lesson = Lesson(module_id=mod.id, title="Lesson 1", slug=f"l1-{uuid.uuid4().hex[:6]}", body_markdown=body, sequence_order=1, status=LessonStatus.published, content_version=1)
        db.add(lesson)
        await db.commit()
        
        print("Data seeded successfully.")
        
        from app.modules.module1_auth.utils import create_access_token
        inst_token = create_access_token(user_id=str(inst.id), email=inst.email, first_name=inst.first_name, roles=["Instructor"], permissions=[])
        stud_token = create_access_token(user_id=str(stud.id), email=stud.email, first_name=stud.first_name, roles=["Student"], permissions=[])
        
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            print("Requesting assessment generation (REAL AI)...")
            headers = {"Authorization": f"Bearer {inst_token}"}
            gen_req = {
                "lesson_id": str(lesson.id),
                "type": "quiz",
                "difficulty": "beginner"
            }
            resp = await client.post("/api/v1/assessments/generate", json=gen_req, headers=headers, timeout=60.0)
            if resp.status_code != 200:
                print(f"Gen Error: {resp.text}")
                return
            
            data = resp.json()
            questions = data.get("questions", [])
            print(f"Generated {len(questions)} questions.")
            assert len(questions) == 10, f"Expected 10 questions, got {len(questions)}"
            
            test_id = data.get("test_id")
            print(f"Test ID created: {test_id}")
            
            print("Submitting assessment...")
            stud_headers = {"Authorization": f"Bearer {stud_token}"}
            answers = []
            for i, q in enumerate(questions):
                # Pick the first option
                opt_id = q["options"][0]["id"]
                answers.append({"question_id": q["id"], "selected_option_id": opt_id})
                
            sub_req = {"test_id": test_id, "answers": answers}
            resp_sub = await client.post("/api/v1/assessments/submit", json=sub_req, headers=stud_headers, timeout=30.0)
            
            if resp_sub.status_code != 200:
                print(f"Sub Error: {resp_sub.text}")
                return
                
            sub_data = resp_sub.json()
            print(f"Submission successful. Score: {sub_data.get('score')} / {sub_data.get('total_questions')}")
            print("MODULE 07 END-TO-END CERTIFICATION PASSED.")

if __name__ == "__main__":
    asyncio.run(run_certification())
