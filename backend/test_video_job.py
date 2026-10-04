import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.modules.module1_auth.models import User
from app.modules.module2_content.models import Course
from app.modules.module5_assessment.models import Submission, Test
from app.modules.shared_models.skill_taxonomy import SkillTaxonomy
from app.modules.module6_adaptive.models import WeaknessFlag, VideoGenerationJob, WeaknessStatus
from app.modules.module6_adaptive.services.video_job_service import create_video_generation_job
from app.workers.video_generation_consumer import process_video_generation_job

async def test_video_generation_job():
    async with AsyncSessionLocal() as db:
        # 1. Find an active WeaknessFlag
        flag_query = select(WeaknessFlag).where(WeaknessFlag.status == WeaknessStatus.active).limit(1)
        res = await db.execute(flag_query)
        flag = res.scalar_one_or_none()
        
        if not flag:
            print("No active WeaknessFlag found to test. Test skipped.")
            return

        print(f"Using WeaknessFlag {flag.id} for student {flag.student_id}")

        # 2. Test Idempotency / Creation
        job1 = await create_video_generation_job(db, flag.student_id, flag.id)
        print(f"Job 1 created/returned: {job1.id} | Status: {job1.status}")

        job2 = await create_video_generation_job(db, flag.student_id, flag.id)
        print(f"Job 2 created/returned: {job2.id} | Status: {job2.status}")
        
        if job1.id == job2.id:
            print("Idempotency verified: Duplicate active jobs prevented.")
        else:
            print("ERROR: Idempotency failed.")

        # 3. Process with worker skeleton
        payload = {"job_id": str(job1.id)}
        result = await process_video_generation_job(payload, db)
        print(f"Worker result: {result}")

        # 4. Verify DB state
        await db.refresh(job1)
        print(f"Final Job Status: {job1.status}")
        if job1.status.value == "planning":
            print("Worker transitioned job from queued -> planning successfully.")
        else:
            print(f"ERROR: Job did not transition properly. Status is {job1.status.value}")

if __name__ == "__main__":
    asyncio.run(test_video_generation_job())
