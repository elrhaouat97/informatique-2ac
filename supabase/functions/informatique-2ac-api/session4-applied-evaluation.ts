// Current lesson-4 assessment. The previous rubrics remain available for older copies.
import {session4AppliedEvaluationId,s4t as t} from "../../../app/session4-data.ts";
import {expoBuildStatus,expoSSID} from "../../../app/session4-expo-model.ts";
import {session4PeerIP,session4SourceIP} from "../../../app/session4-model.ts";
export {session4AppliedEvaluationId};

const photo=(name:string)=>`session4/images/${name}.webp`;
export const session4AppliedQuestions=[
 {id:"stock-switch",image:photo("commutateur"),question:t("Quel est le nom de cet équipement ?","ما اسم هذا الجهاز؟"),choices:[t("Point d’accès","نقطة ولوج"),t("Switch · commutateur","مبدل"),t("Carte Wi-Fi","بطاقة Wi-Fi")],answer:1},
 {id:"stock-ap",image:photo("point-acces"),question:t("À quoi sert le point d’accès ?","ما وظيفة نقطة الولوج؟"),choices:[t("Relier deux réseaux","ربط شبكتين"),t("Diffuser le Wi-Fi","بث شبكة Wi-Fi"),t("Stocker les fichiers","تخزين الملفات")],answer:1},
 {id:"stock-wifi",image:photo("ordinateur-bureau"),question:t("Ce PC n’a pas de Wi-Fi. Quel équipement ajouter pour le connecter sans câble ?","لا يتوفر هذا الحاسوب على Wi-Fi. ما المعدة التي نضيفها لربطه دون كابل؟"),choices:[t("Carte Ethernet","بطاقة Ethernet"),t("Carte Wi-Fi","بطاقة Wi-Fi"),t("Câble RJ45","كابل RJ45")],choiceImages:[photo("carte-ethernet"),"session4/images/carte-wifi.jpg",photo("cable-rj45")],answer:1},
 {id:"plan-star",topology:"star",question:t("Nomme la topologie de ce plan.","سمِّ بنية هذا المخطط."),choices:[t("Bus","خطية"),t("Étoile","نجمية"),t("Anneau","حلقية")],answer:1},
 {id:"plan-bus",topology:"bus",question:t("Nomme la topologie de ce plan.","سمِّ بنية هذا المخطط."),choices:[t("Anneau","حلقية"),t("Bus","خطية"),t("Étoile","نجمية")],answer:1},
 {id:"plan-ring",topology:"ring",question:t("Nomme la topologie de ce plan.","سمِّ بنية هذا المخطط."),choices:[t("Anneau","حلقية"),t("Étoile","نجمية"),t("Bus","خطية")],answer:0},
] as const;
export const session4AppliedSections=[
 {title:t("Équipements et topologies","الأجهزة وبنيات الشبكة"),maxPoints:6},
 {title:t("Construire le réseau","إنشاء الشبكة"),maxPoints:5},
 {title:t("Identifier et tester avec CMD","التعرف والاختبار باستعمال CMD"),maxPoints:3},
 {title:t("Partager et recevoir un fichier","مشاركة ملف واستقباله"),maxPoints:6},
] as const;
const object=(value:unknown):Record<string,unknown>=>value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
const string=(value:unknown,max=80)=>typeof value==="string"?value.slice(0,max):"";
const networkKeys=["build-switch","build-ap","build-port-pc21","build-port-pc22","build-port-ap","build-ssid","build-laptop"];
const commandNames=["ipconfig","hostname",`ping ${session4PeerIP}`];
export function session4AppliedEvidence(network:unknown,terminal:unknown,sharing:unknown){
 const n=object(network),s=object(n.selections),cmd=object(terminal),share=object(sharing);
 return {
  network:{selections:Object.fromEntries(networkKeys.map(key=>[key,string(s[key])])),checks:Array.isArray(n.checks)&&n.checks.includes("build-mixed-tested")?["build-mixed-tested"]:[],tested:n.tested===true},
  terminal:{commands:commandNames.filter(command=>Array.isArray(cmd.commands)&&cmd.commands.includes(command)),ip:string(cmd.ip,15).trim(),host:string(cmd.host,30).trim().toUpperCase()},
  sharing:{access:share.access==="read"||share.access==="write"?share.access:null,copied:share.copied===true,opened:share.copied===true&&share.opened===true},
 };
}
export function validSession4AppliedAnswers(value:unknown):value is Record<string,number>{
 return !!value&&typeof value==="object"&&!Array.isArray(value)&&Object.entries(value).every(([id,index])=>{
  const question=session4AppliedQuestions.find(item=>item.id===id);
  return !!question&&Number.isInteger(index)&&index>=0&&index<question.choices.length;
 });
}
export function gradeSession4Applied(choices:Record<string,number>,network:unknown,terminal:unknown,sharing:unknown){
 const evidence=session4AppliedEvidence(network,terminal,sharing),status=expoBuildStatus(evidence.network);
 const answers=session4AppliedQuestions.map(q=>{
  const index=choices[q.id],selected=Number.isInteger(index)&&index>=0&&index<q.choices.length?index:null,correct=selected===q.answer;
  return {id:q.id,question:q.question,selectedIndex:selected,selectedChoice:selected===null?t("Sans réponse","دون جواب"):q.choices[selected],correctChoice:q.choices[q.answer],correct,earnedPoints:correct?1:0,maxPoints:1};
 });
 const criteria=[
  {section:1,criterion:t("PC-21 branché au switch","ربط PC-21 بالمبدل"),correct:status.pc21,maxPoints:1},
  {section:1,criterion:t("PC-22 branché sur un autre port","ربط PC-22 بمنفذ آخر"),correct:status.pc22,maxPoints:1},
  {section:1,criterion:t("Point d’accès branché au switch","ربط نقطة الولوج بالمبدل"),correct:status.uplink,maxPoints:1},
  {section:1,criterion:t(`Portable connecté au Wi-Fi ${expoSSID}`,`ربط المحمول بشبكة Wi-Fi ${expoSSID}`),correct:status.wifi,maxPoints:1},
  {section:1,criterion:t("Réseau mixte testé avec succès","اختبار الشبكة المختلطة بنجاح"),correct:status.mixed&&evidence.network.tested&&evidence.network.checks.includes("build-mixed-tested"),maxPoints:1},
  {section:2,criterion:t("Commande exécutée et adresse IPv4 relevée","تنفيذ الأمر وقراءة عنوان IPv4"),correct:evidence.terminal.commands.includes("ipconfig")&&evidence.terminal.ip===session4SourceIP,maxPoints:1},
  {section:2,criterion:t("Commande exécutée et nom du PC relevé","تنفيذ الأمر وقراءة اسم الحاسوب"),correct:evidence.terminal.commands.includes("hostname")&&evidence.terminal.host==="PC-21",maxPoints:1},
  {section:2,criterion:t(`Communication testée vers ${session4PeerIP}`,`اختبار التواصل مع ${session4PeerIP}`),correct:evidence.terminal.commands.includes(`ping ${session4PeerIP}`),maxPoints:1},
  {section:3,criterion:t("Club_reseau partagé en lecture seule","مشاركة Club_reseau للقراءة فقط"),correct:evidence.sharing.access==="read",maxPoints:2},
  {section:3,criterion:t("Invitation.txt copié depuis PC-21 sur le Bureau de PC-22","نسخ Invitation.txt من PC-21 إلى سطح مكتب PC-22"),correct:evidence.sharing.copied,maxPoints:2},
  {section:3,criterion:t("Copie ouverte sur le Bureau de PC-22","فتح النسخة على سطح مكتب PC-22"),correct:evidence.sharing.opened,maxPoints:2},
 ];
 const practical=criteria.map(item=>({...item,earnedPoints:item.correct?item.maxPoints:0}));
 const sections=[answers.reduce((sum,item)=>sum+item.earnedPoints,0),...[1,2,3].map(section=>practical.filter(item=>item.section===section).reduce((sum,item)=>sum+item.earnedPoints,0))];
 return {format:session4AppliedEvaluationId,choices:Object.fromEntries(session4AppliedQuestions.filter(q=>choices[q.id]!==undefined).map(q=>[q.id,choices[q.id]])),evidence,answers,practical,sections,score:sections.reduce((sum,value)=>sum+value,0),maxScore:20};
}
export function validSession4AppliedEvaluation(value:unknown,isCorrect:unknown,score:unknown,maxScore:unknown){
 const a=object(value);if(a.format!==session4AppliedEvaluationId||!validSession4AppliedAnswers(a.choices))return false;
 const evidence=object(a.evidence),expected=gradeSession4Applied(a.choices,evidence.network,evidence.terminal,evidence.sharing);
 return score===expected.score&&a.score===expected.score&&maxScore===20&&a.maxScore===20&&isCorrect===(expected.score===20)
  &&JSON.stringify(a.evidence)===JSON.stringify(expected.evidence)&&JSON.stringify(a.answers)===JSON.stringify(expected.answers)
  &&JSON.stringify(a.practical)===JSON.stringify(expected.practical)&&JSON.stringify(a.sections)===JSON.stringify(expected.sections);
}
