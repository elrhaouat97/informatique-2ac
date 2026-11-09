"use client";

import {useMemo,useRef,useState,type ReactNode} from "react";
import {ArrowLeft,ArrowRight,BookOpen,CheckCircle2,ClipboardCheck,History,LoaderCircle,Monitor,Network,Send,Terminal,X} from "lucide-react";
import {useDurableLessonState} from "../lib/learning-context";
import {readSnapshot} from "../lib/learning-storage";
import {useTeacherCourse} from "../lib/teacher-course-context";
import {publicAsset} from "../lib/public-assets";
import {Session3Text as Text} from "./session3-translation";
import {s4t as t} from "./session4-data";
import {Session4Topology} from "./session4-activities";
import {Session4BuildNetwork} from "./session4-build-network";
import {Session4CommandLab} from "./session4-terminal";
import Session4Simulator from "./session4-simulator";
import type {Session4Draft} from "./session4-model";
import type {Session4Submission} from "./session4-lesson";
import {initialSession4Applied,isPreviousSession4Quiz,validSession4AppliedState} from "./session4-assessment-state";
import {gradeSession4Applied,session4AppliedEvaluationId,session4AppliedQuestions,session4AppliedSections} from "../supabase/functions/informatique-2ac-api/session4-applied-evaluation";
import {gradeSession4} from "../supabase/functions/informatique-2ac-api/session4-evaluation";

const icons=[BookOpen,Network,Terminal,Monitor];
const hash=(text:string)=>{let value=2166136261;for(const c of text){value^=c.charCodeAt(0);value=Math.imul(value,16777619);}return value>>>0;};

