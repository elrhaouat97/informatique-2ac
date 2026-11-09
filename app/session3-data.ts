import type { CourseSession, LocalizedText } from "./course-data.ts";

const t = (fr: string, ar: string): LocalizedText => ({ fr, ar });

export const session3Trace = {
  title: t("Système d’exploitation", "نظام التشغيل"),
  definition: t(
    "Le système d’exploitation (OS) est le logiciel de base qui permet d’utiliser l’appareil. Il fait le lien entre l’utilisateur et le matériel.",
    "نظام التشغيل هو البرنامج الأساسي الذي يتيح استعمال الجهاز، ويربط بين المستخدم والمعدات."
  ),
  functions: [
    t("Cliquer et interagir avec l’écran.", "النقر والتفاعل مع الشاشة."),
    t("Ouvrir et utiliser des applications.", "فتح التطبيقات واستعمالها."),
    t("Créer et enregistrer des fichiers.", "إنشاء الملفات وحفظها."),
    t("Utiliser les périphériques.", "استعمال الملحقات."),
  ],
  examples: ["Windows", "Linux", "macOS", "Android", "iOS", "HarmonyOS"],
  architecture: [
    t("Utilisateur", "المستخدم"),
    t("Applications", "التطبيقات"),
    t("Système d’exploitation", "نظام التشغيل"),
    t("Matériel informatique", "المعدات المعلوماتية"),
  ],
};

export const session3Schedule = [
  { time: "0–5", minutes: 5, title: t("Je m’installe et je découvre le défi", "أستعد وأتعرف على التحدي") },
  { time: "5–15", minutes: 10, title: t("Rappel 1 · Information et traitement", "تذكير 1 · المعلومة والمعالجة") },
  { time: "15–30", minutes: 15, title: t("Rappel 2 · Matériel et capacités", "تذكير 2 · المعدات والسعات") },
  { time: "30–40", minutes: 10, title: t("Pourquoi un système d’exploitation ?", "لماذا نحتاج إلى نظام تشغيل؟") },
  { time: "40–50", minutes: 10, title: t("Je passe d’Android à Windows", "أنتقل من Android إلى Windows") },
  { time: "50–65", minutes: 15, title: t("Je manipule le Bureau et les fenêtres", "أستعمل سطح المكتب والنوافذ") },
  { time: "65–105", minutes: 40, title: t("Je relève le défi des fichiers", "أنجز تحدي الملفات") },
  { time: "105–110", minutes: 5, title: t("Je retiens l’essentiel", "أدوّن الخلاصة") },
  { time: "110–120", minutes: 10, title: t("Je vérifie mes acquis", "أتحقق من مكتسباتي") },
];

export const session3: CourseSession = {
  id: 3,
  unit: 1,
  title: t("Rappel 1 & 2 · Je prends en main Windows", "تذكير بالحصتين 1 و2 · أستعمل Windows"),
  subtitle: t("2 h : rappel actif, d’Android à Windows, Bureau et organisation des fichiers", "ساعتان: تذكير نشيط، من Android إلى Windows، سطح المكتب وتنظيم الملفات"),
  mission: t("Réactiver tes acquis, comprendre le rôle du système d’exploitation puis organiser ton espace de travail.", "أستحضر مكتسباتي وأفهم دور نظام التشغيل ثم أنظم فضاء عملي."),
  situation: t(
    "Au club, Sara reçoit une unité centrale reliée à un écran, un clavier et une souris. Le poste s’allume, mais aucun Bureau ni application n’est accessible. Sur son téléphone, Sara peut ouvrir des applications et retrouver ses photos. Quel logiciel de base rend ces fonctions possibles ? Sur un poste Windows utilisable, aide ensuite Sara à organiser ses fichiers.",
    "تتوصل سارة في النادي بوحدة مركزية موصولة بشاشة ولوحة مفاتيح وفأرة. يشتغل الجهاز، لكن لا يمكن الوصول إلى سطح المكتب أو التطبيقات. في هاتفها تستطيع سارة فتح التطبيقات والعثور على صورها. ما البرنامج الأساسي الذي يتيح هذه الوظائف؟ ساعدها بعد ذلك على تنظيم ملفاتها في حاسوب يعمل بنظام Windows."
  ),
  objectives: [
    t("Réactiver les formes d’information, les types de traitement, le matériel et les capacités.", "أستحضر أشكال المعلومات وأنواع المعالجة والمعدات ووحدات السعة."),
    t("Expliquer le rôle d’un système d’exploitation et distinguer Android, Windows et les applications.", "أشرح دور نظام التشغيل وأميز Android وWindows عن التطبيقات."),
    t("Ouvrir une application, déplacer une fenêtre, la réduire et la retrouver.", "أفتح تطبيقا وأحرك نافذته وأصغرها ثم أظهرها مجددا."),
    t("Créer des dossiers ; déplacer, renommer, copier et rechercher un fichier ; utiliser la Corbeille.", "أنشئ مجلدات وأنقل ملفا وأسميه وأنسخه وأبحث عنه وأستعمل سلة المحذوفات."),
  ],
  workshops: [
    { label: "1", duration: 25, text: t("Rappel actif : 6 exercices sur les séances 1 et 2.", "تذكير نشيط: 6 تمارين حول الحصتين 1 و2.") },
    { label: "2", duration: 20, text: t("Résoudre la situation de Sara, puis comparer Android et Windows.", "أحل وضعية سارة ثم أقارن Android وWindows.") },
    { label: "3", duration: 15, text: t("Manipuler le Bureau et les fenêtres dans une simulation, puis sur le poste Windows.", "أستعمل سطح المكتب والنوافذ في المحاكاة ثم على حاسوب Windows.") },
    { label: "4", duration: 40, text: t("Relier texte, image, son et vidéo à leurs fichiers ; copier, déplacer, renommer et restaurer avant de préparer le dossier de l’exposition.", "أربط النص والصورة والصوت والفيديو بملفاتها، وأنسخ وأنقل وأسمي وأستعيد الملفات قبل إعداد مجلد المعرض.") },
  ],
  deliverable: t("25 activités puis un bilan individuel sur 20. Défi final : créer Expo_club avec Photos et Textes, déplacer la photo et copier l’invitation en gardant l’original. Chacun manipule à son tour.", "25 نشاطا ثم تقويم فردي على 20. التحدي الأخير: إنشاء Expo_club مع Photos وTextes، ونقل الصورة ونسخ الدعوة مع إبقاء الأصل. يستعمل كل تلميذ الحاسوب بالتناوب."),
  trace: [
    session3Trace.definition,
    ...session3Trace.functions,
    t(`Exemples : ${session3Trace.examples.join(", ")}.`, `أمثلة: ${session3Trace.examples.join("، ")}.`),
    t(session3Trace.architecture.map((item) => item.fr).join(" → "), session3Trace.architecture.map((item) => item.ar).join(" ← ")),
  ],
  vocabulary: [],
  // The lesson uses Session3Assessment: three situations with file-system evidence.
  quiz: [],
};
