/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const Module=require('node:module');const ts=require('typescript');
const frontend=path.resolve(__dirname,'..');const original=Module._resolveFilename;
Module._resolveFilename=function(name,parent,...rest){if(name.startsWith('@/'))name=path.join(frontend,'src',name.slice(2));return original.call(this,name,parent,...rest);};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,filename);
const {learningApi,mapBackendCourseDetailToFrontendCourse}=require('../src/utils/learningApi.ts');
const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');
const backend={id:'course',slug:'science-fixture',title:'Science Fixture',description:'Actual syllabus',grade:3,thumbnail_url:'https://example.invalid/course',modules:[{id:'module',title:'Module',lessons:[{id:'first',title:'First',estimated_minutes:5,sequence_order:1,status:'published',skill_ids:['skill']},{id:'second',title:'Second',estimated_minutes:10,sequence_order:2,status:'published'}]}]};
const json=(value,status=200)=>new Response(JSON.stringify(value),{status});

test('Course detail fetches authoritative data on every navigation',async()=>{
 const calls=[];global.fetch=async(url)=>{calls.push(String(url));return json(backend);};
 for(let i=0;i<2;i++){const course=await learningApi.getCourse('course');assert.equal(course.title,backend.title);assert.deepEqual(course.lessons.map(l=>l.id),['first','second']);}
 assert.equal(calls.length,2);assert.ok(calls.every(url=>url.endsWith('/courses/course')));
});
test('Lesson verifies membership, enrolls once, then requests fresh lesson/media',async()=>{
 const calls=[];global.fetch=async(url,options={})=>{
  const pathname=new URL(url).pathname;calls.push([pathname,options.method||'GET']);
  if(pathname.endsWith('/courses/course'))return json(backend);
  if(pathname.endsWith('/enrollments')&&options.method==='POST')return json({course_id:'course'});
  if(pathname.endsWith('/lessons/first'))return json({...backend.modules[0].lessons[0],body_markdown:'Real teaching body',video_url:'https://example.invalid/video',thumbnail_url:'https://example.invalid/poster'});
  throw new Error('Unexpected request');
 };
 const result=await learningApi.getLesson('course','first');assert.equal(result.index,0);assert.equal(result.lesson.steps[0].body,'Real teaching body');assert.equal(result.lesson.videoUrl,'https://example.invalid/video');
 assert.deepEqual(calls.map(c=>[c[0].replace('/api/v1',''),c[1]]),[['/courses/course','GET'],['/enrollments','POST'],['/lessons/first','GET']]);
});
test('Existing enrollment retains conflict recovery and denied lessons propagate',async()=>{
 const calls=[];global.fetch=async(url,options={})=>{
  const pathname=new URL(url).pathname;calls.push(pathname);
  if(pathname.endsWith('/courses/course'))return json(backend);
  if(pathname.endsWith('/enrollments'))return json({},409);
  if(pathname.endsWith('/enrollments/me'))return json([{course_id:'course'}]);
  return json({detail:'LESSON_LOCKED'},403);
 };
 await assert.rejects(()=>learningApi.getLesson('course','second'),/access denied/);assert.equal(calls.length,4);
});
test('Wrong-course lesson never enrolls or asks for a media grant',async()=>{
 const calls=[];global.fetch=async(url)=>{calls.push(String(url));return json(backend);};
 await assert.rejects(()=>learningApi.getLesson('course','other'),/does not belong/);assert.equal(calls.length,1);
});
test('Enrollment failure stops lesson grants',async()=>{
 const calls=[];global.fetch=async(url)=>{calls.push(String(url));return calls.length===1?json(backend):json({},403);};
 await assert.rejects(()=>learningApi.getLesson('course','first'),/enroll/);assert.equal(calls.length,2);
});
test('Actual Course and Lesson React routes preserve content, progress and navigation',()=>{
 const course=mapBackendCourseDetailToFrontendCourse(backend);const saved={first:{status:'completed',progress:100}};
 const originalLoad=Module._load;let lessonRoute=false;
 Module._load=function(name,parent,...rest){
  if(name==='next/navigation')return {useParams:()=>({courseId:'course',lessonId:'first'}),useRouter:()=>({push:()=>{}})};
  if(name==='@/contexts/AuthContext')return {useAuth:()=>({user:{id:'fixture',role:'student'}})};
  if(name==='@/contexts/ProgressContext')return {useProgress:()=>({lessons:saved,latestAttempt:()=>undefined,completeLesson:async()=>{},updateLessonProgress:()=>{}})};
  if(name==='@/hooks/useAsync')return {useAsync:fn=>({data:lessonRoute?{course,lesson:{...course.lessons[0],videoUrl:'https://example.invalid/video',steps:[]},index:0}:String(fn).includes('getCourseProgressStats')?{latest_submission_id:null}:course,loading:false,error:null,reload:()=>{}})};
  return originalLoad.call(this,name,parent,...rest);
 };
 try{
  const Course=require('../src/app/(dashboard)/dashboard/courses/[courseId]/page.tsx').default;
  const html=renderToStaticMarkup(React.createElement(Course));
  for(const text of ['Science Fixture','Actual syllabus','1 of 2 lessons','50%','/dashboard/learn/course/second','/dashboard/courses'])assert.ok(html.includes(text),text);
  lessonRoute=true;const Learn=require('../src/app/(dashboard)/dashboard/learn/[courseId]/[lessonId]/page.tsx').default;
  const lessonHtml=renderToStaticMarkup(React.createElement(Learn));
  for(const text of ['First','Back to Course','https://example.invalid/video','/dashboard/courses/course','Next lesson: Second'])assert.ok(lessonHtml.includes(text),text);
 }finally{Module._load=originalLoad;}
});
test('Course click avoids duplicate enrollment; Lesson retains authoritative enrollment',()=>{
 const course=fs.readFileSync(path.join(frontend,'src/app/(dashboard)/dashboard/courses/[courseId]/page.tsx'),'utf8');
 assert.ok(!course.includes('enrollCourse('));
 const source=fs.readFileSync(path.join(frontend,'src/utils/learningApi.ts'),'utf8');assert.ok(source.includes('await this.enrollCourse(courseId)'));
});
