import { session4 } from "./session4-data.ts";
import { session3 } from "./session3-data.ts";

export type Lang = "fr" | "ar";

export type LocalizedText = {
  fr: string;
  ar: string;
};

export type QuizQuestion = {
  question: LocalizedText;
  image?: { src: string; alt: LocalizedText };
  choices: LocalizedText[];
  answer: number;
  justifications?: LocalizedText[];
  justificationAnswer?: number;
};

export type TraceSection = {
  title: LocalizedText;
  items: LocalizedText[];
  image?: { src: string; alt: LocalizedText; size?: "medium" | "full" };
  cards?: { title: LocalizedText; text: LocalizedText; image?: string; icon?: string }[];
  wide?: boolean;
};

export type CourseSession = {
  id: number;
  unit: 1 | 2 | 3 | 4;
  title: LocalizedText;
  subtitle: LocalizedText;
  mission: LocalizedText;
  situation: LocalizedText;
  brief?: LocalizedText;
  objectives: LocalizedText[];
  workshops: { label: string; duration: number; text: LocalizedText }[];
  deliverable: LocalizedText;
  trace: LocalizedText[];
  traceSections?: TraceSection[];
  vocabulary: LocalizedText[];
  quiz: QuizQuestion[];
};

const t = (fr: string, ar: string): LocalizedText => ({ fr, ar });

export const units = [
  {
    id: 1,
    short: "U1",
    title: t("Environnement système", "بيئة النظام"),
    sessions: 3,
    hours: 6,
    accent: "cyan",
  },
  {
    id: 2,
    short: "U2",
    title: t("Réseau & communication", "الشبكة والتواصل"),
    sessions: 1,
    hours: 2,
    accent: "violet",
  },
  {
    id: 3,
    short: "U3",
    title: t("Tableur Excel", "الجداول الإلكترونية"),
    sessions: 6,
    hours: 12,
    accent: "green",
  },
  {
    id: 4,
    short: "U4",
    title: t("Algorithmique Logo.NET", "الخوارزميات Logo.NET"),
    sessions: 5,
    hours: 10,
    accent: "orange",
  },
] as const;

