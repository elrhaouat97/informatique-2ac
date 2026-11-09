"use client";
import {useEffect,useRef,useState} from 'react';
import {Expand,Minimize,Network} from 'lucide-react';
import {publicAsset} from '../lib/public-assets';
import {Session3Text as Text} from './session3-translation';
import {isSession4SimulatorState,type Session4SimulatorMode,type Session4SimulatorState} from './session4-simulation-contract';
const channel='lab2ac-session4';
export default function Session4Simulator({mode,state,onChange}:{mode:Session4SimulatorMode;state:Session4SimulatorState|null;onChange:(state:Session4SimulatorState)=>void}){
 const frame=useRef<HTMLIFrameElement>(null),nonce=useRef(''),current=useRef(state),callback=useRef(onChange);
 const [height,setHeight]=useState(660),[expanded,setExpanded]=useState(false);
 current.current=state;callback.current=onChange;
 function initialize(){if(!nonce.current)return;frame.current?.contentWindow?.postMessage({channel,protocol:2,type:'init',nonce:nonce.current,mode,snapshot:current.current?.mode===mode?current.current.snapshot:null},'*');}
 useEffect(()=>{
  nonce.current=crypto.randomUUID();
  const receive=(event:MessageEvent)=>{
   if(event.source!==frame.current?.contentWindow||!event.data||event.data.channel!==channel||event.data.protocol!==2)return;
   const data=event.data;
   if(data.type==='ready'){initialize();return;}
   if(data.nonce!==nonce.current)return;
   if(data.type==='resize'&&Number.isFinite(data.height)){setHeight(Math.max(340,Math.min(1800,data.height)));return;}
   if(data.type==='state'&&data.mode===mode){
    const next={version:2,mode,checks:data.checks,completed:data.completed,snapshot:data.snapshot,evidence:data.evidence};
    if(isSession4SimulatorState(next,mode)&&JSON.stringify(next).length<210000)callback.current(next);
   }
  };
  window.addEventListener('message',receive);initialize();return()=>window.removeEventListener('message',receive);
 // The desktop is initialized once; edits update its durable snapshot without reloading the frame.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[mode]);
 useEffect(()=>{if(!expanded)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setExpanded(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[expanded]);
 const assessment=mode==='assessment';
 return <section className={`s4-simulator-shell ${expanded?'expanded':''}`} aria-label="Laboratoire réseau à deux postes">
  <header><span><Network size={18}/><Text value={assessment?{fr:'Simulateur Windows · PC-21 et PC-22',ar:'محاكي ويندوز · PC-21 وPC-22'}:{fr:'Laboratoire guidé',ar:'مختبر موجه'}}/></span><button type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}>{expanded?<Minimize size={17}/>:<Expand size={17}/>}<Text value={expanded?{fr:'Réduire',ar:'تصغير'}:{fr:'Agrandir le simulateur',ar:'تكبير المحاكي'}}/></button></header>
  <iframe ref={frame} title="Simulateur du réseau local et des échanges entre PC-21 et PC-22" src={publicAsset(`session4/simulateur/index.html?mode=${mode}&guide=${assessment?0:1}&v=eval-3`)} sandbox="allow-scripts allow-same-origin" onLoad={initialize} style={{height}}/>
  <p className="s4-help"><Text value={assessment?{fr:'Change de poste avec les boutons PC-21 et PC-22.',ar:'انتقل بين الحاسوبين باستعمال زري PC-21 وPC-22.'}:{fr:'Réalise le geste de l’étape, puis clique sur « Étape suivante ».',ar:'أنجز العملية المطلوبة ثم انقر «الخطوة التالية».'}}/></p>
 </section>;
}
