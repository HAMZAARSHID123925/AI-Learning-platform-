
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS test harness loads production TypeScript. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
const frontend=path.resolve(__dirname,'..');
const original=Module._resolveFilename;
Module._resolveFilename=function(name,parent,...rest){
 if(name.startsWith('@/'))name=path.join(frontend,'src',name.slice(2));
 return original.call(this,name,parent,...rest);
};
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
const {learningApi}=require('../src/utils/learningApi.ts');
const {adminApi}=require('../src/utils/adminApi.ts');
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
const {createCourseCurriculum,newCreationCheckpoint}=require('../src/utils/courseCreation.ts');
const {findOrCreateVideo,videoView}=require('../src/utils/personalizedVideo.ts');
const draft={title:'Fractions',description:'Teaching equal parts',grade:5,subject:'math',skillId:'skill',publish:true,thumbnailFile:new File(['image'],'cover.png',{type:'image/png'}),modules:[{id:'m',title:'Parts',description:'',lessons:[{id:'l',title:'Equal parts',bodyMarkdown:'Notes',videoFile:new File(['video'],'lesson.mp4',{type:'video/mp4'})}]}]};
test('creation singleflight and checkpoint resume preserve course and completed uploads',async()=>{
 const originals={...adminApi},calls=[];let fail=true;
 try {
 adminApi.createCourse=async()=>{calls.push('course');return{id:'course'};};
 adminApi.createModule=async()=>{calls.push('module');return{id:'module'};};
 adminApi.createLesson=async()=>{calls.push('lesson');return{id:'lesson'};};
 adminApi.updateLesson=async()=>{calls.push('notes');};
 adminApi.uploadMedia=async(c,f,type)=>{calls.push(type);if(type==='lesson_video'&&fail){fail=false;throw Error('Transport failed');}};
 adminApi.publishLesson=async()=>{calls.push('publish-lesson');};adminApi.publishCourse=async()=>{calls.push('publish-course');};
 const cp=newCreationCheckpoint();const first=createCourseCurriculum(draft,cp,()=>{});
 assert.equal(first,createCourseCurriculum(draft,cp,()=>{}));await assert.rejects(first,/Transport failed/);
 assert.equal(calls.includes('publish-course'),false);
 assert.equal(await createCourseCurriculum(draft,cp,()=>{}),'course');
 assert.equal(calls.filter(x=>x==='course').length,1);assert.equal(calls.filter(x=>x==='module').length,1);assert.equal(calls.filter(x=>x==='course_thumbnail').length,1);
 assert.deepEqual(calls.slice(-3),['lesson_video','publish-lesson','publish-course']);
 } finally {Object.assign(adminApi,originals);}
});
test('invalid publishing draft writes nothing',async()=>{
 const original=adminApi.createCourse;let writes=0;adminApi.createCourse=async()=>{writes++;};
 try {await assert.rejects(createCourseCurriculum({...draft,modules:[{...draft.modules[0],lessons:[{...draft.modules[0].lessons[0],videoFile:null}]}]},newCreationCheckpoint(),()=>{}),/Publishing requires/);assert.equal(writes,0);}finally{adminApi.createCourse=original;}
});
test('failed direct upload relays before confirmation',async()=>{
 const calls=[];global.fetch=async(url,options)=>{calls.push(String(url).split('/').pop());
 if(String(url).endsWith('/presign'))return json({presigned_url:'https://storage.example/object',upload_id:'key'});
 if(options.method==='PUT')throw new TypeError('CORS blocked');
 if(String(url).endsWith('/relay')){assert.ok(options.body instanceof FormData);return json({uploaded:true});}
 return json({status:'success'});};
 await adminApi.uploadMedia('course',draft.modules[0].lessons[0].videoFile,'lesson_video','lesson');
 assert.deepEqual(calls,['presign','object','relay','confirm']);
});
test('result remount shares create; new submission gets new job; refresh fetches real status',async()=>{
 const originals={...learningApi};let creates=0,reads=0;
 learningApi.requestPersonalizedVideo=async()=>({id:'job-'+(++creates),status:'queued'});
 learningApi.getPersonalizedVideoJob=async(id)=>{reads++;return{id,status:'ready',video_url:'private-signed-url'};};
 try {const [a,b]=await Promise.all([findOrCreateVideo('student','weak','submission-a'),findOrCreateVideo('student','weak','submission-a')]);assert.equal(a.id,b.id);assert.equal(creates,1);assert.equal(reads,2);await findOrCreateVideo('student','weak','submission-b');assert.equal(creates,2);}finally{Object.assign(learningApi,originals);}
});
test('polling terminal states reject ready without playback URL',()=>{
 assert.equal(videoView({status:'ready',video_url:'signed'}),'ready');assert.equal(videoView({status:'ready'}),'failed');assert.equal(videoView({status:'failed'}),'failed');assert.equal(videoView({status:'rendering'}),'preparing');
});

test('confirm failure retries the same private object without another upload',async()=>{
 const file=new File(['video'],'retry-confirm.mp4',{type:'video/mp4'});let presigns=0,puts=0,confirms=0;
 global.fetch=async(url,options)=>{
 if(String(url).endsWith('/presign')){presigns++;return json({presigned_url:'https://storage.example/key',upload_id:'same-key'});}
 if(options.method==='PUT'){puts++;return json({});}
 if(String(url).endsWith('/confirm')){confirms++;return confirms===1?json({message:'Transient failure'},503):json({status:'success'});}
 throw Error('Unexpected request');};
 await assert.rejects(adminApi.uploadMedia('course',file,'lesson_video','lesson'),/Transient failure/);
 await adminApi.uploadMedia('course',file,'lesson_video','lesson');assert.equal(presigns,1);assert.equal(puts,1);assert.equal(confirms,2);
});

test('shared Admin listing loads every backend page without owner filtering',async()=>{
 const original=adminApi.listCourses;const calls=[];
 adminApi.listCourses=async(params)=>{calls.push(params);return{items:[{id:'course-'+params.page}],pages:3};};
 try{assert.deepEqual((await adminApi.listAllCourses()).map(c=>c.id),['course-1','course-2','course-3']);assert.deepEqual(calls.map(c=>c.page),[1,2,3]);assert.ok(calls.every(c=>!('instructor_id' in c)));}finally{adminApi.listCourses=original;}
});

test('settled video request is not kept as stale component state',async()=>{
 const originals={...learningApi};let creates=0;
 learningApi.requestPersonalizedVideo=async(weak,submission)=>{creates++;assert.equal(submission,'saved-submission');return{id:'saved-job',status:'failed'};};
 learningApi.getPersonalizedVideoJob=async()=>({id:'saved-job',status:creates===1?'failed':'ready',video_url:creates===1?null:'private-playback'});
 try{assert.equal((await findOrCreateVideo('refresh-student','refresh-weak','saved-submission')).status,'failed');assert.equal((await findOrCreateVideo('refresh-student','refresh-weak','saved-submission')).status,'ready');assert.equal(creates,2);}finally{Object.assign(learningApi,originals);}
});

test('video restart uses explicit owned retry endpoint and surfaces rejection',async()=>{
 const calls=[];global.fetch=async(url,options)=>{calls.push({url:String(url),method:options.method});return json({detail:'This video belongs to an earlier remediation lifecycle'},409);};
 await assert.rejects(learningApi.retryPersonalizedVideo('owned-job'),/earlier remediation lifecycle/);
 assert.equal(calls[0].method,'POST');assert.ok(calls[0].url.endsWith('/remediation/video-jobs/owned-job/retry'));
});
