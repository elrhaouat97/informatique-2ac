import type { CourseSession, LocalizedText } from "./course-data.ts";
import { session4Videos, type Session4Video } from "./session4-video-data.ts";
export const s4t = (fr: string, ar: string): LocalizedText => ({fr, ar});
export const session4QuizEvaluationId="session-4-reseau-evaluation-v1";
export const session4LabEvaluationId="session-4-reseau-evaluation-v2";
export const session4AppliedEvaluationId="session-4-reseau-evaluation-v3";
type LegacyKind = "lan" | "cables" | "equipment" | "topology" | "identity" | "ping" | "sharing" | "practice" | "messenger" | "repair";
type ActivityCopy = {id: string; label: string; minutes: number; title: LocalizedText; prompt: LocalizedText; tasks: LocalizedText[]; objective: string};
export type Session4LegacyActivity = ActivityCopy & {kind: LegacyKind};
const activity = (label: string, kind: LegacyKind, minutes: number, title: LocalizedText, prompt: LocalizedText, tasks: LocalizedText[], objective: string): Session4LegacyActivity => ({id: `session-4-workshop-${label}`, label, kind, minutes, title, prompt, tasks, objective});
export const session4LegacyActivities: Session4LegacyActivity[] = [
 activity("C","lan",5,s4t("Un réseau pour tous ces appareils","شبكة لكل هذه الأجهزة"),s4t("Observe les images. Coupe Internet et vérifie si les deux PC peuvent encore communiquer.","لاحظ الصور. اقطع الإنترنت وتحقق مما إذا كان الحاسوبان يستطيعان التواصل."),[s4t("Coupe Internet dans la maquette.","اقطع الإنترنت في النموذج."),s4t("Envoie la consigne au PC-22, puis choisis l’explication correcte.","أرسل التعليمة إلى PC-22 ثم اختر التفسير الصحيح.")],"Comprendre le réseau local"),
 activity("A","cables",8,s4t("Bâtis le réseau de la salle","أنشئ شبكة القاعة"),s4t("Place les trois équipements, puis connecte les appareils avec le bon type de liaison.","ضع الأجهزة الثلاثة ثم اربط الأجهزة باستعمال نوع الاتصال المناسب."),[s4t("Place le routeur, le commutateur et le point d’accès dans les emplacements.","ضع الموجه والمبدل ونقطة الولوج في أماكنها."),s4t("Choisis Câble RJ45 pour les trois PC et l’imprimante. Choisis Wi-Fi pour les portables et la TV.","اختر كابل RJ45 للحواسيب الثلاثة والطابعة، وWi-Fi للحاسوبين المحمولين والتلفاز."),s4t("Clique chaque appareil pour le connecter, puis teste ton réseau.","انقر كل جهاز لتوصيله ثم اختبر شبكتك.")],"Reconnaître le matériel et les connexions"),
 activity("D","equipment",6,s4t("Retrouve les six équipements","تعرف على الأجهزة الستة"),s4t("Observe chaque photo et sa fonction. Choisis le nom de l’équipement.","لاحظ كل صورة ووظيفتها واختر اسم الجهاز."),[],"Reconnaître le matériel et les connexions"),
 activity("E","topology",5,s4t("Les câbles dessinent une topologie","ترسم الكابلات بنية الشبكة"),s4t("Suis les liaisons entre les ordinateurs. Nomme les trois topologies.","تتبع الروابط بين الحواسيب وسم البنيات الثلاث."),[],"Reconnaître les topologies"),
 activity("F","identity",8,s4t("Lire l’adresse et le nom du PC","قراءة عنوان الحاسوب واسمه"),s4t("Identifie le PC-21. Lance les deux commandes indiquées et relève une information à chaque étape.","حدد هوية PC-21. نفذ الأمرين المشار إليهما واقرأ معلومة في كل خطوة."),[],"Identifier un poste et tester la communication"),
 activity("G","ping",7,s4t("Tester le PC voisin avec ping","اختبار الحاسوب المجاور بأمر ping"),s4t("Teste le PC-22 avant et après avoir rebranché son câble. Compare les deux résultats.","اختبر PC-22 قبل إعادة توصيل كابله وبعدها. قارن النتيجتين."),[],"Identifier un poste et tester la communication"),
 activity("H","sharing",10,s4t("Partager un fichier en lecture","مشاركة ملف بصلاحية القراءة"),s4t("Prépare Bonjour.txt dans Club_reseau. Partage le dossier en lecture pour que le PC-22 puisse copier le fichier.","ضع Bonjour.txt داخل Club_reseau. شارك المجلد للقراءة حتى يتمكن PC-22 من نسخ الملف."),[],"Partager un dossier et choisir les droits"),
 activity("TP","practice",15,s4t("Échanger un fichier sur les vrais postes","تبادل ملف على حاسوبين حقيقيين"),s4t("Avec le binôme voisin, envoyez un fichier dans chaque sens. Cochez chaque tâche dès qu’elle est faite.","مع الثنائي المجاور، تبادلا ملفا في كل اتجاه. علما على كل مهمة بعد إنجازها."),[],"Réaliser un échange sur deux postes"),
 activity("B","messenger",10,s4t("Envoyer un fichier avec BeeBEEP","إرسال ملف بواسطة BeeBEEP"),s4t("Dans la messagerie simulée, envoie Bonjour.txt à PC-22. Ouvre le fichier reçu et confirme sa réception.","أرسل Bonjour.txt إلى PC-22 في المراسلة المحاكاة. افتح الملف وتأكد من التوصل به."),[],"Échanger par messagerie locale"),
 activity("I","repair",11,s4t("Corriger un droit de partage","تصحيح صلاحية المشاركة"),s4t("Sara doit déposer notes.txt dans le dossier Échange. Observe le refus, puis règle le droit de partage et réessaie.","على سارة وضع notes.txt داخل Échange. لاحظ الرفض ثم صحح صلاحية المشاركة وأعد المحاولة."),[],"Diagnostiquer un échange local"),
];
export type Session4Kind = "inventory" | "media" | "plans" | "wired" | "folder" | "wireless" | "mixed" | "identity" | "diagnostic" | "practice" | "names" | "roles" | "star" | "bus" | "ring" | "patch" | "exchange" | "loan" | "build";
type Session4ActivityCopy = ActivityCopy & {edition:2; zone:LocalizedText; previousId?:string};
type Session4StandardActivity = Session4ActivityCopy & {kind:Session4Kind};
export type Session4VideoActivity = Session4ActivityCopy & {kind:"video"; video:Session4Video};
export type Session4Activity = Session4StandardActivity | Session4VideoActivity;
const newActivity = (kind:Session4Kind,minutes:number,zone:LocalizedText,title:LocalizedText,prompt:LocalizedText,tasks:LocalizedText[],objective:string):Session4StandardActivity =>
 ({id:`session-4-workshop-expo-${kind}`,label:kind,edition:2,kind,minutes,zone,title,prompt,tasks,objective});

