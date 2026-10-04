import asyncio
import json
from app.config import get_settings
from app.shared.redis_client import get_redis_client
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.modules.module5_assessment.models import Submission

# Import all models to avoid NoReferencedTableError
from app.modules.module1_auth.models import User
from app.modules.module2_content.models import Course
from app.modules.module6_adaptive.models import RemediationPlan, WeaknessFlag

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Submission).limit(1))
        sub = res.scalar_one_or_none()
        if not sub:
            print("No submission found")
            return
            
        redis = get_redis_client()
        settings = get_settings()
        stream_key = f"{settings.REDIS_KEY_PREFIX}:events:test_graded"
        
        payload = {
            "submission_id": str(sub.id),
            "student_id": str(sub.student_id),
            "test_id": str(sub.test_id),
            "overall_score": float(sub.overall_score) if sub.overall_score is not None else None
        }
        
        await redis.xadd(stream_key, {"data": json.dumps(payload)})
        print(f"Sent event to {stream_key}")

if __name__ == "__main__":
    asyncio.run(main())
