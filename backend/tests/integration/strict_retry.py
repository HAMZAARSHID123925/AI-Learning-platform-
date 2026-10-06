"""Explicit scoped retry of the user's single controlled real job."""
import asyncio,json,uuid
from pathlib import Path
import strict_workers
from app.database import engine,AsyncSessionLocal
from app.workers.video_generation_consumer import process_video_generation_job
engine.echo=False
async def main():
 ids=json.loads(Path(__file__).with_name('strict_runtime_state.json').read_text())
 async with AsyncSessionLocal() as db:
  result=await process_video_generation_job({'job_id':ids['video_job']},db)
  print(json.dumps({'scoped_retry':result}),flush=True)
 await engine.dispose()
asyncio.run(main())
