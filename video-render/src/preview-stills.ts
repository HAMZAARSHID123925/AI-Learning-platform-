/** Actual render-payload visual QA: still images only, never a second video. */
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {getCompositions,renderStill} from '@remotion/renderer';
import type {RenderPayload} from './types';
const payload:RenderPayload=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts')});
const base=(await getCompositions(serveUrl,{inputProps:{payload}})).find(c=>c.id==='ElarionLesson')!;
const fps=payload.video_config.fps;const durations=payload.scenes.map(s=>Math.ceil(payload.audio_manifest.scenes.find(c=>c.scene_id===s.scene_id)!.render_duration_seconds*fps));
const composition={...base,durationInFrames:durations.reduce((a,b)=>a+b,0)};
let from=0;for(let i=0;i<durations.length;i++){
 if(i===0||payload.scenes[i].diagram?.kind!=='none'||i===durations.length-1){
  await renderStill({composition,serveUrl,inputProps:{payload},frame:from+Math.floor(durations[i]*.8),output:path.join(out,`scene-${i+1}.png`)});
 }
 from+=durations[i];
}
console.log(JSON.stringify({preview_stills:'complete',scene_count:durations.length}));
