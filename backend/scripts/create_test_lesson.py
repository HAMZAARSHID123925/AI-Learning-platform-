import asyncio
import uuid
import sys
import traceback
from datetime import datetime, timezone
from sqlalchemy import text
from app.database import AsyncSessionLocal
from dotenv import load_dotenv

load_dotenv()

async def seed_smoke_test_content():
    try:
        async with AsyncSessionLocal() as session:
            instructor_query = await session.execute(text("SELECT id FROM users WHERE email = 'instructor@elarion.com' LIMIT 1"))
            instructor = instructor_query.fetchone()
            if not instructor:
                print("No instructor found.")
                return
            instructor_id = instructor.id

            course_id = uuid.uuid4()
            module_id = uuid.uuid4()
            lesson_id = uuid.uuid4()

            print(f"Creating Course: {course_id}")
            await session.execute(text("""
                INSERT INTO courses (id, instructor_id, title, slug, grade, status, sequence_order, content_version, created_at, updated_at)
                VALUES (:id, :inst_id, :title, :slug, :grade, :status, 1, 1, NOW(), NOW())
            """), {
                "id": course_id, "inst_id": instructor_id, "title": "ELARION Smoke Test - Computer Science",
                "slug": "elarion-smoke-test-cs", "grade": 5, "status": "published"
            })

            print(f"Creating Module: {module_id}")
            await session.execute(text("""
                INSERT INTO course_modules (id, course_id, title, slug, sequence_order, content_version, created_at, updated_at)
                VALUES (:id, :c_id, :title, :slug, 1, 1, NOW(), NOW())
            """), {
                "id": module_id, "c_id": course_id, "title": "Computer Basics",
                "slug": "computer-basics"
            })

            print(f"Creating Lesson: {lesson_id}")
            await session.execute(text("""
                INSERT INTO lessons (id, module_id, title, slug, status, sequence_order, content_version, video_object_key, body_markdown, created_at, updated_at)
                VALUES (:id, :m_id, :title, :slug, :status, 1, 1, :vok, :body, NOW(), NOW())
            """), {
                "id": lesson_id, "m_id": module_id, "title": "CPU vs RAM Explained Simply",
                "slug": "cpu-vs-ram", "status": "published",
                "vok": "computer science/CPU-vs-RAM-Explained-Simply.mp4",
                "body": "This is a smoke test lesson to test real video playback from R2."
            })

            await session.commit()
            print("Done!")
            print(f"COURSE_ID={course_id}")
            print(f"MODULE_ID={module_id}")
            print(f"LESSON_ID={lesson_id}")
    except Exception as e:
        print("Error:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(seed_smoke_test_content())
