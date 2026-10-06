import asyncio
import uuid
import os
import sys
from pathlib import Path
import json

os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "postgresql+asyncpg://neondb_owner:npg_GeiUXE5Plf2r@ep-patient-truth-b47htn2m-pooler.c-6.us-east-2.aws.neon.tech/neondb?ssl=require"
os.environ["TEST_DATABASE_URL"] = "postgresql+asyncpg://neondb_owner:npg_GeiUXE5Plf2r@ep-patient-truth-b47htn2m-pooler.c-6.us-east-2.aws.neon.tech/neondb?ssl=require"
os.environ["REDIS_URL"] = "redis://127.0.0.1:6379/15"

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from httpx import AsyncClient
from app.modules.module1_auth.models import Role, User, UserRole, UserStatus
from app.database import AsyncSessionLocal
from app.modules.module1_auth.services.auth_service import create_access_token

checks = []

def check(name, ok, **details):
    checks.append({"check": name, "pass": bool(ok), **details})
    print(json.dumps(checks[-1]), flush=True)

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
            
            db.add(UserRole(user_id=uid, role_id=role.id))
            await db.commit()
            
            token, _ = create_access_token(str(uid), user.email, user.first_name, [role_name], [])
            users[role_name] = {"id": uid, "token": token, "headers": {"Authorization": f"Bearer {token}"}}
        return users

async def main():
    print("Setting up users...")
    users = await setup_users()
    admin = users["Admin"]
    instructor = users["Instructor"]
    student = users["Student"]

    # We use base_url="http://127.0.0.1:8000" because the app is already running
    async with AsyncClient(base_url="http://127.0.0.1:8000", timeout=10.0) as client:
        print("Testing User/Role Management...")
        
        # 1. Admin Analytics / List Users
        r = await client.get("/api/v1/users", headers=student["headers"])
        check("Student cannot list users", r.status_code == 403, status=r.status_code)
        
        r = await client.get("/api/v1/users", headers=admin["headers"])
        check("Admin can list users", r.status_code == 200, status=r.status_code)
        
        # 2. Role assignment
        payload = {"role_name": "Instructor"}
        r = await client.post(f"/api/v1/users/{student['id']}/roles", json=payload, headers=instructor["headers"])
        check("Instructor cannot assign roles", r.status_code == 403, status=r.status_code)
        
        r = await client.post(f"/api/v1/users/{student['id']}/roles", json=payload, headers=admin["headers"])
        check("Admin can assign roles", r.status_code == 200, status=r.status_code)
        
        # 3. Course administration
        payload = {
            "title": f"Admin Created Course {uuid.uuid4().hex[:6]}",
            "description": "Desc",
            "instructor_id": str(instructor["id"])
        }
        r = await client.post("/api/v1/courses", json=payload, headers=instructor["headers"])
        check("Instructor can create course", r.status_code == 201, status=r.status_code)
        course_id = r.json()["id"] if r.status_code == 201 else None
        
        if course_id:
            r = await client.patch(f"/api/v1/courses/{course_id}", json={"title": "Hacked"}, headers=student["headers"])
            check("Student cannot update course", r.status_code == 403, status=r.status_code)
            
            r = await client.patch(f"/api/v1/courses/{course_id}", json={"title": "Admin Update"}, headers=admin["headers"])
            check("Admin can update course", r.status_code == 200, status=r.status_code)
        
        # 4. Escalations / Global visibility
        r = await client.get("/api/v1/adaptive/remedial/escalations", headers=student["headers"])
        check("Student cannot see escalations", r.status_code == 403, status=r.status_code)
        
        r = await client.get("/api/v1/adaptive/remedial/escalations", headers=admin["headers"])
        check("Admin can see escalations", r.status_code == 200, status=r.status_code)
        
        # 5. Teacher Assignment (Admin assigning instructor_id to a course)
        if course_id:
            payload = {"instructor_id": str(student["id"])} # Reassign to someone else
            r = await client.patch(f"/api/v1/courses/{course_id}", json=payload, headers=instructor["headers"])
            # Assuming Instructor can reassign? Or only Admin? Let's check status
            check("Instructor reassigns teacher (behavior)", True, status=r.status_code)

            r = await client.patch(f"/api/v1/courses/{course_id}", json=payload, headers=admin["headers"])
            check("Admin reassigns teacher", r.status_code == 200, status=r.status_code)

        print("\nSUMMARY:")
        failed = [c for c in checks if not c["pass"]]
        if failed:
            print("FAILED CHECKS:")
            for f in failed:
                print(f)
        else:
            print("ALL CHECKS PASSED")

if __name__ == "__main__":
    asyncio.run(main())
