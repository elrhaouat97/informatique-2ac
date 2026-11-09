import {session4Equipment,type Session4Activity,type Session4LegacyActivity} from "./session4-data.ts";
import {isSession4SimulatorState,session4SimulatorSteps,type Session4SimulatorMode,type Session4SimulatorState} from './session4-simulation-contract.ts';
import { expoActivityChecks } from "./session4-expo-model.ts";
export const session4SourceIP="192.168.10.21",session4PeerIP="192.168.10.22";
export const session4SharePath=String.raw`\\192.168.10.21\Club_reseau`;
export type Session4Draft={savedAt?:number;videoPosition?:number;terminalHistory?:string[];selections:Record<string,string>;links:string[];internet:boolean;tested:boolean;delivered:boolean;connected:boolean;commands:string[];command:string;output:string;ip:string;host:string;shared:boolean;permission:string;path:string;opened:boolean;recipient:string;message:string;attached:boolean;checks:string[];peerIP:string;proof:string;practicalConfirmed:boolean;result:boolean|null;simulator:Session4SimulatorState|null};
export type Session4WorkshopState={version:1;activityIndex:number;activityId?:string;completedIds:string[];drafts:Record<string,Session4Draft>;summary:boolean};
export const freshSession4Draft=():Session4Draft=>({selections:{},links:[],internet:true,tested:false,delivered:false,connected:false,commands:[],command:"",output:"Microsoft Windows\nSimulation pédagogique du réseau local · PC-21\n",ip:"",host:"",shared:false,permission:"",path:"",opened:false,recipient:"",message:"",attached:false,checks:[],peerIP:"",proof:"",practicalConfirmed:false,result:null,simulator:null});
export function session4WorkshopDraft(activity:Session4Activity,drafts:Session4WorkshopState["drafts"]):Session4Draft {
 const previous=activity.previousId?drafts[activity.previousId]:undefined;
 const current=drafts[activity.id];
 return current?{...freshSession4Draft(),...current}:{...freshSession4Draft(),...previous,result:null};
}
// Keep the full two-PC disk in the checkpoint, and only the useful evidence in the teacher's answer.
export function session4AnswerState(d:Session4Draft){
 if(d.simulator)return {ip:d.ip,host:d.host,practicalConfirmed:d.practicalConfirmed,simulator:{version:d.simulator.version,mode:d.simulator.mode,checks:d.simulator.checks,completed:d.simulator.completed,evidence:d.simulator.evidence}};
 if(d.terminalHistory)return {ip:d.ip,host:d.host,commands:d.commands,terminalHistory:d.terminalHistory.slice(-12)};
 return d;
}
export function initialSession4Workshop(previous:unknown):Session4WorkshopState{
 if(validSession4Workshop(previous))return previous;
 const old=previous as {checked?:unknown[]}|null;
 return {version:1,activityIndex:0,completedIds:[...(old?.checked?.[0]===true?["session-4-workshop-A"]:[]),...(old?.checked?.[1]===true?["session-4-workshop-B"]:[])],drafts:{},summary:false};
}
export function validSession4Workshop(v:unknown):v is Session4WorkshopState{const s=v as Session4WorkshopState|null;return Boolean(s?.version===1&&Number.isSafeInteger(s.activityIndex)&&s.activityIndex>=0&&Array.isArray(s.completedIds)&&s.drafts&&typeof s.drafts==="object"&&typeof s.summary==="boolean")}
export function isPrivateIPv4(value:string){const parts=value.trim().split('.');if(parts.length!==4||parts.some(p=>!/^\d{1,3}$/.test(p)||Number(p)>255))return false;const [a,b]=parts.map(Number);return a===10||(a===172&&b>=16&&b<=31)||(a===192&&b===168)}
export function runSession4Command(command:string,connected:boolean){const c=command.trim().toLowerCase().replace(/\s+/g," ");if(c==="cls")return "";if(c==="help")return "IPCONFIG    Affiche la configuration réseau.\nHOSTNAME    Affiche le nom du poste.\nPING        Teste une adresse IP. Exemple : ping 192.168.10.22\nCLS         Efface l’écran.";if(c==="ping")return "Utilisation : ping adresse_IP\nExemple : ping 192.168.10.22";if(c==="hostname")return "PC-21";if(c==="ipconfig")return `Configuration IP de Windows\n\nCarte Ethernet :\n   Adresse IPv4 . . . . . . : ${session4SourceIP}\n   Masque de sous-réseau . . : 255.255.255.0\n   Passerelle par défaut . . : 192.168.10.1`;
 if(c===`ping ${session4PeerIP}`)return connected?`Envoi d’une requête 'Ping' sur ${session4PeerIP} :\n${Array(4).fill(`Réponse de ${session4PeerIP} : octets=32 temps<1ms TTL=128`).join("\n")}\nPaquets : envoyés = 4, reçus = 4, perdus = 0 (perte 0 %).`:`Envoi d’une requête 'Ping' sur ${session4PeerIP} :\nDélai d’attente de la demande dépassé.\nPaquets : envoyés = 4, reçus = 0, perdus = 4 (perte 100 %).`;
 return "Commande non prévue dans cet entraînement. Essaie ipconfig, hostname ou ping 192.168.10.22.";
}
function simulatorChecks(value: unknown, mode: Session4SimulatorMode): boolean[] {
  return isSession4SimulatorState(value, mode) ? value.checks : Array<boolean>(session4SimulatorSteps[mode]).fill(false);
}

function practiceChecks(draft: Session4Draft) {
  return [
    ...["source", "receive", "reverse", "return"].map(id => draft.checks.includes(id)),
    isPrivateIPv4(draft.ip),
    isPrivateIPv4(draft.peerIP) && draft.ip.trim() !== draft.peerIP.trim(),
    draft.proof.trim().length >= 3,
  ];
}

export function session4ActivityChecks(activity: Session4Activity | Session4LegacyActivity, draft: Session4Draft): boolean[] {
  if ("edition" in activity) return activity.kind === "practice" ? practiceChecks(draft) : expoActivityChecks(activity,draft);
  const selected = draft.selections;
  switch (activity.kind) {
    case "lan":
      return [!draft.internet, draft.delivered, selected.lan === "local"];
    case "cables":
      return [
        ...["PC-21", "PC-22", "PC-23", "Imprimante", "Portable", "Mac", "TV"].map(pc => draft.links.includes(pc)),
        draft.tested,
        ...["router", "switch", "ap"].map(id => selected[id] === id),
      ];
    case "equipment":
      return session4Equipment.map(item => selected[item.id] === item.answer);
    case "topology":
      return ["star", "bus", "ring"].map(id => selected[id] === id);
    case "identity":
      return [
        ...simulatorChecks(draft.simulator, "identity"),
        draft.ip.trim() === session4SourceIP,
        draft.host.trim().toUpperCase() === "PC-21",
      ];
    case "practice":
      return practiceChecks(draft);
    case "ping":
    case "sharing":
    case "messenger":
    case "repair":
      return simulatorChecks(draft.simulator, activity.kind);
  }
}

export function session4ActivityCorrect(activity: Session4Activity | Session4LegacyActivity, draft: Session4Draft): boolean {
  return session4ActivityChecks(activity, draft).every(Boolean);
}
