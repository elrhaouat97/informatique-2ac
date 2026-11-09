/* Contrats et vérification des gestes du simulateur. Même modèle pour les tests et le navigateur. */
(function(root){
 'use strict';
 const phrase='Bonjour le club !',invitation='Bienvenue à l’exposition du club !';
 const missions={
  identity:{title:'Identifier PC-21',ar:'تحديد هوية PC-21',steps:[
   ['Relever l’adresse IPv4','قراءة عنوان IPv4','Tape ipconfig puis clique sur Exécuter. Recopie la valeur de la ligne « Adresse IPv4 » sous le simulateur.','اكتب ipconfig ثم انقر تنفيذ. انقل قيمة سطر «عنوان IPv4» أسفل المحاكي.'],
   ['Relever le nom du poste','قراءة اسم الحاسوب','Tape hostname puis clique sur Exécuter. Recopie le nom affiché sous le simulateur.','اكتب hostname ثم انقر تنفيذ. انقل الاسم الظاهر أسفل المحاكي.']
  ]},
  ping:{title:'Vérifier la connexion',ar:'التحقق من الاتصال',steps:[
   ['Tester avant la réparation','الاختبار قبل الإصلاح','Tape ping 192.168.10.22 sur PC-21. Observe le délai dépassé et les 4 paquets perdus.','اكتب ping 192.168.10.22 على PC-21. لاحظ انتهاء المهلة وفقدان 4 حزم.'],
   ['Rebrancher PC-22','إعادة توصيل PC-22','Clique sur « Rebrancher le câble » sous PC-22. Observe le changement de la liaison.','انقر «إعادة توصيل الكابل» أسفل PC-22. لاحظ تغير الاتصال.'],
   ['Refaire le même test','إعادة الاختبار نفسه','Retape ping 192.168.10.22. Vérifie que PC-22 répond et que 4 paquets sont reçus.','أعد كتابة ping 192.168.10.22. تحقق من استجابة PC-22 وتلقي 4 حزم.']
  ]},
  sharing:{title:'Partager et récupérer Bonjour.txt',ar:'مشاركة Bonjour.txt والحصول عليه',steps:[
   ['Préparer le fichier source','تحضير الملف الأصلي','Sélectionne Bonjour.txt et clique sur Copier. Ouvre Club_reseau, puis clique sur Coller.','حدد Bonjour.txt وانقر نسخ. افتح Club_reseau ثم انقر لصق.'],
   ['Partager le dossier en lecture','مشاركة المجلد للقراءة','Dans le partage de Club_reseau, choisis « Postes de la salle » et « Lecture seule ». Valide avec Partager ou Enregistrer.','اختر «حواسيب القاعة» و«القراءة فقط» في مشاركة Club_reseau ثم انقر مشاركة أو حفظ.'],
   ['Faire une copie sur PC-22','إنشاء نسخة على PC-22','Dans le dossier partagé, sélectionne Bonjour.txt et clique sur Copier. Ouvre le Bureau du PC-22 et clique sur Coller.','حدد Bonjour.txt في المجلد المشترك وانقر نسخ. افتح سطح مكتب PC-22 وانقر لصق.'],
   ['Vérifier la copie','التحقق من النسخة','Sur le Bureau du PC-22, sélectionne Bonjour.txt et clique sur Ouvrir. Lis la phrase du fichier.','حدد Bonjour.txt على سطح مكتب PC-22 وانقر فتح. اقرأ العبارة داخل الملف.'],
   ['Fermer le partage','إيقاف المشاركة','Sur PC-21, clique sur « Arrêter le partage ». Le PC-22 garde sa copie.','على PC-21، انقر «إيقاف المشاركة». يحتفظ PC-22 بنسخته.']
  ]},
  assessment:{title:'Livrer l’invitation au PC-22',ar:'إيصال الدعوة إلى PC-22',steps:[
   ['Partager Club_reseau en lecture seule','مشاركة Club_reseau للقراءة فقط','Sur PC-21, ouvre Documents. Partage Club_reseau avec les postes de la salle en lecture seule.','على PC-21، افتح المستندات. شارك Club_reseau مع حواسيب القاعة للقراءة فقط.'],
   ['Copier Invitation.txt sur le Bureau de PC-22','نسخ Invitation.txt إلى سطح مكتب PC-22','Passe sur PC-22. Ouvre le dossier partagé depuis Réseau, puis copie Invitation.txt sur le Bureau de PC-22.','انتقل إلى PC-22. افتح المجلد المشترك من الشبكة ثم انسخ Invitation.txt إلى سطح مكتب PC-22.'],
   ['Ouvrir la copie sur PC-22','فتح النسخة على PC-22','Ouvre Invitation.txt depuis le Bureau de PC-22 pour vérifier que la copie est lisible.','افتح Invitation.txt من سطح مكتب PC-22 للتحقق من إمكانية قراءة النسخة.'],
  ]},
  messenger:{title:'Échanger dans la messagerie locale',ar:'التبادل في المراسلة المحلية',steps:[
   ['Envoyer un fichier à PC-22','إرسال ملف إلى PC-22','Vérifie que le destinataire est PC-22. Écris « Bonjour le club ! », joins Bonjour.txt et clique sur Envoyer.','تحقق من أن المستلم هو PC-22. اكتب «Bonjour le club !» وأرفق Bonjour.txt ثم انقر إرسال.'],
   ['Lire le message reçu','قراءة الرسالة المستلمة','Sur PC-22, clique sur le message de PC-21 dans la boîte de réception.','على PC-22، انقر على رسالة PC-21 في صندوق الوارد.'],
   ['Enregistrer la pièce jointe','حفظ المرفق','Dans le message, clique sur « Enregistrer Bonjour.txt dans Téléchargements ».','انقر داخل الرسالة على «حفظ Bonjour.txt في التنزيلات».'],
   ['Ouvrir le fichier enregistré','فتح الملف المحفوظ','Dans Téléchargements, sélectionne Bonjour.txt et clique sur Ouvrir. Lis la phrase.','حدد Bonjour.txt في التنزيلات وانقر فتح. اقرأ العبارة.'],
   ['Confirmer la réception','تأكيد التوصل','Depuis PC-22, envoie « Reçu » à PC-21. Ouvre ensuite ce retour dans la boîte de PC-21.','من PC-22، أرسل «Reçu» إلى PC-21. افتح الرد بعد ذلك في صندوق وارد PC-21.']
  ]},
  repair:{title:'Autoriser le dépôt du fichier',ar:'السماح بإيداع الملف',steps:[
   ['Observer le refus','ملاحظة رفض الكتابة','Sur PC-22, sélectionne notes.txt et clique sur Copier. Ouvre Échange et clique sur Coller. Lis le message de refus.','على PC-22، حدد notes.txt وانقر نسخ. افتح Échange وانقر لصق. اقرأ رسالة الرفض.'],
   ['Modifier le droit','تغيير الصلاحية','Sur PC-21, sélectionne « Lecture et écriture » pour Échange et clique sur Enregistrer.','على PC-21، اختر «القراءة والكتابة» للمجلد Échange وانقر حفظ.'],
   ['Déposer le fichier','إيداع الملف','Sur PC-22, clique sur Coller dans Échange. Le fichier notes.txt est encore dans le presse-papiers.','على PC-22، انقر لصق داخل Échange. ما زال notes.txt في الحافظة.'],
   ['Vérifier sur le poste source','التحقق على الحاسوب المصدر','Sur PC-21, ouvre notes.txt dans Documents / Échange et lis le début du fichier.','على PC-21، افتح notes.txt داخل Documents / Échange واقرأ بداية الملف.']
  ]}
 };
 function find(machine,path){
  if(!machine||!machine.nodes)return null;
  let current=machine.nodes.root;
  for(const segment of path){if(!current||!Array.isArray(current.kids))return null;current=current.kids.map(id=>machine.nodes[id]).find(node=>node&&node.name.toLowerCase()===segment.toLowerCase());}
  return current||null;
 }
 function opened(machine,name,local){return (machine.did.openedFiles||[]).some(f=>f.name===name&&f.local===local);}
 function transferred(machine,from,name){return (machine.did.transfers||[]).some(t=>t.from===from&&t.names.includes(name));}
 function assessmentEvidence(a,b){
  const folder=find(a,['Documents','Club_reseau']);
  const share=folder&&a.shares.find(s=>s.name==='Club_reseau'&&s.dirId===folder.id&&s.who==='Postes de la salle');
  const copy=find(b,['Bureau','Invitation.txt']);
  return {
   access:share?.perm||null,
   copied:copy?.content===invitation&&(b.did.transfers||[]).some(t=>t.from==='PC-21'&&t.destination==='Ce PC › Bureau'&&t.names.includes('Invitation.txt')),
   opened:!!copy&&(b.did.openedFiles||[]).some(f=>f.nodeId===copy.id&&f.local&&f.content===invitation),
  };
 }
 function rawChecks(mode,a,b){
  if(!a||!b)return [];
  const commands=a.did.commands||[],share=a.shares.find(s=>s.name==='Club_reseau'),folder=find(a,['Documents','Club_reseau']),copy=find(b,['Bureau','Bonjour.txt']),download=find(b,['Téléchargements','Bonjour.txt']);
  if(mode==='identity')return [commands.includes('ipconfig'),commands.includes('hostname')];
  if(mode==='ping')return [!!a.did.failedPing,!!b.cable&&!!b.did.cable,!!a.did.successPing&&a.cable&&b.cable];
  if(mode==='sharing')return [!!folder&&find(a,['Documents','Club_reseau','Bonjour.txt'])?.content===phrase,!!share&&share.dirId===folder?.id&&share.perm==='read'&&share.who==='Postes de la salle',copy?.content===phrase&&transferred(b,'PC-21','Bonjour.txt'),!!copy&&opened(b,'Bonjour.txt',true),!share&&!!a.did.unshared];
  if(mode==='messenger')return [(a.did.sentMessages||[]).some(m=>m.to==='PC-22'&&m.attachment==='Bonjour.txt'&&m.text.toLowerCase().includes('bonjour')),b.inbox.some(m=>m.from==='PC-21'&&m.att?.content===phrase&&m.read),download?.content===phrase&&!!b.did.attSaved,!!download&&opened(b,'Bonjour.txt',true),a.inbox.some(m=>m.from==='PC-22'&&/re[cç]u/i.test(m.text)&&m.read)];
  if(mode==='repair'){const exchange=a.shares.find(s=>s.name==='Échange');return [b.did.denied>0,exchange?.perm==='write'&&exchange.who==='Postes de la salle',!!find(a,['Documents','Échange','notes.txt'])&&transferred(a,'PC-22','notes.txt'),opened(a,'notes.txt',true)];}
  return [];
 }
 function evaluate(mode,a,b,previous){
  if(mode==='assessment'){
   const evidence=assessmentEvidence(a,b);
   const checks=[evidence.access==='read',evidence.copied,evidence.copied&&evidence.opened];
   return {checks,completed:checks.every(Boolean),evidence};
  }
  const raw=rawChecks(mode,a,b),count=missions[mode]?.steps.length||0,checks=[];
  for(let i=0;i<count;i++)checks.push((i===0||checks[i-1])&&(previous?.[i]===true||raw[i]===true));
  return {checks,completed:count>0&&checks.length===count&&checks.every(Boolean)};
 }
 function validMachine(m,name){return !!m&&m.version===2&&m.name===name&&m.nodes&&typeof m.nodes==='object'&&Object.keys(m.nodes).length<400&&m.nodes.root&&m.nodes.trash&&m.dirs&&m.nodes[m.dirs.docs]&&Array.isArray(m.shares)&&Array.isArray(m.inbox)&&Array.isArray(m.sent)&&m.did&&Array.isArray(m.users);}
 function validSnapshot(s,mode){try{return s?.version===2&&s.mode===mode&&validMachine(s.machines?.A,'PC-21')&&validMachine(s.machines?.B,'PC-22')&&JSON.stringify(s).length<200000;}catch{return false;}}
 const api={missions,find,evaluate,validSnapshot,invitation};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Session4Missions=api;
})(typeof window==='undefined'?{}:window);
