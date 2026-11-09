"use client";
import {useEffect,useId,useRef,useState} from "react";
import {ArrowRight,Check,History,LoaderCircle,Users,AlertTriangle,Search} from "lucide-react";
import {registerParticipant,rosterSuggestions,type StudentProfile} from "../lib/supabase-api";
import {cachedProfileFor,normalizeName,rememberProfile,resumeOverview} from "../lib/learning-storage";
import {isSuggestibleStudentName} from "../supabase/functions/informatique-2ac-api/student-names";
import "./learning-resume.css";
const Copy=({fr,ar}:{fr:string;ar:string})=><span>{fr}<small lang="ar" dir="rtl">{ar}</small></span>;
type Suggestion={id:string;fullName:string};
export function NamePicker({label,value,id,onChange,options,exclude}:{label:string;value:string;id?:string;onChange:(name:string,id?:string)=>void;options:Suggestion[];exclude?:string}){
 const listId=useId(),helpId=listId+"-help";
 const [open,setOpen]=useState(false),[index,setIndex]=useState(0);
 const [placement,setPlacement]=useState({above:false,height:240});
 const field=useRef<HTMLDivElement>(null),activeOption=useRef<HTMLButtonElement>(null),keyboardNavigation=useRef(false);
 const matches=options.filter(s=>isSuggestibleStudentName(s.fullName)&&s.id!==exclude&&normalizeName(s.fullName).includes(normalizeName(value)));
 const choices=matches.slice(0,value.trim()?12:8);
 const [fr,ar]=label.split(" · ");
 useEffect(()=>{
  if(!open)return;
  function position(){const rect=field.current?.getBoundingClientRect();if(!rect)return;const card=field.current?.closest(".identity-card")?.getBoundingClientRect();const below=Math.min(window.innerHeight,card?.bottom??window.innerHeight)-rect.bottom-12,above=rect.top-Math.max(0,card?.top??0)-12,up=below<240&&above>below;setPlacement({above:up,height:Math.max(72,Math.min(240,up?above:below))})}
  position();window.addEventListener("resize",position);window.addEventListener("scroll",position,true);
  return()=>{window.removeEventListener("resize",position);window.removeEventListener("scroll",position,true)};
 },[open]);
 useEffect(()=>{if(open&&keyboardNavigation.current){activeOption.current?.scrollIntoView({block:"nearest"});keyboardNavigation.current=false}},[index,open]);
 const choose=(s:Suggestion)=>{onChange(s.fullName,s.id);setOpen(false)};
 return <div className="student-name-picker">
  <label htmlFor={listId+"-input"}><span>{fr}</span>{ar&&<small lang="ar" dir="rtl">{ar}</small>}</label>
  <div ref={field} className="student-name-input"><Search size={16}/><input id={listId+"-input"} role="combobox" aria-label={label} aria-autocomplete="list" aria-expanded={open&&choices.length>0} aria-controls={listId} aria-describedby={helpId} aria-activedescendant={open&&choices[index]?`${listId}-${index}`:undefined} autoComplete="off" required maxLength={100} dir="auto" placeholder="Écris ton nom…" value={value}
   onFocus={()=>{setOpen(true);setIndex(0)}} onBlur={()=>setOpen(false)}
   onChange={e=>{const exact=options.filter(s=>isSuggestibleStudentName(s.fullName)&&s.id!==exclude&&normalizeName(s.fullName)===normalizeName(e.target.value));onChange(e.target.value,exact.length===1?exact[0].id:undefined);setOpen(true);setIndex(0)}}
   onKeyDown={e=>{if(e.key==="Escape")setOpen(false);if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();keyboardNavigation.current=true;setOpen(true);setIndex(i=>(i+(e.key==="ArrowDown"?1:-1)+Math.max(1,choices.length))%Math.max(1,choices.length));}if(e.key==="Enter"&&open&&choices[index]){e.preventDefault();choose(choices[index])}}}/>{id&&<Check size={17} className="student-name-selected"/>}
   {open&&choices.length>0&&<ul id={listId} role="listbox" aria-label={fr} className={`student-name-suggestions ${placement.above?"above":"below"}`} style={{maxHeight:placement.height}}>{choices.map((s,i)=><li key={s.id} role="presentation"><button ref={i===index?activeOption:null} type="button" tabIndex={-1} role="option" aria-selected={id===s.id} id={`${listId}-${i}`} className={index===i?"highlighted":""} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(s)}><span dir="auto">{s.fullName}</span>{id===s.id&&<Check size={15}/>}</button></li>)}</ul>}
  </div>
  <small id={helpId} className="student-name-help">{open&&value.trim()&&!choices.length?"Nom absent de la liste : vérifie l’orthographe ou saisis ton nom complet.":matches.length>choices.length?"Écris quelques lettres pour préciser la recherche.":"Choisis ton nom ou saisis ton nom complet."}</small>
 </div>;
}

