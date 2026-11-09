import type { LocalizedText } from "./course-data.ts";

const t = (fr: string, ar: string): LocalizedText => ({ fr, ar });

type RealPhoto = {
  src: string;
  alt: LocalizedText;
  credit: string;
  source: string;
};

export type PhotoChallenge = {
  kind: LocalizedText;
  image: RealPhoto;
  prompt: LocalizedText;
  choices: LocalizedText[];
  answer: number;
  feedback: LocalizedText;
};

const photos = {
  workstation: {
    src: "https://images.unsplash.com/photo-1586745370973-343d1ba81ed2?auto=format&fit=crop&w=1200&q=82",
    alt: t("Ordinateur portable, clavier et souris sur un vrai bureau", "حاسوب ولوحة مفاتيح وفأرة فوق مكتب حقيقي"),
    credit: "Photo réelle · Unsplash",
    source: "https://unsplash.com/photos/black-computer-keyboard-beside-black-computer-mouse-xDNGytM3A5c",
  },
  motherboard: {
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=82",
    alt: t("Gros plan réel d’une carte électronique", "صورة حقيقية مقربة للوحة إلكترونية"),
    credit: "Photo réelle · Unsplash",
    source: "https://unsplash.com/s/photos/circuit-board",
  },
  network: {
    src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=82",
    alt: t("Équipements et câbles d’un réseau informatique réel", "معدات وكابلات شبكة معلوماتية حقيقية"),
    credit: "Photo réelle · Unsplash",
    source: "https://unsplash.com/s/photos/network-server",
  },
  budget: {
    src: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=82",
    alt: t("Calculatrice et documents de dépenses réels", "آلة حاسبة ووثائق مصاريف حقيقية"),
    credit: "Photo réelle · Unsplash",
    source: "https://unsplash.com/s/photos/calculator-budget",
  },
  data: {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=82",
    alt: t("Écran présentant de vraies données et des graphiques", "شاشة تعرض بيانات ومبيانات حقيقية"),
    credit: "Photo réelle · Unsplash",
    source: "https://unsplash.com/s/photos/data-analysis",
  },
  code: {
    src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=82",
    alt: t("Écran d’ordinateur affichant un programme", "شاشة حاسوب تعرض برنامجا"),
    credit: "Photo réelle · Unsplash",
    source: "https://unsplash.com/s/photos/computer-code",
  },
  geometry: {
    src: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=82",
    alt: t("Façade architecturale réelle faite de formes géométriques", "واجهة معمارية حقيقية مكونة من أشكال هندسية"),
    credit: "Photo réelle · Unsplash",
    source: "https://unsplash.com/s/photos/geometric-architecture",
  },
  city: {
    src: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=82",
    alt: t("Vue réelle de bâtiments et de rues d’une ville", "صورة حقيقية لمبان وشوارع مدينة"),
    credit: "Photo réelle · Unsplash",
    source: "https://unsplash.com/s/photos/smart-city",
  },
} satisfies Record<string, RealPhoto>;

