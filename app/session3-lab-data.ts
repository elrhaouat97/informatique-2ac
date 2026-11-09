import type { LocalizedText } from "./course-data.ts";
import type { Unit1Lab } from "./unit1-labs.ts";

const t = (fr: string, ar: string): LocalizedText => ({ fr, ar });
const visual = (name: string) => `session3/visuels/${name}.svg`;
const image = (name: string, fr: string, ar: string, gui = false) => ({
  src: visual(name), alt: t(fr, ar),
  caption: gui ? t("Vue simplifiée de Windows 11 · observe les icônes", "واجهة مبسطة لـWindows 11 · لاحظ الأيقونات") : t("Observe le document pour répondre.", "لاحظ الوثيقة للإجابة."),
});
const region = (x: number, y: number, width: number, height: number, w = 920, h = 540) => ({ x: 100*x/w, y: 100*y/h, width: 100*width/w, height: 100*height/h });
const desktopRegions = [region(300,464,50,54), region(355,464,180,54), region(548,464,55,54), region(612,464,54,54), region(756,464,112,54)];

export const session3Lab: Unit1Lab = {
  title: t("Séance 3 · J’observe, je comprends, j’agis", "الحصة 3 · ألاحظ وأفهم وأنجز"),
  subtitle: t("25 activités visuelles : rappel 25 min, découverte 20 min, pratique 55 min. Puis trace écrite et bilan.", "25 نشاطا بصريا: تذكير 25 دقيقة واكتشاف 20 دقيقة وتطبيق 55 دقيقة، ثم الخلاصة والتقويم."),
  exercises: [
    {
      id: "s3-v3-formes", type: "match", stage: "recall", level: "start", minutes: 3,
      title: t("Quatre façons de communiquer", "أربع طرق لتقديم المعلومة"),
      prompt: t("Consulte les quatre documents, puis classe-les.", "اطلع على الوثائق الأربع ثم صنفها."),
      categories: [t("Texte", "نص"), t("Image", "صورة"), t("Son", "صوت"), t("Vidéo", "فيديو")],
      rows: [
        { label: t("Document A", "الوثيقة A"), content: t("Club informatique : rendez-vous vendredi à 16 h dans la salle 12.", "نادي المعلوميات: نلتقي يوم الجمعة على الساعة الرابعة في القاعة 12."), answer: 0 },
        { label: t("Document B", "الوثيقة B"), image: visual("information-photo"), answer: 1 },
        { label: t("Document C", "الوثيقة C"), image: visual("information-audio"), audio: "session3/medias/message-sonore.wav", answer: 2 },
        { label: t("Document D", "الوثيقة D"), image: visual("information-video"), video: "session3/medias/animation-club.mp4", answer: 3 },
      ],
      hint: t("Observe le contenu et les commandes du lecteur.", "لاحظ المحتوى وأزرار المشغل."),
      feedback: t("Un message écrit est du texte. La photographie est une image. Le lecteur C diffuse du son ; D présente une vidéo.", "الرسالة المكتوبة نص والصورة الفوتوغرافية صورة. يقدم المشغل C صوتا وD فيديو."),
    },
    {
      "id": "s3-v5-traitement",
      "revision": 1,
      "type": "choice",
      "stage": "recall",
      "level": "start",
      "minutes": 2,
      "title": {
        "fr": "Que fait la calculatrice ?",
        "ar": "ماذا تنجز الحاسبة؟"
      },
      "prompt": {
        "fr": "Tu tapes 7 + 5 dans la calculatrice. Clique sur le traitement effectué.",
        "ar": "تدخل 7 + 5 في الحاسبة. انقر المعالجة المنجزة."
      },
      "choices": [
        {
          "fr": "Recevoir les nombres 7 et 5.",
          "ar": "استقبال العددين 7 و5."
        },
        {
          "fr": "Calculer la somme de 7 et 5.",
          "ar": "حساب مجموع 7 و5."
        },
        {
          "fr": "Afficher le résultat 12.",
          "ar": "عرض النتيجة 12."
        }
      ],
      "answer": 1,
      "hint": {
        "fr": "Le traitement est l’opération réalisée sur les nombres.",
        "ar": "المعالجة هي العملية المنجزة على الأعداد."
      },
      "feedback": {
        "fr": "Le traitement est le calcul de 7 + 5. Saisir les nombres est l’entrée ; afficher 12 est la sortie.",
        "ar": "المعالجة هي حساب 7 + 5. إدخال الأعداد هو الإدخال، وعرض 12 هو الإخراج."
      }
    },
    {
      id: "s3-v3-types", type: "match", stage: "recall", level: "start", minutes: 4,
      title: t("Qui réalise le travail ?", "من ينجز العمل؟"),
      prompt: t("Associe chaque situation au type de traitement.", "اربط كل وضعية بنوع المعالجة."),
      categories: [t("Manuel", "يدوي"), t("Semi-automatique", "شبه آلي"), t("Automatique", "آلي")],
      rows: [
        { label: t("Calcul sur papier", "حساب على الورق"), image: "treatment-situations/calcul-papier.jpg", answer: 0 },
        { label: t("Le caissier scanne chaque produit", "يمسح أمين الصندوق كل منتج"), image: "treatment-situations/caisse-scanner.jpg", answer: 1 },
        { label: t("Sauvegarde programmée chaque nuit", "نسخ احتياطي مبرمج كل ليلة"), image: "treatment-situations/sauvegarde-nuit.jpg", answer: 2 },
      ],
      hint: t("L’humain travaille seul, avec la machine, ou la machine exécute les opérations préparées.", "يعمل الإنسان وحده أو بمساعدة الآلة أو تنجز الآلة العمليات المبرمجة."),
      feedback: t("Le classement dépend des opérations décrites et du rôle de l’humain.", "يعتمد التصنيف على العمليات الموصوفة ودور الإنسان."),
    },
    {
      "id": "s3-v5-peripheriques",
      "type": "multi",
      "stage": "recall",
      "level": "start",
      "minutes": 5,
      "title": {
        "fr": "Autour de l’unité centrale",
        "ar": "حول الوحدة المركزية"
      },
      "prompt": {
        "fr": "Coche les 3 périphériques.",
        "ar": "حدد الملحقات الثلاثة."
      },
      "feedback": {
        "fr": "Le clavier, la souris et l’écran sont des périphériques. Le boîtier est l’unité centrale.",
        "ar": "لوحة المفاتيح والفأرة والشاشة ملحقات. الصندوق هو الوحدة المركزية."
      },
      "choices": [
        {
          "fr": "Matériel A",
          "ar": "الجهاز A"
        },
        {
          "fr": "Matériel B",
          "ar": "الجهاز B"
        },
        {
          "fr": "Matériel C",
          "ar": "الجهاز C"
        },
        {
          "fr": "Matériel D",
          "ar": "الجهاز D"
        }
      ],
      "choiceImages": [
        "session2/items/unite-centrale-lenovo.jpg",
        "session3/ressources/clavier.jpg",
        "session2/items/ex02-card-04.jpg",
        "session2/items/ex02-card-16.png"
      ],
      "answers": [
        1,
        2,
        3
      ],
      "hint": {
        "fr": "Les périphériques servent notamment à saisir, afficher ou échanger des informations avec l’unité centrale.",
        "ar": "تستعمل الملحقات لإدخال المعلومات أو عرضها أو تبادلها مع الوحدة المركزية."
      }
    },
    {
      id: "s3-v3-composants", type: "match", stage: "recall", level: "start", minutes: 5,
      title: t("Trois composants, trois rôles", "ثلاثة مكونات وثلاث وظائف"),
      prompt: t("Relie chaque composant à son rôle.", "اربط كل مكون بوظيفته."),
      categories: [t("Exécuter les instructions", "تنفيذ التعليمات"),t("Garder les données temporairement", "حفظ المعطيات مؤقتا"),t("Garder les fichiers après l’arrêt", "حفظ الملفات بعد إيقاف الجهاز")],
      rows: [{label:t("Processeur", "المعالج"),image:"session2/items/ex12-card-01.png",answer:0},{label:t("RAM", "RAM"),image:"session2/items/ex12-card-03.jpg",answer:1},{label:t("SSD", "SSD"),image:"session2/items/ex12-card-05.jpg",answer:2}],
      hint:t("Quel composant conserve les fichiers quand l’ordinateur est éteint ?", "أي مكون يحتفظ بالملفات عندما نوقف الحاسوب؟"),
      feedback:t("Le processeur exécute les instructions ; la RAM est temporaire ; le SSD conserve les fichiers après l’arrêt.", "ينفذ المعالج التعليمات وتحفظ RAM مؤقتا ويحتفظ SSD بالملفات بعد الإيقاف."),
    },
    {
      "id": "s3-v5-capacites",
      "type": "conversions",
      "stage": "recall",
      "level": "start",
      "minutes": 5,
      "title": {
        "fr": "À toi de convertir !",
        "ar": "دورك لتحويل الوحدات!"
      },
      "prompt": {
        "fr": "Observe le tableau, puis complète les 3 conversions. Écris seulement les nombres.",
        "ar": "لاحظ الجدول ثم أكمل التحويلات الثلاثة. اكتب الأعداد فقط."
      },
      "feedback": {
        "fr": "2 Go = 2 000 Mo ; 3 500 Mo = 3,5 Go ; 16 bits = 2 octets. Chaque déplacement d’unité applique le facteur adapté.",
        "ar": "2 Go = 2000 Mo و3500 Mo = 3,5 Go و16 bits = 2 octets. يستعمل كل انتقال العامل المناسب."
      },
      "rows": [
        {
          "before": "2 Go =",
          "after": "Mo",
          "accepted": [
            "2000"
          ]
        },
        {
          "before": "3 500 Mo =",
          "after": "Go",
          "accepted": [
            "3.5"
          ]
        },
        {
          "before": "16 bits =",
          "after": "octets",
          "accepted": [
            "2"
          ]
        }
      ],
      "hint": {
        "fr": "Vers une unité plus petite, multiplie. Vers une plus grande, divise. Le facteur bit/octet est 8 ; les autres valent 1 000.",
        "ar": "اضرب نحو الوحدة الأصغر واقسم نحو الأكبر. عامل البت والأوكتات 8، وبقية العوامل 1000."
      },
      "instructionImage": {
        "src": "session3/ressources/conversion-unites-v2.png",
        "alt": {
          "fr": "Échelle bit, octet, Ko, Mo, Go, To : multiplier en remontant vers le bit, diviser en descendant vers le To. Facteur 8 entre bit et octet et 1000 entre les autres unités.",
          "ar": "سلم البت والأوكتات وKo وMo وGo وTo: نضرب صعودا نحو البت ونقسم نزولا نحو To. العامل 8 بين البت والأوكتات و1000 بين الوحدات الأخرى."
        },
        "caption": {
          "fr": "Aide : suis les flèches du tableau. 1 octet = 8 bits ; 1 Ko = 1 000 octets.",
          "ar": "للمساعدة: اتبع أسهم الجدول. 1 أوكتات = 8 بت، و1 Ko = 1000 أوكتات."
        }
      }
    },
    {
      "id": "s3-v5-diagnostic-systeme",
      "revision": 1,
      "type": "choice",
      "stage": "discover",
      "level": "train",
      "minutes": 3,
      "title": {
        "fr": "Quel logiciel manque à ce PC ?",
        "ar": "ما البرنامج الذي ينقص هذا الحاسوب؟"
      },
      "prompt": {
        "fr": "Ce PC s’allume, mais aucun système d’exploitation n’est installé. Clique sur le logiciel à installer.",
        "ar": "يشتغل هذا الحاسوب لكن لا يوجد عليه نظام تشغيل. انقر البرنامج الذي يجب تثبيته."
      },
      "image": {
        "src": "session2/items/unite-centrale-lenovo.jpg",
        "alt": {
          "fr": "Photographie de l’unité centrale Lenovo du poste de Sara.",
          "ar": "صورة حقيقية للوحدة المركزية Lenovo الخاصة بحاسوب سارة."
        },
        "caption": {
          "fr": "Le poste de Sara a besoin d’un système d’exploitation.",
          "ar": "يحتاج حاسوب سارة إلى نظام تشغيل."
        }
      },
      "choices": [
        {
          "fr": "Windows 11",
          "ar": "Windows 11"
        },
        {
          "fr": "Calculatrice",
          "ar": "الحاسبة"
        },
        {
          "fr": "Navigateur Web",
          "ar": "متصفح الويب"
        }
      ],
      "choiceImages": [
        "session3/visuels/logo-windows.svg",
        "session3/visuels/app-calculatrice.svg",
        "session3/visuels/app-navigateur.svg"
      ],
      "answer": 0,
      "hint": {
        "fr": "Choisis un système d’exploitation pour ce PC.",
        "ar": "اختر نظام تشغيل لهذا الحاسوب."
      },
      "feedback": {
        "fr": "Windows 11 est un système d’exploitation : il rend le PC utilisable et permet d’ouvrir les applications. La Calculatrice et le navigateur sont des applications.",
        "ar": "Windows 11 نظام تشغيل يتيح استعمال الحاسوب وفتح التطبيقات. الحاسبة والمتصفح تطبيقان."
      }
    },
    {
      "id": "s3-v5-materiel-logiciel",
      "type": "match",
      "stage": "discover",
      "level": "train",
      "minutes": 4,
      "title": {
        "fr": "Dans le sac ou dans les programmes ?",
        "ar": "داخل الحقيبة أم ضمن البرامج؟"
      },
      "prompt": {
        "fr": "Le club prépare un poste. Range les six cartes : d’un côté les objets physiques, de l’autre les programmes. Glisse une carte ou clique dessus puis sur sa famille.",
        "ar": "يعد النادي حاسوبا. صنف البطاقات الست إلى أشياء مادية وبرامج. اسحب البطاقة أو انقرها ثم انقر فئتها."
      },
      "feedback": {
        "fr": "Un système informatique associe du matériel et des logiciels. Le processeur, le clavier et le SSD sont physiques ; Windows, la Calculatrice et le navigateur sont des programmes.",
        "ar": "يجمع النظام المعلوماتي بين المعدات والبرمجيات. المعالج ولوحة المفاتيح وSSD عناصر مادية، وWindows والحاسبة والمتصفح برامج."
      },
      "interaction": "drag",
      "categories": [
        {
          "fr": "Matériel",
          "ar": "المعدات"
        },
        {
          "fr": "Logiciels",
          "ar": "البرمجيات"
        }
      ],
      "rows": [
        {
          "label": {
            "fr": "Processeur",
            "ar": "المعالج"
          },
          "image": "session2/items/ex12-card-01.png",
          "answer": 0
        },
        {
          "label": {
            "fr": "Clavier",
            "ar": "لوحة المفاتيح"
          },
          "image": "session3/ressources/clavier.jpg",
          "answer": 0
        },
        {
          "label": {
            "fr": "SSD",
            "ar": "SSD"
          },
          "image": "session2/items/ex12-card-05.jpg",
          "answer": 0
        },
        {
          "label": {
            "fr": "Windows",
            "ar": "Windows"
          },
          "image": "session3/visuels/logo-windows.svg",
          "answer": 1
        },
        {
          "label": {
            "fr": "Calculatrice",
            "ar": "الحاسبة"
          },
          "image": "session3/visuels/app-calculatrice.svg",
          "answer": 1
        },
        {
          "label": {
            "fr": "Navigateur Web",
            "ar": "متصفح الويب"
          },
          "image": "session3/visuels/app-navigateur.svg",
          "answer": 1
        }
      ],
      "hint": {
        "fr": "Peut-on transporter la carte dans un sac, ou s’agit-il d’un programme à exécuter ?",
        "ar": "هل تمثل البطاقة شيئا يمكن حمله في حقيبة أم برنامجا ينفذ؟"
      }
    },
    {
      "id": "s3-v5-logiciels-familles",
      "revision": 1,
      "type": "match",
      "interaction": "select",
      "stage": "discover",
      "level": "train",
      "minutes": 3,
      "title": {
        "fr": "Système ou application ?",
        "ar": "نظام تشغيل أم تطبيق؟"
      },
      "prompt": {
        "fr": "Pour chaque image, choisis « Système d’exploitation » ou « Application ».",
        "ar": "اختر لكل صورة «نظام تشغيل» أو «تطبيق»."
      },
      "categories": [
        {
          "fr": "Système d’exploitation",
          "ar": "نظام تشغيل"
        },
        {
          "fr": "Application",
          "ar": "تطبيق"
        }
      ],
      "rows": [
        {
          "label": {
            "fr": "Windows",
            "ar": "Windows"
          },
          "image": "session3/visuels/logo-windows.svg",
          "answer": 0
        },
        {
          "label": {
            "fr": "Android",
            "ar": "Android"
          },
          "image": "session3/visuels/logo-android.svg",
          "answer": 0
        },
        {
          "label": {
            "fr": "Calculatrice",
            "ar": "الحاسبة"
          },
          "image": "session3/visuels/app-calculatrice.svg",
          "answer": 1
        },
        {
          "label": {
            "fr": "Navigateur Web",
            "ar": "متصفح الويب"
          },
          "image": "session3/visuels/app-navigateur.svg",
          "answer": 1
        }
      ],
      "hint": {
        "fr": "Le système fait fonctionner l’appareil ; une application permet de réaliser une tâche.",
        "ar": "يشغل النظام الجهاز، ويساعد التطبيق على إنجاز مهمة."
      },
      "feedback": {
        "fr": "Windows et Android sont des systèmes d’exploitation. La Calculatrice et le navigateur Web sont des applications.",
        "ar": "Windows وAndroid نظاما تشغيل، والحاسبة ومتصفح الويب تطبيقان."
      }
    },
    {
      id:"s3-v3-demarrer",type:"hotspot",stage:"discover",level:"train",minutes:3,
      title:t("Je veux ouvrir une application", "أريد فتح تطبيق"),
      prompt:t("Clique sur le bouton Démarrer.", "انقر على زر ابدأ."),
      image:image("ecran-windows","Bureau Windows 11 avec Démarrer, recherche, Explorateur, Calculatrice et zone de notification", "سطح مكتب Windows 11 بزر ابدأ والبحث والمستكشف والحاسبة ومنطقة الإشعارات",true),
      regions:desktopRegions,answer:0,
      hint:t("Cherche le symbole Windows dans la barre du bas.", "ابحث عن رمز Windows في الشريط السفلي."),
      feedback:t("Démarrer donne accès aux applications et aux paramètres.", "يتيح ابدأ الوصول إلى التطبيقات والإعدادات."),
    },
    {
      id:"s3-v3-retrouver-fenetre",type:"hotspot",stage:"discover",level:"train",minutes:3,
      title:t("La Calculatrice est réduite", "نافذة الحاسبة مصغرة"),
      prompt:t("Clique pour retrouver la Calculatrice.", "انقر لإظهار الحاسبة مجددا."),
      image:image("ecran-windows","Bureau avec la Calculatrice présente dans la barre des tâches", "سطح مكتب يظهر تطبيق الحاسبة في شريط المهام",true),regions:desktopRegions,answer:3,
      hint:t("Une application réduite reste accessible dans la barre des tâches.", "يبقى التطبيق المصغر متاحا في شريط المهام."),
      feedback:t("Cliquer sur l’icône de la Calculatrice réaffiche sa fenêtre.", "يعيد النقر على أيقونة الحاسبة إظهار نافذتها."),
    },
    {
      id:"s3-v3-explorateur",type:"hotspot",stage:"discover",level:"train",minutes:2,
      title:t("Je veux retrouver mes fichiers", "أريد العثور على ملفاتي"),
      prompt:t("Clique sur l’Explorateur de fichiers.", "انقر على مستكشف الملفات."),
      image:image("ecran-windows","Bureau avec l’icône jaune de l’Explorateur dans la barre des tâches", "سطح مكتب بأيقونة مستكشف الملفات الصفراء في شريط المهام",true),regions:desktopRegions,answer:2,
      hint:t("Son icône ressemble à un dossier jaune.", "تشبه أيقونته مجلدا أصفر."),
      feedback:t("L’Explorateur permet de consulter et d’organiser les fichiers et les dossiers.", "يسمح المستكشف بتصفح الملفات والمجلدات وتنظيمها."),
    },
    {
      "id": "s3-v5-windows-bureau",
      "type": "system-lab",
      "stage": "practice",
      "level": "train",
      "minutes": 15,
      "title": {
        "fr": "Pilote un bureau Windows 11",
        "ar": "تحكم في مكتب Windows 11"
      },
      "prompt": {
        "fr": "Utilise le menu Démarrer et la barre des tâches. Effectue les sept missions sur les vraies commandes de cette simulation, puis vérifie ton travail.",
        "ar": "استعمل قائمة ابدأ وشريط المهام. أنجز المهام السبع باستعمال أوامر هذه المحاكاة ثم تحقق من عملك."
      },
      "feedback": {
        "fr": "Tu as utilisé des applications, effectué un calcul, déplacé et géré des fenêtres. Refais ces gestes sur le poste Windows de la salle.",
        "ar": "استعملت تطبيقات وأنجزت حسابا وحركت النوافذ وتحكمت فيها. أعد الحركات على حاسوب Windows في القاعة."
      },
      "mode": "windows11-desktop",
      "hint": {
        "fr": "La barre de titre déplace une fenêtre. Les boutons −, □ et × servent à réduire, agrandir et fermer. Une fenêtre réduite reste dans la barre des tâches.",
        "ar": "يحرك شريط العنوان النافذة. تستعمل أزرار التصغير والتكبير والإغلاق، وتبقى النافذة المصغرة في شريط المهام."
      }
    },
    {
      id:"s3-v3-fichiers-dossiers",type:"match",interaction:"drag",stage:"practice",level:"train",minutes:4,
      title:t("Des contenus et des rangements", "محتويات وأماكن لتنظيمها"),
      prompt:t("Classe ces trois éléments.", "صنف العناصر الثلاثة."),
      categories:[t("Fichier", "ملف"),t("Dossier", "مجلد")],
      rows:[{label:t("Élément A", "العنصر A"),image:visual("element-dossier"),answer:1},{label:t("Élément B", "العنصر B"),image:visual("element-image"),answer:0},{label:t("Élément C", "العنصر C"),image:visual("element-texte"),answer:0}],
      hint:t("Un fichier contient des informations. Un dossier peut ranger plusieurs fichiers.", "يحتوي الملف على معلومات ويمكن للمجلد تنظيم ملفات متعددة."),
      feedback:t("Documents est un dossier. La photo et le compte rendu sont des fichiers.", "Documents مجلد. الصورة والتقرير ملفان."),
    },
    {
      "id": "s3-v5-information-fichier",
      "type": "match",
      "stage": "practice",
      "level": "train",
      "minutes": 5,
      "title": {
        "fr": "Quatre informations deviennent quatre fichiers",
        "ar": "أربع معلومات تصبح أربعة ملفات"
      },
      "prompt": {
        "fr": "Ouvre le petit exemple, puis observe, lis ou écoute le contenu de chaque fichier. Associe chaque fichier à la forme d’information qu’il contient.",
        "ar": "استكشف المثال ثم لاحظ أو اقرأ أو استمع إلى محتوى كل ملف. اربط كل ملف بشكل المعلومة الذي يحتويه."
      },
      "feedback": {
        "fr": "Un fichier peut conserver du texte, une image, un son ou une vidéo. Son nom permet de le retrouver et son extension renseigne sur son format.",
        "ar": "يمكن أن يحفظ الملف نصا أو صورة أو صوتا أو فيديو. يسمح اسمه بالعثور عليه ويدل امتداده على صيغته."
      },
      "categories": [
        {
          "fr": "Texte",
          "ar": "نص"
        },
        {
          "fr": "Image",
          "ar": "صورة"
        },
        {
          "fr": "Son",
          "ar": "صوت"
        },
        {
          "fr": "Vidéo",
          "ar": "فيديو"
        }
      ],
      "rows": [
        {
          "label": {
            "fr": "Invitation.txt",
            "ar": "Invitation.txt"
          },
          "content": {
            "fr": "Le club vous invite vendredi à 16 h en salle informatique.",
            "ar": "يدعوكم النادي يوم الجمعة على الساعة الرابعة إلى قاعة المعلوميات."
          },
          "answer": 0
        },
        {
          "label": {
            "fr": "Materiel_club.jpg",
            "ar": "Materiel_club.jpg"
          },
          "image": "session2/items/unite-centrale-lenovo.jpg",
          "answer": 1
        },
        {
          "label": {
            "fr": "Message_club.wav",
            "ar": "Message_club.wav"
          },
          "image": "session3/visuels/information-audio.svg",
          "audio": "session3/medias/message-sonore.wav",
          "answer": 2
        },
        {
          "label": {
            "fr": "Reportage_club.mp4",
            "ar": "Reportage_club.mp4"
          },
          "image": "session3/visuels/information-video.svg",
          "video": "session3/medias/animation-club.mp4",
          "answer": 3
        }
      ],
      "hint": {
        "fr": "Regarde le contenu, pas seulement l’icône du fichier. Les boutons de lecture permettent d’écouter ou de voir les médias.",
        "ar": "لاحظ المحتوى وليس أيقونة الملف وحدها. تسمح أزرار التشغيل بالاستماع إلى الوسائط أو مشاهدتها."
      }
    },
    {
      id:"s3-v3-comparer-copie",type:"choice",stage:"practice",level:"train",minutes:3,
      title:t("Que s’est-il passé ?", "ماذا حدث؟"),
      prompt:t("Observe avant et après. Quelle opération a été faite ?", "لاحظ قبل وبعد. ما العملية المنجزة؟"),
      image:image("copie-avant-apres","Avant : un fichier dans Documents ; après : le même fichier dans Documents et Travaux", "قبل: ملف في Documents؛ بعد: الملف في Documents وTravaux"),
      choices:[t("Copier puis coller", "نسخ ثم لصق"),t("Couper puis coller", "قص ثم لصق"),t("Renommer", "إعادة التسمية")],answer:0,
      hint:t("Le fichier est-il encore présent dans Documents ?", "هل ما زال الملف موجودا في Documents؟"),
      feedback:t("L’original est resté dans Documents et une copie a été créée dans Travaux.", "بقي الأصل في Documents وأنشئت نسخة في Travaux."),
    },
    {
      "id": "s3-v5-copie-pratique",
      "type": "system-lab",
      "stage": "practice",
      "level": "train",
      "minutes": 2,
      "title": {
        "fr": "Partager une photo sans perdre l’original",
        "ar": "مشاركة صورة دون فقدان الأصل"
      },
      "prompt": {
        "fr": "Copie Photo_club.jpg depuis Images dans Documents / Publication. L’original doit rester dans Images. Choisis les commandes toi-même.",
        "ar": "انسخ Photo_club.jpg من Images إلى Documents / Publication. يجب أن يبقى الأصل داخل Images. اختر الأوامر بنفسك."
      },
      "feedback": {
        "fr": "La publication possède sa copie et l’original est resté dans Images. Tu as réalisé Copier puis Coller.",
        "ar": "يتوفر المنشور على نسخة وبقي الأصل داخل Images. أنجزت النسخ ثم اللصق."
      },
      "mode": "windows11-copy",
      "hint": {
        "fr": "Ouvre Images, sélectionne le fichier et utilise Copier. Ouvre ensuite Documents puis Publication et colle.",
        "ar": "افتح Images وحدد الملف ثم انسخه. افتح بعده Documents ثم Publication وألصق."
      }
    },
    {
      id:"s3-v3-commande-copier",type:"hotspot",stage:"practice",level:"challenge",minutes:3,
      title:t("Choisis la commande utile", "اختر الأمر المناسب"),
      prompt:t("Garde l’original. Clique pour préparer une copie.", "احتفظ بالأصل. انقر لإعداد نسخة."),
      image:image("barre-outils","Barre d’outils : Nouveau, Couper, Copier, Renommer, Supprimer", "شريط الأدوات: جديد وقص ونسخ وإعادة تسمية وحذف",true),
      regions:[region(40,115,140,85,920,260),region(220,115,140,85,920,260),region(400,115,140,85,920,260),region(580,115,140,85,920,260),region(760,115,140,85,920,260)],answer:2,
      hint:t("Couper prépare un déplacement. Quelle commande garde le fichier d’origine ?", "يعد القص للنقل. أي أمر يحتفظ بالملف الأصلي؟"),
      feedback:t("Copier prépare un double. Ouvre ensuite le dossier de destination et utilise Coller.", "يعد النسخ نسخة إضافية. افتح مجلد الوجهة ثم استعمل اللصق."),
    },
    {
      "id": "s3-v5-deplacement-son",
      "type": "system-lab",
      "stage": "practice",
      "level": "challenge",
      "minutes": 3,
      "title": {
        "fr": "Le message de la radio est prêt",
        "ar": "رسالة الإذاعة جاهزة"
      },
      "prompt": {
        "fr": "Range et renomme le fichier sonore.",
        "ar": "رتب الملف الصوتي وأعد تسميته."
      },
      "feedback": {
        "fr": "Tu as déplacé le son et choisi un nom utile. Le fichier .wav garde son contenu sonore.",
        "ar": "نقلت الصوت واخترت اسما مفيدا، وبقي محتوى الملف .wav صوتيا."
      },
      "mode": "windows11-move",
      "hint": {
        "fr": "Couper puis Coller change l’emplacement. Renommer change le nom ; conserve .wav.",
        "ar": "يغير القص ثم اللصق الموضع وتغير إعادة التسمية الاسم. حافظ على .wav."
      },
      "tasks": [
        {
          "fr": "Ouvre Téléchargements.",
          "ar": "افتح Téléchargements."
        },
        {
          "fr": "Déplace audio001.wav dans Documents → Radio.",
          "ar": "انقل audio001.wav إلى Documents ← Radio."
        },
        {
          "fr": "Renomme ce fichier Message_club.wav.",
          "ar": "أعد تسمية هذا الملف Message_club.wav."
        }
      ]
    },
    {
      id:"s3-v4-reduire",type:"hotspot",stage:"practice",level:"train",minutes:2,
      title:t("Je masque la fenêtre", "أخفي النافذة"),
      prompt:t("Clique pour réduire la fenêtre sans fermer l’application.", "انقر لتصغير النافذة دون إغلاق التطبيق."),
      image:image("fenetre-commandes","Fenêtre avec les boutons Réduire, Agrandir et Fermer", "نافذة بأزرار التصغير والتكبير والإغلاق",true),
      regions:[region(490,42,65,60,760,340),region(555,42,65,60,760,340),region(620,42,65,60,760,340)],answer:0,
      hint:t("Réduire masque la fenêtre. L’application reste ouverte.", "يخفي التصغير النافذة ويبقى التطبيق مفتوحا."),
      feedback:t("Le bouton − réduit la fenêtre. Tu peux la retrouver dans la barre des tâches.", "يصغر الزر − النافذة ويمكنك إظهارها مجددا من شريط المهام."),
    },
    {
      id:"s3-v4-fermer",type:"hotspot",stage:"practice",level:"train",minutes:2,
      title:t("Je termine mon travail", "أنهي عملي"),
      prompt:t("Clique pour fermer la fenêtre.", "انقر لإغلاق النافذة."),
      image:image("fenetre-commandes","Fenêtre avec les trois boutons de contrôle", "نافذة بأزرار التحكم الثلاثة",true),
      regions:[region(490,42,65,60,760,340),region(555,42,65,60,760,340),region(620,42,65,60,760,340)],answer:2,
      hint:t("Fermer et réduire sont deux actions différentes.", "الإغلاق والتصغير عمليتان مختلفتان."),
      feedback:t("Le bouton × ferme la fenêtre. On enregistre son travail avant de fermer.", "يغلق الزر × النافذة. نحفظ العمل قبل الإغلاق."),
    },
    {
      id:"s3-v4-deplacement",type:"choice",stage:"practice",level:"train",minutes:3,
      title:t("Le fichier a changé de place", "تغير مكان الملف"),
      prompt:t("Observe avant et après. Quelle opération a été faite ?", "لاحظ قبل وبعد. ما العملية المنجزة؟"),
      image:image("deplacement-avant-apres","Le fichier n’est plus dans Documents ; il se trouve dans Travaux", "لم يعد الملف في Documents وأصبح في Travaux"),
      choices:[t("Copier puis coller", "نسخ ثم لصق"),t("Couper puis coller", "قص ثم لصق"),t("Renommer", "إعادة تسمية")],answer:1,
      hint:t("L’original est-il resté dans Documents ?", "هل بقي الأصل في Documents؟"),
      feedback:t("Le fichier a été déplacé : couper, puis coller dans le nouveau dossier.", "نقل الملف باستعمال القص ثم اللصق في المجلد الجديد."),
    },
    {
      "id": "s3-v5-restauration-pratique",
      "type": "system-lab",
      "stage": "practice",
      "level": "challenge",
      "minutes": 3,
      "title": {
        "fr": "Retrouve les consignes du professeur",
        "ar": "استعد تعليمات الأستاذ"
      },
      "prompt": {
        "fr": "Récupère le fichier supprimé par erreur.",
        "ar": "استعد الملف المحذوف بالخطأ."
      },
      "feedback": {
        "fr": "La restauration a remis le document dans Documents. Tu peux à nouveau l’ouvrir et lire les consignes.",
        "ar": "أعادت الاستعادة الوثيقة إلى Documents ويمكن فتحها وقراءة التعليمات."
      },
      "mode": "windows11-restore",
      "hint": {
        "fr": "Dans la Corbeille, sélectionne le document puis utilise Restaurer. Reviens dans Documents pour vérifier.",
        "ar": "حدد الوثيقة داخل السلة ثم استعمل استعادة. عد إلى Documents للتحقق."
      },
      "tasks": [
        {
          "fr": "Ouvre la Corbeille.",
          "ar": "افتح سلة المحذوفات."
        },
        {
          "fr": "Sélectionne consignes.txt, puis clique sur Restaurer.",
          "ar": "حدد consignes.txt ثم انقر استعادة."
        },
        {
          "fr": "Ouvre Documents et vérifie que consignes.txt est revenu.",
          "ar": "افتح Documents وتحقق من عودة consignes.txt."
        }
      ]
    },
    {
      "id": "s3-v5-nommage-pratique",
      "type": "system-lab",
      "stage": "practice",
      "level": "challenge",
      "minutes": 3,
      "title": {
        "fr": "Prépare l’image pour l’affiche",
        "ar": "أعد الصورة للملصق"
      },
      "prompt": {
        "fr": "Dans Images, ouvre IMG_0007.jpg pour voir son contenu. Renomme ensuite ce même fichier Materiel_club.jpg en conservant .jpg.",
        "ar": "افتح IMG_0007.jpg داخل Images لملاحظة محتواه ثم أعد تسمية الملف نفسه Materiel_club.jpg مع الحفاظ على .jpg."
      },
      "feedback": {
        "fr": "Un nom précis permet de reconnaître la photo du matériel. Renommer n’a changé ni l’image ni son format.",
        "ar": "يسمح الاسم الدقيق بالتعرف على صورة المعدات، ولم تغير إعادة التسمية الصورة أو صيغتها."
      },
      "mode": "windows11-rename",
      "hint": {
        "fr": "Sélectionne le fichier puis utilise Renommer ou F2. Tu peux garder la même extension.",
        "ar": "حدد الملف ثم استعمل إعادة التسمية أو F2 وحافظ على امتداده."
      }
    },
    {
      "id": "s3-v5-projet-exposition",
      "type": "system-lab",
      "stage": "practice",
      "level": "challenge",
      "minutes": 7,
      "title": {
        "fr": "Le dossier de l’exposition du club",
        "ar": "مجلد معرض النادي"
      },
      "prompt": {
        "fr": "Prépare le dossier de l’exposition. Réalise ces 4 tâches.",
        "ar": "أعد مجلد المعرض بإنجاز المهام الأربع."
      },
      "feedback": {
        "fr": "Ton dossier contient des fichiers rangés selon leur contenu. Tu as créé une arborescence, déplacé une photo et copié un texte sans perdre l’original.",
        "ar": "يتضمن مجلدك ملفات منظمة حسب محتواها. أنشأت بنية مجلدات ونقلت صورة ونسخت نصا دون فقدان الأصل."
      },
      "mode": "windows11-project",
      "hint": {
        "fr": "Les noms et les emplacements du dossier final comptent. Tu peux utiliser la barre d’outils, le clic droit ou les raccourcis.",
        "ar": "تحتسب أسماء عناصر المجلد النهائي ومواضعها. يمكنك استعمال شريط الأدوات أو الزر الأيمن أو الاختصارات."
      },
      "tasks": [
        {
          "fr": "Dans Documents, crée le dossier Expo_club.",
          "ar": "أنشئ المجلد Expo_club داخل Documents."
        },
        {
          "fr": "Dans Expo_club, crée les dossiers Photos et Textes.",
          "ar": "أنشئ المجلدين Photos وTextes داخل Expo_club."
        },
        {
          "fr": "Déplace Photo_club.jpg de Téléchargements vers Expo_club → Photos.",
          "ar": "انقل Photo_club.jpg من Téléchargements إلى Photos داخل Expo_club."
        },
        {
          "fr": "Copie Invitation.txt de Documents vers Expo_club → Textes. Garde l’original.",
          "ar": "انسخ Invitation.txt من Documents إلى Textes داخل Expo_club، واحتفظ بالأصل."
        }
      ]
    },
  ],
};
