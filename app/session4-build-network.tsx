"use client";

import {useState} from "react";
import {Cable,CheckCircle2,Wifi,X} from "lucide-react";
import {publicAsset} from "../lib/public-assets";
import {Session3Text as Text} from "./session3-translation";
import {s4t as t} from "./session4-data";
import type {Session4Draft} from "./session4-model";
import {DirectSwitchScene,type SwitchEndpoint} from "./session4-expo-network";
import {expoBuildPortKey,expoBuildStatus,expoPatchPorts,expoSSID} from "./session4-expo-model";

type Props={draft:Session4Draft;onChange:(patch:Partial<Session4Draft>)=>void;assessment?:boolean};
const image=(name:string)=>`session4/images/${name}.webp`;
const wifiNames=[expoSSID,"SALLE-PROFS","INVITES"];

export function Session4BuildNetwork({draft,onChange,assessment=false}:Props){
  const [selected,setSelected]=useState("");
  const [notice,setNotice]=useState<ReturnType<typeof t>|null>(null);
  const s=draft.selections,status=expoBuildStatus(draft);
  const endpoints:SwitchEndpoint[]=[
    {id:"pc21",name:"PC-21",x:18},
    {id:"pc22",name:"PC-22",x:50},
    {id:"ap",name:"Point d’accès",x:82,image:image("point-acces"),installed:status.accessPoint},
  ];
  const ports=Object.fromEntries(endpoints.map(item=>[item.id,s[expoBuildPortKey(item.id)]]));
  const wiredTested=draft.checks.includes("build-wired-tested")&&status.wired;
  const mixedTested=draft.checks.includes("build-mixed-tested")&&status.mixed;

  function changeSelection(key:string,value:string){
    onChange({selections:{...s,[key]:value},checks:[],tested:false,delivered:false});
    setNotice(null);
  }
  function connect(port:string){
    if(!selected){setNotice(t("Clique sur la prise d’un appareil, puis sur un port libre du switch.","انقر على منفذ جهاز ثم على منفذ شاغر في المبدل."));return;}
    if(endpoints.some(item=>item.id!==selected&&ports[item.id]===port)){
      setNotice(t("Ce port est occupé. Choisis une autre prise du switch.","هذا المنفذ مستعمل. اختر منفذًا آخر في المبدل."));return;
    }
    changeSelection(expoBuildPortKey(selected),port);
    setSelected("");
  }
  function test(){
    onChange({tested:true,delivered:status.mixed,checks:[
      ...(status.wired?["build-wired-tested"]:[]),
      ...(status.mixed?["build-mixed-tested"]:[]),
    ]});
    setNotice(null);
  }
  function task(number:number,label:ReturnType<typeof t>,done:boolean){
    return <h3 className="s4-build-task" data-done={done}><span>{done?<CheckCircle2 size={21}/>:number}</span><Text value={label}/></h3>;
  }
  return <div className="s4-build-network">
    {!assessment&&<figure className="s4-build-situation"><img src={publicAsset("session4/images/salle-reseau-club.webp")} alt="Illustration de la salle du club avant le branchement : deux PC, un portable et du matériel réseau."/>
      <figcaption><Text value={t("Ta mission : les deux PC utilisent des câbles ; le portable reste sans câble. Aucun accès à Internet n’est nécessaire.","مهمتك: يستعمل الحاسوبان كابلين، ويبقى المحمول دون كابل. لا حاجة إلى الإنترنت.")}/></figcaption>
    </figure>}

    <section aria-label="Matériel disponible">
      {task(1,t("Installe les équipements du réseau","ثبّت أجهزة الشبكة"),status.installed&&status.accessPoint)}
      <p><Text value={t("Clique sur « Installer » pour placer le switch et le point d’accès dans ton plan.","انقر على «تثبيت» لوضع المبدل ونقطة الولوج في مخططك.")}/></p>
      <div className="s4-build-stock">
        {([{id:"switch",title:t("1 switch","مبدل واحد"),photo:"commutateur"},{id:"ap",title:t("1 point d’accès","نقطة ولوج واحدة"),photo:"point-acces"}]).map(item=>{
          const installed=s[`build-${item.id}`]===item.id;
          return <article key={item.id}><img src={publicAsset(image(item.photo))} alt=""/><strong><Text value={item.title}/></strong>
            <button type="button" disabled={installed} onClick={()=>changeSelection(`build-${item.id}`,item.id)}>
              {installed&&<CheckCircle2 size={16}/>}<Text value={installed?t("Installé","مثبّت"):t("Installer","تثبيت")}/>
            </button></article>;
        })}
        <article><img src={publicAsset(image("cable-rj45"))} alt=""/><strong><Text value={t("3 câbles RJ45","3 كابلات RJ45")}/></strong><small><Text value={t("Prêts à brancher","جاهزة للتوصيل")}/></small></article>
        <article><img src={publicAsset(image("carte-ethernet"))} alt=""/><strong><Text value={t("2 cartes Ethernet","بطاقتا Ethernet")}/></strong><small><Text value={t("Déjà dans les PC","مثبتتان في الحاسوبين")}/></small></article>
        <article><img src={publicAsset("session4/images/carte-wifi.jpg")} alt=""/><strong><Text value={t("1 carte Wi-Fi","بطاقة Wi-Fi واحدة")}/></strong><small><Text value={t("Déjà dans le portable","مثبتة في المحمول")}/></small></article>
      </div>
    </section>

    <section aria-label="Branchement des trois câbles">
      {task(2,t("Branche les trois câbles","أوصل الكابلات الثلاثة"),status.wired&&status.uplink)}
      <p><Text value={t("Relie PC-21, PC-22 et le point d’accès à trois ports différents du switch. Clique sur la prise de l’appareil, puis sur une prise de la photo du switch.","اربط PC-21 وPC-22 ونقطة الولوج بثلاثة منافذ مختلفة في المبدل. انقر على منفذ الجهاز ثم على منفذ في صورة المبدل.")}/></p>
      <p className="s4-switch-instruction" role="status"><Cable size={20}/><Text value={notice??(selected?t("Choisis maintenant un port libre sur la photo du switch.","اختر الآن منفذًا شاغرًا في صورة المبدل."):t("Choisis la prise RJ45 d’un appareil.","اختر منفذ RJ45 لأحد الأجهزة."))}/></p>
      <DirectSwitchScene endpoints={endpoints} ports={ports} selected={selected} installed={status.installed} connected={mixedTested}
        onPort={connect} onSelect={id=>{setSelected(selected===id?"":id);setNotice(null);}}/>
      <div className="expo-cables">{endpoints.filter(item=>expoPatchPorts.includes(ports[item.id])).map(item=><button type="button" key={item.id}
        aria-label={`Débrancher ${item.name}`} onClick={()=>{changeSelection(expoBuildPortKey(item.id),"");setSelected("");}}>
        <X size={14}/>{item.name} · <Text value={t(`port ${ports[item.id]}`,`المنفذ ${ports[item.id]}`)}/>
      </button>)}</div>
    </section>

    <section aria-label="Connexion du portable au Wi-Fi">
      {task(3,t("Connecte le portable au Wi-Fi","أوصل المحمول بشبكة Wi-Fi"),status.wifi)}
      <p><Text value={t("Choisis CLUB-EXPO sur le point d’accès, puis le même réseau sur le portable. Le portable n’a pas besoin de câble.","اختر CLUB-EXPO في نقطة الولوج، ثم الشبكة نفسها في المحمول. لا يحتاج المحمول إلى كابل.")}/></p>
      <div className="s4-build-wireless">
        <label><img src={publicAsset(image("point-acces"))} alt=""/><strong><Text value={t("Wi-Fi du point d’accès","Wi-Fi نقطة الولوج")}/></strong>
          <select aria-label="Wi-Fi du point d’accès" disabled={!status.accessPoint} value={s["build-ssid"]??""} onChange={event=>changeSelection("build-ssid",event.target.value)}>
            <option value="">Choisir…</option>{wifiNames.map(name=><option key={name}>{name}</option>)}
          </select>{!status.accessPoint&&<small><Text value={t("Installe d’abord le point d’accès.","ثبّت نقطة الولوج أولًا.")}/></small>}
        </label>
        <div className="s4-build-wifi-link" data-connected={status.wifi} aria-hidden="true"><Wifi size={28}/><span/></div>
        <label><img src={publicAsset(image("portable-windows"))} alt=""/><strong><Text value={t("Wi-Fi du portable","Wi-Fi المحمول")}/></strong>
          <select aria-label="Wi-Fi du portable" value={s["build-laptop"]??""} onChange={event=>changeSelection("build-laptop",event.target.value)}>
            <option value="">Choisir…</option>{wifiNames.map(name=><option key={name}>{name}</option>)}
          </select>
        </label>
      </div>
    </section>

    <section aria-label="Test du réseau construit">
      {task(4,t("Teste ton réseau","اختبر شبكتك"),mixedTested)}
      <button type="button" className="s4-primary" onClick={test}><Cable size={18}/><Text value={t("Tester mon réseau","اختبار شبكتي")}/></button>
      {draft.tested&&<div className="s4-build-results" role="status">
        <p data-good={wiredTested}><strong><Text value={t("PC-21 ↔ PC-22 · Filaire","PC-21 ↔ PC-22 · سلكي")}/></strong><Text value={wiredTested?t("Connexion réussie","تم الاتصال"):t("Vérifie les deux câbles et le switch.","تحقق من الكابلين والمبدل.")}/></p>
        <p data-good={mixedTested}><strong><Text value={t("PC-21 ↔ Portable · Mixte","PC-21 ↔ المحمول · مختلط")}/></strong><Text value={mixedTested?t("Connexion réussie","تم الاتصال"):!status.accessPoint?t("Installe le point d’accès.","ثبّت نقطة الولوج."):!status.uplink?t("Branche le point d’accès sur un port libre du switch.","أوصل نقطة الولوج بمنفذ شاغر في المبدل."):!status.wifi?t("Choisis CLUB-EXPO sur les deux appareils Wi-Fi.","اختر CLUB-EXPO في جهازي Wi-Fi."):t("Vérifie les câbles des PC.","تحقق من كابلي الحاسوبين.")}/></p>
      </div>}
    </section>
  </div>;
}
