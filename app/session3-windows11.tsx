"use client";

import { publicAsset } from "../lib/public-assets";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowLeft, ArrowUp, Calculator, Check, ChevronRight, Clipboard, Copy, Download, FileImage, FileText, Folder, FolderPlus, Home, Maximize2, Minimize2, Minus, MoreHorizontal, Music2, Pencil, Play, RotateCcw, Save, Scissors, Search, Trash2, Video, Volume2, Wifi, X } from "lucide-react";
import { Session3Text as Text } from "./session3-translation";
import type { LocalizedText } from "./course-data";
import { calculateExpression, createWindowsState, descendants, isTrashed, isWindowsState, pathFor, windowsCriteria, windowsEvidence, windowsReducer, type VirtualFile, type WindowsApp, type WindowsMode, type WindowsState } from "./session3-windows-model";
import "./session3-windows11.css";

const t=(fr:string,ar:string):LocalizedText=>({fr,ar});
const appNames:Record<WindowsApp,LocalizedText>={explorer:t("Explorateur de fichiers","مستكشف الملفات"),calculator:t("Calculatrice","الحاسبة"),notepad:t("Bloc-notes","المفكرة")};
const folderNames:Record<string,LocalizedText>={home:t("Accueil","الرئيسية"),desktop:t("Bureau","سطح المكتب"),documents:t("Documents","المستندات"),images:t("Images","الصور"),downloads:t("Téléchargements","التنزيلات"),trash:t("Corbeille","سلة المحذوفات")};
const modeTitles:Record<WindowsMode,LocalizedText>={desktop:t("Prends les commandes du Bureau","تحكم في سطح المكتب"),copy:t("Une photo pour la publication du club","صورة لمنشور النادي"),move:t("Un enregistrement prêt pour la radio","تسجيل جاهز للإذاعة"),restore:t("Le document disparu","الوثيقة المختفية"),rename:t("Un nom utile pour l’affiche","اسم مفيد للملصق"),project:t("Prépare le dossier de l’exposition","أعد مجلد المعرض"),assessment:t("Le dossier à remettre","المجلد المطلوب تسليمه")};
type DialogState={kind:"folder"|"rename"|"save"|"reset";id?:string}|null;

export function WindowsMark(){return <span className="w11-mark" aria-hidden="true"><i/><i/><i/><i/></span>}
function FileIcon({file,size=24}:{file:VirtualFile;size?:number}){return file.kind==="folder"?<Folder size={size} className="w11-folder-icon"/>:file.kind==="image"?<FileImage size={size} className="w11-image-icon"/>:file.kind==="audio"?<Music2 size={size} className="w11-audio-icon"/>:file.kind==="video"?<Video size={size} className="w11-video-icon"/>:<FileText size={size} className="w11-text-icon"/>}
function AppIcon({app,size=22}:{app:WindowsApp;size?:number}){return app==="calculator"?<Calculator size={size} className="w11-calculator-icon"/>:app==="explorer"?<Folder size={size} className="w11-folder-icon"/>:<FileText size={size} className="w11-text-icon"/>}

