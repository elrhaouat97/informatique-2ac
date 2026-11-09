"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Minus, Square, Terminal, X } from "lucide-react";
import { publicAsset } from "../lib/public-assets";
import { Session3Text as Text } from "./session3-translation";
import { s4t as t } from "./session4-data";
import { runSession4Command, session4PeerIP, type Session4Draft } from "./session4-model";

const requiredCommands=["ipconfig","hostname",`ping ${session4PeerIP}`];
const prompt="C:\\Users\\Eleve>";

export function Session4CommandLab({draft,onChange,assessment=false}:{
  draft:Session4Draft;onChange:(patch:Partial<Session4Draft>)=>void;assessment?:boolean;
}){
  const input=useRef<HTMLInputElement>(null);
  const output=useRef<HTMLPreElement>(null);
  const [historyIndex,setHistoryIndex]=useState<number|null>(null);
  const history=draft.terminalHistory??draft.commands;
  useEffect(()=>{if(output.current)output.current.scrollTop=output.current.scrollHeight;},[draft.output]);

  function run(){
    const entered=draft.command.trim();
    if(!entered)return;
    const command=entered.toLowerCase().replace(/\s+/g," ");
    const result=runSession4Command(command,true);
    onChange({
      command:"",
      commands:requiredCommands.includes(command)?[...new Set([...draft.commands,command])]:draft.commands,
      terminalHistory:[...history,entered].slice(-40),
      output:command==="cls"?"":`${draft.output}\n${prompt}${entered}\n${result}\n`.slice(-18000),
      selections:{...draft.selections,commandRun:"yes"},
    });
    setHistoryIndex(null);
    input.current?.focus();
  }

  return <div className="s4-command-lab">
    <section className="s4-cmd-window" aria-label="Invite de commandes Windows simulée">
      <header><span><Terminal size={17} aria-hidden="true"/>Invite de commandes · PC-21</span>
        <span className="s4-cmd-decoration" aria-hidden="true"><Minus size={15}/><Square size={12}/><X size={15}/></span>
      </header>
      <div className="s4-cmd-screen" onClick={event=>{if(event.target===event.currentTarget)input.current?.focus();}}>
        <pre ref={output} role="log" aria-label="Résultats CMD" aria-live="polite">{draft.output}</pre>
        <form onSubmit={event=>{event.preventDefault();run();}}>
          <span aria-hidden="true">{prompt}</span>
          <input ref={input} aria-label="Commande CMD" value={draft.command} maxLength={100}
            autoComplete="off" autoCapitalize="none" spellCheck={false}
            onChange={event=>{setHistoryIndex(null);onChange({command:event.target.value});}}
            onKeyDown={event=>{
              if(event.key!=="ArrowUp"&&event.key!=="ArrowDown")return;
              if(!history.length)return;
              event.preventDefault();
              const next=event.key==="ArrowUp"
                ?Math.max(0,(historyIndex??history.length)-1)
                :Math.min(history.length,(historyIndex??history.length)+1);
              setHistoryIndex(next);
              onChange({command:history[next]??""});
            }}/>
        </form>
      </div>
      <p><Text value={t("Tape une commande, puis appuie sur Entrée. Les flèches ↑ et ↓ rappellent les commandes.","اكتب أمرًا ثم اضغط إدخال. يسترجع السهمان ↑ و↓ الأوامر السابقة.")}/></p>
    </section>
    <aside className="s4-command-ticket">
      <img src={publicAsset("session4/images/ordinateur-bureau.webp")} alt="PC-21 du réseau local"/>
      <h3><Text value={t("À faire dans CMD","المطلوب في CMD")}/></h3>
      {!assessment&&<ol>{requiredCommands.map(command=><li key={command}>
        {draft.commands.includes(command)?<CheckCircle2 size={17} aria-label="Commande exécutée"/>:<Terminal size={17} aria-hidden="true"/>}
        <code>{command}</code>
      </li>)}</ol>}
      <label><Text value={t("Adresse IPv4 lue","عنوان IPv4 المقروء")}/>
        <input aria-label="Adresse IPv4 relevée" value={draft.ip} maxLength={15} onChange={event=>onChange({ip:event.target.value})}/>
      </label>
      <label><Text value={t("Nom du PC lu","اسم الحاسوب المقروء")}/>
        <input aria-label="Nom du PC relevé" value={draft.host} maxLength={30} onChange={event=>onChange({host:event.target.value})}/>
      </label>
      <small><Text value={t("Simulation du réseau de la salle. Tape help pour afficher l’aide ou cls pour effacer l’écran.","محاكاة لشبكة القاعة. اكتب help لعرض المساعدة أو cls لمسح الشاشة.")}/></small>
    </aside>
  </div>;
}
