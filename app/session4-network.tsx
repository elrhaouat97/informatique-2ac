"use client";
import {useState} from 'react';
import {CloudOff,Globe2,Wifi,Send} from 'lucide-react';
import {publicAsset} from '../lib/public-assets';
import {Session3Text as Text} from './session3-translation';
import {s4t as t} from './session4-data';
import type {Session4Draft} from './session4-model';
export const session4Nodes=[
 {id:'PC-21',name:'PC-21',asset:'ordinateur-bureau',x:12,y:81,wireless:false},
 {id:'PC-22',name:'PC-22',asset:'ordinateur-bureau',x:36,y:81,wireless:false},
 {id:'PC-23',name:'PC-23',asset:'ordinateur-bureau',x:60,y:81,wireless:false},
 {id:'Imprimante',name:'Imprimante',asset:'imprimante',x:10,y:46,wireless:false},
 {id:'Portable',name:'Portable Windows',asset:'portable-windows',x:89,y:35,wireless:true},
 {id:'Mac',name:'Portable macOS',asset:'portable-mac',x:89,y:58,wireless:true},
 {id:'TV',name:'Smart TV',asset:'smart-tv',x:87,y:82,wireless:true},
];
const devices=[{id:'router',name:t('Routeur','موجه'),asset:'routeur',x:36,y:13,role:t('Relier le LAN à un autre réseau','ربط الشبكة المحلية بشبكة أخرى')},{id:'switch',name:t('Commutateur','مبدل'),asset:'commutateur',x:38,y:45,role:t('Relier les appareils par câble','ربط الأجهزة بالكابل')},{id:'ap',name:t('Point d’accès','نقطة ولوج'),asset:'point-acces',x:70,y:13,role:t('Accueillir les appareils Wi-Fi','استقبال أجهزة Wi-Fi')}];
type Props={links?:string[];placements?:Record<string,string>;onPlace?:(slot:string,id:string)=>void;onToggle?:(id:string)=>void;delivered?:boolean;internet?:boolean;picked?:string};
export function Session4Network({links=session4Nodes.map(n=>n.id),placements={router:'router',switch:'switch',ap:'ap'},onPlace,onToggle,delivered=false,internet=false,picked}:Props){
 const equipmentReady=(id:string)=>placements[id]===id;
 return <div className="s4-photo-network" aria-label="Schéma du réseau local avec les images du matériel"><div className="s4-photo-canvas">
  <svg className="s4-photo-wires" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
   <path d="M90 78H360" className={internet&&equipmentReady('router')?'on':'off'}/>
   <path d="M360 78L380 270M360 78H700" className={equipmentReady('router')&&equipmentReady('switch')&&equipmentReady('ap')?'on':'off'}/>
   {session4Nodes.map(n=><path key={n.id} d={`M${n.wireless?700:380} ${n.wireless?78:270}L${n.x*10} ${n.y*6}`} className={`${n.wireless?'wireless ':''}${links.includes(n.id)&&equipmentReady(n.wireless?'ap':'switch')?'on':'off'}`}/>)}
   {delivered&&<circle r="7" fill="#e0ad25"><animateMotion dur="2s" repeatCount="2" path="M120 486L380 270L360 486"/></circle>}
  </svg>
  <span className="s4-plan-internet" style={{left:'9%',top:'13%'}}>{internet?<Globe2 size={37}/>:<CloudOff size={37}/>}<strong>Internet</strong><small>{internet?'Disponible':'Coupé'}</small></span>
  {devices.map(slot=>{const chosen=devices.find(d=>d.id===placements[slot.id]);return <button type="button" key={slot.id} className={`s4-plan-equipment ${chosen?'filled':'empty'} ${picked?'can-place':''}`} style={{left:`${slot.x}%`,top:`${slot.y}%`}} aria-label={`Emplacement : ${slot.role.fr}`} disabled={!onPlace} onClick={()=>picked&&onPlace?.(slot.id,picked)} onDragOver={e=>onPlace&&e.preventDefault()} onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData('text/plain');if(devices.some(d=>d.id===id))onPlace?.(slot.id,id);}}>
   {chosen?<><img src={publicAsset(`session4/images/${chosen.asset}.webp`)} alt={chosen.name.fr}/><strong><Text value={chosen.name}/></strong>{slot.id==='ap'&&<small>Mode point d’accès</small>}</>:<><span>+</span><Text value={slot.role}/></>}
  </button>})}
  {session4Nodes.map(n=><button type="button" className={`s4-plan-device ${links.includes(n.id)?'connected':''}`} key={n.id} style={{left:`${n.x}%`,top:`${n.y}%`}} disabled={!onToggle} onClick={()=>onToggle?.(n.id)} aria-pressed={onToggle?links.includes(n.id):undefined} aria-label={`${n.name} · ${links.includes(n.id)?'connecté':'à connecter'}`}><img src={publicAsset(`session4/images/${n.asset}.webp`)} alt={n.name}/><strong>{n.name}</strong><small>{n.wireless?'Wi-Fi':'RJ45'} · {links.includes(n.id)?'connecté':'non connecté'}</small></button>)}
 </div><p className="s4-network-legend"><span>━━ Câble RJ45</span><span>┄┄ Liaison Wi-Fi</span><span><Text value={t('Le réseau local continue sans Internet.','تستمر الشبكة المحلية دون الإنترنت.')}/></span></p></div>;
}
export function Session4NetworkBuilder({draft:d,onChange}:{draft:Session4Draft;onChange:(patch:Partial<Session4Draft>)=>void}){
 const [picked,setPicked]=useState(''),[tool,setTool]=useState<'wired'|'wifi'>('wired'),[hint,setHint]=useState('');
 const toggle=(id:string)=>{const node=session4Nodes.find(n=>n.id===id)!;if(node.wireless!==(tool==='wifi')){setHint(node.wireless?'Cet appareil utilise le Wi-Fi dans ce schéma. Choisis l’outil Wi-Fi.':'Ce poste utilise un câble RJ45 dans ce schéma. Choisis le câble.');return;}setHint('');onChange({links:d.links.includes(id)?d.links.filter(x=>x!==id):[...d.links,id],tested:false,delivered:false});};
 const ready=session4Nodes.every(n=>d.links.includes(n.id))&&devices.every(slot=>d.selections[slot.id]===slot.id);
 return <><div className="s4-equipment-tray" aria-label="Équipements à placer">{devices.map(device=><button type="button" key={device.id} draggable onDragStart={e=>{e.dataTransfer.setData('text/plain',device.id);setPicked(device.id);}} aria-pressed={picked===device.id} onClick={()=>setPicked(device.id)}><img src={publicAsset(`session4/images/${device.asset}.webp`)} alt=""/><Text value={device.name}/></button>)}</div><p className="s4-help"><Text value={t('Glisse une image dans son emplacement, ou clique sur l’image puis sur l’emplacement.','اسحب الصورة إلى مكانها أو انقر الصورة ثم مكانها.')}/></p>
  <div className="s4-connection-tools"><strong><Text value={t('Outil de connexion :','أداة الربط:')}/></strong><button type="button" aria-pressed={tool==='wired'} onClick={()=>{setTool('wired');setPicked('');}}><img src={publicAsset('session4/images/cable-rj45.webp')} alt=""/> Câble RJ45</button><button type="button" aria-pressed={tool==='wifi'} onClick={()=>{setTool('wifi');setPicked('');}}><Wifi size={22}/> Wi-Fi</button></div>
  <Session4Network placements={d.selections} links={d.links} picked={picked} onPlace={(slot,id)=>{onChange({selections:{...d.selections,[slot]:id},tested:false,delivered:false});setPicked('');}} onToggle={toggle} delivered={d.delivered}/>
  {hint&&<p role="status" className="s4-help">{hint}</p>}<button type="button" className="s4-primary" onClick={()=>onChange({tested:true,delivered:ready})}><Send size={18}/><Text value={t('Tester mon réseau','اختبار شبكتي')}/></button>
  {d.tested&&<p role="status" className={ready?'s4-success-inline':'s4-help'}><Text value={ready?t('Les équipements sont placés et les sept appareils sont reliés. Le LAN fonctionne sans Internet.','وضعت الأجهزة وربطت الأجهزة السبعة. تعمل الشبكة المحلية دون الإنترنت.'):t('Vérifie les trois équipements et la connexion de chaque appareil. Les pointillés gris indiquent une liaison manquante.','تحقق من الأجهزة الثلاثة ومن اتصال كل جهاز. تشير الخطوط الرمادية المتقطعة إلى رابط مفقود.')}/></p>}
 </>;
}
