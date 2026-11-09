import type { Lang, LocalizedText } from "./course-data.ts";
import { session3Lab } from "./session3-lab-data.ts";

const t = (fr: string, ar: string): LocalizedText => ({ fr, ar });

export type ExerciseLevel = "start" | "train" | "challenge";

type ExerciseImage = {
  src: string;
  alt: LocalizedText;
  caption: LocalizedText;
};

type ExerciseBase = {
  id: string;
  revision?: number;
  level: ExerciseLevel;
  minutes?: number;
  title: LocalizedText;
  prompt: LocalizedText;
  tasks?: LocalizedText[];
  instructionImage?: ExerciseImage;
  hint?: LocalizedText;
  feedback: LocalizedText;
  image?: ExerciseImage;
  stage?: "recall" | "discover" | "practice";
};

export type ChoiceExercise = ExerciseBase & {
  type: "choice";
  choices: LocalizedText[];
  choiceImages?: (string | null)[];
  answer: number;
};

export type MultiExercise = ExerciseBase & {
  type: "multi";
  choices: LocalizedText[];
  choiceImages?: (string | null)[];
  answers: number[];
};

export type DiagnosticExercise = ExerciseBase & {
  type: "diagnostic";
  scenario: LocalizedText;
  components: { label: LocalizedText; image?: string }[];
  componentAnswer: number;
  repairs: LocalizedText[];
  repairAnswer: number;
};

export type MatchExercise = ExerciseBase & {
  type: "match";
  interaction?: "select" | "drag";
  categories: LocalizedText[];
  categoryImages?: (string | null)[];
  rows: { label: LocalizedText; answer: number; image?: string; content?: LocalizedText; audio?: string; video?: string }[];
};

export type SequenceExercise = ExerciseBase & {
  type: "sequence";
  steps: LocalizedText[];
  stepImages?: string[];
  shuffled: number[];
};

export type TextExercise = ExerciseBase & {
  type: "text";
  accepted: Record<Lang, string[]>;
  placeholder: LocalizedText;
};

export type ConversionExercise = ExerciseBase & {
  type: "conversions";
  rows: { before: string; after: string; accepted: string[] }[];
};

export type GestureExercise = ExerciseBase & {
  type: "gesture";
  mode: "precision" | "double" | "typing";
};

export type SystemLabExercise = ExerciseBase & {
  type: "system-lab";
  mode: "windows" | "files" | "guided-files" | "windows11-desktop" | "windows11-copy" | "windows11-move" | "windows11-restore" | "windows11-rename" | "windows11-project";
};

export type HotspotExercise = ExerciseBase & {
  type: "hotspot";
  image: ExerciseImage;
  regions: { x: number; y: number; width: number; height: number }[];
  answer: number;
};

export type Unit1Exercise =
  | ChoiceExercise
  | MultiExercise
  | MatchExercise
  | SequenceExercise
  | TextExercise
  | ConversionExercise
  | DiagnosticExercise
  | SystemLabExercise
  | HotspotExercise
  | GestureExercise;

export type Unit1Lab = {
  title: LocalizedText;
  subtitle: LocalizedText;
  exercises: Unit1Exercise[];
};

export const levelLabels: Record<ExerciseLevel, LocalizedText> = {
  start: t("Niveau 1 · Je découvre", "المستوى 1 · أكتشف"),
  train: t("Niveau 2 · Je m’entraîne", "المستوى 2 · أتدرب"),
  challenge: t("Niveau 3 · Je résous", "المستوى 3 · أحل"),
};

const treatmentImage: ExerciseImage = {
  src: "traitements-manuel-semi-automatique-automatique.png",
  alt: t(
    "Comparaison des traitements manuel, semi-automatique et automatique",
    "مقارنة بين المعالجة اليدوية وشبه الآلية والآلية"
  ),
  caption: t("Support du cours · trois types de traitement", "دعامة الدرس · ثلاثة أنواع من المعالجة"),
};

const enterKeysImage: ExerciseImage = {
  src: "keyboard-enter-keys.png",
  alt: t(
    "Les deux touches Entrée d’un clavier entourées en rouge et en vert",
    "زرا الإدخال Enter في لوحة المفاتيح محددان بدائرتين حمراء وخضراء"
  ),
  caption: t("Repère les deux touches Entrée du clavier", "لاحظ زري Enter في لوحة المفاتيح"),
};


const session2Image = (file: string, fr: string, ar: string): ExerciseImage => ({
  src: `session2/${file}`,
  alt: t(fr, ar),
  caption: t("Support visuel de l’exercice", "دعامة بصرية للتمرين"),
});

const workstationImage = session2Image("poste-informatique-numerote.png", "Souris, clavier, écran et unité centrale numérotés de 1 à 4", "فأرة ولوحة مفاتيح وشاشة ووحدة مركزية مرقمة من 1 إلى 4");

