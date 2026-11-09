import { workshopEvidence, workshopExercises, type SavedWorkshopEvidence, type WorkshopAttempt, type WorkshopEvidence } from "../../../lib/workshop-progress.ts";
import { isSuggestibleStudentName } from "./student-names.ts";
// Private rosters, stable learner identities and device-bound resumable drafts.
type Row = Record<string, any>;
type Dependencies = {database:(path:string,init?:RequestInit)=>Promise<any>;secret:()=>Promise<string>};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const kinds=new Set(['workshop','quiz','assessment','view','assembly','repair']);
const text=(v:unknown)=>typeof v==='string'?v.normalize('NFKC').trim().replace(/\s+/g,' '):'';
const normal=(v:unknown)=>text(v).toLocaleLowerCase('fr');
const enc=new TextEncoder();
const pack=(s:Uint8Array)=>btoa(String.fromCharCode(...s)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unpack=(s:string)=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(s.length/4)*4,'=')),c=>c.charCodeAt(0));
function fail(message:string,status=400):never{throw Object.assign(new Error(message),{status})}
function profile(r:Row){return {id:r.id,studentOne:r.student_one,studentTwo:r.student_two,className:r.class_name,groupName:r.group_name,isPair:r.is_pair,studentOneId:r.student_one_id,studentTwoId:r.student_two_id}}
function student(r:Row){return {id:r.id,fullName:r.full_name,className:r.class_name,groupName:r.group_name,massarCode:r.massar_code,source:r.source,active:r.active}}
function checkpoint(r:Row){return {version:r.snapshot.version,changedAt:r.snapshot.changedAt,data:r.snapshot.data,participantId:r.participant_id,sessionId:r.session_id,kind:r.kind,revision:r.revision,dirty:false}}
export function createLearningService({database,secret}:Dependencies){
 async function signature(payload:string){const key=await crypto.subtle.importKey('raw',enc.encode(await secret()),{name:'HMAC',hash:'SHA-256'},false,['sign']);return pack(new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(payload))))}
 async function verify(token:unknown){try{if(typeof token!=='string'||token.length>1600)return null;const [payload,sig,extra]=token.split('.');if(!payload||!sig||extra)return null;const expected=await signature(payload);if(expected.length!==sig.length)return null;let diff=0;for(let i=0;i<sig.length;i++)diff|=sig.charCodeAt(i)^expected.charCodeAt(i);if(diff)return null;const v=JSON.parse(new TextDecoder().decode(unpack(payload)));return v.role==='learner'&&uuid.test(v.participantId)&&uuid.test(v.deviceId)&&Number.isFinite(v.exp)&&v.exp>Date.now()/1000?v:null}catch{return null}}
 async function tokenFor(id:string,existing:unknown){const old=await verify(existing);const p=pack(enc.encode(JSON.stringify({role:'learner',participantId:id,deviceId:old?.participantId===id?old.deviceId:crypto.randomUUID(),exp:Math.floor(Date.now()/1000)+180*86400})));return `${p}.${await signature(p)}`}
 async function participant(id:unknown){if(typeof id!=='string'||!uuid.test(id))fail('Identification invalide.');const rows=await database(`course_2ac_participants?select=*&id=eq.${id}&limit=1`);if(!rows[0])fail('Dossier introuvable. Identifie-toi à nouveau.',404);return rows[0] as Row}
 async function resolveMember(id:unknown,name:unknown,cls:string,group:string){
  if(typeof id==='string'&&uuid.test(id)){const rows=await database(`course_2ac_roster_students?select=*&id=eq.${id}&class_name=eq.${encodeURIComponent(cls)}&active=eq.true&or=(group_name.eq.${group},group_name.is.null)&limit=1`);if(!rows[0])fail('Choisis un nom de ta classe et de ton groupe.');return rows[0] as Row}
  const fullName=text(name);if(!isSuggestibleStudentName(fullName))fail('Saisis un nom complet valide, sans chiffres ni symboles. / اكتب اسما كاملا صحيحا دون أرقام أو رموز.');
  const matches=await database(`course_2ac_roster_students?select=*&class_name=eq.${encodeURIComponent(cls)}&name_normalized=eq.${encodeURIComponent(normal(name))}&or=(group_name.eq.${group},group_name.is.null)&limit=3`);
  const active=matches.filter((r:Row)=>r.active);if(active.length===1)return active[0] as Row;if(active.length>1)fail('Plusieurs noms identiques : choisis ton nom dans la liste.');if(matches.length)fail('Ce nom a été archivé. Contacte ton professeur.');
  const key=`${cls}|${group}|${normal(name)}`;
  await database('course_2ac_roster_students?on_conflict=registration_key',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({full_name:fullName,name_normalized:normal(name),class_name:cls,group_name:group,registration_key:key,source:'registration'})});
  const rows=await database(`course_2ac_roster_students?select=*&registration_key=eq.${encodeURIComponent(key)}&limit=1`);if(!rows[0]?.active)fail('Ce nom a été archivé. Contacte ton professeur.');return rows[0] as Row;
 }
 async function register(body:Row){const cls=text(body.className),group=text(body.groupName),pair=body.isPair===true;if(!/^2\/[1-9]$/.test(cls)||!['1','2'].includes(group))fail('Choisis ta classe et ton groupe.');
  const one=await resolveMember(body.studentOneId,body.studentOne,cls,group),two=pair?await resolveMember(body.studentTwoId,body.studentTwo,cls,group):null;if(two?.id===one.id)fail('Un binôme doit contenir deux élèves différents.');
  const members=[one.id,...(two?[two.id]:[])].sort();const identity=`${cls}|${group}|${pair?'pair':'solo'}|${members[0]}|${members[1]||''}`;const key=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(identity))),b=>b.toString(16).padStart(2,'0')).join('');
  await database('course_2ac_participants?on_conflict=identity_key',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({id:crypto.randomUUID(),student_one:one.full_name,student_two:two?.full_name??null,student_one_id:one.id,student_two_id:two?.id??null,class_name:cls,group_name:group,is_pair:pair,identity_key:key})});
  const rows=await database(`course_2ac_participants?select=*&identity_key=eq.${key}&limit=1`);return {participant:{...profile(rows[0]),resumeToken:await tokenFor(rows[0].id,body.resumeToken)}};
 }
 async function aliases(p:Row){if(!p.student_one_id)return [p.id];let q=`course_2ac_participants?select=id&class_name=eq.${encodeURIComponent(p.class_name)}&group_name=eq.${p.group_name}&is_pair=eq.${p.is_pair}`;
  q+=p.is_pair?`&or=(and(student_one_id.eq.${p.student_one_id},student_two_id.eq.${p.student_two_id}),and(student_one_id.eq.${p.student_two_id},student_two_id.eq.${p.student_one_id}))`:`&student_one_id=eq.${p.student_one_id}`;return (await database(q)).map((r:Row)=>r.id) as string[];
 }
 function validSession(sessionId: unknown): number {
  if (typeof sessionId !== "number" || !Number.isInteger(sessionId) || sessionId < 1 || sessionId > 15) fail("Séance invalide.");
  return sessionId;
 }
 async function* pages(path: string, size: number, limit: number) {
  for (let offset = 0; offset < limit; offset += size) {
   const batchSize = Math.min(size, limit - offset);
   const rows: Row[] = await database(`${path}&limit=${batchSize}&offset=${offset}`);
   yield rows;
   if (rows.length < batchSize) break;
  }
 }
 async function savedWorkshop(sessionId: number, ids?: string[]) {
  if (ids && !ids.length) return { drafts: [] as SavedWorkshopEvidence[], truncated: false };
  const base = `course_2ac_learning_checkpoints?kind=eq.workshop&session_id=eq.${sessionId}${ids ? `&participant_id=in.(${ids.join(",")})` : ""}`;
  const order = "&order=participant_id,device_id";
  const projections = new Map<string, SavedWorkshopEvidence>();
  function add(row: Row, evidence: WorkshopEvidence[]) {
   for (const item of evidence) {
    const key = `${row.participant_id}:${item.activityId}`;
    const previous = projections.get(key);
    projections.set(key, {
     activityId: item.activityId,
     percent: Math.max(previous?.percent ?? 0, item.percent),
     confirmed: !!previous?.confirmed || item.confirmed,
     participantId: row.participant_id,
     updatedAt: previous && previous.updatedAt > row.updated_at ? previous.updatedAt : row.updated_at,
    });
   }
  }
  // Checkpoints saved before this version are graded from their existing drafts.
  const limit = 10000;
  let read = 0;
  const cached = `${base}&snapshot->workshopProgress=not.is.null&select=participant_id,updated_at,progress:snapshot->workshopProgress${order}`;
  for await (const rows of pages(cached, 500, limit)) {
   read += rows.length;
   for (const row of rows) if (Array.isArray(row.progress)) add(row, row.progress);
  }
  let legacyRead = 0;
  const legacy = `${base}&snapshot->workshopProgress=is.null&select=participant_id,updated_at,work:snapshot->data${order}`;
  for await (const rows of pages(legacy, sessionId === 4 ? 30 : 100, limit)) {
   legacyRead += rows.length;
   for (const row of rows) add(row, workshopEvidence(sessionId, row.work));
  }
  return { drafts: [...projections.values()], truncated: read >= limit || legacyRead >= limit };
 }
 async function learnerWorkshop(p: Row, sessionId: number) {
  const ids = [...new Set([p.id, ...await aliases(p)])];
  const definitions = new Map(workshopExercises(sessionId, true).map(item => [item.id, item]));
  const attempts: WorkshopAttempt[] = [];
  const query = `course_2ac_submissions?participant_id=in.(${ids.join(",")})&session_id=eq.${sessionId}&activity_type=in.(unit1_exercise,photo_challenge,workshop)&select=id,activity_id,activity_type,is_correct,score,max_score&order=created_at.desc,id.desc`;
  let count = 0;
  const limit = 5000;
  const saved = savedWorkshop(sessionId, ids);
  const history = (async () => {
   for await (const rows of pages(query, 500, limit)) {
    count += rows.length;
    for (const row of rows) {
     const definition = definitions.get(row.activity_id);
     if (!definition || definition.type !== row.activity_type) continue;
     attempts.push({ id: row.id, activityId: row.activity_id, isCorrect: row.is_correct, score: row.score, maxScore: row.max_score });
    }
   }
  })();
  const [progress] = await Promise.all([saved, history]);
  return {
   drafts: progress.drafts.map(({ activityId, percent, confirmed }) => ({ activityId, percent, confirmed })),
   attempts,
   truncated: progress.truncated || count >= limit,
  };
 }
 async function publicAction(body:Row):Promise<{body:unknown;status:number}|null>{
  if(body.action==='roster_suggestions'){const cls=text(body.className),group=text(body.groupName);if(!/^2\/[1-9]$/.test(cls)||!['1','2'].includes(group))fail('Classe ou groupe invalide.');const rows=await database(`course_2ac_roster_students?select=id,full_name&active=eq.true&class_name=eq.${encodeURIComponent(cls)}&or=(group_name.eq.${group},group_name.is.null)&order=full_name&limit=1000`);return {body:{students:rows.filter((r:Row)=>isSuggestibleStudentName(r.full_name)).map((r:Row)=>({id:r.id,fullName:r.full_name}))},status:200};}
  if(body.action==='register')return {body:await register(body),status:200};
  if(body.action==='learning_session'){const p=await participant(body.participantId);return {body:{participant:{...profile(p),resumeToken:await tokenFor(p.id,body.resumeToken)}},status:200};}
  if(!['learning_state','save_learning_state','learner_workshop'].includes(body.action))return null;
  const auth=await verify(body.resumeToken);if(!auth)fail('Session de sauvegarde expirée.',401);const p=await participant(auth.participantId);
  if (body.action === 'learner_workshop') return { body: await learnerWorkshop(p, validSession(body.sessionId)), status: 200 };
  if(body.action==='learning_state'){
   const rows=await database(`course_2ac_learning_checkpoints?select=*&participant_id=eq.${p.id}&device_id=eq.${auth.deviceId}`);
   const ids=await aliases(p);const activities=await database(`course_2ac_activity_progress?select=session_id,activity_id,activity_type,successful&participant_id=in.(${ids.join(',')})&successful=eq.true&activity_type=eq.unit1_exercise&limit=1000`);
   const progress=new Map<number,Set<string>>();for(const a of activities){if(!progress.has(a.session_id))progress.set(a.session_id,new Set());progress.get(a.session_id)!.add(a.activity_id)}
   return {body:{checkpoints:rows.map(checkpoint),progress:[...progress].map(([sessionId,ids])=>({sessionId,completedIds:[...ids]}))},status:200};
  }
  const s=body.checkpoint;if(!s||s.participantId!==p.id||s.version!==1||!Number.isInteger(s.sessionId)||s.sessionId<1||s.sessionId>15||!kinds.has(s.kind)||!Number.isInteger(s.revision)||s.revision<0||!Number.isFinite(s.changedAt)||s.changedAt<1||!s.data||Array.isArray(s.data)||typeof s.data!=='object'||enc.encode(JSON.stringify(s)).length>250000)fail('Sauvegarde invalide.');
  const stored=await database('rpc/course_2ac_store_checkpoint',{method:'POST',body:JSON.stringify({p_participant_id:p.id,p_device_id:auth.deviceId,p_session_id:s.sessionId,p_kind:s.kind,p_expected_revision:s.revision,p_snapshot:{version:1,changedAt:s.changedAt,data:s.data,...(s.kind==='workshop'?{workshopProgress:workshopEvidence(s.sessionId,s.data)}:{})}})});
  return stored.saved?{body:{saved:true,revision:stored.checkpoint.revision},status:200}:{body:{error:'Une sauvegarde plus récente existe.',checkpoint:stored.checkpoint?checkpoint(stored.checkpoint):null},status:409};
 }
 function validateRoster(row:Row){const name=text(row.fullName),cls=text(row.className),group=row.groupName?text(row.groupName):null,massar=row.massarCode?text(row.massarCode).toUpperCase():null;if(name.length<2||name.length>100||!/^2\/[1-9]$/.test(cls)||(group!==null&&!['1','2'].includes(group))||(massar!==null&&!/^[A-Z0-9]{5,20}$/.test(massar))||(row.id&&!uuid.test(row.id)))fail('Liste invalide : vérifie le nom, la classe, le groupe et le code Massar.');return {id:row.id||crypto.randomUUID(),full_name:name,name_normalized:normal(name),class_name:cls,group_name:group,massar_code:massar,registration_key:null,source:row.source==='manual'?'manual':'import',active:row.active!==false}}
 async function adminAction(body:Row):Promise<unknown|null>{
  if (body.action === 'teacher_workshop') return await savedWorkshop(validSession(body.sessionId));
  if(body.action==='learning_analytics'){const o=await database('rpc/course_2ac_learning_overview',{method:'POST',body:'{}'});return {students:o.students.slice(0,5000).map(student),participants:o.participants.slice(0,10000).map((r:Row)=>({...profile(r),createdAt:r.created_at})),activities:o.activities.slice(0,50000).map((r:Row)=>({participantId:r.participant_id,sessionId:r.session_id,activityId:r.activity_id,activityType:r.activity_type,attempts:r.attempts,graded:r.graded,correct:r.correct,successful:r.successful,firstSuccessAt:r.first_success_at,lastAt:r.last_at,bestScore:r.best_score,maxScore:r.max_score,sections:r.sections})),sessionAccess:o.sessionAccess.map((r:Row)=>({sessionId:r.session_id,isUnlocked:r.is_unlocked,updatedAt:r.updated_at})),generatedAt:o.generatedAt,truncated:o.students.length>5000||o.participants.length>10000||o.activities.length>50000};}
  if(body.action==='import_roster'){
   if(!Array.isArray(body.students)||!body.students.length||body.students.length>1000)fail('Importe entre 1 et 1 000 élèves à la fois.');const rows=body.students.map(validateRoster);const existing=await database('course_2ac_roster_students?select=id,massar_code&massar_code=not.is.null&limit=5000');
   const byMassar=new Map(existing.map((r:Row)=>[r.massar_code,r.id]));for(const r of rows){if(r.massar_code&&byMassar.has(r.massar_code)){if(body.students[rows.indexOf(r)].id&&byMassar.get(r.massar_code)!==r.id)fail('Le code Massar correspond à une autre fiche.');r.id=byMassar.get(r.massar_code) as string;}}
   if(new Set(rows.map((r:Row)=>r.id)).size!==rows.length||new Set(rows.filter((r:Row)=>r.massar_code).map((r:Row)=>r.massar_code)).size!==rows.filter((r:Row)=>r.massar_code).length)fail('La liste contient des doublons.');const saved=await database('rpc/course_2ac_import_roster',{method:'POST',body:JSON.stringify({p_rows:rows})});return {saved};
  }
  if(body.action==='set_roster_active'){
   if(!Array.isArray(body.ids)||!body.ids.length||body.ids.length>1000||body.ids.some((id:unknown)=>typeof id!=='string'||!uuid.test(id))||typeof body.active!=='boolean')fail('Sélection invalide : choisis entre 1 et 1 000 comptes.');
   const ids=[...new Set<string>(body.ids)];
   const updated=await database('rpc/course_2ac_set_roster_active',{method:'POST',body:JSON.stringify({p_ids:ids,p_active:body.active})});
   return {updated:updated.length,ids:updated.map((r:Row)=>r.id),active:body.active};
  }
  if(body.action==='update_roster'){if(!uuid.test(body.id))fail('Identifiant invalide.');const rows=await database(`course_2ac_roster_students?select=*&id=eq.${body.id}&limit=1`);if(!rows[0])fail('Élève introuvable.',404);const next=validateRoster({...student(rows[0]),...body.changes,id:body.id});next.source=['manual','import'].includes(body.changes?.source)?body.changes.source:rows[0].source;next.registration_key=next.full_name===rows[0].full_name&&next.class_name===rows[0].class_name&&next.group_name===rows[0].group_name?rows[0].registration_key:null;await database('rpc/course_2ac_import_roster',{method:'POST',body:JSON.stringify({p_rows:[next]})});return {saved:true};}
  return null;
 }
 return {publicAction,adminAction,verify};
}
