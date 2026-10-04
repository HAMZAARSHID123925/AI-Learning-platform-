import psycopg2
import uuid

DB_URL = "postgres://neondb_owner:npg_GeiUXE5Plf2r@ep-patient-truth-b47htn2m-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"

def main():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    cur.execute("SELECT id FROM users WHERE email = 'instructor@elarion.com' LIMIT 1")
    instructor = cur.fetchone()
    if not instructor:
        print("Instructor not found")
        return
        
    instructor_id = instructor[0]
    course_id = str(uuid.uuid4())
    module_id = str(uuid.uuid4())
    lesson_id = str(uuid.uuid4())
    
    print(f"Course: {course_id}")
    cur.execute("""
        INSERT INTO courses (id, instructor_id, title, slug, grade, status, sequence_order, content_version, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, 1, 1, NOW(), NOW())
    """, (course_id, instructor_id, "ELARION Smoke Test - Computer Science", "elarion-smoke-test-cs", 5, "published"))
    
    print(f"Module: {module_id}")
    cur.execute("""
        INSERT INTO course_modules (id, course_id, title, slug, sequence_order, content_version, created_at, updated_at)
        VALUES (%s, %s, %s, %s, 1, 1, NOW(), NOW())
    """, (module_id, course_id, "Computer Basics", "computer-basics"))
    
    print(f"Lesson: {lesson_id}")
    cur.execute("""
        INSERT INTO lessons (id, module_id, title, slug, status, sequence_order, content_version, video_object_key, body_markdown, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, 1, 1, %s, %s, NOW(), NOW())
    """, (lesson_id, module_id, "CPU vs RAM Explained Simply", "cpu-vs-ram", "published", "computer science/CPU-vs-RAM-Explained-Simply.mp4", "This is a smoke test lesson to test real video playback from R2."))
    
    cur.execute("SELECT id FROM users WHERE email = 'student@elarion.com' LIMIT 1")
    student = cur.fetchone()
    if student:
        enroll_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO enrollments (id, student_id, course_id, status, enrolled_at, created_at, updated_at)
            VALUES (%s, %s, %s, 'active', NOW(), NOW(), NOW())
        """, (enroll_id, student[0], course_id))
        print("Enrolled student.")
        
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"COURSE_ID={course_id}")
    print(f"MODULE_ID={module_id}")
    print(f"LESSON_ID={lesson_id}")

main()
