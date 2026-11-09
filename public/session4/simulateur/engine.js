/* Moteur adapté du fichier fourni par l’enseignant : prise-en-main du poste pour élève.html.
   Uniquement le bureau, les fichiers et les échanges locaux ; aucune connexion aux PC réels. */
'use strict';
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.from((r||document).querySelectorAll(s))}
var WALLS=[['Océan','linear-gradient(135deg,#0A6E8A,#1D3557)'],['Coucher de soleil','linear-gradient(135deg,#F2994A,#B5446E)'],['Forêt','linear-gradient(135deg,#2E7D5B,#143528)'],['Nuit','linear-gradient(135deg,#3A3D6B,#0B0C14)']];
var EXTCOL={txt:'#5C6772',docx:'#2B5CB8',xlsx:'#1E8449',pptx:'#C0562C',jpg:'#8E44AD',png:'#16A085'};
var TYPES={txt:'Document texte',docx:'Document Word',xlsx:'Feuille de calcul',pptx:'Présentation',jpg:'Image JPEG',png:'Image PNG'};
var BASESIZE={docx:24576,xlsx:18432,pptx:512000,jpg:245760,png:51200};
function extOf(n){var i=n.lastIndexOf('.');return i>0?n.slice(i+1).toLowerCase():''}
function icoFolder(w){return '<svg viewBox="0 0 48 40" width="'+w+'" height="'+Math.round(w*0.83)+'" aria-hidden="true"><path d="M3 8a3 3 0 0 1 3-3h12l4 5h20a3 3 0 0 1 3 3v21a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" fill="#F2B01E" stroke="#B8830A" stroke-width="2"/></svg>'}
function icoFile(ext,w){var c=EXTCOL[ext]||'#5C6772';return '<svg viewBox="0 0 40 48" width="'+w+'" height="'+Math.round(w*1.2)+'" aria-hidden="true"><path d="M5 3h20l10 10v32H5z" fill="#fff" stroke="#8794A1" stroke-width="2"/><path d="M25 3v10h10" fill="#E3E8ED" stroke="#8794A1" stroke-width="2"/><rect x="5" y="30" width="30" height="11" fill="'+c+'"/><text x="20" y="39" text-anchor="middle" font-size="8" font-weight="700" fill="#fff" font-family="sans-serif">'+(ext||'').toUpperCase().slice(0,4)+'</text></svg>'}
var SYSICO={
  pc:'<rect x="6" y="6" width="36" height="24" rx="2" fill="#3A4F7A" stroke="#1A2233" stroke-width="2"/><rect x="9" y="9" width="30" height="18" fill="#9ED8F5"/><rect x="20" y="30" width="8" height="5" fill="#5C6772"/><rect x="12" y="35" width="24" height="4" rx="2" fill="#5C6772"/>',
  trash:'<path d="M12 12h24l-2 28H14z" fill="#C9D1D8" stroke="#6F7A86" stroke-width="2"/><rect x="9" y="8" width="30" height="4" rx="1" fill="#8794A1"/><rect x="19" y="4" width="10" height="4" fill="#8794A1"/><path d="M18 17v18M24 17v18M30 17v18" stroke="#6F7A86" stroke-width="2"/>',
  game:'<rect x="4" y="12" width="40" height="24" rx="8" fill="#E0574F" stroke="#8C2C27" stroke-width="2"/><path d="M14 20v8M10 24h8" stroke="#fff" stroke-width="3"/><circle cx="32" cy="22" r="2.5" fill="#fff"/><circle cx="37" cy="27" r="2.5" fill="#fff"/>',
  mail:'<rect x="5" y="10" width="38" height="28" rx="3" fill="#fff" stroke="#2B5CB8" stroke-width="2"/><path d="M6 12l18 14 18-14" fill="none" stroke="#2B5CB8" stroke-width="2"/>',
  gear:'<circle cx="24" cy="24" r="8" fill="none" stroke="#5C6772" stroke-width="5"/><path d="M24 5v7M24 36v7M5 24h7M36 24h7M10 10l5 5M33 33l5 5M38 10l-5 5M15 33l-5 5" stroke="#5C6772" stroke-width="4"/>',
  tasks:'<rect x="6" y="8" width="36" height="32" rx="3" fill="#fff" stroke="#1E8449" stroke-width="2"/><path d="M11 32l7-9 6 5 8-12 5 4" fill="none" stroke="#1E8449" stroke-width="3"/>',
  note:'<rect x="9" y="6" width="30" height="36" rx="2" fill="#FFF6C9" stroke="#B8830A" stroke-width="2"/><path d="M14 16h20M14 23h20M14 30h14" stroke="#B8830A" stroke-width="2"/>',
  net:'<rect x="4" y="30" width="40" height="10" rx="2" fill="#2E7D9A" stroke="#14465A" stroke-width="2"/><path d="M24 30V18M10 18h28M10 18v-6M24 18v-6M38 18v-6" stroke="#14465A" stroke-width="3" fill="none"/><rect x="5" y="6" width="10" height="8" fill="#3A4F7A"/><rect x="19" y="6" width="10" height="8" fill="#3A4F7A"/><rect x="33" y="6" width="10" height="8" fill="#3A4F7A"/>'
};
function sysIco(k,w){return '<svg viewBox="0 0 48 48" width="'+w+'" height="'+w+'" aria-hidden="true">'+SYSICO[k]+'</svg>'}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function stampNow(){var d=new Date();return d.toLocaleDateString('fr-FR')+' '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
function fmtSize(b){if(b<1024)return b+' octets';if(b<1048576)return (b/1024).toFixed(1).replace('.',',')+' Ko';return (b/1048576).toFixed(1).replace('.',',')+' Mo'}

function makeOS(host,cfg){
  var bootDone=false;
  var net=cfg.net||null,holder={clip:null}; // Un presse-papiers par poste : aucun transfert sans réseau.
  var os={name:cfg.name||'POSTE',user:cfg.user||'Élève',ip:cfg.ip||'192.168.1.10',cable:cfg.cable!==false,wall:0,shares:[],inbox:[],sent:[],dirs:{},
    did:{deleted:[],restored:[],purged:[],search:[],props:[]}};
  var nodes={},seq=0,wins=[],wseq=0,zTop=10,active=null,shareSeq=0;
  if(net)net.machines[os.name]=os;
  nodes.root={id:'root',name:'Ce PC',dir:true,parent:null,kids:[],content:'',size:0,mod:''};
  nodes.trash={id:'trash',name:'Corbeille',dir:true,parent:null,kids:[],content:'',size:0,mod:''};
  function mk(name,parent,dir,content,size){var n={id:'n'+(++seq),name:name,dir:!!dir,parent:parent,kids:[],content:content||'',size:size||0,mod:stampNow()};nodes[n.id]=n;if(parent&&nodes[parent])nodes[parent].kids.push(n.id);return n}
  function file(name,parent,content){return mk(name,parent,false,content||'',BASESIZE[extOf(name)]||0)}
  var D=os.dirs;
  D.bureau=mk('Bureau','root',true).id;D.docs=mk('Documents','root',true).id;D.imgs=mk('Images','root',true).id;D.dl=mk('Téléchargements','root',true).id;D.sauv=mk('Sauvegarde','root',true).id;
  os.users=cfg.users||[os.user];
  if(cfg.seed==='clubA'){file('Bonjour.txt',D.docs,'Bonjour le club !');file('affiche.png',D.imgs)}
  else if(cfg.seed==='clubB'){file('Retour.txt',D.docs,'Bien reçu, le club !')}
  else if(cfg.seed==='assessmentA'){var club=mk('Club_reseau',D.docs,true);file('Invitation.txt',club.id,window.Session4Missions.invitation)}
  else if(cfg.seed==='netA'){file('rapport.docx',D.docs);file('cours.pptx',D.docs);file('logo.png',D.imgs)}
  else if(cfg.seed==='netB0'){file('notes.txt',D.docs,'Notes de Sara : réunion du club informatique mardi.')}
  else if(cfg.seed==='netB'){var nt=mk('Notes',D.docs,true);file('notes.txt',nt.id,'Notes de Sara : réunion du club informatique mardi.');os.shares.push({id:'sh'+(++shareSeq),name:'Notes',dirId:nt.id,who:'Postes de la salle',perm:'read'})}
  else if(cfg.seed==='netA2'){var ex=mk('Échange',D.docs,true);file('rapport.docx',ex.id);file('cours.pptx',D.docs);os.shares.push({id:'sh'+(++shareSeq),name:'Échange',dirId:ex.id,who:'Postes de la salle',perm:'read'})}
  else{var cc=mk('Cours',D.docs,true);file('cours-info.pptx',cc.id);file('rapport.docx',D.docs);file('brouillon.txt',D.docs,'Brouillon du devoir : à terminer.');file('ancien.txt',D.docs,'Ancien fichier à supprimer.');file('budget.xlsx',D.docs);file('photo.jpg',D.imgs);file('logo.png',D.imgs)}

  if(cfg.snapshot && cfg.snapshot.version===2 && cfg.snapshot.name===os.name){
    var restored=JSON.parse(JSON.stringify(cfg.snapshot));
    nodes=restored.nodes;seq=restored.seq;shareSeq=restored.shareSeq;
    ['cable','wall','shares','inbox','sent','dirs','did','users','terminalHistory'].forEach(function(k){if(restored[k]!==undefined)os[k]=restored[k]});D=os.dirs;
  }
  /* --- données --- */
  function kids(id){return nodes[id].kids.map(function(k){return nodes[k]})}
  os.node=function(id){return nodes[id]};
  os.q=function(path){var cur=nodes.root;for(var i=0;i<path.length;i++){var f=null;kids(cur.id).forEach(function(k){if(k.name.toLowerCase()===path[i].toLowerCase())f=k});if(!f)return null;cur=f}return cur};
  os.findAll=function(pred){var out=[];(function walk(id){kids(id).forEach(function(k){if(pred(k))out.push(k);if(k.dir)walk(k.id)})})('root');return out};
  function pathOf(id){var a=[],n=nodes[id];while(n){a.unshift(n.name);n=n.parent?nodes[n.parent]:null}return a.join(' › ')}
  function inSub(id,anc){var n=nodes[id];while(n){if(n.id===anc)return true;n=n.parent?nodes[n.parent]:null}return false}
  function inTrash(id){return inSub(id,'trash')}
  function sizeOf(n){if(n.dir){var s=0;n.kids.forEach(function(k){s+=sizeOf(nodes[k])});return s}return extOf(n.name)==='txt'?(n.content||'').length:(n.size||1024)}
  function typeOf(n){return n.dir?'Dossier de fichiers':(TYPES[extOf(n.name)]||(extOf(n.name)?'Fichier '+extOf(n.name).toUpperCase():'Fichier'))}
  function uniq(parent,base,dir,except){
    var names={};kids(parent).forEach(function(k){if(k.id!==except)names[k.name.toLowerCase()]=1});
    if(!names[base.toLowerCase()])return base;
    var e=dir?'':extOf(base),stem=e?base.slice(0,-(e.length+1)):base,i=2,cand;
    do{cand=stem+' ('+i+')'+(e?'.'+e:'');i++}while(names[cand.toLowerCase()]);return cand;
  }
  function validName(s){s=(s||'').trim();if(!s)return 'Le nom ne peut pas être vide.';if(/[\\\/:*?"<>|]/.test(s))return 'Un nom ne peut pas contenir les caractères suivants : \\ / : * ? " < > |';return ''}
  function allDirs(){var out=[];(function walk(id,pre){kids(id).forEach(function(k){if(k.dir){out.push({id:k.id,path:pathOf(k.id)});walk(k.id)}})})('root');return out}

  if(cfg.guided&&cfg.mode==='sharing'&&os.name==='PC-21'){
    // Fournir le dossier à partager pour se concentrer sur la copie et les droits.
    if(!os.q(['Documents','Club_reseau']))mk('Club_reseau',D.docs,true);
    if(!os.q(['Documents','Bonjour.txt']))file('Bonjour.txt',D.docs,'Bonjour le club !');
  }

  /* --- opérations sur les fichiers --- */
  function detach(n){var p=nodes[n.parent];if(p)p.kids=p.kids.filter(function(k){return k!==n.id})}
  function dropTree(n){n.kids.slice().forEach(function(k){dropTree(nodes[k])});delete nodes[n.id]}
  function moveNode(id,dest){
    var n=nodes[id];if(!n||n.parent===dest)return '';
    if(n.dir&&inSub(dest,id))return 'Impossible de déplacer un dossier dans lui-même.';
    detach(n);n.parent=dest;n.name=uniq(dest,n.name,n.dir,n.id);nodes[dest].kids.push(id);os.did.moved=true;return '';
  }
  function toTrash(id){var n=nodes[id];detach(n);n.orig=n.parent;n.parent='trash';nodes.trash.kids.push(id);os.did.deleted.push(n.name.toLowerCase())}
  function restore(id){
    var n=nodes[id],p=(n.orig&&nodes[n.orig]&&!inTrash(n.orig))?n.orig:D.docs;
    nodes.trash.kids=nodes.trash.kids.filter(function(k){return k!==id});n.parent=p;n.name=uniq(p,n.name,n.dir,n.id);nodes[p].kids.push(id);os.did.restored.push(n.name.toLowerCase());
  }
  function purge(id){var n=nodes[id];nodes.trash.kids=nodes.trash.kids.filter(function(k){return k!==id});os.did.purged.push(n.name.toLowerCase());dropTree(n)}
  function cloneInto(src,sid,destId){
    var s=src.node(sid),n=mk(uniq(destId,s.name,s.dir),destId,s.dir,s.content,s.size);
    if(s.dir)s.kids.forEach(function(k){cloneInto(src,k,n.id)});return n;
  }
  os.pasteInto=function(destId,clip){
    var err='';
    clip.ids.forEach(function(id){
      var s=clip.src.node(id);if(!s)return;
      if(clip.src===os&&s.dir&&inSub(destId,id)){err='Impossible de copier un dossier dans lui-même.';return}
      if(clip.mode==='cut'&&clip.src===os){var e=moveNode(id,destId);if(e)err=e}
      else cloneInto(clip.src,id,destId);
    });
    if(clip.mode==='cut'&&clip.src===os)holder.clip=null;
    os.did.pasted=true;
    if(!err&&clip.src!==os){os.did.transfers=os.did.transfers||[];os.did.transfers.push({from:clip.src.name,names:clip.ids.map(function(id){var node=clip.src.node(id);return node&&node.name}),destination:pathOf(destId)});os.did.transfers=os.did.transfers.slice(-20);}
    if(!err)os.render();return err;
  };

  /* --- éléments d'une vue --- */
  function nodeItem(n,o){return {key:(o||'n')+':'+n.id,kind:o==='r'?'rnode':'node',node:n,name:n.name,dir:n.dir,type:typeOf(n),size:n.dir?null:sizeOf(n),mod:n.mod}}
  os.kidsOf=function(id){return kids(id)};
  os.pathStr=pathOf;
  function shareOf(R,id){var f=null;if(R)R.shares.forEach(function(s){if(s.id===id)f=s});return f}
  function reach(R){return os.cable&&R&&R.cable}
  function isShared(id){return os.shares.some(function(s){return s.dirId===id})}
  function listFor(c){
    var L=c.loc,items=[],res={items:items,write:false,ro:false};
    if(L.k==='dir'){
      if(c.desk){items.push({key:'f:pc',kind:'fixed',ico:'pc',name:'Ce PC',type:'Système'});items.push({key:'f:trash',kind:'fixed',ico:'trash',name:'Corbeille',type:'Système',dropT:'trash'});if(net)items.push({key:'f:net',kind:'fixed',ico:'net',name:'Réseau',type:'Système'})}
      var q=(c.query||'').trim().toLowerCase();
      if(q){os.findAll(function(n){return n.name.toLowerCase().indexOf(q)>=0&&n.id!==L.id&&inSub(n.id,L.id)&&!inTrash(n.id)}).forEach(function(n){var it=nodeItem(n);it.where=pathOf(n.parent);items.push(it)});res.search=true}
      else kids(L.id).forEach(function(n){items.push(nodeItem(n))});
      res.write=true;
    }else if(L.k==='trash'){nodes.trash.kids.forEach(function(id){var n=nodes[id],it=nodeItem(n);it.where=n.orig&&nodes[n.orig]?pathOf(n.orig):'Documents';items.push(it)});res.trash=true}
    else if(L.k==='net'){
      if(!os.cable)res.msg='Pas de connexion réseau : le câble réseau de ce poste est débranché.';
      else Object.keys(net.machines).forEach(function(nm){if(nm===os.name)return;var m=net.machines[nm];if(!m.cable)return;items.push({key:'h:'+nm,kind:'host',name:nm,dir:true,type:'Ordinateur · '+m.ip})});
      if(!res.msg&&!items.length)res.msg='Aucun ordinateur trouvé sur le réseau.';
    }else if(L.k==='host'){
      var R=net.machines[L.host];
      if(!reach(R))res.msg='Impossible d’accéder à \\\\'+L.host+' : ce poste est injoignable (câble débranché ?).';
      else{R.shares.forEach(function(s){items.push({key:'s:'+s.id,kind:'share',name:s.name,dir:true,type:'Dossier partagé',host:L.host,share:s})});if(!items.length)res.msg='Aucun dossier partagé sur \\\\'+L.host+'.'}
    }else if(L.k==='share'){
      var R2=net.machines[L.host],sh=shareOf(R2,L.shareId);
      if(!reach(R2))res.msg='Connexion perdue : \\\\'+L.host+' est injoignable.';
      else if(!sh)res.msg='Ce dossier n’est plus partagé.';
      else if(sh.who!=='Postes de la salle')res.msg='Accès refusé. Le propriétaire n’a pas partagé ce dossier avec vous.';
      else{R2.kidsOf(L.dirId).forEach(function(n){var it=nodeItem(n,'r');it.os=R2;items.push(it)});res.write=sh.perm==='write';res.ro=!res.write;res.remote=R2}
    }
    return res;
  }
  function itemIcon(it,w){
    if(it.kind==='fixed')return sysIco(it.ico,w);
    if(it.kind==='host')return sysIco('pc',w);
    return it.dir?icoFolder(w):icoFile(extOf(it.name),w);
  }
  function ctxOf(c){
    var L=c.loc;
    if(L.k==='dir')return {os:os,dir:L.id,write:true};
    if(L.k==='share'){var R=net.machines[L.host],sh=shareOf(R,L.shareId);return {os:R,dir:L.dirId,write:!!(sh&&sh.perm==='write'&&sh.who==='Postes de la salle'&&reach(R)),remote:true}}
    return null;
  }
  function relPath(R,fromId,toId){var a=[],n=R.node(toId);while(n&&n.id!==fromId){a.unshift(n.name);n=n.parent?R.node(n.parent):null}return a}
  function addrOf(c){
    var L=c.loc;
    if(L.k==='dir')return pathOf(L.id);
    if(L.k==='trash')return 'Corbeille';
    if(L.k==='net')return 'Réseau';
    if(L.k==='host')return '\\\\'+L.host;
    var R=net.machines[L.host],sh=shareOf(R,L.shareId);
    return '\\\\'+L.host+'\\'+(sh?sh.name:'?')+relPath(R,sh?sh.dirId:'',L.dirId).map(function(x){return '\\'+x}).join('');
  }

  /* --- opérations (appelées aussi par les autres postes) --- */
  os.rename=function(id,name){
    var n=nodes[id];name=(name||'').trim();var e=validName(name);if(e)return e;
    if(name===n.name)return '';
    var dup=false;kids(n.parent).forEach(function(k){if(k.id!==id&&k.name.toLowerCase()===name.toLowerCase())dup=true});
    if(dup)return 'Ce nom existe déjà dans ce dossier. Choisissez un autre nom.';
    n.name=name;n.mod=stampNow();os.did.renamed=true;os.render();return '';
  };
  os.newNode=function(parent,dir){var n=mk(uniq(parent,dir?'Nouveau dossier':'Nouveau document.txt',dir),parent,dir,'',0);if(dir)os.did.mkdir=true;else os.did.mkfile=true;return n};
  os.trashIds=function(ids){ids.forEach(function(id){if(nodes[id]&&!inTrash(id)&&id!=='root')toTrash(id)});os.render()};
  os.restoreIds=function(ids){ids.forEach(function(id){if(nodes[id]&&inTrash(id)&&nodes[id].parent==='trash')restore(id)});os.render()};
  os.emptyTrash=function(){nodes.trash.kids.slice().forEach(purge);os.did.emptied=true;os.render()};
  os.moveIds=function(ids,dest){var err='';ids.forEach(function(id){var e=moveNode(id,dest);if(e)err=e});os.render();return err};
  os.saveNode=function(id,text){var n=nodes[id];n.content=text;n.mod=stampNow();os.did.saved=true;os.render()};
  os.saveNew=function(name,text){var n=mk(uniq(D.docs,name,false),D.docs,false,text,0);os.did.saved=true;os.render();return n};
  os.shareDir=function(id,name,who,perm){
    name=(name||'').trim();var e=validName(name);if(e)return e;
    var ex=null;os.shares.forEach(function(s){if(s.dirId===id)ex=s});
    if(ex){ex.name=name;ex.who=who;ex.perm=perm}else os.shares.push({id:'sh'+(++shareSeq),name:name,dirId:id,who:who,perm:perm});
    os.did.shared=true;os.render();os.others();return '';
  };
  os.unshare=function(id){os.shares=os.shares.filter(function(s){return s.dirId!==id});os.did.unshared=true;os.render();os.others()};
  os.others=function(){if(net)Object.keys(net.machines).forEach(function(k){if(net.machines[k]!==os)net.machines[k].render()})};
  os.reachable=reach;
  os.deliver=function(msg){os.inbox.unshift(msg);os.render()};

  /* --- écran --- */
  var scr=document.createElement('div');scr.className='osx';scr.tabIndex=0;
  scr.innerHTML='<div class="osdesk"></div><div class="oswins"></div><div class="osstart" hidden></div>'+
    '<div class="osbar"><button type="button" class="osbtn osgo">Démarrer</button><div class="ostasks"></div><div class="ostray"></div></div>'+
    '<div class="osctx" hidden></div><div class="ostoast" aria-live="polite"></div>'+
    '<div class="osoff" hidden><p>Le poste est éteint.</p><button type="button" class="btn primary">Allumer</button></div>';
  host.appendChild(scr);
  var deskEl=$('.osdesk',scr),winsEl=$('.oswins',scr),startEl=$('.osstart',scr),ctxEl=$('.osctx',scr),tasksEl=$('.ostasks',scr),trayEl=$('.ostray',scr);
  os.screen=scr;
  function say(m,bad){var t=$('.ostoast',scr);t.textContent=m;t.className='ostoast show'+(bad?' bad':'');clearTimeout(say.t);say.t=setTimeout(function(){t.className='ostoast'},3600)}
  os.say=say;
  function narrow(){var w=scr.clientWidth;return w>0&&w<640}
  function setWall(){scr.style.background=WALLS[os.wall][1]}

  /* --- vues (bureau et explorateurs) --- */
  var deskC={loc:{k:'dir',id:D.bureau},query:'',sel:[],items:{},desk:true,hist:[]};
  function paint(c,el){
    var r=listFor(c);c.items={};c.res=r;el.innerHTML='';
    if(r.msg){var m=document.createElement('div');m.className='osempty';m.textContent=r.msg;el.appendChild(m);return r}
    if(!r.items.length&&!c.desk){var e=document.createElement('div');e.className='osempty';e.textContent=r.search?'Aucun élément ne correspond à votre recherche.':(r.trash?'La corbeille est vide.':'Ce dossier est vide.');el.appendChild(e);return r}
    var clip=holder.clip;
    r.items.forEach(function(it){
      c.items[it.key]=it;
      var d=document.createElement('div');
      d.className='ositem'+(c.sel.indexOf(it.key)>=0?' sel':'')+(clip&&clip.mode==='cut'&&it.node&&clip.src===os&&clip.ids.indexOf(it.node.id)>=0?' cut':'');
      d.dataset.key=it.key;d.setAttribute('role','button');d.tabIndex=0;d.setAttribute('aria-label',it.name);d.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();openItem(c,it)}});
      if(it.kind==='node'&&it.dir)d.dataset.drop=it.node.id;
      if(it.dropT)d.dataset.drop=it.dropT;
      d.innerHTML='<span class="osi">'+itemIcon(it,c.desk?44:38)+(it.kind==='node'&&it.dir&&isShared(it.node.id)?'<b class="osbadge" title="Dossier partagé">⇄</b>':'')+'</span><span class="osn"></span>'+(it.where?'<span class="osw"></span>':'');
      if(it.where)$('.osw',d).textContent=it.where;
      if(c.edit===it.key){
        var inp=document.createElement('input');inp.type='text';inp.className='osedit';inp.value=it.name;inp.setAttribute('aria-label','Nouveau nom');
        $('.osn',d).appendChild(inp);
        c.focusEdit=function(){inp.focus();var dot=it.dir?-1:inp.value.lastIndexOf('.');inp.setSelectionRange(0,dot>0?dot:inp.value.length)};
        var done=false;
        function fin(ok){if(done)return;done=true;c.edit=null;if(ok){var tgt=it.os||os;var err=tgt.rename(it.node.id,inp.value);if(err){say(err,true);c.edit=it.key;done=false;refreshAll();return}if(tgt!==os)tgt.render()}refreshAll()}
        inp.addEventListener('keydown',function(ev){ev.stopPropagation();if(ev.key==='Enter'){fin(true)}else if(ev.key==='Escape'){fin(false)}});
        inp.addEventListener('blur',function(){fin(true)});
        inp.addEventListener('click',function(ev){ev.stopPropagation()});inp.addEventListener('dblclick',function(ev){ev.stopPropagation()});
      }else $('.osn',d).textContent=it.name;
      el.appendChild(d);
    });
    if(c.focusEdit){var fe=c.focusEdit;c.focusEdit=null;fe()}
    return r;
  }
  function selItems(c){return c.sel.map(function(k){return c.items[k]}).filter(Boolean)}
  function go(c,loc,noHist){
    if(!noHist)c.hist.push(c.loc);c.loc=loc;if(loc.k==='net')os.did.sawNet=true;c.query='';c.sel=[];c.edit=null;
    if(c.win&&c.win.search)c.win.search.value='';
    refreshAll();
  }
  function up(c){
    var L=c.loc;
    if(L.k==='dir'){var n=nodes[L.id];if(n&&n.parent)go(c,{k:'dir',id:n.parent})}
    else if(L.k==='trash')go(c,{k:'dir',id:'root'});
    else if(L.k==='net')go(c,{k:'dir',id:'root'});
    else if(L.k==='host')go(c,{k:'net'});
    else if(L.k==='share'){var R=net.machines[L.host],sh=shareOf(R,L.shareId);if(sh&&L.dirId!==sh.dirId)go(c,{k:'share',host:L.host,shareId:L.shareId,dirId:R.node(L.dirId).parent});else go(c,{k:'host',host:L.host})}
  }
  function openItem(c,it){
    if(!it)return;
    if(it.kind==='fixed'){if(it.key==='f:pc')openExplorer({k:'dir',id:'root'});else if(it.key==='f:trash')openExplorer({k:'trash'});else openExplorer({k:'net'});return}
    if(c.res&&c.res.trash){say('Impossible d’ouvrir un élément de la corbeille. Restaurez-le d’abord.',true);return}
    if(it.kind==='host'){go(c,{k:'host',host:it.name});return}
    if(it.kind==='share'){go(c,{k:'share',host:it.host,shareId:it.share.id,dirId:it.share.dirId});return}
    if(it.kind==='node'){if(it.dir){go(c,{k:'dir',id:it.node.id});return}}
    if(it.kind==='rnode'&&it.dir){var L=c.loc;go(c,{k:'share',host:L.host,shareId:L.shareId,dirId:it.node.id});return}
    var ext=extOf(it.name);
    if(ext==='txt'||ext===''){openNote(it.os||os,it.node,!!(c.res&&c.res.write));return}
    var app={docx:'Word',xlsx:'le tableur',pptx:'le logiciel de présentation',jpg:'la visionneuse d’images',png:'la visionneuse d’images'}[ext]||'une application';
    os.did.opened=true;say('Ouverture de « '+it.name+' » avec '+app+'…');
  }
  function clipOf(c,mode){
    var its=selItems(c).filter(function(i){return i.kind==='node'||i.kind==='rnode'});
    if(!its.length){say('Sélectionnez d’abord un fichier ou un dossier.',true);return}
    var src=its[0].os||os;
    if(mode==='cut'&&src!==os){mode='copy';say('Sur un autre poste, « Couper » n’est pas possible : c’est une copie qui est faite.')}
    else if(mode==='cut'&&c.res.trash){say('Restaurez d’abord les éléments.',true);return}
    holder.clip={src:src,ids:its.map(function(i){return i.node.id}),mode:mode,share:c.loc.k==='share'?{host:c.loc.host,id:c.loc.shareId}:null};
    if(mode==='copy'||src!==os)say(its.length>1?its.length+' éléments copiés dans le presse-papiers.':'« '+its[0].name+' » copié dans le presse-papiers.');
    else say('« '+(its.length>1?its.length+' éléments':its[0].name)+' » coupé : allez dans le dossier de destination et choisissez Coller.');
    refreshAll();
  }
  function act(c,name,viaKey){
    var cx=ctxOf(c),its=selItems(c),r=c.res||{};
    function denyW(){if(c.loc.k==='share'){if(!r.write){if(r.ro)os.did.denied=(os.did.denied||0)+1;say(r.ro?'Accès refusé : ce dossier partagé est en lecture seule. Le propriétaire doit autoriser la modification.':'Action impossible ici.',true)}}else say('Action impossible à cet endroit.',true)}
    if(name==='newdir'||name==='newfile'){
      if(!cx||!cx.write){denyW();return}
      var n=cx.os.newNode(cx.dir,name==='newdir');var key=(cx.os===os?'n:':'r:')+n.id;
      c.sel=[key];c.edit=key;if(cx.os!==os)cx.os.render();refreshAll();return;
    }
    if(name==='copy'||name==='cut'){if(viaKey)os.did.keys=true;clipOf(c,name);return}
    if(name==='paste'){
      var cl=holder.clip;
      if(!cl){say('Le presse-papiers est vide : copiez ou coupez d’abord un élément.',true);return}
      if(!cx||!cx.write){denyW();return}
      if(viaKey)os.did.keys=true;
      if(cl.src!==os){var sourceShare=cl.share&&shareOf(cl.src,cl.share.id);if(!reach(cl.src)||!sourceShare||sourceShare.who!=='Postes de la salle'){say('Copie impossible : le dossier source n’est plus accessible par le réseau.',true);return}}
      var err=cx.os.pasteInto(cx.dir,cl);
      if(err){say(err,true)}else{if(cl.mode==='copy'||cl.src!==cx.os)os.did.copied=true;say('Élément collé.')}
      if(cx.os!==os)cx.os.render();refreshAll();return;
    }
    if(name==='del'){
      if(r.trash){say('Dans la corbeille, utilisez « Restaurer » ou « Vider la corbeille ».',true);return}
      var nodesSel=its.filter(function(i){return i.kind==='node'||i.kind==='rnode'});
      if(!nodesSel.length){say('Sélectionnez d’abord un élément à supprimer.',true);return}
      if(!cx||!cx.write){denyW();return}
      if(viaKey)os.did.keys=true;
      cx.os.trashIds(nodesSel.map(function(i){return i.node.id}));c.sel=[];
      say('Déplacé dans la corbeille de '+(cx.os===os?'ce poste':cx.os.name)+'.');if(cx.os!==os)cx.os.render();refreshAll();return;
    }
    if(name==='restore'){
      if(!its.length){say('Sélectionnez l’élément à restaurer.',true);return}
      os.restoreIds(its.map(function(i){return i.node.id}));c.sel=[];say('Élément restauré à son emplacement d’origine.');refreshAll();return;
    }
    if(name==='empty'){
      if(!nodes.trash.kids.length){say('La corbeille est déjà vide.');return}
      confirmBox('Supprimer définitivement ces '+nodes.trash.kids.length+' élément(s) ? Cette action est irréversible.','Vider la corbeille',function(){os.emptyTrash();c.sel=[];say('Corbeille vidée.');refreshAll()});return;
    }
    if(name==='rename'){
      var one=its.length===1?its[0]:null;
      if(!one||(one.kind!=='node'&&one.kind!=='rnode')){say('Sélectionnez un seul élément à renommer.',true);return}
      if(one.kind==='rnode'&&!(cx&&cx.write)){denyW();return}
      if(r.trash){say('Restaurez d’abord cet élément pour le renommer.',true);return}
      c.edit=one.key;refreshAll();return;
    }
    if(name==='props'){
      var it=its.length?its[0]:null;
      if(it&&(it.kind==='node'||it.kind==='rnode'))openProps(it.os||os,it.node);
      else if(cx&&cx.os&&c.loc.k==='dir')openProps(os,nodes[c.loc.id]);
      else if(cx&&c.loc.k==='share')openProps(cx.os,cx.os.node(c.loc.dirId));
      return;
    }
    if(name==='share'){
      var d=its.length===1?its[0]:null;
      if(!d||d.kind!=='node'||!d.dir){say('Pour partager, sélectionnez d’abord un dossier de ce poste.',true);return}
      openShare(d.node);return;
    }
    if(name==='open'){if(its.length)openItem(c,its[0]);else say('Sélectionnez un élément à ouvrir.',true);return}
    if(name==='refresh'){refreshAll();return}
    if(name==='settings'){openSettings();return}
  }
  function dropOn(c,target,ids){
    if(target==='trash'){os.trashIds(ids);c.sel=[];say('Déplacé dans la corbeille.');os.did.dragged=true;refreshAll();return}
    if(!nodes[target]||!nodes[target].dir)return;
    var err=os.moveIds(ids.filter(function(i){return i!==target}),target);
    if(err)say(err,true);else{say('Élément déplacé vers « '+nodes[target].name+' ».');os.did.dragged=true}
    c.sel=[];refreshAll();
  }
  function selUpd(c,el){$$('.ositem',el).forEach(function(d){d.classList.toggle('sel',c.sel.indexOf(d.dataset.key)>=0)})}
  function wireView(c,el,winObj){
    el.addEventListener('click',function(e){
      var d=e.target.closest('.ositem');
      if(!d){c.sel=[];selUpd(c,el);syncWin(winObj);scr.focus({preventScroll:true});return}
      var k=d.dataset.key;
      if(e.ctrlKey||e.metaKey){var i=c.sel.indexOf(k);if(i>=0)c.sel.splice(i,1);else c.sel.push(k)}else c.sel=[k];
      selUpd(c,el);syncWin(winObj);scr.focus({preventScroll:true});
    });
    el.addEventListener('dblclick',function(e){var d=e.target.closest('.ositem');if(!d)return;var it=c.items[d.dataset.key];openItem(c,it)});
    el.addEventListener('contextmenu',function(e){
      e.preventDefault();var d=e.target.closest('.ositem');
      if(d){if(c.sel.indexOf(d.dataset.key)<0){c.sel=[d.dataset.key];selUpd(c,el);syncWin(winObj)}}else{c.sel=[];selUpd(c,el);syncWin(winObj)}
      showCtx(c,e.clientX,e.clientY,!!d);
    });
    el.addEventListener('pointerdown',function(e){
      if(e.button!==0)return;
      var d=e.target.closest('.ositem');if(!d||e.target.closest('input'))return;
      var item=c.items[d.dataset.key];if(!item||item.kind!=='node'||c.res.trash)return;
      var sx=e.clientX,sy=e.clientY,ghost=null,started=false;
      function mv(ev){
        if(!started&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>8){
          started=true;if(c.sel.indexOf(item.key)<0){c.sel=[item.key];selUpd(c,el)}
          ghost=document.createElement('div');ghost.className='osghost';ghost.textContent=c.sel.length>1?c.sel.length+' éléments':item.name;scr.appendChild(ghost);
        }
        if(started){var rc=scr.getBoundingClientRect();ghost.style.left=(ev.clientX-rc.left+10)+'px';ghost.style.top=(ev.clientY-rc.top+8)+'px';ev.preventDefault()}
      }
      function upf(ev){
        document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',upf);document.removeEventListener('pointercancel',upf);
        if(!started)return;ghost.remove();
        var t=document.elementFromPoint(ev.clientX,ev.clientY),z=t&&t.closest('[data-drop]');
        if(z&&scr.contains(z)){
          var ids=selItems(c).filter(function(i){return i.kind==='node'}).map(function(i){return i.node.id});
          dropOn(c,z.dataset.drop,ids);
        }
        suppress=true;setTimeout(function(){suppress=false},0);
      }
      document.addEventListener('pointermove',mv,{passive:false});document.addEventListener('pointerup',upf);document.addEventListener('pointercancel',upf);
    });
  }
  var suppress=false;
  scr.addEventListener('click',function(e){if(suppress){e.stopPropagation();e.preventDefault()}},true);

  /* --- menu contextuel --- */
  function showCtx(c,x,y,onItem){
    var r=c.res||{},cx=ctxOf(c),its=selItems(c),list=[];
    var isNode=its.length&&(its[0].kind==='node'||its[0].kind==='rnode');
    if(r.trash){
      if(isNode)list.push(['Restaurer','restore']);
      list.push(['Vider la corbeille','empty']);
    }else if(onItem){
      list.push(['Ouvrir','open']);
      if(isNode){list.push(['Couper','cut'],['Copier','copy'])}
      if(net&&its.length===1&&its[0].kind==='node'&&its[0].dir)list.push(['Partager…','share']);
      if(isNode){list.push(['Supprimer','del'],['Renommer','rename'],['Propriétés','props'])}
    }else{
      if(cx&&cx.write){list.push(['Nouveau dossier','newdir'],['Nouveau document texte','newfile'])}
      list.push(['Coller','paste']);
      if(c.desk)list.push(['Personnaliser (fond d’écran)','settings']);
      list.push(['Actualiser','refresh']);
      if(cx&&c.loc.k==='dir'&&!c.desk)list.push(['Propriétés','props']);
    }
    ctxEl.innerHTML='';
    list.forEach(function(a){var b=document.createElement('button');b.type='button';b.textContent=a[0];b.addEventListener('click',function(){hideCtx();act(c,a[1])});ctxEl.appendChild(b)});
    ctxEl.hidden=false;
    var rc=scr.getBoundingClientRect();
    ctxEl.style.left=Math.max(4,Math.min(x-rc.left,rc.width-ctxEl.offsetWidth-4))+'px';
    ctxEl.style.top=Math.max(4,Math.min(y-rc.top,rc.height-ctxEl.offsetHeight-44))+'px';
  }
  function hideCtx(){ctxEl.hidden=true}
  scr.addEventListener('pointerdown',function(e){
    if(!ctxEl.hidden&&!e.target.closest('.osctx'))hideCtx();
    if(!startEl.hidden&&!e.target.closest('.osstart')&&!e.target.closest('.osgo'))startEl.hidden=true;
  });

  /* --- fenêtres --- */
  function openWin(o){
    var w={id:++wseq,type:o.type,title:o.title,min:false,max:false,frozen:false,refresh:o.refresh||null,onclose:o.onclose||null};
    var el=document.createElement('div');el.className='oswin';
    el.innerHTML='<div class="oswt"><span class="oswtitle"></span><button type="button" class="oswb-min" aria-label="Réduire">–</button><button type="button" class="oswb-max" aria-label="Agrandir">▢</button><button type="button" class="oswb-x" aria-label="Fermer">✕</button></div><div class="oswbody"></div>';
    w.el=el;w.body=$('.oswbody',el);
    var sw=scr.clientWidth||600,sh=scr.clientHeight||460;
    var ww=Math.min(o.w||520,sw-16),hh=Math.min(o.h||320,sh-52);
    var n=wins.length%6;
    el.style.width=ww+'px';el.style.height=hh+'px';el.style.left=Math.max(4,Math.min(16+n*26,sw-ww-4))+'px';el.style.top=Math.max(4,Math.min(10+n*22,sh-hh-48))+'px';
    if(narrow()||o.max){w.max=true;el.classList.add('max')}
    winsEl.appendChild(el);wins.push(w);
    w.setTitle=function(t){w.title=t;$('.oswtitle',el).textContent=t;renderBar()};
    $('.oswtitle',el).textContent=w.title;
    el.addEventListener('pointerdown',function(){focusWin(w)},true);
    $('.oswb-min',el).addEventListener('click',function(){minWin(w)});
    $('.oswb-max',el).addEventListener('click',function(){toggleMax(w)});
    $('.oswb-x',el).addEventListener('click',function(){closeWin(w)});
    var t=$('.oswt',el);
    t.addEventListener('dblclick',function(e){if(!e.target.closest('button'))toggleMax(w)});
    t.addEventListener('pointerdown',function(e){
      if(e.target.closest('button')||w.max)return;
      var rc=el.getBoundingClientRect(),sr=scr.getBoundingClientRect(),dx=e.clientX-rc.left,dy=e.clientY-rc.top;
      function mv(ev){el.style.left=Math.max(-ww+60,Math.min(ev.clientX-sr.left-dx,sr.width-60))+'px';el.style.top=Math.max(0,Math.min(ev.clientY-sr.top-dy,sr.height-80))+'px';ev.preventDefault()}
      function upf(){document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',upf)}
      document.addEventListener('pointermove',mv,{passive:false});document.addEventListener('pointerup',upf);
    });
    if(o.build)o.build(w);
    focusWin(w);renderBar();
    return w;
  }
  function focusWin(w){
    active=w;zTop++;w.el.style.zIndex=zTop;
    wins.forEach(function(x){x.el.classList.toggle('inactive',x!==w)});
    renderBar();
  }
  function minWin(w){
    w.min=true;w.el.classList.add('mini');os.did.minmax=true;os.did.minimized=true;
    var vis=wins.filter(function(x){return !x.min});active=vis.length?vis[vis.length-1]:null;
    wins.forEach(function(x){x.el.classList.toggle('inactive',x!==active)});renderBar();
  }
  function toggleMax(w){w.max=!w.max;w.el.classList.toggle('max',w.max);os.did.minmax=true;os.did.maxed=true}
  function closeWin(w,force){
    if(w.frozen&&!force){say('Cette application ne répond pas. Ouvrez le Gestionnaire des tâches (menu Démarrer) pour la fermer.',true);return}
    if(w.onclose&&w.onclose(force)===false)return;
    if(w.timer)clearTimeout(w.timer);w.el.remove();wins=wins.filter(function(x){return x!==w});
    if(active===w){var vis=wins.filter(function(x){return !x.min});active=vis.length?vis[vis.length-1]:null;if(active)focusWin(active)}
    renderBar();
  }
  function confirmBox(text,okLabel,fn){
    var w=openWin({type:'dlg',title:'Confirmation',w:340,h:170,build:function(w){
      w.body.innerHTML='<div class="osdlg"><p></p><div class="osrow"><button type="button" class="btn primary" data-ok></button><button type="button" class="btn" data-no>Annuler</button></div></div>';
      $('p',w.body).textContent=text;$('[data-ok]',w.body).textContent=okLabel;
    }});
    w.el.classList.remove('max');
    $('[data-ok]',w.body).addEventListener('click',function(){closeWin(w,true);fn()});
    $('[data-no]',w.body).addEventListener('click',function(){closeWin(w,true)});
  }
  function syncWin(w){if(w&&w.syncUI)w.syncUI()}
  function refreshAll(){paint(deskC,deskEl);wins.forEach(function(w){if(w.refresh)w.refresh()});renderBar();if(cfg.onchange)cfg.onchange(os)}
  os.render=refreshAll;

  os.info=function(id){
    var n=nodes[id],cnt=0,dcnt=0;
    if(n.dir)n.kids.forEach(function(k){if(nodes[k].dir)dcnt++;else cnt++});
    var sh=null;os.shares.forEach(function(s){if(s.dirId===id)sh=s});
    return {name:n.name,dir:n.dir,type:typeOf(n),path:n.parent?pathOf(n.parent):'',size:sizeOf(n),mod:n.mod,files:cnt,dirs:dcnt,share:sh};
  };
  os.saveAttachment=function(att){var n=mk(uniq(D.dl,att.name,false),D.dl,false,att.content,att.size);os.did.attSaved=true;os.render();return n};

  /* --- explorateur --- */
  var CMDS=[['newdir','Nouveau dossier','n'],['newfile','Nouveau fichier','n'],['cut','Couper','n'],['copy','Copier','n'],['paste','Coller','n'],['rename','Renommer','n'],['del','Supprimer','n'],['share','Partager','s'],['props','Propriétés','n'],['open','Ouvrir','nh'],['restore','Restaurer','t'],['empty','Vider la corbeille','t']];
  function openExplorer(loc){
    var c={loc:loc,query:'',sel:[],items:{},hist:[]};
    var w=openWin({type:'exp',title:'Explorateur de fichiers',w:640,h:352,build:function(w){
      w.body.innerHTML='<div class="oxtb"><button type="button" data-b="back" aria-label="Retour">←</button><button type="button" data-b="up" aria-label="Dossier parent">↑</button><input type="text" class="oxaddr" aria-label="Adresse" spellcheck="false"><input type="search" class="oxsearch" placeholder="Rechercher…" aria-label="Rechercher"></div>'+
        '<div class="oxcmd" role="toolbar" aria-label="Commandes"></div><div class="oxmain"><nav class="oxside" aria-label="Dossiers"></nav><div class="oxlist" tabindex="0" aria-label="Contenu du dossier"></div></div><div class="oxstat" aria-live="polite"></div>';
    }});
    w.c=c;c.win=w;
    var listEl=$('.oxlist',w.body),addr=$('.oxaddr',w.body),srch=$('.oxsearch',w.body),cmd=$('.oxcmd',w.body),side=$('.oxside',w.body),stat=$('.oxstat',w.body);
    w.search=srch;
    if(cfg.guided)addr.readOnly=true;
    CMDS.forEach(function(m){
      if(m[0]==='share'&&!net)return;
      var b=document.createElement('button');b.type='button';b.dataset.cmd=m[0];b.dataset.g=m[2];b.textContent=m[1];
      b.addEventListener('click',function(){act(c,m[0])});cmd.appendChild(b);
    });
    var places=[['Bureau',{k:'dir',id:D.bureau}],['Documents',{k:'dir',id:D.docs}],['Images',{k:'dir',id:D.imgs}],['Téléchargements',{k:'dir',id:D.dl}],['Sauvegarde',{k:'dir',id:D.sauv}],['Corbeille',{k:'trash'}]];
    if(net)places.push(['Réseau',{k:'net'}]);
    places.unshift(['Ce PC',{k:'dir',id:'root'}]);
    places.forEach(function(p){
      var b=document.createElement('button');b.type='button';b.textContent=p[0];b.dataset.pk=JSON.stringify(p[1]);
      if(p[1].k==='trash')b.dataset.drop='trash';else if(p[1].k==='dir'&&p[1].id!=='root')b.dataset.drop=p[1].id;
      b.addEventListener('click',function(){go(c,p[1])});side.appendChild(b);
    });
    $('[data-b="back"]',w.body).addEventListener('click',function(){if(c.hist.length)go(c,c.hist.pop(),true)});
    $('[data-b="up"]',w.body).addEventListener('click',function(){up(c)});
    addr.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Enter')goAddr(c,addr.value)});
    srch.addEventListener('keydown',function(e){e.stopPropagation()});
    srch.addEventListener('input',function(){
      c.query=srch.value;c.sel=[];var r=paint(c,listEl);
      if(c.query.trim()&&r.items&&r.items.length)os.did.search.push(c.query.trim().toLowerCase());
      syncWin(w);
    });
    w.syncUI=function(){
      var r=c.res||{items:[]},n=r.items?r.items.length:0,s=c.sel.length;
      var t=s?s+' élément'+(s>1?'s':'')+' sélectionné'+(s>1?'s':''):n+' élément'+(n>1?'s':'');
      if(c.loc.k==='share')t+=' — '+(r.write?'lecture et écriture':(r.ro?'lecture seule':''));
      stat.textContent=t;
    };
    w.refresh=function(){
      if(!nodes[c.loc.id]&&c.loc.k==='dir')c.loc={k:'dir',id:'root'};
      paint(c,listEl);
      if(document.activeElement!==addr)addr.value=addrOf(c);
      if(document.activeElement!==srch)srch.value=c.query||'';
      var L=c.loc,g=L.k==='trash'?'t':(L.k==='dir'||L.k==='share'?'n':'h');
      $$('[data-cmd]',cmd).forEach(function(b){
        var grp=b.dataset.g,show=g==='t'?grp==='t':(g==='h'?grp.indexOf('h')>=0:(grp!=='t'));
        if(b.dataset.cmd==='share'&&L.k!=='dir')show=false;
        b.hidden=!show;b.style.display=show?'':'none';
      });
      $$('[data-pk]',side).forEach(function(b){var p=JSON.parse(b.dataset.pk);b.classList.toggle('on',p.k===L.k&&(p.k!=='dir'||p.id===L.id))});
      var ttl=L.k==='dir'?nodes[L.id].name:(L.k==='trash'?'Corbeille':(L.k==='net'?'Réseau':addrOf(c).split('\\').pop()));
      w.setTitle(ttl+' - Explorateur');
      w.syncUI();
    };
    wireView(c,listEl,w);
    listEl.addEventListener('pointerdown',function(){});
    w.refresh();
    return w;
  }
  function goAddr(c,txt){
    txt=txt.trim();
    var m=txt.match(/^\\\\([^\\]+)(?:\\(.*))?$/);
    if(!m){if(txt!==addrOf(c))say('Pour aller sur un autre poste, tapez une adresse de la forme \\\\NOM\\Dossier.',true);refreshAll();return}
    if(!net){say('Ce poste n’est pas relié à un réseau.',true);refreshAll();return}
    var hn=null;Object.keys(net.machines).forEach(function(k){if(k.toLowerCase()===m[1].toLowerCase()||net.machines[k].ip===m[1])hn=k});
    if(!hn||hn===os.name||!reach(net.machines[hn])){say('Windows ne trouve pas « '+txt+' ». Vérifiez l’orthographe ou la connexion réseau.',true);refreshAll();return}
    var R=net.machines[hn];
    if(m[2]){
      var seg=m[2].split('\\')[0].toLowerCase(),sh=null;R.shares.forEach(function(s){if(s.name.toLowerCase()===seg)sh=s});
      if(!sh){say('Le dossier partagé « '+m[2]+' » est introuvable sur '+hn+'.',true);refreshAll();return}
      go(c,{k:'share',host:hn,shareId:sh.id,dirId:sh.dirId});os.did.addr=true;
    }else{go(c,{k:'host',host:hn});os.did.addr=true}
  }

  /* --- propriétés --- */
  function openProps(src,n){
    var inf=src.info(n.id);os.did.props.push(inf.name.toLowerCase());
    openWin({type:'dlg',title:'Propriétés de '+inf.name,w:360,h:310,build:function(w){
      w.body.innerHTML='<div class="osdlg"><div class="ospr"><span></span><b></b></div><table class="ostable"></table><div class="osrow"><button type="button" class="btn primary">Fermer</button></div></div>';
      $('.ospr span',w.body).innerHTML=inf.dir?icoFolder(44):icoFile(extOf(inf.name),36);
      $('.ospr b',w.body).textContent=inf.name;
      var rows=[['Type',inf.type],['Emplacement',(src===os?'':'\\\\'+src.name+' : ')+inf.path],['Taille',fmtSize(inf.size)]];
      if(inf.dir)rows.push(['Contenu',inf.files+' fichier'+(inf.files>1?'s':'')+', '+inf.dirs+' dossier'+(inf.dirs>1?'s':'')]);
      rows.push(['Modifié le',inf.mod]);
      if(inf.share)rows.push(['Partage','\\\\'+src.name+'\\'+inf.share.name+' ('+(inf.share.perm==='write'?'lecture et écriture':'lecture seule')+')']);
      var t=$('table',w.body);rows.forEach(function(r){var tr=document.createElement('tr'),a=document.createElement('th'),b=document.createElement('td');a.textContent=r[0];b.textContent=r[1];tr.appendChild(a);tr.appendChild(b);t.appendChild(tr)});
      $('.btn',w.body).addEventListener('click',function(){closeWin(w,true)});
    }}).el.classList.remove('max');
  }

  /* --- partage --- */
  function openShare(n,guidedName){
    var w=openWin({type:'dlg',title:'Partager « '+n.name+' »',w:400,h:360});
    w.shareFolder=n.id;
    w.el.classList.remove('max');
    function draw(msg){
      var ex=null;os.shares.forEach(function(s){if(s.dirId===n.id)ex=s});
      w.body.innerHTML='<div class="osdlg osform"><p class="osok"></p>'+
        '<label>Nom du partage<input type="text" data-nm></label>'+
        '<label>Avec qui ?<select data-who><option>Moi seulement</option><option>Postes de la salle</option></select></label>'+
        '<label>Autorisation<select data-perm><option value="read">Lecture seule</option><option value="write">Lecture et écriture</option></select></label>'+
        '<p class="osmuted" data-msg></p><div class="osrow"><button type="button" class="btn primary" data-ok></button><button type="button" class="btn" data-stop>Arrêter le partage</button><button type="button" class="btn" data-close>Fermer</button></div></div>';
      $('.osok',w.body).textContent=ex?'Ce dossier est partagé. Adresse réseau : \\\\'+os.name+'\\'+ex.name:'Ce dossier n’est pas encore partagé : seul ce poste peut le voir.';
      var nameInput=$('[data-nm]',w.body);
      nameInput.value=guidedName||(ex?ex.name:n.name);
      nameInput.readOnly=!!guidedName;
      if(ex){$('[data-who]',w.body).value=ex.who==='Postes de la salle'?'Postes de la salle':'Moi seulement';$('[data-perm]',w.body).value=ex.perm}
      $('[data-ok]',w.body).textContent=ex?'Enregistrer':'Partager';
      $('[data-stop]',w.body).hidden=!ex;$('[data-stop]',w.body).style.display=ex?'':'none';
      var mm=$('[data-msg]',w.body);mm.textContent=msg||'Avec « Postes de la salle », n’importe quel poste du réseau local peut ouvrir ce dossier. Avec « Moi seulement », personne d’autre n’y accède.';
      $('[data-ok]',w.body).addEventListener('click',function(){
        var who=$('[data-who]',w.body).value,perm=$('[data-perm]',w.body).value,nm=$('[data-nm]',w.body).value;
        var e=os.shareDir(n.id,nm,who,perm);
        if(e){draw(e);return}
        say('Partage enregistré : \\\\'+os.name+'\\'+nm.trim());draw('Partage enregistré.');
      });
      $('[data-stop]',w.body).addEventListener('click',function(){os.unshare(n.id);say('Le dossier n’est plus partagé.');draw('Le partage a été arrêté.')});
      $('[data-close]',w.body).addEventListener('click',function(){closeWin(w,true)});
    }
    draw();return w;
  }

  /* --- bloc-notes --- */
  function openNote(src,node,allowEdit){
    var editable=!cfg.guided&&(src===os||!!allowEdit),dirty=false;os.did.openedTxt=true;os.did.openedFiles=os.did.openedFiles||[];if(node)os.did.openedFiles.push({host:src.name,nodeId:node.id,name:node.name,content:node.content,local:src===os});os.did.openedFiles=os.did.openedFiles.slice(-30);
    var w=openWin({type:'note',title:(node?node.name:'Sans titre')+' - Bloc-notes',w:440,h:300,onclose:function(force){
      if(!force&&dirty){confirmBox('Les modifications ne sont pas enregistrées. Fermer quand même ?','Fermer sans enregistrer',function(){closeWin(w,true)});return false}
    },build:function(w){
      w.body.innerHTML='<div class="osnote"><div class="osrow osnotebar"></div><textarea aria-label="Contenu du fichier" spellcheck="false"></textarea><div class="osmuted" data-st></div></div>';
    }});
    w.resume={type:'note',host:src.name,nodeId:node&&node.id,allowEdit:!!allowEdit};
    var bar=$('.osnotebar',w.body),ta=$('textarea',w.body),st=$('[data-st]',w.body),nameIn=null;ta.maxLength=1800;
    ta.value=node?node.content:'';
    if(!editable){ta.readOnly=true;st.textContent='Ouvert en lecture seule depuis le poste '+src.name+'.'}
    else{
      if(!node){nameIn=document.createElement('input');nameIn.type='text';nameIn.value='sans-titre.txt';nameIn.setAttribute('aria-label','Nom du fichier');bar.appendChild(nameIn)}
      var sb=document.createElement('button');sb.type='button';sb.className='btn primary';sb.textContent='Enregistrer';bar.appendChild(sb);
      function save(){
        if(node){src.saveNode(node.id,ta.value)}
        else{var nm=nameIn.value.trim(),e=validName(nm);if(e){say(e,true);return}node=os.saveNew(nm,ta.value);nameIn.remove();}
        w.resume.nodeId=node.id;w.resume.host=src.name;dirty=false;w.setTitle(node.name+' - Bloc-notes');st.textContent='Enregistré.';say('Fichier enregistré dans Documents.');
      }
      sb.addEventListener('click',save);
      ta.addEventListener('keydown',function(e){e.stopPropagation();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save()}});
      ta.addEventListener('input',function(){if(!dirty){dirty=true;w.setTitle('*'+w.title)}st.textContent='Modifications non enregistrées.'});
      if(nameIn)nameIn.addEventListener('keydown',function(e){e.stopPropagation()});
    }
    setTimeout(function(){ta.focus()},0);return w;
  }

  /* --- paramètres --- */
  function openSettings(tab0){
    var tab='net';
    var w=openWin({type:'set',title:'Paramètres',w:480,h:340});
    function draw(){
      var tabs=[['net','Réseau']];
      w.body.innerHTML='<div class="osdlg"><div class="seg ostabs" role="group" aria-label="Rubriques"></div><div class="ossetbody"></div></div>';
      var seg=$('.ostabs',w.body),bd=$('.ossetbody',w.body);
      tabs.forEach(function(t){var b=document.createElement('button');b.type='button';b.textContent=t[1];b.setAttribute('aria-pressed',t[0]===tab?'true':'false');b.addEventListener('click',function(){tab=t[0];draw()});seg.appendChild(b)});
      if(tab==='perso'){
        bd.innerHTML='<p>Choisis un fond d’écran :</p><div class="oswalls"></div>';
        WALLS.forEach(function(wl,i){var b=document.createElement('button');b.type='button';b.className='oswall'+(i===os.wall?' on':'');b.style.background=wl[1];b.setAttribute('aria-label',wl[0]);b.title=wl[0];b.textContent=wl[0];
          b.addEventListener('click',function(){os.wall=i;setWall();os.did.wall=true;say('Fond d’écran changé : '+wl[0]+'.');draw()});$('.oswalls',bd).appendChild(b)});
      }else if(tab==='users'){
        bd.innerHTML='<p>Chaque personne a son propre compte utilisateur, avec son nom et ses fichiers.</p><ul class="osusers"></ul><div class="osrow"><input type="text" data-nu placeholder="Nom du nouveau compte" aria-label="Nom du nouveau compte"><button type="button" class="btn primary" data-add>Créer le compte</button></div><p class="osmuted" data-um></p>';
        os.users.forEach(function(u){
          var li=document.createElement('li');var sp=document.createElement('span');sp.textContent=u+(u===os.user?' (session ouverte)':'');li.appendChild(sp);
          if(u!==os.user){
            var b1=document.createElement('button');b1.type='button';b1.className='btn';b1.textContent='Ouvrir la session';b1.addEventListener('click',function(){os.user=u;os.did.switched=true;say('Session de « '+u+' » ouverte.');refreshAll();draw()});li.appendChild(b1);
            var b2=document.createElement('button');b2.type='button';b2.className='btn';b2.textContent='Supprimer';b2.addEventListener('click',function(){os.users=os.users.filter(function(x){return x!==u});say('Compte « '+u+' » supprimé.');draw()});li.appendChild(b2);
          }
          $('.osusers',bd).appendChild(li);
        });
        var nu=$('[data-nu]',bd);nu.addEventListener('keydown',function(e){e.stopPropagation()});
        $('[data-add]',bd).addEventListener('click',function(){
          var v=nu.value.trim(),e=validName(v);
          if(!e&&os.users.some(function(x){return x.toLowerCase()===v.toLowerCase()}))e='Ce compte existe déjà.';
          if(!e&&os.users.length>=6)e='Nombre maximal de comptes atteint.';
          if(e){$('[data-um]',bd).textContent=e;return}
          os.users.push(v);os.did.user=true;say('Compte « '+v+' » créé.');draw();
        });
      }else if(tab==='net'){
        if(!net){bd.innerHTML='<p>Ce poste n’est pas relié à un réseau local.</p>'}
        else{
          bd.innerHTML='<table class="ostable"><tr><th>Nom du poste</th><td></td></tr><tr><th>Adresse IP</th><td></td></tr><tr><th>Masque</th><td>255.255.255.0</td></tr><tr><th>État</th><td data-state></td></tr></table><div class="osrow"><button type="button" class="btn primary" data-cable></button></div><p class="osmuted">Le câble réseau relie la carte réseau du poste au switch. Sans câble, le poste ne voit plus les autres.</p>';
          var tds=$$('td',bd);tds[0].textContent=os.name;tds[1].textContent=os.ip;
          $('[data-state]',bd).textContent=os.cable?'Connecté au réseau local':'Câble réseau débranché';
          var cb=$('[data-cable]',bd);cb.textContent=os.cable?'Débrancher le câble réseau':'Rebrancher le câble réseau';
          cb.addEventListener('click',function(){os.cable=!os.cable;os.did.cable=true;say(os.cable?'Câble rebranché : le poste est de nouveau relié au réseau.':'Câble débranché : le poste est isolé.');if(net)Object.keys(net.machines).forEach(function(k){net.machines[k].render()});draw()});
        }
      }else{
        bd.innerHTML='<table class="ostable"><tr><th>Système</th><td>Système d’exploitation (simulation)</td></tr><tr><th>Nom du poste</th><td></td></tr><tr><th>Utilisateur</th><td></td></tr><tr><th>Mémoire vive</th><td>4 Go</td></tr><tr><th>Stockage utilisé</th><td></td></tr></table><p class="osmuted">Le système d’exploitation fait le lien entre l’utilisateur, les logiciels et le matériel.</p>';
        var t2=$$('td',bd);t2[1].textContent=os.name;t2[2].textContent=os.user;t2[4].textContent=fmtSize(sizeOf(nodes.root));
      }
    }
    draw();
  }

  /* --- gestionnaire des tâches --- */
  function openTaskMgr(){
    var sel=null;
    var w=openWin({type:'tm',title:'Gestionnaire des tâches',w:420,h:300});
    w.el.classList.remove('max');
    function draw(){
      var list=wins.filter(function(x){return x.type!=='dlg'});
      w.body.innerHTML='<div class="osdlg"><p class="osmuted">Applications en cours d’exécution</p><div class="ostm"></div><div class="osrow"><button type="button" class="btn primary" data-end>Fin de tâche</button></div></div>';
      var box=$('.ostm',w.body);
      list.forEach(function(x){
        var b=document.createElement('button');b.type='button';b.className='ostmrow'+(sel===x.id?' on':'');
        var a=document.createElement('span');a.textContent=x.title;var s=document.createElement('span');s.textContent=x.frozen?'Ne répond pas':'En cours';if(x.frozen)s.className='bad';
        var m=document.createElement('span');m.textContent=(40+x.id*17%160)+' Mo';b.appendChild(a);b.appendChild(s);b.appendChild(m);
        b.addEventListener('click',function(){sel=x.id;draw()});box.appendChild(b);
      });
      $('[data-end]',w.body).addEventListener('click',function(){
        var t=null;wins.forEach(function(x){if(x.id===sel)t=x});
        if(!t){say('Sélectionnez d’abord une application dans la liste.',true);return}
        if(t===w){say('Vous ne pouvez pas fermer le gestionnaire avec lui-même.',true);return}
        if(t.frozen)os.did.killed=true;
        if(t.timer)clearTimeout(t.timer);closeWin(t,true);sel=null;say('Application fermée.');
      });
    }
    w.refresh=function(){if(!w.el.parentNode)return;draw()};
    draw();
  }
  function openFrozen(){
    var w=openWin({type:'game',title:'Jeu de puzzle',w:300,h:230,build:function(w){
      w.body.innerHTML='<div class="osdlg"><p>Remets les tuiles dans l’ordre…</p><div class="ospuz"><i>1</i><i>3</i><i>2</i><i>4</i><i>6</i><i>5</i></div></div>';
    }});
    w.el.classList.remove('max');
    w.timer=setTimeout(function(){
      if(wins.indexOf(w)<0)return;
      w.frozen=true;w.el.classList.add('frozen');w.setTitle('Jeu de puzzle (ne répond pas)');
      $('.osdlg',w.body).insertAdjacentHTML('beforeend','<div class="osfrz">Cette application ne répond plus.</div>');
      say('Le jeu ne répond plus ! Essaie de le fermer.',true);
    },1400);
  }

  /* --- messagerie locale --- */
  function openMail(resume){
    var tab=resume&&resume.tab||'in',cur=resume&&resume.cur!==undefined?resume.cur:null;
    var w=openWin({type:'mail',title:'Messagerie locale',w:520,h:340});
    function unread(){return os.inbox.filter(function(m){return !m.read}).length}
    function draw(msg,good){
      w.resume={type:'mail',tab:tab,cur:cur};
      w.body.innerHTML='<div class="osdlg"><div class="seg ostabs" role="group" aria-label="Messagerie"></div><div class="ossetbody"></div></div>';
      var seg=$('.ostabs',w.body),bd=$('.ossetbody',w.body);
      [['in','Boîte de réception ('+os.inbox.length+')'],['new','Nouveau message']].forEach(function(t){var b=document.createElement('button');b.type='button';b.textContent=t[1];b.setAttribute('aria-pressed',t[0]===tab?'true':'false');b.addEventListener('click',function(){tab=t[0];cur=null;draw()});seg.appendChild(b)});
      if(tab==='in'){
        if(!os.inbox.length){bd.innerHTML='<p class="osmuted">Aucun message reçu.</p>';return}
        bd.innerHTML='<div class="osmail"><div class="osmlist"></div><div class="osmread"></div></div>';
        os.inbox.forEach(function(m,i){
          var b=document.createElement('button');b.type='button';b.className='ostmrow'+(cur===i?' on':'')+(m.read?'':' unread');
          var a=document.createElement('span');a.textContent='De : '+m.from;var s=document.createElement('span');s.textContent=(m.att?'[pièce jointe] ':'')+(m.text||'(sans texte)').slice(0,24);b.appendChild(a);b.appendChild(s);
          b.addEventListener('click',function(){cur=i;m.read=true;draw();renderBar()});$('.osmlist',bd).appendChild(b);
        });
        var rd=$('.osmread',bd);
        if(cur!==null&&os.inbox[cur]){
          var m=os.inbox[cur];rd.innerHTML='<b></b><p></p>';$('b',rd).textContent='De : '+m.from;$('p',rd).textContent=m.text||'(message sans texte)';
          if(m.att){
            var bt=document.createElement('button');bt.type='button';bt.className='btn primary';bt.textContent='Enregistrer « '+m.att.name+' » dans Téléchargements';
            bt.addEventListener('click',function(){os.saveAttachment(m.att);say('Pièce jointe enregistrée dans le dossier Téléchargements.');bt.disabled=true;bt.textContent='Pièce jointe enregistrée'});rd.appendChild(bt);
          }
        }else rd.innerHTML='<p class="osmuted">Choisis un message dans la liste.</p>';
      }else{
        if(!net){bd.innerHTML='<p>La messagerie locale nécessite un réseau.</p>';return}
        bd.innerHTML='<div class="osform"><label>À<select data-to></select></label><label>Message<textarea data-tx rows="3"></textarea></label><label>Pièce jointe<select data-at></select></label><div class="osrow"><button type="button" class="btn primary" data-send>Envoyer</button></div><p data-msg class="'+(good?'osok':'osmuted')+'"></p></div>';
        var to=$('[data-to]',bd),at=$('[data-at]',bd),tx=$('[data-tx]',bd);tx.maxLength=180;
        Object.keys(net.machines).forEach(function(k){if(k!==os.name){var o=document.createElement('option');o.textContent=k;to.appendChild(o)}});
        var o0=document.createElement('option');o0.value='';o0.textContent='Aucune';at.appendChild(o0);
        var files=os.findAll(function(n){return !n.dir&&!inTrash(n.id)});
        files.forEach(function(n){var o=document.createElement('option');o.value=n.id;o.textContent=n.name+'  ('+pathOf(n.parent)+')';at.appendChild(o)});
        $('[data-msg]',bd).textContent=msg||'';if(resume){tx.value=resume.text||'';to.value=resume.to||to.value;at.value=resume.attachment||'';resume=null;}
        tx.addEventListener('keydown',function(e){e.stopPropagation()});
        $('[data-send]',bd).addEventListener('click',function(){
          var R=net.machines[to.value];
          if(!R){draw('Choisissez un destinataire.');return}
          if(!reach(R)){draw('Échec de l’envoi : le poste '+to.value+' est injoignable. Vérifiez les câbles réseau.');say('Message non envoyé.',true);return}
          var att=null;if(at.value){var f=nodes[at.value];att={name:f.name,content:f.content,size:sizeOf(f)}}
          if(!tx.value.trim()&&!att){draw('Écrivez un message ou joignez un fichier.');return}
          R.deliver({from:os.name,text:tx.value.trim(),att:att,read:false});os.did.mailed=true;os.sent.push(to.value);os.did.sentMessages=os.did.sentMessages||[];os.did.sentMessages.push({to:to.value,text:tx.value.trim(),attachment:att&&att.name});os.did.sentMessages=os.did.sentMessages.slice(-20);
          say('Message envoyé à '+to.value+'.');tab='new';draw('Message envoyé à '+to.value+(att?' avec la pièce jointe « '+att.name+' ».':'.'),true);
        });
      }
    }
    w.refresh=function(){if(!w.el.parentNode)return;if(tab==='in')draw();else{var inboxButton=$('.ostabs button',w.body);if(inboxButton)inboxButton.textContent='Boîte de réception ('+os.inbox.length+')'}};
    draw();return w;
  }

  /* --- barre des tâches et menu Démarrer --- */
  function renderBar(){
    tasksEl.innerHTML='';
    wins.forEach(function(w){
      var b=document.createElement('button');b.type='button';b.className='ostb'+(w===active&&!w.min?' on':'');b.textContent=w.title;
      b.addEventListener('click',function(){
        if(w.min){w.min=false;w.el.classList.remove('mini');focusWin(w)}
        else if(w===active)minWin(w);else focusWin(w);
      });
      tasksEl.appendChild(b);
    });
    var d=new Date(),un=os.inbox.filter(function(m){return !m.read}).length;
    trayEl.innerHTML='';
    function sp(t,c,title){var s=document.createElement('span');s.textContent=t;if(c)s.className=c;if(title)s.title=title;trayEl.appendChild(s)}
    if(net)sp(os.cable?'Réseau ✓':'Réseau ✕',os.cable?'ostn ok':'ostn ko',os.cable?'Connecté au réseau local':'Câble débranché');
    if(un)sp('Messages : '+un,'ostn ok');
    sp(os.user,'');
    sp(d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),'');
    if(scr.clientWidth>0)scr.classList.toggle('narrow',narrow());
    if(cfg.onchange&&bootDone)cfg.onchange(os);
  }
  $('.osgo',scr).addEventListener('click',function(){
    if(!startEl.hidden){startEl.hidden=true;return}
    startEl.innerHTML='';
    var items=[['Explorateur de fichiers',function(){openExplorer({k:'dir',id:D.docs})}],['Bloc-notes',function(){openNote(os,null)}]];
    if(net)items.push(['Messagerie locale',openMail]);
    items.push(['Invite de commandes',openTerminal],['Paramètres réseau',function(){openSettings('net')}]);
    items.forEach(function(it){var b=document.createElement('button');b.type='button';b.textContent=it[0];b.addEventListener('click',function(){startEl.hidden=true;it[1]()});startEl.appendChild(b)});
    var hr=document.createElement('div');hr.className='ossep';hr.textContent='Session : '+os.user;startEl.appendChild(hr);
    var off=document.createElement('button');off.type='button';off.textContent='Éteindre';off.addEventListener('click',function(){
      startEl.hidden=true;wins.slice().forEach(function(x){if(x.timer)clearTimeout(x.timer);x.el.remove()});wins=[];active=null;os.did.shut=true;$('.osoff',scr).hidden=false;renderBar();if(cfg.onchange)cfg.onchange(os);
    });startEl.appendChild(off);
    startEl.hidden=false;
  });
  $('.osoff .btn',scr).addEventListener('click',function(){$('.osoff',scr).hidden=true;os.did.rebooted=true;say('Le poste a redémarré.')});

  /* --- clavier --- */
  function curView(){return active&&!active.min?(active.type==='exp'?active.c:null):deskC}
  scr.addEventListener('pointerdown',function(e){if(!e.target.closest('input,textarea,select,button'))scr.focus({preventScroll:true})});
  scr.addEventListener('keydown',function(e){
    if(e.target.closest('input,textarea,select'))return;
    var k=e.key.toLowerCase(),ctrl=e.ctrlKey||e.metaKey;
    if(ctrl&&e.shiftKey&&k==='escape'){e.preventDefault();openTaskMgr();return}
    var c=curView();if(!c)return;
    if(ctrl&&k==='c'){e.preventDefault();act(c,'copy',true)}
    else if(ctrl&&k==='x'){e.preventDefault();act(c,'cut',true)}
    else if(ctrl&&k==='v'){e.preventDefault();act(c,'paste',true)}
    else if(ctrl&&k==='a'){e.preventDefault();c.sel=Object.keys(c.items).filter(function(x){return x.indexOf('f:')!==0});os.did.keys=true;refreshAll()}
    else if(k==='delete'){e.preventDefault();act(c,'del',true)}
    else if(k==='f2'){e.preventDefault();act(c,'rename',true)}
    else if(k==='enter'){e.preventDefault();act(c,'open')}
    else if(k==='backspace'&&!c.desk){e.preventDefault();up(c)}
  });


  function openTerminal(resume){
    var w=openWin({type:'terminal',title:'Invite de commandes · '+os.name,w:650,h:400});
    w.body.innerHTML='<div class="sim-terminal"><pre aria-live="polite"></pre><div class="sim-command-line"><label>Commande<input aria-label="Commande du terminal" maxlength="80" autocomplete="off" spellcheck="false"></label><button type="button">Exécuter</button></div></div>';
    var out=$('pre',w.body),inp=$('input',w.body);inp.value=resume&&resume.command||'';
    function paint(){out.textContent=os.terminalHistory||'Microsoft Windows [simulation pédagogique]\nTape ipconfig, hostname ou ping suivi de l’adresse du voisin.';out.scrollTop=out.scrollHeight}
    function execute(e){
      e.preventDefault();var cmd=inp.value.trim().toLowerCase(),message='Commande non prévue. Utilise ipconfig, hostname ou ping suivi de l’IPv4.';
      os.did.commands=os.did.commands||[];os.did.commands.push(cmd);os.did.commands=os.did.commands.slice(-30);
      if(cmd==='hostname')message=os.name;
      if(cmd==='ipconfig')message='Configuration IP de Windows\n\nCarte Ethernet :\n  Adresse IPv4 : '+os.ip+'\n  Masque : 255.255.255.0\n  Passerelle : 192.168.10.1';
      var hit=cmd.match(/^ping\s+([a-z0-9.\-]+)$/);
      if(hit){var peer=null;Object.keys(net.machines).forEach(function(k){var pc=net.machines[k];if(pc.ip===hit[1]||k.toLowerCase()===hit[1])peer=pc});
        if(peer&&os.reachable(peer)){message=Array(4).fill('Réponse de '+peer.ip+' : octets=32 temps<1ms TTL=128').join('\n')+'\nPaquets : envoyés = 4, reçus = 4, perdus = 0 (perte 0 %).';if(peer.name==='PC-22')os.did.successPing=true;}
        else{message='Délai d’attente de la demande dépassé.\nPaquets : envoyés = 4, reçus = 0, perdus = 4 (perte 100 %).';if(hit[1]==='192.168.10.22')os.did.failedPing=true;}
      }
      os.terminalHistory=((os.terminalHistory||'Microsoft Windows [simulation pédagogique]')+'\n\nC:\\> '+cmd+'\n'+message).slice(-4000);inp.value='';paint();renderBar();
    }
    $('button',w.body).addEventListener('click',execute);inp.addEventListener('keydown',function(e){if(e.key==='Enter')execute(e)});paint();return w;
  }
  os.openApp=function(app){var type={explorer:'exp',terminal:'terminal',mail:'mail',settings:'set'}[app],existing=wins.find(function(w){return w.type===type});if(existing){existing.min=false;existing.el.classList.remove('mini');focusWin(existing);return existing;}if(app==='explorer')return openExplorer({k:'dir',id:D.docs});if(app==='network')return openExplorer({k:'net'});if(app==='terminal')return openTerminal();if(app==='mail')return openMail();if(app==='settings')return openSettings('net');};
  // Les raccourcis du guide ouvrent les outils. Ils ne réalisent aucun geste à la place de l’élève.
  function showWindow(w){
    w.min=false;w.el.classList.remove('mini');focusWin(w);return w;
  }
  os.guideExplorer=function(path,name,remote){
    var source=remote?net.machines[remote]:os;
    var node=source?.q(path);
    var share=remote&&node&&source.shares.find(function(s){return s.dirId===node.id&&s.name.toLowerCase()===path[path.length-1].toLowerCase()});
    var location=remote?(share?{k:'share',host:remote,shareId:share.id,dirId:share.dirId}:{k:'host',host:remote}):{k:'dir',id:node&&node.dir?node.id:D.docs};
    var w=wins.find(function(win){return win.type==='exp'&&JSON.stringify(win.c.loc)===JSON.stringify(location)});
    w=w?showWindow(w):openExplorer(location);
    if(name){
      var match=Object.values(w.c.items).find(function(item){return item.name===name});
      if(match){w.c.sel=[match.key];w.refresh();}
    }
  };
  os.guidePermissions=function(path){
    var folder=os.q(path);
    if(!folder?.dir){os.guideExplorer(['Documents']);say('Le dossier à partager est introuvable.',true);return;}
    var w=wins.find(function(win){return win.shareFolder===folder.id});
    if(w)showWindow(w);else openShare(folder,path[path.length-1]);
  };
  os.guideMail=function(tab){
    var w=wins.find(function(win){return win.type==='mail'&&win.resume?.tab===tab});
    if(w)showWindow(w);else openMail({tab:tab});
  };
  os.fitWindows=function(){if(narrow())wins.forEach(function(w){w.max=true;w.el.classList.add('max')})};
  os.setCable=function(value){os.cable=!!value;os.did.cable=true;os.render();os.others()};
  os.dump=function(){
    var windows=wins.filter(function(w){return ['exp','note','mail','terminal'].indexOf(w.type)>=0}).slice(-8).map(function(w){
      var state=Object.assign({},w.resume||{type:w.type});state.min=w.min;state.max=w.max;
      if(w.type==='exp'){state.loc=w.c.loc;state.sel=w.c.sel;state.edit=w.c.edit;var rename=$('.osedit',w.body);if(rename)state.renameText=rename.value;}
      if(w.type==='note'){state.text=$('textarea',w.body).value;var name=$('input',w.body);if(name)state.fileName=name.value;}
      if(w.type==='terminal')state.command=$('input',w.body).value;
      if(w.type==='mail'&&state.tab==='new'){var tx=$('[data-tx]',w.body);if(tx){state.text=tx.value;state.to=$('[data-to]',w.body).value;state.attachment=$('[data-at]',w.body).value;}}
      return state;
    });
    return JSON.parse(JSON.stringify({version:2,name:os.name,ip:os.ip,cable:os.cable,wall:os.wall,shares:os.shares,inbox:os.inbox,sent:os.sent,dirs:os.dirs,did:os.did,users:os.users,terminalHistory:os.terminalHistory,nodes:nodes,seq:seq,shareSeq:shareSeq,windows:windows,clipboard:holder.clip?{host:holder.clip.src.name,ids:holder.clip.ids,mode:holder.clip.mode,share:holder.clip.share}:null}));
  };
  os.restoreViews=function(state){
    if(!state)return;
    if(state.clipboard&&net.machines[state.clipboard.host])holder.clip={src:net.machines[state.clipboard.host],ids:state.clipboard.ids,mode:state.clipboard.mode,share:state.clipboard.share};
    (state.windows||[]).slice(-8).forEach(function(v){
      var w;
      try{
        if(v.type==='exp'){w=openExplorer(v.loc);w.c.sel=v.sel||[];if(v.edit){w.c.edit=v.edit;refreshAll();var rn=$('.osedit',w.body);if(rn&&v.renameText!==undefined)rn.value=v.renameText;}}
        else if(v.type==='terminal')w=openTerminal(v);
        else if(v.type==='mail')w=openMail(v);
        else if(v.type==='note'){var src=net.machines[v.host]||os,node=v.nodeId?src.node(v.nodeId):null;if(v.nodeId&&!node)return;w=openNote(src,node,v.allowEdit);if(v.text!==undefined)$('textarea',w.body).value=v.text;var fn=$('input',w.body);if(fn&&v.fileName)fn.value=v.fileName;}
        if(w){w.max=!!v.max;w.el.classList.toggle('max',w.max);if(v.min)minWin(w);}
      }catch(e){/* A removed remote share does not prevent restoring the other windows. */}
    });
  };

  /* --- démarrage --- */
  wireView(deskC,deskEl,null);
  setWall();
  bootDone=true;
  refreshAll();
  return os;
}

