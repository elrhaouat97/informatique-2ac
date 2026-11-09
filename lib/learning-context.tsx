"use client";
import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode,type SetStateAction} from "react";
import {CheckCircle2,Cloud,CloudOff,LoaderCircle,AlertTriangle} from "lucide-react";
import {openLearnerSession,loadLearningState,saveLearningState,type StudentProfile} from "./supabase-api";
import {acceptRemote,learningChangedEvent,learningRestoredEvent,markSnapshotSynced,readSnapshot,rememberProfile,restoreVerifiedProgress,saveSnapshot,snapshotsFor,type LearningKind,type LearningSnapshot} from "./learning-storage";
type Status="local"|"syncing"|"saved"|"pending"|"storage-error";
const Context=createContext({ready:true,status:"local" as Status,resumeToken:undefined as string|undefined});

export function LearningProvider({profile,disabled=false,onProfileUpdate,children}:{profile:StudentProfile;disabled?:boolean;onProfileUpdate:(p:StudentProfile)=>void;children:ReactNode}){
 const [ready,setReady]=useState(disabled),[status,setStatus]=useState<Status>("local");
 const profileRef=useRef(profile),callbackRef=useRef(onProfileUpdate);profileRef.current=profile;callbackRef.current=onProfileUpdate;
 useEffect(()=>{
  let alive=true,busy=false,connecting=false,connected=false,timer:ReturnType<typeof setTimeout>|null=null;
  if(disabled){setReady(true);return;}
  const updateStatus=(s:Status)=>{if(alive)setStatus(s)};
  async function connect(){if(connecting||!alive)return;connecting=true;try{updateStatus("syncing");if(navigator.onLine===false)throw new Error("offline");const authenticated=profileRef.current.resumeToken?profileRef.current:await openLearnerSession(profileRef.current);if(!alive)return;profileRef.current=authenticated;rememberProfile(authenticated);callbackRef.current(authenticated);const restored=await loadLearningState(authenticated.resumeToken!);if(!alive)return;for(const checkpoint of restored.checkpoints)acceptRemote(checkpoint);for(const progress of restored.progress)restoreVerifiedProgress(profile.id,progress.sessionId,progress.completedIds);connected=true;updateStatus("saved");}catch(error){connected=false;if((error as Error&{status?:number}).status===401)profileRef.current={...profileRef.current,resumeToken:undefined};updateStatus("pending");}finally{connecting=false;if(alive){setReady(true);schedule(connected?0:10000);}}}
  async function flush(keepalive=false){if(busy||!alive)return;if(!connected){await connect();return;}const token=profileRef.current.resumeToken;if(!token){connected=false;await connect();return;}busy=true;
   try{const queue=snapshotsFor(profile.id).filter(s=>s.dirty).sort((a,b)=>b.changedAt-a.changedAt);if(queue.length)updateStatus("syncing");for(const snapshot of queue){if(!alive)break;try{const result=await saveLearningState(token,snapshot,keepalive&&new TextEncoder().encode(JSON.stringify(snapshot)).length<60000);markSnapshotSynced(snapshot,result.revision);}catch(error){const conflict=(error as Error&{data?:{checkpoint?:LearningSnapshot}}).data?.checkpoint;if(conflict){acceptRemote(conflict);continue;}throw error;}}if(alive)updateStatus(snapshotsFor(profile.id).some(s=>s.dirty)?"pending":"saved");}
   catch(error){if((error as Error&{status?:number}).status===401)connected=false;updateStatus("pending");}finally{busy=false;if(alive&&snapshotsFor(profile.id).some(s=>s.dirty))schedule(5000);}
  }
  function schedule(delay=900){if(timer)clearTimeout(timer);timer=setTimeout(()=>void flush(),delay);}
  function changed(event:Event){const detail=(event as CustomEvent).detail;if(detail?.storageError){updateStatus("storage-error");return;}if(detail?.participantId===profile.id)schedule();}
  function online(){schedule(0)}
  function hidden(){if(document.visibilityState==="hidden")void flush(true)}
  window.addEventListener(learningChangedEvent,changed);window.addEventListener("online",online);document.addEventListener("visibilitychange",hidden);
  void connect();
  return()=>{alive=false;if(timer)clearTimeout(timer);window.removeEventListener(learningChangedEvent,changed);window.removeEventListener("online",online);document.removeEventListener("visibilitychange",hidden)};
 },[profile.id,disabled]);
 return <Context.Provider value={{ready,status,resumeToken:disabled?undefined:profile.resumeToken}}>{children}</Context.Provider>;
}

export function useLearnerResumeToken(){return useContext(Context).resumeToken;}

/** Every user change reaches localStorage synchronously, before a tab can be closed. */
export function useDurableLessonState<T extends object>({participantId,sessionId,kind,initial,validate}:{participantId:string;sessionId:number;kind:LearningKind;initial:T;validate:(value:unknown)=>value is T}){
 const context=useContext(Context),key=`${participantId}:${sessionId}:${kind}`;
 const refs=useRef({initial,validate,value:initial});refs.current.validate=validate;
 const [value,setRaw]=useState<T>(initial),[ready,setReady]=useState(false),[restored,setRestored]=useState(false);
 useEffect(()=>{const cached=readSnapshot(participantId,sessionId,kind);if(cached&&refs.current.validate(cached.data)){refs.current.value=cached.data;setRaw(cached.data);setReady(true);setRestored(true);}else if(context.ready){refs.current.value=refs.current.initial;setRaw(refs.current.initial);setReady(true);}},[key,context.ready,participantId,sessionId,kind]);
 useEffect(()=>{function restoredState(event:Event){const s=(event as CustomEvent<LearningSnapshot>).detail;if(s?.participantId!==participantId||s.sessionId!==sessionId||s.kind!==kind||!refs.current.validate(s.data))return;if(JSON.stringify(s.data)!==JSON.stringify(refs.current.value)){refs.current.value=s.data;setRaw(s.data);}setReady(true);setRestored(true)}window.addEventListener(learningRestoredEvent,restoredState);return()=>window.removeEventListener(learningRestoredEvent,restoredState)},[key,participantId,sessionId,kind]);
 const setValue=useCallback((next:SetStateAction<T>)=>{const updated=typeof next==="function"?(next as (v:T)=>T)(refs.current.value):next;if(updated===refs.current.value)return;refs.current.value=updated;saveSnapshot(participantId,sessionId,kind,updated);setRaw(updated);},[key,participantId,sessionId,kind]);
 return {value,setValue,ready:ready&&context.ready,restored};
}

export function LearningSaveBadge(){const {status}=useContext(Context);const Icon=status==="syncing"?LoaderCircle:status==="saved"?CheckCircle2:status==="pending"?CloudOff:status==="storage-error"?AlertTriangle:Cloud;const text=status==="saved"?"Travail sauvegardé sur ce poste et sur le serveur":status==="syncing"?"Sauvegarde en cours…":status==="pending"?"Travail conservé sur ce poste · envoi au serveur en attente":status==="storage-error"?"Sauvegarde locale indisponible · garde cette page ouverte":"Sauvegarde automatique de ton travail";return <p className={`learning-save-badge ${status}`} role="status"><Icon size={15} className={status==="syncing"?"spin":""}/>{text}</p>}
