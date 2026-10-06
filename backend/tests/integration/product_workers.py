"""Local current-source workers; new consumer groups start at the current stream tail.
No existing groups/pending events are reset, and historical paid video jobs are not replayed.
Run before the controlled assessment. Groups are persisted in the local evidence state.
"""
import asyncio,json,sys,logging
from pathlib import Path
from dotenv import load_dotenv
ROOT=Path(__file__).resolve().parents[3];sys.path.insert(0,str(ROOT/'backend'));load_dotenv(ROOT/'backend/.env')
from app.database import engine
engine.echo=False
logging.disable(logging.CRITICAL)
from app.config import get_settings
from app.shared.redis_client import get_redis_client
from app.workers import adaptive_consumer as adaptive,video_generation_consumer as video
from app.modules.module6_adaptive.services import render_service
import os,shutil,re
invoke=render_service.invoke_remotion_render
def capture(input_path,output_path):
 shutil.copyfile(input_path,Path(os.environ['TEMP'])/'elarion-latest-flow/product-render-input.json')
 result=invoke(input_path,output_path)
 report={'success':result.success,'duration_seconds':result.duration_seconds,'error':re.sub(r'https?://[^\s]+','[URL REDACTED]',result.error or '')}
 Path(__file__).with_name('product_issues_render_diagnostics.json').write_text(json.dumps(report,indent=2))
 print(json.dumps({'real_render':report}),flush=True)
 return result
render_service.invoke_remotion_render=capture
async def main():
 state=Path(__file__).with_name('product_issues_state.json');ids=json.loads(state.read_text())
 redis=get_redis_client();prefix=get_settings().REDIS_KEY_PREFIX
 for module,stream,name in [(adaptive,':events:test_graded','adaptive'),(video,':video_generation:jobs','video')]:
  group='elarion-product-'+ids['tag']+'-'+name
  module.CONSUMER_GROUP=group
  try:await redis.xgroup_create(prefix+stream,group,id='$',mkstream=True)
  except Exception as exc:
   if 'BUSYGROUP' not in str(exc):raise
 print('CURRENT_SOURCE_ADAPTIVE_AND_VIDEO_WORKERS_LISTENING_FOR_NEW_EVENTS',flush=True)
 await asyncio.gather(adaptive.run_consumer_loop(),video.run_consumer_loop())
if __name__=='__main__':asyncio.run(main())
