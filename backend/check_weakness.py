import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.modules.module6_adaptive.models import WeaknessFlag

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(WeaknessFlag))
        flags = res.scalars().all()
        print(f"Weakness Flags found: {len(flags)}")
        for f in flags:
            print(f" Flag: {f.id}, Skill: {f.skill_id}, Student: {f.student_id}, Status: {f.status.value}")

if __name__ == "__main__":
    asyncio.run(main())
