import { learningApi } from './learningApi';
import type { VideoGenerationJob } from '@/types/learning';

const requests = new Map<string,Promise<VideoGenerationJob>>();
export async function findOrCreateVideo(userId: string, weaknessId: string, submissionId: string): Promise<VideoGenerationJob> {
 const key=userId+':'+submissionId+':'+weaknessId;
 let request=requests.get(key);
 if(!request){request=learningApi.requestPersonalizedVideo(weaknessId,submissionId).finally(()=>{requests.delete(key);});requests.set(key,request);}
 const job=await request;
 return learningApi.getPersonalizedVideoJob(job.id);
}
export function videoView(job: VideoGenerationJob): 'preparing' | 'ready' | 'failed' {
 if(job.status==='failed')return 'failed';
 if(job.status==='ready')return job.video_url ? 'ready' : 'failed';
 return 'preparing';
}
export const videoStatusLabels: Record<string,string> = {
 queued:'Your lesson is queued',planning:'Planning your lesson',scripting:'Writing your explanation',
 storyboard_ready:'Your visual lesson is planned',assets_preparing:'Preparing teaching visuals',
 audio_generating:'Recording your narration',audio_ready:'Narration is ready',rendering:'Animating your lesson',
 uploading:'Saving your private video',ready:'Your personalized lesson is ready',failed:'Your lesson could not be completed',
};


export function videoCanResume(job: VideoGenerationJob, now = Date.now()): boolean {
 if(videoView(job)!=='preparing')return false;
 const updated=Date.parse(job.updated_at || job.started_at || job.created_at || '');
 // A healthy long render can run for the backend's bounded 30-minute budget.
 // Never present that normal render as abandoned after only 15 minutes.
 const idleBudget=job.status==='rendering' ? 31*60*1000 : 15*60*1000;
 return Number.isFinite(updated) && now-updated>idleBudget;
}
