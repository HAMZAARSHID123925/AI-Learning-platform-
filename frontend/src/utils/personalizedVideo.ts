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