export const beginnerGuides: Record<number, LocalizedText[]> = {
  1: [
    t("Pose la main sur la souris et déplace-la doucement : la flèche suit ton geste.", "ضع يدك على الفأرة وحركها بهدوء: سيتبع السهم حركتك."),
    t("Un clic choisit. Deux clics rapides ouvrent. La molette fait défiler.", "نقرة واحدة للاختيار ونقرتان سريعتان للفتح والعجلة للتمرير."),
    t("Clique dans une zone blanche avant d’écrire au clavier. Entrée valide, Retour efface.", "انقر داخل المساحة البيضاء قبل الكتابة. Enter للتأكيد وRetour للمسح."),
  ],
  2: [
    t("Observe d’abord la photo ; ne touche jamais l’intérieur d’un poste branché.", "لاحظ الصورة أولا ولا تلمس أبدا داخل حاسوب موصول بالكهرباء."),
    t("Clique une fois sur une réponse pour la sélectionner, puis lis son nom à voix haute.", "انقر مرة واحدة على الجواب لاختياره ثم اقرأ اسمه بصوت مسموع."),
    t("Utilise la molette pour descendre sans tirer la barre de défilement.", "استعمل عجلة الفأرة للنزول دون سحب شريط التمرير."),
  ],
  3: [
    t("Commence par les 6 exercices de rappel des séances 1 et 2.", "ابدأ بالتمارين الستة للتذكير بالحصتين 1 و2."),
    t("Pars des gestes que tu connais sur Android pour comprendre Windows.", "انطلق من الحركات التي تعرفها في Android لفهم Windows."),
    t("Entraîne-toi dans les simulations, puis refais les gestes sur Windows avec ton binôme.", "تدرب في المحاكاة ثم أعد الحركات في Windows مع زميلك."),
  ],
  4: [
    t("Double-clique sur BeeBEEP, puis attends l’ouverture sans cliquer plusieurs fois.", "انقر نقرا مزدوجا على BeeBEEP ثم انتظر الفتح دون تكرار النقر."),
    t("Choisis le nom du destinataire avant d’écrire le message.", "اختر اسم المرسل إليه قبل كتابة الرسالة."),
    t("Relis le message et le nom du fichier avant d’envoyer.", "راجع الرسالة واسم الملف قبل الإرسال."),
  ],
  5: [t("Dans Excel, clique une fois sur une cellule.", "في Excel انقر مرة واحدة على خلية."), t("Écris la donnée puis appuie sur Entrée.", "اكتب المعطى ثم اضغط Enter."), t("Ctrl + S enregistre ton classeur.", "يحفظ Ctrl + S المصنف.")],
  6: [t("Clique la cellule où le résultat doit apparaître.", "انقر الخلية التي ستظهر فيها النتيجة."), t("Toute formule commence par =.", "تبدأ كل صيغة بعلامة =."), t("Recopie avec le petit carré au coin de la cellule.", "انسخ باستعمال المربع الصغير في زاوية الخلية.")],
  7: [t("Clique la cellule du résultat.", "انقر خلية النتيجة."), t("Tape = puis le nom de la fonction.", "اكتب = ثم اسم الدالة."), t("Sélectionne la plage avec la souris et valide par Entrée.", "حدد المجال بالفأرة ثم أكد بـEnter.")],
  8: [t("Sélectionne d’abord le tableau sans les lignes vides.", "حدد الجدول أولا دون الصفوف الفارغة."), t("Ouvre Insertion puis choisis un graphique.", "افتح Insertion ثم اختر مبيانا."), t("Ajoute un titre lisible avant de sauvegarder.", "أضف عنوانا واضحا قبل الحفظ.")],
  9: [t("Écris le test avec un seul seuil.", "اكتب الاختبار بعتبة واحدة."), t("Teste une valeur au-dessus et une valeur au-dessous.", "اختبر قيمة فوق العتبة وأخرى تحتها."), t("Ne recopie qu’après avoir vérifié la première formule.", "لا تنسخ قبل التحقق من الصيغة الأولى.")],
  10: [t("Lis le cahier des charges avant d’ouvrir Excel.", "اقرأ دفتر التحملات قبل فتح Excel."), t("Crée et renomme les trois feuilles dès le début.", "أنشئ الأوراق الثلاث وسمها منذ البداية."), t("Enregistre une première version avant les calculs.", "احفظ نسخة أولى قبل الحسابات.")],
  11: [t("Clique dans la zone de commande de Logo.NET.", "انقر داخل خانة الأوامر في Logo.NET."), t("Sépare la commande et le nombre par un espace.", "افصل بين التعليمة والعدد بمسافة."), t("Appuie sur Entrée et observe avant d’ajouter une autre commande.", "اضغط Enter ولاحظ النتيجة قبل إضافة تعليمة أخرى.")],
  12: [t("Teste une figure courte avant la composition complète.", "اختبر شكلا قصيرا قبل التركيب الكامل."), t("Une commande par ligne facilite la correction.", "تعليمة واحدة في كل سطر تسهل التصحيح."), t("Enregistre dès que la première figure fonctionne.", "احفظ بمجرد نجاح الشكل الأول.")],
  13: [t("Repère d’abord les commandes qui se répètent.", "حدد أولا التعليمات المتكررة."), t("Place uniquement ce bloc entre crochets.", "ضع الكتلة المتكررة فقط بين معقوفين."), t("Teste avec 2 répétitions avant d’augmenter.", "اختبر بتكرارين قبل الزيادة.")],
  14: [t("Crée une seule procédure à la fois.", "أنشئ إجراء واحدا في كل مرة."), t("Teste-la immédiatement en écrivant son nom.", "اختبره فورا بكتابة اسمه."), t("Assemble les procédures seulement lorsqu’elles fonctionnent seules.", "ركب الإجراءات فقط بعد نجاح كل واحد منفردا.")],
  15: [t("Fais d’abord un croquis sur papier.", "أنجز أولا تصميما على الورق."), t("Programme un élément, teste-le, puis continue.", "برمج عنصرا واختبره ثم واصل."), t("Sauvegarde les versions 1, 2 et finale.", "احفظ النسخ 1 و2 والنهائية.")],
};