export function StudentIdentification({onReady}:{onReady:(p:StudentProfile)=>void}){
 const [isPair,setIsPair]=useState(true),[studentOne,setOne]=useState(""),[studentTwo,setTwo]=useState(""),[oneId,setOneId]=useState<string>(),[twoId,setTwoId]=useState<string>();
 const [className,setClass]=useState("2/1"),[groupName,setGroup]=useState("1"),[options,setOptions]=useState<Suggestion[]>([]),[fetching,setFetching]=useState(false),[submitting,setSubmitting]=useState(false),[error,setError]=useState("");
 useEffect(()=>{let alive=true;setFetching(true);setOptions([]);void rosterSuggestions(className,groupName).then(r=>{if(alive)setOptions(r.students.filter(s=>isSuggestibleStudentName(s.fullName)))}).catch(()=>{}).finally(()=>{if(alive)setFetching(false)});return()=>{alive=false}},[className,groupName]);
 async function submit(e:React.FormEvent){e.preventDefault();setError("");if(!isSuggestibleStudentName(studentOne)||(isPair&&!isSuggestibleStudentName(studentTwo))){setError("Saisis un nom complet valide, sans chiffres ni symboles. / اكتب اسما كاملا صحيحا دون أرقام أو رموز.");return;}if(isPair&&(oneId&&oneId===twoId||normalizeName(studentOne)===normalizeName(studentTwo))){setError("Choisis deux élèves différents. / اختر تلميذين مختلفين.");return;}setSubmitting(true);try{const identity={studentOne,studentTwo:isPair?studentTwo:null,studentOneId:oneId,studentTwoId:isPair?twoId:null,className,groupName,isPair};const cached=cachedProfileFor(identity);const participant=cached??await registerParticipant(identity);rememberProfile(participant);onReady(participant);}catch(e){setError(e instanceof Error?e.message:"Identification impossible.")}finally{setSubmitting(false)}}
 function changeClass(value:string){setClass(value);setOne("");setTwo("");setOneId(undefined);setTwoId(undefined)}
 return <main className="identity-gate"><section className="identity-card" aria-labelledby="identity-title"><div className="identity-brand"><span className="brand-symbol">//</span><span><strong>LAB·2AC</strong><small>INFORMATIQUE</small></span></div><div className="identity-heading"><span className="identity-kicker"><Users size={16}/>Identification des élèves · تعريف التلاميذ</span><h1 id="identity-title"><Copy fr="Avant de commencer" ar="قبل البدء"/></h1><p><Copy fr="Choisis ta classe et ton groupe, puis retrouve ton nom dans les suggestions. Ton travail sera sauvegardé automatiquement." ar="اختر قسمك ومجموعتك ثم ابحث عن اسمك ضمن الاقتراحات. سيحفظ عملك تلقائيا."/></p></div><form className="identity-form" onSubmit={submit}>
 <div className="class-group-grid"><label><Copy fr="Classe" ar="القسم"/><select aria-label="Classe" value={className} onChange={e=>changeClass(e.target.value)}>{Array.from({length:9},(_,i)=>`2/${i+1}`).map(c=><option key={c}>{c}</option>)}</select></label><label><Copy fr="Groupe" ar="المجموعة"/><select aria-label="Groupe" value={groupName} onChange={e=>{setGroup(e.target.value);setOneId(undefined);setTwoId(undefined)}}><option value="1">Groupe 1 · المجموعة 1</option><option value="2">Groupe 2 · المجموعة 2</option></select></label></div>
 <label className="pair-check"><input type="checkbox" checked={isPair} onChange={e=>setIsPair(e.target.checked)}/><span className="pair-check-box"><Check size={16}/></span><Copy fr="Nous travaillons en binôme" ar="نشتغل في ثنائي"/></label>
 <p className="identity-roster-help">{fetching?<><LoaderCircle size={14} className="spin"/>Chargement des noms…</>:options.length?`${options.length} nom(s) proposé(s) pour ${className} · groupe ${groupName}.` : "Tu peux saisir ton nom si la liste n’est pas encore complétée."}</p>
 <div className={`student-name-grid ${isPair?"pair":"solo"}`}><NamePicker label={isPair?"Nom complet de l’élève 1 · الاسم الكامل للتلميذ الأول":"Nom complet · الاسم الكامل"} value={studentOne} id={oneId} options={options} exclude={twoId} onChange={(name,id)=>{setOne(name);setOneId(id)}}/>{isPair&&<NamePicker label="Nom complet de l’élève 2 · الاسم الكامل للتلميذ الثاني" value={studentTwo} id={twoId} options={options} exclude={oneId} onChange={(name,id)=>{setTwo(name);setTwoId(id)}}/>}</div>
 {error&&<div className="identity-error" role="alert"><AlertTriangle size={17}/>{error}</div>}<button type="submit" className="identity-submit" disabled={submitting}>{submitting?<LoaderCircle size={19} className="spin"/>:<ArrowRight size={19}/>}<Copy fr={submitting?"Recherche de ton dossier…":"Entrer ou reprendre mon travail"} ar={submitting?"جار البحث عن ملفك…":"الدخول أو استئناف عملي"}/></button></form></section></main>;
}

export function ResumeStudent({profile,onResume,onOther}:{profile:StudentProfile;onResume:()=>void;onOther:()=>void}){
 const overview=resumeOverview(profile.id);
 return <main className="identity-gate"><section className="identity-card student-resume-card"><span className="resume-symbol"><History size={28}/></span><span className="identity-kicker">REPRISE DU TRAVAIL · استئناف العمل</span><h1>Ton travail est conservé<small lang="ar" dir="rtl">عملك محفوظ</small></h1><p>Vérifie que ce dossier est bien le tien avant de continuer.</p><div className="resume-identity"><strong>{profile.studentOne}{profile.isPair&&profile.studentTwo?` + ${profile.studentTwo}`:""}</strong><span>{profile.className} · Groupe {profile.groupName}</span>{overview.sessionId&&<span>Séance {overview.sessionId} · {overview.completed} exercice(s) déjà réussi(s)</span>}</div><button type="button" className="identity-submit" onClick={onResume}><History size={19}/><Copy fr="C’est moi, je reprends mon travail" ar="هذا ملفي، أستأنف عملي"/></button><button type="button" className="resume-other" onClick={onOther}><Copy fr="C’est un autre élève" ar="هذا ملف تلميذ آخر"/></button><p className="resume-device-note">Le bouton « autre élève » conserve le travail déjà sauvegardé sur ce poste.</p></section></main>;
}
