"""
Re-run the Remotion render for the newest video job OUTSIDE the worker and save
the FULL renderer output to backend/render_debug/ so the real error is visible.
Does not change the job or the database.

Usage (from backend/):
    venv\Scripts\python.exe -m scripts.debug_render            # auto concurrency
    venv\Scripts\python.exe -m scripts.debug_render 2          # force 2 browser tabs
"""
import asyncio
import json
import os
import subprocess
import sys
import time
import logging
from pathlib import Path
from sqlalchemy import select

import app.main  # noqa: F401
from app import database
database.engine.echo = False
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

from app.database import AsyncSessionLocal
from app.modules.module6_adaptive.models import VideoGenerationJob
from app.modules.module6_adaptive.services import render_service as rs
from app.shared.s3_client import generate_presigned_url

OUT = Path(__file__).resolve().parents[1] / "render_debug"


async def main():
    concurrency = sys.argv[1] if len(sys.argv) > 1 else "0"
    OUT.mkdir(exist_ok=True)
    async with AsyncSessionLocal() as db:
        job = (await db.execute(select(VideoGenerationJob)
               .where(VideoGenerationJob.audio_manifest_json.isnot(None))
               .order_by(VideoGenerationJob.created_at.desc()).limit(1))).scalar_one_or_none()
        if not job:
            print("No job with audio found."); return
        print(f"Job {job.id} | status={job.status.value}")
        output = str(OUT / "video.mp4")
        payload = rs.build_render_payload(job, output)
        for clip in payload["audio_manifest"]["scenes"]:
            clip["audio_url"] = await generate_presigned_url(clip["audio_key"], expires_in=3600)
    (OUT / "input.json").write_text(json.dumps(payload), encoding="utf-8")
    print("First audio URL:", payload["audio_manifest"]["scenes"][0]["audio_url"][:90], "...")

    env = {**os.environ, "NODE_ENV": "production",
           "VIDEO_OUTPUT_HEIGHT": str(rs.expected_output_size()[1]),
           "VIDEO_RENDER_CONCURRENCY": concurrency}
    cmd = rs.renderer_command() + [str(OUT / "input.json"), output]
    print("Running renderer (concurrency =", concurrency, ") ... this can take a few minutes")
    started = time.monotonic()
    with open(OUT / "stderr.log", "w", encoding="utf-8") as err, open(OUT / "stdout.log", "w", encoding="utf-8") as out:
        proc = subprocess.run(cmd, cwd=str(rs.VIDEO_RENDER_DIR), env=env, stdout=out, stderr=err,
                              encoding="utf-8", errors="replace")
    secs = time.monotonic() - started
    print(f"\nExit code {proc.returncode} after {secs:.0f}s")
    lines = [l for l in (OUT / "stderr.log").read_text(encoding="utf-8", errors="replace").splitlines()
             if not l.startswith("render_progress:")]
    print("----- renderer output (progress lines removed) -----")
    print("\n".join(lines[-60:]))
    print("----- result -----")
    print((OUT / "stdout.log").read_text(encoding="utf-8", errors="replace")[-1500:])
    print(f"Full logs saved in {OUT}")

if __name__ == "__main__":
    asyncio.run(main())
