
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
test('empty backend catalog stays empty instead of becoming a seeded catalog',async()=>{
 global.fetch=async()=>json({items:[],total:0});
 assert.deepEqual(await learningApi.listCourses(5),[]);
});
test('denied course cannot fall back to a demo course',async()=>{
 global.fetch=async()=>json({detail:'Forbidden'},403);
 await assert.rejects(()=>learningApi.getCourse('g5-fractions'),/unavailable/);
});
test('failed completion rejects instead of reporting local success',async()=>{
 global.fetch=async()=>json({detail:'Grade mismatch'},403);
 await assert.rejects(()=>learningApi.saveLessonProgress('controlled',{status:'completed',progress:100}),/save completion/);
});
test('a lesson from another course is rejected before enrollment or playback',async()=>{
 let calls=0;
 global.fetch=async()=>{calls++;return json({id:'course-a',title:'Math',grade:5,modules:[]});};
 await assert.rejects(()=>learningApi.getLesson('course-a','foreign-lesson'),/does not belong/);
 assert.equal(calls,1);
});
test('failed R2 PUT never confirms an absent upload',async()=>{
 let confirmed=false;
 global.fetch=async url=>{
  if(String(url).endsWith('/uploads/presign'))return json({presigned_url:'https://upload.example.com/object',upload_id:'controlled'});
  if(String(url).endsWith('/uploads/confirm')){confirmed=true;return json({status:'success'});}
  return new Response('',{status:403});
 };
 await assert.rejects(()=>adminApi.uploadMedia('course',new File(['media'],'clip.mp4',{type:'video/mp4'}),'lesson_video','lesson'),/Storage upload failed/);
 assert.equal(confirmed,false);
});
test('builder adapter retains actual notes and curriculum tags',async()=>{
 global.fetch=async()=>json({id:'course',status:'draft',title:'Math',grade:5,modules:[{id:'module',lessons:[{id:'lesson',title:'Algebra',body_markdown:'Actual notes',skill_ids:['real-skill'],status:'draft'}]}]});
 const course=await adminApi.getCourseDetail('course');
 assert.equal(course.status,'draft');
 assert.equal(course.lessons[0].bodyMarkdown,'Actual notes');
 assert.deepEqual(course.lessons[0].skillIds,['real-skill']);
});
test('repeat enrollment is accepted only after an owned active enrollment is retrieved',async()=>{
 global.fetch=async(url,options)=>options.method==='POST'?json({message:'Duplicate'},409):json([{course_id:'course',status:'active'}]);
 assert.equal((await learningApi.enrollCourse('course')).course_id,'course');
});

const {passwordError,registerAccount}=require('../src/lib/signup.ts');
test('weak passwords are rejected before sending a signup request',async()=>{
 let called=false;global.fetch=async()=>{called=true;return json({});};
 const result=await registerAccount({name:'Check User',email:'check@example.com',password:'weak',role:'student'});
 assert.equal(result.success,false);assert.equal(called,false);
});
test('strong passwords including surrounding spaces are sent without alteration',async()=>{
 const password=' StrongPassword1! ';assert.equal(passwordError(password),null);
 global.fetch=async(url,options)=>{assert.equal(JSON.parse(options.body).password,password);return json({user_id:'real-id'},201);};
 assert.equal((await registerAccount({name:'Check User',email:'check@example.com',password,role:'student'})).success,true);
});
test('signup reports backend validation instead of a generic database error',async()=>{
 global.fetch=async()=>json({detail:[{msg:'Value error, Password must contain an uppercase letter.'}]},422);
 const result=await registerAccount({name:'Check User',email:'check@example.com',password:'StrongPassword1!',role:'student'});
 assert.match(result.error,/uppercase/);
});
test('duplicate signup directs the existing account to login',async()=>{
 global.fetch=async()=>json({message:'User with this email already exists.'},409);
 const result=await registerAccount({name:'Check User',email:'check@example.com',password:'StrongPassword1!',role:'student'});
 assert.match(result.error,/already has an account.*sign in/);
});

const {createLessonCompletionSaver}=require('../src/lib/lesson-completion.ts');
test('completion waits for persistence and shares simultaneous duplicate clicks',async()=>{
 let resolve,calls=0,settled=false;
 const deferred=new Promise(r=>{resolve=r;});
 const save=createLessonCompletionSaver(async(id,progress)=>{calls++;assert.equal(id,'lesson-1');assert.equal(progress.status,'completed');await deferred;});
 const first=save('lesson-1',{correct:1,total:1});
 const second=save('lesson-1',{correct:1,total:1});
 assert.equal(first,second);
 first.then(()=>{settled=true;});
 await Promise.resolve();assert.equal(calls,1);assert.equal(settled,false);
 resolve();await first;assert.equal(settled,true);
 await save('lesson-1',{correct:1,total:1});assert.equal(calls,1);
});
test('failed completion remains a failure and can be retried',async()=>{
 let calls=0;
 const save=createLessonCompletionSaver(async()=>{if(++calls===1)throw new Error('Denied');});
 await assert.rejects(save('lesson-1',{correct:0,total:0}),/Denied/);
 await save('lesson-1',{correct:0,total:0});assert.equal(calls,2);
});
test('completion keeps lesson IDs separate during navigation',async()=>{
 const ids=[];const save=createLessonCompletionSaver(async id=>{ids.push(id);});
 await Promise.all([save('lesson-1',{correct:0,total:0}),save('lesson-2',{correct:0,total:0})]);
 assert.deepEqual(ids,['lesson-1','lesson-2']);
});
test('completion confirmation is scoped to a signed-in identity',async()=>{
 let calls=0;const persist=async()=>{calls++;};
 const firstIdentity=createLessonCompletionSaver(persist),secondIdentity=createLessonCompletionSaver(persist);
 await firstIdentity('lesson-1',{correct:0,total:0});await secondIdentity('lesson-1',{correct:0,total:0});
 assert.equal(calls,2);
});
