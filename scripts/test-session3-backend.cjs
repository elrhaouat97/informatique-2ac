const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const project=require('node:path').resolve(__dirname,'..');
const ts=require(project+'/node_modules/typescript');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const path=require('node:path');
const load=(relative,imports={})=>{
 const exports={};
 const requireSource=name=>{
  if(imports[name])return imports[name];
  if(!name.startsWith('.'))throw Error('Unexpected import '+name);
  const target=path.join(path.dirname(relative),name);
  return load(path.extname(target)?target:target+'.ts');
 };
 vm.runInNewContext(compile(fs.readFileSync(project+'/'+relative,'utf8')),{exports,require:requireSource,TextEncoder,TextDecoder,crypto:crypto.webcrypto,btoa,atob});
 return exports;
};
const m=load('app/session3-windows-model.ts');
const a=load('app/session3-assessment-data.ts',{'./session3-windows-model':m});
const exportsGrader=load('supabase/functions/informatique-2ac-api/session3-evaluation.ts');
const validate=exportsGrader.validSession3Evaluation;
const knowledge={families:Object.fromEntries(a.assessmentCards.map(c=>[c.id,c.family])),forms:Object.fromEntries(a.assessmentFiles.map(f=>[f.id,f.form]))};
let full=m.createWindowsState('assessment');
const act=action=>full=m.windowsReducer(full,action);
act({type:'folder',parent:'documents',name:'Bilan_club'});const target=full.nodes.find(n=>n.name==='Bilan_club').id;
for(const action of [{type:'clipboard',id:'source-photo',cut:true},{type:'paste',parent:target},{type:'clipboard',id:'source-note',cut:false},{type:'paste',parent:target}])act(action);
const copied=full.nodes.find(n=>n.id!=='source-note'&&n.parent===target&&n.origin==='club-invitation');act({type:'rename',id:copied.id,name:'Invitation.txt'});act({type:'restore',id:'lost-note'});
const fullAnswer=a.assessSession3(knowledge,full),empty=a.assessSession3({families:{},forms:{}},m.createWindowsState('assessment'));
let assertions=0;const equal=(x,y,message)=>{assert.deepEqual(x,y,message);assertions++};
const check=answer=>validate(answer,answer.score===20,answer.score,20);
equal(check(fullAnswer),true,'full score accepted');equal(check(empty),true,'zero score is a valid submission');equal(Buffer.byteLength(JSON.stringify(fullAnswer))<12000,true,'full answer fits current DB size');
for(const card of a.assessmentCards){const answers={...knowledge,families:{...knowledge.families,[card.id]:'wrong'}};const result=a.assessSession3(answers,full);equal(result.score,19);equal(check(result),true,'knowledge error accepted with accurate score');}
for(const file of a.assessmentFiles){const result=a.assessSession3({...knowledge,forms:{...knowledge.forms,[file.id]:'wrong'}},full);equal(result.score,19);equal(check(result),true,'file form error accepted');}
for(const item of [{type:'delete',id:target},{type:'delete',id:'source-photo'},{type:'delete',id:'source-note'},{type:'delete',id:copied.id},{type:'delete',id:'lost-note'},{type:'rename',id:target,name:'bILAN_club'}]){
 const result=a.assessSession3(knowledge,m.windowsReducer(full,item));equal(check(result),true,'server agrees with simulator outcomes');
}
for(const mutation of [r=>r.score=19,r=>r.answers[0].earnedPoints=0,r=>r.sections[2]=0,r=>r.dossier.files.find(f=>f.id==='source-photo').deleted=true,r=>r.dossier.files.push(r.dossier.files[0]),r=>r.dossier.criteria[0].correct=false,r=>r.answers[0].selectedChoice.fr='Logiciel',r=>r.answers[0].maxPoints=10,r=>r.format='arbitrary']){const r=structuredClone(fullAnswer);mutation(r);equal(check(r),false,'tampered result rejected');}
equal(validate(fullAnswer,false,20,20),false,'isCorrect must agree with score');equal(validate(fullAnswer,true,20,100),false,'rubric limited to 20');equal(validate(null,null,null,null),false);
let handler,unlocked=true,missing=false,databaseWrites=0;const rows=[];const learner={id:'c24bd0fb-60cc-4a87-a56b-1a86b54e732b',student_one:'TEST TECHNIQUE S3',student_two:null,class_name:'2/1',group_name:'1',is_pair:false,created_at:new Date().toISOString()};
const password='LOCAL TEST ONLY',secret='LOCAL SESSION TEST ONLY';
const databaseFetch=async(url,init={})=>{
 if(init.method&&init.method!=='GET')databaseWrites++;
 const path=url.split('/rest/v1/')[1];
 if(path.startsWith('course_2ac_teacher_config'))return Response.json([{password_hash:crypto.createHash('sha256').update(password).digest('hex'),session_secret:secret}]);
 if(path.startsWith('course_2ac_session_access'))return Response.json([{is_unlocked:unlocked}]);
 if(path.startsWith('course_2ac_participants'))return Response.json(missing?[]:[learner]);
 if(path.startsWith('course_2ac_submissions')){if(init.method==='POST'){const row=JSON.parse(init.body);if(!rows.some(r=>r.id===row.id))rows.push({...row,created_at:new Date().toISOString()});return new Response(null,{status:201})}return Response.json(rows)}
 throw Error('Unexpected request '+path);
};
const context={exports:{},require:name=>name.includes("learning-service")?load("supabase/functions/informatique-2ac-api/learning-service.ts",{"./student-names.ts":load("supabase/functions/informatique-2ac-api/student-names.ts")}):name.includes("session4-evaluation")?load("supabase/functions/informatique-2ac-api/session4-evaluation.ts"):exportsGrader,Deno:{serve:f=>handler=f,env:{get:key=>key==='SUPABASE_URL'?'https://local.test':'TEST SERVER ONLY'}},fetch:databaseFetch,TextEncoder,TextDecoder,Request,Response,crypto:crypto.webcrypto,btoa,atob,console,setTimeout};
vm.runInNewContext(compile(fs.readFileSync(project+'/supabase/functions/informatique-2ac-api/index.ts','utf8')),context);
const request=async(body,origin='https://tabdellah.github.io')=>{const response=await handler(new Request('https://local.test/function',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)}));return {status:response.status,body:await response.json()}};
const payload={action:'submit',id:crypto.randomUUID(),participantId:learner.id,sessionId:3,activityType:'practical_evaluation',activityId:'session-3-bilan-situations-v5',answer:fullAnswer,score:20,maxScore:20,isCorrect:true};
(async()=>{
 let r=await request(payload);equal(r.status,201,'new assessment HTTP accepted');equal(r.body.saved,true);equal(rows[0].response.answers.length,15,'all detailed answers stored');equal(rows[0].score,20);await request(payload);equal(rows.length,1,'retry idempotency');
 r=await request({...payload,id:crypto.randomUUID(),score:19});equal(r.status,400,'reject forged note');equal(rows.length,1);
 r=await request({...payload,id:crypto.randomUUID(),answer:empty,score:0,isCorrect:false});equal(r.status,201,'empty result saved for remediation');
 unlocked=false;r=await request({...payload,id:crypto.randomUUID()});equal(r.status,423,'lesson access still enforced');unlocked=true;missing=true;r=await request({...payload,id:crypto.randomUUID()});equal(r.status,404,'known learner required');missing=false;
 r=await request({action:'dashboard'});equal(r.status,401,'teacher results still private');r=await request({action:'set_roster_active',ids:[learner.id],active:false});equal(r.status,401,'bulk archive requires teacher authentication');r=await request({action:'teacher_workshop',sessionId:3});equal(r.status,401,'draft indicators require teacher authentication');r=await request({action:'learner_workshop',sessionId:3});equal(r.status,401,'learner history requires a signed learner token');r=await request(payload,'https://unapproved.example');equal(r.status,403,'origin restriction preserved');
 for(const old of [{activityId:'s2-evaluation-assembler',answer:{completed:true,errors:0,total:23,placements:Array(23).fill({})},score:23,maxScore:23},{activityId:'s2-evaluation-depanner',answer:{completed:true,errors:0,cases:Array(6).fill({}),score:12,maxScore:12},score:12,maxScore:12}]){r=await request({...payload,...old,id:crypto.randomUUID(),sessionId:2});equal(r.status,201,'existing lesson-2 evaluation compatible');}
 r=await request({action:'login',password});equal(r.status,200);const token=r.body.token;r=await request({action:'dashboard',token,filters:{className:'2/1',groupName:'1',sessionId:'3'},page:1});equal(r.status,200,'teacher dashboard accepts current auth');equal(r.body.attempts.length,2,'lesson-3 attempts in dashboard');equal(r.body.attempts.some(at=>at.activityId===payload.activityId&&at.score===20&&JSON.parse(at.responseJson).answers.length===15),true,'teacher receives detail and score');
 const beforeWrites=databaseWrites;
 r=await request({action:'teacher_course'});equal(r.status,401,'teacher course requires authentication');
 for(const claims of [{role:'teacher',exp:Math.floor(Date.now()/1000)-1},{role:'learner',exp:Math.floor(Date.now()/1000)+3600}]){
  const data=Buffer.from(JSON.stringify(claims)).toString('base64url');const signed=data+'.'+crypto.createHmac('sha256',secret).update(data).digest('base64url');
  r=await request({action:'teacher_course',token:signed});equal(r.status,401,'expired and learner sessions cannot open teacher course');
 }
 r=await request({action:'teacher_course',token:token+'forged'});equal(r.status,401,'forged teacher session rejected');
 unlocked=false;r=await request({action:'teacher_course',token});equal(r.status,200,'teacher can demonstrate locked lessons');equal(r.body.role,'teacher');equal(r.body.sessionIds,Array.from({length:15},(_,i)=>i+1),'all fifteen sessions privately available');equal(Date.parse(r.body.expiresAt)>Date.now(),true,'trusted expiration returned');equal(databaseWrites,beforeWrites,'teacher access never changes database or student permissions');
 r=await request({...payload,id:crypto.randomUUID()});equal(r.status,423,'teacher course grant does not unlock student submissions');equal(databaseWrites,beforeWrites,'locked student submission remains unwritten');
 console.log(JSON.stringify({passed:true,assertions,fullAnswerBytes:Buffer.byteLength(JSON.stringify(fullAnswer))}));
})().catch(e=>{console.error(e);process.exitCode=1});
