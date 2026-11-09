// Jeux interactifs LAB·2AC — exercise packs for the games hub (/jeux).
// One short prompt per question, images and diagrams first, minimal text.
// FR is primary, AR is the support line (same convention as the course).

export type LT = { fr: string; ar: string };

export type ChoiceQ = {
  kind: "choice";
  img?: string;
  diagram?: "excel";
  prompt: LT;
  options: { text?: LT; img?: string }[];
  answer: number;
  explain: LT;
};
export type FlashQ = { kind: "flash"; img?: string; front: LT; back: LT };
export type OrderQ = { kind: "order"; img?: string; diagram?: "excel"; prompt: LT; items: LT[]; explain: LT };
export type MatchQ = {
  kind: "match";
  prompt: LT;
  pairs: { leftImg?: string; leftText?: LT; right: LT }[];
  explain: LT;
};
export type TrueFalseQ = { kind: "tf"; img?: string; diagram?: "excel"; prompt: LT; answer: boolean; explain: LT };

export type GameQuestion = ChoiceQ | FlashQ | OrderQ | MatchQ | TrueFalseQ;

export type GamePack = {
  id: string;
  unit: 1 | 2 | 3 | 4;
  title: LT;
  subtitle: LT;
  questions: GameQuestion[];
};

const t = (fr: string, ar: string): LT => ({ fr, ar });

