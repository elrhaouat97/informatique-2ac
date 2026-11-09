/* Interface et reprise du laboratoire. Aucune donnée personnelle, aucun appel réseau. */
(function(){
 'use strict';
 const channel='lab2ac-session4',protocol=2,root=document.getElementById('laboratoire'),contract=window.Session4Missions;
 const params=new URLSearchParams(location.search),mode=params.get('mode'),guided=mode!=='assessment'&&params.get('guide')==='1';
 if(!contract.missions[mode]){root.textContent='Cette activité du laboratoire n’existe pas.';return;}
 const tools={
  terminal:{label:'Invite de commandes · PC-21',ar:'نافذة الأوامر · PC-21',post:'A',open:pc=>pc.openApp('terminal')},
  cable:{label:'Câble · PC-22',ar:'الكابل · PC-22',post:'network'},
  source:{label:'Bonjour.txt · PC-21',ar:'Bonjour.txt · PC-21',post:'A',action:'copy',open:pc=>pc.guideExplorer(['Documents'],'Bonjour.txt')},
  club:{label:'Ouvrir Club_reseau',ar:'فتح Club_reseau',post:'A',action:'paste',open:pc=>pc.guideExplorer(['Documents','Club_reseau'])},
  shareClub:{label:'Partage de Club_reseau · PC-21',ar:'مشاركة Club_reseau · PC-21',post:'A',open:pc=>pc.guidePermissions(['Documents','Club_reseau'])},
  copyRemote:{label:'Ouvrir le dossier partagé',ar:'فتح المجلد المشترك',post:'B',action:'copy',open:pc=>pc.guideExplorer(['Documents','Club_reseau'],'Bonjour.txt','PC-21')},
  pasteDesktop:{label:'Ouvrir le Bureau du PC-22',ar:'فتح سطح مكتب PC-22',post:'B',action:'paste',open:pc=>pc.guideExplorer(['Bureau'])},
  readDesktop:{label:'Bureau · PC-22',ar:'سطح المكتب · PC-22',post:'B',action:'open',open:pc=>pc.guideExplorer(['Bureau'],'Bonjour.txt')},
  sendFile:{label:'Nouveau message · PC-21',ar:'رسالة جديدة · PC-21',post:'A',open:pc=>pc.guideMail('new')},
  receiveFile:{label:'Boîte de réception · PC-22',ar:'صندوق الوارد · PC-22',post:'B',open:pc=>pc.guideMail('in')},
  readDownload:{label:'Téléchargements · PC-22',ar:'التنزيلات · PC-22',post:'B',action:'open',open:pc=>pc.guideExplorer(['Téléchargements'],'Bonjour.txt')},
  reply:{label:'Répondre depuis PC-22',ar:'الرد من PC-22',post:'B',open:pc=>pc.guideMail('new')},
  readReply:{label:'Lire le retour sur PC-21',ar:'قراءة الرد على PC-21',post:'A',open:pc=>pc.guideMail('in')},
  notes:{label:'notes.txt · PC-22',ar:'notes.txt · PC-22',post:'B',action:'copy',open:pc=>pc.guideExplorer(['Documents'],'notes.txt')},
  pasteExchange:{label:'Ouvrir Échange sur le réseau',ar:'فتح Échange على الشبكة',post:'B',action:'paste',open:pc=>pc.guideExplorer(['Documents','Échange'],null,'PC-21')},
  shareExchange:{label:'Partage de Échange · PC-21',ar:'مشاركة Échange · PC-21',post:'A',open:pc=>pc.guidePermissions(['Documents','Échange'])},
  readNotes:{label:'Échange · PC-21',ar:'Échange · PC-21',post:'A',action:'open',open:pc=>pc.guideExplorer(['Documents','Échange'],'notes.txt')}
 };
 const routes={
  identity:[['terminal'],['terminal']],
  ping:[['terminal'],['cable'],['terminal']],
  sharing:[['source','club'],['shareClub'],['copyRemote','pasteDesktop'],['readDesktop'],['shareClub']],
  messenger:[['sendFile'],['receiveFile'],['receiveFile'],['readDownload'],['reply','readReply']],
  repair:[['notes','pasteExchange'],['shareExchange'],['pasteExchange','notes'],['readNotes']]
 };
 const commands={identity:['ipconfig','hostname'],ping:['ping 192.168.10.22','','ping 192.168.10.22']};
 const guideMarkup='<section class="guide-stage" aria-label="Étapes de l’exercice">'+
  '<ol id="guide-steps"></ol><div class="guide-heading"><span id="guide-count" class="mini-label"></span><h2 id="guide-title" tabindex="-1"></h2></div>'+
  '<p id="guide-task"></p><code id="guide-command" hidden></code><div id="guide-tools" role="group" aria-label="Outils de cette étape"></div></section>';
 const guideFooter='<nav class="guide-footer" aria-label="Navigation dans les étapes"><button type="button" id="guide-back" data-ar="الخطوة السابقة">Étape précédente</button><p id="guide-status" role="status"></p><button type="button" id="guide-next" data-ar="الخطوة التالية">Étape suivante</button></nav>';
 let guideIndex=0,guideTool=0;
 function lastReachableStep(){
  const next=contract.missions[mode].steps.findIndex((_,index)=>checks[index]!==true);
  return next<0?contract.missions[mode].steps.length-1:next;
 }
 function openGuideTool(index){
  const target=tools[routes[mode][guideIndex][index]];
  guideTool=index;
  root.dataset.guideAction=target.action||'';
  show(target.post);
  if(target.open)target.open(ctx[target.post]);
  root.querySelectorAll('#guide-tools button').forEach((button,i)=>button.setAttribute('aria-pressed',String(index===i)));
 }
 function openGuideStep(index,tool=0,focus=false){
  guideIndex=index;
  const [title,arTitle,instruction,arInstruction]=contract.missions[mode].steps[index];
  const heading=root.querySelector('#guide-title'),task=root.querySelector('#guide-task'),command=root.querySelector('#guide-command');
  heading.textContent=title;heading.dataset.ar=arTitle;
  task.textContent=instruction;task.dataset.ar=arInstruction;
  command.textContent=commands[mode]?.[index]||'';command.hidden=!command.textContent;
  root.querySelector('#guide-count').textContent='ÉTAPE '+(index+1)+' / '+routes[mode].length;
  const group=root.querySelector('#guide-tools');group.replaceChildren();
  routes[mode][index].forEach((name,i)=>{
   const button=document.createElement('button');button.type='button';button.textContent=tools[name].label;button.dataset.ar=tools[name].ar;
   button.addEventListener('click',()=>openGuideTool(i));group.appendChild(button);
  });
  openGuideTool(tool<routes[mode][index].length&&tool>=0?tool:0);
  if(focus)heading.focus();
 }
 function paintGuide(){
  const completed=checks.every(Boolean);
  const last=routes[mode].length-1,reachable=lastReachableStep();
  root.querySelectorAll('#guide-steps button').forEach((button,index)=>{
   button.disabled=index>reachable;
   button.classList.toggle('done',checks[index]===true);
   if(index===guideIndex)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
   button.textContent=checks[index]?'✓ '+(index+1):String(index+1);
  });
  const status=root.querySelector('#guide-status');
  const message=completed?'Toutes les étapes sont faites. Vérifie ton travail sous le simulateur.':checks[guideIndex]?'Étape réussie. Tu peux continuer.':'Réalise le geste indiqué pour avancer.';
  if(status.textContent!==message)status.textContent=message;
  status.dataset.ar=completed?'اكتملت جميع الخطوات. تحقق من عملك أسفل المحاكي.':checks[guideIndex]?'نجحت الخطوة. يمكنك المتابعة.':'أنجز العملية المشار إليها للمتابعة.';
  root.querySelector('#guide-back').disabled=guideIndex===0;
  root.querySelector('#guide-next').disabled=guideIndex===last||!checks[guideIndex];
 }
 let nonce=null,parentOrigin='*',ready=false,pending=false,net=null,ctx=null,current='A',view='desktop',checks=[],frameReady=false;
 const send=data=>{
  if(!nonce)return;
  const message={channel,protocol,nonce,...data};
  if(mode==='assessment'&&data.type==='state'&&parentOrigin===location.origin){
   // Save a completed gesture before a reload can discard a queued message.
   parent.dispatchEvent(new MessageEvent('message',{data:message,origin:location.origin,source:window}));
  }else parent.postMessage(message,parentOrigin);
 };
 const photo=name=>'../images/'+name+'.webp';
 function show(next){
  if(next==='network'){view='network';}else{view='desktop';current=next;}
  document.getElementById('network-view').hidden=view!=='network';
  document.getElementById('desktop-view').hidden=view!=='desktop';
  document.querySelectorAll('[data-machine]').forEach(el=>{el.hidden=el.dataset.machine!==current;});
  document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.view===(view==='network'?'network':current)?'true':'false'));
  const pc=ctx[current];
  document.getElementById('active-poste').textContent=guided?pc.name:pc.name+' · '+pc.ip;
  // A newly visible desktop needs its responsive class recalculated.
  if(view==='desktop'){pc.fitWindows();pc.render();}
  schedule();
 }
 function init(data){
  if(frameReady)return;frameReady=true;nonce=data.nonce;parentOrigin=data.origin;
  const saved=contract.validSnapshot(data.snapshot,mode)?data.snapshot:null,M=contract.missions[mode];
  checks=saved?.checks||[];
  root.classList.toggle('lab-guided',guided);
  root.innerHTML='<header class="lab-top"><div><span>LAB·2AC / RÉSEAU LOCAL</span><strong></strong></div><span class="local-badge">Simulation · Internet coupé</span></header>'+
   (guided?guideMarkup:'<nav class="machine-tabs" aria-label="Choisir le poste virtuel"><button type="button" data-view="network">Le réseau</button><button type="button" data-view="A"><img alt="" src="'+photo('ordinateur-bureau')+'">PC-21 <small>Amine</small></button><button type="button" data-view="B"><img alt="" src="'+photo('ordinateur-bureau')+'">PC-22 <small>Sara</small></button></nav>')+
   '<div class="lab-grid">'+(guided?'':'<aside class="mission-card"><span class="mini-label">À FAIRE DANS LE SIMULATEUR</span><ol id="mission-steps"></ol><p class="mission-result" role="status"></p><details class="help"><summary>Comment manipuler ?</summary><p>Un clic sélectionne un fichier ; un double-clic l’ouvre. Les boutons de l’Explorateur permettent de copier, coller et partager. Tu peux aussi utiliser le clic droit et Ctrl+C / Ctrl+V.</p></details></aside>')+
   '<section class="simulation"><section id="network-view" hidden><h2>Deux postes, un même commutateur</h2><p>Les messages et fichiers passent par le réseau local.</p><div class="network-plan"><div class="wire wire-a"></div><div class="wire wire-b"></div><div class="plan-switch"><img src="'+photo('commutateur')+'" alt="Commutateur réel"><strong>Commutateur</strong></div>'+['A','B'].map((key,i)=>'<article class="plan-pc pc-'+key+'"><img src="'+photo('ordinateur-bureau')+'" alt="Ordinateur '+(i?'PC-22':'PC-21')+'"><strong>'+(i?'PC-22':'PC-21')+'</strong><code>192.168.10.'+(i?'22':'21')+'</code><button type="button" data-cable="'+key+'"></button></article>').join('')+'</div><figure class="cable-detail"><img src="'+photo('cable-rj45')+'" alt="Connecteur RJ45"><figcaption>Le câble RJ45 relie chaque carte réseau à un port du commutateur.</figcaption></figure></section>'+
   '<section id="desktop-view"><header class="desktop-top"><strong id="active-poste"></strong><span>Poste virtuel</span></header><nav class="app-shortcuts" aria-label="Applications du poste"><button type="button" data-app="explorer">Explorateur</button><button type="button" data-app="terminal">Invite de commandes</button><button type="button" data-app="mail">Messagerie</button><button type="button" data-app="settings">Réseau</button></nav><div class="desktop-host" data-machine="A"></div><div class="desktop-host" data-machine="B" hidden></div></section></section></div>'+
   (guided?guideFooter:'<footer class="lab-footer">Deux ordinateurs simulés dans ton navigateur · les étapes se valident après tes manipulations.</footer>');
  root.querySelector('.lab-top strong').textContent=M.title;root.querySelector('.lab-top strong').dataset.ar=M.ar;
  net={machines:{},internet:false};ctx={A:null,B:null};
  const isRepair=mode==='repair';
  ctx.A=makeOS(root.querySelector('[data-machine="A"]'),{name:'PC-21',user:'Amine',ip:'192.168.10.21',seed:mode==='assessment'?'assessmentA':isRepair?'netA2':'clubA',guided,mode,net,snapshot:saved?.machines.A,onchange:schedule});
  ctx.B=makeOS(root.querySelector('[data-machine="B"]'),{name:'PC-22',user:'Sara',ip:'192.168.10.22',seed:isRepair?'netB0':'clubB',guided,mode,net,cable:mode!=='ping',snapshot:saved?.machines.B,onchange:schedule});
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>show(button.dataset.view)));
  document.querySelectorAll('[data-app]').forEach(button=>button.addEventListener('click',()=>{ctx[current].openApp(button.dataset.app);schedule();}));
  document.querySelectorAll('[data-cable]').forEach(button=>button.addEventListener('click',()=>{const pc=ctx[button.dataset.cable];pc.setCable(!pc.cable);schedule();}));
  if(guided){
   M.steps.forEach(([title,ar],index)=>{
    const li=document.createElement('li'),button=document.createElement('button');button.type='button';
    button.setAttribute('aria-label','Étape '+(index+1)+' · '+title);button.dataset.ar=ar;
    button.addEventListener('click',()=>openGuideStep(index,0,true));
    li.appendChild(button);root.querySelector('#guide-steps').appendChild(li);
   });
   root.querySelector('#guide-back').addEventListener('click',()=>openGuideStep(guideIndex-1,0,true));
   root.querySelector('#guide-next').addEventListener('click',()=>openGuideStep(guideIndex+1,0,true));
  }else M.steps.forEach((step,index)=>{
   const li=document.createElement('li');li.innerHTML='<span class="step-number"></span><div><p></p><details><summary>Un indice</summary><p></p></details></div>';
   li.querySelector('.step-number').textContent=index+1;li.querySelector('div>p').textContent=step[0];li.querySelector('div>p').dataset.ar=step[1];
   li.querySelector('details p').textContent=mode==='sharing'&&index===0?'Crée d’abord Club_reseau dans Documents. '+step[2]:step[2];
   li.querySelector('details p').dataset.ar=step[3];root.querySelector('#mission-steps').appendChild(li);
  });
  ready=true;
  if(saved){ctx.A.restoreViews(saved.machines.A);ctx.B.restoreViews(saved.machines.B);current=saved.current==='B'?'B':'A';view=saved.view==='network'?'network':'desktop';}
  if(guided){
   const reachable=lastReachableStep(),previous=saved?.guide;
   const index=Number.isInteger(previous?.index)?Math.max(0,Math.min(reachable,previous.index)):reachable;
   openGuideStep(index,Number.isInteger(previous?.tool)?previous.tool:0);
  }else{
   if(!saved){
    if(mode==='identity'||mode==='ping')ctx.A.openApp('terminal');
    else ctx.A.openApp(mode==='messenger'?'mail':'explorer');
   }
   show(view==='network'?'network':current);
  }
  update();
 }
 function schedule(){if(!ready||pending)return;pending=true;queueMicrotask(()=>{pending=false;update();});}
 function update(){
  if(!ready)return;
  const a=ctx.A.dump(),b=ctx.B.dump(),result=contract.evaluate(mode,a,b,checks);checks=result.checks;
  if(guided)paintGuide();
  else{
   document.querySelectorAll('#mission-steps li').forEach((li,i)=>{li.classList.toggle('done',checks[i]);li.classList.toggle('current',!checks[i]&&(i===0||checks[i-1]));li.querySelector('.step-number').textContent=checks[i]?'✓':i+1;});
   const count=checks.filter(Boolean).length,status=document.querySelector('.mission-result');
   status.textContent=result.completed?'Mission réussie · les manipulations ont été réalisées.':count+' / '+checks.length+' étapes réalisées';status.classList.toggle('complete',result.completed);
  }
  document.querySelectorAll('[data-cable]').forEach(button=>{const key=button.dataset.cable,pc=ctx[key];button.textContent=pc.cable?'Débrancher le câble':'Rebrancher le câble';button.setAttribute('aria-pressed',String(pc.cable));button.closest('article').classList.toggle('unplugged',!pc.cable);document.querySelector('.wire-'+key.toLowerCase()).classList.toggle('unplugged',!pc.cable);});
  const snapshot={version:2,mode,machines:{A:a,B:b},checks,current,view,...(guided?{guide:{index:guideIndex,tool:guideTool}}:{})};
  const evidence=result.evidence||{steps:contract.missions[mode].steps.map((step,i)=>({task:step[0],done:checks[i]})),posts:[a,b].map(pc=>({name:pc.name,ip:pc.ip,connected:pc.cable,shares:pc.shares.map(s=>({name:s.name,permission:s.perm})),commands:(pc.did.commands||[]).slice(-6),messagesReceived:pc.inbox.slice(0,6).map(m=>({from:m.from,text:m.text,attachment:m.att?.name,read:m.read}))}))};
  send({type:'state',mode,checks,completed:result.completed,snapshot,evidence});
  send({type:'resize',height:Math.ceil(root.scrollHeight)});
 }
 window.addEventListener('message',event=>{
  const data=event.data;
  if(event.source!==parent||!data||data.channel!==channel||data.protocol!==protocol)return;
  if(data.type==='init'&&typeof data.nonce==='string'&&data.mode===mode){init({...data,origin:event.origin});}
 });
 // Capture unfinished message / terminal / file names too, without recreating the desktop.
 document.addEventListener('input',schedule,true);document.addEventListener('change',schedule,true);document.addEventListener('click',()=>setTimeout(schedule,0),true);document.addEventListener('keydown',()=>setTimeout(schedule,0),true);
 new ResizeObserver(()=>{if(ready)send({type:'resize',height:Math.ceil(root.scrollHeight)});}).observe(root);
 parent.postMessage({channel,protocol,type:'ready'},'*');
 const translations={'Le réseau':'الشبكة','Explorateur':'مستكشف الملفات','Invite de commandes':'نافذة الأوامر','Messagerie':'المراسلة','Réseau':'الشبكة','Nouveau dossier':'مجلد جديد','Nouveau fichier':'ملف جديد','Copier':'نسخ','Coller':'لصق','Couper':'قص','Partager':'مشاركة','Ouvrir':'فتح','Enregistrer':'حفظ','Fermer':'إغلاق','Démarrer':'ابدأ','Envoyer':'إرسال','Nouveau message':'رسالة جديدة','Documents':'المستندات','Bureau':'سطح المكتب','Téléchargements':'التنزيلات','Lecture seule':'القراءة فقط','Lecture et écriture':'القراءة والكتابة','Postes de la salle':'حواسيب القاعة','Moi seulement':'أنا فقط','Arrêter le partage':'إيقاف المشاركة','Rebrancher le câble':'إعادة توصيل الكابل','Débrancher le câble':'فصل الكابل','Exécuter':'تنفيذ','Un indice':'تلميح','Comment manipuler ?':'كيف أنجز العمليات؟'};
 const tooltip=document.getElementById('translation');let tipTarget=null;
 document.addEventListener('pointerover',event=>{const el=event.target.closest('[data-ar],button,summary');if(!el)return;const ar=el.dataset.ar||translations[el.textContent.trim()];if(!ar)return;tipTarget=el;tooltip.textContent=ar;tooltip.hidden=false;const r=el.getBoundingClientRect();tooltip.style.left=Math.min(Math.max(10,r.left),Math.max(10,innerWidth-290))+'px';tooltip.style.top=Math.max(8,Math.min(r.bottom+7,innerHeight-90))+'px';});
 document.addEventListener('pointerout',event=>{if(tipTarget&&!tipTarget.contains(event.relatedTarget)){tooltip.hidden=true;tipTarget=null;}});
 document.addEventListener('scroll',()=>{tooltip.hidden=true;tipTarget=null;},true);
})();
