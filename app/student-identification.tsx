"use client";
import {useEffect,useId,useRef,useState} from "react";
import {ArrowRight,Check,History,LoaderCircle,User,Users,AlertTriangle,Search} from "lucide-react";
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
  <div ref={field} className="student-name-input"><Search size={16}/><input id={listId+"-input"} role="combobox" aria-label={label} aria-autocomplete="list" aria-expanded={open&&choices.length>0} aria-controls={listId} aria-describedby={helpId} aria-activedescendant={open&&choices[index]?`${listId}-${index}`:undefined} autoComplete="off" required maxLength={100} dir="auto" placeholder="اكتب اسمك…" value={value}
   onFocus={()=>{setOpen(true);setIndex(0)}} onBlur={()=>setOpen(false)}
   onChange={e=>{const exact=options.filter(s=>isSuggestibleStudentName(s.fullName)&&s.id!==exclude&&normalizeName(s.fullName)===normalizeName(e.target.value));onChange(e.target.value,exact.length===1?exact[0].id:undefined);setOpen(true);setIndex(0)}}
   onKeyDown={e=>{if(e.key==="Escape")setOpen(false);if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();keyboardNavigation.current=true;setOpen(true);setIndex(i=>(i+(e.key==="ArrowDown"?1:-1)+Math.max(1,choices.length))%Math.max(1,choices.length));}if(e.key==="Enter"&&open&&choices[index]){e.preventDefault();choose(choices[index])}}}/>{id&&<Check size={17} className="student-name-selected"/>}
   {open&&choices.length>0&&<ul id={listId} role="listbox" aria-label={fr} className={`student-name-suggestions ${placement.above?"above":"below"}`} style={{maxHeight:placement.height}}>{choices.map((s,i)=><li key={s.id} role="presentation"><button ref={i===index?activeOption:null} type="button" tabIndex={-1} role="option" aria-selected={id===s.id} id={`${listId}-${i}`} className={index===i?"highlighted":""} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(s)}><span dir="auto">{s.fullName}</span>{id===s.id&&<Check size={15}/>}</button></li>)}</ul>}
  </div>
  <small id={helpId} className="student-name-help">{open&&value.trim()&&!choices.length?"الاسم غير موجود في القائمة: تحقق من الكتابة أو اكتب اسمك كاملا.":matches.length>choices.length?"اكتب بعض الحروف للبحث.":"اختر اسمك أو اكتبه كاملا."}</small>
 </div>;
}