export function Session3Windows11({mode,initialState,onStateChange,onValidate,assessment=false,disabled=false}:{mode:WindowsMode;initialState?:WindowsState;onStateChange?:(s:WindowsState)=>void;onValidate?:(answer:ReturnType<typeof windowsEvidence>,checks:boolean[])=>void;assessment?:boolean;disabled?:boolean}){
  const [state,setState]=useState(()=>isWindowsState(initialState,mode)?initialState:createWindowsState(mode));
  const [startOpen,setStartOpen]=useState(false),[startSearch,setStartSearch]=useState("");
  const [search,setSearch]=useState("");
  const [dialog,setDialog]=useState<DialogState>(null),[name,setName]=useState("");
  const [preview,setPreview]=useState<VirtualFile|null>(null);
  const [context,setContext]=useState<{id:string|null;x:number;y:number}|null>(null);
  const [expression,setExpression]=useState(""),[calculation,setCalculation]=useState("0"),[calcHistory,setCalcHistory]=useState("");
  const [noteText,setNoteText]=useState("");
  const [showMissions,setShowMissions]=useState(true);
  const [clock,setClock]=useState("");
  const surfaceRef=useRef<HTMLDivElement>(null),nameRef=useRef<HTMLInputElement>(null);
  const dragging=useRef<{app:WindowsApp;x:number;y:number;left:number;top:number}|null>(null);
  const latestState=useRef(state);latestState.current=state;
  const onChangeRef=useRef(onStateChange);onChangeRef.current=onStateChange;
  const dispatch=useCallback((action:Parameters<typeof windowsReducer>[1])=>{const next=windowsReducer(latestState.current,action);latestState.current=next;onChangeRef.current?.(next);setState(next)},[]);
  useEffect(()=>{const tick=()=>setClock(new Intl.DateTimeFormat("fr-MA",{hour:"2-digit",minute:"2-digit",timeZone:"Africa/Casablanca"}).format(new Date()));tick();const id=window.setInterval(tick,60000);return()=>window.clearInterval(id)},[]);
  useEffect(()=>{if(dialog&&dialog.kind!=="reset"){nameRef.current?.focus();nameRef.current?.select()}},[dialog]);
  const criteria=windowsCriteria(state);
  const current=state.nodes.find(n=>n.id===state.selected);
  const inTrash=state.folder==="trash";
  const candidates=inTrash?state.nodes.filter(n=>n.deleted):state.folder==="home"?state.nodes.filter(n=>n.parent==="home"&&!isTrashed(n,state.nodes)):state.nodes.filter(n=>n.parent===state.folder&&!isTrashed(n,state.nodes));
  const visible=(search.trim()&&!inTrash?state.nodes.filter(n=>!isTrashed(n,state.nodes)&&(state.folder==="home"||descendants(state.nodes,state.folder).some(d=>d.id===n.id))&&n.name.toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr"))):candidates).sort((a,b)=>Number(b.kind==="folder")-Number(a.kind==="folder")||a.name.localeCompare(b.name,"fr"));

  function open(app:WindowsApp){dispatch({type:"open",app});setStartOpen(false);setStartSearch("");setContext(null)}
  function navigate(folder:string){dispatch({type:"navigate",folder});setSearch("");setContext(null)}
  function prepare(kind:"folder"|"rename"|"save",id=state.selected??undefined){if(disabled)return;dispatch({type:"message",message:null});setDialog({kind,id});setName(kind==="rename"?state.nodes.find(n=>n.id===id)?.name??"":kind==="save"?"Mon_texte.txt":"Nouveau dossier");setContext(null)}
  function saveName(){
    if(!dialog)return;
    const before=latestState.current;
    const action=dialog.kind==="folder"?{type:"folder" as const,name}:dialog.kind==="save"?{type:"text" as const,name:name.toLowerCase().endsWith(".txt")?name:name+".txt",content:noteText,parent:state.folder==="home"||inTrash?"documents":state.folder}:dialog.kind==="rename"&&dialog.id?{type:"rename" as const,id:dialog.id,name}:null;
    if(!action)return;
    const after=windowsReducer(before,action);dispatch(action);
    if(after.nodes!==before.nodes)setDialog(null);
  }
  function openFile(file:VirtualFile){
    if(file.kind==="folder"){navigate(file.id);return}
    if(file.kind==="text"){setNoteText(file.content??"");open("notepad");return}
    setPreview(file);
  }
  function keyPress(e:KeyboardEvent<HTMLDivElement>){
    if(disabled)return;
    if(e.key==="Escape"){setContext(null);setStartOpen(false);setPreview(null);setDialog(null);return}
    if((e.target as HTMLElement).closest("input,textarea,select"))return;
    if(state.active==="calculator"){
      if(/^[0-9.+*/-]$/.test(e.key)){e.preventDefault();calcKey(e.key)}
      else if(e.key==="Enter"||e.key==="="){e.preventDefault();calcKey("=")}
      else if(e.key==="Backspace"){e.preventDefault();calcKey("⌫")}
      return;
    }
    if(state.active!=="explorer")return;
    if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==="n"){e.preventDefault();prepare("folder");return}
    if((e.ctrlKey||e.metaKey)&&["c","x","v"].includes(e.key.toLowerCase())){e.preventDefault();if(e.key.toLowerCase()==="v")dispatch({type:"paste"});else if(current&&!current.protected&&!inTrash)dispatch({type:"clipboard",id:current.id,cut:e.key.toLowerCase()==="x"});return}
    if(e.key==="F2"&&current&&!current.protected&&!inTrash){e.preventDefault();prepare("rename");return}
    if(e.key==="Delete"&&current&&!inTrash){e.preventDefault();dispatch({type:"delete",id:current.id});return}
    if(e.key==="Enter"&&current&&!inTrash){e.preventDefault();openFile(current)}
  }
  function beginMove(e:PointerEvent<HTMLElement>,app:WindowsApp){
    if(disabled||(e.target as HTMLElement).closest("button")||state.windows[app].maximized)return;
    dispatch({type:"focus",app});dragging.current={app,x:e.clientX,y:e.clientY,left:state.windows[app].x,top:state.windows[app].y};e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e:PointerEvent<HTMLElement>){const d=dragging.current;if(!d||!surfaceRef.current)return;const rect=surfaceRef.current.getBoundingClientRect();const width=d.app==="calculator"?310:Math.min(760,rect.width-16);dispatch({type:"position",app:d.app,x:Math.max(0,Math.min(rect.width-width,d.left+e.clientX-d.x)),y:Math.max(0,Math.min(rect.height-160,d.top+e.clientY-d.y))})}
  function calcKey(key:string){
    if(disabled)return;
    if(key==="C"||key==="CE"){setExpression("");setCalculation("0");setCalcHistory("");return}
    if(key==="⌫"){const next=expression.slice(0,-1);setExpression(next);setCalculation(next||"0");return}
    if(key==="="){const result=calculateExpression(expression);if(result===null){setCalculation("Calcul impossible");return}setCalcHistory(expression.replaceAll("*","×").replaceAll("/","÷")+" =");setCalculation(String(result).replace(".",","));setExpression(String(result));dispatch({type:"calculation",expression,result});return}
    const next=(expression+key).slice(0,65);setExpression(next);setCalculation(next.replaceAll("*","×").replaceAll("/","÷").replaceAll(".",","));
  }
  const toolbarAction=(label:LocalizedText,Icon:typeof Copy,onClick:()=>void,unavailable=false)=><button type="button" aria-label={label.fr} disabled={disabled||unavailable} onClick={()=>{onClick();setContext(null)}}><Icon size={17}/><Text value={label}/></button>;
  function dropFile(e:React.DragEvent,id:string){e.preventDefault();if(disabled)return;const source=e.dataTransfer.getData("application/x-lab2ac-file");if(!state.nodes.some(n=>n.id===source))return;if(id==="trash")dispatch({type:"delete",id:source});else if(id!=="home"){dispatch({type:"clipboard",id:source,cut:!e.ctrlKey});dispatch({type:"paste",parent:id})}}
  const explorer=<div className="w11-explorer">
    <div className="w11-commandbar">
      {toolbarAction(t("Nouveau dossier","مجلد جديد"),FolderPlus,()=>prepare("folder"),inTrash||state.folder==="home")}
      {toolbarAction(t("Couper","قص"),Scissors,()=>current&&dispatch({type:"clipboard",id:current.id,cut:true}),!current||current.protected||inTrash)}
      {toolbarAction(t("Copier","نسخ"),Copy,()=>current&&dispatch({type:"clipboard",id:current.id,cut:false}),!current||current.protected||inTrash)}
      {toolbarAction(t("Coller","لصق"),Clipboard,()=>dispatch({type:"paste"}),!state.clipboard||inTrash||state.folder==="home")}
      {toolbarAction(t("Renommer","إعادة التسمية"),Pencil,()=>prepare("rename"),!current||current.protected||inTrash)}
      {inTrash?toolbarAction(t("Restaurer","استعادة"),RotateCcw,()=>current&&dispatch({type:"restore",id:current.id}),!current):toolbarAction(t("Supprimer","حذف"),Trash2,()=>current&&dispatch({type:"delete",id:current.id}),!current||current.protected)}
    </div>
    <div className="w11-addressbar"><button type="button" onClick={()=>navigate(state.nodes.find(n=>n.id===state.folder)?.parent??"home")} aria-label="Dossier parent" disabled={state.folder==="home"||inTrash}><ArrowUp size={17}/></button><span>{pathFor(state.nodes,state.folder)}</span><label><Search size={16}/><input aria-label="Rechercher dans le dossier" placeholder="Rechercher" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
    <div className="w11-explorer-body">
      <nav aria-label="Dossiers de l’Explorateur">{Object.entries(folderNames).map(([id,label])=><button type="button" className={state.folder===id?"current":""} onClick={()=>navigate(id)} onDragOver={e=>e.preventDefault()} onDrop={e=>dropFile(e,id)} key={id}>{id==="trash"?<Trash2 size={18}/>:id==="home"?<Home size={18}/>:id==="downloads"?<Download size={18}/>:<Folder size={18} className="w11-folder-icon"/>}<Text value={label}/></button>)}</nav>
      <div className="w11-files-pane" onContextMenu={e=>{e.preventDefault();if(!disabled){const r=surfaceRef.current!.getBoundingClientRect();setContext({id:state.selected,x:Math.max(5,Math.min(r.width-235,e.clientX-r.left)),y:Math.max(5,Math.min(r.height-270,e.clientY-r.top))})}}}>
        <div className="w11-file-columns"><span>Nom</span><span>Type</span></div>
        <div className="w11-files" role="listbox" aria-label="Fichiers et dossiers" tabIndex={0}>
          {visible.map(file=><button type="button" role="option" aria-selected={state.selected===file.id} aria-label={file.name} draggable={!disabled&&!inTrash&&!file.protected} onDragStart={e=>e.dataTransfer.setData("application/x-lab2ac-file",file.id)} onDragOver={e=>file.kind==="folder"&&e.preventDefault()} onDrop={e=>{if(file.kind==="folder")dropFile(e,file.id)}} className={`w11-file ${state.selected===file.id?"selected":""} ${state.clipboard?.cut&&state.clipboard.id===file.id?"cut":""}`} key={file.id} onClick={()=>dispatch({type:"select",id:file.id})} onDoubleClick={()=>!inTrash&&openFile(file)} onContextMenu={e=>{e.preventDefault();e.stopPropagation();dispatch({type:"select",id:file.id});const r=surfaceRef.current!.getBoundingClientRect();setContext({id:file.id,x:Math.max(5,Math.min(r.width-235,e.clientX-r.left)),y:Math.max(5,Math.min(r.height-270,e.clientY-r.top))})}}><FileIcon file={file}/><span>{file.name}</span><small>{file.kind==="folder"?"Dossier":file.kind==="text"?"Document texte":file.kind==="image"?"Image":file.kind==="audio"?"Son":"Vidéo"}</small></button>)}
          {!visible.length&&<p className="w11-empty"><Text value={search?t("Aucun élément ne correspond à la recherche.","لا يوجد عنصر يوافق البحث."):t("Ce dossier est vide.","هذا المجلد فارغ.")}/></p>}
        </div>
        <div className="w11-explorer-status">{visible.length} élément(s){state.selected&&" · 1 élément sélectionné"}</div>
      </div>
    </div>
  </div>;

  return <section className={`w11-lab ${assessment?"w11-assessment":""}`} aria-label="Bureau d’entraînement Windows 11" onKeyDown={e=>{if(e.key==="Escape"){setDialog(null);setPreview(null);setContext(null);setStartOpen(false)}}}>
    {!assessment&&<header className="w11-lab-heading"><div><span>WINDOWS 11 · À TOI DE MANIPULER</span><h4><Text value={modeTitles[mode]}/></h4></div><button type="button" className="w11-soft-button" onClick={()=>setShowMissions(v=>!v)} aria-expanded={showMissions}><Text value={t(showMissions?"Masquer les missions":"Voir les missions",showMissions?"إخفاء المهام":"عرض المهام")}/></button></header>}
    {!assessment&&showMissions&&<ol className="w11-missions">{criteria.map((c,i)=><li className={c.correct?"done":""} key={c.label.fr}><span>{c.correct?<Check size={15}/>:i+1}</span><Text value={c.label}/></li>)}</ol>}
    <p className="w11-disclosure"><Text value={t("Bureau simulé dans cette page. Utilise le double-clic, le clic droit et les commandes habituelles. Les fichiers de ton véritable ordinateur ne sont pas modifiés.","مكتب محاكى داخل هذه الصفحة. استعمل النقر المزدوج والنقر بالزر الأيمن والأوامر المعتادة. لا تتغير ملفات حاسوبك الحقيقي.")}/></p>
    <div className="w11-surface" ref={surfaceRef} inert={disabled} tabIndex={0} onKeyDown={keyPress} onClick={()=>context&&setContext(null)} aria-label="Surface du simulateur Windows 11">
      <div className="w11-bloom" aria-hidden="true"><i/><i/><i/><i/></div>
      <div className="w11-desktop-icons"><button type="button" onDoubleClick={()=>{open("explorer");navigate("home")}} onClick={()=>setStartOpen(false)}><Home size={33}/><Text value={t("Ce PC","هذا الحاسوب")}/></button><button type="button" onDoubleClick={()=>{open("explorer");navigate("trash")}} onClick={()=>setStartOpen(false)}><Trash2 size={33}/><Text value={folderNames.trash}/></button></div>
      {(Object.keys(state.windows) as WindowsApp[]).map(app=>{
        const w=state.windows[app];if(!w.open||w.minimized)return null;
        return <section className={`w11-window w11-${app} ${w.maximized?"maximized":""} ${state.active===app?"focused":""}`} key={app} aria-label={appNames[app].fr} style={{left:w.maximized?6:`min(${w.x}px, max(6px, calc(100% - ${app==="calculator"?320:760}px)))`,top:w.maximized?6:w.y,zIndex:10+w.z}} onPointerDown={()=>state.active!==app&&dispatch({type:"focus",app})}>
          <header className="w11-titlebar" onDoubleClick={e=>{if(!(e.target as HTMLElement).closest("button"))dispatch({type:"maximize",app})}} onPointerDown={e=>beginMove(e,app)} onPointerMove={move} onPointerUp={()=>dragging.current=null} onPointerCancel={()=>dragging.current=null}>
            <span><AppIcon app={app} size={17}/><Text value={appNames[app]}/></span><div><button type="button" aria-label={`Réduire ${appNames[app].fr}`} onClick={()=>dispatch({type:"minimize",app})}><Minus size={16}/></button><button type="button" aria-label={`${w.maximized?"Restaurer la taille de":"Agrandir"} ${appNames[app].fr}`} onClick={()=>dispatch({type:"maximize",app})}>{w.maximized?<Minimize2 size={14}/>:<Maximize2 size={14}/>}</button><button type="button" aria-label={`Fermer ${appNames[app].fr}`} onClick={()=>dispatch({type:"close",app})}><X size={17}/></button></div>
          </header>
          {app==="explorer"?explorer:app==="calculator"?<div className="w11-calculator-body"><div className="w11-calculator-mode"><MoreHorizontal size={20}/> Standard</div><small>{calcHistory||" "}</small><output aria-label="Résultat de la calculatrice">{calculation}</output><div className="w11-calculator-keys">{["CE","C","⌫","/","7","8","9","*","4","5","6","-","1","2","3","+","0",".","="].map(key=><button type="button" className={key==="="?"equals":/[0-9.]/.test(key)?"number":""} aria-label={key==="*"?"Multiplier":key==="/"?"Diviser":key==="="?"Égal":key} key={key} onClick={()=>calcKey(key)}>{key==="*"?"×":key==="/"?"÷":key==="."?",":key}</button>)}</div></div>:<div className="w11-notepad-body"><div className="w11-notepad-menu"><span>Fichier</span><span>Édition</span><span>Affichage</span><button type="button" onClick={()=>prepare("save")}><Save size={16}/><Text value={t("Enregistrer sous","حفظ باسم")}/></button></div><textarea aria-label="Texte du Bloc-notes" placeholder="Écris ton texte ici…" value={noteText} onChange={e=>setNoteText(e.target.value.slice(0,1600))} disabled={disabled}/><small>{noteText.length} caractères · Texte brut</small></div>}
        </section>;
      })}
      {startOpen&&<section className="w11-start-menu" aria-label="Menu Démarrer"><label><Search size={19}/><input aria-label="Rechercher une application" placeholder="Rechercher une application" value={startSearch} onChange={e=>setStartSearch(e.target.value)}/></label><strong><Text value={t("Épinglé","تطبيقات مثبتة")}/></strong><div>{(Object.keys(appNames) as WindowsApp[]).filter(app=>appNames[app].fr.toLocaleLowerCase().includes(startSearch.toLocaleLowerCase())).map(app=><button type="button" onClick={()=>open(app)} key={app}><AppIcon app={app} size={31}/><Text value={appNames[app]}/></button>)}</div><footer><span>Élève · LAB 2AC</span><span>⏻</span></footer></section>}
      {context&&<div className="w11-context-menu" role="menu" style={{left:context.x,top:context.y}} onClick={e=>e.stopPropagation()}>{inTrash?toolbarAction(t("Restaurer","استعادة"),RotateCcw,()=>context.id&&dispatch({type:"restore",id:context.id}),!context.id):<>{toolbarAction(t("Ouvrir","فتح"),Folder,()=>{const f=state.nodes.find(n=>n.id===context.id);if(f)openFile(f)},!context.id)}{toolbarAction(t("Couper","قص"),Scissors,()=>context.id&&dispatch({type:"clipboard",id:context.id,cut:true}),!context.id||current?.protected)}{toolbarAction(t("Copier","نسخ"),Copy,()=>context.id&&dispatch({type:"clipboard",id:context.id,cut:false}),!context.id||current?.protected)}{toolbarAction(t("Coller","لصق"),Clipboard,()=>dispatch({type:"paste"}),!state.clipboard||state.folder==="home")}{toolbarAction(t("Renommer","إعادة التسمية"),Pencil,()=>prepare("rename",context.id??undefined),!context.id||current?.protected)}{toolbarAction(t("Supprimer","حذف"),Trash2,()=>context.id&&dispatch({type:"delete",id:context.id}),!context.id||current?.protected)}{toolbarAction(t("Nouveau dossier","مجلد جديد"),FolderPlus,()=>prepare("folder"),state.folder==="home")}</>}</div>}
      <div className="w11-taskbar"><span className="w11-weather" aria-hidden="true">LAB·2AC</span><div className="w11-taskbar-center"><button type="button" className={startOpen?"active":""} aria-label="Démarrer" aria-expanded={startOpen} onClick={()=>setStartOpen(v=>!v)}><WindowsMark/></button><button type="button" aria-label="Rechercher une application" onClick={()=>{setStartOpen(true);setStartSearch("")}}><Search size={23}/></button>{(Object.keys(appNames) as WindowsApp[]).filter(app=>app==="explorer"||state.windows[app].open).map(app=><button type="button" key={app} className={`${state.windows[app].open?"running":""} ${state.active===app?"active":""}`} aria-label={`${state.windows[app].minimized?"Restaurer":"Activer"} ${appNames[app].fr}`} onClick={()=>state.windows[app].open?dispatch({type:"focus",app}):open(app)}><AppIcon app={app} size={25}/></button>)}</div><div className="w11-tray" aria-hidden="true"><Wifi size={16}/><Volume2 size={16}/><span>{clock || "—"}<br/>FR</span></div></div>
      {disabled&&<div className="w11-readonly"><Text value={t("Copie remise · manipulation terminée","تم تسليم الورقة · انتهى التطبيق")}/></div>}
    </div>
    {state.message&&<p className="w11-message" role="status"><Text value={state.message}/></p>}
    {!assessment&&<footer className="w11-lab-footer"><span>{criteria.filter(c=>c.correct).length} / {criteria.length} <Text value={t("missions réalisées","مهام منجزة")}/></span><button type="button" className="w11-soft-button" onClick={()=>setDialog({kind:"reset"})}><RotateCcw size={16}/><Text value={t("Recommencer le bureau","إعادة المكتب")}/></button><button type="button" className="w11-primary-button" onClick={()=>onValidate?.(windowsEvidence(state),criteria.map(c=>c.correct))}><Check size={18}/><Text value={t("Vérifier mon travail","أتحقق من عملي")}/></button></footer>}
    {dialog&&<div className="w11-modal-backdrop"><section className="w11-modal" role="dialog" aria-modal="true" aria-labelledby="w11-dialog-title"><h4 id="w11-dialog-title"><Text value={dialog.kind==="folder"?t("Nouveau dossier","مجلد جديد"):dialog.kind==="rename"?t("Renommer l’élément","إعادة تسمية العنصر"):dialog.kind==="save"?t("Enregistrer le texte","حفظ النص"):t("Recommencer ce bureau ?","إعادة هذا المكتب؟")}/></h4>{dialog.kind==="reset"?<p><Text value={t("Seuls les fichiers de cet exercice simulé seront remis à leur état de départ.","ستعاد ملفات هذا التمرين المحاكى وحدها إلى حالتها الأولى.")}/></p>:<form onSubmit={e=>{e.preventDefault();saveName()}}><label><Text value={t("Nom","الاسم")}/><input ref={nameRef} value={name} onChange={e=>setName(e.target.value)} maxLength={80} aria-label="Nom de l’élément"/></label>{state.message&&<p className="w11-modal-error"><Text value={state.message}/></p>}<div><button type="button" className="w11-soft-button" onClick={()=>{setDialog(null);dispatch({type:"message",message:null})}}><Text value={t("Annuler","إلغاء")}/></button><button type="submit" className="w11-primary-button"><Text value={t(dialog.kind==="folder"?"Créer":dialog.kind==="save"?"Enregistrer":"Renommer",dialog.kind==="folder"?"إنشاء":dialog.kind==="save"?"حفظ":"إعادة التسمية")}/></button></div></form>}{dialog.kind==="reset"&&<div className="w11-modal-actions"><button type="button" className="w11-soft-button" onClick={()=>setDialog(null)}><Text value={t("Annuler","إلغاء")}/></button><button type="button" className="w11-primary-button" onClick={()=>{dispatch({type:"reset"});setExpression("");setCalculation("0");setCalcHistory("");setSearch("");setStartOpen(false);setDialog(null)}}><Text value={t("Recommencer","إعادة المحاولة")}/></button></div>}</section></div>}
    {preview&&<div className="w11-modal-backdrop"><section className="w11-modal w11-preview" role="dialog" aria-modal="true" aria-label={preview.name}><header><h4>{preview.name}</h4><button type="button" aria-label="Fermer l’aperçu" onClick={()=>setPreview(null)}><X size={19}/></button></header>{preview.kind==="image"?<img src={publicAsset(preview.media)} alt="Photographie du matériel du club"/>:preview.kind==="audio"?<audio src={publicAsset(preview.media)} controls/>:<video src={publicAsset(preview.media)} controls/>}</section></div>}
  </section>;
}
