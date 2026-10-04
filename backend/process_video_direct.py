import asyncio
from sqlalchemy import select, text
from app.database import AsyncSessionLocal
from app.modules.module6_adaptive.models import VideoGenerationJob, VideoJobStatus
from app.workers.video_generation_consumer import process_video_generation_job
import logging

logging.basicConfig(level=logging.INFO)

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(text("SELECT id FROM video_generation_jobs WHERE status = 'failed' ORDER BY updated_at DESC LIMIT 1"))
        job_id = res.scalar_one_or_none()
        if not job_id:
            print("No failed job found")
            return
            
        print(f"Acquiring job {job_id}")
        await db.execute(text("UPDATE video_generation_jobs SET status = 'queued' WHERE id = :id"), {"id": job_id})
        await db.commit()
        print("Processing job")
        try:
            res = await process_video_generation_job({"job_id": str(job_id)}, db)
            print(f"Job processing completed: {res}")
        except Exception as e:
            print(f"Job processing failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
