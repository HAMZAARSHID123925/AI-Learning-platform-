import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.modules.module6_adaptive.models import RemediationPlan

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(RemediationPlan))
        plans = res.scalars().all()
        print(f"Remediation Plans found: {len(plans)}")
        for p in plans:
            print(f" Plan: {p.id}, WeaknessFlag: {p.weakness_flag_id}, Status: {p.status.value}")

if __name__ == "__main__":
    asyncio.run(main())
