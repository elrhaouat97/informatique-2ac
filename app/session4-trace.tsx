"use client";

import {ArrowRight,Check} from "lucide-react";
import {Session3Text as Text} from "./session3-translation";
import {s4t as t} from "./session4-data";

const methods=[
  {title:t("Filaire · Ethernet","سلكي · Ethernet"),detail:t("Avec un câble RJ45","بكابل RJ45")},
  {title:t("Wi-Fi","Wi-Fi"),detail:t("Sans câble","دون كابل")},
  {title:t("Fibre optique","الألياف البصرية"),detail:t("Liaison très rapide","اتصال سريع جدًا")},
  {title:t("Bluetooth","Bluetooth"),detail:t("Courte distance","مسافة قصيرة")},
];
const topologies=[
  {id:"bus",name:t("Bus","خطية"),detail:t("Une ligne commune","خط مشترك")},
  {id:"star",name:t("Étoile","نجمية"),detail:t("Un équipement au centre","جهاز في الوسط")},
  {id:"ring",name:t("Anneau","حلقية"),detail:t("Une boucle fermée","حلقة مغلقة")},
  {id:"mesh",name:t("Maillée","متشابكة"),detail:t("Plusieurs liaisons entre postes","وصلات متعددة بين الحواسيب")},
];
const equipment=[
  [t("Carte réseau Ethernet","بطاقة شبكة Ethernet"),t("Connecter le PC par câble","ربط الحاسوب بالكابل")],
  [t("Carte Wi-Fi","بطاقة Wi-Fi"),t("Connecter le PC sans câble","ربط الحاسوب دون كابل")],
  [t("Switch · commutateur","مبدل"),t("Relier les appareils câblés","ربط الأجهزة السلكية")],
  [t("Routeur","موجه"),t("Relier deux réseaux","ربط شبكتين")],
  [t("Point d’accès","نقطة الولوج"),t("Diffuser le Wi-Fi","بث شبكة Wi-Fi")],
  [t("Câble RJ45","كابل RJ45"),t("Transporter les données","نقل البيانات")],
];

function TopologyMark({kind}:{kind:string}){
  const points=[[17,13],[83,13],[83,47],[17,47]];
  const edges=kind==="mesh"?[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]:kind==="ring"?[[0,1],[1,2],[2,3],[3,0]]:[];
  return <svg viewBox="0 0 100 60" aria-hidden="true">
    {edges.map(([a,b],index)=><line key={index} x1={points[a][0]} y1={points[a][1]} x2={points[b][0]} y2={points[b][1]}/>)}
    {kind==="star"&&points.map(([x,y],index)=><line key={index} x1={x} y1={y} x2="50" y2="30"/>)}
    {kind==="bus"?<><line x1="5" y1="42" x2="95" y2="42"/>{[20,50,80].map(x=><g key={x}><line x1={x} y1="17" x2={x} y2="42"/><rect x={x-7} y="8" width="14" height="12" rx="1"/></g>)}</>:<>{points.map(([x,y],index)=><rect key={index} x={x-6} y={y-5} width="12" height="10" rx="1"/>)}{kind==="star"&&<rect x="42" y="25" width="16" height="10"/>}</>}
  </svg>;
}

export function Session4Trace({onEvaluate}:{onEvaluate:()=>void}){
  return <div className="s4-trace-wrap s4-panel-enter">
    <article className="s4-reference-sheet" aria-label="Fiche à retenir : réseau local">
      <header><h1>RÉSEAU LOCAL <span lang="ar" dir="rtl">الشبكة المحلية</span></h1></header>
      <section>
        <h2><Text value={t("Qu’est-ce qu’un réseau local ?","ما الشبكة المحلية؟")}/></h2>
        <p><Text value={t("Un réseau local (LAN) relie plusieurs ordinateurs et appareils dans un même lieu : maison, école ou entreprise.","تربط الشبكة المحلية (LAN) عدة حواسيب وأجهزة في مكان واحد: المنزل أو المدرسة أو المؤسسة.")}/></p>
        <h3><Text value={t("Il permet de :","تسمح بـ:")}/></h3>
        <ul>{[t("Partager des fichiers et des imprimantes","تقاسم الملفات والطابعات"),t("Partager une connexion Internet","تقاسم اتصال بالإنترنت"),t("Communiquer entre utilisateurs","التواصل بين المستخدمين")].map(item=><li key={item.fr}><Check size={17}/><Text value={item}/></li>)}</ul>
        <p className="s4-sheet-note"><Text value={t("Le réseau local peut fonctionner sans Internet.","يمكن أن تعمل الشبكة المحلية دون الإنترنت.")}/></p>
      </section>
      <section>
        <h2><Text value={t("Méthodes de connexion","طرق الاتصال")}/></h2>
        <div className="s4-sheet-methods">{methods.map(item=><div key={item.title.fr}><strong><Text value={item.title}/></strong><span><Text value={item.detail}/></span></div>)}</div>
        <p className="s4-sheet-note"><Text value={t("Réseau mixte : des appareils câblés et d’autres en Wi-Fi.","شبكة مختلطة: أجهزة متصلة بالكابل وأخرى عبر Wi-Fi.")}/></p>
      </section>
      <section>
        <h2><Text value={t("Topologies","بنيات الشبكة")}/></h2>
        <div className="s4-sheet-topologies">{topologies.map(item=><div key={item.id}><TopologyMark kind={item.id}/><strong><Text value={item.name}/></strong><span><Text value={item.detail}/></span></div>)}</div>
      </section>
      <section>
        <h2><Text value={t("Équipements et rôles","الأجهزة ووظائفها")}/></h2>
        <table><thead><tr><th scope="col"><Text value={t("Équipement","الجهاز")}/></th><th scope="col"><Text value={t("Rôle","الوظيفة")}/></th></tr></thead>
          <tbody>{equipment.map(([name,role])=><tr key={name.fr}><th scope="row"><Text value={name}/></th><td><Text value={role}/></td></tr>)}</tbody>
        </table>
        <p className="s4-sheet-note"><Text value={t("Le routeur peut relier le réseau local à Internet.","يمكن للموجه ربط الشبكة المحلية بالإنترنت.")}/></p>
      </section>
      <section>
        <h2><Text value={t("Pour identifier, tester et échanger","للتعرف والاختبار والتبادل")}/></h2>
        <dl>
          <div><dt>ipconfig</dt><dd><Text value={t("Lire l’adresse IP","قراءة عنوان IP")}/></dd></div>
          <div><dt>hostname</dt><dd><Text value={t("Lire le nom du PC","قراءة اسم الحاسوب")}/></dd></div>
          <div><dt>ping adresse_IP</dt><dd><Text value={t("Tester la communication","اختبار التواصل")}/></dd></div>
        </dl>
        <p><Text value={t("Pour échanger un fichier : partage un dossier, accède au dossier depuis l’autre PC, copie le fichier puis ouvre-le.","لتبادل ملف: شارك مجلدًا ثم افتحه من الحاسوب الآخر وانسخ الملف وافتحه.")}/></p>
        <p className="s4-sheet-note"><Text value={t("Lecture : consulter. Modification : consulter et modifier.","القراءة: الاطلاع. التعديل: الاطلاع والتغيير.")}/></p>
      </section>
    </article>
    <button type="button" className="s4-primary" onClick={onEvaluate}><Text value={t("Je passe à l’évaluation","أنتقل إلى التقويم")}/><ArrowRight size={18}/></button>
  </div>;
}