export function Session4Assessment({participantId,onRecord,legacy}:{participantId:string;onRecord:(value:Session4Submission)=>void;legacy:ReactNode}){
 const teacher=useTeacherCourse(),panel=useRef<HTMLElement>(null),lock=useRef(false);
 const initial=useMemo(()=>initialSession4Applied(readSnapshot(participantId,4,"quiz")?.data),[participantId]);
 const {value:state,setValue:setState,ready}=useDurableLessonState({participantId,sessionId:4,kind:"quiz",initial,validate:validSession4AppliedState});
 const [confirm,setConfirm]=useState(false),[showLegacy,setShowLegacy]=useState(false);
 const result=gradeSession4Applied(state.answers,state.network,state.terminal,state.simulator?.evidence);
 const answered=Object.keys(state.answers).length;
 const previousValue=readSnapshot(participantId,4,"quiz")?.data;
 const previousQuiz=state.previousQuiz??(isPreviousSession4Quiz(previousValue)?previousValue:undefined);
 const previousAssessment=readSnapshot(participantId,4,"assessment")?.data as {version?:number}|undefined;
 const hasLegacy=previousAssessment?.version===2||!!previousQuiz;
 const started=[answered>0,Object.keys(state.network.selections).length>0,state.terminal.commands.length>0||!!state.terminal.command,!!state.simulator];
 const orders=useMemo(()=>session4AppliedQuestions.map(q=>q.choices.map((_,index)=>index).sort((a,b)=>hash(`${participantId}-${q.id}-${a}`)-hash(`${participantId}-${q.id}-${b}`))),[participantId]);

 function update(next:(value:typeof state)=>typeof state){
  setState(current=>next(previousQuiz&&!current.previousQuiz?{...current,previousQuiz}:current));
 }
 function go(part:number){
  update(current=>({...current,part}));
  requestAnimationFrame(()=>panel.current?.scrollIntoView({block:"start",behavior:"auto"}));
 }
 function changeDraft(key:"network"|"terminal",patch:Partial<Session4Draft>){
  update(current=>({...current,[key]:{...current[key],...patch,result:null,savedAt:Date.now()}}));
 }
 function submit(){
  if(lock.current||state.submitted)return;
  lock.current=true;
  onRecord({sessionId:4,activityType:"practical_evaluation",activityId:session4AppliedEvaluationId,answer:result,score:result.score,maxScore:20,isCorrect:result.score===20});
  update(current=>({...current,submitted:true}));setConfirm(false);
  requestAnimationFrame(()=>panel.current?.scrollIntoView({block:"start",behavior:"auto"}));
 }

 if(!ready)return <p className="s4-loading"><LoaderCircle className="spin"/><Text value={t("Chargement de ta copie sauvegardée…","تحميل عملك المحفوظ…")}/></p>;
 if(showLegacy)return <div className="s4-applied-legacy">
  <button type="button" className="s4-back" onClick={()=>setShowLegacy(false)}><ArrowLeft size={17}/><Text value={t("Revenir à l’évaluation actuelle","العودة إلى التقويم الحالي")}/></button>
  {previousAssessment?.version===2||!previousQuiz?.submitted?legacy:<section className="s4-result"><h2><Text value={t("Ancienne copie conservée","النسخة السابقة محفوظة")}/></h2><strong>{gradeSession4(previousQuiz.choices).score} / 20</strong>{gradeSession4(previousQuiz.choices).answers.map((item,index)=><article key={index}><h3><Text value={item.question}/></h3><p><Text value={item.selectedChoice}/></p></article>)}</section>}
 </div>;

 return <div className="s4-applied-assessment s4-panel-enter">
  <header className="s4-applied-intro">
   <span className="s4-eyebrow">ÉVALUATION · SÉANCE 04 · 15 MINUTES · /20</span>
   <h1><Text value={t("À toi de connecter le club !","دورك لربط أجهزة النادي!")}/></h1>
   <p><Text value={t("Quatre missions indépendantes : reconnais le matériel, crée le réseau, identifie un PC et partage un fichier. Tu peux passer librement d’une mission à l’autre.","أربع مهام مستقلة: تعرّف على المعدات وأنشئ الشبكة وحدد هوية حاسوب وشارك ملفًا. يمكنك التنقل بحرية بين المهام.")}/></p>
   <div><span><ClipboardCheck size={17}/><Text value={t("Le travail partiel compte","يحتسب العمل الجزئي")}/></span><span><CheckCircle2 size={17}/><Text value={t("Sauvegarde automatique","حفظ تلقائي")}/></span></div>
  </header>
  {hasLegacy&&<div className="s4-applied-previous"><History size={17}/><Text value={t("Ton ancienne évaluation est conservée.","تقويمك السابق محفوظ.")}/><button type="button" onClick={()=>setShowLegacy(true)}><Text value={t("Ouvrir l’ancienne version","فتح النسخة السابقة")}/></button></div>}

  {state.submitted?<section className="s4-applied-results" ref={panel}>
   <header><CheckCircle2 size={34}/><h2><Text value={teacher?t("Correction de démonstration","تصحيح توضيحي"):t("Ta copie est enregistrée","تم حفظ نسختك")}/></h2><strong>{result.score} <small>/20</small></strong></header>
   <div className="s4-applied-score-grid">{session4AppliedSections.map((section,index)=><article key={section.title.fr}><Text value={section.title}/><strong>{result.sections[index]} / {section.maxPoints}</strong></article>)}</div>
   {[1,2,3].map(section=><details open key={section}><summary><Text value={session4AppliedSections[section].title}/></summary>{result.practical.filter(item=>item.section===section).map(item=><div key={item.criterion.fr} className="s4-applied-criterion" data-correct={item.correct}><Text value={item.criterion}/><b>{item.earnedPoints}/{item.maxPoints}</b></div>)}</details>)}
   <details><summary><Text value={t("Correction des équipements et des topologies","تصحيح الأجهزة وبنيات الشبكة")}/></summary>{result.answers.map(item=><article key={item.id} className="s4-applied-answer" data-correct={item.correct}><h3><Text value={item.question}/></h3><p><Text value={t("Ta réponse : ","جوابك: ")}/><Text value={item.selectedChoice}/></p>{!item.correct&&<p><Text value={t("Réponse attendue : ","الجواب المنتظر: ")}/><Text value={item.correctChoice}/></p>}<b>{item.earnedPoints}/1</b></article>)}</details>
   {teacher&&<button type="button" className="s4-primary" onClick={()=>{lock.current=false;setState({...initialSession4Applied(),shuffleRound:state.shuffleRound+1,previousQuiz});}}><Text value={t("Recommencer la démonstration","إعادة العرض التوضيحي")}/></button>}
  </section>:<>
   <nav className="s4-applied-nav" aria-label="Missions de l’évaluation">{session4AppliedSections.map((section,index)=>{const Icon=icons[index];return <button type="button" key={section.title.fr} aria-current={state.part===index?"step":undefined} onClick={()=>go(index)}><Icon size={21}/><span><small>MISSION {index+1} · {section.maxPoints} PTS</small><Text value={section.title}/></span></button>;})}</nav>
   <section className="s4-applied-mission expo-activity" ref={panel} aria-label={`Mission ${state.part+1}`}>
    <header><span>MISSION {state.part+1} / 4 · {session4AppliedSections[state.part].maxPoints} POINTS</span><h2><Text value={session4AppliedSections[state.part].title}/></h2></header>
    {state.part===0?<>
     <p className="s4-applied-instruction"><Text value={t("Pour chaque photo et chaque plan, choisis une seule réponse.","اختر جوابًا واحدًا لكل صورة ولكل مخطط.")}/></p>
     <div className="s4-applied-question-grid">{session4AppliedQuestions.map((q,questionIndex)=><article key={q.id} className="s4-applied-question" data-s4-question={q.id}>
      <div className="s4-applied-question-photo"><span>{String(questionIndex+1).padStart(2,"0")} · 1 PT</span>{"topology" in q?<Session4Topology kind={q.topology}/>:<img src={publicAsset(q.image)} alt={`Photo ${questionIndex+1} · équipement à identifier`}/>}</div>
      <h3><Text value={q.question}/></h3><div role="group" aria-label={`Réponses de la question ${questionIndex+1}`}>{orders[questionIndex].map(index=><button type="button" key={index} aria-pressed={state.answers[q.id]===index} onClick={()=>update(current=>({...current,answers:{...current.answers,[q.id]:index}}))}>{"choiceImages" in q&&<img src={publicAsset(q.choiceImages[index])} alt=""/>}<Text value={q.choices[index]}/></button>)}</div>
     </article>)}</div>
    </>:state.part===1?<>
     <p className="s4-applied-instruction"><Text value={t("Le club reçoit deux PC fixes et un portable. Crée un réseau local : les PC par câble, le portable en Wi-Fi. Utilise le matériel fourni et teste la communication.","استلم النادي حاسوبين ثابتين ومحمولًا. أنشئ شبكة محلية: الحاسوبان بالكابل والمحمول عبر Wi-Fi. استعمل المعدات المتاحة واختبر التواصل.")}/></p>
     <Session4BuildNetwork assessment draft={state.network} onChange={patch=>changeDraft("network",patch)}/>
    </>:state.part===2?<>
     <div className="s4-applied-instruction"><Text value={t("PC-21 est déjà connecté au réseau de test. Dans CMD, retrouve son adresse IPv4 et son nom, puis teste la réponse de 192.168.10.22. Recopie l’adresse et le nom dans le ticket.","الحاسوب PC-21 متصل مسبقًا بشبكة الاختبار. ابحث في CMD عن عنوان IPv4 واسمه، ثم اختبر استجابة 192.168.10.22. انقل العنوان والاسم إلى البطاقة.")}/></div>
     <Session4CommandLab assessment draft={state.terminal} onChange={patch=>changeDraft("terminal",patch)}/>
    </>:<>
     <div className="s4-applied-instruction"><Text value={t("Le dossier Club_reseau de PC-21 contient déjà Invitation.txt. Fais parvenir une copie lisible à PC-22.","يحتوي مجلد Club_reseau في PC-21 على Invitation.txt. أوصل نسخة قابلة للقراءة إلى PC-22.")}/></div>
     <ol className="s4-applied-sharing-tasks"><li><b>2 pts</b><Text value={t("Sur PC-21, partage Club_reseau en lecture seule avec les postes de la salle.","في PC-21، شارك Club_reseau للقراءة فقط مع حواسيب القاعة.")}/></li><li><b>2 pts</b><Text value={t("Sur PC-22, ouvre le partage par Réseau et copie Invitation.txt sur le Bureau.","في PC-22، افتح المشاركة عبر الشبكة وانسخ Invitation.txt إلى سطح المكتب.")}/></li><li><b>2 pts</b><Text value={t("Ouvre la copie placée sur le Bureau de PC-22.","افتح النسخة الموجودة على سطح مكتب PC-22.")}/></li></ol>
     <Session4Simulator mode="assessment" state={state.simulator} onChange={simulator=>update(current=>JSON.stringify(current.simulator)===JSON.stringify(simulator)?current:{...current,simulator})}/>
    </>}
   </section>
   <nav className="s4-exercise-nav" aria-label="Navigation des missions"><button type="button" disabled={state.part===0} onClick={()=>go(state.part-1)}><ArrowLeft size={18}/><Text value={t("Mission précédente","المهمة السابقة")}/></button><span>{started.filter(Boolean).length} / 4 <Text value={t("missions commencées","مهام بدأت")}/></span><button type="button" className="s4-primary" disabled={state.part===3} onClick={()=>go(state.part+1)}><Text value={t("Mission suivante","المهمة التالية")}/><ArrowRight size={18}/></button></nav>
   <div className="s4-applied-hand-in"><p><Text value={t("Tu peux rendre le travail réalisé même si les quatre missions ne sont pas terminées.","يمكنك تسليم العمل المنجز حتى لو لم تكمل المهام الأربع.")}/></p><button type="button" className="s4-primary" disabled={!teacher&&!started.some(Boolean)} onClick={()=>setConfirm(true)}><Send size={18}/><Text value={t("Rendre mon évaluation","تسليم تقويمي")}/></button></div>
  </>}
  {confirm&&<div className="s4-modal-backdrop"><section className="s4-modal" role="dialog" aria-modal="true" aria-labelledby="s4-applied-submit"><button type="button" className="s4-modal-close" aria-label="Fermer" onClick={()=>setConfirm(false)}><X size={20}/></button><h2 id="s4-applied-submit"><Text value={t("Rendre ta copie ?","هل تسلّم نسختك؟")}/></h2><p><Text value={t(`Tu as répondu à ${answered}/6 questions. Les manipulations réalisées dans les trois autres missions comptent aussi dans ta note.`,`أجبت عن ${answered} من أصل 6 أسئلة. تحتسب أيضًا العمليات المنجزة في المهام الثلاث الأخرى.`)}/></p><div className="s4-inline-actions"><button type="button" onClick={()=>setConfirm(false)}><Text value={t("Continuer mon travail","متابعة عملي")}/></button><button type="button" className="s4-primary" onClick={submit}><Text value={t("Confirmer la remise","تأكيد التسليم")}/></button></div></section></div>}
 </div>;
}
