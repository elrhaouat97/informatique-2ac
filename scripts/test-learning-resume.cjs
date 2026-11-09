const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),ts=require(root+'/node_modules/typescript');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
class MemoryStorage{map=new Map();get length(){return this.map.size}key(i){return [...this.map.keys()][i]??null}getItem(k){return this.map.get(k)??null}setItem(k,v){this.map.set(k,String(v))}removeItem(k){this.map.delete(k)}clear(){this.map.clear()}}
const localStorage=new MemoryStorage(),sessionStorage=new MemoryStorage();const listeners=new Map();
const window={dispatchEvent:e=>(listeners.get(e.type)||[]).forEach(f=>f(e)),addEventListener:(t,f)=>listeners.set(t,[...(listeners.get(t)||[]),f])};
const globals={TextEncoder,TextDecoder,crypto:crypto.webcrypto,btoa,atob,console,localStorage,sessionStorage,window,CustomEvent:class{constructor(type,{detail}){this.type=type;this.detail=detail}}};
function loader(){const cache=new Map();return function load(rel){rel=path.resolve(root,rel);if(cache.has(rel))return cache.get(rel);const exports={};cache.set(rel,exports);const req=n=>{if(n.startsWith('.')){let dest=path.resolve(path.dirname(rel),n);if(!path.extname(dest))dest+='.ts';return load(dest)}if(n.startsWith('@/'))return load(n.slice(2)+'.ts');return require(n)};vm.runInNewContext(compile(fs.readFileSync(rel,'utf8')),{exports,require:req,...globals});return exports}}
let load=loader(),storage=load('lib/learning-storage.ts'),model=load('app/prof/learning-model.ts'),roster=load('lib/roster-model.ts');
let assertions=0;function eq(a,b,msg){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),msg);assertions++}function ok(v,msg){assert.ok(v,msg);assertions++}
const names=load('supabase/functions/informatique-2ac-api/student-names.ts');
for(const name of ['Sara Idrissi','عبد الرحمن أمين','Fatima-Zahra El Alaoui',"Lina D’Angelo",'Li'])ok(names.isSuggestibleStudentName(name),'valid French/Arabic names remain available');
for(const name of [';;','^!:*','596252','١٢٣٤','aaaaa aaa','TEST Élève','Démo Professeur','  ','A'])eq(names.isSuggestibleStudentName(name),false,'invalid or placeholder entry is not suggested');
const profile={id:crypto.randomUUID(),studentOne:'Salma Idrissi',studentTwo:null,className:'2/1',groupName:'1',isPair:false};
storage.rememberProfile(profile);const ids=model.targetsFor(3).map(t=>t.id);eq(ids.length,25);eq(new Set(ids).size,25);
storage.saveSnapshot(profile.id,3,'workshop',{version:1,exerciseId:ids[24],completedIds:ids.slice(0,24),drafts:{[ids[24]]:{textValue:'réponse en cours',savedAt:1}}});storage.saveSnapshot(profile.id,3,'view',{activeTab:'workshop'});
// A new JS runtime with empty sessionStorage models closing the entire browser window.
sessionStorage.clear();load=loader();storage=load('lib/learning-storage.ts');eq(storage.rememberedActiveProfile().id,profile.id,'durable identity survives tab/window closure');eq(storage.resumeOverview(profile.id).completed,24);eq(storage.readSnapshot(profile.id,3,'workshop').data.exerciseId,ids[24],'resume at exercise 25');eq(storage.readSnapshot(profile.id,3,'workshop').data.drafts[ids[24]].textValue,'réponse en cours');
storage.forgetActiveProfile();eq(storage.rememberedActiveProfile(),null,'shared PC requests another identity');ok(storage.readSnapshot(profile.id,3,'workshop'),'switching learner preserves previous work');
const old=storage.readSnapshot(profile.id,3,'workshop');const newer=storage.saveSnapshot(profile.id,3,'workshop',{...old.data,completedIds:ids});storage.markSnapshotSynced(old,1);eq(storage.readSnapshot(profile.id,3,'workshop').dirty,true,'a response from an earlier save cannot mark newer edits as synced');
storage.acceptRemote({...old,revision:2,dirty:false});eq(storage.readSnapshot(profile.id,3,'workshop').data.completedIds.length,25,'CAS conflict merge preserves all completed IDs');eq(storage.readSnapshot(profile.id,3,'workshop').revision,2);
eq(storage.mergeSnapshotData('assessment',{submitted:true,stage:2},{submitted:false,stage:0}).submitted,true,'a submitted copy never reverts to draft');
eq(storage.mergeSnapshotData('workshop',{drafts:{x:{savedAt:10,textValue:'new'}}},{drafts:{x:{savedAt:2,textValue:'old'}}}).drafts.x.textValue,'new');
const sid=crypto.randomUUID(),pid=profile.id,student={id:sid,fullName:profile.studentOne,className:'2/1',groupName:'1',source:'manual',active:true};
const data={students:[student],participants:[{...profile,studentOneId:sid}],activities:[],sessionAccess:[],generatedAt:new Date().toISOString(),truncated:false};
let p=model.progressRows(data,3)[0];eq(p.status,'unassessed');eq(p.grade,null,'no submission is not a zero');
const at=(id,passed)=>({participantId:pid,sessionId:3,activityId:id,activityType:'unit1_exercise',attempts:2,graded:2,correct:passed?1:0,successful:passed,firstSuccessAt:passed?'2026-10-30T10:00:00Z':null,lastAt:'2026-10-30T10:00:00Z',bestScore:null,maxScore:null});
data.activities=[at(ids[0],true),at(ids[0],true),at(ids[1],false)];p=model.progressRows(data,3)[0];eq(p.passed,1,'duplicate accounts/attempts do not inflate progression');eq(p.status,'developing');
data.activities=ids.map(id=>at(id,false));p=model.progressRows(data,3)[0];eq(p.status,'not-acquired','all attempted, few successful');
data.activities=ids.map(id=>at(id,true));p=model.progressRows(data,3)[0];eq(p.status,'acquired');eq(p.objectives.every(o=>o.status==='acquired'),true);eq(model.successTimeline([p]).at(-1).value,25);
data.activities.push({...at('session-3-bilan-situations-v5',false),activityType:'practical_evaluation',bestScore:0,maxScore:20});p=model.progressRows(data,3)[0];eq(p.grade,0,'a real zero remains visible');eq(p.status,'acquired','training mastery and exam grade remain separate');
const s4Grade=(id,note)=>({...at(id,false),sessionId:4,activityType:'practical_evaluation',bestScore:note,maxScore:20});
const s4Data={...data,activities:[s4Grade('session-4-reseau-evaluation-v2',20),s4Grade('session-4-reseau-evaluation-v3',7)]};
eq(model.progressRows(s4Data,4)[0].grade,7,'the current four-mission grade takes priority over the earlier rubric');
eq(model.progressRows({...s4Data,activities:[s4Grade('session-4-reseau-evaluation-v3',0)]},4)[0].grade,0,'a submitted zero remains visible for the new assessment');
eq(model.progressRows({...s4Data,activities:[]},4)[0].grade,null,'an unfinished assessment is never reported as a zero');
eq(s4Data.activities.length,2,'the previous grade is kept in the learner history');
const s4Previous={version:1,choices:{lan:0},submitted:true};
const s4Current={version:3,shuffleRound:1,previousQuiz:s4Previous,submitted:false};
eq(storage.mergeSnapshotData('quiz',s4Previous,s4Current).previousQuiz,s4Previous,'upgrading the old quiz retains its submitted copy');
eq(storage.mergeSnapshotData('quiz',{...s4Current,submitted:true},{...s4Current,submitted:false}).submitted,true,'a submitted new assessment cannot revert to a draft');
const scoring=load('lib/workshop-progress.ts'),labs=load('app/unit1-labs.ts').unit1Labs;
for(let sessionId=1;sessionId<=15;sessionId++){
 const exercises=scoring.workshopExercises(sessionId);
 ok(exercises.length>0,`session ${sessionId} has a complete workshop catalogue`);
 eq(new Set(exercises.map(e=>e.id)).size,exercises.length,'exercise IDs are unique');
}
const conversionExercise=labs[3].exercises.find(e=>e.type==='conversions');
const unfinished={version:1,completedIds:[],drafts:{[conversionExercise.id]:{exerciseRevision:conversionExercise.revision,conversionValues:{0:conversionExercise.rows[0].accepted[0]}}}};
const partial=scoring.workshopEvidence(3,unfinished);
eq(partial,[{activityId:conversionExercise.id,percent:33,confirmed:false}],'one correct conversion is counted before the first validation');
data.activities=[];
p=model.progressRows(data,3,partial.map(e=>({...e,participantId:pid,updatedAt:'2026-11-06T10:00:00Z'})))[0];
eq(p.percent,1,'partial work is visible in the full workshop percentage');
eq(p.workshopGrade,.3,'unfinished work earns an indicative mark');
eq(p.grade,null,'the official assessment is separate');
eq(p.status,'developing');eq(p.graded,0);
const definition=scoring.workshopExercises(3).filter(e=>e.id===conversionExercise.id);
const attempts=[{id:'initial',activityId:conversionExercise.id,score:33,maxScore:100,isCorrect:false},{id:'retry',activityId:conversionExercise.id,score:100,maxScore:100,isCorrect:true}];
const attemptCache=load('lib/workshop-attempt-cache.ts');
const key=attemptCache.workshopAttemptKey(pid,3);
attemptCache.rememberWorkshopAttempts(key,attempts.slice(0,1));
eq(attemptCache.rememberWorkshopAttempts(key,attempts).length,2,'queued attempt and synced attempt deduplicate by ID');
let totals=scoring.workshopTotals(scoring.workshopRows(definition,partial,scoring.attemptTotals(attemptCache.readWorkshopAttempts(key))));
eq(totals.percent,100,'retry retains the best result');eq(totals.successRate,50,'both corrections count in the success rate');
const declaration=scoring.workshopExercises(5).find(e=>e.declared);
const practice=scoring.workshopEvidence(5,{version:1,checked:[],photoAnswer:null,declaredProgress:{[declaration.id]:50}});
eq(practice,[{activityId:declaration.id,percent:50,confirmed:false}],'progress declared before completion is preserved');
eq(scoring.workshopEvidence(4,{version:1,drafts:{'session-4-workshop-TP':{checks:['source','receive'],ip:'192.168.10.21'}}})[0].percent,43,'practical draft receives partial credit for known criteria');
let imp=roster.prepareRosterImport([{'Nom complet':'NOM DÉMONSTRATION',Classe:'2/1',Groupe:'1',Massar:'A12345'}],[{...student,massarCode:'A12345'}]);eq(imp.errors,[]);eq(imp.rows[0].id,sid,'Massar, not spelling, links imported lists');
imp=roster.prepareRosterImport([{'Nom complet':student.fullName,Classe:'2/1',Groupe:'1'}],[student]);ok(imp.rows[0].id!==sid,'names alone do not silently merge two people');
imp=roster.prepareRosterImport([{'Nom complet':'EXEMPLE',Classe:'2/1',Groupe:'1',Massar:'A12345',ID:crypto.randomUUID()}],[{...student,massarCode:'A12345'}]);ok(imp.errors.length>0,'conflicting explicit identity rejected');
// Service tests use the real signing/CAS logic, with an isolated in-memory DB.
const serviceModule=load('supabase/functions/informatique-2ac-api/learning-service.ts'),checkpoints=new Map();
const row={id:pid,student_one:profile.studentOne,student_two:null,student_one_id:sid,student_two_id:null,class_name:'2/1',group_name:'1',is_pair:false};
const db=async(p,init={})=>{if(p.startsWith('course_2ac_participants'))return [row];if(p.startsWith('course_2ac_roster_students'))return [{id:sid,full_name:student.fullName}];if(p.startsWith('course_2ac_activity_progress'))return [{session_id:3,activity_id:ids[0],activity_type:'unit1_exercise',successful:true}];if(p.startsWith('course_2ac_learning_checkpoints')){
 const q=new URL('https://test/'+p).searchParams;
 if(q.has('device_id'))return [...checkpoints.values()].filter(s=>'eq.'+s.device_id===q.get('device_id'));
 const legacy=q.get('snapshot->workshopProgress')==='is.null';
 return [...checkpoints.values()].filter(s=>'eq.'+s.session_id===q.get('session_id')&&Boolean(s.snapshot.workshopProgress)!==legacy)
  .map(s=>({participant_id:s.participant_id,updated_at:'2026-11-06T10:00:00Z',progress:s.snapshot.workshopProgress,work:s.snapshot.data}));
}if(p.startsWith('course_2ac_submissions'))return [{id:'one',activity_id:conversionExercise.id,activity_type:'unit1_exercise',score:33,max_score:100,is_correct:false}];if(p==='rpc/course_2ac_store_checkpoint'){const v=JSON.parse(init.body),key=[v.p_participant_id,v.p_device_id,v.p_session_id,v.p_kind].join('|'),old=checkpoints.get(key);if((old?.revision||0)!==v.p_expected_revision)return {saved:false,checkpoint:old};const next={participant_id:v.p_participant_id,device_id:v.p_device_id,session_id:v.p_session_id,kind:v.p_kind,revision:(old?.revision||0)+1,snapshot:v.p_snapshot};checkpoints.set(key,next);return {saved:true,checkpoint:next}}throw Error('Unexpected DB request '+p)};
(async()=>{const api=serviceModule.createLearningService({database:db,secret:async()=>'ISOLATED TEST SECRET'});const invoke=async body=>api.publicAction(body);let r=await invoke({action:'learning_session',participantId:pid});const token=r.body.participant.resumeToken;ok(token);r=await invoke({action:'roster_suggestions',className:'2/1',groupName:'1'});eq(Object.keys(r.body.students[0]).sort(),['fullName','id'],'public suggestions expose neither Massar nor dossier IDs');const noisy=serviceModule.createLearningService({database:async()=>[{id:'invalid',full_name:'596252'},{id:'symbols',full_name:';;'},{id:'trial',full_name:'aaaaa aaa'},{id:sid,full_name:'Sara Idrissi'}],secret:async()=>'ISOLATED FILTER SECRET'});const filtered=await noisy.publicAction({action:'roster_suggestions',className:'2/1',groupName:'1'});eq(filtered.body.students,[{id:sid,fullName:'Sara Idrissi'}],'public API filters historical invalid entries without deleting them');

const snapshot={version:1,participantId:pid,sessionId:3,kind:'workshop',revision:0,changedAt:Date.now(),dirty:true,data:{version:1,exerciseId:ids[24],completedIds:ids.slice(0,24)}};
r=await invoke({action:'save_learning_state',resumeToken:token,checkpoint:snapshot});eq(r.status,200);eq(r.body.revision,1);r=await invoke({action:'save_learning_state',resumeToken:token,checkpoint:snapshot});eq(r.status,409,'stale tab cannot overwrite a newer save');eq(r.body.checkpoint.revision,1);
r=await invoke({action:'learning_state',resumeToken:token});eq(r.body.checkpoints.length,1);eq(r.body.checkpoints[0].data.exerciseId,ids[24]);eq(r.body.progress[0].completedIds,[ids[0]]);
const device2=(await invoke({action:'learning_session',participantId:pid})).body.participant.resumeToken;r=await invoke({action:'learning_state',resumeToken:device2});eq(r.body.checkpoints.length,0,'another device cannot retrieve this device’s answers');eq(r.body.progress.length,1,'verified completions may resume across devices');
const prior={participant_id:pid,device_id:crypto.randomUUID(),session_id:3,kind:'workshop',revision:1,snapshot:{version:1,changedAt:Date.now(),data:unfinished}};
checkpoints.set('historical-ungraded',prior);
const teacherProgress=await api.adminAction({action:'teacher_workshop',sessionId:3});
eq(teacherProgress.drafts.find(d=>d.activityId===conversionExercise.id).percent,100,'keep best evidence across devices');
const historicalEvidence=teacherProgress.drafts.filter(d=>d.activityId===conversionExercise.id);
eq(historicalEvidence.length,1,'merge equivalent work from several devices');
const learnerHistory=(await invoke({action:'learner_workshop',resumeToken:token,sessionId:3})).body;
eq(learnerHistory.attempts[0].score,33,'learner sees saved attempt points');
eq(Object.keys(learnerHistory.drafts[0]).sort(),['activityId','confirmed','percent'],'only compact learner progress leaves the API');
delete [...checkpoints.values()].find(c=>c.snapshot.workshopProgress).snapshot.workshopProgress;
eq((await api.adminAction({action:'teacher_workshop',sessionId:3})).drafts.length,24,'checkpoints stored before upgrade are also included');
const refreshed=(await invoke({action:'learning_session',participantId:pid,resumeToken:token})).body.participant.resumeToken;r=await invoke({action:'learning_state',resumeToken:refreshed});eq(r.body.checkpoints.length,1,'refresh preserves the device binding');
for(const body of [{action:'learning_state',resumeToken:token+'x'},{action:'save_learning_state',resumeToken:token,checkpoint:{...snapshot,participantId:crypto.randomUUID()}}]){let rejected=false;try{await invoke(body)}catch(e){rejected=e.status>=400&&e.status<500}ok(rejected,'tampered token or mismatched learner rejected')}
// Registration must reuse the canonical dossier; archiving must not validate an unverified name.
const members=[],people=[];let importedRows=[];
const registry=async(path,init={})=>{
 const u=new URL('https://isolated.test/'+path),q=u.searchParams;
 if(path==='rpc/course_2ac_import_roster'){importedRows=JSON.parse(init.body).p_rows;for(const next of importedRows){const index=members.findIndex(m=>m.id===next.id);if(index>=0)members[index]={...members[index],...next};else members.push(next)}return importedRows.length;}
 if(path.startsWith('course_2ac_roster_students')){
  if(init.method==='POST'){const next=JSON.parse(init.body);if(!members.some(m=>m.registration_key===next.registration_key))members.push({id:crypto.randomUUID(),active:true,...next});return null;}
  return members.filter(m=>(!q.has('id')||q.get('id')==='eq.'+m.id)&&(!q.has('class_name')||q.get('class_name')==='eq.'+m.class_name)&&(!q.has('name_normalized')||q.get('name_normalized')==='eq.'+m.name_normalized)&&(!q.has('registration_key')||q.get('registration_key')==='eq.'+m.registration_key)&&(!q.has('active')||m.active));
 }
 if(path.startsWith('course_2ac_participants')){
  if(init.method==='POST'){const next=JSON.parse(init.body);if(!people.some(p=>p.identity_key===next.identity_key))people.push(next);return null;}
  return people.filter(p=>(!q.has('identity_key')||q.get('identity_key')==='eq.'+p.identity_key)&&(!q.has('id')||q.get('id')==='eq.'+p.id));
 }
 throw Error('Unexpected registry request '+path);
};
const registration=serviceModule.createLearningService({database:registry,secret:async()=>'ISOLATED REGISTRATION SECRET'}),identity={action:'register',studentOne:'Sara Atelier',className:'2/1',groupName:'1',isPair:false};
let invalidRejected=false;try{await registration.publicAction({...identity,studentOne:'596252'})}catch(e){invalidRejected=e.status===400}ok(invalidRejected,'invalid new registrations rejected before database writes');eq(people.length,0);eq(members.length,0);
const registered=(await registration.publicAction(identity)).body.participant,again=(await registration.publicAction(identity)).body.participant;eq(registered.id,again.id,'same name, class and group resumes the canonical dossier');eq(people.length,1,'no duplicate dossier on re-identification');
const pair={...identity,isPair:true,studentTwo:'Amine Atelier'};const paired=(await registration.publicAction(pair)).body.participant,reversed=(await registration.publicAction({...pair,studentOne:pair.studentTwo,studentTwo:pair.studentOne})).body.participant;eq(paired.id,reversed.id,'member order does not duplicate a pair');
const archived=members[0];await registration.adminAction({action:'update_roster',id:archived.id,changes:{active:false}});eq(importedRows[0].source,'registration','archive keeps the verification status');eq(importedRows[0].registration_key,archived.registration_key,'archive keeps the registration alias');let archiveRejected=false;try{await registration.publicAction(identity)}catch(e){archiveRejected=e.status===400}ok(archiveRejected,'typing an archived name cannot recreate an active duplicate');
// Bulk archive is one bounded private update and changes no identity or learning data.
const archiveRows=[{id:crypto.randomUUID(),active:true,full_name:';;',source:'registration',registration_key:'keep-one'},{id:crypto.randomUUID(),active:true,full_name:'Sara Atelier',source:'manual',registration_key:null}];let archiveWrites=0;
const bulk=serviceModule.createLearningService({secret:async()=>'ISOLATED ARCHIVE SECRET',database:async(path,init)=>{eq(init.method,'POST');eq(path,'rpc/course_2ac_set_roster_active');const update=JSON.parse(init.body);eq(Object.keys(update).sort(),['p_active','p_ids'],'only the selection and target state are sent to the atomic operation');archiveWrites++;const selected=update.p_ids;const changed=archiveRows.filter(r=>selected.includes(r.id));for(const row of changed)row.active=update.p_active;return changed.map(r=>({id:r.id}))}});
for(const body of [{ids:[],active:false},{ids:['bad-id'],active:false},{ids:[archiveRows[0].id],active:'false'},{ids:Array(1001).fill(archiveRows[0].id),active:false}]){let rejected=false;try{await bulk.adminAction({action:'set_roster_active',...body})}catch(e){rejected=e.status===400}ok(rejected,'invalid bulk selection rejected before writing')}
eq(archiveWrites,0);
eq(await bulk.publicAction({action:'set_roster_active',ids:[archiveRows[0].id],active:false}),null,'archive is never routed as a public learner action');
const beforeArchive=archiveRows.map(r=>({...r}));const archivedBatch=await bulk.adminAction({action:'set_roster_active',ids:[archiveRows[0].id,archiveRows[0].id,archiveRows[1].id],active:false});eq(archivedBatch.updated,2);eq(archiveWrites,1,'one request for the whole batch, despite duplicate IDs');eq(archiveRows.map(r=>r.active),[false,false]);eq(archiveRows.map(({active,...rest})=>rest),beforeArchive.map(({active,...rest})=>rest),'archiving keeps historical identity metadata');
await bulk.adminAction({action:'set_roster_active',ids:archivedBatch.ids,active:true});eq(archiveRows.map(r=>r.active),[true,true],'undo restores the exact same records');const missing=await bulk.adminAction({action:'set_roster_active',ids:[crypto.randomUUID()],active:false});eq(missing.updated,0,'stale IDs are not reported as archived');eq(missing.ids,[]);
console.log(JSON.stringify({passed:true,assertions}));})().catch(e=>{console.error(e);process.exitCode=1});
