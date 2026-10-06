import { adminApi } from './adminApi';
import type { Grade, Subject } from '@/types';

export interface DraftLesson {id: string;title: string;bodyMarkdown: string;videoFile?: File | null;videoName?: string;docFile?: File | null;docName?: string;}
export interface DraftModule {id: string;title: string;description: string;lessons: DraftLesson[];}
export interface CourseDraft {title: string;description: string;grade: Grade;subject: Subject;skillId: string;teacherId?: string;publish: boolean;thumbnailFile?: File | null;modules: DraftModule[];}
export interface CreationCheckpoint {courseId?: string;draftFingerprint?: string;thumbnailUploaded?: boolean;modules: Record<string,string>;lessons: Record<string,string>;completed: Record<string,boolean>;}
export const newCreationCheckpoint = (): CreationCheckpoint => ({modules:{},lessons:{},completed:{}});
const inFlight = new WeakMap<CreationCheckpoint,Promise<string>>();
export function validateCourseDraft(draft: CourseDraft): string | null {
 if (draft.title.trim().length < 3) return 'Enter a course title of at least 3 characters.';
 if (!draft.description.trim()) return 'Please provide a course description.';
 if (!draft.skillId) return 'Choose the curriculum skill assessed by this course.';
 if (!draft.modules.length || draft.modules.some(m => !m.title.trim() || !m.lessons.length || m.lessons.some(l => !l.title.trim()))) return 'Each module needs a title and at least one titled lesson.';
 if (draft.publish && draft.modules.some(m => m.lessons.some(l => !l.videoFile || !l.bodyMarkdown.trim()))) return 'Publishing requires notes and a video for every lesson. Save a draft to finish later.';
 const media = [draft.thumbnailFile,...draft.modules.flatMap(m => m.lessons.map(l => l.videoFile))].filter((f): f is File => Boolean(f));
 if (draft.thumbnailFile && draft.thumbnailFile.size > 5*1024*1024) return 'Thumbnail must be at most 5 MB.';
 if (draft.modules.some(m=>m.lessons.some(l=>l.videoFile && l.videoFile.size>500*1024*1024))) return 'Lesson video must be at most 500 MB.';
 if (media.some(file => !file.size)) return 'An attached media file is empty.';
 if (draft.thumbnailFile && !['image/jpeg','image/png','image/webp'].includes(draft.thumbnailFile.type)) return 'Choose a JPEG, PNG or WEBP thumbnail.';
 if (draft.modules.some(m => m.lessons.some(l => l.videoFile && !['video/mp4','video/webm'].includes(l.videoFile.type)))) return 'Choose an MP4 or WEBM lesson video.';
 return null;
}
export function createCourseCurriculum(draft: CourseDraft, checkpoint: CreationCheckpoint, progress: (message:string)=>void): Promise<string> {
 const existing = inFlight.get(checkpoint); if (existing) return existing;
 const operation = create(draft,checkpoint,progress).finally(()=>inFlight.delete(checkpoint));
 inFlight.set(checkpoint,operation);return operation;
}
async function create(draft: CourseDraft, cp: CreationCheckpoint, progress: (message:string)=>void): Promise<string> {
 const error=validateCourseDraft(draft);if(error)throw new Error(error);
 const fingerprint=JSON.stringify(draft,(_key,value)=>value instanceof File ? {name:value.name,size:value.size,lastModified:value.lastModified,type:value.type}:value);
 if(cp.courseId && cp.draftFingerprint && cp.draftFingerprint!==fingerprint)throw new Error('This draft is already saved. Retry with the original form values, or edit your saved draft in the course builder.');
 cp.draftFingerprint=fingerprint;
 if (!cp.courseId) {
  progress('Saving course details…');
  const base=draft.title.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const course=await adminApi.createCourse({title:draft.title.trim(),description:draft.description.trim(),grade:draft.grade,slug:`${draft.subject}-${base}`,instructor_id:draft.teacherId || undefined});
  if(!course.id)throw new Error('Server did not return a course ID.');cp.courseId=course.id;
 }
 const courseId=cp.courseId;
 if(!courseId)throw new Error('Server did not return a course ID.');
 if(draft.thumbnailFile && !cp.thumbnailUploaded){progress('Uploading thumbnail…');await adminApi.uploadMedia(courseId,draft.thumbnailFile,'course_thumbnail');cp.thumbnailUploaded=true;}
 for(const [mIndex,module] of draft.modules.entries()){
  progress(`Preparing module ${mIndex+1}…`);
  if(!cp.modules[module.id])cp.modules[module.id]=(await adminApi.createModule(courseId,{title:module.title.trim(),description:module.description.trim()||undefined,sequence_order:mIndex+1})).id;
  for(const [lIndex,lesson] of module.lessons.entries()){
   const key=module.id+':'+lesson.id;
   if(!cp.lessons[key])cp.lessons[key]=(await adminApi.createLesson(cp.modules[module.id],{title:lesson.title.trim(),sequence_order:lIndex+1,skill_ids:[draft.skillId]})).id;
   const lessonId=cp.lessons[key];
   if(!cp.completed[key+':notes']){await adminApi.updateLesson(lessonId,{body_markdown:lesson.bodyMarkdown.trim()});cp.completed[key+':notes']=true;}
   if(lesson.videoFile && !cp.completed[key+':video']){progress(`Uploading lesson ${lIndex+1} video…`);await adminApi.uploadMedia(courseId,lesson.videoFile,'lesson_video',lessonId);cp.completed[key+':video']=true;}
   if(draft.publish && !cp.completed[key+':published']){await adminApi.publishLesson(lessonId);cp.completed[key+':published']=true;}
  }
 }
 if(draft.publish && !cp.completed.published){progress('Publishing your complete course…');await adminApi.publishCourse(courseId);cp.completed.published=true;}
 return courseId;
}
