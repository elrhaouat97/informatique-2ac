import type {RosterStudent} from './supabase-api';
export type ImportRow=Partial<RosterStudent>&{fullName:string;className:string};
const key=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]/g,'');
const aliases={fullName:['nomcomplet','nomprenom','nometprenom','fullname','الاسمالكامل'],className:['classe','class','classname','القسم'],groupName:['groupe','group','groupname','الفوج'],massarCode:['massar','codemassar','massarcode','مسار'],id:['id','identifiant']};
export function prepareRosterImport(raw:Record<string,unknown>[],existing:RosterStudent[],defaultClass='',defaultGroup=''){
 const errors:string[]=[],rows:ImportRow[]=[];const ids=new Set<string>(),codes=new Set<string>();
 if(raw.length>1000)errors.push('Le fichier dépasse 1 000 lignes. Divise-le en plusieurs imports.');
 for(const [index,source]of raw.slice(0,1000).entries()){
  const values=Object.fromEntries(Object.entries(source).map(([k,v])=>[key(k),String(v??'').trim()]));const get=(field:keyof typeof aliases)=>aliases[field].map(a=>values[key(a)]).find(Boolean)||'';
  const fullName=get('fullName'),className=(get('className')||defaultClass).replace(/\s/g,'').replace(/^2AC/i,'2/'),groupName=(get('groupName')||defaultGroup).replace(/^groupe\s*/i,''),massarCode=get('massarCode').toUpperCase(),id=get('id');
  if(!fullName&&!id&&!massarCode)continue;
  const matchedByCode=massarCode?existing.find(s=>s.massarCode===massarCode):undefined;const matchedById=id?existing.find(s=>s.id===id):undefined;
  if(id&&!matchedById)errors.push(`Ligne ${index+2} : identifiant inconnu.`);
  if(matchedByCode&&id&&matchedByCode.id!==id)errors.push(`Ligne ${index+2} : le code Massar désigne une autre fiche.`);
  if(fullName.length<2||fullName.length>100||!/^2\/[1-9]$/.test(className)||!['','1','2'].includes(groupName)||(massarCode&&!/^[A-Z0-9]{5,20}$/.test(massarCode)))errors.push(`Ligne ${index+2} : vérifie le nom, la classe, le groupe et Massar.`);
  const matched=matchedById||matchedByCode,finalId=matched?.id||crypto.randomUUID();
  if(ids.has(finalId)||(massarCode&&codes.has(massarCode)))errors.push(`Ligne ${index+2} : fiche ou code Massar en double.`);ids.add(finalId);if(massarCode)codes.add(massarCode);
  rows.push({id:finalId,fullName,className,groupName:groupName||null,massarCode:massarCode||matched?.massarCode||null,source:'import',active:true});
 }
 if(!rows.length)errors.push('Aucun élève trouvé. Colonnes attendues : Nom complet, Classe, Groupe, Massar (facultatif), ID (facultatif).');
 return {rows,errors};
}
