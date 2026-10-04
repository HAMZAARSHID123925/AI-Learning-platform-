import asyncio
from sqlalchemy import delete
from app.database import AsyncSessionLocal
from app.modules.module6_adaptive.models import WeaknessFlag, VideoGenerationJob
from app.modules.module5_assessment.models import SkillScore, Submission, Test

async def cleanup():
    async with AsyncSessionLocal() as db:
        await db.execute(delete(VideoGenerationJob))
        await db.execute(delete(WeaknessFlag))
        await db.execute(delete(SkillScore))
        await db.execute(delete(Submission).where(Submission.status == 'graded'))
        await db.execute(delete(Test).where(Test.title == 'Test Weakness'))
        await db.commit()

if __name__ == "__main__":
    asyncio.run(cleanup())
