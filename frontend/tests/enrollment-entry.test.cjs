/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const frontend=path.resolve(__dirname,'..'),resolve=Module._resolveFilename;
Module._resolveFilename=function(name,parent,...rest){if(name.startsWith('@/'))name=path.join(frontend,'src',name.slice(2));return resolve.call(this,name,parent,...rest);};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,filename);
const {learningApi}=require('../src/utils/learningApi.ts');
const json=(value,status=200)=>new Response(JSON.stringify(value),{status});
const course={id:'course',slug:'science',title:'Science',grade:3,modules:[{id:'module',lessons:[{id:'lesson',title:'Lesson',sequence_order:1,estimated_minutes:5,status:'published'}]}]};
const enrollment={id:'existing',student_id:'student',course_id:'course',status:'active'};
for(const status of [200,201])test(`ensure enrollment consumes authoritative ${status} response without recovery`,async()=>{
 const calls=[];global.fetch=async(url,options)=>{calls.push([new URL(url).pathname,options.method]);return json(enrollment,status);};
 assert.deepEqual(await learningApi.enrollCourse('course'),enrollment);assert.equal(calls.length,1);assert.ok(calls[0][0].endsWith('/enrollments'));assert.equal(calls[0][1],'POST');
});
test('unrelated conflict is an error and never falls back to an enrollment list',async()=>{
 const calls=[];global.fetch=async url=>{calls.push(String(url));return json({},409);};
 await assert.rejects(()=>learningApi.enrollCourse('course'),/Failed to enroll/);assert.equal(calls.length,1);
});
test('fresh Course membership precedes ensure, which completes before Lesson access',async()=>{
 const calls=[];let releaseEnsure;const blocked=new Promise(resolve=>{releaseEnsure=resolve;});
 global.fetch=async(url,options={})=>{
  const pathname=new URL(url).pathname;calls.push(pathname);
  if(pathname.endsWith('/courses/course'))return json(course);
  if(pathname.endsWith('/enrollments')){await blocked;return json(enrollment,201);}
  if(pathname.endsWith('/lessons/lesson'))return json({...course.modules[0].lessons[0],body_markdown:'Authoritative content',video_url:'https://example.invalid/video'});
  throw new Error('Unexpected request');
 };
 const pending=learningApi.getLesson('course','lesson');
 while(calls.length<2)await new Promise(resolve=>setImmediate(resolve));
 assert.equal(calls.length,2);assert.ok(!calls.some(p=>p.includes('/lessons/')));
 releaseEnsure();const result=await pending;assert.equal(result.lesson.steps[0].body,'Authoritative content');assert.equal(calls.length,3);
 assert.ok(!calls.some(p=>p.endsWith('/enrollments/me')));
});
test('first navigation and repeat use the same enrollment without recreating it',async()=>{
 const calls=[];let creates=0,existing=null;
 global.fetch=async(url,options={})=>{
  const pathname=new URL(url).pathname;calls.push(pathname);
  if(pathname.endsWith('/courses/course'))return json(course);
  if(pathname.endsWith('/enrollments')){if(!existing){existing=enrollment;creates++;}return json(existing,201);}
  if(pathname.endsWith('/lessons/lesson'))return json(course.modules[0].lessons[0]);
  throw new Error('Unexpected request');
 };
 for(let i=0;i<2;i++)assert.equal((await learningApi.getLesson('course','lesson')).lesson.id,'lesson');
 assert.equal(creates,1);assert.equal(calls.length,6);assert.equal(calls.filter(p=>p.endsWith('/enrollments')).length,2);
 assert.ok(!calls.some(p=>p.endsWith('/enrollments/me')));
});
test('failed ensure never proceeds to Lesson, and wrong-course membership never writes',async()=>{
 const calls=[];global.fetch=async(url)=>{const p=new URL(url).pathname;calls.push(p);return p.endsWith('/courses/course')?json(course):json({},422);};
 await assert.rejects(()=>learningApi.getLesson('course','lesson'),/enroll/);assert.equal(calls.length,2);
 calls.length=0;await assert.rejects(()=>learningApi.getLesson('course','wrong'),/does not belong/);assert.equal(calls.length,1);
});
test('Lesson loader does not wait for display-only Course progress',()=>{
 const learn=fs.readFileSync(path.join(frontend,'src/app/(dashboard)/dashboard/learn/[courseId]/[lessonId]/page.tsx'),'utf8');
 const adapter=fs.readFileSync(path.join(frontend,'src/utils/learningApi.ts'),'utf8').split('async getLesson(')[1].split('async saveLessonProgress(')[0];
 assert.ok(!learn.includes('getCourseProgressStats'));assert.ok(!adapter.includes('getCourseProgressStats'));
 const detail=fs.readFileSync(path.join(frontend,'src/app/(dashboard)/dashboard/courses/[courseId]/page.tsx'),'utf8');
 assert.ok(detail.includes('savedProgress = useAsync(')&&detail.includes('q = useAsync('));
});

for(const returned of [{...enrollment,course_id:'other'},{...enrollment,status:'inactive'}])test(`unexpected enrollment state ${returned.course_id}/${returned.status} blocks Lesson`,async()=>{
 const calls=[];global.fetch=async(url)=>{const p=new URL(url).pathname;calls.push(p);return p.endsWith('/courses/course')?json(course):json(returned,201);};
 await assert.rejects(()=>learningApi.getLesson('course','lesson'),/enrollment unavailable/);assert.equal(calls.length,2);
});
