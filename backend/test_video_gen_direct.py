import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.modules.module1_auth.models import User
from app.modules.module2_content.models import Course
from app.modules.module4_experience.models import Enrollment
from app.modules.module5_assessment.models import Submission, Test
from app.modules.module6_adaptive.models import RemediationPlan, VideoGenerationJob, WeaknessFlag
from app.modules.module6_adaptive.services.video_job_service import create_video_generation_job

async def main():
    async with AsyncSessionLocal() as db:
        res2 = await db.execute(select(RemediationPlan).limit(1))
        plan = res2.scalar_one_or_none()
        if not plan:
            print("Plan not found")
            return
            
        print(f"Found plan {plan.id} for student {plan.student_id}")
        
        job = await create_video_generation_job(db, plan.student_id, plan.weakness_flag_id)
        
        print(f"Created job {job.id} with status {job.status}")

if __name__ == "__main__":
    asyncio.run(main())
