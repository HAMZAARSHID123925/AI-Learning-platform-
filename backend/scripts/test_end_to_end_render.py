"""
M3.5 Dev E2E Render Script

Usage:
  python scripts/test_end_to_end_render.py

Finds a VideoGenerationJob that is in `audio_ready` state,
and directly calls `render_video()` to test the full pipeline.
"""
import sys
import os
import asyncio
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
load_dotenv()

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.modules.module6_adaptive.models import VideoGenerationJob, VideoJobStatus
from app.modules.module6_adaptive.services.render_service import render_video

async def run():
    async with AsyncSessionLocal() as db:
        print("Looking for an 'audio_ready' VideoGenerationJob...")
        stmt = select(VideoGenerationJob).where(VideoGenerationJob.status == VideoJobStatus.audio_ready).limit(1)
        res = await db.execute(stmt)
        job = res.scalar_one_or_none()
        
        if not job:
            print("No job in 'audio_ready' found.")
            print("Let's look for ANY job with scene_json and audio_manifest_json, and force it to audio_ready.")
            
            stmt = select(VideoGenerationJob).where(
                VideoGenerationJob.scene_json.is_not(None),
                VideoGenerationJob.audio_manifest_json.is_not(None)
            ).limit(1)
            res = await db.execute(stmt)
            job = res.scalar_one_or_none()
            
            if not job:
                print("No suitable job found at all! You may need to run M3.4 again.")
                return
            
            print(f"Found job {job.id} in state {job.status.value}. Forcing to audio_ready.")
            job.status = VideoJobStatus.audio_ready
            await db.commit()
            
        print(f"Starting render for job: {job.id}")
        try:
            await render_video(job.id, db)
            print("✅ Render pipeline complete!")
            
            await db.refresh(job)
            print(f"Final Job State: {job.status.value}")
            print(f"Video URL: {job.video_url}")
        except Exception as e:
            print(f"❌ Render failed: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run())
