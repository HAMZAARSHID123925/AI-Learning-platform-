import asyncio
from pathlib import Path
import sys
import uuid
from datetime import datetime

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import text
from app.database import get_db_session

async def seed_test_courses():
    async with get_db_session() as db:
        # Find instructor id
        res = await db.execute(text("SELECT id FROM users WHERE email = 'instructor@elarion.com'"))
        row = res.fetchone()
        if not row:
            print("Instructor not found. Run seed_data.py first.")
            return
        instructor_id = row[0]

        courses = [
            {
                "id": uuid.uuid4(),
                "title": "Grade 5 Math: Advanced Fractions",
                "slug": "math-grade-5",
                "description": "Learn advanced fractions with interactive exercises.",
                "grade": 5,
                "status": "published",
                "instructor_id": instructor_id
            },
            {
                "id": uuid.uuid4(),
                "title": "Grade 3 Science: The Solar System",
                "slug": "science-grade-3",
                "description": "Explore planets and stars.",
                "grade": 3,
                "status": "published",
                "instructor_id": instructor_id
            }
        ]

        for c in courses:
            await db.execute(
                text("""
                    INSERT INTO courses (id, instructor_id, title, slug, description, status, grade, created_at, updated_at)
                    VALUES (:id, :instructor_id, :title, :slug, :description, :status, :grade, NOW(), NOW())
                    ON CONFLICT (slug) DO NOTHING
                """),
                c
            )
        await db.commit()
        print("Test courses seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_test_courses())