export const unit1Labs: Record<1 | 2 | 3, Unit1Lab> = {
  1: {
    title: t("Laboratoire 1 · Information et traitement", "المختبر 1 · المعلومات والمعالجة"),
    subtitle: t(
      "14 exercices : premiers gestes, définitions, formes d’information et types de traitement.",
      "14 تمرينا: الحركات الأولى والتعاريف وأشكال المعلومات وأنواع المعالجة."
    ),
    exercises: [
      {
        id: "s1-geste-clic",
        type: "gesture",
        mode: "precision",
        level: "start",
        title: t("Précision de la souris", "دقة استعمال الفأرة"),
        prompt: t("Clique les cinq cibles dans l’ordre, de 1 à 5.", "انقر الأهداف الخمسة بالترتيب من 1 إلى 5."),
        hint: t("Pose l’index sur le bouton gauche et garde la main détendue.", "ضع السبابة على الزر الأيسر وأبق يدك مرتاحة."),
        feedback: t("Tu sais maintenant viser et cliquer avec précision.", "أصبحت قادرا على التوجيه والنقر بدقة."),
      },
      {
        id: "s1-geste-double",
        type: "gesture",
        mode: "double",
        level: "start",
        title: t("Ouvrir par double-clic", "الفتح بالنقر المزدوج"),
        prompt: t("Double-clique sur le dossier jaune pour l’ouvrir.", "انقر نقرا مزدوجا على المجلد الأصفر لفتحه."),
        hint: t("Deux clics rapides, sans déplacer la souris.", "نقرتان سريعتان دون تحريك الفأرة."),
        feedback: t("Le double-clic ouvre généralement un dossier ou un fichier.", "يفتح النقر المزدوج عادة مجلدا أو ملفا."),
      },
      {
        id: "s1-geste-saisie",
        type: "gesture",
        mode: "typing",
        level: "start",
        title: t("Écrire et valider", "الكتابة والتأكيد"),
        prompt: t("Écris ton prénom puis appuie sur Entrée.", "اكتب اسمك ثم اضغط Enter."),
        image: enterKeysImage,
        hint: t("Clique d’abord dans la zone blanche.", "انقر أولا داخل الخانة البيضاء."),
        feedback: t("Tu as utilisé le clavier et la touche Entrée.", "استعملت لوحة المفاتيح وزر Enter."),
      },
      {
        id: "s1-definition-mot",
        type: "choice",
        level: "start",
        title: t("Construire le mot", "تركيب الكلمة"),
        prompt: t("Le mot « informatique » vient de quels deux mots ?", "من أي كلمتين اشتقت كلمة «المعلوميات»؟"),
        choices: [
          t("Information + automatique", "معلومة + آلي"),
          t("Internet + mathématique", "إنترنت + رياضيات"),
          t("Image + technique", "صورة + تقنية"),
        ],
        answer: 0,
        feedback: t("Informatique = information + automatique.", "المعلوميات ترتبط بالمعلومة والمعالجة الآلية."),
      },
      {
        id: "s1-definition-informatique",
        type: "choice",
        level: "start",
        title: t("Choisir la bonne définition", "اختيار التعريف الصحيح"),
        prompt: t("Qu’est-ce que l’informatique ?", "ما المعلوميات؟"),
        choices: [
          t("La science du traitement automatique des informations", "علم المعالجة الآلية للمعلومات"),
          t("L’étude des câbles électriques uniquement", "دراسة الأسلاك الكهربائية فقط"),
          t("Une application de dessin", "تطبيق للرسم"),
        ],
        answer: 0,
        feedback: t("L’informatique automatise le traitement d’informations.", "تهتم المعلوميات بالمعالجة الآلية للمعلومات."),
      },
      {
        id: "s1-formes-associer",
        type: "match",
        level: "train",
        title: t("Associer les formes", "ربط أشكال المعلومات"),
        prompt: t("Classe chaque exemple dans sa forme d’information.", "صنف كل مثال حسب شكل المعلومة."),
        categories: [t("Texte", "نص"), t("Image", "صورة"), t("Son", "صوت"), t("Vidéo", "فيديو")],
        rows: [
          { label: t("Le règlement affiché de la salle", "قانون القاعة المكتوب"), answer: 0 },
          { label: t("La photo de la classe", "صورة القسم"), answer: 1 },
          { label: t("La sonnerie du collège", "جرس المؤسسة"), answer: 2 },
          { label: t("Un tutoriel filmé", "شرح مصور بالفيديو"), answer: 3 },
        ],
        feedback: t("Une même information peut être communiquée par plusieurs formes.", "يمكن تقديم المعلومة نفسها بأشكال متعددة."),
      },
      {
        id: "s1-formes-selection",
        type: "multi",
        level: "train",
        title: t("Sélection multiple", "اختيار متعدد"),
        prompt: t("Sélectionne uniquement les quatre formes d’information étudiées.", "حدد فقط أشكال المعلومات الأربعة المدروسة."),
        choices: [
          t("Texte", "نص"),
          t("Image", "صورة"),
          t("Son", "صوت"),
          t("Vidéo", "فيديو"),
          t("Clavier", "لوحة مفاتيح"),
          t("Câble", "سلك"),
        ],
        answers: [0, 1, 2, 3],
        feedback: t("Le clavier et le câble sont du matériel, pas des formes d’information.", "لوحة المفاتيح والسلك معدات وليسا شكلين للمعلومة."),
      },
      {
        id: "s1-traitement-ordre",
        type: "sequence",
        level: "train",
        title: t("De la photo sombre à la photo claire", "من صورة مظلمة إلى صورة واضحة"),
        prompt: t("Lina veut améliorer une photo trop sombre. Remets les trois moments du traitement dans l’ordre logique.", "تريد لينا تحسين صورة مظلمة جدا. رتب مراحل المعالجة الثلاث ترتيبا منطقيا."),
        steps: [
          t("État initial : une photo trop sombre", "الحالة الابتدائية: صورة مظلمة جدا"),
          t("Opération : augmenter la luminosité", "العملية: زيادة سطوع الصورة"),
          t("État final : une photo claire et lisible", "الحالة النهائية: صورة واضحة ومقروءة"),
        ],
        shuffled: [1, 2, 0],
        feedback: t("Le traitement transforme ici une photo sombre en une photo claire grâce à une opération précise.", "تحول المعالجة هنا صورة مظلمة إلى صورة واضحة بفضل عملية محددة."),
      },
      {
        id: "s1-traitement-definition",
        type: "choice",
        level: "train",
        title: t("Définir le traitement", "تعريف المعالجة"),
        prompt: t("Quelle phrase définit correctement un traitement ?", "ما الجملة التي تعرف المعالجة بشكل صحيح؟"),
        choices: [
          t("Une suite d’opérations pour obtenir un état final", "سلسلة عمليات للوصول إلى حالة نهائية"),
          t("Un seul clic sans résultat", "نقرة واحدة دون نتيجة"),
          t("Le nom donné à un écran", "اسم يطلق على الشاشة"),
        ],
        answer: 0,
        feedback: t("Le traitement transforme des données grâce à une suite d’opérations.", "تحول المعالجة المعطيات بواسطة سلسلة من العمليات."),
      },
      {
        id: "s1-types-image",
        type: "choice",
        level: "train",
        title: t("Lire l’image du cours", "قراءة صورة الدرس"),
        prompt: t("Une personne écrit une lettre entièrement à la main. Quel type de traitement est-ce ?", "يكتب شخص رسالة كاملة بيده. ما نوع هذه المعالجة؟"),
        choices: [t("Manuel", "يدوي"), t("Semi-automatique", "شبه آلي"), t("Automatique", "آلي")],
        answer: 0,
        feedback: t("Le traitement est manuel quand l’humain réalise seul toutes les opérations.", "تكون المعالجة يدوية عندما ينجز الإنسان كل العمليات وحده."),
      },
      {
        id: "s1-types-associer",
        type: "match",
        level: "challenge",
        title: t("Classer six situations", "تصنيف ست وضعيات"),
        prompt: t("Observe la photo, puis indique qui réalise le traitement : l’humain seul, l’humain avec une machine, ou la machine seule.", "لاحظ الصورة، ثم حدد من ينجز المعالجة: الإنسان وحده، الإنسان بمساعدة آلة، أم الآلة وحدها."),
        hint: t("Manuel = humain seul · Semi-automatique = humain + machine · Automatique = machine seule", "يدوي = الإنسان وحده · شبه آلي = الإنسان + الآلة · آلي = الآلة وحدها"),
        categories: [t("Manuel", "يدوي"), t("Semi-automatique", "شبه آلي"), t("Automatique", "آلي")],
        rows: [
          { label: t("Une personne classe des dossiers papier à la main", "شخص يرتب الملفات الورقية بيده"), answer: 0, image: "treatment-situations/classement-manuel.jpg" },
          { label: t("Le caissier scanne un produit avec un lecteur", "يمسح أمين الصندوق منتجا باستعمال القارئ"), answer: 1, image: "treatment-situations/caisse-scanner.jpg" },
          { label: t("L’enseignante saisit les notes dans un logiciel", "تُدخل الأستاذة النقط في برنامج"), answer: 1, image: "treatment-situations/saisie-notes.jpg" },
          { label: t("Le distributeur délivre seul un billet de 100 DH", "يُخرج الموزع الآلي ورقة من فئة 100 درهم بمفرده"), answer: 2, image: "treatment-situations/distributeur-billet.jpg" },
          { label: t("L’ordinateur lance seul une sauvegarde chaque nuit", "يشغّل الحاسوب النسخ الاحتياطي تلقائيا كل ليلة"), answer: 2, image: "treatment-situations/sauvegarde-nuit.jpg" },
          { label: t("Un élève effectue une addition sur papier", "ينجز تلميذ عملية جمع على الورق"), answer: 0, image: "treatment-situations/calcul-papier.jpg" },
        ],
        feedback: t("Observe surtout qui réalise les opérations : l’humain, les deux, ou la machine seule.", "لاحظ خصوصا من ينجز العمليات: الإنسان أو الاثنان أو الآلة وحدها."),
      },
      {
        id: "s1-automatique-caracteristiques",
        type: "multi",
        level: "challenge",
        title: t("Caractéristiques d’un traitement automatique", "خصائص المعالجة الآلية"),
        prompt: t("Choisis exactement les 3 affirmations qui décrivent un traitement automatique.", "اختر بالضبط 3 عبارات تصف المعالجة الآلية."),
        choices: [
          t("La machine exécute entièrement le traitement", "تنجز الآلة المعالجة كاملة"),
          t("Il est généralement très rapide", "تكون عادة سريعة جدا"),
          t("Il peut être précis si les règles sont correctes", "قد تكون دقيقة إذا كانت القواعد صحيحة"),
          t("L’humain doit exécuter chaque étape", "يجب على الإنسان إنجاز كل خطوة"),
        ],
        answers: [0, 1, 2],
        feedback: t("Automatique signifie que la machine réalise le traitement selon des règles préparées.", "تعني المعالجة الآلية أن الآلة تنجز العمل وفق قواعد معدة."),
      },
      {
        id: "s1-situation-notes",
        type: "sequence",
        level: "challenge",
        title: t("Situation-problème : élection du délégué", "وضعية مشكلة: انتخاب ممثل القسم"),
        prompt: t("La classe a terminé le vote. Remets les étapes du dépouillement dans l’ordre pour connaître l’élève élu.", "أنهى القسم عملية التصويت. رتب مراحل فرز الأصوات لمعرفة التلميذ المنتخب."),
        steps: [
          t("État initial : les bulletins de vote", "الحالة الابتدائية: أوراق التصويت"),
          t("Traitement : compter les voix de chaque candidat", "المعالجة: حساب أصوات كل مترشح"),
          t("État final : afficher le nom de l’élève élu", "الحالة النهائية: عرض اسم التلميذ المنتخب"),
        ],
        shuffled: [2, 0, 1],
        feedback: t("Les bulletins sont les données, le comptage est le traitement et le nom de l’élu est le résultat.", "أوراق التصويت هي المعطيات، وعد الأصوات هو المعالجة، واسم المنتخب هو النتيجة."),
      },
      {
        id: "s1-exemple-automatique",
        type: "text",
        level: "challenge",
        title: t("Produire un exemple", "إنتاج مثال"),
        prompt: t("Écris un exemple de traitement automatique vu dans le cours.", "اكتب مثالا لمعالجة آلية وردت في الدرس."),
        placeholder: t("Ex. : distributeur de billets", "مثال: موزع آلي للنقود"),
        accepted: {
          fr: ["distributeur", "distributeur de billets", "robot", "robot industriel", "sauvegarde", "sauvegarde automatique"],
          ar: ["موزع", "موزع آلي", "روبوت", "روبوت صناعي", "نسخ احتياطي", "حفظ تلقائي"],
        },
        feedback: t("Oui : la machine réalise seule les opérations prévues.", "صحيح: تنجز الآلة وحدها العمليات المبرمجة."),
        image: treatmentImage,
      },
    ],
  },
  2: {
    title: t("Atelier pratique · Le matériel informatique", "ورشة تطبيقية · معدات الحاسوب"),
    subtitle: t(
      "12 activités progressives · 60 minutes pour observer, classer, convertir, assembler et dépanner.",
      "12 نشاطا متدرجا · 60 دقيقة للملاحظة والتصنيف والتحويل والتركيب والإصلاح."
    ),
    exercises: [
      {
        id: "s2-composition-qcu",
        type: "choice",
        level: "start",
        minutes: 3,
        title: t("QCU · De quoi se compose un ordinateur ?", "اختيار واحد · ممّ يتكوّن الحاسوب؟"),
        prompt: t("Observe le poste. Choisis la proposition qui décrit correctement un ordinateur.", "لاحظ الحاسوب. اختر العبارة التي تصفه بشكل صحيح."),
        choices: [
          t("Une unité centrale et des périphériques", "وحدة مركزية وملحقات"),
          t("Un écran et une imprimante seulement", "شاشة وطابعة فقط"),
          t("Des périphériques sans unité centrale", "ملحقات دون وحدة مركزية"),
          t("Une unité centrale sans périphériques", "وحدة مركزية دون ملحقات"),
        ],
        answer: 0,
        image: workstationImage,
        feedback: t("Un ordinateur est une machine de traitement automatique composée d’une unité centrale et de périphériques.", "الحاسوب آلة للمعالجة الآلية تتكوّن من وحدة مركزية وملحقات."),
      },
      {
        id: "s2-poste-reperes",
        type: "match",
        level: "start",
        minutes: 4,
        title: t("Image · Je reconnais le poste", "صورة · أتعرف على الحاسوب"),
        prompt: t("Observe les quatre images complètes, puis associe chacune au bon nom.", "لاحظ الصور الأربع كاملة، ثم اربط كل صورة بالاسم الصحيح."),
        categories: [t("Souris", "الفأرة"), t("Clavier", "لوحة المفاتيح"), t("Écran", "الشاشة"), t("Unité centrale", "الوحدة المركزية")],
        rows: [
          { label: t("Photo 1", "الصورة 1"), answer: 0, image: "session2/items/ex02-card-04.jpg" },
          { label: t("Photo 2", "الصورة 2"), answer: 1, image: "session2/items/ex02-card-05.jpg" },
          { label: t("Photo 3", "الصورة 3"), answer: 2, image: "session2/items/ex02-card-16.png" },
          { label: t("Photo 4", "الصورة 4"), answer: 3, image: "session2/items/unite-centrale-lenovo.jpg" },
        ],
        feedback: t("La souris, le clavier et l’écran sont des périphériques reliés à l’unité centrale.", "الفأرة ولوحة المفاتيح والشاشة ملحقات مرتبطة بالوحدة المركزية."),
      },
      {
        id: "s2-classer-peripheriques",
        type: "match",
        interaction: "drag",
        level: "start",
        minutes: 7,
        title: t("Glisser-déposer · Je classe les périphériques", "سحب وإفلات · أصنّف الملحقات"),
        prompt: t("Glisse chaque matériel dans sa famille. Sur tablette, touche une carte puis sa zone.", "اسحب كل جهاز إلى فئته. على اللوح، المس البطاقة ثم المنطقة."),
        categories: [
          t("Entrée", "إدخال"),
          t("Sortie", "إخراج"),
          t("Entrée / sortie", "إدخال وإخراج"),
          t("Stockage", "تخزين"),
        ],
        rows: [
          { label: t("Clavier", "لوحة المفاتيح"), answer: 0, image: "session2/items/ex02-card-05.jpg" },
          { label: t("Microphone", "الميكروفون"), answer: 0, image: "session2/items/ex02-card-13.jpg" },
          { label: t("Écran", "الشاشة"), answer: 1, image: "session2/items/ex02-card-16.png" },
          { label: t("Imprimante", "الطابعة"), answer: 1, image: "session2/items/ex02-card-09.jpg" },
          { label: t("Écran tactile", "الشاشة اللمسية"), answer: 2, image: "session2/items/ex02-card-11.jpg" },
          { label: t("Routeur", "الموجّه"), answer: 2, image: "session2/items/ex02-card-08.jpg" },
          { label: t("Clé USB", "مفتاح USB"), answer: 3, image: "session2/items/ex02-card-07.jpg" },
          { label: t("Disque dur", "القرص الصلب"), answer: 3, image: "session2/items/ex02-card-12.jpg" },
        ],
        hint: t("Demande-toi si l’information entre, sort, circule dans les deux sens ou reste enregistrée.", "اسأل: هل تدخل المعلومة أم تخرج أم تمر في الاتجاهين أم تُحفظ؟"),
        feedback: t("Le classement dépend du sens de circulation de l’information et de la fonction de stockage.", "يعتمد التصنيف على اتجاه انتقال المعلومة ووظيفة التخزين."),
      },
      {
        id: "s2-qcm-visioconference",
        type: "multi",
        level: "train",
        minutes: 4,
        title: t("QCM · Préparer une visioconférence", "اختيار متعدد · إعداد لقاء مرئي"),
        prompt: t("Choisis les quatre périphériques indispensables pour voir, parler, écouter et se connecter.", "اختر الملحقات الأربعة الضرورية للرؤية والتحدث والاستماع والاتصال."),
        choices: [
          t("Webcam", "كاميرا الويب"),
          t("Microphone", "الميكروفون"),
          t("Haut-parleurs ou casque", "مكبرات الصوت أو سماعة الرأس"),
          t("Routeur", "الموجّه"),
          t("Imprimante", "الطابعة"),
          t("Scanner", "الماسح الضوئي"),
        ],
        answers: [0, 1, 2, 3],
        feedback: t("La webcam et le microphone font entrer l’image et le son ; le casque les restitue ; le routeur assure la communication.", "تُدخل كاميرا الويب والميكروفون الصورة والصوت، وتُخرجهما السماعة، ويؤمّن الموجّه الاتصال."),
      },
      {
        id: "s2-peripheriques-roles",
        type: "match",
        level: "train",
        minutes: 5,
        title: t("Classement · Une tâche, un périphérique", "تصنيف · لكل مهمة ملحق"),
        prompt: t("Pour chaque action, choisis le périphérique qui convient.", "اختر لكل عملية الملحق المناسب."),
        categories: [t("Clavier", "لوحة المفاتيح"), t("Souris", "الفأرة"), t("Scanner", "الماسح الضوئي"), t("Imprimante", "الطابعة"), t("Microphone", "الميكروفون"), t("Haut-parleurs", "مكبرات الصوت")],
        rows: [
          { label: t("Écrire un titre", "كتابة عنوان"), answer: 0 },
          { label: t("Sélectionner une icône", "تحديد أيقونة"), answer: 1 },
          { label: t("Numériser une feuille", "رقمنة ورقة"), answer: 2 },
          { label: t("Obtenir une copie papier", "الحصول على نسخة ورقية"), answer: 3 },
          { label: t("Enregistrer la voix", "تسجيل الصوت"), answer: 4 },
          { label: t("Diffuser un son", "بث صوت"), answer: 5 },
        ],
        feedback: t("On choisit un périphérique à partir de la tâche à accomplir.", "نختار الملحق انطلاقا من المهمة المطلوب إنجازها."),
      },
      {
        id: "s2-composants-roles",
        type: "match",
        interaction: "drag",
        level: "train",
        minutes: 7,
        title: t("Glisser-déposer · À l’intérieur de l’unité centrale", "سحب وإفلات · داخل الوحدة المركزية"),
        prompt: t("Glisse chaque composant vers sa fonction principale.", "اسحب كل مكوّن نحو وظيفته الأساسية."),
        categories: [
          t("Connecter les composants", "ربط المكوّنات"),
          t("Exécuter les instructions", "تنفيذ التعليمات"),
          t("Mémoriser temporairement", "الحفظ المؤقت"),
          t("Stocker durablement", "التخزين الدائم"),
          t("Traiter les images", "معالجة الصور"),
          t("Fournir l’énergie", "توفير الطاقة"),
        ],
        rows: [
          { label: t("Carte mère", "اللوحة الأم"), answer: 0, image: "session2/items/ex12-card-02.jpg" },
          { label: t("Processeur (CPU)", "المعالج (CPU)"), answer: 1, image: "session2/items/ex12-card-01.png" },
          { label: t("Mémoire RAM", "ذاكرة RAM"), answer: 2, image: "session2/items/ex12-card-03.jpg" },
          { label: t("Disque SSD", "قرص SSD"), answer: 3, image: "session2/items/ex12-card-05.jpg" },
          { label: t("Carte graphique", "بطاقة الرسوم"), answer: 4, image: "session2/items/ex12-card-06.jpg" },
          { label: t("Alimentation", "مزود الطاقة"), answer: 5, image: "session2/items/ex12-card-07.jpg" },
        ],
        feedback: t("La carte mère relie ; le processeur exécute ; la RAM mémorise temporairement ; le SSD conserve ; la carte graphique traite les images ; l’alimentation fournit l’énergie.", "تربط اللوحة الأم، وينفذ المعالج، وتحفظ RAM مؤقتا، ويخزن SSD، وتعالج بطاقة الرسوم الصور، ويوفر مزود الطاقة الكهرباء."),
      },
      {
        id: "s2-diagnostic-memoire",
        type: "choice",
        level: "challenge",
        minutes: 4,
        title: t("QCU · Je diagnostique une panne", "اختيار واحد · أشخّص مشكلة"),
        prompt: t("Plusieurs logiciels sont ouverts : l’ordinateur devient lent, mais le SSD a encore beaucoup d’espace. Quel composant manque probablement de capacité ?", "عند فتح برامج كثيرة يصبح الحاسوب بطيئا، مع وجود مساحة كافية في SSD. أي مكوّن يحتاج غالبا إلى سعة أكبر؟"),
        choices: [
          t("La mémoire RAM", "ذاكرة RAM"),
          t("La carte son", "بطاقة الصوت"),
          t("L’alimentation", "مزود الطاقة"),
          t("L’imprimante", "الطابعة"),
        ],
        answer: 0,
        image: session2Image("items/ex12-card-03.jpg", "Barrettes de mémoire RAM", "شرائح ذاكرة RAM"),
        feedback: t("La RAM conserve temporairement les données des programmes ouverts. Une RAM insuffisante ralentit le travail multitâche.", "تحفظ RAM مؤقتا معطيات البرامج المفتوحة. نقص سعتها يبطئ العمل المتعدد."),
      },
      {
        id: "s2-unites-ordre",
        type: "sequence",
        level: "challenge",
        minutes: 4,
        title: t("Mise en ordre · L’échelle des capacités", "ترتيب · سلم وحدات السعة"),
        prompt: t("Place les unités de la plus petite à la plus grande.", "رتب الوحدات من الأصغر إلى الأكبر."),
        steps: [t("bit", "bit"), t("octet", "octet"), t("Ko", "Ko"), t("Mo", "Mo"), t("Go", "Go"), t("To", "To")],
        shuffled: [4, 1, 5, 2, 0, 3],
        feedback: t("bit < octet < Ko < Mo < Go < To.", "bit < octet < Ko < Mo < Go < To."),
      },
      {
        id: "s2-conversions-capacites",
        type: "conversions",
        level: "challenge",
        minutes: 7,
        title: t("Calcul · Je convertis les capacités", "حساب · أحوّل السعات"),
        prompt: t("Ouvre d’abord la Calculatrice de Windows (Démarrer → Calculatrice), puis complète les six conversions. Pour les trois dernières, cherche l’opération de division adaptée.", "افتح أولا حاسبة Windows (ابدأ ← الحاسبة)، ثم أكمل التحويلات الستة. في التحويلات الثلاثة الأخيرة ابحث عن عملية القسمة المناسبة."),
        image: session2Image("unites-de-capacite.png", "Échelle verticale de conversion entre bit, octet, Ko, Mo, Go et To", "سلم عمودي للتحويل بين bit وoctet وKo وMo وGo وTo"),
        rows: [
          { before: "5 Mo =", after: "Ko", accepted: ["5000", "5 000"] },
          { before: "3 Go =", after: "Mo", accepted: ["3000", "3 000"] },
          { before: "125 octets =", after: "bits", accepted: ["1000", "1 000"] },
          { before: "8 000 Ko =", after: "Mo", accepted: ["8"] },
          { before: "24 000 bits =", after: "octets", accepted: ["3000", "3 000"] },
          { before: "2 000 000 Mo =", after: "To", accepted: ["2"] },
        ],
        hint: t("Vers une unité plus petite : multiplier. Vers une unité plus grande : diviser. Entre bit et octet : ×8 ou ÷8.", "نحو وحدة أصغر: نضرب. نحو وحدة أكبر: نقسم. بين bit وoctet نستعمل 8."),
        feedback: t("Tu sais maintenant passer d’une unité de capacité à une autre.", "أصبحت تعرف التحويل من وحدة سعة إلى أخرى."),
      },
      {
        id: "s2-defi-poste-complet",
        type: "multi",
        level: "challenge",
        minutes: 5,
        title: t("Sélection multiple · Je compose le poste du club", "اختيار متعدد · أُركّب حاسوب النادي"),
        prompt: t("La salle du club est vide. Pour rédiger des documents, participer à une visioconférence et stocker 80 Go de projets, choisis exactement les 6 éléments indispensables.", "قاعة النادي فارغة. لكتابة الوثائق والمشاركة في لقاء مرئي وتخزين 80 Go من المشاريع، اختر بالضبط العناصر الستة الضرورية."),
        choices: [
          t("Unité centrale · RAM 8 Go · SSD 256 Go", "وحدة مركزية · RAM بسعة 8 Go · SSD بسعة 256 Go"),
          t("Unité centrale · RAM 4 Go · SSD 64 Go", "وحدة مركزية · RAM بسعة 4 Go · SSD بسعة 64 Go"),
          t("Écran", "الشاشة"),
          t("Clavier", "لوحة المفاتيح"),
          t("Souris", "الفأرة"),
          t("Webcam", "كاميرا الويب"),
          t("Casque-micro", "سماعة بميكروفون"),
          t("Imprimante", "الطابعة"),
          t("Scanner", "الماسح الضوئي"),
          t("Manette de jeu", "ذراع اللعب"),
        ],
        choiceImages: [
          "session2/items/unite-centrale-lenovo.jpg",
          "session2/items/unite-centrale-lenovo.jpg",
          "session2/items/ex02-card-16.png",
          "session2/items/ex02-card-05.jpg",
          "session2/items/ex02-card-04.jpg",
          "session2/items/ex02-card-02.png",
          "session2/items/ex02-card-14.jpg",
          "session2/items/ex02-card-09.jpg",
          "session2/items/ex02-card-06.jpg",
          "session2/items/ex02-card-03.jpg",
        ],
        answers: [0, 2, 3, 4, 5, 6],
        hint: t("Associe un matériel à chaque besoin : traiter et stocker, afficher, saisir, pointer, transmettre ton image et communiquer par le son.", "اربط كل حاجة بالجهاز المناسب: المعالجة والتخزين، العرض، الكتابة، التأشير، إرسال صورتك والتواصل بالصوت."),
        feedback: t("Il faut l’unité centrale avec SSD 256 Go, l’écran, le clavier, la souris, la webcam et le casque-micro. L’imprimante, le scanner et la manette ne sont pas nécessaires ici.", "نحتاج إلى الوحدة المركزية ذات SSD بسعة 256 Go، والشاشة، ولوحة المفاتيح، والفأرة، وكاميرا الويب، والسماعة بميكروفون. أما الطابعة والماسح الضوئي وذراع اللعب فليست ضرورية هنا."),
      },
      {
        id: "s2-assembler-pc",
        type: "multi",
        level: "challenge",
        minutes: 5,
        title: t("Assembler le PC · Les composants essentiels", "تركيب الحاسوب · المكونات الأساسية"),
        prompt: t("Le boîtier est vide. Choisis exactement les 5 composants à installer à l’intérieur pour relier, calculer, mémoriser, stocker et alimenter le PC.", "الصندوق فارغ. اختر بالضبط 5 مكونات تُركب داخله للربط والحساب والحفظ والتخزين وتزويد الحاسوب بالطاقة."),
        choices: [
          t("Carte mère", "اللوحة الأم"),
          t("Processeur (CPU)", "المعالج (CPU)"),
          t("Mémoire RAM", "ذاكرة RAM"),
          t("Disque SSD", "قرص SSD"),
          t("Alimentation", "مزود الطاقة"),
          t("Clavier", "لوحة المفاتيح"),
          t("Imprimante", "الطابعة"),
          t("Souris", "الفأرة"),
        ],
        choiceImages: [
          "session2/items/ex12-card-02.jpg",
          "session2/items/ex12-card-01.png",
          "session2/items/ex12-card-03.jpg",
          "session2/items/ex12-card-05.jpg",
          "session2/items/ex12-card-07.jpg",
          "session2/items/ex02-card-05.jpg",
          "session2/items/ex02-card-09.jpg",
          "session2/items/ex02-card-04.jpg",
        ],
        answers: [0, 1, 2, 3, 4],
        hint: t("Les périphériques restent à l’extérieur du boîtier.", "تبقى الملحقات خارج صندوق الحاسوب."),
        feedback: t("La carte mère relie, le processeur calcule, la RAM mémorise temporairement, le SSD stocke et l’alimentation fournit l’énergie.", "تربط اللوحة الأم ويحسب المعالج وتحفظ RAM مؤقتا ويخزن SSD ويوفر مزود الطاقة الكهرباء."),
      },
      {
        id: "s2-depanner-pc",
        type: "diagnostic",
        level: "challenge",
        minutes: 5,
        title: t("Dépanner le PC · Diagnostic en 2 étapes", "إصلاح الحاسوب · تشخيص في مرحلتين"),
        prompt: t("Lis la panne. Choisis d’abord le composant responsable, puis la réparation adaptée.", "اقرأ العطل. اختر أولا المكوّن المسؤول ثم الإصلاح المناسب."),
        scenario: t("Le PC met plusieurs minutes à démarrer et son ancien disque est presque plein.", "يستغرق الحاسوب عدة دقائق للإقلاع وقرصه القديم شبه ممتلئ."),
        components: [
          { label: t("Disque de stockage", "قرص التخزين"), image: "session2/items/ex12-card-05.jpg" },
          { label: t("Mémoire RAM", "ذاكرة RAM"), image: "session2/items/ex12-card-03.jpg" },
          { label: t("Carte graphique", "بطاقة الرسوم"), image: "session2/items/ex12-card-06.jpg" },
          { label: t("Alimentation", "مزود الطاقة"), image: "session2/items/ex12-card-07.jpg" },
        ],
        componentAnswer: 0,
        repairs: [
          t("Installer un SSD de 512 Go et transférer le système", "تركيب SSD بسعة 512 Go ونقل النظام إليه"),
          t("Changer le clavier", "تغيير لوحة المفاتيح"),
          t("Ajouter des haut-parleurs", "إضافة مكبرات الصوت"),
          t("Installer une alimentation de 650 W", "تركيب مزود طاقة بقدرة 650 W"),
        ],
        repairAnswer: 0,
        hint: t("Relie chaque symptôme à la fonction du composant : ici, vitesse de démarrage et espace disponible.", "اربط كل عَرَض بوظيفة المكوّن: هنا سرعة الإقلاع والمساحة المتاحة."),
        feedback: t("Un SSD rapide et assez grand accélère le démarrage et offre l’espace nécessaire aux fichiers.", "يسرّع SSD السريع والكافي الإقلاع ويوفر المساحة اللازمة للملفات."),
      },
    ],
  },
  3: session3Lab,
};
