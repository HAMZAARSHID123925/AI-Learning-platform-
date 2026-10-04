import asyncio
import httpx
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.modules.module1_auth.models import User
from app.modules.module6_adaptive.models import RemediationPlan

async def main():
    async with AsyncSessionLocal() as db:
        res2 = await db.execute(select(RemediationPlan).limit(1))
        plan = res2.scalar_one_or_none()
        if not plan:
            print("Plan not found")
            return
            
        res = await db.execute(select(User).where(User.id == plan.student_id))
        user = res.scalar_one_or_none()
        if not user:
            print("Student not found")
            return
            
        # Get auth token
        async with httpx.AsyncClient() as client:
            resp = await client.post("http://localhost:8000/api/v1/auth/login", json={"email": user.email, "password": "Password123!"})
            if resp.status_code != 200:
                print(f"Login failed: {resp.text}")
                return
            token = resp.json()["access_token"]
            
            headers = {"Authorization": f"Bearer {token}"}
            payload = {"plan_id": str(plan.id)}
            
            job_resp = await client.post("http://localhost:8000/api/v1/remediation/video-jobs", json=payload, headers=headers)
            print(f"Status: {job_resp.status_code}")
            print(job_resp.json())

if __name__ == "__main__":
    asyncio.run(main())