function videoActivity(key:keyof typeof session4Videos):Session4VideoActivity {
 const video=session4Videos[key];
 return {
  id:`session-4-workshop-video-${key}`,label:`video-${key}`,edition:2,kind:"video",
  zone:s4t("Observation vidéo · U2","ملاحظة فيديو · الوحدة 2"),
  minutes:video.minutes,title:video.title,prompt:video.prompt,objective:video.objective,tasks:[],video,
 };
}

const previousExpoActivities = [
 newActivity("inventory",8,s4t("Le stock","المخزن"),s4t("Inventaire avant l’ouverture","جرد المعدات قبل الافتتاح"),s4t("Les étiquettes des caisses sont tombées. Redonne à chaque photo le bon nom et la bonne fonction.","سقطت ملصقات الصناديق. أعد لكل صورة اسم الجهاز ووظيفته."),
  [s4t("Observe les ports, les antennes et les connecteurs.","لاحظ المنافذ والهوائيات والموصلات."),s4t("Associe un nom et une fonction à chaque équipement.","اربط كل جهاز باسمه ووظيفته.")],"Identifier les équipements et leur fonction"),
 newActivity("media",5,s4t("Le repérage","المعاينة"),s4t("Le bon lien pour chaque appareil","الاتصال المناسب لكل جهاز"),s4t("Lis la contrainte de chaque emplacement. Choisis comment relier l’appareil au réseau local.","اقرأ قيد كل مكان، ثم اختر طريقة ربط الجهاز بالشبكة المحلية."),
  [s4t("Choisis RJ45 pour une liaison filaire et Wi-Fi pour une liaison sans fil.","اختر RJ45 للربط السلكي وWi-Fi للربط اللاسلكي.")],"Distinguer les liaisons filaires et sans fil"),
 newActivity("plans",9,s4t("La table des plans","طاولة المخططات"),s4t("Trois plans, trois formes","ثلاثة مخططات وثلاث بنى"),s4t("Un trait manque dans chaque plan. Choisis la liaison à rétablir et nomme la topologie obtenue.","ينقص خط في كل مخطط. اختر الوصلة التي ستعيدها وسمِّ البنية الناتجة."),
  [s4t("Regarde si les liaisons convergent vers un centre, rejoignent une ligne commune ou forment une boucle.","لاحظ هل تتجه الوصلات نحو مركز أم تتصل بخط مشترك أم تكوّن حلقة."),s4t("Ouvre les plans A, B et C pour traiter les trois cas.","افتح المخططات A وB وC لمعالجة الحالات الثلاث.")],"Reconnaître et compléter les topologies"),
 newActivity("wired",8,s4t("Le bureau","المكتب"),s4t("Imprimer le plan par câble","طباعة المخطط عبر الكابل"),s4t("Deux PC fixes et une imprimante réseau doivent communiquer au bureau du club. Construis un réseau filaire et imprime le plan depuis PC-21.","يجب أن يتواصل حاسوبان ثابتان وطابعة شبكية في مكتب النادي. أنشئ شبكة سلكية واطبع المخطط من PC-21."),
  [s4t("Choisis l’équipement central dans le stock.","اختر الجهاز المركزي من المخزن."),s4t("Relie chaque appareil au centre en cliquant sur deux prises RJ45.","اربط كل جهاز بالمركز بالنقر على منفذي RJ45."),s4t("Lance l’impression et observe le trajet du document.","ابدأ الطباعة ولاحظ مسار المستند.")],"Construire un réseau filaire"),
 newActivity("folder",9,s4t("Le bureau","المكتب"),s4t("Ouvrir le dossier du poste voisin","فتح مجلد الحاسوب المجاور"),s4t("Sur un réseau filaire déjà branché, crée le dossier Club_reseau sur PC-21. Fais parvenir Affiche.txt à PC-22.","على شبكة سلكية موصولة مسبقًا، أنشئ مجلد Club_reseau على PC-21 وأوصل Affiche.txt إلى PC-22."),
  [s4t("Crée le dossier, dépose Affiche.txt et partage le dossier avec le droit Lecture.","أنشئ المجلد وضع فيه Affiche.txt ثم شاركه بصلاحية القراءة."),s4t("Sur PC-22, ouvre le bon chemin réseau, puis copie et lis l’affiche.","على PC-22، افتح المسار الشبكي المناسب، ثم انسخ الإعلان واقرأه.")],"Partager un dossier sur le réseau filaire"),
 newActivity("wireless",8,s4t("La bibliothèque","المكتبة"),s4t("Connecter deux portables en Wi-Fi","ربط حاسوبين محمولين عبر Wi-Fi"),s4t("Relie les deux portables au même Wi-Fi local, puis teste les connexions.","اربط الحاسوبين المحمولين بشبكة Wi-Fi المحلية نفسها، ثم اختبر الاتصالات."),
  [s4t("Installe l’équipement qui émet le Wi-Fi et choisis le nom CLUB-EXPO.","ثبّت الجهاز الذي يبث Wi-Fi واختر الاسم CLUB-EXPO."),s4t("Sur chaque portable, sélectionne CLUB-EXPO. Teste ensuite le réseau.","اختر CLUB-EXPO على كل حاسوب محمول، ثم اختبر الشبكة.")],"Construire un réseau sans fil"),
 newActivity("mixed",10,s4t("Le hall","الردهة"),s4t("Relier les appareils filaires et Wi-Fi","ربط الأجهزة السلكية وأجهزة Wi-Fi"),s4t("Le PC et l’imprimante du hall utilisent un câble. Le portable et la TV utilisent le Wi-Fi. Relie les deux parties pour former un seul réseau.","يستعمل الحاسوب والطابعة في الردهة كابلًا، ويستعمل المحمول والتلفاز Wi-Fi. اربط الجزأين لتكوين شبكة واحدة."),
  [s4t("Place un commutateur et un point d’accès.","ضع مبدلًا ونقطة ولوج."),s4t("Branche le PC, l’imprimante et le point d’accès au commutateur. Raccorde la TV et le portable au Wi-Fi CLUB-EXPO.","اربط الحاسوب والطابعة ونقطة الولوج بالمبدل. أوصل التلفاز والمحمول بشبكة Wi-Fi CLUB-EXPO."),s4t("Teste les connexions du réseau mixte.","اختبر اتصالات الشبكة المختلطة.")],"Construire un réseau mixte"),
 newActivity("identity",7,s4t("Le carnet réseau","دفتر الشبكة"),s4t("Compléter le ticket du PC","إكمال بطاقة الحاسوب"),s4t("Le technicien a besoin de l’adresse IPv4 et du nom du poste. Lis-les dans les résultats des commandes et remplis son ticket.","يحتاج التقني إلى عنوان IPv4 واسم الحاسوب. اقرأهما في نتائج الأوامر واملأ بطاقته."),
  [s4t("Dans CMD, tape ipconfig, puis appuie sur Entrée. Fais ensuite la même chose avec hostname.","في CMD، اكتب ipconfig ثم اضغط إدخال. كرر العملية بالأمر hostname."),s4t("Teste ensuite le poste voisin avec ping 192.168.10.22.","اختبر الحاسوب المجاور بعد ذلك بالأمر ping 192.168.10.22.")],"Identifier un poste et tester la communication"),
 newActivity("diagnostic",6,s4t("Le hall","الردهة"),s4t("Réparer la liaison du point d’accès","إصلاح اتصال نقطة الولوج"),s4t("La TV est déjà associée à CLUB-EXPO. Le PC filaire ne peut pas communiquer avec elle. Trouve la liaison manquante sur le plan du hall.","التلفاز متصل بالفعل بشبكة CLUB-EXPO، لكن الحاسوب السلكي لا يستطيع التواصل معه. ابحث عن الوصلة الناقصة في مخطط الردهة."),
  [s4t("Teste d’abord les connexions.","اختبر الاتصالات أولًا."),s4t("Ajoute le câble manquant, puis refais le test.","أضف الكابل الناقص ثم أعد الاختبار."),s4t("Choisis l’explication de la panne.","اختر تفسير العطل.")],"Diagnostiquer une liaison réseau"),
 newActivity("practice",15,s4t("Sur les vrais postes","على الحواسيب الحقيقية"),s4t("Livrer le dossier au binôme voisin","تسليم المجلد للثنائي المجاور"),s4t("Avec le binôme voisin, ouvrez chacun un fichier de l’autre poste sur le réseau de la salle. Notez la preuve de réception.","مع الثنائي المجاور، افتحوا ملفًا من الحاسوب الآخر عبر شبكة القاعة. سجلوا دليل التوصل."),
  [],"Réaliser un échange sur deux postes"),
];
const previousEquipmentActivities = [
 newActivity("names",6,s4t("Le stock","المخزن"),s4t("Nommer le matériel réseau","تسمية معدات الشبكة"),s4t("Observe chaque photo et choisis le nom du matériel.","لاحظ كل صورة واختر اسم المعدة."),
  [],"Reconnaître le matériel réseau"),
 newActivity("roles",6,s4t("Le stock","المخزن"),s4t("À quoi sert ce matériel ?","ما وظيفة هذه المعدة؟"),s4t("Le nom est indiqué sous chaque photo. Associe le matériel à son rôle dans le réseau.","اسم المعدة مكتوب تحت كل صورة. اربط كل معدة بوظيفتها في الشبكة."),
  [],"Associer le matériel réseau à sa fonction"),
];
const practiceMinutes = {wireless:7,mixed:9,identity:6,diagnostic:5} as const;
const session4Catalogue:Session4Activity[] = [
 ...previousEquipmentActivities.map(item=>({
  ...item,id:`${item.id}-v2`,previousId:item.id,minutes:5,
  prompt:item.kind==="roles"
   ?s4t("Lis le nom sous chaque photo. Choisis l’action que fait cet équipement. Utilise chaque rôle une seule fois.","اقرأ الاسم تحت كل صورة. اختر ما يفعله هذا الجهاز. استعمل كل وظيفة مرة واحدة.")
   :s4t("Observe les six photos. Choisis le nom de chaque équipement réseau.","لاحظ الصور الست واختر اسم كل جهاز شبكة."),
 })),
 newActivity("star",3,s4t("Plan A","المخطط A"),s4t("Le poste oublié","الحاسوب المنسي"),s4t("PC-4 attend son câble. Observe les trois liaisons déjà tracées, puis complète et nomme le plan.","ينتظر PC-4 كابله. لاحظ الوصلات الثلاث المرسومة ثم أكمل المخطط وسمِّ بنيته."),
  [],"Reconnaître la topologie en étoile"),
 newActivity("bus",3,s4t("Plan B","المخطط B"),s4t("La ligne commune","الخط المشترك"),s4t("PC-2 est isolé. Choisis le trait qui le relie à la même ligne que les autres postes, puis nomme la topologie.","الحاسوب PC-2 معزول. اختر الخط الذي يربطه بالخط المشترك لباقي الحواسيب، ثم سمِّ البنية."),
  [],"Reconnaître la topologie en bus"),
 newActivity("ring",3,s4t("Plan C","المخطط C"),s4t("Le dernier segment","الوصلة الأخيرة"),s4t("Complète la liaison pour que chaque poste ait exactement deux voisins et que la boucle soit fermée. Nomme ensuite la topologie.","أكمل الوصلة حتى يكون لكل حاسوب جاران وتغلق الحلقة. ثم سمِّ البنية."),
  [],"Reconnaître la topologie en anneau"),
 newActivity("patch",7,s4t("Le bureau","المكتب"),s4t("Brancher deux PC au commutateur","ربط حاسوبين بالمبدل"),s4t("Branche PC-21 et PC-22 sur deux ports différents de la photo du switch. Teste les connexions.","أوصل PC-21 وPC-22 بمنفذين مختلفين في صورة المبدل، ثم اختبر الاتصالات."),
  [],"Construire un réseau filaire"),
 videoActivity("adresse"),
 videoActivity("partage"),
 videoActivity("acces"),
 newActivity("exchange",8,s4t("Le bureau","المكتب"),s4t("Retrouver le code dans un dossier partagé","العثور على الرمز في مجلد مشترك"),s4t("PC-21 et PC-22 sont déjà reliés par câble. Prépare l’invitation sur PC-21, puis retrouve son code depuis PC-22.","الحاسوبان PC-21 وPC-22 متصلان بالكابل. جهز الدعوة على PC-21 ثم اعثر على رمزها من PC-22."),
  [s4t("Crée Club_reseau et partage l’invitation en lecture depuis PC-21.","أنشئ Club_reseau وشارك الدعوة للقراءة من PC-21."),s4t("Sur PC-22, passe par Réseau, ouvre le dossier du bon poste et lis l’invitation.","على PC-22، افتح الشبكة ثم مجلد الحاسوب الصحيح واقرأ الدعوة.")],"Ouvrir un dossier partagé sur le réseau local"),
 videoActivity("image"),
 ...previousExpoActivities.flatMap(activity => {
  const minutes=practiceMinutes[activity.kind as keyof typeof practiceMinutes];
  return minutes===undefined?[]:[{...activity,minutes}];
 }),
 newActivity("loan",10,s4t("Dernière mission","المهمة الأخيرة"),s4t("Accueillir le portable de prêt","إضافة الحاسوب المحمول المعار"),s4t("Le portable de prêt doit recevoir l’invitation du club. Relève le nom sur son étiquette, choisis une IPv4 libre et connecte-le au Wi-Fi de l’équipe.","يجب أن يتوصل الحاسوب المحمول المعار بدعوة النادي. اقرأ اسمه من الملصق واختر عنوان IPv4 شاغرًا وأوصله بشبكة Wi-Fi للفريق."),
  [s4t("Compare les adresses proposées avec la liste des postes déjà connectés.","قارن العناوين المقترحة بقائمة الحواسيب المتصلة."),s4t("Teste l’envoi de l’invitation au portable de prêt.","اختبر إرسال الدعوة إلى الحاسوب المحمول المعار.")],"Identifier et intégrer un poste au réseau local"),
 videoActivity("messagerie"),
 newActivity("build",10,s4t("Le défi du club","تحدي النادي"),s4t("Crée le réseau du club","أنشئ شبكة النادي"),s4t("Le club dispose de deux PC fixes et d’un portable. Relie les PC par câble et le portable par Wi-Fi pour qu’ils puissent communiquer sur le même réseau local.","يتوفر النادي على حاسوبين ثابتين وحاسوب محمول. اربط الحاسوبين بالكابل والمحمول عبر Wi-Fi ليتواصلوا داخل الشبكة المحلية نفسها."),
  [],"Construire et tester un réseau filaire et sans fil"),
];
const retiredActivities = new Set([
 "session-4-workshop-expo-exchange",
 "session-4-workshop-expo-loan",
 "session-4-workshop-video-messagerie",
 "session-4-workshop-expo-diagnostic",
]);
const revisedMinutes:Record<string,number> = {
 patch:10,"video-adresse":4,"video-partage":5,"video-acces":4,"video-image":4,
 identity:11,wireless:8,mixed:10,
};
export const session4Activities:Session4Activity[] = session4Catalogue
 .filter(activity=>!retiredActivities.has(activity.id))
 .map(activity=>({...activity,minutes:revisedMinutes[activity.label]??activity.minutes}));