export const sessions: CourseSession[] = [
  {
    id: 1,
    unit: 1,
    title: t("Rappel : information & traitement", "تذكير: المعلومات والمعالجة"),
    subtitle: t("Premiers gestes, formes d’information et types de traitement", "الحركات الأولى وأشكال المعلومات وأنواع المعالجة"),
    mission: t(
      "Aider un nouvel élève à utiliser la souris et le clavier, puis lui expliquer comment une information est traitée.",
      "مساعدة تلميذ جديد على استعمال الفأرة ولوحة المفاتيح ثم شرح كيفية معالجة المعلومة."
    ),
    situation: t(
      "Votre binôme accueille un élève qui n’a jamais touché un ordinateur. Il doit réussir ses premiers gestes et distinguer traitement manuel, semi-automatique et automatique.",
      "تستقبل ثنائيتكم تلميذا لم يستعمل الحاسوب من قبل. عليه إنجاز حركاته الأولى والتمييز بين المعالجة اليدوية وشبه الآلية والآلية."
    ),
    brief: t(
      "Un camarade découvre l’ordinateur pour la première fois : aide-le à faire ses premiers gestes, puis découvre ce qu’est une information et comment elle est traitée.",
      "عندك زميل جديد ما عمرو استعمل الحاسوب. اليوم غادي تعاونو يدير أولى الحركات بالفأرة ولوحة المفاتيح، وغادي تكتشف شنو هي المعلومة وكيفاش كتعالج: باليد، ولا مع الآلة، ولا آليا بوحدها."
    ),
    objectives: [
      t("Cliquer, double-cliquer, saisir et valider au clavier.", "النقر والنقر المزدوج والكتابة والتأكيد بلوحة المفاتيح."),
      t("Définir informatique, information et traitement.", "تعريف المعلوميات والمعلومة والمعالجة."),
      t("Reconnaître texte, image, son et vidéo.", "التعرف على النص والصورة والصوت والفيديو."),
      t("Classer une situation en traitement manuel, semi-automatique ou automatique.", "تصنيف وضعية إلى معالجة يدوية أو شبه آلية أو آلية."),
    ],
    workshops: [
      { label: "A", duration: 25, text: t("Parcours intégré : précision de la souris, double-clic, saisie et validation.", "مسار مدمج: دقة الفأرة والنقر المزدوج والكتابة والتأكيد.") },
      { label: "B", duration: 60, text: t("Résoudre 11 exercices gradués sur les formes d’information et les trois types de traitement.", "حل 11 تمرينا متدرجا حول أشكال المعلومات وأنواع المعالجة الثلاثة.") },
    ],
    deliverable: t("14 exercices réussis + une explication orale d’un traitement automatique.", "إنجاز 14 تمرينا + شرح شفهي لمعالجة آلية."),
    trace: [
      t("L’informatique est la science du traitement automatique des informations.", "المعلوميات هي علم المعالجة الآلية للمعلومات."),
      t("L’information est un ensemble de données ayant un sens.", "المعلومة مجموعة من المعطيات لها معنى."),
      t("L’information peut prendre la forme d’un texte, d’une image, d’un son ou d’une vidéo.", "قد تكون المعلومة نصا أو صورة أو صوتا أو فيديو."),
      t("Un traitement transforme un état initial en état final par une suite d’opérations.", "تحول المعالجة حالة ابتدائية إلى حالة نهائية بواسطة سلسلة عمليات."),
      t("Le traitement peut être manuel, semi-automatique ou automatique.", "قد تكون المعالجة يدوية أو شبه آلية أو آلية."),
    ],
    traceSections: [
      {
        title: t("1. Définitions", "1. تعاريف"),
        items: [
          t("Le mot informatique vient de information et automatique.", "ترتبط كلمة المعلوميات بالمعلومة والمعالجة الآلية."),
          t("L’informatique est la science du traitement automatique des informations.", "المعلوميات هي علم المعالجة الآلية للمعلومات."),
          t("Une information est un ensemble de données qui possède un sens.", "المعلومة مجموعة من المعطيات التي لها معنى."),
        ],
      },
      {
        title: t("2. Formes d’information", "2. أشكال المعلومات"),
        items: [
          t("Les quatre formes étudiées sont : texte, image, son et vidéo.", "الأشكال الأربعة المدروسة هي: النص والصورة والصوت والفيديو."),
          t("Une même information peut être communiquée sous plusieurs formes.", "يمكن تقديم المعلومة نفسها بأشكال متعددة."),
        ],
      },
      {
        title: t("3. Traitement", "3. المعالجة"),
        items: [
          t("Le traitement est une suite d’opérations qui fait passer des données d’un état initial à un état final.", "المعالجة سلسلة عمليات تنقل المعطيات من حالة ابتدائية إلى حالة نهائية."),
          t("Exemples d’opérations : calculer, trier, comparer, modifier et enregistrer.", "من أمثلة العمليات: الحساب والترتيب والمقارنة والتعديل والحفظ."),
        ],
      },
      {
        title: t("4. Types de traitement", "4. أنواع المعالجة"),
        items: [
          t("Manuel : l’humain réalise seul toutes les opérations (écriture à la main).", "يدوي: ينجز الإنسان كل العمليات وحده مثل الكتابة باليد."),
          t("Semi-automatique : l’humain collabore avec la machine (scanner des produits, saisir des notes).", "شبه آلي: يتعاون الإنسان مع الآلة مثل مسح المنتجات وإدخال النقط."),
          t("Automatique : la machine exécute entièrement le traitement préparé (distributeur, robot, sauvegarde automatique).", "آلي: تنجز الآلة المعالجة كاملة مثل الموزع والروبوت والنسخ الاحتياطي التلقائي."),
        ],
      },
    ],
    vocabulary: [t("Informatique", "معلوميات"), t("Information", "معلومة"), t("Donnée", "معطى"), t("Traitement", "معالجة"), t("État initial", "حالة ابتدائية"), t("État final", "حالة نهائية")],
    quiz: [
      { question: t("L’informatique traite automatiquement…", "تعالج المعلوميات آليا…"), choices: [t("les informations", "المعلومات"), t("les tables seulement", "الطاولات فقط"), t("les câbles", "الأسلاك")], answer: 0 },
      { question: t("Une sonnerie est une information sous forme de…", "الجرس معلومة على شكل…"), choices: [t("texte", "نص"), t("son", "صوت"), t("image", "صورة")], answer: 1 },
      { question: t("Le traitement relie un état initial à…", "تربط المعالجة الحالة الابتدائية بـ…"), choices: [t("un état final", "حالة نهائية"), t("un câble", "سلك"), t("une souris", "فأرة")], answer: 0 },
      { question: t("Scanner un produit à la caisse est un traitement…", "مسح منتج عند الصندوق معالجة…"), choices: [t("manuel", "يدوية"), t("semi-automatique", "شبه آلية"), t("sans information", "دون معلومة")], answer: 1 },
      { question: t("Une sauvegarde lancée seule chaque nuit est…", "نسخ احتياطي ينطلق وحده كل ليلة هو…"), choices: [t("automatique", "آلي"), t("manuel", "يدوي"), t("un texte", "نص")], answer: 0 },
      { question: t("Pour ouvrir généralement un dossier, je…", "لفتح مجلد عادة…"), choices: [t("double-clique", "أنقر نقرا مزدوجا"), t("débranche", "أفصل السلك"), t("éteins l’écran", "أطفئ الشاشة")], answer: 0 },
    ],
  },
  {
    id: 2,
    unit: 1,
    title: t("Environnement matériel", "البيئة المادية"),
    subtitle: t("Périphériques, composants internes et capacités", "الملحقات والمكونات الداخلية والسعات"),
    mission: t("Construire un poste complet puis choisir une configuration adaptée au club multimédia.", "تركيب حاسوب كامل ثم اختيار تجهيز مناسب لنادي الوسائط."),
    situation: t("Le collège doit équiper un nouveau poste. Il faut reconnaître chaque élément, vérifier son rôle et justifier la configuration choisie.", "تريد المؤسسة تجهيز حاسوب جديد. يجب التعرف على كل عنصر ووظيفته وتبرير التجهيز المختار."),
    brief: t(
      "Le collège a acheté un nouvel ordinateur en pièces : à toi de choisir les bons composants, d’assembler le poste et de réparer les pannes qui apparaîtront.",
      "المؤسسة شرات حاسوب جديد، وخاصك نتا تختار القطع الصحيحة، تركب الحاسوب كامل، وتصلح أي عطب يظهر ليك."
    ),
    objectives: [
      t("Distinguer unité centrale et périphériques.", "التمييز بين الوحدة المركزية والملحقات."),
      t("Classer les périphériques d’entrée, de sortie, d’entrée/sortie et de stockage.", "تصنيف ملحقات الإدخال والإخراج والإدخال/الإخراج والتخزين."),
      t("Identifier carte mère, processeur, RAM, SSD et alimentation.", "التعرف على اللوحة الأم والمعالج وRAM وSSD ومزود الطاقة."),
      t("Ordonner et convertir bit, octet, Ko, Mo, Go et To.", "ترتيب وتحويل bit وoctet وKo وMo وGo وTo."),
    ],
    workshops: [
      { label: "A", duration: 30, text: t("Observer, reconnaître et classer le matériel avec des images et du glisser-déposer.", "ملاحظة المعدات والتعرف عليها وتصنيفها بالصور والسحب والإفلات.") },
      { label: "B", duration: 30, text: t("Associer les fonctions, diagnostiquer, ordonner puis convertir les capacités.", "ربط الوظائف والتشخيص وترتيب وحدات السعة ثم تحويلها.") },
    ],
    deliverable: t("12 activités réussies en 60 minutes : reconnaître, assembler, convertir et dépanner.", "إنجاز 12 نشاطا في 60 دقيقة: التعرف والتركيب والتحويل والإصلاح."),
    trace: [
      t("Un ordinateur comprend une unité centrale et des périphériques.", "يتكون الحاسوب من وحدة مركزية وملحقات."),
      t("Les périphériques servent à saisir, afficher, communiquer ou stocker l’information.", "تستخدم الملحقات لإدخال المعلومات أو عرضها أو التواصل بها أو تخزينها."),
      t("Le processeur traite, la RAM mémorise temporairement et le SSD stocke durablement.", "يعالج المعالج وتحفظ RAM مؤقتا ويخزن SSD بشكل دائم."),
      t("Les capacités s’ordonnent : bit, octet, Ko, Mo, Go, To.", "ترتب السعات هكذا: bit ثم octet ثم Ko ثم Mo ثم Go ثم To."),
    ],
    traceSections: [
      {
        title: t("1. Composition d’un ordinateur", "1. مكونات الحاسوب"),
        wide: true,
        items: [
          t("Un ordinateur est une machine de traitement automatique des informations.", "الحاسوب آلة للمعالجة الآلية للمعلومات."),
          t("Il est composé d’une unité centrale et de périphériques.", "يتكون من وحدة مركزية وملحقات."),
        ],
      },
      {
        title: t("2. Périphériques", "2. الملحقات"),
        items: [],
        wide: true,
        image: {
          src: "session2/schema-peripheriques.png",
          alt: t("Schéma des périphériques d’entrée, de sortie, d’entrée/sortie et de stockage", "خطاطة ملحقات الإدخال والإخراج والإدخال والإخراج والتخزين"),
          size: "medium",
        },
      },
      {
        title: t("3. Composants internes", "3. المكونات الداخلية"),
        items: [],
        cards: [
          { title: t("Carte mère", "اللوحة الأم"), text: t("Connecte tous les composants.", "تربط جميع المكونات."), image: "session2/items/ex12-card-02.jpg" },
          { title: t("Processeur (CPU)", "المعالج (CPU)"), text: t("Cerveau de l’ordinateur.", "عقل الحاسوب."), image: "session2/items/ex12-card-01.png" },
          { title: t("Mémoire RAM", "ذاكرة RAM"), text: t("Stockage temporaire rapide.", "تخزين مؤقت وسريع."), image: "session2/items/ex12-card-03.jpg" },
          { title: t("Disque SSD", "قرص SSD"), text: t("Stockage permanent.", "تخزين دائم."), image: "session2/items/ex12-card-05.jpg" },
          { title: t("Carte graphique", "بطاقة الرسوم"), text: t("Traite les images.", "تعالج الصور."), image: "session2/items/ex12-card-06.jpg" },
          { title: t("Carte réseau", "بطاقة الشبكة"), text: t("Assure la connexion au réseau.", "تؤمّن الاتصال بالشبكة."), image: "session2/items/ex12-card-09.jpg" },
          { title: t("Alimentation", "مزود الطاقة"), text: t("Fournit l’énergie aux composants.", "يوفر الطاقة للمكونات."), image: "session2/items/ex12-card-07.jpg" },
          { title: t("Carte son", "بطاقة الصوت"), text: t("Gère le son et l’audio de l’ordinateur.", "تدير الصوت في الحاسوب."), image: "session2/items/carte-son.png" },
        ],
      },
      {
        title: t("4. Unités de capacité", "4. وحدات السعة"),
        items: [
          t("Vers une unité plus petite, je multiplie : 3 Go × 1000 = 3000 Mo.", "نحو وحدة أصغر أضرب: 3 Go × 1000 = 3000 Mo."),
          t("Vers une unité plus grande, je divise : 5000 Mo ÷ 1000 = 5 Go.", "نحو وحدة أكبر أقسم: 5000 Mo ÷ 1000 = 5 Go."),
          t("Entre bit et octet, j’utilise 8 : 8000 bits ÷ 8 = 1000 octets.", "بين bit وoctet أستعمل 8: 8000 bits ÷ 8 = 1000 octets."),
        ],
        wide: true,
        image: {
          src: "session2/unites-de-capacite.png",
          alt: t("Échelle de conversion entre bit, octet, Ko, Mo, Go et To", "سلم التحويل بين bit وoctet وKo وMo وGo وTo"),
          size: "medium",
        },
      },
    ],
    vocabulary: [t("Unité centrale", "وحدة مركزية"), t("Périphérique", "ملحق"), t("Processeur", "معالج"), t("Mémoire vive", "ذاكرة حية"), t("Stockage", "تخزين"), t("Capacité", "سعة")],
    quiz: [
      {
        question: t("Quel composant exécute les instructions et traite les données ?", "أي مكوّن ينفّذ التعليمات ويعالج المعطيات؟"),
        choices: [
          t("Le processeur (CPU)", "المعالج (CPU)"),
          t("La mémoire RAM", "ذاكرة RAM"),
          t("La carte mère", "اللوحة الأم"),
          t("L’alimentation", "مزود الطاقة"),
        ],
        answer: 0,
        justifications: [
          t("Il effectue les calculs et exécute les instructions des programmes.", "ينجز العمليات الحسابية وينفّذ تعليمات البرامج."),
          t("Elle conserve temporairement les données des programmes ouverts.", "تحفظ مؤقتا معطيات البرامج المفتوحة."),
          t("Elle relie les composants entre eux grâce à ses connecteurs.", "تربط المكوّنات فيما بينها بواسطة موصلاتها."),
          t("Elle fournit l’énergie électrique aux composants.", "تزوّد المكوّنات بالطاقة الكهربائية."),
        ],
        justificationAnswer: 0,
      },
      {
        question: t("Le microphone appartient à quelle catégorie de périphériques ?", "إلى أي صنف من الملحقات ينتمي الميكروفون؟"),
        choices: [
          t("Périphérique d’entrée", "ملحق إدخال"),
          t("Périphérique de sortie", "ملحق إخراج"),
          t("Périphérique de stockage", "ملحق تخزين"),
          t("Périphérique d’entrée et de sortie", "ملحق إدخال وإخراج"),
        ],
        answer: 0,
        justifications: [
          t("Il capte la voix et envoie le son vers l’unité centrale.", "يلتقط الصوت ويرسله إلى الوحدة المركزية."),
          t("Il diffuse le son produit par l’ordinateur vers l’utilisateur.", "يبث الصوت الصادر عن الحاسوب نحو المستعمل."),
          t("Il conserve durablement des fichiers audio.", "يحفظ الملفات الصوتية بشكل دائم."),
          t("Il affiche des informations et reçoit des commandes tactiles.", "يعرض المعلومات ويستقبل الأوامر باللمس."),
        ],
        justificationAnswer: 0,
      },
      {
        question: t("Comment classe-t-on un écran tactile ?", "كيف نصنّف الشاشة اللمسية؟"),
        choices: [
          t("Périphérique d’entrée et de sortie", "ملحق إدخال وإخراج"),
          t("Périphérique d’entrée seulement", "ملحق إدخال فقط"),
          t("Périphérique de sortie seulement", "ملحق إخراج فقط"),
          t("Périphérique de stockage", "ملحق تخزين"),
        ],
        answer: 0,
        justifications: [
          t("Il affiche les informations et reçoit les actions du doigt.", "يعرض المعلومات ويستقبل أوامر الإصبع."),
          t("Il sert uniquement à envoyer des commandes à l’ordinateur.", "يستعمل فقط لإرسال الأوامر إلى الحاسوب."),
          t("Il sert uniquement à présenter les résultats à l’utilisateur.", "يستعمل فقط لعرض النتائج للمستعمل."),
          t("Il conserve les fichiers même lorsque l’ordinateur est éteint.", "يحفظ الملفات حتى بعد إطفاء الحاسوب."),
        ],
        justificationAnswer: 0,
      },
      {
        question: t("Quel appareil transforme un document papier en fichier numérique ?", "أي جهاز يحوّل وثيقة ورقية إلى ملف رقمي؟"),
        choices: [
          t("Le scanner", "الماسح الضوئي"),
          t("L’imprimante", "الطابعة"),
          t("L’écran", "الشاشة"),
          t("La webcam", "كاميرا الويب"),
        ],
        answer: 0,
        justifications: [
          t("Il analyse la feuille et transmet son image à l’ordinateur.", "يمسح الورقة ويرسل صورتها إلى الحاسوب."),
          t("Elle produit une copie sur papier à partir d’un fichier.", "تنتج نسخة ورقية انطلاقا من ملف."),
          t("Il affiche le document sans le numériser.", "يعرض الوثيقة دون رقمنتها."),
          t("Elle filme principalement une scène placée devant l’ordinateur.", "تصوّر أساسا مشهدا أمام الحاسوب."),
        ],
        justificationAnswer: 0,
      },
      {
        question: t("Quel composant relie les composants internes entre eux ?", "أي مكوّن يربط المكوّنات الداخلية فيما بينها؟"),
        choices: [
          t("La carte mère", "اللوحة الأم"),
          t("La carte graphique", "بطاقة الرسوميات"),
          t("Le disque SSD", "قرص SSD"),
          t("L’alimentation", "مزود الطاقة"),
        ],
        answer: 0,
        justifications: [
          t("Ses connecteurs et ses circuits permettent aux composants de communiquer.", "تسمح موصلاتها ودوائرها للمكوّنات بالتواصل."),
          t("Elle calcule principalement les images affichées à l’écran.", "تعالج أساسا الصور المعروضة على الشاشة."),
          t("Il conserve durablement le système et les fichiers.", "يحفظ النظام والملفات بشكل دائم."),
          t("Elle transforme et distribue l’énergie électrique.", "تحوّل الطاقة الكهربائية وتوزعها."),
        ],
        justificationAnswer: 0,
      },
      {
        question: t("Quelle mémoire contient temporairement les programmes ouverts ?", "أي ذاكرة تحتوي مؤقتا على البرامج المفتوحة؟"),
        choices: [
          t("La mémoire RAM", "ذاكرة RAM"),
          t("Le disque SSD", "قرص SSD"),
          t("Le processeur", "المعالج"),
          t("La clé USB", "مفتاح USB"),
        ],
        answer: 0,
        justifications: [
          t("Elle garde rapidement les données en cours d’utilisation et se vide à l’arrêt.", "تحفظ بسرعة المعطيات المستعملة حاليا وتُفرغ عند الإطفاء."),
          t("Il conserve durablement le système, les logiciels et les fichiers.", "يحفظ النظام والبرامج والملفات بشكل دائم."),
          t("Il exécute les instructions et réalise les calculs.", "ينفّذ التعليمات وينجز العمليات الحسابية."),
          t("Elle transporte des fichiers d’un appareil à un autre.", "تنقل الملفات من جهاز إلى آخر."),
        ],
        justificationAnswer: 0,
      },
      {
        question: t("Quel port utilise-t-on généralement pour relier un vidéoprojecteur récent ?", "أي منفذ نستعمل عادة لربط مسلاط حديث؟"),
        choices: [
          t("HDMI", "HDMI"),
          t("RJ45", "RJ45"),
          t("Jack audio", "منفذ Jack الصوتي"),
          t("USB-B", "USB-B"),
        ],
        answer: 0,
        justifications: [
          t("Il transporte une image et du son numériques dans un même câble.", "ينقل الصورة والصوت الرقميين عبر الكابل نفسه."),
          t("Il sert principalement à connecter l’ordinateur à un réseau câblé.", "يستعمل أساسا لربط الحاسوب بشبكة سلكية."),
          t("Il transporte uniquement un signal audio analogique.", "ينقل فقط إشارة صوتية تماثلية."),
          t("Il est surtout utilisé pour relier certaines imprimantes à l’ordinateur.", "يستعمل غالبا لربط بعض الطابعات بالحاسوب."),
        ],
        justificationAnswer: 0,
      },
      {
        question: t("En notation décimale, combien de Mo contient 1 Go ?", "في النظام العشري، كم Mo يحتويه 1 Go؟"),
        choices: [
          t("1 000 Mo", "1 000 Mo"),
          t("8 Mo", "8 Mo"),
          t("100 Mo", "100 Mo"),
          t("1 024 bits", "1 024 bit"),
        ],
        answer: 0,
        justifications: [
          t("Pour passer de Go à Mo, on descend d’un niveau et on multiplie par 1 000.", "للانتقال من Go إلى Mo ننزل درجة ونضرب في 1 000."),
          t("On multiplie par 8 uniquement pour passer des octets aux bits.", "نضرب في 8 فقط للانتقال من الأوكتات إلى البتات."),
          t("Chaque changement d’unité correspond toujours à une multiplication par 100.", "كل تغيير للوحدة يوافق دائما الضرب في 100."),
          t("Go et bit sont deux unités successives dans l’échelle.", "Go وbit وحدتان متتاليتان في السلم."),
        ],
        justificationAnswer: 0,
      },
      {
        question: t("Quel composant convient pour conserver durablement les fichiers ?", "أي مكوّن يناسب حفظ الملفات بشكل دائم؟"),
        choices: [
          t("Le disque SSD", "قرص SSD"),
          t("La mémoire RAM", "ذاكرة RAM"),
          t("Le processeur", "المعالج"),
          t("Le ventilateur", "المروحة"),
        ],
        answer: 0,
        justifications: [
          t("Il garde les données même lorsque l’ordinateur est éteint.", "يحفظ المعطيات حتى عندما يكون الحاسوب مطفأ."),
          t("Elle perd les données temporaires lorsque l’ordinateur s’éteint.", "تفقد المعطيات المؤقتة عند إطفاء الحاسوب."),
          t("Il traite les données mais n’est pas un espace de stockage.", "يعالج المعطيات لكنه ليس وسيلة تخزين."),
          t("Il refroidit les composants pour éviter leur surchauffe.", "يبرّد المكوّنات لتجنب ارتفاع حرارتها."),
        ],
        justificationAnswer: 0,
      },
      {
        question: t("Quelle configuration est la plus adaptée au montage vidéo ?", "ما التجهيز الأنسب لتركيب الفيديو؟"),
        choices: [
          t("Processeur récent, 16 Go de RAM et SSD de 512 Go", "معالج حديث وRAM بسعة 16 Go وSSD بسعة 512 Go"),
          t("Processeur ancien, 2 Go de RAM et disque de 80 Go", "معالج قديم وRAM بسعة 2 Go وقرص بسعة 80 Go"),
          t("Ordinateur avec un grand clavier uniquement", "حاسوب بلوحة مفاتيح كبيرة فقط"),
          t("2 Go de RAM et disque dur de 1 To", "RAM بسعة 2 Go وقرص صلب بسعة 1 To"),
        ],
        answer: 0,
        justifications: [
          t("Le processeur calcule, la RAM facilite le travail simultané et le SSD accélère l’accès aux vidéos.", "يعالج المعالج الحسابات وتسهّل RAM العمل المتزامن ويسرّع SSD الوصول إلى الفيديوهات."),
          t("Une faible mémoire RAM suffit toujours, quelle que soit la tâche demandée.", "تكفي ذاكرة RAM ضعيفة دائما مهما كانت المهمة المطلوبة."),
          t("La taille du clavier détermine directement la vitesse du montage vidéo.", "يحدد حجم لوحة المفاتيح مباشرة سرعة تركيب الفيديو."),
          t("Une grande capacité de stockage compense totalement le manque de RAM.", "تعوّض سعة التخزين الكبيرة كليا نقص RAM."),
        ],
        justificationAnswer: 0,
      },
    ],
  },
  session3,
  session4,
  {
    id: 5,
    unit: 3,
    title: t("Premiers pas dans Excel", "الخطوات الأولى في Excel"),
    subtitle: t("Cellules, données et calculs", "الخلايا والبيانات والحساب"),
    mission: t("Construire la feuille de dépenses d’une sortie scolaire.", "إنشاء ورقة مصاريف لرحلة مدرسية."),
    situation: t("Le club dispose d’un budget de 1 200 DH et doit prévoir transport, repas et activités.", "يتوفر النادي على ميزانية 1200 درهم لتغطية النقل والوجبات والأنشطة."),
    brief: t(
      "Le club a 1 200 DH pour une sortie scolaire : à vous de prévoir les dépenses sans dépasser le budget, en construisant votre première feuille Excel.",
      "النادي عندو 1200 درهم لرحلة مدرسية، وخاصكم تحسبو المصاريف بلا ما تفوتو الميزانية. اليوم غادي تبنيو أول جدول Excel ديالكم: النقل، الماكلة، والأنشطة."
    ),
    objectives: [
      t("Repérer lignes, colonnes, cellules et barre de formule.", "تمييز الصفوف والأعمدة والخلايا وشريط الصيغة."),
      t("Saisir et modifier des données.", "إدخال البيانات وتعديلها."),
      t("Écrire une formule simple avec +, −, × et ÷.", "كتابة صيغة بسيطة باستعمال العمليات الأربع."),
    ],
    workshops: [
      { label: "A", duration: 25, text: t("Reproduire un tableau de six dépenses avec titres et unités.", "إعادة إنشاء جدول لستة مصاريف بعناوين ووحدات.") },
      { label: "B", duration: 35, text: t("Calculer chaque coût puis le budget restant avec des références de cellules.", "حساب كل تكلفة ثم الميزانية المتبقية باستعمال مراجع الخلايا.") },
    ],
    deliverable: t("Classeur Sortie_2AC.xlsx avec au moins 5 formules.", "مصنف Sortie_2AC.xlsx يتضمن خمس صيغ على الأقل."),
    trace: [
      t("Une formule Excel commence toujours par le signe =.", "تبدأ صيغة Excel دائما بعلامة =."),
      t("Une cellule est repérée par la lettre de sa colonne et le numéro de sa ligne.", "تحدد الخلية بحرف العمود ورقم الصف."),
    ],
    vocabulary: [t("Cellule", "خلية"), t("Classeur", "مصنف"), t("Formule", "صيغة")],
    quiz: [
      { question: t("Quelle référence désigne colonne C, ligne 7 ?", "ما مرجع العمود C والصف 7؟"), choices: [t("7C", "7C"), t("C7", "C7"), t("C:7", "C:7")], answer: 1 },
      { question: t("Quelle écriture est une formule ?", "أي كتابة تمثل صيغة؟"), choices: [t("A1+B1", "A1+B1"), t("=A1+B1", "=A1+B1"), t("A1=B1", "A1=B1")], answer: 1 },
    ],
  },
  {
    id: 6,
    unit: 3,
    title: t("Formules et recopie", "الصيغ والنسخ"),
    subtitle: t("Calculer vite sans recommencer", "الحساب بسرعة دون إعادة العمل"),
    mission: t("Automatiser les factures d’une petite librairie scolaire.", "أتمتة فواتير مكتبة مدرسية صغيرة."),
    situation: t("Vingt lignes de produits doivent être calculées. Saisir la même formule vingt fois serait trop long.", "يجب حساب عشرين سطرا من المنتجات وإعادة الصيغة عشرين مرة أمر طويل."),
    brief: t(
      "Une librairie doit calculer vingt lignes de produits. Réécrire la même formule vingt fois ? Aujourd’hui, Excel va la recopier pour toi.",
      "مكتبة مدرسية عندها 20 سطر ديال المنتجات خاصهم يتحسبو. واش غادي تعاود تكتب نفس الصيغة 20 مرة؟ اليوم غادي تعلم كيفاش Excel كيعاودها بوحدو."
    ),
    objectives: [
      t("Utiliser les opérateurs dans le bon ordre.", "استعمال العمليات بالترتيب الصحيح."),
      t("Recopier une formule avec la poignée.", "نسخ صيغة باستعمال مقبض التعبئة."),
      t("Vérifier les références obtenues.", "التحقق من المراجع الناتجة."),
    ],
    workshops: [
      { label: "A", duration: 25, text: t("Calculer quantité × prix pour la première ligne d’une facture.", "حساب الكمية × الثمن في أول سطر من الفاتورة.") },
      { label: "B", duration: 35, text: t("Recopier la formule sur 20 lignes puis détecter trois erreurs préparées.", "نسخ الصيغة على 20 سطرا ثم اكتشاف ثلاثة أخطاء معدة مسبقا.") },
    ],
    deliverable: t("Facture automatisée et vérifiée par le binôme voisin.", "فاتورة مؤتمتة ومتحقق منها من طرف ثنائية مجاورة."),
    trace: [
      t("La poignée de recopie adapte les références relatives.", "يكيّف مقبض التعبئة المراجع النسبية."),
      t("Les parenthèses imposent l’ordre des calculs.", "تحدد الأقواس ترتيب العمليات."),
    ],
    vocabulary: [t("Recopie", "نسخ"), t("Référence relative", "مرجع نسبي"), t("Opérateur", "عامل")],
    quiz: [
      { question: t("Pour calculer quantité × prix en B2 et C2…", "لحساب الكمية × الثمن في B2 وC2…"), choices: [t("=B2*C2", "=B2*C2"), t("B2xC2", "B2xC2"), t("=B+C", "=B+C")], answer: 0 },
      { question: t("La recopie vers le bas transforme B2 en…", "النسخ إلى الأسفل يحول B2 إلى…"), choices: [t("B3", "B3"), t("C2", "C2"), t("B2 toujours", "B2 دائما")], answer: 0 },
    ],
  },
  {
    id: 7,
    unit: 3,
    title: t("Les fonctions essentielles", "الدوال الأساسية"),
    subtitle: t("SOMME, MOYENNE, MIN et MAX", "SOMME وMOYENNE وMIN وMAX"),
    mission: t("Produire le bulletin statistique d’un mini-tournoi sportif.", "إعداد حصيلة إحصائية لدوري رياضي مصغر."),
    situation: t("Les résultats de huit équipes sont prêts, mais il faut rapidement connaître total, moyenne et records.", "نتائج ثمانية فرق جاهزة ويجب تحديد المجموع والمتوسط والأرقام بسرعة."),
    brief: t(
      "Le tournoi est terminé et les résultats des huit équipes sont là. Qui a le meilleur total ? Quelle est la moyenne ? Les fonctions d’Excel vont répondre pour toi.",
      "الدوري الرياضي سالة، ونتائج 8 فرق واجدة. شكون جمع أكثر؟ وشنو هو المتوسط؟ اليوم غادي تخلي Excel يجاوبك بالدوال الجاهزة."
    ),
    objectives: [
      t("Reconnaître la syntaxe d’une fonction.", "التعرف على بنية الدالة."),
      t("Utiliser SOMME, MOYENNE, MIN et MAX.", "استعمال SOMME وMOYENNE وMIN وMAX."),
      t("Sélectionner une plage de cellules correcte.", "تحديد مجال خلايا صحيح."),
    ],
    workshops: [
      { label: "A", duration: 30, text: t("Calculer les quatre indicateurs pour une première discipline.", "حساب المؤشرات الأربعة لأول رياضة.") },
      { label: "B", duration: 30, text: t("Étendre les calculs aux autres disciplines et interpréter les résultats.", "تعميم الحسابات على باقي الرياضات وتفسير النتائج.") },
    ],
    deliverable: t("Tableau de synthèse avec 12 fonctions correctes.", "جدول تلخيصي يتضمن 12 دالة صحيحة."),
    trace: [
      t("Une plage continue s’écrit avec deux-points : A2:A9.", "يكتب المجال المتصل بنقطتين: A2:A9."),
      t("Une fonction automatise un calcul fréquent sur une plage.", "تؤتمت الدالة حسابا متكررا على مجال."),
    ],
    vocabulary: [t("Fonction", "دالة"), t("Plage", "مجال"), t("Moyenne", "متوسط")],
    quiz: [
      { question: t("Quelle fonction additionne B2 à B9 ?", "أي دالة تجمع B2 إلى B9؟"), choices: [t("=SOMME(B2:B9)", "=SOMME(B2:B9)"), t("=PLUS(B2:B9)", "=PLUS(B2:B9)"), t("=B2:B9", "=B2:B9")], answer: 0 },
      { question: t("MAX renvoie…", "تعيد MAX…"), choices: [t("la plus petite valeur", "أصغر قيمة"), t("la plus grande valeur", "أكبر قيمة"), t("la somme", "المجموع")], answer: 1 },
    ],
  },
  {
    id: 8,
    unit: 3,
    title: t("Présenter pour comprendre", "التنسيق من أجل الفهم"),
    subtitle: t("Mise en forme et graphiques", "التنسيق والمبيانات"),
    mission: t("Transformer des chiffres bruts en une affiche lisible sur la consommation d’eau.", "تحويل أرقام خام إلى ملصق واضح حول استهلاك الماء."),
    situation: t("L’éco-club possède les relevés mensuels, mais le tableau est illisible pour les visiteurs.", "يتوفر النادي البيئي على بيانات شهرية لكن الجدول غير واضح للزوار."),
    brief: t(
      "L’éco-club a les relevés d’eau du collège, mais son tableau est illisible. Ta mission : le transformer en une affiche claire que tout le monde comprend.",
      "النادي البيئي عندو أرقام استهلاك الماء ديال الشهور، ولكن الجدول معقد وما كيفهمو حد. مهمتك: تحولو لملصق واضح يفهمو أي زائر."
    ),
    objectives: [
      t("Appliquer une mise en forme cohérente.", "تطبيق تنسيق منسجم."),
      t("Choisir un graphique adapté aux données.", "اختيار مبيان ملائم للبيانات."),
      t("Ajouter titre, légende et unités.", "إضافة العنوان والمفتاح والوحدات."),
    ],
    workshops: [
      { label: "A", duration: 25, text: t("Hiérarchiser le tableau avec titres, formats et bordures utiles.", "تنظيم الجدول بالعناوين والصيغ والحدود المناسبة.") },
      { label: "B", duration: 35, text: t("Créer deux graphiques, comparer puis conserver le plus pertinent.", "إنشاء مبيانين ومقارنتهما ثم الاحتفاظ بالأوضح.") },
    ],
    deliverable: t("Une feuille prête à imprimer avec un graphique commenté.", "ورقة جاهزة للطباعة تتضمن مبيانا مشروحا."),
    trace: [
      t("La mise en forme sert la lecture ; elle ne remplace pas les données.", "يساعد التنسيق على القراءة ولا يعوض البيانات."),
      t("Un graphique doit toujours préciser son titre et ses unités.", "يجب أن يوضح المبيان عنوانه ووحداته."),
    ],
    vocabulary: [t("Graphique", "مبيان"), t("Légende", "مفتاح"), t("Format", "تنسيق")],
    quiz: [
      { question: t("Pour montrer une évolution mensuelle, on choisit souvent…", "لإظهار تطور شهري نختار غالبا…"), choices: [t("une courbe", "منحنى"), t("une zone de texte", "مربع نص"), t("une seule cellule", "خلية واحدة")], answer: 0 },
      { question: t("Un graphique lisible doit avoir…", "يجب أن يتضمن المبيان الواضح…"), choices: [t("beaucoup de couleurs", "ألوانا كثيرة"), t("un titre et des unités", "عنوانا ووحدات"), t("aucune étiquette", "دون تسميات")], answer: 1 },
    ],
  },
  {
    id: 9,
    unit: 3,
    title: t("Décider avec SI", "اتخاذ القرار باستعمال SI"),
    subtitle: t("Conditions et références absolues", "الشروط والمراجع المطلقة"),
    mission: t("Créer un tableau qui attribue automatiquement une appréciation.", "إنشاء جدول يمنح التقدير آليا."),
    situation: t("Le responsable du club veut afficher “Objectif atteint” dès qu’un groupe obtient au moins 10 points.", "يريد مسؤول النادي إظهار «تم بلوغ الهدف» عندما تحصل المجموعة على 10 نقط على الأقل."),
    brief: t(
      "Le responsable du club veut un tableau qui décide tout seul : dès qu’un groupe atteint 10 points, « Objectif atteint » s’affiche. C’est le rôle de la fonction SI.",
      "مسؤول النادي بغا الجدول يقرر بوحدو: إلا جابت المجموعة 10 نقط ولا أكثر، يظهر «تم بلوغ الهدف». اليوم غادي تعلم Excel يقول «إلا... إذن» بالدالة SI."
    ),
    objectives: [
      t("Construire une condition simple avec SI.", "بناء شرط بسيط باستعمال SI."),
      t("Utiliser les opérateurs de comparaison.", "استعمال معاملات المقارنة."),
      t("Fixer une cellule avec une référence absolue.", "تثبيت خلية بمرجع مطلق."),
    ],
    workshops: [
      { label: "A", duration: 30, text: t("Afficher Réussi/À renforcer à partir d’un seuil.", "إظهار ناجح/يحتاج دعما انطلاقا من عتبة.") },
      { label: "B", duration: 30, text: t("Placer le seuil dans une cellule fixe puis recopier la formule.", "وضع العتبة في خلية ثابتة ثم نسخ الصيغة.") },
    ],
    deliverable: t("Grille de suivi dynamique avec seuil modifiable.", "شبكة تتبع دينامية بعتبة قابلة للتعديل."),
    trace: [
      t("SI teste une condition puis renvoie une valeur si vrai et une autre si faux.", "تختبر SI شرطا ثم تعيد قيمة إذا تحقق وأخرى إذا لم يتحقق."),
      t("Les signes $ rendent une référence absolue, par exemple $B$1.", "تجعل علامة $ المرجع مطلقا مثل $B$1."),
    ],
    vocabulary: [t("Condition", "شرط"), t("Seuil", "عتبة"), t("Référence absolue", "مرجع مطلق")],
    quiz: [
      { question: t("Quel opérateur signifie supérieur ou égal ?", "أي معامل يعني أكبر من أو يساوي؟"), choices: [t(">=", ">="), t("=>", "=>"), t("==", "==")], answer: 0 },
      { question: t("Quelle référence reste fixe ?", "أي مرجع يبقى ثابتا؟"), choices: [t("B1", "B1"), t("$B$1", "$B$1"), t("B:B", "B:B")], answer: 1 },
    ],
  },
  {
    id: 10,
    unit: 3,
    title: t("Projet Excel : gérer un événement", "مشروع Excel: تدبير نشاط"),
    subtitle: t("Synthèse, contrôle et présentation", "التركيب والتحقق والعرض"),
    mission: t("Livrer un tableau de bord complet pour la journée culturelle du collège.", "إنجاز لوحة قيادة متكاملة لليوم الثقافي بالمؤسسة."),
    situation: t("Il faut suivre les inscriptions, les dépenses et la participation, puis présenter un bilan au directeur.", "يجب تتبع التسجيلات والمصاريف والمشاركة ثم تقديم حصيلة للمدير."),
    brief: t(
      "La journée culturelle approche : inscriptions, dépenses et participation à suivre, puis un bilan complet à présenter au directeur. C’est ton projet Excel.",
      "اليوم الثقافي قرب! خاصك تتبع التسجيلات والمصاريف والمشاركة، وتقدم للمدير لوحة قيادة كاملة وواضحة. هذا هو مشروع Excel ديالك."
    ),
    objectives: [
      t("Mobiliser formules, fonctions, SI et graphiques.", "توظيف الصيغ والدوال وSI والمبيانات."),
      t("Contrôler la cohérence d’un classeur.", "التحقق من اتساق المصنف."),
      t("Présenter et défendre ses choix.", "عرض الاختيارات والدفاع عنها."),
    ],
    workshops: [
      { label: "A", duration: 40, text: t("Construire le tableau de bord à partir d’un cahier des charges.", "بناء لوحة القيادة انطلاقا من دفتر تحملات.") },
      { label: "B", duration: 20, text: t("Effectuer un audit croisé puis corriger avant la remise.", "إجراء مراجعة متبادلة ثم التصحيح قبل التسليم.") },
    ],
    deliverable: t("Classeur final à 3 feuilles + présentation orale de 2 minutes.", "مصنف نهائي من ثلاث أوراق + عرض شفهي لمدة دقيقتين."),
    trace: [
      t("Un bon classeur sépare données, calculs et synthèse.", "يفصل المصنف الجيد بين البيانات والحسابات والخلاصة."),
      t("Toute formule importante doit être testée avec plusieurs valeurs.", "يجب اختبار كل صيغة مهمة بقيم مختلفة."),
    ],
    vocabulary: [t("Tableau de bord", "لوحة قيادة"), t("Audit", "مراجعة"), t("Synthèse", "خلاصة")],
    quiz: [
      { question: t("Avant de livrer un classeur, il faut…", "قبل تسليم المصنف يجب…"), choices: [t("tester les formules", "اختبار الصيغ"), t("masquer les erreurs", "إخفاء الأخطاء"), t("supprimer les titres", "حذف العناوين")], answer: 0 },
      { question: t("La meilleure synthèse contient…", "أفضل خلاصة تتضمن…"), choices: [t("toutes les cellules", "كل الخلايا"), t("des indicateurs utiles", "مؤشرات مفيدة"), t("seulement des couleurs", "ألوانا فقط")], answer: 1 },
    ],
  },
  {
    id: 11,
    unit: 4,
    title: t("Commander la tortue", "توجيه السلحفاة"),
    subtitle: t("Instructions et repérage", "التعليمات والتموقع"),
    mission: t("Programmer un robot-tortue pour tracer un parcours précis.", "برمجة سلحفاة آلية لرسم مسار دقيق."),
    situation: t("La tortue doit rejoindre la sortie d’un labyrinthe sans traverser les murs.", "على السلحفاة بلوغ مخرج المتاهة دون اختراق الجدران."),
    brief: t(
      "Une tortue-robot est dans un labyrinthe : elle doit atteindre la sortie sans traverser les murs. C’est toi qui vas la programmer, pas à pas.",
      "كاينة سلحفاة آلية وسط متاهة، وخاصها توصل للمخرج بلا ما تضرب في الحيطان. نتا هو اللي غادي تبرمجها خطوة بخطوة."
    ),
    objectives: [
      t("Exécuter AV, RE, TD et TG.", "تنفيذ AV وRE وTD وTG."),
      t("Prévoir l’effet d’une suite d’instructions.", "توقع أثر سلسلة تعليمات."),
      t("Corriger un trajet par essais raisonnées.", "تصحيح المسار بمحاولات مبررة."),
    ],
    workshops: [
      { label: "A", duration: 25, text: t("Prédire puis vérifier cinq déplacements courts.", "توقع ثم التحقق من خمس حركات قصيرة.") },
      { label: "B", duration: 35, text: t("Écrire l’algorithme qui permet de sortir du labyrinthe.", "كتابة خوارزمية الخروج من المتاهة.") },
    ],
    deliverable: t("Programme commenté + capture du trajet réussi.", "برنامج مشروح + لقطة للمسار الناجح."),
    trace: [
      t("Un programme est une suite ordonnée d’instructions exécutables.", "البرنامج سلسلة مرتبة من التعليمات القابلة للتنفيذ."),
      t("Une rotation change la direction, pas la position de la tortue.", "يغير الدوران اتجاه السلحفاة لا موقعها."),
    ],
    vocabulary: [t("Instruction", "تعليمة"), t("Algorithme", "خوارزمية"), t("Rotation", "دوران")],
    quiz: [
      { question: t("Quelle commande avance de 50 pas ?", "أي تعليمة تتقدم 50 خطوة؟"), choices: [t("AV 50", "AV 50"), t("TD 50", "TD 50"), t("RE 90", "RE 90")], answer: 0 },
      { question: t("TD 90 réalise…", "تنفذ TD 90…"), choices: [t("un demi-tour", "نصف دورة"), t("un quart de tour à droite", "ربع دورة يمينا"), t("50 pas", "50 خطوة")], answer: 1 },
    ],
  },
  {
    id: 12,
    unit: 4,
    title: t("Dessiner des figures", "رسم الأشكال"),
    subtitle: t("Angles, couleurs et remplissage", "الزوايا والألوان والتعبئة"),
    mission: t("Créer une enseigne géométrique colorée pour le laboratoire.", "إنشاء لافتة هندسية ملونة للمختبر."),
    situation: t("L’enseigne doit contenir carré, triangle et cercle sans lignes inutiles.", "يجب أن تتضمن اللافتة مربعا ومثلثا ودائرة دون خطوط زائدة."),
    brief: t(
      "Le laboratoire veut une enseigne colorée avec un carré, un triangle et un cercle, sans un trait de trop. À toi de la tracer avec la tortue.",
      "المختبر خاصو لافتة هندسية ملونة فيها مربع ومثلث ودائرة، بلا خطوط زايدة. بالسلحفاة والأوامر الصحيحة، غادي ترسمها نتا."
    ),
    objectives: [
      t("Associer figure et angle de rotation.", "ربط الشكل بزاوية الدوران."),
      t("Lever et poser le crayon au bon moment.", "رفع القلم ووضعه في الوقت المناسب."),
      t("Choisir couleur et remplissage.", "اختيار اللون والتعبئة."),
    ],
    workshops: [
      { label: "A", duration: 30, text: t("Programmer séparément un carré, un triangle et un cercle.", "برمجة مربع ومثلث ودائرة كل على حدة.") },
      { label: "B", duration: 30, text: t("Assembler les figures, ajouter deux couleurs puis remplir une zone.", "تركيب الأشكال وإضافة لونين ثم تعبئة مساحة.") },
    ],
    deliverable: t("Composition géométrique nommée et programme sauvegardé.", "تركيب هندسي معنْون مع حفظ البرنامج."),
    trace: [
      t("La somme des rotations d’un tour complet vaut 360°.", "مجموع دورانات دورة كاملة يساوي 360°."),
      t("Lever le crayon permet de se déplacer sans tracer.", "يسمح رفع القلم بالحركة دون رسم."),
    ],
    vocabulary: [t("Angle", "زاوية"), t("Remplissage", "تعبئة"), t("Crayon", "قلم")],
    quiz: [
      { question: t("Pour un carré, l’angle de rotation est…", "زاوية الدوران في المربع هي…"), choices: [t("60°", "60°"), t("90°", "90°"), t("120°", "120°")], answer: 1 },
      { question: t("Pour bouger sans tracer, on…", "للتحرك دون رسم نقوم بـ…"), choices: [t("lève le crayon", "رفع القلم"), t("ferme Logo", "إغلاق Logo"), t("tourne toujours", "الدوران دائما")], answer: 0 },
    ],
  },
  {
    id: 13,
    unit: 4,
    title: t("Répéter intelligemment", "التكرار بذكاء"),
    subtitle: t("Boucles et motifs", "الحلقات والزخارف"),
    mission: t("Réduire un long programme de mosaïque à quelques lignes.", "اختصار برنامج طويل للفسيفساء إلى بضعة أسطر."),
    situation: t("Le premier programme répète huit fois les mêmes commandes. Il fonctionne, mais il est difficile à corriger.", "يكرر البرنامج الأول نفس التعليمات ثماني مرات؛ يعمل لكنه صعب التصحيح."),
    brief: t(
      "Le programme de la mosaïque fonctionne, mais il répète huit fois les mêmes commandes. Aujourd’hui, tu vas le réduire à quelques lignes grâce à la répétition.",
      "برنامج الفسيفساء خدام، ولكن فيه نفس الأوامر مكررة 8 مرات وطويل بزاف. اليوم غادي تختصرو في أسطر قليلة بأمر التكرار."
    ),
    objectives: [
      t("Repérer une séquence répétitive.", "اكتشاف تسلسل متكرر."),
      t("Utiliser la commande REPETE.", "استعمال التعليمة REPETE."),
      t("Calculer l’angle d’un motif régulier.", "حساب زاوية زخرفة منتظمة."),
    ],
    workshops: [
      { label: "A", duration: 25, text: t("Transformer trois programmes longs en boucles courtes.", "تحويل ثلاثة برامج طويلة إلى حلقات قصيرة.") },
      { label: "B", duration: 35, text: t("Créer une rosace à 8 branches en déterminant son angle.", "إنشاء وردة هندسية من ثمانية فروع بحساب زاويتها.") },
    ],
    deliverable: t("Rosace réussie + comparaison avant/après du code.", "وردة ناجحة + مقارنة الشيفرة قبل وبعد."),
    trace: [
      t("Une boucle répète un bloc d’instructions un nombre défini de fois.", "تكرر الحلقة كتلة تعليمات عددا محددا من المرات."),
      t("Pour n motifs réguliers, la rotation vaut souvent 360 ÷ n.", "بالنسبة إلى n زخارف منتظمة تكون زاوية الدوران غالبا 360 ÷ n."),
    ],
    vocabulary: [t("Boucle", "حلقة"), t("Répétition", "تكرار"), t("Motif", "زخرفة")],
    quiz: [
      { question: t("REPETE 4 [AV 50 TD 90] trace…", "ترسم REPETE 4 [AV 50 TD 90]…"), choices: [t("un carré", "مربعا"), t("un triangle", "مثلثا"), t("une ligne", "خطا")], answer: 0 },
      { question: t("Pour 8 branches régulières, la rotation est…", "زاوية دوران 8 فروع منتظمة هي…"), choices: [t("30°", "30°"), t("45°", "45°"), t("90°", "90°")], answer: 1 },
    ],
  },
  {
    id: 14,
    unit: 4,
    title: t("Créer des procédures", "إنشاء الإجراءات"),
    subtitle: t("Décomposer et réutiliser", "التفكيك وإعادة الاستعمال"),
    mission: t("Programmer un zellige en construisant une bibliothèque de motifs.", "برمجة زليج عبر بناء مكتبة زخارف."),
    situation: t("Plusieurs parties du dessin utilisent le même losange. Le recopier partout rend le programme illisible.", "تستعمل أجزاء كثيرة من الرسم نفس المعين ونسخه في كل مكان يجعل البرنامج غير واضح."),
    brief: t(
      "Le zellige répète le même losange partout et le programme devient illisible. La solution : construire ta bibliothèque de motifs et les réutiliser.",
      "رسم الزليج فيه نفس المعين كيتعاود في بلايص كثيرة، والبرنامج ولا ما كيتقراش. الحل: تبني مكتبة ديال الزخارف وتستعملها وقت ما تحتاجها."
    ),
    objectives: [
      t("Définir et appeler une procédure.", "تعريف إجراء واستدعاؤه."),
      t("Décomposer un dessin complexe.", "تفكيك رسم معقد."),
      t("Donner des noms explicites aux blocs.", "اختيار أسماء واضحة للكتل."),
    ],
    workshops: [
      { label: "A", duration: 30, text: t("Créer les procédures CARRE, LOSANGE et ETOILE puis les tester.", "إنشاء الإجراءات CARRE وLOSANGE وETOILE ثم اختبارها.") },
      { label: "B", duration: 30, text: t("Assembler les procédures pour composer un zellige équilibré.", "تركيب الإجراءات لإنجاز زليج متوازن.") },
    ],
    deliverable: t("Programme structuré en 3 procédures + dessin final.", "برنامج منظم في ثلاثة إجراءات + الرسم النهائي."),
    trace: [
      t("Une procédure donne un nom à un bloc réutilisable.", "يعطي الإجراء اسما لكتلة قابلة لإعادة الاستعمال."),
      t("Décomposer rend le programme plus lisible, testable et facile à corriger.", "يجعل التفكيك البرنامج أوضح وأسهل للاختبار والتصحيح."),
    ],
    vocabulary: [t("Procédure", "إجراء"), t("Appel", "استدعاء"), t("Décomposition", "تفكيك")],
    quiz: [
      { question: t("Une procédure sert surtout à…", "يستعمل الإجراء أساسا لـ…"), choices: [t("réutiliser un bloc", "إعادة استعمال كتلة"), t("éteindre l’écran", "إطفاء الشاشة"), t("effacer le clavier", "مسح لوحة المفاتيح")], answer: 0 },
      { question: t("Un bon nom de procédure est…", "اسم الإجراء الجيد هو…"), choices: [t("X1", "X1"), t("FORME", "FORME"), t("DESSINE_ETOILE", "DESSINE_ETOILE")], answer: 2 },
    ],
  },
  {
    id: 15,
    unit: 4,
    title: t("Projet final : ville intelligente", "المشروع النهائي: مدينة ذكية"),
    subtitle: t("Concevoir, programmer et présenter", "التصميم والبرمجة والعرض"),
    mission: t("Créer une scène animée qui mobilise tout le parcours Logo.NET.", "إنشاء مشهد متحرك يوظف كل مكتسبات Logo.NET."),
    situation: t("Chaque binôme propose un quartier durable avec bâtiments, arbres, signalisation et un élément animé.", "تقترح كل ثنائية حيا مستداما بمبان وأشجار وعلامات وعنصر متحرك."),
    brief: t(
      "C’est le projet final : imagine avec ton binôme un quartier durable complet — bâtiments, arbres, signalisation et un élément animé — avec tout ce que tu as appris en Logo.",
      "المشروع الأخير وصل! غادي تصمم مع زميلك حي مستدام كامل: بنايات، أشجار، علامات، وحاجة كتحرك — بكلشي تعلمتيه في Logo."
    ),
    objectives: [
      t("Planifier un projet par étapes.", "تخطيط مشروع على مراحل."),
      t("Combiner instructions, boucles et procédures.", "دمج التعليمات والحلقات والإجراءات."),
      t("Tester, améliorer et présenter une production.", "اختبار الإنتاج وتحسينه وعرضه."),
    ],
    workshops: [
      { label: "A", duration: 15, text: t("Dessiner le plan, répartir les rôles et écrire le pseudo-code.", "رسم التصميم وتوزيع الأدوار وكتابة الشيفرة الوصفية.") },
      { label: "B", duration: 45, text: t("Programmer la scène, tester avec une grille qualité puis finaliser.", "برمجة المشهد واختباره بشبكة جودة ثم إنهاؤه.") },
    ],
    deliverable: t("Programme final + scène + présentation de 3 minutes.", "البرنامج النهائي + المشهد + عرض لمدة ثلاث دقائق."),
    trace: [
      t("Un projet réussi alterne planification, réalisation, test et amélioration.", "يتناوب المشروع الناجح بين التخطيط والإنجاز والاختبار والتحسين."),
      t("Une erreur fournit une information utile pour corriger l’algorithme.", "يوفر الخطأ معلومة مفيدة لتصحيح الخوارزمية."),
    ],
    vocabulary: [t("Pseudo-code", "شيفرة وصفية"), t("Débogage", "تنقيح"), t("Critère", "معيار")],
    quiz: [
      { question: t("Après l’écriture du programme, l’étape indispensable est…", "بعد كتابة البرنامج الخطوة الضرورية هي…"), choices: [t("le test", "الاختبار"), t("l’impression immédiate", "الطباعة فورا"), t("la suppression", "الحذف")], answer: 0 },
      { question: t("Pour un projet en binôme, il vaut mieux…", "في مشروع ثنائي من الأفضل…"), choices: [t("laisser une personne tout faire", "ترك شخص واحد يقوم بكل شيء"), t("répartir puis permuter les rôles", "توزيع الأدوار ثم تبديلها"), t("ne rien planifier", "عدم التخطيط")], answer: 1 },
    ],
  },
];

export const phases = [
  { key: "launch", minutes: 5, label: t("Défi de départ", "تحدي البداية"), note: t("Observer & essayer", "ملاحظة ومحاولة") },
  { key: "discover", minutes: 10, label: t("Démonstration utile", "عرض عملي قصير"), note: t("Un geste, puis à vous", "حركة ثم دوركم") },
  { key: "practice", minutes: 85, label: t("Pratique en binôme", "تطبيق ثنائي"), note: t("Photo-défi + ateliers", "تحدي الصورة + الورشات") },
  { key: "close", minutes: 20, label: t("Structurer l’essentiel", "تنظيم الخلاصة"), note: t("Trace écrite & défi final", "خلاصة مكتوبة وتحد نهائي") },
] as const;

export const getUnit = (id: number) => units.find((unit) => unit.id === id)!;
