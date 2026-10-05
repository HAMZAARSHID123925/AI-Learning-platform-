"""
Seed full interactive curriculum courses into PostgreSQL database with modules and lessons.
"""
import asyncio
import uuid
from app.database import get_db_session
from sqlalchemy import text

# Curriculum data matching grades 1-5
CURRICULUM_COURSES = [
    # Grade 5
    {"slug": "g5-fractions", "grade": 5, "title": "Fractions", "teacher_email": "ahmed@elarion.com", "description": "Split, share and compare parts of a whole.", "lessons": [
        "What is a fraction?", "Equivalent fractions", "Comparing fractions", "Adding fractions"
    ]},
    {"slug": "g5-decimals", "grade": 5, "title": "Decimals", "teacher_email": "omar@elarion.com", "description": "Tenths, hundredths and how decimals link to fractions.", "lessons": [
        "Tenths and hundredths", "Decimals as fractions", "Comparing decimals"
    ]},
    {"slug": "g5-geometry", "grade": 5, "title": "Geometry", "teacher_email": "ahmed@elarion.com", "description": "Polygons, angles and measuring around shapes.", "lessons": [
        "Polygons", "Angles", "Perimeter"
    ]},
    {"slug": "g5-algebra", "grade": 5, "title": "Basic Algebra", "teacher_email": "omar@elarion.com", "description": "Mystery numbers, patterns and balancing equations.", "lessons": [
        "Mystery numbers", "Number patterns", "Solving equations"
    ]},
    {"slug": "g5-plants-animals", "grade": 5, "title": "Plants & Animals", "teacher_email": "fatima@elarion.com", "description": "Food chains, habitats and how life connects.", "lessons": [
        "What living things need", "Food chains", "Habitats"
    ]},
    {"slug": "g5-photosynthesis", "grade": 5, "title": "Photosynthesis", "teacher_email": "fatima@elarion.com", "description": "Sunlight, water and the green sugar factory.", "lessons": [
        "Leaves as solar panels", "Light to sugar", "Why plants breathe out oxygen"
    ]},
    {"slug": "g5-human-body", "grade": 5, "title": "Human Body", "teacher_email": "fatima@elarion.com", "description": "Heart, lungs and the body's superpower systems.", "lessons": [
        "The beating pump", "Breathing machine", "Fuel and digestion"
    ]},
    {"slug": "g5-reading", "grade": 5, "title": "Reading Skills", "teacher_email": "clara@elarion.com", "description": "Main ideas, inferences and reading between the lines.", "lessons": [
        "Finding the big idea", "Detective clues", "Fact vs Opinion"
    ]},
    {"slug": "g5-vocabulary", "grade": 5, "title": "Vocabulary", "teacher_email": "clara@elarion.com", "description": "Roots, prefixes and power words that make you sound smart.", "lessons": [
        "Root words", "Prefix power", "Context clues"
    ]},
    {"slug": "g5-grammar", "grade": 5, "title": "Grammar", "teacher_email": "clara@elarion.com", "description": "Punctuation perfection and lively descriptive sentences.", "lessons": [
        "Compound sentences", "Apostrophes & quotes", "Adverbs in action"
    ]},
    {"slug": "g5-digital-basics", "grade": 5, "title": "Digital Basics", "teacher_email": "omar@elarion.com", "description": "Computers, the internet and your first steps in code.", "lessons": [
        "What is a Computer?", "Hardware and Software", "Internet Basics", "Introduction to Coding"
    ]},
]

async def seed_courses():
    async with get_db_session() as db:
        # Get teachers
        r = await db.execute(text("SELECT email, id FROM users"))
        users_by_email = {row[0]: row[1] for row in r.fetchall()}

        admin_id = users_by_email.get("abc@gmail.com") or list(users_by_email.values())[0]

        for c in CURRICULUM_COURSES:
            t_id = users_by_email.get(c["teacher_email"], admin_id)
            c_id = uuid.uuid4()

            # Insert course
            await db.execute(text("""
                INSERT INTO courses (id, instructor_id, title, slug, description, status, grade, created_at, updated_at)
                VALUES (:id, :instructor_id, :title, :slug, :desc, 'published', :grade, NOW(), NOW())
                ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, status = 'published', grade = EXCLUDED.grade
            """), {
                "id": c_id,
                "instructor_id": t_id,
                "title": c["title"],
                "slug": c["slug"],
                "desc": c["description"],
                "grade": c["grade"],
            })

            # Fetch course id if conflict
            res = await db.execute(text("SELECT id FROM courses WHERE slug = :slug"), {"slug": c["slug"]})
            course_id = res.scalar_one()

            # Create module
            m_id = uuid.uuid4()
            await db.execute(text("""
                INSERT INTO course_modules (id, course_id, title, sequence_order, created_at)
                VALUES (:id, :cid, 'Core Curriculum Module', 1, NOW())
                ON CONFLICT DO NOTHING
            """), {"id": m_id, "cid": course_id})

            # Fetch module id
            m_res = await db.execute(text("SELECT id FROM course_modules WHERE course_id = :cid ORDER BY sequence_order LIMIT 1"), {"cid": course_id})
            mod_id = m_res.scalar_one()

            # Insert lessons
            for idx, lesson_title in enumerate(c["lessons"]):
                l_slug = f"{c['slug']}-l{idx+1}"
                l_id = uuid.uuid4()
                await db.execute(text("""
                    INSERT INTO lessons (id, module_id, title, slug, sequence_order, status, content_version, created_at, updated_at)
                    VALUES (:id, :mid, :title, :slug, :seq, 'published', 1, NOW(), NOW())
                    ON CONFLICT (slug) DO NOTHING
                """), {
                    "id": l_id,
                    "mid": mod_id,
                    "title": lesson_title,
                    "slug": l_slug,
                    "seq": idx + 1,
                })

        await db.commit()
        print(f"Successfully seeded {len(CURRICULUM_COURSES)} published courses and their lessons into database!")

if __name__ == "__main__":
    asyncio.run(seed_courses())