export function StudentIdentification({onReady}:{onReady:(p:StudentProfile)=>void}){
 const [isPair,setIsPair]=useState(true),[studentOne,setOne]=useState(""),[studentTwo,setTwo]=useState(""),[oneId,setOneId]=useState<string>(),[twoId,setTwoId]=useState<string>();
 const [className,setClass]=useState("2/1");const groupName="1";const [options,setOptions]=useState<Suggestion[]>([]),[fetching,setFetching]=useState(false),[submitting,setSubmitting]=useState(false),[error,setError]=useState("");
 useEffect(()=>{let alive=true;setFetching(true);setOptions([]);void rosterSuggestions(className,groupName).then(r=>{if(alive)setOptions(r.students.filter(s=>isSuggestibleStudentName(s.fullName)))}).catch(()=>{}).finally(()=>{if(alive)setFetching(false)});return()=>{alive=false}},[className]);
 async function submit(e:React.FormEvent){e.preventDefault();setError("");if(!isSuggestibleStudentName(studentOne)||(isPair&&!isSuggestibleStudentName(studentTwo))){setError("اكتب اسما كاملا صحيحا، دون أرقام أو رموز.");return;}if(isPair&&(oneId&&oneId===twoId||normalizeName(studentOne)===normalizeName(studentTwo))){setError("اختر تلميذين مختلفين.");return;}setSubmitting(true);try{const identity={studentOne,studentTwo:isPair?studentTwo:null,studentOneId:oneId,studentTwoId:isPair?twoId:null,className,groupName,isPair};const cached=cachedProfileFor(identity);const participant=cached??await registerParticipant(identity);rememberProfile(participant);onReady(participant);}catch(e){setError(e instanceof Error?e.message:"Identification impossible.")}finally{setSubmitting(false)}}
 function changeClass(value:string){setClass(value);setOne("");setTwo("");setOneId(undefined);setTwoId(undefined)}
 return <main className="identity-gate"><section className="identity-card" aria-labelledby="identity-title"><div className="identity-brand"><span className="brand-symbol">//</span><span><strong>LAB·2AC</strong><small>INFORMATIQUE</small></span></div><div className="identity-heading"><span className="identity-kicker"><Users size={16}/>تعريف التلاميذ · Identification</span><h1 id="identity-title"><Copy fr="قبل أن نبدأ" ar="Avant de commencer"/></h1><p><Copy fr="اختر قسمك واكتب اسمك — وسيُحفظ عملك تلقائيا" ar="Choisis ta classe et écris ton nom."/></p></div><form className="identity-form" onSubmit={submit}>
 <div className="class-picker"><span className="entry-label">اختر قسمك <small>Ta classe</small></span><div className="class-chips">{["2/1","2/2","2/3","2/4","2/5","3/1","3/2","3/3","3/4"].map(c=><button type="button" key={c} className={className===c?"chip active":"chip"} aria-pressed={className===c} onClick={()=>changeClass(c)}>{c}</button>)}</div></div>
 <div className="mode-cards"><button type="button" className={isPair?"mode-card active":"mode-card"} aria-pressed={isPair} onClick={()=>setIsPair(true)}><Users size={27}/><strong>نشتغل في ثنائي</strong><small>Avec un ami · مع صديقي</small></button><button type="button" className={!isPair?"mode-card active":"mode-card"} aria-pressed={!isPair} onClick={()=>setIsPair(false)}><User size={27}/><strong>أشتغل وحدي</strong><small>Tout seul · بوحدي</small></button></div>
 <p className="identity-roster-help">{fetching?<><LoaderCircle size={14} className="spin"/>جارٍ تحميل الأسماء…</>:options.length?"اختر اسمك من الاقتراحات أو اكتبه كاملا." : "اكتب اسمك الكامل."}</p>
 <div className={`student-name-grid ${isPair?"pair":"solo"}`}><NamePicker label={isPair?"الاسم الكامل للتلميذ الأول · Élève 1":"الاسم الكامل · Nom complet"} value={studentOne} id={oneId} options={options} exclude={twoId} onChange={(name,id)=>{setOne(name);setOneId(id)}}/>{isPair&&<NamePicker label="الاسم الكامل للتلميذ الثاني · Élève 2" value={studentTwo} id={twoId} options={options} exclude={oneId} onChange={(name,id)=>{setTwo(name);setTwoId(id)}}/>}</div>
 {error&&<div className="identity-error" role="alert"><AlertTriangle size={17}/>{error}</div>}<button type="submit" className="identity-submit" disabled={submitting}>{submitting?<LoaderCircle size={19} className="spin"/>:<ArrowRight size={19}/>}<Copy fr={submitting?"جارٍ البحث عن ملفك…":"ابدأ العمل"} ar={submitting?"Recherche…":"Entrer"}/></button></form></section></main>;
}

export function ResumeStudent({profile,onResume,onOther}:{profile:StudentProfile;onResume:()=>void;onOther:()=>void}){
 const overview=resumeOverview(profile.id);
 return <main className="identity-gate"><section className="identity-card student-resume-card"><span className="resume-symbol"><History size={28}/></span><span className="identity-kicker">REPRISE DU TRAVAIL · استئناف العمل</span><h1>Ton travail est conservé<small lang="ar" dir="rtl">عملك محفوظ</small></h1><p>Vérifie que ce dossier est bien le tien avant de continuer.</p><div className="resume-identity"><strong>{profile.studentOne}{profile.isPair&&profile.studentTwo?` + ${profile.studentTwo}`:""}</strong><span>القسم {profile.className}</span>{overview.sessionId&&<span>Séance {overview.sessionId} · {overview.completed} exercice(s) déjà réussi(s)</span>}</div><button type="button" className="identity-submit" onClick={onResume}><History size={19}/><Copy fr="C’est moi, je reprends mon travail" ar="هذا ملفي، أستأنف عملي"/></button><button type="button" className="resume-other" onClick={onOther}><Copy fr="C’est un autre élève" ar="هذا ملف تلميذ آخر"/></button><p className="resume-device-note">Le bouton « autre élève » conserve le travail déjà sauvegardé sur ce poste.</p></section></main>;
}
