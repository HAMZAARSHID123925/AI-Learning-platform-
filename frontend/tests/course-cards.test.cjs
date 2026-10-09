/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const Module=require('node:module');const ts=require('typescript');
const frontend=path.resolve(__dirname,'..');const original=Module._resolveFilename;
Module._resolveFilename=function(name,parent,...rest){if(name.startsWith('@/'))name=path.join(frontend,'src',name.slice(2));return original.call(this,name,parent,...rest);};
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
const {learningApi}=require('../src/utils/learningApi.ts');
const {getCourseCardProgress,getCourseProgress}=require('../src/utils/progress.ts');
const json=(data,status=200)=>new Response(JSON.stringify(data),{status});
const item={id:'card',slug:'computer-card',title:'Computer Science',grade:3,description:'Real description',thumbnail_url:'https://example.invalid/image',lessons:[{id:'one',minutes:5,completed:true},{id:'two',minutes:10,completed:false}]};

test('cards use one summary request and never fetch per-course detail',async()=>{
 const calls=[];global.fetch=async url=>{calls.push(String(url));return json({items:[item],total:1});};
 const cards=await learningApi.listCourseCards(3);
 assert.equal(calls.length,1);assert.ok(calls[0].includes('/courses/cards?'));assert.ok(calls[0].includes('status_filter=published'));
 assert.equal(cards[0].title,item.title);assert.equal(cards[0].description,item.description);assert.equal(cards[0].image,item.thumbnail_url);assert.equal(cards[0].subject,'science'); // preserve existing title-based subject precedence
 assert.deepEqual(cards[0].lessons,item.lessons);
});
test('summary pagination remains complete without detail fan-out',async()=>{
 const calls=[];global.fetch=async url=>{calls.push(String(url));return json({items:[{...item,id:String(calls.length)}],total:101});};
 const cards=await learningApi.listCourseCards(3);assert.equal(cards.length,2);assert.equal(calls.length,2);assert.ok(calls.every(url=>url.includes('/courses/cards?')));
});
test('empty and denied summaries do not fall back to seeded courses',async()=>{
 global.fetch=async()=>json({items:[],total:0});assert.deepEqual(await learningApi.listCourseCards(3),[]);
 global.fetch=async()=>json({},403);await assert.rejects(()=>learningApi.listCourseCards(3),/Could not load/);
});
test('frontend grade guard remains active',async()=>{
 global.fetch=async()=>json({items:[{...item,grade:4}],total:1});assert.deepEqual(await learningApi.listCourseCards(3),[]);
});
test('saved completion survives an empty or partially loaded context',()=>{
 const progress=getCourseCardProgress(item,{});assert.equal(progress.completed,1);assert.equal(progress.percent,50);assert.equal(progress.nextLesson.id,'two');assert.equal(progress.started,true);
 assert.equal(getCourseCardProgress(item,{one:{status:'in_progress',progress:20}}).completed,1);
});
test('transient progress and new completions retain existing card semantics',()=>{
 const transient={two:{status:'in_progress',progress:35}};
 assert.equal(getCourseCardProgress(item,transient).nextLessonProgress,35);
 const all=getCourseCardProgress(item,{two:{status:'completed',progress:100}});
 assert.equal(all.completed,2);assert.equal(all.percent,100);assert.equal(all.nextLesson,null);
});
test('summary and full-course progress agree for equivalent completion data',()=>{
 const state={one:{status:'completed',progress:100},two:{status:'in_progress',progress:35}};
 const old=getCourseProgress({...item,lessons:item.lessons.map(l=>({...l,title:l.id}))},state);
 const actual=getCourseCardProgress(item,state);
 for(const field of ['completed','total','percent','nextLessonNumber','nextLessonProgress','started'])assert.equal(actual[field],old[field]);
});
