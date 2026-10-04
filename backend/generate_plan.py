import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.modules.module6_adaptive.models import WeaknessFlag
from app.modules.module5_assessment.models import Submission
from app.modules.module6_adaptive.services.remedial_course_service import generate_student_remedial_course

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(WeaknessFlag).limit(1))
        flag = res.scalar_one_or_none()
        if not flag:
            print("No flag found")
            return
            
        sub = await db.get(Submission, flag.submission_id)
        if not sub:
            print("No submission found")
            return
            
        plan = await generate_student_remedial_course(db, flag.student_id, flag, sub)
        await db.commit()
        print(f"Generated Plan: {plan.id}")

if __name__ == "__main__":
    asyncio.run(main())
