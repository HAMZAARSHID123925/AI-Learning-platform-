"""
M3.5 Dev E2E Render Script (Seed + Render)

Usage:
  python scripts/seed_and_render_dev.py

Creates a mock VideoGenerationJob with a short scene, 
then calls `render_video()` to test the full pipeline.
"""
import sys
import os
import asyncio
import uuid
from dotenv import load_dotenv
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
load_dotenv()

from app.database import AsyncSessionLocal
import app.main  # Load all models
from app.modules.module6_adaptive.models import VideoGenerationJob, VideoJobStatus
from app.modules.module6_adaptive.services.render_service import render_video

async def run():
    async with AsyncSessionLocal() as db:
        print("Seeding a short dev video generation job...")
        
        job_id = uuid.uuid4()
        
        # A minimal 2-second intro scene
        scene_json = {
            "scenes": [
                {
                    "scene_id": "scene_1",
                    "scene_type": "intro",
                    "heading": "Dev Test",
                    "narration": "This is a dev test.",
                    "duration_seconds": 2.0
                }
            ]
        }
        
        audio_manifest_json = {
            "version": 1,
            "provider": "mock",
            "voice_id": "mock",
            "is_mock": True,
            "scenes": [
                {
                    "scene_id": "scene_1",
                    "scene_index": 0,
                    "audio_key": "mock/scene_1.mp3",
                    "audio_url": "https://example.com/mock.mp3", # Will be ignored by Remotion if it fails to load or we just rely on no audio track. But Remotion might fail if the URL is invalid and it tries to fetch it.
                    # Remotion allows ignoring missing audio or we can just not provide URL for mock
                    "format": "mp3",
                    "duration_seconds": 2.0,
                    "planned_duration_seconds": 2.0,
                    "render_duration_seconds": 2.0,
                    "text_hash": "mock",
                    "tts_provider": "mock",
                    "tts_voice_id": "mock",
                    "is_mock": True,
                    "status": "ready"
                }
            ],
            "total_render_duration_seconds": 2.0
        }
        
        asset_manifest_json = {
            "character_version": "elarion-teacher-v1",
            "design_system_version": "1.0",
            "canvas_width": 1920,
            "canvas_height": 1080,
            "frame_rate": 30,
            "scene_slots": [
                {
                    "scene_id": "scene_1",
                    "scene_type": "intro",
                    "template_id": "intro-v1",
                    "remotion_component": "IntroScene",
                    "character_version": "elarion-teacher-v1",
                    "character_pose": "explain_left",
                    "character_expression": "friendly_smile",
                    "character_position": "left",
                    "character_scale": 1.0,
                    "environment_id": "modern-classroom-v1",
                    "active_zones": []
                }
            ]
        }
        
        from sqlalchemy import select
        from app.modules.module1_auth.models import User, UserRole
        
        student = (await db.execute(select(User).where(User.role == UserRole.student).limit(1))).scalar_one_or_none()
        course = (await db.execute(select(Course).limit(1))).scalar_one_or_none()
        submission = (await db.execute(select(Submission).limit(1))).scalar_one_or_none()
        
        # We need a weakness flag, let's get any or mock it if FK allows it
        from app.modules.module5_assessment.models import WeaknessFlag
        flag = (await db.execute(select(WeaknessFlag).limit(1))).scalar_one_or_none()

        job = VideoGenerationJob(
            id=job_id,
            student_id=student.id if student else uuid.uuid4(),
            course_id=course.id if course else uuid.uuid4(),
            submission_id=submission.id if submission else uuid.uuid4(),
            weakness_flag_id=flag.id if flag else uuid.uuid4(),
            status=VideoJobStatus.audio_ready,
            title="E2E Dev Render Test",
            target_duration_seconds=2,
            scene_json=scene_json,
            audio_manifest_json=audio_manifest_json,
            asset_manifest_json=asset_manifest_json,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        db.add(job)
        await db.commit()
        
        print(f"Created job {job.id}. Starting render...")
        
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
