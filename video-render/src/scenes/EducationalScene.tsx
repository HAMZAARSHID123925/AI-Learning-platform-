import React from 'react';
import {AbsoluteFill,useCurrentFrame,interpolate} from 'remotion';
import {SceneData} from '../types';
import {IllustratedTeacher} from '../components/IllustratedTeacher';
const ease=(f:number,start:number,span=16)=>interpolate(f,[start,start+span],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export const EducationalScene:React.FC<{scene:SceneData;durationFrames:number;audioFrames:number;index:number}>=({scene,durationFrames,audioFrames,index})=>{
 const f=useCurrentFrame(),duration=Math.max(1,audioFrames),points=scene.on_screen_text||scene.bullets||[scene.heading||''];
 const diagram=scene.diagram,hasDiagram=diagram&&diagram.kind!=='none',enter=ease(f,0,12),exit=1-ease(f,durationFrames-10,10);
 const chunks=scene.narration.match(/(?:\S+\s*){1,10}/g)||[scene.narration],counts=chunks.map(c=>c.trim().split(/\s+/).length),total=counts.reduce((a,b)=>a+b,0);let sum=0;
 const ci=counts.findIndex(n=>{sum+=n;return f/duration<sum/total;});
 const reveal=(i:number,count:number)=>ease(f,18+(i/Math.max(1,count))*duration*.65);
 return <AbsoluteFill style={{background:index%2?'#EEF4FF':'#FFF8EE',fontFamily:'Arial,sans-serif',color:'#182C50'}}>
 <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 10% 35%, #D9E6FF 0, transparent 45%)'}}/>
 <div style={{position:'absolute',left:85,top:50,fontSize:25,fontWeight:700,letterSpacing:3,color:'#476596'}}>ELARION · PERSONALIZED LEARNING</div>
 <div style={{position:'absolute',left:70,bottom:145}}><IllustratedTeacher speakingFrames={audioFrames} pose={scene.character_pose}/></div>
 <div style={{position:'absolute',left:510,right:95,top:110,bottom:165,borderRadius:35,background:'white',boxShadow:'0 12px 45px #24427214',padding:'40px 48px',opacity:(.35+.65*enter)*(.35+.65*exit),transform:`translateX(${scene.transition==='slide'?(1-enter)*45:0}px)`}}>
 <div style={{fontSize:22,color:'#6D57B4',fontWeight:700,letterSpacing:2,marginBottom:18}}>{scene.scene_type.replaceAll('_',' ').toUpperCase()}</div>
 <h1 style={{fontSize:56,lineHeight:1.12,margin:'0 0 26px',maxHeight:130}}>{scene.heading}</h1>
 <div style={{display:'flex',gap:18,flexDirection:hasDiagram?'row':'column',height:hasDiagram?undefined:440}}>{points.map((text,i)=><div key={i} style={{flex:1,display:'flex',alignItems:'center',opacity:reveal(i,points.length),transform:`translateY(${(1-reveal(i,points.length))*14}px)`,padding:hasDiagram?'15px 18px':'20px 26px',background:scene.scene_type==='recap'?'#ECF8F0':'#F0F3FF',borderRadius:18,borderLeft:'6px solid #7663CD',fontSize:hasDiagram?30:40,lineHeight:1.25,fontWeight:600}}>{text}</div>)}</div>
 {hasDiagram&&<svg viewBox="0 0 1100 410" style={{width:'100%',height:370,marginTop:20,overflow:'visible'}}>
 {diagram.kind==='fraction_bars'&&diagram.labels.map((label,i)=>{const y=410/(diagram.labels.length+1)*(i+1),n=diagram.denominators[i],v=diagram.values[i];return <g key={i} opacity={reveal(i,diagram.labels.length)}><text x="10" y={y+20} fontSize="36" fontWeight="bold" fill="#182C50">{label}</text>{Array.from({length:n},(_,j)=><rect key={j} x={340+j*700/n} y={y-22} width={700/n} height="64" rx="0" fill={j<v?'#7261CB':'#E5EAF5'} stroke="#384D81" strokeWidth="2"/>)}</g>;})}
 {diagram.kind==='number_line'&&<><line x1="80" y1="210" x2="1010" y2="210" stroke="#384D81" strokeWidth="8"/><text x="72" y="264" fontSize="32">0</text><text x="1002" y="264" fontSize="32">1</text>{diagram.values.map((v,i)=><g key={i} opacity={reveal(i,diagram.values.length)}><circle cx={80+v*930} cy="210" r="13" fill="#7261CB"/><line x1={80+v*930} y1="210" x2={80+v*930} y2={i%2?300:130} stroke="#7261CB" strokeWidth="3"/><text x={80+v*930} y={i%2?340:110} textAnchor="middle" fontSize="34">{diagram.labels[i]}</text></g>)}</>}
 {['equation_steps','process','comparison','cycle'].includes(diagram.kind)&&diagram.labels.map((label,i)=>{const cols=2,w=1000/cols,x=25+(i%cols)*w,y=(410-Math.ceil(diagram.labels.length/cols)*170)/2+Math.floor(i/cols)*170;return <g key={i} opacity={reveal(i,diagram.labels.length)}><rect x={x} y={y} width={w-24} height="130" rx="18" fill={i%2?'#EDF8F2':'#EEE9FA'} stroke="#C1C9E1" strokeWidth="2"/><text x={x+20} y={y+37} fontSize="23" fill="#6D57B4">{diagram.kind==='comparison'?'COMPARE':`STEP ${i+1}`}</text><foreignObject x={x+16} y={y+52} width={w-50} height="75"><div style={{fontSize:32,lineHeight:1.05,fontWeight:700,textAlign:'center'}}>{label}</div></foreignObject>{i<diagram.labels.length-1&&diagram.kind!=='comparison'&&(i%2?<text x={x+60} y={y+157} fontSize="36" fill="#6D57B4">↙</text>:<g><line x1={x+w-18} y1={y+65} x2={x+w-6} y2={y+65} stroke="#6D57B4" strokeWidth="3"/><polygon points={`${x+w-6},${y+65} ${x+w-12},${y+60} ${x+w-12},${y+70}`} fill="#6D57B4"/></g>)}{diagram.kind==='cycle'&&i===diagram.labels.length-1&&<text x="400" y="399" fontSize="32" fill="#6D57B4">↶ repeat the cycle</text>}</g>;})}
 </svg>}
 </div>
 <div style={{position:'absolute',left:110,right:110,bottom:35,minHeight:85,borderRadius:20,background:'#182C50',color:'white',padding:'19px 35px',fontSize:32,lineHeight:1.3,textAlign:'center'}}>{chunks[ci<0?chunks.length-1:ci]}</div>
 </AbsoluteFill>;
};
