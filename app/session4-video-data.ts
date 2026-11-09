import type { LocalizedText } from "./course-data.ts";

const t = (fr: string, ar: string): LocalizedText => ({ fr, ar });
export const session4U2Url = "https://tabdellah.github.io/u2/";

type VideoQuestion = {
  id: string;
  second: number;
  prompt: LocalizedText;
  choices: { id: string; label: LocalizedText }[];
  answer: string;
  explanation: LocalizedText;
};

export type Session4Video = {
  file: string;
  source: 1 | 2;
  duration: string;
  minutes: number;
  title: LocalizedText;
  prompt: LocalizedText;
  objective: string;
  questions: VideoQuestion[];
};

export const session4Videos = {
  adresse: {
    file: "Video_Get_IP.mp4",
    source: 1,
    duration: "0:31",
    minutes: 2,
    title: t("Retrouver l’IPv4 du poste filmé", "العثور على عنوان IPv4 للحاسوب المصوَّر"),
    prompt: t("Regarde la fenêtre noire. Repère la commande saisie, puis lis la ligne « Adresse IPv4 ».", "شاهد النافذة السوداء. حدّد الأمر المكتوب ثم اقرأ سطر «عنوان IPv4»."),
    objective: "Identifier un poste et tester la communication",
    questions: [
      {
        id: "commande",
        second: 21,
        prompt: t("Quelle commande est tapée dans la fenêtre noire ?", "ما الأمر المكتوب في النافذة السوداء؟"),
        choices: [
          { id: "hostname", label: t("hostname", "hostname") },
          { id: "ipconfig", label: t("ipconfig", "ipconfig") },
          { id: "ping", label: t("ping", "ping") },
        ],
        answer: "ipconfig",
        explanation: t("ipconfig affiche la configuration réseau du poste, dont son adresse IPv4.", "يعرض ipconfig إعدادات شبكة الحاسوب، ومنها عنوان IPv4."),
      },
      {
        id: "ipv4",
        second: 26,
        prompt: t("Quelle valeur est affichée sur la ligne « Adresse IPv4 » ?", "ما القيمة المعروضة في سطر «عنوان IPv4»؟"),
        choices: [
          { id: "mask", label: t("255.255.240.0", "255.255.240.0") },
          { id: "gateway", label: t("172.30.144.1", "172.30.144.1") },
          { id: "address", label: t("172.30.147.153", "172.30.147.153") },
        ],
        answer: "address",
        explanation: t("172.30.147.153 est l’adresse du poste filmé. Les deux autres valeurs sont le masque et la passerelle.", "172.30.147.153 هو عنوان الحاسوب المصوَّر. القيمتان الأخريان هما القناع والبوابة."),
      },
    ],
  },
  partage: {
    file: "Video_partage.mp4",
    source: 1,
    duration: "1:00",
    minutes: 3,
    title: t("Partager un dossier et choisir le droit", "مشاركة مجلد واختيار الصلاحية"),
    prompt: t("Observe les propriétés du dossier « partage », puis le droit attribué au groupe Everyone dans la vidéo.", "لاحظ خصائص المجلد «partage» ثم الصلاحية الممنوحة لمجموعة Everyone في الفيديو."),
    objective: "Partager un dossier et choisir les droits",
    questions: [
      {
        id: "onglet",
        second: 23,
        prompt: t("Quel onglet des propriétés permet de régler le partage du dossier ?", "أي تبويب في الخصائص يتيح ضبط مشاركة المجلد؟"),
        choices: [
          { id: "sharing", label: t("Partage", "المشاركة") },
          { id: "general", label: t("Général", "عام") },
          { id: "custom", label: t("Personnaliser", "تخصيص") },
        ],
        answer: "sharing",
        explanation: t("L’onglet Partage permet de choisir avec qui le dossier est partagé.", "يتيح تبويب المشاركة اختيار من يمكنه الوصول إلى المجلد."),
      },
      {
        id: "autorisation-video",
        second: 36,
        prompt: t("Dans la vidéo, quel droit est affiché pour le groupe Everyone ?", "ما الصلاحية المعروضة لمجموعة Everyone في الفيديو؟"),
        choices: [
          { id: "read", label: t("Lecture", "القراءة") },
          { id: "owner", label: t("Propriétaire", "المالك") },
          { id: "write", label: t("Lecture/écriture", "القراءة والكتابة") },
        ],
        answer: "write",
        explanation: t("La vidéo montre Lecture/écriture. Avec ce droit, l’utilisateur peut aussi déposer des fichiers dans le dossier.", "يعرض الفيديو صلاحية القراءة والكتابة. ويمكن للمستخدم بهذه الصلاحية وضع ملفات في المجلد."),
      },
      {
        id: "droit-necessaire",
        second: 36,
        prompt: t("Ton voisin doit seulement ouvrir ou copier l’image. Quel droit suffit ?", "يحتاج زميلك فقط إلى فتح الصورة أو نسخها. ما الصلاحية الكافية؟"),
        choices: [
          { id: "write", label: t("Lecture/écriture", "القراءة والكتابة") },
          { id: "read", label: t("Lecture", "القراءة") },
          { id: "none", label: t("Aucun accès", "دون ولوج") },
        ],
        answer: "read",
        explanation: t("Le droit Lecture suffit pour ouvrir et copier un fichier partagé.", "تكفي صلاحية القراءة لفتح ملف مشترك ونسخه."),
      },
    ],
  },
  acces: {
    file: "Video_access.mp4",
    source: 1,
    duration: "0:32",
    minutes: 2,
    title: t("Ouvrir le partage du voisin", "فتح مشاركة الحاسوب المجاور"),
    prompt: t("Observe la fenêtre utilisée et les deux barres obliques inversées devant l’adresse du poste distant.", "لاحظ النافذة المستعملة والشرطتين المائلتين العكسيتين قبل عنوان الحاسوب البعيد."),
    objective: "Ouvrir un dossier partagé sur le réseau local",
    questions: [
      {
        id: "fenetre",
        second: 21,
        prompt: t("Dans quelle fenêtre l’adresse du poste distant est-elle saisie ?", "في أي نافذة كُتب عنوان الحاسوب البعيد؟"),
        choices: [
          { id: "terminal", label: t("Invite de commandes", "موجه الأوامر") },
          { id: "run", label: t("Exécuter", "تشغيل") },
          { id: "settings", label: t("Paramètres Windows", "إعدادات ويندوز") },
        ],
        answer: "run",
        explanation: t("La fenêtre Exécuter ouvre les partages du poste indiqué.", "تفتح نافذة «تشغيل» المشاركات المتاحة على الحاسوب المحدد."),
      },
      {
        id: "chemin",
        second: 21,
        prompt: t("Le poste qui partage a l’adresse 192.168.10.22. Quelle saisie reprend la forme de la vidéo ?", "عنوان الحاسوب المشارك هو 192.168.10.22. أي كتابة تتبع الصيغة نفسها في الفيديو؟"),
        choices: [
          { id: "web", label: t("https://192.168.10.22", "https://192.168.10.22") },
          { id: "disk", label: t("C:\\192.168.10.22", "C:\\192.168.10.22") },
          { id: "unc", label: t("\\\\192.168.10.22", "\\\\192.168.10.22") },
        ],
        answer: "unc",
        explanation: t("Pour ouvrir les partages du voisin, saisis deux barres obliques inversées suivies de l’adresse de son poste.", "لفتح مشاركات الزميل، اكتب شرطتين مائلتين عكسيتين متبوعتين بعنوان حاسوبه."),
      },
    ],
  },
  image: {
    file: "Video_Downold_img.mp4",
    source: 1,
    duration: "0:53",
    minutes: 3,
    title: t("Enregistrer l’image au bon endroit", "حفظ الصورة في المكان المناسب"),
    prompt: t("Suis l’image de l’ordinateur depuis le navigateur jusqu’au dossier où elle est enregistrée.", "تتبّع صورة الحاسوب من المتصفح إلى المجلد الذي حُفظت فيه."),
    objective: "Enregistrer un fichier dans un dossier partagé",
    questions: [
      {
        id: "commande-image",
        second: 25,
        prompt: t("Après le clic droit, quelle commande permet de choisir où enregistrer l’image ?", "بعد النقر بزر الفأرة الأيمن، ما الأمر الذي يسمح باختيار مكان حفظ الصورة؟"),
        choices: [
          { id: "save", label: t("Enregistrer l’image sous…", "حفظ الصورة باسم…") },
          { id: "copy", label: t("Copier le lien de l’image", "نسخ رابط الصورة") },
          { id: "open", label: t("Ouvrir l’image dans un nouvel onglet", "فتح الصورة في علامة تبويب جديدة") },
        ],
        answer: "save",
        explanation: t("Cette commande ouvre une fenêtre où tu peux choisir le dossier et le nom du fichier.", "يفتح هذا الأمر نافذة لاختيار المجلد واسم الملف."),
      },
      {
        id: "destination",
        second: 45,
        prompt: t("Dans quel dossier l’image « Ordinateur » apparaît-elle à la fin ?", "في أي مجلد تظهر الصورة «Ordinateur» في النهاية؟"),
        choices: [
          { id: "downloads", label: t("Téléchargements", "التنزيلات") },
          { id: "share", label: t("partage", "المجلد partage") },
          { id: "images", label: t("Images", "الصور") },
        ],
        answer: "share",
        explanation: t("L’Explorateur affiche le dossier partage et la miniature du fichier Ordinateur.", "يعرض مستكشف الملفات المجلد partage والصورة المصغرة للملف Ordinateur."),
      },
    ],
  },
  messagerie: {
    file: "Video_save_copy_img.mp4",
    source: 2,
    duration: "1:25",
    minutes: 4,
    title: t("Faire passer une image par la messagerie LAN", "إرسال صورة عبر مراسلة الشبكة المحلية"),
    prompt: t("Repère le moment où la photo du processeur passe du Bureau à une conversation Softros LAN Messenger.", "لاحظ لحظة انتقال صورة المعالج من سطح المكتب إلى محادثة Softros LAN Messenger."),
    objective: "Échanger par messagerie locale",
    questions: [
      {
        id: "conversation",
        second: 38,
        prompt: t("Où vois-tu la photo du processeur vers 00:38 ?", "أين تظهر صورة المعالج عند حوالي 00:38؟"),
        choices: [
          { id: "explorer", label: t("Dans un dossier de l’Explorateur.", "داخل مجلد في مستكشف الملفات.") },
          { id: "browser", label: t("Dans les résultats du navigateur.", "ضمن نتائج البحث في المتصفح.") },
          { id: "chat", label: t("Dans une conversation Softros LAN Messenger.", "في محادثة Softros LAN Messenger.") },
        ],
        answer: "chat",
        explanation: t("La photo apparaît dans la conversation. Vérifie le destinataire dans la liste avant d’envoyer un fichier.", "تظهر الصورة في المحادثة. تحقق من المستلم في القائمة قبل إرسال الملف."),
      },
      {
        id: "internet-coupe",
        second: 38,
        prompt: t("Internet est coupé, mais les deux PC sont sur le même réseau local. Que peux-tu envoyer avec Softros ?", "انقطع الإنترنت، لكن الحاسوبين متصلان بالشبكة المحلية نفسها. ماذا يمكنك إرساله عبر Softros؟"),
        choices: [
          { id: "online", label: t("Une image à chercher sur le Web.", "صورة تحتاج إلى البحث عنها في الويب.") },
          { id: "local", label: t("L’image déjà enregistrée sur le PC.", "الصورة المحفوظة مسبقًا على الحاسوب.") },
          { id: "nothing", label: t("Aucun fichier, même s’il est déjà sur le PC.", "لا يمكن إرسال أي ملف، حتى لو كان محفوظًا على الحاسوب.") },
        ],
        answer: "local",
        explanation: t("La recherche sur le Web utilise Internet. Softros peut transmettre un fichier déjà disponible par le réseau local.", "يحتاج البحث في الويب إلى الإنترنت. ويمكن لـ Softros إرسال ملف متاح مسبقًا عبر الشبكة المحلية."),
      },
    ],
  },
} satisfies Record<string, Session4Video>;
