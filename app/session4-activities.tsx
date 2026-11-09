"use client";

import { FileText, Folder, FolderPlus, Monitor, Network, Send, Wifi } from "lucide-react";
import { Session3Text as Text } from "./session3-translation";
import { publicAsset } from "../lib/public-assets";
import { s4t as t, session4NetworkEquipment, type Session4Activity } from "./session4-data";
import { session4PeerIP, session4SourceIP, type Session4Draft } from "./session4-model";
import { Session4CommandLab } from "./session4-terminal";
import { ExpoNetworkLab, ExpoPatchLab, ExpoTopologyLab } from "./session4-expo-network";
import { ExpoAnswerDropdown } from "./session4-answer-dropdown";
import { Session4VideoExercise } from "./session4-video-exercise";
import { Session4BuildNetwork } from "./session4-build-network";
import { expoFolder, expoFolderReady, expoInvitation, expoInvitationOpened, expoInviteCode, expoLoan, expoLoanResult, expoShareReady, expoSSID } from "./session4-expo-model";

type LabProps = { draft:Session4Draft; onChange:(patch:Partial<Session4Draft>)=>void };

export function Session4Topology({kind}:{kind:"star"|"bus"|"ring"}){
 const positions=kind==="star"?[[150,35],[260,120],[150,205],[40,120]]:kind==="bus"?[[45,55],[150,55],[255,55]]:[[150,30],[250,110],[210,200],[90,200],[50,110]];
 return <svg viewBox="0 0 300 240" role="img" aria-label={kind==="star"?"Les PC rejoignent un équipement au centre":kind==="bus"?"Les PC rejoignent une ligne commune":"Les PC sont reliés en boucle fermée"}>
  {kind==="star"&&positions.map(([x,y],i)=><line key={i} x1={x} y1={y} x2="150" y2="120"/>)}
  {kind==="bus"&&<><line x1="20" y1="140" x2="280" y2="140"/>{positions.map(([x,y],i)=><line key={i} x1={x} y1={y} x2={x} y2="140"/>)}</>}
  {kind==="ring"&&<polygon points={positions.map(p=>p.join(',')).join(' ')} fill="none"/>}
  {kind==="star"&&<image href={publicAsset("session4/images/commutateur.webp")} x="120" y="108" width="60" height="25"/>}
  {positions.map(([x,y],i)=><image key={i} href={publicAsset("session4/images/ordinateur-bureau.webp")} x={x-25} y={y-20} width="50" height="40"/>)}
 </svg>;
}
const stock = [...session4NetworkEquipment].reverse();
function NetworkStock({ mode,draft,onChange }:LabProps&{mode:"names"|"roles"}) {
 const names = mode === "names";
 const options = session4NetworkEquipment.map(item=>({id:item.id,label:names?item.name:item.role}));
 return <div className="expo-inventory">
  {stock.map((item,index)=>{
   const key=`${names?"name":"role"}-${item.id}`;
   const correct=draft.selections[key]===item.id;
   return <article key={item.id} className="expo-photo-card">
    <div className="expo-packshot"><span>PHOTO {String(index+1).padStart(2,"0")}</span>
     <img src={publicAsset(item.image)} alt={names?`Matériel réseau à identifier · photo ${index+1}`:item.name.fr}/>
    </div>
    {!names&&<h3 className="expo-stock-name"><Text value={item.name}/></h3>}
    <ExpoAnswerDropdown label={names?t("Nom de l’équipement","اسم المعدة"):t("Rôle dans le réseau","الوظيفة في الشبكة")}
     name={`${names?"Nom":"Rôle"} · photo ${index+1}`} value={draft.selections[key]??""} options={options}
     onChange={value=>onChange({selections:{...draft.selections,[key]:value}})}/>
    {draft.result!==null&&<p className={`expo-inventory-feedback ${correct?"good":""}`}>
     <Text value={correct?t("Bonne réponse","إجابة صحيحة"):t("À revoir","للمراجعة")}/>
    </p>}
   </article>;
  })}
 </div>;
}

