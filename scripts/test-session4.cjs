const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process'),crypto=require('node:crypto'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loader(revision){const cache={};return function load(relative){relative=path.normalize(relative);if(cache[relative])return cache[relative];const exports={};cache[relative]=exports;const source=revision?cp.execFileSync('git',['show',revision+':'+relative],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,relative),'utf8');const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports,require:name=>{if(!name.startsWith('.'))return require(name);let f=path.join(path.dirname(relative),name);if(!path.extname(f))f+='.ts';return load(f)},process});return exports;}}
const load=loader();const {session4,session4Activities,session4EarlierActivities,session4LegacyActivities,session4Equipment,session4NetworkEquipment}=load('app/session4-data.ts'),m=load('app/session4-model.ts'),rubric=load('supabase/functions/informatique-2ac-api/session4-evaluation.ts');
let assertions=0;const equal=(a,b,msg)=>{assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),msg);assertions++};
equal(session4Activities.reduce((s,a)=>s+a.minutes,0),85,'workshop lasts 85 minutes');equal(10+85+10+15,120,'lesson lasts exactly two hours');equal(session4Activities.filter(a=>a.kind!=='video').map(a=>a.kind),['names','roles','star','bus','ring','patch','wireless','mixed','identity','build'],'the final activity builds a complete network');equal(session4NetworkEquipment.map(item=>item.id),['switch','ap','router','card','cable','wifi'],'the inventory includes a Wi-Fi card and excludes end devices');
equal(new Set(session4NetworkEquipment.map(item=>item.role.fr)).size,6,'each device has a distinct role');
equal(session4NetworkEquipment.every(item=>fs.existsSync(path.join(root,'public',item.image))),true,'all equipment photos are available');
for(const [value,expected]of [['192.168.10.21',true],['10.0.0.2',true],['172.20.10.3',true],['192.168.10.999',false],['127.0.0.1',false],['example.org',false],['192.168.1',false],['8.8.8.8',false]])equal(m.isPrivateIPv4(value),expected,value);
equal(m.session4SharePath,String.raw`\\192.168.10.21\Club_reseau`,'UNC path uses two leading backslashes');
equal(m.runSession4Command('IPCONFIG',true).includes('192.168.10.21'),true,'terminal command accepts upper case');equal(m.runSession4Command('hostname',true),'PC-21');equal((m.runSession4Command('ping 192.168.10.22',true).match(/Réponse de/g)||[]).length,4,'successful ping displays four replies');equal(m.runSession4Command('ping 192.168.10.22',false).includes('perte 100 %'),true);
const sim=(mode,completed=true)=>({version:2,mode,checks:Array(({identity:2,ping:3,sharing:5,messenger:5,repair:4})[mode]).fill(completed),completed,snapshot:{},evidence:{}});
const states={lan:{internet:false,delivered:true,selections:{lan:'local'}},cables:{links:['PC-21','PC-22','PC-23','Imprimante','Portable','Mac','TV'],tested:true,selections:{router:'router',switch:'switch',ap:'ap'}},equipment:{selections:Object.fromEntries(session4Equipment.map(e=>[e.id,e.answer]))},topology:{selections:{star:'star',bus:'bus',ring:'ring'}},identity:{simulator:sim('identity'),ip:'192.168.10.21',host:'pc-21'},ping:{simulator:sim('ping')},sharing:{simulator:sim('sharing')},practice:{checks:['source','receive','reverse','return'],ip:'192.168.10.21',peerIP:'192.168.10.22',proof:'Bien reçu !'},messenger:{simulator:sim('messenger')},repair:{simulator:sim('repair')}};
for(const activity of session4LegacyActivities){equal(m.session4ActivityCorrect(activity,m.freshSession4Draft()),false,activity.id+' cannot pass empty');equal(m.session4ActivityCorrect(activity,{...m.freshSession4Draft(),...states[activity.kind]}),true,activity.id+' passes with the expected actions');}
const practice=session4EarlierActivities.find(a=>a.kind==='practice');equal(m.session4ActivityCorrect(practice,{...m.freshSession4Draft(),...states.practice,peerIP:states.practice.ip}),false,'real TP cannot declare two identical addresses');
equal(m.initialSession4Workshop({checked:[true,true]}).completedIds,['session-4-workshop-A','session-4-workshop-B'],'previous lesson-4 completions can be retained');
const saved={...m.initialSession4Workshop(null),activityIndex:7,completedIds:['session-4-workshop-A'],drafts:{'session-4-workshop-TP':{...m.freshSession4Draft(),...states.practice}},summary:false};equal(m.validSession4Workshop(JSON.parse(JSON.stringify(saved))),true,'real work survives serialization');
const fullChoices=Object.fromEntries(rubric.session4Questions.map(q=>[q.id,q.answer]));const full=rubric.gradeSession4(fullChoices),empty=rubric.gradeSession4({});
equal(full.score,20);equal(full.sections,[6,4,6,4]);equal(rubric.validSession4Evaluation(full,true,20,20),true);equal(rubric.validSession4Evaluation(empty,false,0,20),true);equal(Buffer.byteLength(JSON.stringify(full))<12000,true,'answer fits existing storage');
for(const edit of [a=>a.score=19,a=>a.answers[0].earnedPoints=0,a=>a.sections[0]=0,a=>a.choices.unknown=0,a=>a.choices.lan=99,a=>a.answers[0].selectedChoice.fr='fake']){const changed=structuredClone(full);edit(changed);equal(rubric.validSession4Evaluation(changed,true,20,20),false,'forged assessment rejected')}
const fullLab=rubric.gradeSession4Lab(fullChoices,{access:'read',copied:true,opened:true});
const partialLab=rubric.gradeSession4Lab({lan:0},{access:'read',copied:false,opened:false});
equal(fullLab.score,20);equal(fullLab.sections,[3,2,3,2,10]);equal(rubric.validSession4Evaluation(fullLab,true,20,20),true);
equal(partialLab.score,4,'one answer and one practical step get partial credit');equal(rubric.validSession4Evaluation(partialLab,false,4,20),true);
equal(rubric.gradeSession4Lab({}, {access:'write',copied:false,opened:true}).score,0,'write access and opening without a copy do not count');
equal(Buffer.byteLength(JSON.stringify(fullLab))<12000,true,'practical evidence fits existing storage');
for(const edit of [a=>a.evidence.access='write',a=>a.evidence.copied=false,a=>a.practical[1].earnedPoints=0]){
 const changed=structuredClone(fullLab);edit(changed);equal(rubric.validSession4Evaluation(changed,true,20,20),false,'changed practical results are rejected');
}
const expo=load('app/session4-expo-model.ts'),scores=load('lib/workshop-progress.ts');
const networks=expo.expoNetworks,ssid=expo.expoSSID;
const makeNetwork=(kind,selections)=>({selections,links:networks[kind].wires,tested:true,delivered:true});
const fullNetwork={switch:'switch',ap:'ap',ssid,laptop:ssid,tv:ssid};
const newStates={
 build:{selections:{'build-switch':'switch','build-ap':'ap','build-port-pc21':'1','build-port-pc22':'2','build-port-ap':'3','build-ssid':ssid,'build-laptop':ssid},checks:['build-wired-tested','build-mixed-tested'],tested:true,delivered:true},
 names:{selections:Object.fromEntries(session4NetworkEquipment.map(item=>[`name-${item.id}`,item.id]))},
 roles:{selections:Object.fromEntries(session4NetworkEquipment.map(item=>[`role-${item.id}`,item.id]))},
 ...Object.fromEntries(expo.expoPlans.map(plan=>[plan.topology,{selections:{[`wire-${plan.id}`]:String(plan.missing),[`topo-${plan.id}`]:plan.topology}}])),
 patch:{selections:{pc21:'1',pc22:'2'},tested:true,delivered:true},
 exchange:{selections:{folder:expo.expoFolder,file:'placed',remote:'PC-21',read:'yes',code:expo.expoInviteCode},permission:'read',shared:true,opened:true},
 loan:{selections:{loanName:expo.expoLoan.label,loanAddress:expo.expoLoan.address,loanWifi:ssid},tested:true,delivered:true},
 inventory:{selections:Object.fromEntries(session4Equipment.flatMap(item=>[[`name-${item.id}`,item.id],[`role-${item.id}`,item.id]]))},
 media:{selections:Object.fromEntries(expo.expoMedia.map(item=>[item.id,item.link]))},
 plans:{selections:Object.fromEntries(expo.expoPlans.flatMap(plan=>[[`wire-${plan.id}`,String(plan.missing)],[`topo-${plan.id}`,plan.topology]]))},
 wired:makeNetwork('wired',{switch:'switch'}),
 wireless:makeNetwork('wireless',{ap:'ap',ssid,laptop:ssid,laptop2:ssid}),
 mixed:makeNetwork('mixed',fullNetwork),
 folder:{selections:{folder:expo.expoFolder,file:'placed',read:'yes',copied:'yes'},permission:'read',shared:true,path:expo.expoPath,opened:true},
 identity:{commands:['ipconfig','hostname','ping 192.168.10.22'],ip:'192.168.10.21',host:'PC-21'},
 diagnostic:makeNetwork('diagnostic',{rewired:'yes',failed:'yes',cause:'uplink'}),
 practice:states.practice,
};
const applied=load('supabase/functions/informatique-2ac-api/session4-applied-evaluation.ts');
const appliedAnswers=Object.fromEntries(applied.session4AppliedQuestions.map(q=>[q.id,q.answer]));
const appliedFull=applied.gradeSession4Applied(appliedAnswers,newStates.build,newStates.identity,{access:'read',copied:true,opened:true});
equal(appliedFull.sections,[6,5,3,6],'the four missions have the published point distribution');
equal(appliedFull.score,20);equal(applied.validSession4AppliedEvaluation(appliedFull,true,20,20),true);
equal(Buffer.byteLength(JSON.stringify(appliedFull))<12000,true,'the detailed new copy fits the existing response limit');
equal(applied.gradeSession4Applied({},null,null,null).score,0,'empty work earns zero');
const appliedPartial=applied.gradeSession4Applied({'stock-switch':1},{selections:{'build-switch':'switch','build-port-pc21':'1'}},{commands:['ipconfig'],ip:'192.168.10.21'},null);
equal(appliedPartial.sections,[1,1,1,0],'each completed action receives credit independently');
equal(applied.validSession4AppliedEvaluation(appliedPartial,false,3,20),true,'unfinished copies can be submitted');
equal(applied.gradeSession4Applied(appliedAnswers,newStates.build,{ip:'192.168.10.21',host:'PC-21'},{access:'read',copied:true,opened:true}).score,17,'guessing terminal values without executing commands earns no CMD points');
equal(applied.gradeSession4Applied({},null,null,{opened:true}).score,0,'opening without a network copy earns no points');
equal(applied.gradeSession4Applied({}, {tested:true,checks:['build-mixed-tested']},null,null).score,0,'a test flag without the actual network cannot earn points');
for(const edit of [a=>a.score=19,a=>a.sections[1]=0,a=>a.practical[0].earnedPoints=0,a=>a.answers[0].selectedChoice.fr='fake',a=>a.evidence.network.selections.extra='switch',a=>a.choices.unknown=0]){
 const changed=structuredClone(appliedFull);edit(changed);equal(applied.validSession4AppliedEvaluation(changed,true,20,20),false,'the server rejects changed scores, labels and unknown evidence');
}
equal(applied.validSession4AppliedEvaluation(appliedFull,false,20,20),false,'the success flag must match the recalculated score');
const appliedState=load('app/session4-assessment-state.ts');
const previousQuiz={version:1,index:2,choices:{lan:0,switch:1},submitted:true};
const newAppliedState={...appliedState.initialSession4Applied(previousQuiz),part:2,network:{...m.freshSession4Draft(),...newStates.build},terminal:{...m.freshSession4Draft(),command:'ping 192.168.10.22'},answers:{'stock-switch':1}};
equal(appliedState.validSession4AppliedState(JSON.parse(JSON.stringify(newAppliedState))),true,'a closed window restores all four mission fields');
equal(newAppliedState.previousQuiz,previousQuiz,'the earlier quiz copy is retained during upgrade');
equal(appliedState.validSession4AppliedState({...newAppliedState,part:4}),false);
for(const activity of [...session4Activities.filter(a=>a.kind!=='video'),...session4EarlierActivities.filter(a=>'edition' in a&&a.kind!=='video')]){
 equal(m.session4ActivityCorrect(activity,m.freshSession4Draft()),false,activity.id+' requires active work');
 equal(m.session4ActivityCorrect(activity,{...m.freshSession4Draft(),...newStates[activity.kind]}),true,activity.id+' completes with observed work');
 equal(scores.session4DraftPercent(activity,newStates[activity.kind]),100,'dashboard shares the exercise rubric');
}
const videoActivities=session4Activities.filter(a=>a.kind==='video');
equal(videoActivities.map(a=>a.video.file),['Video_Get_IP.mp4','Video_partage.mp4','Video_access.mp4','Video_Downold_img.mp4'],'the messenger clip is removed from the active workshop');
equal(videoActivities.reduce((total,a)=>total+a.video.questions.length,0),9,'the four video exercises have nine questions');
equal(new Set(session4Activities.map(a=>a.id)).size,session4Activities.length,'each saved exercise has a unique ID');
for(const activity of videoActivities){
 const {questions}=activity.video;
 const [minutes,seconds]=activity.video.duration.split(':').map(Number);
 equal(questions.every(q=>q.second>=0&&q.second<minutes*60+seconds&&q.choices.filter(c=>c.id===q.answer).length===1),true,'each cue is inside its clip and has one correct answer');
 equal(fs.existsSync(path.join(root,'public','session4','videos',activity.label+'.webp')),true,'each video has a local poster');
 const blank=m.freshSession4Draft();
 equal(m.session4ActivityCorrect(activity,blank),false,'watching alone does not award credit');
 equal(scores.session4DraftPercent(activity,blank),null);
 const partial={...blank,selections:{[questions[0].id]:questions[0].answer}};
 const saved={version:1,completedIds:[],drafts:{[activity.id]:partial}};
 equal(scores.workshopEvidence(4,saved).find(item=>item.activityId===activity.id)?.percent,Math.round(100/questions.length),'video answers contribute to saved partial progress');
 const complete={...blank,selections:Object.fromEntries(questions.map(q=>[q.id,q.answer]))};
 equal(m.session4ActivityCorrect(activity,complete),true,'video activity passes with all correct answers');
 equal(scores.session4DraftPercent(activity,complete),100);
}
for(const activity of session4Activities.filter(a=>a.previousId)){
 const previous=session4EarlierActivities.find(a=>a.id===activity.previousId);
 const selections=Object.fromEntries(Object.entries(newStates[activity.kind].selections).filter(([key])=>!key.endsWith('-wifi')));
 const savedDraft={...m.freshSession4Draft(),selections,result:true};
 const drafts={[previous.id]:savedDraft};
 equal(m.session4ActivityCorrect(previous,savedDraft),true,'old equipment work retains its original rubric');
 equal(m.session4WorkshopDraft(activity,drafts).selections,selections,'saved equipment choices carry forward');
 equal(m.session4WorkshopDraft(activity,drafts).result,null,'the sixth photo needs a new check');
 equal(scores.workshopEvidence(4,{version:1,drafts,completedIds:[previous.id]}).find(x=>x.activityId===activity.id)?.percent,83,'earlier correct choices earn partial credit under the six-photo rubric');
 const cached=[{activityId:previous.id,percent:100,confirmed:true}];
 const row=scores.workshopRows(scores.workshopExercises(4),cached,[]).find(x=>x.id===activity.id);
 equal([row.percent,row.confirmed],[83,false],'cached teacher progress retains credit for the first five photos');
}
equal(expo.expoRoute('wired',newStates.wired),['pc21','switch','printer'],'the wired document traverses the switch');
equal(expo.expoRoute('wireless',newStates.wireless),['laptop','ap','laptop2'],'the Wi-Fi packet traverses the access point without cables');
equal(expo.expoRoute('wireless',{...newStates.wireless,selections:{...newStates.wireless.selections,laptop2:'INVITES'}}),null,'different SSIDs cannot deliver the document');
equal(expo.expoRoute('mixed',newStates.mixed),['pc21','switch','ap','tv'],'the mixed network bridges Ethernet and Wi-Fi');
equal(expo.expoRoute('mixed',{...newStates.mixed,links:[expo.expoWire('pc21','printer'),expo.expoWire('printer','ap')]}),null,'an end device never relays between links');
equal(expo.expoRoute('diagnostic',m.freshSession4Draft()),null,'the missing access-point uplink prevents delivery');
equal(scores.session4DraftPercent(session4EarlierActivities.find(a=>a.kind==='diagnostic'),{}),null,'preinstalled devices do not earn a grade');
const exchangeActivity=session4EarlierActivities.find(a=>a.kind==='exchange');
const exchange={...m.freshSession4Draft(),...newStates.exchange};
equal(expo.expoShareReady({...exchange,permission:'write'}),true,'read and write still grants access');
equal(m.session4ActivityCorrect(exchangeActivity,{...exchange,permission:'write'}),false,'the activity asks for the minimum right');
equal(m.session4ActivityCorrect(exchangeActivity,{...exchange,selections:{...exchange.selections,remote:'PC-23'}}),false,'the wrong workstation cannot open the invitation');
equal(m.session4ActivityCorrect(exchangeActivity,{...exchange,selections:{...exchange.selections,read:''}}),false,'the code must come from opening the file');
equal(expo.expoPatchConnected({...m.freshSession4Draft(),...newStates.patch,selections:{pc21:'1',pc22:'1'}}),false,'one RJ45 port accepts only one connection');
equal(expo.expoLoanResult({...m.freshSession4Draft(),selections:{...newStates.loan.selections,loanAddress:'192.168.10.22'}}),'address','an occupied address blocks delivery');
equal(expo.expoLoanResult({...m.freshSession4Draft(),selections:{...newStates.loan.selections,loanWifi:'INVITES'}}),'wifi','the invitation stays on the team network');
equal(expo.expoLoanResult({...m.freshSession4Draft(),selections:{...newStates.loan.selections,loanName:'PC-22'}}),'name','the delivery verifies the name on the portable');
equal(scores.workshopExercises(4).some(a=>a.id===session4LegacyActivities[0].id),false,'earlier results do not award credit for new exercises');
equal(scores.workshopExercises(4,true).some(a=>a.id===session4LegacyActivities[0].id),true,'earlier activity IDs remain supported in the history API');
equal(scores.workshopExercises(4,true).some(a=>a.id==='session-4-workshop-expo-media'),true,'the removed exercise is still readable in archived attempts');
equal(scores.workshopExercises(4).filter(a=>a.id==='session-4-workshop-expo-wireless').length,1,'equivalent wireless attempts still match exactly one current activity');
const earlier=m.initialSession4Workshop(saved);
equal(earlier.drafts,saved.drafts,'historical checkpoints are preserved on opening the redesigned lesson');
const retiredIds=['session-4-workshop-expo-exchange','session-4-workshop-expo-loan','session-4-workshop-video-messagerie','session-4-workshop-expo-diagnostic'];
for(const id of retiredIds){
 equal(session4Activities.some(a=>a.id===id),false,'retired exercise is hidden from the active workshop');
 equal(scores.workshopExercises(4,true).some(a=>a.id===id),true,'retired exercise retains its grading history');
}
const lastOldCheckpoint={...saved,activityIndex:16,activityId:retiredIds[2]};
equal(m.validSession4Workshop(lastOldCheckpoint),true,'a saved index beyond the shorter workshop never discards earlier work');
equal(m.initialSession4Workshop(lastOldCheckpoint).drafts,saved.drafts,'all drafts survive the removal of the last exercises');
const buildActivity=session4Activities.at(-1),buildDraft={...m.freshSession4Draft(),...newStates.build};
equal(buildActivity.kind,'build','the final mission asks learners to construct the network');
equal(expo.expoBuildStatus(buildDraft).mixed,true,'a complete setup reaches the portable over Ethernet and Wi-Fi');
equal(m.session4ActivityCorrect(buildActivity,{...buildDraft,checks:[]}),false,'connections alone require a real test');
const noUplink={...buildDraft,selections:{...buildDraft.selections,'build-port-ap':''}};
equal(expo.expoBuildStatus(noUplink).wired,true,'the two wired PCs still communicate without an AP uplink');
equal(expo.expoBuildStatus(noUplink).mixed,false,'the portable needs the access point connected to the switch');
equal(scores.session4DraftPercent(buildActivity,noUplink),78,'partial work retains the successful wiring and Wi-Fi settings');
for(const patch of [{'build-port-pc22':'1'},{'build-port-ap':'1'},{'build-port-pc21':'9'},{'build-switch':''},{'build-ap':''},{'build-laptop':'INVITES'}]){
 equal(m.session4ActivityCorrect(buildActivity,{...buildDraft,selections:{...buildDraft.selections,...patch}}),false,'occupied ports, missing equipment and different Wi-Fi networks cannot pass');
}
equal(scores.workshopEvidence(4,{version:1,completedIds:['session-4-workshop-expo-diagnostic'],drafts:{'session-4-workshop-expo-diagnostic':{...m.freshSession4Draft(),...newStates.diagnostic}}}).some(row=>row.activityId===buildActivity.id),false,'the earlier repair exercise never marks the new construction mission completed');
equal(fs.existsSync(path.join(root,'public/session4/images/salle-reseau-club.webp')),true,'the classroom mission banner is packaged with the lesson');
const videoFlow=load('app/session4-video-model.ts');
const ipVideo=videoActivities[0].video;
const [firstQuestion,secondQuestion]=ipVideo.questions;
let videoDraft={...m.freshSession4Draft(),videoPosition:0};
equal(videoFlow.pendingVideoQuestion(ipVideo,videoDraft),0);
equal(videoFlow.limitVideoPosition(ipVideo,videoDraft,200),firstQuestion.second,'seeking cannot skip the first unanswered checkpoint');
videoDraft={...videoDraft,selections:{[firstQuestion.id]:firstQuestion.answer},checks:[videoFlow.videoQuestionMarker(firstQuestion.id)]};
equal(videoFlow.limitVideoPosition(ipVideo,videoDraft,200),secondQuestion.second,'a validated answer unlocks only the next segment');
videoDraft.selections[secondQuestion.id]=secondQuestion.answer;
videoDraft.checks.push(videoFlow.videoQuestionMarker(secondQuestion.id));
equal(videoFlow.pendingVideoQuestion(ipVideo,videoDraft),-1);
equal(videoFlow.limitVideoPosition(ipVideo,videoDraft,200),200,'the completed video can be replayed freely');
const legacyVideo={...m.freshSession4Draft(),selections:{[firstQuestion.id]:firstQuestion.answer}};
equal(videoFlow.pendingVideoQuestion(ipVideo,legacyVideo),1,'correct answers saved in the earlier video format are retained');
const shareVideo=videoActivities[1].video;
const shareDraft={...m.freshSession4Draft(),videoPosition:36,selections:Object.fromEntries(shareVideo.questions.slice(0,2).map(q=>[q.id,q.answer])),checks:shareVideo.questions.slice(0,2).map(q=>videoFlow.videoQuestionMarker(q.id))};
equal(videoFlow.pendingVideoQuestion(shareVideo,shareDraft),2,'two questions at the same second remain separate checkpoints');
equal(videoFlow.limitVideoPosition(shareVideo,shareDraft,60),36);
equal(m.runSession4Command('ping   192.168.10.22',true).includes('reçus = 4'),true,'the terminal accepts spacing variations');
equal(m.runSession4Command('cls',true),'');
equal(m.runSession4Command('help',true).includes('IPCONFIG'),true);
const longTerminal={...m.freshSession4Draft(),terminalHistory:Array(40).fill('ipconfig'),output:'x'.repeat(18000)};
equal(JSON.stringify(m.session4AnswerState(longTerminal)).length<12000,true,'terminal transcripts do not overflow the submission limit');
const progress=load('app/prof/learning-model.ts');equal(progress.targetsFor(4).length,14,'teacher tracks both practical and video exercises');equal(progress.targetsFor(4).some(t=>t.id==='session-4-workshop-TP'),false,'TP declaration does not claim mastery');

