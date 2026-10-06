'use client';
import React, {useEffect,useState} from 'react';
import {findOrCreateVideo,videoView,videoStatusLabels,videoCanResume} from '@/utils/personalizedVideo';
import {learningApi} from '@/utils/learningApi';
import type {VideoGenerationJob} from '@/types/learning';

export function PersonalizedVideoPanel({userId,weaknessId,submissionId,title}: {userId:string;weaknessId:string;submissionId:string;title:string}) {
 const [job,setJob]=useState<VideoGenerationJob | null>(null);
 const [error,setError]=useState<string | null>(null);
 const [playbackError,setPlaybackError]=useState(false);
 const [retry,setRetry]=useState(0);
 const [retrying,setRetrying]=useState(false);
 const [abandoned,setAbandoned]=useState(false);
 useEffect(()=>{
  let active=true;let timer:ReturnType<typeof setTimeout>;
  const display=(value:VideoGenerationJob)=>{if(!active)return;setJob(value);setError(null);setAbandoned(videoCanResume(value));if(videoView(value)==='preparing')timer=setTimeout(()=>void poll(value.id),5000);};
  const poll=async(id:string)=>{try{display(await learningApi.getPersonalizedVideoJob(id));}catch(cause){if(active){setError(cause instanceof Error?cause.message:'Could not check your lesson.');timer=setTimeout(()=>void poll(id),15000);}}};
  void findOrCreateVideo(userId,weaknessId,submissionId).then(display).catch(cause=>{if(active)setError(cause instanceof Error?cause.message:'Could not prepare your lesson.');});
  return()=>{active=false;clearTimeout(timer);};
 },[userId,weaknessId,submissionId,retry]);
 const restart=async()=>{if(!job || retrying)return;setRetrying(true);try{setJob(await learningApi.retryPersonalizedVideo(job.id));setError(null);setRetry(n=>n+1);}catch(cause){setError(cause instanceof Error?cause.message:'Could not retry your lesson.');}finally{setRetrying(false);}};
 const refreshPlayback=async()=>{if(!job)return;try{const refreshed=await learningApi.getPersonalizedVideoJob(job.id);setJob(refreshed);setPlaybackError(false);}catch{setError('Could not refresh playback. Please try again.');}};
 const view=job?videoView(job):'preparing';
 return <section aria-label="Personalized video lesson" className="rounded-2xl border-2 border-line bg-white p-5 sm:p-7">
  <h3 className="text-xl font-black">{job?.title || title}</h3>
  {error ? <div role="alert" className="mt-4"><p>{error}</p><button disabled={retrying} className="mt-3 rounded-full border-2 border-line px-5 py-2 font-bold disabled:opacity-50" onClick={()=>view==='failed' ? void restart() : setRetry(n=>n+1)}>{view==='failed' ? (retrying ? 'Retrying…' : 'Retry video') : 'Check again'}</button></div> :
   view==='ready' && job?.video_url ? <div className="mt-4">
    <video key={job.video_url} aria-label="Your personalized lesson" className="aspect-video w-full rounded-2xl bg-black" controls playsInline preload="metadata" src={job.video_url} poster={job.thumbnail_url || undefined} onError={()=>setPlaybackError(true)} />
    {playbackError && <div role="alert" className="mt-3"><p>Playback could not load. Refresh the private playback link and try again.</p><button className="mt-2 rounded-full border-2 border-line px-5 py-2 font-bold" onClick={()=>void refreshPlayback()}>Refresh playback</button></div>}
   </div> : view==='failed' ? <div role="alert" className="mt-4"><p>Your personalized lesson could not be completed. {job?.error_code ? `Reference: ${job.error_code}.` : 'Please contact your teacher.'}</p><button disabled={retrying} className="mt-3 rounded-full border-2 border-line px-5 py-2 font-bold disabled:opacity-50" onClick={()=>void restart()}>{retrying ? 'Retrying…' : 'Retry video'}</button><p className="mt-2 text-sm">Retries this saved lesson and reuses completed preparation.</p></div> :
    <div role="status" aria-live="polite" className="mt-5 rounded-2xl bg-surface p-5"><p className="font-bold">Preparing your personalized lesson…</p><p className="mt-2 text-sm">{job ? videoStatusLabels[job.status] || job.status : 'Finding your saved video or starting its preparation'}</p><p className="mt-2 text-xs text-ink-muted">This page checks real progress automatically. Your video will appear here when ready.</p>{abandoned && <button disabled={retrying} className="mt-3 rounded-full border-2 border-line px-5 py-2 font-bold" onClick={()=>void restart()}>Resume preparation</button>}</div>}
 </section>;
}
