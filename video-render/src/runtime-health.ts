/** Local, non-paid worker smoke test: Chromium, frames, audio, H.264 and decoding. */
import {bundle} from '@remotion/bundler';
import {getCompositions,renderMedia} from '@remotion/renderer';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
const browserExecutable=process.env.REMOTION_CHROMIUM_EXECUTABLE_PATH || null;
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cache=path.join(root,'node_modules','.cache');fs.mkdirSync(cache,{recursive:true});
const dir=fs.mkdtempSync(path.join(cache,'runtime-health-'));
const pub=path.join(dir,'public');fs.mkdirSync(pub);
function run(binary:string,args:string[]) {
 const result=spawnSync(binary,args,{encoding:'utf8',timeout:60000,shell:false});
 if(result.error || result.status!==0)throw new Error(`Runtime health executable failed: ${path.basename(binary)}`);
 return result.stdout;
}
try {
 run(process.env.FFMPEG_BINARY || 'ffmpeg',['-v','error','-f','lavfi','-i','sine=frequency=440:duration=2','-y',path.join(pub,'tone.wav')]);
 const entry=path.join(dir,'index.tsx');
 fs.writeFileSync(entry,`import React from 'react';import {registerRoot,Composition,AbsoluteFill,Audio,staticFile} from 'remotion';
 const Health=()=> <AbsoluteFill style={{background:'#182C50',color:'white',justifyContent:'center',alignItems:'center',fontSize:64}}>ELARION renderer health<Audio src={staticFile('tone.wav')}/></AbsoluteFill>;
 registerRoot(()=> <Composition id="Health" component={Health} width={1920} height={1080} fps={30} durationInFrames={60}/>);`);
 const serveUrl=await bundle({entryPoint:entry,publicDir:pub});
 const [composition]=await getCompositions(serveUrl,{browserExecutable});
 const output=path.join(dir,'health.mp4');
 await renderMedia({composition,serveUrl,browserExecutable,codec:'h264',outputLocation:output,concurrency:1});
 const probe=JSON.parse(run(process.env.FFPROBE_BINARY || 'ffprobe',['-v','quiet','-show_streams','-show_format','-of','json',output]));
 if(!probe.streams.some((s:{codec_type:string})=>s.codec_type==='video') || !probe.streams.some((s:{codec_type:string})=>s.codec_type==='audio') || fs.statSync(output).size===0)throw new Error('Health MP4 lacks streams');
 run(process.env.FFMPEG_BINARY || 'ffmpeg',['-v','error','-xerror','-i',output,'-f','null','-']);
 console.log(JSON.stringify({health:'PASS',duration:probe.format.duration,bytes:fs.statSync(output).size,output}));
} finally {fs.rmSync(dir,{recursive:true,force:true});}
