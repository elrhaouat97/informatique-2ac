"use client";

import { publicAsset } from "../lib/public-assets";

import { useState } from "react";
import { ArrowDown, ArrowRight, FileText, Folder, ImageIcon, Music2, Save, Video } from "lucide-react";
import { Session3Text as Text } from "./session3-translation";
import type { LocalizedText } from "./course-data";
import "./session3-revision.css";
const t=(fr:string,ar:string):LocalizedText=>({fr,ar});

function ConversionGuide(){
  const [example,setExample]=useState(0);
  const examples=[{label:t("Go → Mo","Go إلى Mo"),start:"3 Go",operation:"3 × 1 000",result:"3 000 Mo",rule:t("Je remonte de Go vers Mo : je multiplie par 1 000.","أصعد من Go نحو Mo: أضرب في 1000.")},{label:t("Mo → Go","Mo إلى Go"),start:"4 000 Mo",operation:"4 000 ÷ 1 000",result:"4 Go",rule:t("Je descends de Mo vers Go : je divise par 1 000.","أنزل من Mo نحو Go: أقسم على 1000.")},{label:t("Octets → bits","Octets إلى bits"),start:"2 octets",operation:"2 × 8",result:"16 bits",rule:t("Je remonte d’octet vers bit : je multiplie par 8.","أصعد من الأوكتات نحو البت: أضرب في 8.")}];
  const selected=examples[example];
  return <section className="s3-conversion-guide" aria-label="Exemple de conversion"><span className="s3-guide-kicker">UN EXEMPLE POUR T’AIDER</span><div className="s3-example-tabs">{examples.map((e,i)=><button type="button" aria-pressed={example===i} className={example===i?"active":""} key={i} onClick={()=>setExample(i)}><Text value={e.label}/></button>)}</div><div className="s3-worked-example" aria-live="polite"><strong>{selected.start}</strong><ArrowRight size={22}/><span>{selected.operation}</span><ArrowRight size={22}/><strong>{selected.result}</strong></div><p><Text value={selected.rule}/></p></section>;
}

function FileIntroduction(){const [saved,setSaved]=useState(false);return <section className="s3-file-introduction"><div><span className="s3-guide-kicker">DE L’INFORMATION AU FICHIER</span><h4><Text value={t("Comment garder une information ?","كيف نحتفظ بالمعلومة؟")}/></h4><p><Text value={t("Tu connais déjà le texte, l’image, le son et la vidéo. Quand on enregistre un de ces contenus dans l’appareil, on obtient un fichier. Le fichier a un nom et souvent une extension, après le dernier point.","تعرف النص والصورة والصوت والفيديو. عندما نسجل أحد هذه المحتويات في الجهاز نحصل على ملف. للملف اسم وغالبا امتداد بعد النقطة الأخيرة.")}/></p><p><Text value={t("Un dossier sert à ranger des fichiers : ce n’est pas une cinquième forme d’information.","يستعمل المجلد لتنظيم الملفات، وليس شكلا خامسا للمعلومة.")}/></p></div><div className="s3-save-demo"><div className="s3-save-content"><FileText size={31}/><p>Club informatique<br/>Rendez-vous vendredi à 16 h.</p></div><button type="button" onClick={()=>setSaved(v=>!v)}><Save size={17}/><Text value={saved?t("Voir avant l’enregistrement","عرض ما قبل التسجيل"):t("Enregistrer cette information","تسجيل هذه المعلومة")}/></button>{saved&&<div className="s3-saved-file" role="status"><FileText size={24}/><strong>Invitation<span>.txt</span></strong><small><Text value={t("Un fichier texte que l’on peut nommer, déplacer et ouvrir.","ملف نصي يمكن تسميته ونقله وفتحه.")}/></small></div>}</div></section>}

function SystemMap(){return <div className="s3-system-map"><div className="s3-system-map-root"><Text value={t("Système informatique","نظام معلوماتي")}/></div><div className="s3-system-map-branches"><section><h4><Text value={t("Matériel · les éléments physiques","المعدات · العناصر المادية")}/></h4><div><article><strong><Text value={t("Composants de l’unité centrale","مكونات الوحدة المركزية")}/></strong><p>Processeur · RAM · SSD · carte mère</p></article><article><strong><Text value={t("Périphériques externes","الملحقات الخارجية")}/></strong><p>Clavier · souris · écran · imprimante</p></article></div></section><section><h4><Text value={t("Logiciels · les programmes","البرمجيات · البرامج")}/></h4><div><article><strong><Text value={t("Logiciels de base","البرمجيات الأساسية")}/></strong><p>Windows · Android · Linux · macOS</p></article><article><strong><Text value={t("Logiciels d’application","البرمجيات التطبيقية")}/></strong><p>Word · Excel · VLC · Firefox</p></article></div></section></div></div>}

export function Session3ExerciseGuide({id}:{id:string}){
  if(id==="s3-v5-capacites")return <ConversionGuide/>;
  if(id==="s3-v5-materiel-logiciel")return <details className="s3-guide-details"><summary><Text value={t("Un repère pour comprendre les deux parties du système","دليل لفهم جزأي النظام المعلوماتي")}/></summary><SystemMap/></details>;
  if(id==="s3-v5-information-fichier")return <FileIntroduction/>;
  if(id==="s3-v5-peripheriques")return <p className="s3-image-credit"><a href="https://commons.wikimedia.org/wiki/File:Wireless_Computer_Keyboard.jpg" target="_blank" rel="noreferrer"><Text value={t("Clavier : photo Pixloom · CC BY-SA 4.0","لوحة المفاتيح: صورة Pixloom · CC BY-SA 4.0")}/></a></p>;
  return null;
}
