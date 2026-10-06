import React from 'react';
import {Composition,AbsoluteFill,Sequence,Audio} from 'remotion';
import {EducationalScene} from './scenes/EducationalScene';
import {RenderPayload} from './types';
import {CANVAS} from './design';
export type ElarionLessonProps = {payload:RenderPayload|null;};
/** Audio manifests contain measured narration plus a bounded pause. No timeline gaps. */
export const ElarionLesson:React.FC<ElarionLessonProps>=({payload})=>{
 if(!payload)return <AbsoluteFill style={{background:'#FFF8EE',color:'#182C50',justifyContent:'center',alignItems:'center',fontSize:48}}>ELARION — load a real render payload to preview</AbsoluteFill>;
 const fps=payload.video_config.fps;let from=0;
 const timeline=payload.scenes.map(scene=>{
  const clip=payload.audio_manifest.scenes.find(c=>c.scene_id===scene.scene_id)!;
  const durationFrames=Math.ceil(clip.render_duration_seconds*fps);
  const entry={scene,clip,from,durationFrames};from+=durationFrames;return entry;
 });
 return <AbsoluteFill style={{background:'#FFF8EE'}}>{timeline.map(({scene,clip,from,durationFrames},index)=><Sequence key={scene.scene_id} from={from} durationInFrames={durationFrames}>
  <EducationalScene scene={scene} durationFrames={durationFrames} audioFrames={Math.ceil(clip.duration_seconds*fps)} index={index}/>
  {clip.audio_url && <Audio src={clip.audio_url}/>}
 </Sequence>)}</AbsoluteFill>;
};
export const RemotionRoot:React.FC=()=> <Composition id="ElarionLesson" component={ElarionLesson} width={CANVAS.width} height={CANVAS.height} fps={CANVAS.fps} durationInFrames={900} defaultProps={{payload:null}}/>;
