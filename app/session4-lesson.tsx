"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,BookOpen,CheckCircle2,ClipboardCheck,CloudOff,FileCheck2,Film,Flag,FlaskConical,Folder,GraduationCap,LoaderCircle,LockKeyhole,Monitor,Network,Send,Target,Users,X} from "lucide-react";
import {Session3Text as Text,Session3TranslationScope} from "./session3-translation";
import {useTeacherCourse} from "../lib/teacher-course-context";
import {useDurableLessonState,LearningSaveBadge} from "../lib/learning-context";
import {readSnapshot} from "../lib/learning-storage";
import {publicAsset} from "../lib/public-assets";
import type {StudentProfile} from "../lib/supabase-api";
import {evaluationPassed} from "../lib/supabase-api";
import {WorkshopSummary,WorkshopSummaryLink,workshopSummaryTitle} from "./workshop-summary";
import {session4DraftPercent} from "../lib/workshop-progress";
import {TeacherExerciseNavigator} from "./teacher-exercise-navigator";
import {Session4ActivityPlayer,Session4Topology} from "./session4-activities";
import Session4Simulator from "./session4-simulator";
import {isSession4SimulatorState,type Session4SimulatorState} from "./session4-simulation-contract";
import {session4,session4Activities,s4t as t} from "./session4-data";
import {session4WorkshopDraft,initialSession4Workshop,validSession4Workshop,session4ActivityChecks,session4AnswerState,type Session4Draft,type Session4WorkshopState} from "./session4-model";
import {session4Questions,gradeSession4Lab,session4LabEvaluationId,validSession4Choices} from "../supabase/functions/informatique-2ac-api/session4-evaluation";
import {Session4Trace} from "./session4-trace";
import {Session4Assessment} from "./session4-assessment";
import "./session4.css";
import "./session4-expo.css";
import {NextLessonFooter} from "./next-lesson";

type Tab="mission"|"workshop"|"trace"|"quiz";
export type Session4Submission={sessionId:number;activityType:"workshop"|"practical_evaluation";activityId:string;answer:unknown;isCorrect?:boolean;score?:number;maxScore?:number};
type Props={student:StudentProfile;activeTab:Tab;onTab:(tab:Tab)=>void;onBack:()=>void;onChangeStudent:()=>void;onRecordSubmission:(submission:Session4Submission)=>void;unlockedSessions:Set<number>;onOpenSession:(id:number)=>void};
const tabs=[{id:"mission",icon:Flag,label:t("Mission","المهمة")},{id:"workshop",icon:FlaskConical,label:t("Atelier","الورشة")},{id:"trace",icon:BookOpen,label:t("Trace écrite","خلاصة الدرس")},{id:"quiz",icon:FileCheck2,label:t("Évaluation","التقويم")}] as const;
const phases=[{minutes:10,title:t("Comprendre le défi","فهم التحدي")},{minutes:85,title:t("Pratiquer dans l’atelier","التطبيق في الورشة")},{minutes:10,title:t("Retenir l’essentiel","تثبيت الأساسيات")},{minutes:15,title:t("Évaluer mes acquis","تقويم مكتسباتي")}];
const videoCount=session4Activities.filter(activity=>activity.kind==="video").length;

