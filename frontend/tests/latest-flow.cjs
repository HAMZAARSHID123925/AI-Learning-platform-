/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS harness loads production TypeScript helpers. */

/* Real HTTP fallback for environments where the browser kernel cannot initialize.
 * Executes production frontend API helpers; never represents this as UI playback.
 */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const frontend = path.join(root, 'frontend');
const statePath = path.join(root, 'backend/tests/integration/latest_flow_state.json');
const evidencePath = path.join(root, 'backend/tests/integration/latest_flow_http_evidence.json');
const local = path.join(process.env.TEMP, 'elarion-latest-flow');
const credentials = JSON.parse(fs.readFileSync(path.join(local, 'accounts.json'), 'utf8'));
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api/v1';
const resolve = Module._resolveFilename;
Module._resolveFilename = function(name, parent, ...rest) {
  if (name.startsWith('@/')) name = path.join(frontend, 'src', name.slice(2));
  return resolve.call(this, name, parent, ...rest);
};
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022}
  }).outputText;
  module._compile(output, filename);
};
const {adminApi} = require('../src/utils/adminApi.ts');
const {learningApi} = require('../src/utils/learningApi.ts');
const {saveAuthSession} = require('../src/lib/auth-storage.ts');
let ids = JSON.parse(fs.readFileSync(statePath, 'utf8'));
let evidence = fs.existsSync(evidencePath) ? JSON.parse(fs.readFileSync(evidencePath,'utf8')) : [];
function save() { fs.writeFileSync(statePath, JSON.stringify(ids, null, 2)); }
function check(name, okay, detail={}) {
  const item = {check: name, pass: Boolean(okay), ...detail};
  evidence.push(item);fs.writeFileSync(evidencePath, JSON.stringify(evidence,null,2));
  console.log(JSON.stringify(item));
  if (!okay) throw new Error(name);
}
async function login(key) {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL+'/auth/login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(credentials[key])});
  const data = await res.json();
  check('Real login '+key, res.status === 200 && Boolean(data.access_token), {status:res.status});
  saveAuthSession(data.access_token);
  return data;
}
async function request(method, route, body) {
  const {fetchWithAuth}=require('../src/lib/api.ts');
  return fetchWithAuth(route,{method,...(body?{body:JSON.stringify(body)}:{})});
}
async function prepare() {
  await login('admin');
  const skills=await adminApi.listSkills();
  const skill=skills.find(s=>/fraction/i.test(s.name)) || skills.find(s=>/algebra|mathematics/i.test(s.name));
  check('Real curriculum skill available', Boolean(skill),{skill_name:skill?.name});
  ids.skill=skill.id;save();
  if (!ids.course) {
    const course=await adminApi.createCourse({title:'E2E Latest Integration Test — Mathematics',grade:5,description:'Controlled real learning flow verification: fractions, equivalent fractions and comparison.',slug:'math-'+ids.tag});
    ids.course=course.id;save();
  }
  const draft=await adminApi.getCourseDetail(ids.course);
  check('Course persisted with selected grade', draft.id===ids.course && draft.grade===5);
  if (!ids.module) {
    ids.module=(await adminApi.createModule(ids.course,{title:'Fractions foundations',description:'Understanding fractions and equivalence',sequence_order:1})).id;save();
  }
  if (!ids.lesson) {
    ids.lesson=(await adminApi.createLesson(ids.module,{title:'Fractions: equal parts, equivalence and comparison',sequence_order:1,skill_ids:[skill.id]})).id;save();
    await adminApi.updateLesson(ids.lesson,{body_markdown:'# Fractions\nA fraction represents equal parts of a whole. The denominator counts equal parts and the numerator counts selected parts. For 3/4, divide a whole into four equal parts and select three.\nEquivalent fractions describe the same quantity. Multiplying numerator and denominator by the same nonzero number preserves the value: 1/2 = 2/4 = 3/6. Simplify 6/8 by dividing both numbers by two to obtain 3/4.\nTo compare fractions with equal denominators, compare numerators: 3/5 exceeds 2/5. With equal numerators, a larger denominator means smaller equal parts: 1/3 exceeds 1/6. Compare 1/2 and 2/3 using sixths: 3/6 < 4/6.\nA proper fraction has numerator less than denominator. An improper fraction has numerator at least the denominator: 5/4 = 1 1/4.\nAdding fractions with the same denominator adds selected parts: 1/5+2/5=3/5. Keep the denominator because the part size has not changed.',skill_ids:[skill.id]});
  }
  await login('student');
  let listed=await learningApi.listCourses(5);
  if (!ids.published) check('Draft excluded from real Student list',!listed.some(c=>c.id===ids.course));
  await login('admin');
  if (!ids.uploaded) {
    const media=fs.readFileSync(path.join(root,'media_assets/wd_lesson1.mp4'));
    const file=new File([media],'latest-e2e-lesson.mp4',{type:'video/mp4'});
    await adminApi.uploadMedia(ids.course,file,'lesson_video',ids.lesson);
    ids.uploaded=true;save();
    check('Frontend helper presign PUT confirm completed',true,{bytes:media.length});
  }
  if (!ids.published) {await adminApi.publishLesson(ids.lesson);await adminApi.publishCourse(ids.course);ids.published=true;save();}
  const built=await adminApi.getCourseDetail(ids.course);
  check('Builder real contract includes published lesson and notes',built.status==='published' && built.modules[0].lessons[0].status==='published' && Boolean(built.modules[0].lessons[0].bodyMarkdown));
  check('Builder current curriculum tags preserved',built.modules[0].lessons[0].skillIds.includes(ids.skill));
  await login('student');
  listed=await learningApi.listCourses(5);
  check('Matching Student real course list includes course',listed.some(c=>c.id===ids.course));
  const opened=await learningApi.getLesson(ids.course,ids.lesson);
  check('Real course/module/lesson IDs navigate',opened.course.modules[0].id===ids.module && opened.lesson.id===ids.lesson);
  check('Signed private lesson source delivered',opened.lesson.videoUrl?.includes('X-Amz-Signature='));
  const media=await fetch(opened.lesson.videoUrl);
  check('Signed lesson media retrieval',media.ok,{status:media.status,content_type:media.headers.get('content-type')});
  const bytes=Buffer.from(await media.arrayBuffer());
  fs.writeFileSync(path.join(local,'lesson.mp4'),bytes);
  check('Lesson media non-zero',bytes.length>0,{bytes:bytes.length});
  const denied=await fetch(opened.lesson.videoUrl.split('?')[0]);
  check('Unsigned lesson media denied',[400,401,403].includes(denied.status),{status:denied.status});
  const ranged=await fetch(opened.lesson.videoUrl,{headers:{Range:'bytes=0-1023',Origin:'http://localhost:3000'}});
  check('Lesson Range retrieval',ranged.status===206,{status:ranged.status});
  const corsOrigin=ranged.headers.get('access-control-allow-origin');
  if (!corsOrigin) {
    ids.external_blockers=['R2 does not permit the current browser origin; bucket CORS administration is AccessDenied.'];
    save();
    console.log('EXTERNAL_BROWSER_CORS_BLOCKER_RECORDED_CONTINUING_HTTP_ONLY');
  } else check('Storage browser origin permitted',['http://localhost:3000','*'].includes(corsOrigin),{cors_origin:corsOrigin});
  await login('other');
  check('Wrong-grade Student query override excluded',!(await learningApi.listCourses(5)).some(c=>c.id===ids.course));
  const noAccess=await request('POST','/lessons/'+ids.lesson+'/complete',{time_spent_seconds:0});
  check('Wrong-grade completion denied',[403,404].includes(noAccess.status),{status:noAccess.status});
  await login('student');
  await learningApi.saveLessonProgress(ids.lesson,{status:'completed',progress:100});
  check('Completion persisted after independent reload request',(await learningApi.getStudentProgress()).includes(ids.lesson));
  const progress=await learningApi.getCourseProgressStats(ids.course);
  check('Real course fully complete',progress.total_lessons===1 && progress.completed_lessons===1 && progress.percentage===100);
}
async function assessment() {
  await login('student');
  console.log('REQUESTING_ONE_REAL_COURSE_ASSESSMENT');
  const test=await learningApi.getCourseAssessment(ids.course);
  ids.assessment=test.id;save();
  check('Exactly ten real MCQs',test.questions.length===10 && test.questions.every(q=>q.question_type==='mcq' && q.options.length===4),{test_id:test.id});
  check('No answer-key or rubric leakage',!JSON.stringify(test).match(/"(answer_key|correct_answer|is_correct|rubric)"\s*:/));
  if (!ids.submission) {
    const result=await learningApi.submitRealAssessment(test.id,test.questions.map(q=>({question_id:q.id,selected_option_id:q.options[0].id})));
    ids.submission=result.id;save();
  }
  const result=await learningApi.getRealSubmission(ids.submission);
  check('Real deterministic grading persisted',result.status==='graded' && result.total_count===10 && result.skill_scores.length>0,{total_count:result.total_count,percentage:result.correct_percentage});
  check('Intentionally weak result',result.correct_percentage<60);
  await login('other');
  const denied=await request('GET','/submissions/'+ids.submission);
  check('Other Student private submission denied',[403,404].includes(denied.status),{status:denied.status});
}
async function video() {
  await login('student');
  const flags=await learningApi.getActiveWeaknesses();
  const flag=flags.find(f=>f.submission_id===ids.submission && f.skill_id===ids.skill);
  check('Actual submission weakness exists',Boolean(flag));
  ids.weakness=flag.id;save();
  const plans=await learningApi.getRemediationPlans();
  const plan=plans.find(p=>p.weakness_flag_id===flag.id);
  check('Real remediation owns weak submission',Boolean(plan?.remedial_course_markdown));
  ids.remediation=plan.id;save();
  if (!ids.video_job) {
    const job=await learningApi.requestPersonalizedVideo(flag.id);
    ids.video_job=job.id;save();
    check('One real video job created',job.status==='queued',{job_id:job.id});
  }
  const current=await learningApi.getPersonalizedVideoJob(ids.video_job);
  check('Persisted real video status retrieved',current.id===ids.video_job,{status:current.status});
  const ownedPlan=await request('GET','/remediation-plans/'+ids.remediation);
  check('Owner remediation detail accessible',ownedPlan.status===200);
  await login('other');
  const denied=await request('GET','/remediation/video-jobs/'+ids.video_job);
  check('Other Student private video denied',[403,404].includes(denied.status),{status:denied.status});
  const planDenied=await request('GET','/remediation-plans/'+ids.remediation);
  check('Other Student remediation document denied',planDenied.status===403,{status:planDenied.status});
}
async function playback() {
  await login('student');
  const job=await learningApi.getPersonalizedVideoJob(ids.video_job);
  check('Real video job ready',job.status==='ready',{status:job.status});
  check('Signed personalized playback delivered',job.video_url?.includes('X-Amz-Signature='));
  const response=await fetch(job.video_url);
  const content=Buffer.from(await response.arrayBuffer());
  check('Real personalized MP4 retrieval',response.ok && content.length>0,{status:response.status,bytes:content.length});
  fs.writeFileSync(path.join(local,'personalized.mp4'),content);
  const denied=await fetch(job.video_url.split('?')[0]);
  check('Personalized permanent private URL denied',[400,401,403].includes(denied.status),{status:denied.status});
  const refreshed=await learningApi.getPersonalizedVideoJob(ids.video_job);
  check('Ready state survives independent reload request',refreshed.id===job.id && refreshed.status==='ready');
}
async function cors() {
  const response = await fetch('http://localhost:8000/api/v1/courses', {
    method:'OPTIONS',headers:{Origin:'http://localhost:3000','Access-Control-Request-Method':'GET','Access-Control-Request-Headers':'authorization'}
  });
  check('Frontend to backend browser CORS',response.status===200 && response.headers.get('access-control-allow-origin')==='http://localhost:3000',{status:response.status});
  await login('admin');
  const upload=await adminApi.requestPresignedUpload(ids.course,{lesson_id:ids.lesson,media_type:'lesson_video',filename:'cors-probe.mp4',content_type:'video/mp4',size_bytes:1});
  const r2=await fetch(upload.presigned_url,{method:'OPTIONS',headers:{
    Origin:'http://localhost:3000','Access-Control-Request-Method':'PUT','Access-Control-Request-Headers':'content-type'
  }});
  const allowed=r2.headers.get('access-control-allow-origin');
  check('R2 actual browser PUT preflight',r2.ok && ['http://localhost:3000','*'].includes(allowed),{status:r2.status,allow_origin:allowed});
}
({prepare,assessment,video,playback,cors}[process.argv[2]] || (()=>{throw new Error('Unknown phase')}))().catch(error=>{
  console.log(JSON.stringify({FAILED:error.name,reason:error.message.replace(/https?:\/\/[^\s]+/g,'[URL REDACTED]')}));
  process.exitCode=1;
});
