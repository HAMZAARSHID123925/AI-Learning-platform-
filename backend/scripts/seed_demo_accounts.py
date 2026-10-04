"""
Seed realistic students, teachers, and curriculum courses into PostgreSQL database.
"""
import asyncio
import uuid
from app.database import get_db_session
from sqlalchemy import text
from app.shared.auth import hash_password

TEACHERS = [
    {"email": "ahmed@elarion.com", "first_name": "Ahmed", "last_name": "Khan", "subject": "math"},
    {"email": "omar@elarion.com", "first_name": "Omar", "last_name": "Farooq", "subject": "computer"},
    {"email": "fatima@elarion.com", "first_name": "Fatima", "last_name": "Ali", "subject": "science"},
    {"email": "clara@elarion.com", "first_name": "Clara", "last_name": "Oswald", "subject": "english"},
    {"email": "hana@elarion.com", "first_name": "Hana", "last_name": "Song", "subject": "math"},
]

STUDENTS = [
    {"email": "zayd@elarion.com", "first_name": "Zayd", "last_name": "Malik", "grade": 5},
    {"email": "ayesha@elarion.com", "first_name": "Ayesha", "last_name": "Siddiqui", "grade": 5},
    {"email": "hamza@elarion.com", "first_name": "Hamza", "last_name": "Arshid", "grade": 5},
    {"email": "sara@elarion.com", "first_name": "Sara", "last_name": "Noor", "grade": 4},
    {"email": "bilal@elarion.com", "first_name": "Bilal", "last_name": "Tariq", "grade": 4},
    {"email": "maryam@elarion.com", "first_name": "Maryam", "last_name": "Kareem", "grade": 3},
    {"email": "yusuf@elarion.com", "first_name": "Yusuf", "last_name": "Ibrahim", "grade": 2},
    {"email": "layla@elarion.com", "first_name": "Layla", "last_name": "Hassan", "grade": 1},
]

async def seed_users_and_teachers():
    async with get_db_session() as db:
        res = await db.execute(text("SELECT id, name FROM roles"))
        roles = {row[1]: row[0] for row in res.fetchall()}
        instructor_role = roles.get("Instructor")
        student_role = roles.get("Student")

        # Seed Teachers
        for t in TEACHERS:
            t_id = uuid.uuid4()
            pwd = hash_password("Teacher123!")
            await db.execute(text("""
                INSERT INTO users (id, email, password_hash, first_name, last_name, status, email_verified, created_at, updated_at)
                VALUES (:id, :email, :pwd, :first_name, :last_name, 'active', true, NOW(), NOW())
                ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name
            """), {"id": t_id, "email": t["email"], "pwd": pwd, "first_name": t["first_name"], "last_name": t["last_name"]})
            
            # Fetch user id
            r = await db.execute(text("SELECT id FROM users WHERE email = :email"), {"email": t["email"]})
            uid = r.scalar_one()
            if instructor_role:
                await db.execute(text("""
                    INSERT INTO user_roles (user_id, role_id)
                    VALUES (:user_id, :role_id)
                    ON CONFLICT DO NOTHING
                """), {"user_id": uid, "role_id": instructor_role})

        # Seed Students
        for s in STUDENTS:
            s_id = uuid.uuid4()
            pwd = hash_password("Student123!")
            await db.execute(text("""
                INSERT INTO users (id, email, password_hash, first_name, last_name, status, email_verified, grade, created_at, updated_at)
                VALUES (:id, :email, :pwd, :first_name, :last_name, 'active', true, :grade, NOW(), NOW())
                ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, grade = EXCLUDED.grade
            """), {"id": s_id, "email": s["email"], "pwd": pwd, "first_name": s["first_name"], "last_name": s["last_name"], "grade": s["grade"]})

            r = await db.execute(text("SELECT id FROM users WHERE email = :email"), {"email": s["email"]})
            uid = r.scalar_one()
            if student_role:
                await db.execute(text("""
                    INSERT INTO user_roles (user_id, role_id)
                    VALUES (:user_id, :role_id)
                    ON CONFLICT DO NOTHING
                """), {"user_id": uid, "role_id": student_role})

        await db.commit()
        print("Successfully seeded teachers and students into database!")

if __name__ == "__main__":
    asyncio.run(seed_users_and_teachers())
