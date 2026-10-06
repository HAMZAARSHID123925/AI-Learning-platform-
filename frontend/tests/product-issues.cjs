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
const statePath = path.join(root, 'backend/tests/integration/product_issues_state.json');
const evidencePath = path.join(root, 'backend/tests/integration/product_issues_http_evidence.json');
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
 const {createCourseCurriculum,newCreationCheckpoint}=require('../src/utils/courseCreation.ts');
 const skill=(await adminApi.listSkills()).find(s=>/algebra/i.test(s.name));
 check('Real curriculum skill',Boolean(skill));ids.skill=skill.id;
 const notes='# Fractions: equal parts and equivalence\nA fraction names equal parts of one whole. Divide a whole into equal pieces before counting. The denominator counts the equal parts in the whole. The numerator counts the selected parts. For three fourths, split a rectangle into four equal pieces and shade three. The fraction is 3/4. A drawing with unequal pieces cannot represent fourths.\nEquivalent fractions describe the same amount of the same whole. Split each half into two equal pieces: one half covers two fourths. So 1/2 = 2/4. Split halves into three equal pieces and one half covers three sixths: 1/2 = 3/6. Multiplying both numerator and denominator by the same positive whole number keeps the amount unchanged. One half becomes two fourths by multiplying both numbers by two. Changing only one number changes the fraction.\nSimplify six eighths by dividing numerator and denominator by two. This gives three fourths. Both cover the same area of an equally sized whole. The denominator is the size of the partition, not the count of shaded pieces.\nCompare fractions only when their wholes are equal in size. For equal denominators, compare numerators: 3/5 is greater than 2/5 because three equal pieces exceed two. For equal numerators, a greater denominator makes smaller pieces: 1/3 is greater than 1/6. A number line marks zero and one whole. Half is midway between them. Two fourths occupies the same point as one half.\nFor unlike denominators, find equal sized pieces. Compare 1/2 and 2/3 using sixths. One half is 3/6 and two thirds is 4/6, so 1/2 is less than 2/3. Check using equal fraction bars.\nFor addition with equal denominators, keep the denominator and add numerators. One fifth plus two fifths equals three fifths. The pieces remain fifths; adding does not change their size. A common mistake is adding denominators, which incorrectly changes the piece size.\nExplain each answer by identifying the whole, the equal partition and the number of selected pieces. Draw equal sized wholes, label each denominator, and then shade numerator pieces. Check equivalence by subdividing rather than resizing the whole. Summarize: equal parts define fractions, equivalent fractions keep the amount, and comparisons need the same whole.';
 const checkpoint=ids.checkpoint||newCreationCheckpoint();
 const nativeFetch=global.fetch;
 global.fetch=async(url,options)=>{if(options?.method==='PUT'&&String(url).includes('X-Amz-Signature='))throw new TypeError('Controlled direct transport unavailable; exercise real private relay');return nativeFetch(url,options);};
 try {
 const promise=createCourseCurriculum({title:'ELARION Product Verification — Fractions '+ids.tag,description:'Controlled Grade 5 curriculum: equal parts, equivalent fractions and comparison.',grade:5,subject:'math',skillId:skill.id,publish:true,thumbnailFile:new File([fs.readFileSync(path.join(frontend,'public/logo.png'))],'logo.png',{type:'image/png'}),modules:[{id:'m1',title:'Fraction foundations',description:'Equal parts and equivalence',lessons:[{id:'l1',title:'Equal parts, equivalent fractions and comparison',bodyMarkdown:notes,videoFile:new File([fs.readFileSync(path.join(root,'media_assets/wd_lesson1.mp4'))],'lesson.mp4',{type:'video/mp4'})}]}]},checkpoint,message=>console.log(message));
 ids.course=await promise;ids.published=true;ids.module=checkpoint.modules.m1;ids.lesson=checkpoint.lessons['m1:l1'];
 } finally {global.fetch=nativeFetch;ids.checkpoint=checkpoint;save();}
 const course=await adminApi.getCourseDetail(ids.course);
 check('Grade and published DB course',course.grade===5&&course.status==='published');
 const raw=await (await request('GET','/courses/'+ids.course)).json();
 check('Thumbnail persisted',Boolean(raw.thumbnail_url?.includes('X-Amz-Signature=')));
 check('Private thumbnail actually loads',(await fetch(raw.thumbnail_url)).ok);
 check('Lesson notes video and skill associations',course.modules[0].lessons[0].bodyMarkdown.length>100&&Boolean(course.modules[0].lessons[0].videoUrl)&&course.modules[0].lessons[0].skillIds.includes(skill.id));
 const listed=await adminApi.listCourses({page_size:100});
 check('Admin list independent refresh contains course',JSON.stringify(listed).includes(ids.course));
 await login('student');
 check('Student published grade course visibility',(await learningApi.listCourses(5)).some(c=>c.id===ids.course));
 await learningApi.getLesson(ids.course,ids.lesson);
 await learningApi.saveLessonProgress(ids.lesson,{status:'completed',progress:100});
 check('Real lesson completion reload',(await learningApi.getStudentProgress()).includes(ids.lesson));
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
    const {findOrCreateVideo}=require('../src/utils/personalizedVideo.ts');
    const [job,duplicate]=await Promise.all([findOrCreateVideo(ids.users.student,flag.id,ids.submission),findOrCreateVideo(ids.users.student,flag.id,ids.submission)]);
    check('Concurrent result mounts use same real job',job.id===duplicate.id);
    ids.video_job=job.id;save();
    check('One real video job created',!['failed','ready'].includes(job.status),{job_id:job.id});
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
  fs.writeFileSync(path.join(local,'product-personalized.mp4'),content);
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
async function diagnose(){await login('student');const response=await request('POST','/lessons/'+ids.lesson+'/complete',{time_spent_seconds:0});console.log(JSON.stringify({completion_status:response.status,detail:await response.json()}));}
({prepare,assessment,video,playback,cors,diagnose}[process.argv[2]] || (()=>{throw new Error('Unknown phase')}))().catch(error=>{
  console.log(JSON.stringify({FAILED:error.name,reason:error.message.replace(/https?:\/\/[^\s]+/g,'[URL REDACTED]')}));
  process.exitCode=1;
});
