// Public lesson rubric shared by the browser and the server-side validator.
import {session4LabEvaluationId,session4QuizEvaluationId} from "../../../app/session4-data.ts";
export {session4LabEvaluationId,session4QuizEvaluationId};
type Text={fr:string;ar:string};
const t=(fr:string,ar:string):Text=>({fr,ar});
export const session4Questions=[
 {id:"lan",section:0,question:t("Internet est coupé, mais les PC sont reliés au même réseau local. Que peuvent-ils faire ?","انقطع الإنترنت لكن الحواسيب متصلة بالشبكة المحلية نفسها. ماذا يمكنها أن تفعل؟"),choices:[t("Échanger des fichiers localement.","تبادل الملفات محليا."),t("Ouvrir tous les sites Web.","فتح جميع مواقع الويب."),t("Ne plus rien échanger.","التوقف عن كل تبادل.")],answer:0},
 {id:"switch",section:0,question:t("Quel équipement relie plusieurs PC par câble dans la salle ?","ما الجهاز الذي يربط عدة حواسيب بكابلات داخل القاعة؟"),choices:[t("Une imprimante.","طابعة."),t("Un commutateur.","مبدل."),t("Un disque dur.","قرص صلب.")],answer:1},
 {id:"star",section:0,question:t("Chaque PC est relié au commutateur central. Quelle est cette topologie ?","يرتبط كل حاسوب بالمبدل المركزي. ما هذه البنية؟"),choices:[t("Anneau.","حلقية."),t("Bus.","خطية."),t("Étoile.","نجمية.")],answer:2},
 {id:"ipv4",section:1,question:t("ipconfig indique IPv4 : 192.168.10.21 et passerelle : 192.168.10.1. Quelle est l’adresse du PC ?","يعرض ipconfig عنوان IPv4: 192.168.10.21 والبوابة: 192.168.10.1. ما عنوان الحاسوب؟"),choices:[t("192.168.10.1","192.168.10.1"),t("192.168.10.21","192.168.10.21"),t("255.255.255.0","255.255.255.0")],answer:1},
 {id:"ping",section:1,question:t("Quelle commande teste la réponse du PC 192.168.10.22 ?","ما الأمر الذي يختبر استجابة الحاسوب 192.168.10.22؟"),choices:[t("ping 192.168.10.22","ping 192.168.10.22"),t("hostname 192.168.10.22","hostname 192.168.10.22"),t("ipconfig Bonjour.txt","ipconfig Bonjour.txt")],answer:0},
 {id:"path",section:2,question:t("Club_reseau est partagé sur le PC 192.168.10.21. Quel chemin faut-il ouvrir ?","تمت مشاركة Club_reseau على الحاسوب 192.168.10.21. ما المسار الذي يجب فتحه؟"),choices:[t("C:\\Club_reseau","C:\\Club_reseau"),t("https://Club_reseau","https://Club_reseau"),t(String.raw`\\192.168.10.21\Club_reseau`,String.raw`\\192.168.10.21\Club_reseau`)],answer:2},
 {id:"read",section:2,question:t("Le voisin doit seulement lire et copier Bonjour.txt. Quel droit suffit ?","يحتاج الزميل فقط إلى قراءة Bonjour.txt ونسخه. ما الصلاحية الكافية؟"),choices:[t("Lecture.","القراءة."),t("Contrôle total.","التحكم الكامل."),t("Aucun accès.","دون ولوج.")],answer:0},
 {id:"permission",section:2,question:t("Le partage s’ouvre, mais le fichier est en lecture seule. Pour autoriser une modification nécessaire, que vérifier ?","يفتح المجلد المشترك لكن الملف للقراءة فقط. للسماح بتعديل ضروري، ماذا نتحقق منه؟"),choices:[t("La couleur du câble.","لون الكابل."),t("Les droits du partage, avec l’enseignant.","صلاحيات المشاركة مع الأستاذ."),t("La taille de l’écran.","حجم الشاشة.")],answer:1},
 {id:"message",section:3,question:t("Pour envoyer la consigne au bon poste dans BeeBEEP, que faut-il vérifier d’abord ?","لإرسال التعليمة إلى الحاسوب الصحيح في BeeBEEP، ما الذي نتحقق منه أولا؟"),choices:[t("Le destinataire dans les contacts.","المستلم ضمن جهات الاتصال."),t("La couleur du fond d’écran.","لون خلفية الشاشة."),t("Le nombre de touches du clavier.","عدد مفاتيح لوحة المفاتيح.")],answer:0},
 {id:"received",section:3,question:t("Quelle preuve montre le mieux que le fichier a été reçu correctement ?","ما الدليل الأنسب على التوصل السليم بالملف؟"),choices:[t("Le PC source est allumé.","الحاسوب المرسل مشغل."),t("Le bouton Envoyer a été cliqué.","تم النقر على زر الإرسال."),t("Le destinataire ouvre le fichier et confirme son contenu.","يفتح المستلم الملف ويؤكد محتواه.")],answer:2},
];
function gradeQuestions(choices:Record<string,number>,points:number){
 const answers=session4Questions.map(q=>{const index=choices[q.id];const selected=Number.isInteger(index)&&index>=0&&index<q.choices.length?index:null;const correct=selected===q.answer;return {question:q.question,selectedIndex:selected,selectedChoice:selected===null?t("Sans réponse","دون جواب"):q.choices[selected],correctChoice:q.choices[q.answer],correct,earnedPoints:correct?points:0,maxPoints:points};});
 const sections=[0,1,2,3].map(section=>answers.reduce((sum,a,i)=>sum+(session4Questions[i].section===section?a.earnedPoints:0),0));
 return {choices,score:sections.reduce((sum,points)=>sum+points,0),maxScore:20,sections,answers};
}
export function gradeSession4(choices:Record<string,number>){
 return {format:session4QuizEvaluationId,...gradeQuestions(choices,2)} as const;
}

