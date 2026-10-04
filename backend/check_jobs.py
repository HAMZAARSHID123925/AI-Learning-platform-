import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.modules.module6_adaptive.models import VideoGenerationJob

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(VideoGenerationJob))
        jobs = res.scalars().all()
        print(f"Video Jobs found: {len(jobs)}")
        for j in jobs:
            print(f" Job: {j.id}, Status: {j.status.value}")

if __name__ == "__main__":
    asyncio.run(main())
