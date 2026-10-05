"""
Seed initial live class sessions into PostgreSQL live_sessions table.
"""
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from app.database import get_db_session
from sqlalchemy import text

LIVE_SESSIONS_SEED = [
    {"course_slug": "g5-fractions", "teacher_email": "ahmed@elarion.com", "title": "Adding Fractions Together", "day_offset": 0, "time_hour": 10, "is_live": True},
    {"course_slug": "g5-plants-animals", "teacher_email": "fatima@elarion.com", "title": "Build a Food Web", "day_offset": 1, "time_hour": 11, "is_live": False},
    {"course_slug": "g5-reading", "teacher_email": "clara@elarion.com", "title": "Reading Detectives", "day_offset": 2, "time_hour": 9, "is_live": False},
    {"course_slug": "g5-digital-basics", "teacher_email": "omar@elarion.com", "title": "Staying Safe Online", "day_offset": 4, "time_hour": 13, "is_live": False},
    {"course_slug": "g5-fractions", "teacher_email": "ahmed@elarion.com", "title": "Fraction Pizza Party", "day_offset": 5, "time_hour": 10, "is_live": False},
]

async def seed_live_sessions():
    async with get_db_session() as db:
        # Load courses
        c_res = await db.execute(text("SELECT slug, id FROM courses"))
        courses_by_slug = {r[0]: r[1] for r in c_res.fetchall()}

        # Load users
        u_res = await db.execute(text("SELECT email, id FROM users"))
        users_by_email = {r[0]: r[1] for r in u_res.fetchall()}

        now = datetime.now(timezone.utc)

        for s in LIVE_SESSIONS_SEED:
            cid = courses_by_slug.get(s["course_slug"])
            uid = users_by_email.get(s["teacher_email"])
            if not cid or not uid:
                continue

            scheduled_at = now + timedelta(days=s["day_offset"])
            scheduled_at = scheduled_at.replace(hour=s["time_hour"], minute=0, second=0, microsecond=0)
            status = "live" if s["is_live"] else "scheduled"
            sid = uuid.uuid4()

            await db.execute(text("""
                INSERT INTO live_sessions (id, course_id, instructor_id, title, description, scheduled_at, duration_minutes, max_participants, status, created_at, updated_at)
                VALUES (:id, :cid, :uid, :title, :desc, :scheduled_at, 45, 100, :status, NOW(), NOW())
                ON CONFLICT DO NOTHING
            """), {
                "id": sid,
                "cid": cid,
                "uid": uid,
                "title": s["title"],
                "desc": f"Interactive live session on {s['title']}",
                "scheduled_at": scheduled_at,
                "status": status,
            })

        await db.commit()
        print("Successfully seeded live class sessions into PostgreSQL!")

if __name__ == "__main__":
    asyncio.run(seed_live_sessions())