type LabEvidence={access:"read"|"write"|null;copied:boolean;opened:boolean};
const labCriteria=[
 {criterion:t("Club_reseau partagé en lecture seule avec les postes de la salle","مشاركة Club_reseau للقراءة فقط مع حواسيب القاعة"),maxPoints:3},
 {criterion:t("Invitation.txt copié depuis PC-21 sur le Bureau de PC-22","نسخ Invitation.txt من PC-21 إلى سطح مكتب PC-22"),maxPoints:4},
 {criterion:t("Copie ouverte sur le Bureau de PC-22","فتح النسخة على سطح مكتب PC-22"),maxPoints:3},
];
export function gradeSession4Lab(choices:Record<string,number>,value:unknown){
 const input=value as Partial<LabEvidence>|null;
 const evidence:LabEvidence={
  access:input?.access==="read"||input?.access==="write"?input.access:null,
  copied:input?.copied===true,
  opened:input?.copied===true&&input.opened===true,
 };
 const checks=[evidence.access==="read",evidence.copied,evidence.opened];
 const practical=labCriteria.map((item,index)=>({...item,correct:checks[index],earnedPoints:checks[index]?item.maxPoints:0}));
 const quiz=gradeQuestions(choices,1);
 const practicalScore=practical.reduce((sum,item)=>sum+item.earnedPoints,0);
 return {...quiz,format:session4LabEvaluationId,evidence,practical,score:quiz.score+practicalScore,sections:[...quiz.sections,practicalScore]} as const;
}

export function validSession4Choices(value:unknown):value is Record<string,number>{
 return !!value&&typeof value==="object"&&!Array.isArray(value)&&Object.entries(value).every(([id,index])=>{
  const question=session4Questions.find(q=>q.id===id);
  return !!question&&Number.isInteger(index)&&index>=0&&index<question.choices.length;
 });
}
export function validSession4Evaluation(answer:unknown,isCorrect:unknown,score:unknown,maxScore:unknown){
 if(!answer||typeof answer!=="object"||Array.isArray(answer))return false;
 const a=answer as ReturnType<typeof gradeSession4>|ReturnType<typeof gradeSession4Lab>;
 if(!validSession4Choices(a.choices))return false;
 let expected:ReturnType<typeof gradeSession4>|ReturnType<typeof gradeSession4Lab>;
 if(a.format===session4LabEvaluationId){
  expected=gradeSession4Lab(a.choices,a.evidence);
  if(!a.evidence||a.evidence.access!==expected.evidence.access||a.evidence.copied!==expected.evidence.copied||a.evidence.opened!==expected.evidence.opened
    ||JSON.stringify(a.practical)!==JSON.stringify(expected.practical))return false;
 }else if(a.format===session4QuizEvaluationId){
  expected=gradeSession4(a.choices);
 }else return false;
 return score===expected.score&&a.score===expected.score&&maxScore===20&&a.maxScore===20&&isCorrect===(expected.score===20)&&JSON.stringify(a.sections)===JSON.stringify(expected.sections)&&JSON.stringify(a.answers)===JSON.stringify(expected.answers);
}
