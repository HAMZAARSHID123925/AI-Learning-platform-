import asyncio
import json
from sqlalchemy import select, text
from app.database import AsyncSessionLocal
from app.shared.redis_client import get_redis_client

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(text("SELECT id FROM video_generation_jobs WHERE status = 'failed' LIMIT 1"))
        job_id = res.scalar_one_or_none()
        if not job_id:
            print("No failed job to retry")
            return
            
        print(f"Retrying job {job_id}")
        await db.execute(text("UPDATE video_generation_jobs SET status = 'queued' WHERE id = :id"), {"id": job_id})
        await db.commit()
        
        redis = get_redis_client()
        stream_key = "elarion:video_generation:jobs"
        payload = {"job_id": str(job_id)}
        await redis.xadd(stream_key, {"data": json.dumps(payload)})
        print("Job re-enqueued.")

if __name__ == "__main__":
    asyncio.run(main())
