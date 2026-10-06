import asyncio
import os
import uuid
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

os.environ["ENVIRONMENT"] = "test"
os.environ["TEST_DATABASE_URL"] = "postgresql+asyncpg://neondb_owner:npg_GeiUXE5Plf2r@ep-patient-truth-b47htn2m-pooler.c-6.us-east-2.aws.neon.tech/neondb?ssl=require"
os.environ["TEST_REDIS_URL"] = "redis://localhost:6379/1"

from app.main import create_app
from app.modules.module2_content.models import Course, CourseModule, Lesson, CourseStatus, LessonStatus
from app.database import get_db
from app.shared.dependencies import get_current_user
from app.modules.module1_auth.models import User

class MockUser(User):
    def has_role(self, role: str) -> bool:
        return True

async def test_generation():
    app = create_app()
    engine = create_async_engine(os.environ["TEST_DATABASE_URL"])
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    
    async with session_factory() as db:
        app.dependency_overrides[get_db] = lambda: db
        
        mock_user = MockUser(id=uuid.uuid4(), email="admin@test.com")
        app.dependency_overrides[get_current_user] = lambda: mock_user

        course = Course(title="Gen Course", slug=f"gen-course-{uuid.uuid4().hex[:6]}", instructor_id=mock_user.id, status=CourseStatus.published)
        db.add(course)
        await db.flush()

        mod = CourseModule(course_id=course.id, title="Gen Mod", sequence_order=1)
        db.add(mod)
        await db.flush()

        lesson = Lesson(module_id=mod.id, title="Gen Lesson", slug=f"gen-lesson-{uuid.uuid4().hex[:6]}", body_text="This is a test lesson about quantum physics. Quantum physics is the study of matter and energy at the most fundamental level. It aims to uncover the properties and behaviors of the very building blocks of nature. While many quantum experiments examine very small objects, such as electrons and photons, quantum phenomena are all around us, acting on every scale. However, we may not be able to detect them easily in larger objects.", sequence_order=1, status=LessonStatus.published, content_version=1)
        db.add(lesson)
        await db.commit()

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            print("Generating assessment for lesson:", lesson.id)
            resp = await ac.post(
                "/api/v1/assessments/generate",
                json={"lesson_id": str(lesson.id), "is_focused_retest": False, "target_weakness_flags": []}
            )
            print("Status:", resp.status_code)
            try:
                print(resp.json())
            except:
                print(resp.text)

if __name__ == '__main__':
    asyncio.run(test_generation())