// The desktop checks real files, sharing rights, inbox reads and ordered operations.
const simulationModule={exports:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'public/session4/simulateur/missions.js'),'utf8'),{module:simulationModule});const simulator=simulationModule.exports;
function machine(name){return {version:2,name,ip:name==='PC-21'?'192.168.10.21':'192.168.10.22',cable:true,dirs:{docs:'docs'},seq:4,shareSeq:0,wall:0,users:['Élève'],nodes:{root:{id:'root',name:'Ce PC',kids:['docs','desktop','downloads']},trash:{id:'trash',name:'Corbeille',kids:[]},docs:{id:'docs',name:'Documents',kids:[]},desktop:{id:'desktop',name:'Bureau',kids:[]},downloads:{id:'downloads',name:'Téléchargements',kids:[]}},shares:[],inbox:[],sent:[],did:{}};}
function file(pc,parent,name,content='',dir=false){const id='test'+(++pc.seq);pc.nodes[id]={id,name,content,dir,kids:[],parent};pc.nodes[parent].kids.push(id);return id;}
let a=machine('PC-21'),b=machine('PC-22');
equal(simulator.evaluate('sharing',a,b,[]).completed,false);
const folder=file(a,'docs','Club_reseau','',true);file(a,folder,'Bonjour.txt','Bonjour le club !');
equal(simulator.evaluate('sharing',a,b,[]).checks,[true,false,false,false,false]);
a.shares=[{id:'sh1',name:'Club_reseau',dirId:folder,who:'Postes de la salle',perm:'write'}];equal(simulator.evaluate('sharing',a,b,[]).checks[1],false,'least-privilege task requires read permission');a.shares[0].perm='read';
file(b,'desktop','Bonjour.txt','Bonjour le club !');equal(simulator.evaluate('sharing',a,b,[]).checks[2],false,'typing the same filename is not a network copy');
b.did.transfers=[{from:'PC-21',names:['Bonjour.txt']}];b.did.openedFiles=[{name:'Bonjour.txt',local:true}];const before=simulator.evaluate('sharing',a,b,[]);equal(before.checks,[true,true,true,true,false]);
a.shares=[];a.did.unshared=true;equal(simulator.evaluate('sharing',a,b,before.checks).completed,true,'finishing sharing retains proof of the earlier actions');
equal(simulator.evaluate('sharing',a,b,[]).completed,false,'unsharing before the exchange cannot skip the sharing step');
a=machine('PC-21');b=machine('PC-22');a.did.sentMessages=[{to:'PC-22',text:'Bonjour le club !',attachment:'Bonjour.txt'}];b.inbox=[{from:'PC-21',text:'Bonjour',att:{name:'Bonjour.txt',content:'Bonjour le club !'},read:false}];
equal(simulator.evaluate('messenger',a,b,[]).checks,[true,false,false,false,false]);
b.inbox[0].read=true;b.did.attSaved=true;file(b,'downloads','Bonjour.txt','Bonjour le club !');b.did.openedFiles=[{name:'Bonjour.txt',local:true}];
equal(simulator.evaluate('messenger',a,b,[]).completed,false,'a sent attachment is not a recipient confirmation');a.inbox=[{from:'PC-22',text:'Reçu',read:true}];equal(simulator.evaluate('messenger',a,b,[]).completed,true);
a=machine('PC-21');b=machine('PC-22');b.cable=false;a.did.failedPing=true;equal(simulator.evaluate('ping',a,b,[]).checks,[true,false,false]);b.cable=true;b.did.cable=true;a.did.successPing=true;equal(simulator.evaluate('ping',a,b,[]).completed,true);
equal(simulator.validSnapshot({version:2,mode:'ping',machines:{A:a,B:b}},'ping'),true);equal(simulator.validSnapshot({version:2,mode:'ping',machines:{A:a,B:b}},'sharing'),false);
for(const mode of Object.keys(simulator.missions).filter(mode=>mode!=='assessment')){equal(m.session4ActivityCorrect(session4LegacyActivities.find(a=>a.kind===mode),{...m.freshSession4Draft(),...states[mode],simulator:{...sim(mode),checks:sim(mode).checks.map(()=>false)}}),false,'forged completed flag rejected for '+mode);}
a=machine('PC-21');b=machine('PC-22');
const assessmentFolder=file(a,'docs','Club_reseau','',true);
file(a,assessmentFolder,'Invitation.txt',simulator.invitation);
equal(simulator.evaluate('assessment',a,b,[]).checks,[false,false,false],'the prepared source does not earn points');
a.shares=[{id:'assessment-share',name:'Club_reseau',dirId:assessmentFolder,who:'Postes de la salle',perm:'read'}];
equal(simulator.evaluate('assessment',a,b,[]).checks,[true,false,false]);
const copy=file(b,'desktop','Invitation.txt',simulator.invitation);
equal(simulator.evaluate('assessment',a,b,[]).checks,[true,false,false],'the file alone is insufficient without a network transfer');
b.did.transfers=[{from:'PC-21',destination:'Ce PC › Bureau',names:['Invitation.txt']}];
b.did.openedFiles=[{nodeId:copy,local:false,content:simulator.invitation}];
equal(simulator.evaluate('assessment',a,b,[]).checks,[true,true,false],'viewing a remote file does not open the local copy');
b.did.openedFiles[0].local=true;
const performed=simulator.evaluate('assessment',a,b,[]);
equal(performed.checks,[true,true,true]);equal(rubric.gradeSession4Lab({},performed.evidence).score,10);
a.shares[0].perm='write';
equal(simulator.evaluate('assessment',a,b,performed.checks).checks,[false,true,true],'the final share permission is checked at hand-in');
const heavy={...m.freshSession4Draft(),simulator:{...sim('sharing'),snapshot:{disk:'x'.repeat(50000)}}};equal(JSON.stringify(m.session4AnswerState(heavy)).length<12000,true,'teacher evidence excludes the full two-PC checkpoint');
const sourceEngine=fs.readFileSync(path.join(root,'public/session4/simulateur/engine.js'),'utf8');new Function(sourceEngine);assertions++;equal(sourceEngine.includes('holder={clip:null}'),true,'the clipboard belongs to one PC, so it cannot bypass a share');
const old=loader('43cd7bdd703767ce76bf40ce476ae3407e3cb5c4')('app/course-data.ts'),now=load('app/course-data.ts');equal(now.sessions.filter(s=>s.id!==4),old.sessions.filter(s=>s.id!==4),'other fourteen lessons are unchanged');equal(now.units,old.units,'unit structure unchanged');
// Verify the HTTP handler without writing to the production database.
let handler,unlocked=true;const rows=[];const participant={id:'45454545-4545-4545-8545-454545454545',student_one:'LOCAL TEST',student_two:null,class_name:'2/1',group_name:'1',is_pair:false};
const fetchDB=async(url,init={})=>{const p=url.split('/rest/v1/')[1];if(p.startsWith('course_2ac_session_access'))return Response.json([{is_unlocked:unlocked}]);if(p.startsWith('course_2ac_participants'))return Response.json([participant]);if(p.startsWith('course_2ac_submissions')){if(init.method==='POST'){const row=JSON.parse(init.body);if(!rows.some(r=>r.id===row.id))rows.push(row);return new Response(null,{status:201})}return Response.json(rows)}throw Error('Unexpected DB query: '+p)};
const source=fs.readFileSync(path.join(root,'supabase/functions/informatique-2ac-api/index.ts'),'utf8');const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
vm.runInNewContext(code,{exports:{},require:name=>name.includes('learning-service')?{createLearningService:()=>({publicAction:async()=>null,adminAction:async()=>null})}:name.includes('session4-applied-evaluation')?applied:name.includes('session4')?rubric:load('supabase/functions/informatique-2ac-api/session3-evaluation.ts'),Deno:{serve:f=>handler=f,env:{get:name=>name==='SUPABASE_URL'?'https://local.test':'TEST ONLY'}},fetch:fetchDB,TextEncoder,TextDecoder,Request,Response,crypto:crypto.webcrypto,btoa,atob,console});
const call=async body=>{const r=await handler(new Request('https://local.test/function',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://tabdellah.github.io'},body:JSON.stringify(body)}));return {status:r.status,data:await r.json()}};
(async()=>{const body={action:'submit',id:crypto.randomUUID(),participantId:participant.id,sessionId:4,activityType:'practical_evaluation',activityId:'session-4-reseau-evaluation-v1',answer:full,score:20,maxScore:20,isCorrect:true};
equal((await call(body)).status,201,'network assessment accepted');equal(rows[0].score,20);equal(rows[0].response.answers.length,10);await call(body);equal(rows.length,1,'retry idempotency');
const labBody={...body,id:crypto.randomUUID(),activityId:rubric.session4LabEvaluationId,answer:partialLab,score:4,isCorrect:false};
equal((await call(labBody)).status,201,'partial simulator assessment accepted');equal(rows.at(-1).response.practical.length,3);equal(rows.at(-1).score,4);
equal((await call({...labBody,id:crypto.randomUUID(),activityId:rubric.session4QuizEvaluationId})).status,400,'different assessment versions cannot be mixed');
const appliedBody={...body,id:crypto.randomUUID(),activityId:applied.session4AppliedEvaluationId,answer:appliedPartial,score:3,isCorrect:false};
equal((await call(appliedBody)).status,201,'the API stores a partially completed four-mission copy');equal(rows.at(-1).response.sections,[1,1,1,0]);
equal((await call({...appliedBody,id:crypto.randomUUID(),answer:appliedFull,score:20,isCorrect:true})).status,201,'the API accepts the complete new rubric');
equal((await call({...appliedBody,id:crypto.randomUUID(),score:20})).status,400,'the API rejects a forged grade in the new format');
equal((await call({...appliedBody,id:crypto.randomUUID(),answer:fullLab})).status,400,'the previous simulator rubric cannot be submitted as a new copy');
equal((await call({...body,id:crypto.randomUUID(),score:19})).status,400,'forged HTTP note rejected');unlocked=false;equal((await call({...body,id:crypto.randomUUID()})).status,423,'lesson-4 student lock remains enforced');unlocked=true;
equal((await call({...body,id:crypto.randomUUID(),activityType:'workshop',activityId:'session-4-workshop-TP',answer:{verification:'declaration-eleve',completed:true},score:null,maxScore:null,isCorrect:null})).status,201,'real TP can be stored without fabricated grading');equal(rows.at(-1).is_correct,null);
equal((await call({action:'teacher_course'})).status,401,'teacher privilege remains protected');
console.log(JSON.stringify({passed:true,assertions,answerBytes:Buffer.byteLength(JSON.stringify(full))}));})().catch(error=>{console.error(error);process.exitCode=1});