export const photoChallenges: Record<number, PhotoChallenge> = {
  1: { kind: t("Repérer", "تحديد"), image: photos.workstation, prompt: t("Sur un vrai poste, quel objet déplace la flèche à l’écran ?", "في حاسوب حقيقي، ما الأداة التي تحرك السهم على الشاشة؟"), choices: [t("La souris", "الفأرة"), t("L’écran", "الشاشة"), t("L’unité centrale", "الوحدة المركزية")], answer: 0, feedback: t("La souris déplace le pointeur ; son bouton gauche sert à choisir.", "تحرك الفأرة المؤشر ويستعمل زرها الأيسر للاختيار.") },
  2: { kind: t("Identifier", "تعرف"), image: photos.motherboard, prompt: t("Dans l’unité centrale, quel composant exécute les calculs ?", "داخل الوحدة المركزية، ما المكون الذي ينفذ الحسابات؟"), choices: [t("Le processeur", "المعالج"), t("Le haut-parleur", "مكبر الصوت"), t("La souris", "الفأرة")], answer: 0, feedback: t("Le processeur traite les instructions ; la RAM garde temporairement les données.", "يعالج المعالج التعليمات بينما تحفظ RAM البيانات مؤقتا.") },
  3: { kind: t("Choisir le geste", "اختيار الحركة"), image: photos.workstation, prompt: t("Tu viens de terminer un fichier. Quelle action fais-tu avant de quitter ?", "أنهيت ملفا. ما أول خطوة قبل الخروج؟"), choices: [t("Ctrl + S", "Ctrl + S"), t("Débrancher le câble", "فصل السلك"), t("Éteindre l’écran", "إطفاء الشاشة")], answer: 0, feedback: t("Ctrl + S sauvegarde le travail avant de fermer la fenêtre.", "يحفظ Ctrl + S العمل قبل إغلاق النافذة.") },
  4: { kind: t("Diagnostiquer", "تشخيص"), image: photos.network, prompt: t("Internet est coupé, mais les postes sont reliés au même réseau. BeeBEEP peut-il encore envoyer un message ?", "الإنترنت منقطع لكن الحواسيب في نفس الشبكة. هل يستطيع BeeBEEP إرسال رسالة؟"), choices: [t("Oui, par le réseau local", "نعم عبر الشبكة المحلية"), t("Non, jamais", "لا أبدا"), t("Seulement par Bluetooth", "فقط عبر Bluetooth")], answer: 0, feedback: t("BeeBEEP utilise le réseau local de la salle ; Internet n’est pas nécessaire.", "يستعمل BeeBEEP الشبكة المحلية للقاعة ولا يحتاج إلى الإنترنت.") },
  5: { kind: t("Lire une situation", "قراءة وضعية"), image: photos.budget, prompt: t("Pour préparer un budget, quelle information doit être saisie dans une cellule séparée ?", "لإعداد ميزانية، ما المعلومة التي يجب إدخالها في خلية مستقلة؟"), choices: [t("Chaque prix", "كل ثمن"), t("Toute la phrase", "الجملة كاملة"), t("Le nom des élèves ensemble", "أسماء التلاميذ مجتمعة")], answer: 0, feedback: t("Une cellule contient une donnée claire : désignation, quantité ou prix.", "تحتوي الخلية معطى واضحا: البيان أو الكمية أو الثمن.") },
  6: { kind: t("Calculer", "حساب"), image: photos.budget, prompt: t("Une facture contient Quantité et Prix unitaire. Quelle formule calcule le montant ?", "تتضمن الفاتورة الكمية والثمن الفردي. ما الصيغة التي تحسب المبلغ؟"), choices: [t("Quantité × Prix", "الكمية × الثمن"), t("Quantité + Prix", "الكمية + الثمن"), t("Prix ÷ Quantité", "الثمن ÷ الكمية")], answer: 0, feedback: t("Le montant d’une ligne est la quantité multipliée par le prix unitaire.", "مبلغ السطر هو الكمية مضروبة في الثمن الفردي.") },
  7: { kind: t("Choisir une fonction", "اختيار دالة"), image: photos.data, prompt: t("Pour repérer le meilleur score d’un tournoi, quelle fonction utilises-tu ?", "لتحديد أعلى نتيجة في دوري، ما الدالة التي ستستعملها؟"), choices: [t("MAX", "MAX"), t("MIN", "MIN"), t("MOYENNE", "MOYENNE")], answer: 0, feedback: t("MAX renvoie la plus grande valeur de la plage choisie.", "تعيد MAX أكبر قيمة في المجال المحدد.") },
  8: { kind: t("Choisir un graphique", "اختيار مبيان"), image: photos.data, prompt: t("Quel graphique montre le mieux l’évolution d’une consommation sur 12 mois ?", "ما المبيان الأنسب لإظهار تطور الاستهلاك خلال 12 شهرا؟"), choices: [t("Une courbe", "منحنى"), t("Une image décorative", "صورة للزينة"), t("Une seule cellule", "خلية واحدة")], answer: 0, feedback: t("Une courbe rend l’évolution dans le temps facile à lire.", "يسهل المنحنى قراءة التطور عبر الزمن.") },
  9: { kind: t("Décider", "اتخاذ قرار"), image: photos.data, prompt: t("Le seuil est 10 et la note est 12. Que doit afficher la formule SI ?", "العتبة 10 والنقطة 12. ماذا يجب أن تعرض صيغة SI؟"), choices: [t("Objectif atteint", "تم بلوغ الهدف"), t("À renforcer", "يحتاج دعما"), t("Erreur", "خطأ")], answer: 0, feedback: t("12 est supérieur ou égal à 10 : la condition est vraie.", "12 أكبر من أو يساوي 10، إذن الشرط صحيح.") },
  10: { kind: t("Contrôler", "مراقبة"), image: photos.data, prompt: t("Avant de présenter ce tableau de bord, que faut-il tester en priorité ?", "قبل عرض لوحة القيادة، ما الذي يجب اختباره أولا؟"), choices: [t("Les formules", "الصيغ"), t("Le fond d’écran", "خلفية الشاشة"), t("La taille de la souris", "حجم الفأرة")], answer: 0, feedback: t("On teste les calculs avec plusieurs valeurs avant de soigner la présentation.", "نختبر الحسابات بقيم مختلفة قبل تحسين العرض.") },
  11: { kind: t("Prévoir", "توقع"), image: photos.code, prompt: t("La tortue doit avancer de 50 pas. Quelle commande écris-tu ?", "يجب أن تتقدم السلحفاة 50 خطوة. ما التعليمة المناسبة؟"), choices: [t("AV 50", "AV 50"), t("TD 50", "TD 50"), t("RE 90", "RE 90")], answer: 0, feedback: t("AV modifie la position de la tortue dans sa direction actuelle.", "تغير AV موقع السلحفاة في اتجاهها الحالي.") },
  12: { kind: t("Mesurer", "قياس"), image: photos.geometry, prompt: t("Tu veux programmer une fenêtre carrée inspirée de cette façade. Quel angle répéter ?", "تريد برمجة نافذة مربعة مستوحاة من الواجهة. ما الزاوية المتكررة؟"), choices: [t("90°", "90°"), t("45°", "45°"), t("120°", "120°")], answer: 0, feedback: t("Le carré possède quatre angles droits : on tourne de 90° après chaque côté.", "للمربع أربع زوايا قائمة: ندور 90° بعد كل ضلع.") },
  13: { kind: t("Repérer la répétition", "تحديد التكرار"), image: photos.geometry, prompt: t("Une rosace possède 8 branches identiques. Quelle structure raccourcit le programme ?", "للوردة 8 فروع متطابقة. ما البنية التي تختصر البرنامج؟"), choices: [t("REPETE 8", "REPETE 8"), t("Écrire 8 fichiers", "كتابة 8 ملفات"), t("Éteindre puis recommencer", "الإطفاء وإعادة البدء")], answer: 0, feedback: t("Une boucle répète le même bloc et rend le programme plus court.", "تكرر الحلقة نفس الكتلة وتجعل البرنامج أقصر.") },
  14: { kind: t("Décomposer", "تفكيك"), image: photos.geometry, prompt: t("Le même motif apparaît plusieurs fois. Quelle méthode rend le programme clair ?", "تظهر نفس الزخرفة مرات عديدة. ما الطريقة التي تجعل البرنامج واضحا؟"), choices: [t("Créer une procédure", "إنشاء إجراء"), t("Tout recopier", "نسخ كل شيء"), t("Supprimer le motif", "حذف الزخرفة")], answer: 0, feedback: t("Une procédure nomme un motif que l’on peut appeler plusieurs fois.", "يعطي الإجراء اسما لزخرفة يمكن استدعاؤها عدة مرات.") },
  15: { kind: t("Planifier", "تخطيط"), image: photos.city, prompt: t("Avant de programmer cette ville, quelle première action évite de se perdre ?", "قبل برمجة هذه المدينة، ما أول خطوة لتجنب الضياع؟"), choices: [t("Faire un croquis", "إنجاز تصميم"), t("Écrire au hasard", "الكتابة عشوائيا"), t("Choisir seulement les couleurs", "اختيار الألوان فقط")], answer: 0, feedback: t("Le croquis permet de découper la scène en formes et procédures simples.", "يسمح التصميم بتقسيم المشهد إلى أشكال وإجراءات بسيطة.") },
};
