"use client";

import { publicAsset } from "../lib/public-assets";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Calculator, Check, Copy, FileText, Folder, FolderPlus, ImageIcon, Minus, Monitor, Pencil, RotateCcw, Scissors, Search, Trash2, X } from "lucide-react";
import type { LocalizedText } from "./course-data";
import { session3, session3Schedule } from "./session3-data";
import { Session3Text } from "./session3-translation";
import { initialSystemLabState, systemLabChecks, type LabFile, type SystemLabState } from "./session3-system-model";
import "./session3.css";

const t = (fr: string, ar: string): LocalizedText => ({ fr, ar });
let nextFileId = 0;
const createLabId = () => `lab-${Date.now().toString(36)}-${++nextFileId}`;
function CopyText({ value }: { value: LocalizedText }) {
  return <Session3Text value={value} />;
}

export function Session3Overview() {
  return <div className="s3-overview">
    <section className="s3-intro">
      <span className="card-kicker"><CopyText value={t("SÉANCE 3", "الحصة 3")} /></span>
      <h2><CopyText value={t("Je me rappelle, puis je prends les commandes", "أتذكر ثم أتحكم في الحاسوب")} /></h2>
      <p><CopyText value={t("25 min pour réactiver les séances 1 et 2. Puis je comprends le système d’exploitation et je manipule Windows.", "25 دقيقة لاستحضار الحصتين 1 و2، ثم أفهم نظام التشغيل وأستعمل Windows.")} /></p>
      <div className="s3-competence"><CopyText value={t("C31 · Utiliser l’interface graphique pour interagir avec le système informatique.", "C31 · أستعمل الواجهة الرسومية للتفاعل مع النظام المعلوماتي.")} /></div>
    </section>
    <section className="content-card s3-situation">
      <h2><CopyText value={t("Le défi de Sara", "تحدي سارة")} /></h2>
      <p><CopyText value={session3.situation} /></p>
      <strong><CopyText value={t("Le matériel seul suffit-il ? À quoi sert le système d’exploitation ?", "هل تكفي المعدات وحدها؟ وما دور نظام التشغيل؟")} /></strong>
    </section>
    <section className="content-card s3-schedule">
      <h2><CopyText value={t("Notre parcours de 2 heures", "مسارنا خلال ساعتين")} /></h2>
      <ol>{session3Schedule.map((step) => <li key={step.time}><time>{step.time} min</time><CopyText value={step.title} /><strong>{step.minutes} min</strong></li>)}</ol>
    </section>
    <aside className="s3-native-note"><Monitor size={22} /><CopyText value={t("Je m’entraîne dans la simulation, puis je refais les gestes sur Windows. Avec mon binôme, j’échange les rôles : chacun manipule et explique.", "أتدرب في المحاكاة ثم أعيد الحركات في Windows. أتبادل الأدوار مع زميلي: يستعمل كل واحد الحاسوب ويشرح.")} /></aside>
  </div>;
}

const windowTasks = [
  t("Ouvre la Calculatrice depuis Démarrer.", "افتح الحاسبة انطلاقا من ابدأ."),
  t("Déplace la fenêtre par son titre (ou ↔).", "حرك النافذة من عنوانها أو باستعمال ↔."),
  t("Réduis la fenêtre avec −.", "صغر النافذة بالزر −."),
  t("Retrouve-la dans la barre des tâches.", "أظهرها مجددا من شريط المهام."),
  t("Depuis Démarrer, ouvre l’Explorateur de fichiers.", "افتح مستكشف الملفات انطلاقا من ابدأ."),
  t("Passe de l’Explorateur à la Calculatrice par la barre des tâches.", "انتقل من مستكشف الملفات إلى الحاسبة عبر شريط المهام."),
];
const fileTasks = [
  t("Crée les dossiers du modèle.", "أنشئ المجلدات كما في النموذج."),
  t("Range la photo dans Images. Nomme-la Photo_club.jpg.", "ضع الصورة في Images وسمها Photo_club.jpg."),
  t("Range le texte dans Documents. Nomme-le Compte_rendu.txt.", "ضع النص في Documents وسمه Compte_rendu.txt."),
  t("Crée une copie du texte dans Travaux.", "أنشئ نسخة من النص في Travaux."),
  t("Depuis le dossier d’exercice, recherche Photo_club.jpg.", "ابحث عن Photo_club.jpg انطلاقا من مجلد التمرين."),
  t("Supprime brouillon.txt, puis restaure-le depuis la Corbeille.", "احذف brouillon.txt ثم استعده من سلة المحذوفات."),
];