const permissions=[
 {id:"none",label:t("Aucun accès","دون صلاحية الولوج")},
 {id:"write",label:t("Lecture et écriture","القراءة والكتابة")},
 {id:"read",label:t("Lecture","القراءة")},
];
const pcPhoto = "session4/images/ordinateur-bureau.webp";
function ExchangeLab({draft,onChange}:LabProps) {
 const s=draft.selections;
 const receiving=s.view==="receiver";
 const folderReady=expoFolderReady(draft),shared=expoShareReady(draft),opened=expoInvitationOpened(draft);
 function choose(selections:Record<string,string>,patch:Partial<Session4Draft>={}){
  onChange({...patch,selections:{...s,...selections}});
 }
 return <div className="expo-exchange">
  <div className="expo-explorer-tabs" role="group" aria-label="Choisir le poste">
   <button type="button" aria-pressed={!receiving} onClick={()=>choose({view:"source"})}><Monitor size={18}/><Text value={t("PC-21 · préparer","PC-21 · التحضير")}/></button>
   <button type="button" aria-pressed={receiving} onClick={()=>choose({view:"receiver"})}><Monitor size={18}/><Text value={t("PC-22 · chercher l’invitation","PC-22 · البحث عن الدعوة")}/></button>
  </div>
  <section className="expo-station">
   <header><img src={publicAsset(pcPhoto)} alt=""/><strong>{receiving?"PC-22":"PC-21"} · <Text value={t("Explorateur","مستكشف الملفات")}/></strong>
    <code>{receiving?session4PeerIP:session4SourceIP}</code>
   </header>
   {!receiving?<>
    <form onSubmit={event=>{
     event.preventDefault();
     if(s.folderInput?.trim())choose({folder:s.folderInput.trim(),file:"",read:"",code:""},{shared:false,opened:false});
    }}>
     <label><Text value={t("1 · Nom du dossier","1 · اسم المجلد")}/>
      <input aria-label="Nom du dossier à créer" placeholder={expoFolder} maxLength={40} value={s.folderInput??""} onChange={e=>choose({folderInput:e.target.value})}/>
     </label>
     <button type="submit" disabled={!s.folderInput?.trim()}><FolderPlus size={17}/><Text value={t("Créer le dossier","إنشاء المجلد")}/></button>
    </form>
    {s.folder&&<div className="expo-folder-token"><Folder size={20}/><strong>{s.folder}</strong>{s.file==="placed"&&<span>{expoInvitation}</span>}</div>}
    {s.folder&&!folderReady&&<p role="status"><Text value={t(`Nomme le dossier ${expoFolder}.`,`سمِّ المجلد ${expoFolder}.`)}/></p>}
    <div className="expo-explorer-actions">
     <button type="button" disabled={!folderReady||s.file==="placed"} onClick={()=>choose({file:"placed"})}>
      <FileText size={17}/><Text value={t(`2 · Ajouter ${expoInvitation}`,`2 · إضافة ${expoInvitation}`)}/>
     </button>
    </div>
    <ExpoAnswerDropdown label={t("3 · Droit du voisin","3 · صلاحية الزميل")} name="Droit du voisin" value={draft.permission}
     options={permissions} disabled={s.file!=="placed"}
     onChange={value=>choose({read:"",code:""},{permission:value,shared:false,opened:false})}/>
    <div className="expo-explorer-actions">
     <button type="button" disabled={s.file!=="placed"||!draft.permission||draft.shared} onClick={()=>onChange({shared:true})}>
      <Network size={17}/><Text value={t("Partager le dossier","مشاركة المجلد")}/>
     </button>
     {shared&&<button type="button" onClick={()=>choose({view:"receiver"})}><Monitor size={16}/><Text value={t("Passer sur PC-22","الانتقال إلى PC-22")}/></button>}
    </div>
    {draft.shared&&<p role="status"><Text value={draft.permission==="read"?t("Le voisin peut ouvrir l’invitation.","يمكن للزميل فتح الدعوة."):
     draft.permission==="write"?t("Ce droit autorise aussi l’écriture. Pour lire l’invitation, Lecture suffit.","تسمح هذه الصلاحية أيضًا بالكتابة. تكفي القراءة لفتح الدعوة."):
      t("L’accès au dossier est fermé.","الولوج إلى المجلد مغلق.")}/></p>}
   </>:<>
    <div className="expo-explorer-actions"><button type="button" aria-pressed={s.network==="open"} onClick={()=>choose({network:"open"})}>
     <Network size={18}/><Text value={t("Réseau","الشبكة")}/>
    </button></div>
    {s.network==="open"&&<div className="expo-explorer-hosts" role="group" aria-label="Postes dans le réseau">
     {["PC-21","PC-23"].map(name=><button type="button" key={name} aria-pressed={s.remote===name}
      onClick={()=>choose({remote:name,read:"",code:""},{opened:false})}>
      <img src={publicAsset(pcPhoto)} alt=""/><span>{name}</span>
     </button>)}
    </div>}
    {s.remote&&<div className="expo-explorer-address"><code>{["","",s.remote].join("\\")}</code></div>}
    {s.remote&&(s.remote==="PC-21"&&shared
     ? <div className="expo-explorer-actions"><button type="button" aria-pressed={opened} onClick={()=>onChange({opened:true})}>
        <Folder size={19}/><Text value={t(`Ouvrir ${expoFolder}`,`فتح ${expoFolder}`)}/>
       </button></div>
     : <p role="status"><Text value={t("Aucun dossier accessible sur ce poste.","لا يوجد مجلد متاح على هذا الحاسوب.")}/></p>)}
    {opened&&<div className="expo-invitation">
     <button type="button" onClick={()=>choose({read:"yes"})}><FileText size={19}/><Text value={t(`Lire ${expoInvitation}`,`قراءة ${expoInvitation}`)}/></button>
     {s.read==="yes"&&<>
      <div className="expo-invitation-text"><Text value={t("Invitation du club · rendez-vous au stand 04.","دعوة النادي · الموعد في الجناح 04.")}/><strong>{expoInviteCode}</strong></div>
      <label><Text value={t("Code lu dans l’invitation","الرمز المقروء في الدعوة")}/>
       <input aria-label="Code lu dans l’invitation" value={s.code??""} maxLength={16} spellCheck={false} onChange={e=>choose({code:e.target.value})}/>
      </label>
     </>}
    </div>}
   </>}
  </section>
 </div>;
}

