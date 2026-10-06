import asyncio
import uuid
import os
import sys
from pathlib import Path

os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "postgresql+asyncpg://unused"
os.environ["REDIS_URL"] = "redis://unused"
os.environ["TEST_DATABASE_URL"] = "postgresql+asyncpg://neondb_owner:npg_GeiUXE5Plf2r@ep-patient-truth-b47htn2m.c-6.us-east-2.aws.neon.tech/neondb?ssl=require"
os.environ["TEST_REDIS_URL"] = "redis://unused"

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.main import app
from httpx import AsyncClient, ASGITransport
from app.modules.module1_auth.models import Role, User, UserRole, UserStatus
from app.database import AsyncSessionLocal
from app.modules.module1_auth.services.auth_service import create_access_token

async def setup_users():
    async with AsyncSessionLocal() as db:
        users = {}
        for role_name in ["Admin", "Instructor", "Student"]:
            uid = uuid.uuid4()
            user = User(
                id=uid,
                email=f"{role_name.lower()}13{uuid.uuid4().hex[:6]}@test.com",
                password_hash="fake",
                first_name=role_name,
                last_name="User",
                status=UserStatus.active
            )
            db.add(user)
            import sqlalchemy
            res = await db.execute(sqlalchemy.select(Role).where(Role.name == role_name))
            role = res.scalar_one_or_none()
            if not role:
                role = Role(id=uuid.uuid4(), name=role_name, description=role_name)
                db.add(role)
                await db.commit()

            db.add(UserRole(user_id=uid, role_id=role.id))
            await db.commit()

            token, _ = create_access_token(user, [role_name])
            users[role_name] = {"id": uid, "token": token, "headers": {"Authorization": f"Bearer {token}"}}
        return users

async def main():
    print("Setting up users...")
    users = await setup_users()
    admin = users["Admin"]
    instructor = users["Instructor"]
    student = users["Student"]

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        print("Testing User/Role Management...")

        r = await client.get("/api/v1/auth/users", headers=student["headers"])
        assert r.status_code == 403, "Student should not list users"

        r = await client.get("/api/v1/auth/users", headers=admin["headers"])
        assert r.status_code == 200, f"Admin should list users {r.text}"

        payload = {"role_name": "Instructor"}
        r = await client.post(f"/api/v1/auth/users/{student['id']}/roles", json=payload, headers=instructor["headers"])
        assert r.status_code == 403, "Instructor cannot assign roles"

        r = await client.post(f"/api/v1/auth/users/{student['id']}/roles", json=payload, headers=admin["headers"])
        assert r.status_code == 200, f"Admin can assign roles {r.text}"

        payload = {
            "title": "Admin Created Course",
            "description": "Desc",
            "instructor_id": str(instructor["id"])
        }
        r = await client.post("/api/v1/courses", json=payload, headers=instructor["headers"])
        assert r.status_code == 201, f"Instructor course creation failed {r.text}"
        course_id = r.json()["id"]

        r = await client.patch(f"/api/v1/courses/{course_id}", json={"title": "Hacked"}, headers=student["headers"])
        assert r.status_code == 403, "Student cannot update course"

        r = await client.patch(f"/api/v1/courses/{course_id}", json={"title": "Admin Update"}, headers=admin["headers"])
        assert r.status_code == 200, f"Admin can update course {r.text}"
        assert r.json()["title"] == "Admin Update"

        r = await client.get("/api/v1/adaptive/remedial/escalations", headers=student["headers"])
        assert r.status_code == 403, "Student cannot see escalations"

        r = await client.get("/api/v1/adaptive/remedial/escalations", headers=admin["headers"])
        assert r.status_code == 200, f"Admin can see escalations {r.text}"

        print("ALL TESTS PASSED")

if __name__ == "__main__":
    asyncio.run(main())