export function Session3SystemLab({ mode, initialState, onStateChange, onValidate }: {
  mode: "windows" | "files";
  initialState?: SystemLabState;
  onStateChange: (state: SystemLabState) => void;
  onValidate: (state: SystemLabState, checks: boolean[]) => void;
}) {
  const [state, setState] = useState<SystemLabState>(initialState ?? initialSystemLabState);
  const [startOpen, setStartOpen] = useState(false);
  const [dialog, setDialog] = useState<"folder" | "rename" | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<LocalizedText | null>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  useEffect(() => onStateChange(state), [state, onStateChange]);
  const checks = systemLabChecks(mode, state);
  const tasks = mode === "windows" ? windowTasks : fileTasks;
  const nextMission = checks.findIndex((done) => !done);
  const current = state.files.find((f) => f.id === state.selection);
  const inTrash = state.folder === "trash";
  const withFlag = (flags: string[], flag: string) => [...new Set([...flags, flag])];

  function openApp(app: "calculator" | "explorer", fromStart = false) {
    setState((s) => {
      let flags = s.flags;
      if (fromStart) flags = withFlag(flags, `opened-${app}`);
      if (app === "calculator" && s.minimized && s.apps.calculator) flags = withFlag(flags, "restored");
      if (s.active === "explorer" && app === "calculator") flags = withFlag(flags, "switched");
      return { ...s, flags, apps: { ...s.apps, [app]: true }, active: app, minimized: app === "calculator" ? false : s.minimized };
    });
    setStartOpen(false);
  }

  function moveWindow(x: number, y: number) {
    setState((s) => ({ ...s, position: { x: Math.max(0, Math.min(230, x)), y: Math.max(0, Math.min(180, y)) }, flags: s.active === "calculator" ? withFlag(s.flags, "moved") : s.flags }));
  }

  function navigate(folder: string) {
    setState((s) => ({ ...s, folder, selection: null, search: "" })); setMessage(null);
  }
  function ancestors(id: string): LabFile[] {
    const found = state.files.find((f) => f.id === id);
    return found ? [...ancestors(found.parent), found] : [];
  }
  const breadcrumb = ancestors(state.folder);
  function inFolder(file: LabFile, folder: string): boolean {
    return file.parent === folder || (file.parent !== "root" && Boolean(state.files.find((f) => f.id === file.parent && inFolder(f, folder))));
  }
  const visible = state.files.filter((f) => inTrash ? f.deleted : !f.deleted && (state.search.trim() ? inFolder(f, state.folder) && f.name.toLocaleLowerCase().includes(state.search.trim().toLocaleLowerCase()) : f.parent === state.folder));

  function saveName() {
    const proposed = name.trim();
    if (!proposed || /[\\/:*?"<>|]/.test(proposed) || proposed === "." || proposed === ".." || /[. ]$/.test(proposed)) { setMessage(t("Choisis un nom valide, sans / ni caractères réservés.", "اختر اسما صالحا دون / أو الرموز المحجوزة.")); return; }
    if (dialog === "rename" && current && current.kind !== "folder" && proposed.split(".").pop()?.toLowerCase() !== current.name.split(".").pop()?.toLowerCase()) { setMessage(t("Conserve l’extension du fichier : .jpg ou .txt.", "حافظ على امتداد الملف: .jpg أو .txt.")); return; }
    const parent = dialog === "rename" && current ? current.parent : state.folder;
    if (state.files.some((f) => !f.deleted && f.parent === parent && f.name.toLocaleLowerCase() === proposed.toLocaleLowerCase() && (dialog !== "rename" || f.id !== current?.id))) { setMessage(t("Ce nom existe déjà dans ce dossier.", "هذا الاسم موجود في هذا المجلد.")); return; }
    setState((s) => ({ ...s, selection: null, files: dialog === "rename" ? s.files.map((f) => f.id === s.selection ? { ...f, name: proposed } : f) : [...s.files, { id: createLabId(), parent: s.folder, name: proposed, kind: "folder" }] }));
    setDialog(null); setMessage(null); setName("");
  }

  function paste() {
    const clipboard = state.clipboard;
    const source = state.files.find((f) => f.id === clipboard?.id && !f.deleted);
    if (!source || !clipboard || inTrash) return;
    if (state.files.some((f) => !f.deleted && f.parent === state.folder && f.name.toLocaleLowerCase() === source.name.toLocaleLowerCase())) { setMessage(t("Un fichier de ce nom existe déjà ici. Choisis un autre dossier.", "يوجد ملف بهذا الاسم هنا. اختر مجلدا آخر.")); return; }
    setState((s) => ({ ...s, selection: null, clipboard: clipboard.cut ? null : clipboard, files: clipboard.cut ? s.files.map((f) => f.id === source.id ? { ...f, parent: s.folder } : f) : [...s.files, { ...source, id: createLabId(), parent: s.folder }] }));
    setMessage(null);
  }

  const explorer = <div className="s3-explorer">
    <div className="s3-file-toolbar">
      <button type="button" disabled={inTrash || Boolean(state.search)} onClick={() => { setDialog("folder"); setName(""); setMessage(null); }}><FolderPlus size={18} /><CopyText value={t("Nouveau dossier", "مجلد جديد")} /></button>
      <button type="button" disabled={!current || current.kind === "folder" || inTrash} onClick={() => { setState((s) => ({ ...s, clipboard: { id: current!.id, cut: false } })); setMessage(t("Fichier copié : ouvre le dossier de destination, puis colle.", "تم نسخ الملف: افتح مجلد الوجهة ثم ألصق.")); }}><Copy size={18} /><CopyText value={t("Copier", "نسخ")} /></button>
      <button type="button" disabled={!current || current.kind === "folder" || inTrash} onClick={() => { setState((s) => ({ ...s, clipboard: { id: current!.id, cut: true } })); setMessage(t("Fichier coupé : ouvre le dossier de destination, puis colle.", "تم قص الملف: افتح مجلد الوجهة ثم ألصق.")); }}><Scissors size={18} /><CopyText value={t("Couper", "قص")} /></button>
      <button type="button" disabled={!state.clipboard || inTrash || Boolean(state.search)} onClick={paste}><FileText size={18} /><CopyText value={t("Coller", "لصق")} /></button>
      <button type="button" disabled={!current || inTrash} onClick={() => { setDialog("rename"); setName(current!.name); setMessage(null); }}><Pencil size={18} /><CopyText value={t("Renommer", "إعادة تسمية")} /></button>
      <button type="button" disabled={!current || current.kind === "folder" || inTrash} onClick={() => setState((s) => ({ ...s, selection: null, files: s.files.map((f) => f.id === s.selection ? { ...f, deleted: true } : f), flags: current?.id === "draft" ? withFlag(s.flags, "deleted-draft") : s.flags }))}><Trash2 size={18} /><CopyText value={t("Supprimer", "حذف")} /></button>
      <button type="button" disabled={!current || !inTrash} onClick={() => setState((s) => ({ ...s, selection: null, files: s.files.map((f) => f.id === s.selection ? { ...f, deleted: false } : f), flags: current?.id === "draft" ? withFlag(s.flags, "restored-draft") : s.flags }))}><RotateCcw size={18} /><CopyText value={t("Restaurer", "استعادة")} /></button>
    </div>
    <div className="s3-file-address">
      <button type="button" disabled={state.folder === "root"} aria-label="Dossier parent / المجلد الأب" onClick={() => navigate(state.files.find((f) => f.id === state.folder)?.parent ?? "root")}><ArrowLeft size={18} /></button>
      <div className="s3-breadcrumb"><button type="button" onClick={() => navigate("root")}>Exercice</button>{inTrash ? <span> / Corbeille</span> : breadcrumb.map((f) => <span key={f.id}> / <button type="button" onClick={() => navigate(f.id)}>{f.name}</button></span>)}</div>
      <button type="button" className={inTrash ? "active" : ""} onClick={() => navigate(inTrash ? "root" : "trash")}><Trash2 size={16} /><CopyText value={inTrash ? t("Exercice", "التمرين") : t("Corbeille", "السلة")} /></button>
    </div>
    {!inTrash && <form className="s3-search" onSubmit={(event) => {
      event.preventDefault();
      const found = visible.some((f) => f.id === "photo" && f.name === "Photo_club.jpg");
      if (found && state.folder === "root" && state.search.trim().toLowerCase() === "photo_club.jpg") {
        setState((s) => ({ ...s, flags: withFlag(s.flags, "searched-photo") }));
        setMessage(t("Recherche réussie : tu as retrouvé Photo_club.jpg.", "بحث ناجح: عثرت على Photo_club.jpg."));
      } else setMessage(t(`${visible.length} résultat(s). Pour la mission, recherche Photo_club.jpg depuis Exercice.`, `${visible.length} نتيجة. لإنجاز المهمة ابحث عن Photo_club.jpg انطلاقا من Exercice.`));
    }}><Search size={17} /><input aria-label="Rechercher un fichier / البحث عن ملف" placeholder="Rechercher ici…" value={state.search} onChange={(event) => setState((s) => ({ ...s, search: event.target.value, selection: null }))} /><button type="submit"> <CopyText value={t("Rechercher", "بحث")} /></button></form>}
    {dialog && <form className="s3-name-form" onSubmit={(event) => { event.preventDefault(); saveName(); }}>
      <label><CopyText value={dialog === "folder" ? t("Nom du nouveau dossier", "اسم المجلد الجديد") : t("Nouveau nom (garde l’extension)", "الاسم الجديد مع الحفاظ على الامتداد")} /><input autoFocus value={name} onFocus={(event) => event.currentTarget.select()} onChange={(event) => setName(event.target.value)} /></label>
      <button type="submit"><CopyText value={t("Valider", "تأكيد")} /></button><button type="button" onClick={() => setDialog(null)}><CopyText value={t("Annuler", "إلغاء")} /></button>
    </form>}
    <div className="s3-file-list" aria-label="Contenu du dossier / محتويات المجلد">
      {!visible.length && <p><CopyText value={t("Ce dossier est vide.", "هذا المجلد فارغ.")} /></p>}
      {visible.map((file) => <div className={`s3-file ${state.selection === file.id ? "selected" : ""} ${state.clipboard?.id === file.id && state.clipboard.cut ? "cut" : ""}`} key={file.id}>
        <button type="button" aria-pressed={state.selection === file.id} onClick={() => { setState((s) => ({ ...s, selection: file.id })); setMessage(null); }} onDoubleClick={() => file.kind === "folder" && !inTrash ? navigate(file.id) : setMessage(t("Fichier sélectionné. Utilise la barre d’outils pour agir.", "تم تحديد الملف. استعمل شريط الأدوات لإنجاز العملية."))}>
          {file.kind === "folder" ? <Folder size={29} /> : file.kind === "image" ? <ImageIcon size={27} /> : <FileText size={27} />}<span>{file.name}</span><small><CopyText value={file.kind === "folder" ? t("Dossier", "مجلد") : file.kind === "image" ? t("Image", "صورة") : t("Texte", "نص")} /></small>
        </button>
        {file.kind === "folder" && !inTrash && <button type="button" className="s3-open-folder" onClick={() => navigate(file.id)}><CopyText value={t("Ouvrir", "فتح")} /></button>}
      </div>)}
    </div>
    <div className="s3-file-status"><CopyText value={t(`${visible.length} élément(s)`, `${visible.length} عنصر`)} /> · {current?.name ?? <CopyText value={t("Sélectionne un élément", "حدد عنصرا")} />}</div>
  </div>;

  return <section className="s3-system-lab">
    <div className="s3-simulation-label"><Monitor size={17} /><CopyText value={t("Simulation d’entraînement · puis application sur ton poste Windows", "محاكاة للتدريب · ثم تطبيق على حاسوب Windows")} /></div>
    <div className={`s3-current-mission ${nextMission === -1 ? "done" : ""}`} role="status">
      <strong>{nextMission === -1 ? <Check size={20} /> : `${nextMission + 1} / ${tasks.length}`}</strong>
      <CopyText value={nextMission === -1 ? t("Toutes les missions sont réalisées. Vérifie ton travail.", "أنجزت جميع المهام. تحقق من عملك.") : tasks[nextMission]} />
    </div>
    {mode === "files" && nextMission === 0 && <figure className="s3-folder-model"><img src={publicAsset("session3/visuels/arborescence.svg")} alt="2AC_G01 / Informatique / Travaux, avec les sous-dossiers Images et Documents" /></figure>}
    <details className="s3-missions-details"><summary><CopyText value={t("Voir les 6 missions", "عرض المهام الست")} /></summary><ol className="s3-task-list">{tasks.map((task, i) => <li className={checks[i] ? "done" : ""} key={task.fr}><span>{checks[i] ? <Check size={16} /> : i + 1}</span><CopyText value={task} /></li>)}</ol></details>
    {mode === "files" ? explorer : <div className="s3-desktop">
      <div className="s3-desktop-label"><Monitor size={24} /><span><CopyText value={t("Bureau", "سطح المكتب")} /></span></div>
      {state.active && (state.active !== "calculator" || !state.minimized) && <div className={`s3-app-window ${state.active === "explorer" ? "explorer" : "calculator"}`} style={{ left: `min(${state.position.x}px, max(0px, calc(100% - 330px)))`, top: state.position.y }}>
        <div className="s3-titlebar" onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) return;
          drag.current = { x: event.clientX, y: event.clientY, left: state.position.x, top: state.position.y }; event.currentTarget.setPointerCapture(event.pointerId);
        }} onPointerMove={(event) => { if (drag.current) { const dx = event.clientX - drag.current.x; const dy = event.clientY - drag.current.y; if (Math.abs(dx) + Math.abs(dy) > 5) moveWindow(drag.current.left + dx, drag.current.top + dy); } }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
          <span>{state.active === "calculator" ? <Calculator size={16} /> : <Folder size={16} />}<CopyText value={state.active === "calculator" ? t("Calculatrice", "الحاسبة") : t("Explorateur", "المستكشف")} /></span>
          <div><button type="button" title="Déplacer la fenêtre / تحريك النافذة" onClick={() => moveWindow(state.position.x > 100 ? 30 : 135, state.position.y > 80 ? 25 : 105)}>↔</button><button type="button" aria-label="Réduire / تصغير" onClick={() => setState((s) => ({ ...s, active: null, minimized: s.active === "calculator" ? true : s.minimized, flags: s.active === "calculator" ? withFlag(s.flags, "minimized") : s.flags }))}><Minus size={17} /></button><button type="button" aria-label="Fermer / إغلاق" onClick={() => setState((s) => ({ ...s, active: null, apps: { ...s.apps, [s.active!]: false } }))}><X size={17} /></button></div>
        </div>
        {state.active === "calculator" ? <div className="s3-calculator"><strong>2 × 1 000</strong><output>2 000</output><p>Go → Mo</p><small><CopyText value={t("Application ouverte", "التطبيق مفتوح")} /></small></div> : <div className="s3-explorer-home"><Folder size={48} /><h3><CopyText value={t("Explorateur de fichiers", "مستكشف الملفات")} /></h3><span><CopyText value={t("Documents · Images · Téléchargements", "مستندات · صور · تنزيلات")} /></span></div>}
      </div>}
      {startOpen && <div className="s3-start-menu"><strong><CopyText value={t("Démarrer", "ابدأ")} /></strong><button type="button" onClick={() => openApp("calculator", true)}><Calculator size={24} /><CopyText value={t("Calculatrice", "الحاسبة")} /></button><button type="button" onClick={() => openApp("explorer", true)}><Folder size={24} /><CopyText value={t("Explorateur de fichiers", "مستكشف الملفات")} /></button></div>}
      <div className="s3-taskbar"><button type="button" className="s3-start-button" onClick={() => setStartOpen((s) => !s)} aria-expanded={startOpen}><Monitor size={22} /><CopyText value={t("Démarrer", "ابدأ")} /></button>{state.apps.calculator && <button type="button" className={state.active === "calculator" ? "active" : ""} onClick={() => openApp("calculator")}><Calculator size={20} /><CopyText value={t("Calculatrice", "الحاسبة")} /></button>}{state.apps.explorer && <button type="button" className={state.active === "explorer" ? "active" : ""} onClick={() => openApp("explorer")}><Folder size={20} /><CopyText value={t("Explorateur", "المستكشف")} /></button>}</div>
    </div>}
    {message && <p className="s3-lab-message" role="status"><CopyText value={message} /></p>}
    <div className="s3-lab-validation"><strong>{checks.filter(Boolean).length} / {checks.length} missions</strong><button type="button" onClick={() => onValidate(state, checks)}><Check size={18} /><CopyText value={t("Vérifier mes missions", "أتحقق من مهامي")} /></button></div>
    {mode === "files" && <aside className="s3-native-note"><Monitor size={20} /><div><CopyText value={t("Sur Windows : extrais le ZIP dans Documents. Refais les missions avec le nom de ton groupe.", "في Windows: استخرج ZIP داخل Documents. أعد المهام باسم مجموعتك.")} /><a href="session3/fichiers-exercice-seance3.zip" download><CopyText value={t("Télécharger les fichiers d’exercice", "تحميل ملفات التمرين")} /></a></div></aside>}
  </section>;
}