export const gamePacks: GamePack[] = [
  {
    id: "materiel",
    unit: 1,
    title: t("Les composants", "مكوّنات الحاسوب"),
    subtitle: t("Le matériel de l'ordinateur", "عتاد الحاسوب"),
    questions: [
      {
        kind: "choice",
        img: "/session2/poste-informatique.webp",
        prompt: t("Comment s'appelle cet ensemble complet ?", "ما اسم هذه المجموعة الكاملة؟"),
        options: [
          { text: t("Un poste informatique", "محطة حاسوب") },
          { text: t("Un logiciel", "برنامج") },
          { text: t("Un câble", "كابل") },
        ],
        answer: 0,
        explain: t("Écran + unité centrale + clavier + souris = un poste informatique.", "الشاشة + الوحدة المركزية + لوحة المفاتيح + الفأرة = محطة حاسوب."),
      },
      {
        kind: "choice",
        img: "/session2/composants-internes.webp",
        prompt: t("Où se trouvent le processeur et la mémoire RAM ?", "أين يوجد المعالج والذاكرة RAM؟"),
        options: [
          { text: t("Dans l'écran", "في الشاشة") },
          { text: t("Dans l'unité centrale", "في الوحدة المركزية") },
          { text: t("Dans le clavier", "في لوحة المفاتيح") },
        ],
        answer: 1,
        explain: t("Le processeur et la RAM sont à l'intérieur de l'unité centrale.", "المعالج والذاكرة RAM موجودان داخل الوحدة المركزية."),
      },
      {
        kind: "choice",
        prompt: t("Lequel est un périphérique de SORTIE ?", "أيّها جهاز إخراج؟"),
        options: [
          { img: "/session4/images/imprimante.webp" },
          { img: "/session3/ressources/clavier.jpg" },
          { img: "/session4/images/carte-wifi.jpg" },
        ],
        answer: 0,
        explain: t("L'imprimante fait SORTIR le document sur papier. Le clavier fait ENTRER le texte.", "الطابعة تُخرج الوثيقة على الورق. لوحة المفاتيح تُدخل النص."),
      },
      {
        kind: "flash",
        img: "/session2/items/carte-son.png",
        front: t("La carte son", "بطاقة الصوت"),
        back: t("Elle traite le son : écouter de la musique et enregistrer sa voix.", "تعالج الصوت: الاستماع إلى الموسيقى وتسجيل الصوت."),
      },
      {
        kind: "match",
        prompt: t("Relie chaque image à son nom.", "اربط كل صورة باسمها."),
        pairs: [
          { leftImg: "/session4/images/routeur.webp", right: t("Le routeur", "الموجّه") },
          { leftImg: "/session4/images/imprimante.webp", right: t("L'imprimante", "الطابعة") },
          { leftImg: "/session3/ressources/clavier.jpg", right: t("Le clavier", "لوحة المفاتيح") },
          { leftImg: "/session4/images/cable-rj45.webp", right: t("Le câble réseau", "كابل الشبكة") },
        ],
        explain: t("Bien joué : tu reconnais le matériel d'un poste et d'un réseau.", "أحسنت: تعرّفت على عتاد المحطة والشبكة."),
      },
      {
        kind: "tf",
        img: "/session2/unite-centrale-lenovo.jpg",
        prompt: t("L'unité centrale contient le processeur.", "الوحدة المركزية تحتوي على المعالج."),
        answer: true,
        explain: t("Vrai : le processeur est le « cerveau » dans l'unité centrale.", "صحيح: المعالج هو «دماغ» الحاسوب داخل الوحدة المركزية."),
      },
      {
        kind: "order",
        prompt: t("Remets la chaîne du traitement dans l'ordre.", "رتّب سلسلة المعالجة في الترتيب الصحيح."),
        items: [
          t("Saisir les données", "إدخال البيانات"),
          t("Traiter les données", "معالجة البيانات"),
          t("Afficher le résultat", "عرض النتيجة"),
        ],
        explain: t("Toujours : Entrée → Traitement → Sortie.", "دائمًا: إدخال ← معالجة ← إخراج."),
      },
      {
        kind: "choice",
        img: "/session2/unites-de-capacite.png",
        prompt: t("Quelle est la PLUS GRANDE capacité ?", "ما هي أكبر سعة؟"),
        options: [
          { text: t("1 Mo", "1 Mo") },
          { text: t("1 Go", "1 Go") },
          { text: t("1 To", "1 To") },
        ],
        answer: 2,
        explain: t("1 To = 1 000 Go = 1 000 000 Mo. C'est la plus grande.", "1 To = ‏1000 Go = ‏1 000 000 Mo. هي الأكبر."),
      },
    ],
  },
  {
    id: "systeme",
    unit: 1,
    title: t("Le système d'exploitation", "نظام التشغيل"),
    subtitle: t("Windows, les fichiers et les dossiers", "ويندوز والملفات والمجلدات"),
    questions: [
      {
        kind: "choice",
        img: "/session3/visuels/ecran-windows.svg",
        prompt: t("Quel est le rôle du système d'exploitation ?", "ما هو دور نظام التشغيل؟"),
        options: [
          { text: t("Faire fonctionner l'ordinateur et les applications", "تشغيل الحاسوب والتطبيقات") },
          { text: t("Imprimer les documents", "طباعة الوثائق") },
          { text: t("Créer Internet", "إنشاء الإنترنت") },
        ],
        answer: 0,
        explain: t("Sans système d'exploitation, aucune application ne peut démarrer.", "بدون نظام تشغيل لا يمكن لأي تطبيق أن يشتغل."),
      },
      {
        kind: "choice",
        prompt: t("Quel logo est celui de Windows ?", "أي شعار هو شعار ويندوز؟"),
        options: [
          { img: "/session3/visuels/logo-android.svg" },
          { img: "/session3/visuels/logo-windows.svg" },
          { img: "/session3/visuels/corbeille.svg" },
        ],
        answer: 1,
        explain: t("Le premier est Android, le troisième est la corbeille.", "الأول أندرويد، والثالث سلّة المهملات."),
      },
      {
        kind: "tf",
        img: "/session3/visuels/logo-android.svg",
        prompt: t("Android est un système d'exploitation pour téléphone.", "أندرويد نظام تشغيل للهواتف."),
        answer: true,
        explain: t("Vrai : Android fait fonctionner les téléphones et les tablettes.", "صحيح: أندرويد يشغّل الهواتف واللوحات."),
      },
      {
        kind: "order",
        img: "/session3/visuels/copie-coller.svg",
        prompt: t("Remets les étapes pour COPIER un fichier dans l'ordre.", "رتّب خطوات نسخ ملف بالترتيب."),
        items: [
          t("Sélectionner le fichier", "تحديد الملف"),
          t("Copier", "نسخ"),
          t("Ouvrir le dossier de destination", "فتح مجلد الوجهة"),
          t("Coller", "لصق"),
        ],
        explain: t("Sélectionner → Copier → Ouvrir → Coller.", "تحديد ← نسخ ← فتح ← لصق."),
      },
      {
        kind: "match",
        prompt: t("Relie chaque image à son action.", "اربط كل صورة بعملها."),
        pairs: [
          { leftImg: "/session3/visuels/corbeille.svg", right: t("Supprimer un fichier", "حذف ملف") },
          { leftImg: "/session3/visuels/arborescence.svg", right: t("Organiser en dossiers", "التنظيم في مجلدات") },
          { leftImg: "/session3/visuels/stockage-fichiers.svg", right: t("Enregistrer les fichiers", "حفظ الملفات") },
          { leftImg: "/session3/visuels/copie-coller.svg", right: t("Dupliquer un fichier", "مضاعفة ملف") },
        ],
        explain: t("Chaque icône raconte son action.", "كل أيقونة تحكي عملها."),
      },
      {
        kind: "flash",
        img: "/session3/visuels/ecran-sans-systeme.svg",
        front: t("Sans système d'exploitation…", "بدون نظام تشغيل…"),
        back: t("L'écran reste noir : l'ordinateur ne peut pas démarrer.", "تبقى الشاشة سوداء: لا يمكن للحاسوب أن يشتغل."),
      },
      {
        kind: "choice",
        img: "/session3/visuels/nom-extension.svg",
        prompt: t("Dans « devoir.docx », que signifie « .docx » ?", "في «devoir.docx»، ماذا تعني «.docx»؟"),
        options: [
          { text: t("C'est une image", "إنها صورة") },
          { text: t("C'est un document texte", "إنها وثيقة نصية") },
          { text: t("C'est une vidéo", "إنه فيديو") },
        ],
        answer: 1,
        explain: t(".docx = document texte · .jpg = image · .mp4 = vidéo.", ".docx = وثيقة نصية · .jpg = صورة · .mp4 = فيديو."),
      },
      {
        kind: "tf",
        img: "/session3/visuels/information-video.svg",
        prompt: t("Une vidéo est une information.", "الفيديو معلومة."),
        answer: true,
        explain: t("Vrai : texte, image, son et vidéo sont des informations.", "صحيح: النص والصورة والصوت والفيديو كلها معلومات."),
      },
    ],
  },
  {
    id: "reseau",
    unit: 2,
    title: t("Le réseau", "الشبكة"),
    subtitle: t("Relier les ordinateurs entre eux", "ربط الحواسيب فيما بينها"),
    questions: [
      {
        kind: "choice",
        img: "/session4/reseau-salle.png",
        prompt: t("Comment s'appelle un réseau dans une seule salle ?", "ما اسم شبكة داخل قاعة واحدة؟"),
        options: [
          { text: t("Un réseau local (LAN)", "شبكة محلية LAN") },
          { text: t("Internet", "الإنترنت") },
          { text: t("Un câble", "كابل") },
        ],
        answer: 0,
        explain: t("Un réseau local relie les appareils d'un même lieu.", "الشبكة المحلية تربط أجهزة نفس المكان."),
      },
      {
        kind: "choice",
        prompt: t("Quel appareil relie le réseau à Internet ?", "أي جهاز يربط الشبكة بالإنترنت؟"),
        options: [
          { img: "/session4/images/imprimante.webp" },
          { img: "/session4/images/routeur.webp" },
          { img: "/session4/images/smart-tv.webp" },
        ],
        answer: 1,
        explain: t("C'est le routeur : la porte vers Internet.", "إنه الموجّه: الباب نحو الإنترنت."),
      },
      {
        kind: "match",
        prompt: t("Relie chaque appareil à son rôle.", "اربط كل جهاز بدوره."),
        pairs: [
          { leftImg: "/session4/images/routeur.webp", right: t("Relier à Internet", "الربط بالإنترنت") },
          { leftImg: "/session4/images/commutateur.webp", right: t("Relier les ordinateurs entre eux", "ربط الحواسيب بينها") },
          { leftImg: "/session4/images/cable-rj45.webp", right: t("Transporter les données", "نقل البيانات") },
          { leftImg: "/session4/images/point-acces.webp", right: t("Donner le Wi-Fi", "توفير الويفاي") },
        ],
        explain: t("Routeur, commutateur, câble, point d'accès : chacun son rôle.", "الموجّه والمبدّل والكابل ونقطة الوصول: لكلٍّ دوره."),
      },
      {
        kind: "flash",
        img: "/session4/images/carte-wifi.jpg",
        front: t("La carte Wi-Fi", "بطاقة الويفاي"),
        back: t("Elle connecte l'ordinateur au réseau SANS fil.", "تربط الحاسوب بالشبكة بدون أسلاك."),
      },
      {
        kind: "tf",
        img: "/session4/images/commutateur.webp",
        prompt: t("Le commutateur relie plusieurs ordinateurs d'un réseau local.", "المبدّل يربط عدة حواسيب في شبكة محلية."),
        answer: true,
        explain: t("Vrai : c'est le centre du réseau local.", "صحيح: هو مركز الشبكة المحلية."),
      },
      {
        kind: "order",
        prompt: t("Remets le voyage d'un message dans l'ordre.", "رتّب رحلة رسالة بالترتيب."),
        items: [
          t("Écrire le message", "كتابة الرسالة"),
          t("L'ordinateur l'envoie au commutateur", "الحاسوب يرسلها إلى المبدّل"),
          t("Le routeur l'envoie sur Internet", "الموجّه يرسلها إلى الإنترنت"),
          t("Le destinataire le reçoit", "المستقبِل يتوصّل بها"),
        ],
        explain: t("Ordinateur → commutateur → routeur → Internet → destinataire.", "حاسوب ← مبدّل ← موجّه ← إنترنت ← مستقبِل."),
      },
      {
        kind: "choice",
        img: "/session4/images/salle-reseau-club.webp",
        prompt: t("Dans un réseau local, les ordinateurs peuvent partager…", "في شبكة محلية، يمكن للحواسيب أن تتقاسم…"),
        options: [
          { text: t("Un repas", "وجبة") },
          { text: t("Une imprimante", "طابعة") },
          { text: t("Un cahier", "دفتر") },
        ],
        answer: 1,
        explain: t("Une seule imprimante peut servir tous les ordinateurs du réseau.", "طابعة واحدة تخدم كل حواسيب الشبكة."),
      },
      {
        kind: "choice",
        prompt: t("Lequel transporte les données AVEC des fils ?", "أيّها ينقل البيانات بالأسلاك؟"),
        options: [
          { img: "/session4/images/point-acces.webp" },
          { img: "/session4/images/carte-wifi.jpg" },
          { img: "/session4/images/cable-rj45.webp" },
        ],
        answer: 2,
        explain: t("Le câble RJ45 transporte les données par fil.", "كابل RJ45 ينقل البيانات بالأسلاك."),
      },
    ],
  },
  {
    id: "excel",
    unit: 3,
    title: t("Excel", "إكسيل"),
    subtitle: t("Cellules, lignes et colonnes", "الخلايا والأسطر والأعمدة"),
    questions: [
      {
        kind: "choice",
        diagram: "excel",
        prompt: t("Comment s'appelle la case coloriée B2 ?", "ما اسم الخلية الملوّنة B2؟"),
        options: [
          { text: t("Une cellule", "خلية") },
          { text: t("Une ligne", "سطر") },
          { text: t("Une colonne", "عمود") },
        ],
        answer: 0,
        explain: t("Une cellule = une colonne + une ligne. Ici : colonne B, ligne 2.", "الخلية = عمود + سطر. هنا: العمود B والسطر 2."),
      },
      {
        kind: "tf",
        diagram: "excel",
        prompt: t("Une colonne se lit de haut en bas.", "العمود يُقرأ من الأعلى إلى الأسفل."),
        answer: true,
        explain: t("Vrai : les colonnes sont verticales, les lignes horizontales.", "صحيح: الأعمدة عمودية والأسطر أفقية."),
      },
      {
        kind: "choice",
        diagram: "excel",
        prompt: t("Les colonnes sont nommées par…", "الأعمدة تُسمّى بـ…"),
        options: [
          { text: t("Des couleurs", "الألوان") },
          { text: t("Des lettres : A, B, C…", "حروف: A، B، C…") },
          { text: t("Des symboles", "رموز") },
        ],
        answer: 1,
        explain: t("Colonnes = lettres · Lignes = nombres.", "الأعمدة = حروف · الأسطر = أرقام."),
      },
      {
        kind: "choice",
        prompt: t("Pour calculer dans Excel, la formule commence par…", "للحساب في إكسيل، تبدأ الصيغة بـ…"),
        options: [
          { text: t("+", "+") },
          { text: t("#", "#") },
          { text: t("=", "=") },
        ],
        answer: 2,
        explain: t("Toujours « = » au début : =2+3, =SOMME(A1:A4)…", "دائمًا «=» في البداية."),
      },
      {
        kind: "order",
        diagram: "excel",
        prompt: t("Remets les étapes pour calculer une SOMME dans l'ordre.", "رتّب خطوات حساب مجموع بالترتيب."),
        items: [
          t("Cliquer sur la cellule du résultat", "النقر على خلية النتيجة"),
          t("Taper =SOMME(", "كتابة =SOMME("),
          t("Sélectionner les nombres", "تحديد الأرقام"),
          t("Appuyer sur Entrée", "الضغط على Entrée"),
        ],
        explain: t("Cellule → =SOMME( → sélection → Entrée.", "خلية ← =SOMME( ← تحديد ← Entrée."),
      },
      {
        kind: "flash",
        front: t("Une ligne", "السطر"),
        back: t("Elle va de gauche à droite et porte un numéro : 1, 2, 3…", "يمتد من اليسار إلى اليمين ويحمل رقمًا: 1، 2، 3…"),
      },
      {
        kind: "choice",
        diagram: "excel",
        prompt: t("Quelle est l'adresse de la case coloriée ?", "ما هو عنوان الخلية الملوّنة؟"),
        options: [
          { text: t("2B", "2B") },
          { text: t("B2", "B2") },
          { text: t("C3", "C3") },
        ],
        answer: 1,
        explain: t("D'abord la lettre de la colonne, puis le numéro de la ligne : B2.", "أولًا حرف العمود ثم رقم السطر: B2."),
      },
    ],
  },
];
