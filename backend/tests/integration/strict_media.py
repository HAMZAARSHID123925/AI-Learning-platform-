"""Inspect the exact controlled READY private MP4, without printing signed URLs."""
import asyncio,json,os,sys,subprocess,urllib.request,hashlib,re
from pathlib import Path
from sqlalchemy import text
from dotenv import load_dotenv
ROOT=Path(__file__).resolve().parents[3];sys.path.insert(0,str(ROOT/'backend'));load_dotenv(ROOT/'backend/.env')
from app.database import engine,AsyncSessionLocal
from app.shared.s3_client import generate_presigned_url
engine.echo=False
async def main():
 ids=json.loads(Path(__file__).with_name('strict_runtime_state.json').read_text())
 async with AsyncSessionLocal() as db:
  j=(await db.execute(text('select status,video_object_key,scene_json,audio_manifest_json from video_generation_jobs where id=:j'),{'j':ids['video_job']})).mappings().one()
  if j['status']!='ready': print(json.dumps({'status':j['status']}));return
  url=await generate_presigned_url(j['video_object_key'],expires_in=600)
  local=Path(os.environ['TEMP'])/'elarion-latest-flow';mp4=local/'strict-personalized.mp4'
  urllib.request.urlretrieve(url,mp4)
  meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(mp4)]))
  decode=subprocess.run(['ffmpeg','-v','error','-i',str(mp4),'-f','null','-'],capture_output=True,text=True)
  levels=subprocess.run(['ffmpeg','-i',str(mp4),'-map','0:a:0','-af','volumedetect','-vn','-f','null','-'],capture_output=True,text=True)
  viz=Path('C:/Users/ali/.codex/visualizations/2026/10/04/01a10723-f413-72c2-9cfb-6802e3acc7f1');times=[];offset=0
  for clip in j['audio_manifest_json']['scenes']:
   times.append(offset+min(8,float(clip['duration_seconds'])*.6));offset+=float(clip['render_duration_seconds'])
  for index,stamp in enumerate(times,1):
   subprocess.run(['ffmpeg','-v','error','-ss',str(stamp),'-i',str(mp4),'-frames:v','1','-update','1','-y',str(viz/f'elarion-strict-frame-{index}.png')],check=True,capture_output=True)
  for label,stamp in [('entrance',.25),('transition',j['audio_manifest_json']['scenes'][0]['render_duration_seconds']+.15)]:
   subprocess.run(['ffmpeg','-v','error','-ss',str(stamp),'-i',str(mp4),'-frames:v','1','-update','1','-y',str(viz/f'elarion-strict-{label}.png')],check=True,capture_output=True)
  report={'job_id':ids['video_job'],'mp4_local':str(mp4),'sha256':hashlib.sha256(mp4.read_bytes()).hexdigest(),'bytes':mp4.stat().st_size,'duration':meta['format']['duration'],'streams':[{k:v for k,v in stream.items() if k in ['codec_type','codec_name','width','height','r_frame_rate','duration','sample_rate','channels']} for stream in meta['streams']],'full_decode_pass':decode.returncode==0 and not decode.stderr.strip(),'audio_levels':re.findall(r'(?:mean|max)_volume: [^\n]+',levels.stderr),'is_mock':j['audio_manifest_json'].get('is_mock'),'frame_times':times,'scene_diagrams':[s['diagram']['kind'] for s in j['scene_json']['scenes']]}
  Path(__file__).with_name('strict_media_evidence.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
 await engine.dispose()
asyncio.run(main())