const loanFeedback={
 missing:t("Complète la fiche du portable avant de tester.","أكمل بطاقة الحاسوب المحمول قبل الاختبار."),
 wifi:t("Le portable a rejoint un autre Wi-Fi. Vérifie le nom du réseau de l’équipe.","التحق المحمول بشبكة Wi-Fi أخرى. تحقق من اسم شبكة الفريق."),
 address:t("Cette adresse est déjà utilisée. Consulte la liste des postes connectés.","هذا العنوان مستعمل بالفعل. راجع قائمة الحواسيب المتصلة."),
 name:t("Le bureau ne trouve pas le portable sous le nom indiqué. Relis son étiquette.","لم يجد المكتب المحمول بالاسم المحدد. أعد قراءة ملصقه."),
 received:t("Invitation reçue sur PORTABLE-23. Il a sa propre adresse sur le réseau du club.","توصل PORTABLE-23 بالدعوة. أصبح له عنوان خاص في شبكة النادي."),
};
function LoanLab({draft,onChange}:LabProps) {
 const s=draft.selections,result=expoLoanResult(draft);
 const set=(key:string,value:string)=>onChange({selections:{...s,[key]:value},tested:false,delivered:false});
 return <div className="expo-loan">
  <div className="expo-loan-grid">
   <aside className="expo-loan-ledger">
    <span>POSTES DÉJÀ CONNECTÉS</span>
    <dl>{expoLoan.registered.map(pc=><div key={pc.name}><dt>{pc.name}</dt><dd><code>{pc.address}</code></dd></div>)}</dl>
    <p><Wifi size={17} aria-hidden="true"/><Text value={t("Wi-Fi de l’équipe","شبكة Wi-Fi للفريق")}/><strong>{expoSSID}</strong></p>
   </aside>
   <section className="expo-ticket">
    <span>FICHE DU PORTABLE DE PRÊT</span>
    <div className="expo-loan-photo"><img src={publicAsset("session4/images/portable-windows.webp")} alt="Portable de prêt"/><code>{expoLoan.label}</code></div>
    <label><Text value={t("1 · Nom relevé sur l’étiquette","1 · الاسم المقروء على الملصق")}/>
     <input aria-label="Nom relevé sur l’étiquette" value={s.loanName??""} maxLength={30} spellCheck={false} onChange={e=>set("loanName",e.target.value.trim().toUpperCase())}/>
    </label>
    <label><Text value={t("2 · IPv4 libre","2 · عنوان IPv4 شاغر")}/>
     <select aria-label="IPv4 libre" value={s.loanAddress??""} onChange={e=>set("loanAddress",e.target.value)}>
      <option value="">Choisir une adresse…</option>{[expoLoan.address,...expoLoan.registered.map(pc=>pc.address)].sort().map(address=><option key={address}>{address}</option>)}
     </select>
    </label>
    <ExpoAnswerDropdown label={t("3 · Réseau du portable","3 · شبكة الحاسوب المحمول")} value={s.loanWifi??""}
     options={[
      {id:"INVITES",label:t("INVITES · Wi-Fi visiteurs","INVITES · شبكة الزوار")},
      {id:expoSSID,label:t(expoSSID,"شبكة CLUB-EXPO")},
      {id:"SALLE-PROFS",label:t("SALLE-PROFS · Wi-Fi enseignants","SALLE-PROFS · شبكة الأساتذة")},
     ]} onChange={value=>set("loanWifi",value)}/>
   </section>
  </div>
  <div className="expo-test">
   <button type="button" className="s4-primary" onClick={()=>onChange({tested:true,delivered:result==="received"})}>
    <Send size={18} aria-hidden="true"/><Text value={t("Envoyer l’invitation au portable","إرسال الدعوة إلى المحمول")}/>
   </button>
   {draft.tested&&<div className={`expo-delivery ${draft.delivered?"arrived":""}`} role="status"><Text value={loanFeedback[result]}/></div>}
  </div>
 </div>;
}

export function Session4ActivityPlayer({activity,draft,onChange}:LabProps&{activity:Session4Activity}) {
 switch(activity.kind){
  case "build": return <Session4BuildNetwork draft={draft} onChange={onChange}/>;
  case "video": return <Session4VideoExercise activity={activity} draft={draft} onChange={onChange}/>;
  case "names":
  case "roles": return <NetworkStock mode={activity.kind} draft={draft} onChange={onChange}/>;
  case "star":
  case "bus":
  case "ring": return <ExpoTopologyLab topology={activity.kind} draft={draft} onChange={onChange}/>;
  case "patch": return <ExpoPatchLab draft={draft} onChange={onChange}/>;
  case "exchange": return <ExchangeLab draft={draft} onChange={onChange}/>;
  case "wireless":
  case "mixed":
  case "diagnostic": return <ExpoNetworkLab kind={activity.kind} draft={draft} onChange={onChange}/>;
  case "identity": return <Session4CommandLab draft={draft} onChange={onChange}/>;
  case "loan": return <LoanLab draft={draft} onChange={onChange}/>;
 }
}
