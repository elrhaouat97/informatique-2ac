import type { LocalizedText } from "./course-data";
import { windowsCriteria, windowsEvidence, type WindowsState } from "./session3-windows-model";
const t=(fr:string,ar:string):LocalizedText=>({fr,ar});
export const assessmentFamilies=[{id:"material",label:t("Matériel","المعدات")},{id:"system",label:t("Système d’exploitation","نظام تشغيل")},{id:"application",label:t("Application","تطبيق")}];
export const assessmentCards=[
 {id:"mouse",label:t("Souris","فأرة"),family:"material",image:"session2/items/ex02-card-04.jpg"},
 {id:"ssd",label:t("SSD","SSD"),family:"material",image:"session2/items/ex12-card-05.jpg"},
 {id:"windows",label:t("Windows","Windows"),family:"system",image:"session3/visuels/logo-windows.svg"},
 {id:"android",label:t("Android","Android"),family:"system",image:"session3/visuels/logo-android.svg"},
 {id:"calculator",label:t("Calculatrice","الحاسبة"),family:"application",image:"session3/visuels/app-calculatrice.svg"},
 {id:"browser",label:t("Navigateur Web","متصفح الويب"),family:"application",image:"session3/visuels/app-navigateur.svg"},
];
export const assessmentForms=[{id:"text",label:t("Texte","نص")},{id:"image",label:t("Image","صورة")},{id:"audio",label:t("Son","صوت")},{id:"video",label:t("Vidéo","فيديو")}];
export const assessmentFiles=[
 {id:"invitation",name:"Invitation.txt",form:"text",content:"Le club informatique vous invite vendredi à 16 h.",image:null,audio:null,video:null},
 {id:"photo",name:"Materiel.jpg",form:"image",content:null,image:"session2/items/unite-centrale-lenovo.jpg",audio:null,video:null},
 {id:"message",name:"Message.wav",form:"audio",content:null,image:null,audio:"session3/medias/message-sonore.wav",video:null},
 {id:"reportage",name:"Reportage.mp4",form:"video",content:null,image:null,audio:null,video:"session3/medias/animation-club.mp4"},
];
export type AssessmentAnswers={families:Record<string,string>;forms:Record<string,string>};
export function assessSession3(answers:AssessmentAnswers,windows:WindowsState){
 const records=[...assessmentCards.map(card=>{const selected=assessmentFamilies.find(x=>x.id===answers.families[card.id]);const expected=assessmentFamilies.find(x=>x.id===card.family)!;const correct=answers.families[card.id]===card.family;return {question:t(`Classer ${card.label.fr}.`,`تصنيف ${card.label.ar}.`),selectedChoice:selected?.label??t("Sans réponse","دون جواب"),correctChoice:expected.label,correct,answerCorrect:correct,earnedPoints:correct?1:0,maxPoints:1};}),...assessmentFiles.map(file=>{const selected=assessmentForms.find(x=>x.id===answers.forms[file.id]);const expected=assessmentForms.find(x=>x.id===file.form)!;const correct=answers.forms[file.id]===file.form;return {question:t(`Reconnaître le contenu de ${file.name}.`,`تحديد محتوى ${file.name}.`),selectedChoice:selected?.label??t("Sans réponse","دون جواب"),correctChoice:expected.label,correct,answerCorrect:correct,earnedPoints:correct?1:0,maxPoints:1};}),...windowsCriteria(windows,"assessment").map(c=>({question:c.label,selectedChoice:c.correct?t("Objectif réalisé","تحقق الهدف"):t("Objectif non réalisé","لم يتحقق الهدف"),correctChoice:c.label,correct:c.correct,answerCorrect:c.correct,earnedPoints:c.correct?c.points:0,maxPoints:c.points}))];
 const score=records.reduce((sum,r)=>sum+r.earnedPoints,0);
 return {format:"session3-bilan-situations-v5",score,maxScore:20,sections:[records.slice(0,6).reduce((s,r)=>s+r.earnedPoints,0),records.slice(6,10).reduce((s,r)=>s+r.earnedPoints,0),records.slice(10).reduce((s,r)=>s+r.earnedPoints,0)],answers:records,dossier:windowsEvidence(windows)};
}