export const session4EarlierActivities = [
 ...session4Catalogue.filter(activity=>retiredActivities.has(activity.id)),
 ...previousEquipmentActivities,
 ...previousExpoActivities.filter(previous => !session4Activities.some(current => current.id === previous.id)),
 ...session4LegacyActivities,
];
export const session4AllActivities = [...session4Activities,...session4EarlierActivities];

export const session4Equipment = [
 {id:"switch",name:s4t("Commutateur · switch","المبدل"),image:"session4/images/commutateur.webp",answer:"switch",role:s4t("Relier plusieurs PC câblés","ربط عدة حواسيب بالكابل")},
 {id:"ap",name:s4t("Point d’accès Wi-Fi","نقطة ولوج Wi-Fi"),image:"session4/images/point-acces.webp",answer:"ap",role:s4t("Diffuser le Wi-Fi","بث شبكة Wi-Fi")},
 {id:"router",name:s4t("Routeur","الموجه"),image:"session4/images/routeur.webp",answer:"router",role:s4t("Relier deux réseaux","ربط شبكتين")},
 {id:"card",name:s4t("Carte réseau Ethernet","بطاقة شبكة Ethernet"),image:"session4/images/carte-ethernet.webp",answer:"card",role:s4t("Connexion PC par câble","اتصال الحاسوب بالكابل")},
 {id:"cable",name:s4t("Câble RJ45","كابل RJ45"),image:"session4/images/cable-rj45.webp",answer:"cable",role:s4t("Transporter les données","نقل البيانات")},
 {id:"printer",name:s4t("Imprimante réseau","طابعة شبكية"),image:"session4/images/imprimante.webp",answer:"printer",role:s4t("Peut recevoir des travaux d’impression depuis les PC du réseau.","يمكنها استقبال أوامر الطباعة من حواسيب الشبكة.")},
];
// La photo de l’imprimante reste utile dans les maquettes. Le stock identifie les éléments de mise en réseau.
export const session4OriginalStock = session4Equipment.filter(item => item.id !== "printer");
export const session4NetworkEquipment = [
 ...session4OriginalStock,
 {id:"wifi",name:s4t("Carte Wi-Fi","بطاقة Wi-Fi"),image:"session4/images/carte-wifi.jpg",answer:"wifi",role:s4t("Connexion PC par Wi-Fi","اتصال الحاسوب عبر Wi-Fi")},
];
export const session4Roles = [
 {id:"wired",label:s4t("Relier plusieurs appareils par câble dans le réseau local.","ربط عدة أجهزة بكابلات داخل الشبكة المحلية.")},
 {id:"wireless",label:s4t("Permettre aux appareils Wi-Fi de rejoindre le réseau local.","تمكين أجهزة Wi-Fi من الولوج إلى الشبكة المحلية.")},
 {id:"networks",label:s4t("Relier des réseaux, par exemple le réseau local et Internet.","ربط شبكات، مثل الشبكة المحلية والإنترنت.")},
 {id:"interface",label:s4t("Donner au PC une interface pour se connecter au réseau.","تزويد الحاسوب بواجهة للاتصال بالشبكة.")},
];
export const session4Repairs = [
 {id:"cable",title:s4t("Le câble du PC-22 est sorti de sa prise. Le test ping échoue.","خرج كابل PC-22 من منفذه، وفشل اختبار ping."),choices:[s4t("Rebrancher le câble, puis refaire le test.","أعد توصيل الكابل ثم كرر الاختبار."),s4t("Réinstaller le traitement de texte.","أعد تثبيت معالج النصوص."),s4t("Changer le contenu de Bonjour.txt.","غير محتوى Bonjour.txt.")],answer:0},
 {id:"rights",title:s4t("Le fichier s’ouvre, mais le voisin ne peut pas le modifier : son droit est Lecture.","يفتح الملف لكن لا يستطيع الزميل تعديله: صلاحياته للقراءة فقط."),choices:[s4t("Débrancher le commutateur.","افصل المبدل."),s4t("Demander à l’enseignant le droit de modification si cette tâche est nécessaire.","اطلب من الأستاذ صلاحية التعديل إذا كانت المهمة تتطلب ذلك."),s4t("Acheter une connexion Internet.","اشتر اتصالا بالإنترنت.")],answer:1},
 {id:"internet",title:s4t("Internet est coupé. Les deux PC restent reliés au même réseau et se répondent.","انقطع الإنترنت، لكن الحاسوبين ما زالا متصلين بالشبكة نفسها ويتبادلان الاستجابة."),choices:[s4t("Arrêter toute activité informatique.","أوقف كل نشاط معلوماتي."),s4t("Changer d’écran.","غير الشاشة."),s4t("Continuer l’échange local de messages et de fichiers.","واصل التبادل المحلي للرسائل والملفات.")],answer:2},
];
export const session4: CourseSession = {
 id:4,unit:2,title:s4t("Réseau local et échange d’information","الشبكة المحلية وتبادل المعلومات"),subtitle:s4t("2 h · relier, identifier, partager et communiquer","ساعتان · الربط والتعرف والمشاركة والتواصل"),
 mission:s4t("Mettre en service les trois réseaux de l’exposition du club.","تشغيل الشبكات الثلاث الخاصة بمعرض النادي."),
 situation:s4t("Le club prépare trois espaces connectés. Au bureau, deux PC utilisent des câbles. À la bibliothèque, les portables utilisent le Wi-Fi. Dans le hall, les appareils câblés et Wi-Fi doivent communiquer. Votre équipe construit les réseaux et vérifie les connexions.","يجهز النادي ثلاث فضاءات متصلة. في المكتب، يستعمل حاسوبان الكابل. وفي المكتبة، تستعمل الحواسيب المحمولة Wi-Fi. وفي الردهة، يجب أن تتواصل الأجهزة السلكية واللاسلكية. أنشئوا الشبكات وتحققوا من الاتصالات."),
 objectives:[s4t("Reconnaître les équipements réseau et associer chacun à sa fonction.","التعرف على أجهزة الشبكة وربط كل جهاز بوظيفته."),s4t("Distinguer et construire des réseaux filaire, sans fil et mixte.","تمييز الشبكات السلكية واللاسلكية والمختلطة وإنشاؤها."),s4t("Reconnaître les topologies étoile, bus et anneau.","التعرف على البنيات النجمية والخطية والحلقية."),s4t("Relever une IPv4 et un nom de poste, puis tester une liaison.","قراءة عنوان IPv4 واسم الحاسوب ثم اختبار الاتصال."),s4t("Partager un dossier en lecture et vérifier la réception du fichier.","مشاركة مجلد للقراءة والتحقق من التوصل بالملف.")],
 workshops:session4Activities.map((a,index)=>({label:String(index+1),duration:a.minutes,text:a.title})),deliverable:s4t("Trois réseaux connectés, une adresse IP relevée et un test ping réussi.","ثلاث شبكات متصلة وعنوان IP مقروء واختبار ping ناجح."),
 trace:[s4t("Un réseau local relie des appareils dans un espace limité pour communiquer et partager des ressources.","تربط الشبكة المحلية أجهزة داخل فضاء محدود للتواصل وتقاسم الموارد."),s4t("Filaire : les appareils se relient par câble RJ45 au commutateur. Sans fil : les appareils rejoignent le même Wi-Fi. Mixte : le point d’accès est relié par câble au commutateur.","سلكي: تتصل الأجهزة بالمبدل بكابل RJ45. لاسلكي: تلتحق الأجهزة بشبكة Wi-Fi نفسها. مختلط: تتصل نقطة الولوج بالمبدل عبر كابل."),s4t("Dans une étoile, les postes sont reliés à un équipement central. Un bus utilise une ligne commune ; un anneau forme une boucle.","في البنية النجمية ترتبط الحواسيب بجهاز مركزي، والخطية تستعمل خطا مشتركا، والحلقية تشكل حلقة."),s4t("ipconfig affiche la configuration IP ; hostname affiche le nom du poste ; ping teste la réponse d’une destination.","يعرض ipconfig إعدادات IP، ويعرض hostname اسم الحاسوب، ويختبر ping استجابة جهاز مستهدف."),s4t("Un chemin réseau commence par deux antislashs, puis l’adresse ou le nom du poste et le nom du partage.","يبدأ المسار الشبكي بشرطتين مائلتين عكسيتين، ثم عنوان الحاسوب أو اسمه واسم المجلد المشترك."),s4t("Lecture permet de consulter ; Modification permet aussi de changer les fichiers. BeeBEEP échange messages et fichiers sur le réseau local.","تسمح القراءة بالاطلاع، ويسمح التعديل أيضا بتغيير الملفات. يتبادل BeeBEEP الرسائل والملفات عبر الشبكة المحلية.")],
 vocabulary:[s4t("LAN · réseau local","LAN · شبكة محلية"),s4t("IPv4","IPv4"),s4t("Commutateur","مبدل"),s4t("Partage et permissions","المشاركة والصلاحيات")],quiz:[],
};
