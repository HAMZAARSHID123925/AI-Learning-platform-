import asyncio
import asyncpg
import uuid

DB_URL = "postgres://neondb_owner:npg_GeiUXE5Plf2r@ep-patient-truth-b47htn2m-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"

async def main():
    try:
        conn = await asyncpg.connect(DB_URL)
        
        # Get instructor ID
        instructor = await conn.fetchrow("SELECT id FROM users WHERE email = 'instructor@elarion.com' LIMIT 1")
        if not instructor:
            print("Instructor not found")
            return
            
        instructor_id = instructor['id']
        course_id = uuid.uuid4()
        module_id = uuid.uuid4()
        lesson_id = uuid.uuid4()
        
        print(f"Course: {course_id}")
        await conn.execute("""
            INSERT INTO courses (id, instructor_id, title, slug, grade, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        """, course_id, instructor_id, "ELARION Smoke Test - Computer Science", "elarion-smoke-test-cs", 5, "published")
        
        print(f"Module: {module_id}")
        await conn.execute("""
            INSERT INTO course_modules (id, course_id, title, slug, sequence_order, created_at, updated_at)
            VALUES ($1, $2, $3, $4, 1, NOW(), NOW())
        """, module_id, course_id, "Computer Basics", "computer-basics")
        
        print(f"Lesson: {lesson_id}")
        await conn.execute("""
            INSERT INTO lessons (id, module_id, title, slug, status, sequence_order, content_version, video_object_key, body_markdown, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, 1, 1, $6, $7, NOW(), NOW())
        """, lesson_id, module_id, "CPU vs RAM Explained Simply", "cpu-vs-ram", "published", "computer science/CPU-vs-RAM-Explained-Simply.mp4", "This is a smoke test lesson to test real video playback from R2.")
        
        student = await conn.fetchrow("SELECT id FROM users WHERE email = 'student@elarion.com' LIMIT 1")
        if student:
            enroll_id = uuid.uuid4()
            await conn.execute("""
                INSERT INTO enrollments (id, student_id, course_id, status, enrolled_at, created_at, updated_at)
                VALUES ($1, $2, $3, 'active', NOW(), NOW(), NOW())
            """, enroll_id, student['id'], course_id)
            print("Enrolled student.")
            
        await conn.close()
        
        print(f"COURSE_ID={course_id}")
        print(f"MODULE_ID={module_id}")
        print(f"LESSON_ID={lesson_id}")
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(main())