export default function Session4Lesson({student,activeTab,onTab,onBack,onChangeStudent,onRecordSubmission,unlockedSessions,onOpenSession}:Props){
 const teacher=useTeacherCourse();const [visited,setVisited]=useState<Tab[]>([activeTab]);
 const [evalPassed,setEvalPassed]=useState<boolean>(()=>evaluationPassed(student.id,4));
 function handleRecord(s:Session4Submission){onRecordSubmission(s);if(s.activityType==="practical_evaluation"&&typeof s.score==="number"&&typeof s.maxScore==="number"&&s.maxScore>0&&s.score*2>=s.maxScore)setEvalPassed(true)}
 const stageOrder:Tab[]=["mission","workshop","trace","quiz"];
 const maxVisitedIdx=Math.max(...visited.map(t=>stageOrder.indexOf(t)));
 const tabLocked=(t:Tab)=>!teacher&&stageOrder.indexOf(t)>maxVisitedIdx+1;
 const workshopPanel=useRef<HTMLElement>(null);
 useEffect(()=>{if(activeTab!=="workshop")workshopPanel.current?.querySelector("video")?.pause();},[activeTab]);
 function open(tab:Tab){if(tabLocked(tab))return;setVisited(v=>v.includes(tab)?v:[...v,tab]);onTab(tab);requestAnimationFrame(()=>document.querySelector('.main-scroll')?.scrollTo({top:0,behavior:"auto"}))}
 return <Session3TranslationScope enabled scopeKey={`session4-${activeTab}`}><div className="session4-lesson session3-theme">
  <header className="s4-course-header"><button type="button" className="s4-back" onClick={onBack}><ArrowLeft size={17}/><span>Programme</span></button><div className="s4-brand"><Network size={24}/><div><strong>LAB·2AC</strong><small>SÉANCE 04 · 2 HEURES</small></div></div>{teacher?<span className="s4-profile"><GraduationCap size={19}/> Professeur · démonstration</span>:<button type="button" className="s4-profile" onClick={onChangeStudent}><Users size={19}/><span>{student.studentOne}{student.isPair&&student.studentTwo?` + ${student.studentTwo}`:""}<small>{student.className}</small></span></button>}</header>
  {!teacher&&<LearningSaveBadge/>}
  <nav className="s4-tabs" aria-label="Contenu de la séance 4">{tabs.map(({id,icon:Icon,label})=><button type="button" key={id} aria-current={activeTab===id?"page":undefined} className={`${activeTab===id?"active":""} ${tabLocked(id)?"locked":""}`} disabled={tabLocked(id)} onClick={()=>open(id)}><Icon size={19}/><span>{label.fr}<small lang="ar" dir="rtl">{label.ar}</small></span>{tabLocked(id)&&<LockKeyhole size={13}/>}</button>)}</nav>
  {visited.includes("mission")&&<section hidden={activeTab!=="mission"} data-s4-panel="mission"><Mission onStart={()=>open("workshop")}/></section>}
  {visited.includes("workshop")&&<section ref={workshopPanel} hidden={activeTab!=="workshop"} data-s4-panel="workshop"><Workshop participantId={student.id} onRecord={handleRecord} onTrace={()=>open("trace")} onEvaluate={()=>open(visited.includes("trace")?"quiz":"trace")}/></section>}
  {visited.includes("trace")&&<section hidden={activeTab!=="trace"} data-s4-panel="trace"><Trace onEvaluate={()=>open("quiz")}/></section>}
  {visited.includes("quiz")&&<section hidden={activeTab!=="quiz"} data-s4-panel="quiz"><Session4Assessment participantId={student.id} onRecord={handleRecord} legacy={<Assessment participantId={student.id} onRecord={handleRecord}/>}/></section>}
  {teacher||evalPassed?<>{!teacher&&<div className="pass-celebration" role="status"><span className="pass-celebration-star" aria-hidden="true">🎉</span><div><strong lang="ar" dir="rtl">أحسنت! أنهيت هذه الحصة بنجاح</strong><small>Bravo, séance réussie ! La suivante t'attend.</small></div><span className="pass-celebration-star" aria-hidden="true">⭐</span></div>}<NextLessonFooter currentId={4} lang="fr" unlockedSessions={unlockedSessions} onOpenSession={onOpenSession} onBack={onBack}/></>:activeTab==="quiz"?<div className="next-lesson locked-hint"><span className="next-lesson-icon"><LockKeyhole size={26}/></span><div className="next-lesson-copy"><strong>La séance suivante se débloque ici</strong><small>Réussis l'évaluation (la moitié des points ou plus) et le bouton apparaîtra. · انجح في التقويم (النصف أو أكثر) وسيظهر الزر.</small></div></div>:null}
  <footer className="s4-credit">LAB·2AC · Prof. Mohamed ELRHAOUAT · Collège Al Wahda</footer>
 </div></Session3TranslationScope>;
}

function Mission({onStart}:{onStart:()=>void}){
 return <div className="s4-panel-enter"><section className="s4-mission-hero"><div><span className="s4-eyebrow"><Network size={16}/> MISSION DU CLUB · 120 MINUTES</span><h1><Text value={session4.title}/></h1><p className="s4-mission-lead"><Text value={session4.mission}/></p><div className="s4-mission-tags"><span><Users size={16}/> 2 élèves par PC</span><span><Monitor size={16}/> {session4Activities.length} exercices</span><span><Film size={16}/> {videoCount} vidéos U2</span><span><CloudOff size={16}/> LAN sans Internet</span></div></div><div className="s4-mission-visual"><div className="s4-mission-devices"><img src={publicAsset("session4/images/ordinateur-bureau.webp")} alt="Un poste du réseau local"/><img src={publicAsset("session4/images/commutateur.webp")} alt="Commutateur du réseau local"/><img src={publicAsset("session4/images/portable-windows.webp")} alt="Un autre poste du réseau local"/></div><span><Text value={t("Une salle. Plusieurs postes. Un même réseau.","قاعة واحدة وحواسيب متعددة وشبكة مشتركة.")}/></span></div></section>
  <section className="s4-situation"><span className="s4-eyebrow">LE DÉFI À RÉSOUDRE</span><h2><Text value={t("Trois zones à raccorder avant l’ouverture","ثلاث مناطق يجب ربطها قبل الافتتاح")}/></h2><p><Text value={session4.situation}/></p><div><Target size={24}/><strong><Text value={t("Le club veut vérifier la connexion des trois zones.","يريد النادي التحقق من اتصال المناطق الثلاث.")}/></strong></div></section>
  <div className="expo-zones">{[
   {photo:"commutateur",place:t("Bureau","المكتب"),label:t("Filaire · échanger entre deux PC","سلكي · التبادل بين حاسوبين")},
   {photo:"portable-windows",place:t("Bibliothèque","المكتبة"),label:t("Sans fil · connecter les portables","لاسلكي · ربط الحواسيب المحمولة")},
   {photo:"smart-tv",place:t("Hall","الردهة"),label:t("Mixte · relier les deux parties","مختلط · ربط الجزأين")},
  ].map(({photo,place,label},i)=><article key={photo}><span>ZONE 0{i+1}</span>
   <img src={publicAsset(`session4/images/${photo}.webp`)} alt=""/><h3><Text value={place}/></h3><p><Text value={label}/></p>
  </article>)}</div>
  <div className="s4-plan">{phases.map((p,i)=><article key={p.minutes}><span>0{i+1}</span><strong>{p.minutes} min</strong><Text value={p.title}/></article>)}</div>
  <div className="s4-mission-columns"><section className="s4-card"><span className="s4-eyebrow">JE VAIS APPRENDRE À…</span><h2><Text value={t("Comprendre, relier, échanger","الفهم والربط والتبادل")}/></h2><ul>{session4.objectives.map(v=><li key={v.fr}><CheckCircle2 size={18}/><Text value={v}/></li>)}</ul></section><section className="s4-card s4-roles"><span className="s4-eyebrow">NOTRE ORGANISATION</span><h2><Text value={t("Deux rôles qui tournent","دوران نتبادلهما")}/></h2><article><span>P</span><div><strong><Text value={t("Pilote","المتحكم")}/></strong><p><Text value={t("Manipule la souris et le clavier ; lit les consignes avant d’agir.","يستعمل الفأرة ولوحة المفاتيح ويقرأ التعليمات قبل الإنجاز.")}/></p></div></article><article><span>C</span><div><strong><Text value={t("Copilote","المساعد")}/></strong><p><Text value={t("Observe, vérifie l’adresse et le destinataire, puis explique le résultat.","يلاحظ ويتحقق من العنوان والمستلم ثم يشرح النتيجة.")}/></p></div></article><p className="s4-help"><Text value={t("Inversez les rôles après chaque activité. Le copilote lit le résultat avant la validation.","تبادلا الأدوار بعد كل نشاط. يقرأ المساعد النتيجة قبل التحقق.")}/></p><details><summary><Text value={t("Préparation du laboratoire · enseignant","إعداد المختبر · الأستاذ")}/></summary><p><Text value={t("Prévoir un navigateur par binôme. Les branchements et les tests de connexion se font dans les maquettes. Les vidéos présentent le partage des dossiers.","جهز متصفحًا لكل ثنائي. تنجز التوصيلات واختبارات الاتصال داخل النماذج. وتعرض الفيديوهات مشاركة المجلدات.")}/></p></details></section></div>
  <button type="button" className="s4-primary s4-start" onClick={onStart}><Text value={t("Ouvrir les caisses du club","فتح صناديق معدات النادي")}/><ArrowRight size={19}/></button>
 </div>;
}

const recap = [
 {icon:Network,title:t("Relier les postes","ربط الحواسيب"),text:t("Le commutateur relie les appareils par câble. Le point d’accès accueille les appareils Wi-Fi. Un câble entre les deux relie les parties du réseau mixte.","يربط المبدل الأجهزة بالكابل. وتربط نقطة الولوج أجهزة Wi-Fi. يوصل كابل بين الجهازين جزأي الشبكة المختلطة.")},
 {icon:Network,title:t("Lire un plan","قراءة المخطط"),text:t("Étoile : un centre. Bus : une ligne commune. Anneau : une boucle fermée.","النجمية: مركز. الخطية: خط مشترك. الحلقية: حلقة مغلقة.")},
 {icon:Monitor,title:t("Identifier un poste","تحديد هوية الحاسوب"),text:t("ipconfig affiche l’adresse IPv4. hostname affiche le nom du poste.","يعرض ipconfig عنوان IPv4، ويعرض hostname اسم الحاسوب.")},
 {icon:Target,title:t("Tester la liaison","اختبار الاتصال"),text:t("ping permet de tester si un poste répond. Vérifie le câble si le test échoue, puis refais le même test.","يختبر ping ما إذا كان الحاسوب يستجيب. تحقق من الكابل عند الفشل ثم كرر الاختبار نفسه.")},
 {icon:Folder,title:t("Partager avec le bon droit","المشاركة بالصلاحية المناسبة"),text:t("Lecture permet d’ouvrir et de copier. Lecture et écriture permet aussi de déposer un fichier dans le dossier partagé.","تتيح القراءة فتح الملف ونسخه. وتتيح القراءة والكتابة أيضا إيداع ملف داخل المجلد المشترك.")},
 {icon:Send,title:t("Confirmer un échange","تأكيد التبادل"),text:t("Vérifie le destinataire, joins le fichier et ouvre la pièce jointe reçue avant de répondre « Reçu ».","تحقق من المستلم وأرفق الملف وافتح المرفق المتوصل به قبل الرد «تم التوصل».")},
];

function NetworkRecap(){
 return <section className="s4-network-recap">
  <h3><Text value={t("Les idées à retenir","الأفكار الأساسية")}/></h3>
  <div className="s4-recap-grid">{recap.map(({icon:Icon,title,text})=><article key={title.fr}>
   <Icon size={23} aria-hidden="true"/><h4><Text value={title}/></h4><p><Text value={text}/></p>
  </article>)}</div>
  <p className="s4-recap-pair"><Users size={19} aria-hidden="true"/><Text value={t("En binôme, expliquez le chemin du fichier entre les deux postes et dites quel droit suffit pour le lire.","في الثنائي، اشرحا مسار الملف بين الحاسوبين وحددا الصلاحية الكافية لقراءته.")}/></p>
 </section>;
}

function Workshop({participantId,onRecord,onTrace,onEvaluate}:{
 participantId:string; onRecord:Props["onRecordSubmission"]; onTrace:()=>void; onEvaluate:()=>void;
}){
 const teacher=useTeacherCourse();
 const initial=useMemo(()=>initialSession4Workshop(readSnapshot(participantId,4,"workshop")?.data),[participantId]);
 const persistent=useDurableLessonState<Session4WorkshopState>({participantId,sessionId:4,kind:"workshop",initial,validate:validSession4Workshop});
 const {value:work,setValue:setWork}=persistent;
 const anchor=useRef<HTMLDivElement>(null);
 const savedIndex=session4Activities.findIndex(item=>item.id===work.activityId||item.previousId===work.activityId&&work.activityId!==undefined);
 const firstMissing=session4Activities.findIndex(item=>!work.completedIds.includes(item.id));
 const index=savedIndex>=0?savedIndex:firstMissing>=0?firstMissing:session4Activities.length-1;
 const activity=session4Activities[index];
 const summary=work.summary;
 const draft=session4WorkshopDraft(activity,work.drafts);
 const criteria=session4ActivityChecks(activity,draft);
 useEffect(()=>{anchor.current?.scrollIntoView({block:"start",behavior:"auto"});},[index,summary]);

 function go(next:number){
  const showSummary=next===session4Activities.length;
  const position=showSummary?index:Math.max(0,Math.min(session4Activities.length-1,next));
  setWork(current=>({...current,activityIndex:position,activityId:session4Activities[position].id,summary:showSummary}));
 }
 function change(patch:Partial<Session4Draft>){
  setWork(current=>{
   const previous=session4WorkshopDraft(activity,current.drafts);
   const keepResult=activity.kind==="video"&&patch.selections===undefined&&patch.checks===undefined;
   return {...current,activityIndex:index,activityId:activity.id,summary:false,
    drafts:{...current.drafts,[activity.id]:{...previous,...patch,result:keepResult?previous.result:null,savedAt:Date.now()}}};
  });
 }
 function check(){
  const correct=criteria.every(Boolean);
  const videoAnswers=activity.kind==="video"?activity.video.questions.map((question,index)=>({
   question:question.prompt,
   selectedChoice:question.choices.find(choice=>choice.id===draft.selections[question.id])?.label??t("Sans réponse","دون جواب"),
   correctChoice:question.choices.find(choice=>choice.id===question.answer)?.label,
   correct:criteria[index],earnedPoints:criteria[index]?1:0,maxPoints:1,
  })):null;
  setWork(current=>({...current,activityIndex:index,activityId:activity.id,summary:false,
   completedIds:correct?[...new Set([...current.completedIds,activity.id])]:current.completedIds,
   drafts:{...current.drafts,[activity.id]:{...draft,result:correct,savedAt:Date.now()}}}));
  onRecord({
   sessionId:4,activityType:"workshop",activityId:activity.id,
   answer:{question:activity.prompt,activityTitle:activity.title,verification:videoAnswers?"observation-video":"simulation-corrigee",state:session4AnswerState(draft),completed:correct,...(videoAnswers?{answers:videoAnswers}:{})},
   isCorrect:correct,score:correct?100:session4DraftPercent(activity,draft)??0,maxScore:100,
  });
 }
 const achieved=criteria.filter(Boolean).length;
 const feedback=draft.result
  ? t("Exercice réussi. Compare ton résultat avec ton binôme.","نجحت في التمرين. قارن نتيجتك مع زميلك.")
  : t(`${achieved} / ${criteria.length} critères validés. Vérifie tes réponses.`,`تحقق ${achieved} من أصل ${criteria.length} معايير. تحقق من إجاباتك.`);

 if(!persistent.ready)return <div className="s4-loading"><LoaderCircle className="spin"/><Text value={t("Recherche du travail sauvegardé…","البحث عن العمل المحفوظ…")}/></div>;
 return <div className="s4-workshop s4-panel-enter" ref={anchor}>
  <TeacherExerciseNavigator index={summary?session4Activities.length:index} titles={[...session4Activities.map(a=>a.title.fr),workshopSummaryTitle.fr]} onGo={go}/>
  {summary?<WorkshopSummary sessionId={4} participantId={participantId} state={work}
    onBack={()=>go(index)} onResume={go} onTrace={onTrace} onEvaluate={onEvaluate}>
    <NetworkRecap />
  </WorkshopSummary>:<>
   <div className="workshop-summary-entry"><WorkshopSummaryLink onClick={()=>go(session4Activities.length)}/></div>
   <div className="s4-activity-topline"><span>EXERCICE {String(index+1).padStart(2,"0")} / {session4Activities.length}</span>
    <strong>{activity.minutes} min</strong><span><Text value={activity.zone}/></span>
   </div>
   <article className="s4-activity expo-activity">
    <header><h2><Text value={activity.title}/></h2>
     <div className="s4-instruction"><span>CONSIGNE · التعليمة</span><p><Text value={activity.prompt}/></p>
      {activity.tasks.length>0&&<ol>{activity.tasks.map(task=><li key={task.fr}><Text value={task}/></li>)}</ol>}
     </div>
    </header>
    <Session4ActivityPlayer key={activity.id} activity={activity} draft={draft} onChange={change}/>
    <div className="s4-check-area">
     <button type="button" className="s4-primary" onClick={check}><ClipboardCheck size={19}/><Text value={t("Vérifier mon travail","التحقق من عملي")}/></button>
     {draft.result!==null&&<p role="status" className={draft.result?"s4-feedback success":"s4-feedback retry"}><Text value={feedback}/></p>}
    </div>
   </article>
   <nav className="s4-exercise-nav" aria-label="Navigation dans l’atelier">
    <button type="button" disabled={index===0} onClick={()=>go(index-1)}><ArrowLeft size={18}/><Text value={t("Précédent","السابق")}/></button>
    <span>{index+1} / {session4Activities.length}{teacher&&<small>Professeur · navigation libre</small>}</span>
    <button type="button" className="s4-primary" disabled={!teacher&&!work.completedIds.includes(activity.id)} onClick={()=>go(index+1)}>
     <Text value={index===session4Activities.length-1?workshopSummaryTitle:t("Exercice suivant","التمرين التالي")}/><ArrowRight size={18}/>
    </button>
   </nav>
  </>}
 </div>;
}

function Trace({onEvaluate}:{onEvaluate:()=>void}){
 return <Session4Trace onEvaluate={onEvaluate}/>;
}

type QuizState={index:number;choices:Record<string,number>;submitted:boolean};
type AssessmentState=QuizState&{version:2;simulator:Session4SimulatorState|null};
const practicalIndex=session4Questions.length;
const initialAssessment:AssessmentState={version:2,index:0,choices:{},submitted:false,simulator:null};
const assessmentSections=[
 t("Le réseau du club","شبكة النادي"),
 t("Le poste et son adresse","الحاسوب وعنوانه"),
 t("Le fichier partagé","الملف المشترك"),
 t("La messagerie locale","المراسلة المحلية"),
];
function validAssessmentState(value:unknown):value is AssessmentState{
 const state=value as AssessmentState|null;
 return !!state&&state.version===2&&Number.isInteger(state.index)&&state.index>=0&&state.index<=practicalIndex
  &&validSession4Choices(state.choices)&&typeof state.submitted==="boolean"
  &&(state.simulator===null||isSession4SimulatorState(state.simulator,"assessment"));
}

function Assessment({participantId,onRecord}:{participantId:string;onRecord:Props["onRecordSubmission"]}){
 const teacher=useTeacherCourse();
 const [confirm,setConfirm]=useState(false);
 const lock=useRef(false),panel=useRef<HTMLDivElement>(null);
 const {value:state,setValue:setState,ready,restored}=useDurableLessonState({
  participantId,sessionId:4,kind:"assessment",initial:initialAssessment,validate:validAssessmentState,
 });
 const practical=state.index===practicalIndex;
 const question=session4Questions[state.index];
 const result=gradeSession4Lab(state.choices,state.simulator?.evidence);
 const answered=Object.keys(state.choices).length;
 const practicalScore=result.sections[4];
 const orders=useMemo(()=>session4Questions.map(q=>q.choices.map((_,i)=>i).sort((a,b)=>hash(`${participantId}-${q.id}-${a}`)-hash(`${participantId}-${q.id}-${b}`))),[participantId]);
 useEffect(()=>{lock.current=state.submitted},[state.submitted]);
 useEffect(()=>{
  if(!ready||restored)return;
  const savedQuiz=readSnapshot(participantId,4,"quiz")?.data as {version?:number;previousQuiz?:unknown}|undefined;
  const previous=(savedQuiz?.version===3?savedQuiz.previousQuiz:savedQuiz) as (QuizState&{version:1})|undefined;
  if(previous?.version!==1||previous.submitted!==false||!validSession4Choices(previous.choices)||!Object.keys(previous.choices).length)return;
  setState(current=>current.submitted||current.simulator||Object.keys(current.choices).length?current:{...current,choices:previous.choices});
 },[participantId,ready,restored,setState]);

 function goTo(index:number){
  setState(current=>({...current,index}));
  requestAnimationFrame(()=>panel.current?.scrollIntoView({block:"start",behavior:"auto"}));
 }
 function saveSimulator(simulator:Session4SimulatorState){
  setState(current=>current.submitted||JSON.stringify(current.simulator)===JSON.stringify(simulator)?current:{...current,simulator});
 }
 function submit(){
  if(lock.current)return;
  lock.current=true;
  onRecord({sessionId:4,activityType:"practical_evaluation",activityId:session4LabEvaluationId,answer:result,score:result.score,maxScore:20,isCorrect:result.score===20});
  setState(current=>({...current,submitted:true}));
  setConfirm(false);
  requestAnimationFrame(()=>panel.current?.scrollIntoView({block:"start",behavior:"auto"}));
 }

 if(!ready)return <p className="s4-loading"><LoaderCircle className="spin"/> Chargement de l’évaluation sauvegardée…</p>;
 return <div className="s4-assessment s4-panel-enter">
  <header className="s4-assessment-intro">
   <span className="s4-eyebrow">ÉVALUATION · 15 MINUTES · /20</span>
   <h1><Text value={t("Le club ouvre ses portes","يفتح النادي أبوابه")}/></h1>
   <p><Text value={t("Réponds aux dix questions, puis fais parvenir l’invitation du club au PC-22 dans le simulateur. Chaque partie vaut 10 points.","أجب عن الأسئلة العشرة، ثم أوصل دعوة النادي إلى PC-22 في المحاكي. لكل جزء 10 نقاط.")}/></p>
  </header>
  <div className="s4-assessment-panel" ref={panel}>
   {state.submitted?<section className="s4-result">
    <div><CheckCircle2 size={36}/><h2><Text value={teacher?t("Correction de démonstration","تصحيح توضيحي"):t("Ton bilan est enregistré","حفظ تقويمك")}/></h2><strong>{result.score} / 20</strong></div>
    <div className="s4-result-sections">
     <article><Text value={t("Questions","الأسئلة")}/><b>{result.score-practicalScore} / 10</b></article>
     <article><Text value={t("Simulateur","المحاكي")}/><b>{practicalScore} / 10</b></article>
    </div>
    <details open>
     <summary><Text value={t("Détail de la manipulation","تفاصيل التطبيق")}/></summary>
     {result.practical.map(item=><article key={item.criterion.fr} className={item.correct?"correct":"review"}><h3><Text value={item.criterion}/></h3><b>{item.earnedPoints}/{item.maxPoints}</b></article>)}
    </details>
    <details>
     <summary><Text value={t("Voir le corrigé des questions","عرض تصحيح الأسئلة")}/></summary>
     {result.answers.map((answer,i)=><article className={answer.correct?"correct":"review"} key={i}><h3>{i+1}. <Text value={answer.question}/></h3><p><Text value={t("Ma réponse : ","جوابي: ")}/><Text value={answer.selectedChoice}/></p>{!answer.correct&&<p><Text value={t("Réponse attendue : ","الجواب المنتظر: ")}/><Text value={answer.correctChoice}/></p>}<b>{answer.earnedPoints}/{answer.maxPoints}</b></article>)}
    </details>
   </section>:<>
    <div className="s4-assessment-parts" role="group" aria-label="Parties de l’évaluation">
     <button type="button" aria-pressed={!practical} onClick={()=>goTo(Math.max(0,session4Questions.findIndex(q=>state.choices[q.id]===undefined)))}>
      <BookOpen size={18}/><Text value={t("1 · Questions","1 · الأسئلة")}/><small>10 pts</small>
     </button>
     <button type="button" aria-pressed={practical} onClick={()=>goTo(practicalIndex)}>
      <Monitor size={18}/><Text value={t("2 · Simulateur","2 · المحاكي")}/><small>10 pts</small>
     </button>
    </div>
    <TeacherExerciseNavigator index={state.index} titles={[...session4Questions.map(q=>q.question.fr),"Manipulation dans le simulateur"]} onGo={goTo} label="Aller à la question"/>
    {practical?<Session4Simulator mode="assessment" state={state.simulator} onChange={saveSimulator}/>:<>
     <div className="s4-assessment-layout">
      <aside className="s4-assessment-context">
       <span>SITUATION {question.section+1} / 4</span>
       <h2><Text value={assessmentSections[question.section]}/></h2>
       {question.section===0?<><Session4Topology kind="star"/><img src={publicAsset("session4/images/commutateur.webp")} alt="Commutateur du réseau du club"/></>
        :question.section===1?<pre>PC-21{"\n"}IPv4 : 192.168.10.21{"\n"}Masque : 255.255.255.0{"\n"}Passerelle : 192.168.10.1</pre>
        :question.section===2?<div className="s4-folder-preview"><Folder size={65}/><strong>PC-21 / Club_reseau</strong><FileCheck2 size={30}/><span>Bonjour.txt</span></div>
        :<div className="s4-assessment-chat"><Users size={35}/><strong>PC-21 → PC-22</strong><span>Message + Bonjour.txt</span><p>« Reçu : Bonjour le club ! »</p></div>}
      </aside>
      <article className="s4-assessment-question">
       <span>QUESTION {String(state.index+1).padStart(2,"0")} / {practicalIndex} · 1 POINT</span>
       <h2><Text value={question.question}/></h2>
       <div className="s4-assessment-choices">{orders[state.index].map((index,display)=>
        <button type="button" key={index} className={state.choices[question.id]===index?"selected":""} aria-pressed={state.choices[question.id]===index} onClick={()=>setState(current=>({...current,choices:{...current.choices,[question.id]:index}}))}>
         <b>{String.fromCharCode(65+display)}</b><Text value={question.choices[index]}/>
        </button>
       )}</div>
      </article>
     </div>
     <nav className="s4-exercise-nav" aria-label="Navigation des questions">
      <button type="button" disabled={state.index===0} onClick={()=>goTo(state.index-1)}><ArrowLeft size={18}/><Text value={t("Précédente","السابق")}/></button>
      <span>{answered} / {practicalIndex} réponses</span>
      <button type="button" className="s4-primary" onClick={()=>goTo(state.index+1)}>
       <Text value={state.index===practicalIndex-1?t("Passer au simulateur","الانتقال إلى المحاكي"):t("Suivante","التالي")}/><ArrowRight size={18}/>
      </button>
     </nav>
    </>}
    <div className="s4-assessment-submit">
     <p><Text value={t("Tu peux remettre le travail déjà fait, même si tu n’as pas tout terminé.","يمكنك تسليم العمل المنجز حتى لو لم تكمل جميع المهام.")}/></p>
     <button type="button" className="s4-primary" disabled={!teacher&&!answered&&!state.simulator} onClick={()=>setConfirm(true)}><Send size={18}/><Text value={t("Rendre mon évaluation","تسليم تقويمي")}/></button>
    </div>
   </>}
  </div>
  {confirm&&<div className="s4-modal-backdrop">
   <section className="s4-modal" role="dialog" aria-modal="true" aria-labelledby="s4-submit-title">
    <button type="button" className="s4-modal-close" aria-label="Fermer" onClick={()=>setConfirm(false)}><X size={20}/></button>
    <h2 id="s4-submit-title"><Text value={t("Remettre ton évaluation ?","هل تسلم تقويمك؟")}/></h2>
    <p><Text value={t(`Tu as répondu à ${answered} question(s) sur ${practicalIndex}. La note tiendra aussi compte des gestes réalisés dans le simulateur.`,`أجبت عن ${answered} من أصل ${practicalIndex} أسئلة. ستحتسب النقطة أيضًا العمليات المنجزة في المحاكي.`)}/></p>
    <div className="s4-inline-actions">
     <button type="button" onClick={()=>setConfirm(false)}><Text value={t("Je relis","أراجع")}/></button>
     <button type="button" className="s4-primary" onClick={submit}><Text value={t("Confirmer la remise","تأكيد التسليم")}/></button>
    </div>
   </section>
  </div>}
 </div>;
}
function hash(value:string){let h=2166136261;for(const c of value){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
