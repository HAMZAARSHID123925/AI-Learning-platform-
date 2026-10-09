/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const Module=require('node:module');const ts=require('typescript');
const frontend=path.resolve(__dirname,'..');const original=Module._resolveFilename;
Module._resolveFilename=function(name,parent,...rest){if(name.startsWith('@/'))name=path.join(frontend,'src',name.slice(2));return original.call(this,name,parent,...rest);};
require.extensions['.tsx']=require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,filename);
const {learningApi,mapDashboardCourses}=require('../src/utils/learningApi.ts');
const {getCourseProgress}=require('../src/utils/progress.ts');
const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');
const {ContinueCard}=require('../src/components/student/ContinueCard.tsx');
const dashboard={student_id:'fixture',course_cards:[{id:'course',slug:'math-fixture',title:'Math Fixture',grade:3,description:'Summary',thumbnail_url:'https://example.invalid/image',lessons:[{id:'first',title:'First',sequence_order:1,minutes:5,completed:true,locked:false},{id:'second',title:'Second',sequence_order:2,minutes:10,completed:false,locked:false}]}],enrolled_courses:[],next_recommended_lesson:null};
test('Dashboard adapter uses one response with no detail fan-out',async()=>{
 const calls=[];global.fetch=async url=>{calls.push(String(url));return new Response(JSON.stringify(dashboard));};
 const loaded=await learningApi.getStudentDashboard();const cards=mapDashboardCourses(loaded,3);
 assert.equal(calls.length,1);assert.ok(calls[0].endsWith('/students/me/dashboard'));assert.equal(cards[0].title,'Math Fixture');assert.equal(cards[0].lessons[1].title,'Second');
 assert.deepEqual(mapDashboardCourses(loaded,4),[]);assert.deepEqual(mapDashboardCourses({...dashboard,course_cards:[]},3),[]);
});
test('Continue card retains titles, progress, image and lesson navigation',()=>{
 const course=mapDashboardCourses(dashboard,3)[0];const progress=getCourseProgress(course,{first:{status:'completed',progress:100},second:{status:'in_progress',progress:25}});
 assert.equal(progress.percent,50);assert.equal(progress.nextLesson.id,'second');
 const html=renderToStaticMarkup(React.createElement(ContinueCard,{course,progress}));
 for(const text of ['Continue Learning','Math Fixture','Second','1 of 2 lessons complete','/dashboard/learn/course/second','https://example.invalid/image'])assert.ok(html.includes(text),text);
});
test('Dashboard source keeps loading/error/retry and has only one data loader',()=>{
 const source=fs.readFileSync(path.join(frontend,'src/app/(dashboard)/dashboard/page.tsx'),'utf8');
 assert.ok(!source.includes('listCourses('));assert.equal((source.match(/getStudentDashboard\(/g)||[]).length,1);
 for(const text of ['dashboardQuery.loading','dashboardQuery.error','dashboardQuery.reload','savedLessons','lesson.completed','mapDashboardCourses'])assert.ok(source.includes(text));
});
test('failed Dashboard read propagates instead of showing seeded course data',async()=>{
 global.fetch=async()=>new Response('{}',{status:403});await assert.rejects(()=>learningApi.getStudentDashboard(),/Failed to fetch student dashboard/);
});
