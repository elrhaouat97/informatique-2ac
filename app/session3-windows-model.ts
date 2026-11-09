import type { LocalizedText } from "./course-data.ts";

const t = (fr: string, ar: string): LocalizedText => ({ fr, ar });
export type WindowsMode = "desktop" | "copy" | "move" | "restore" | "rename" | "project" | "assessment";
export type WindowsApp = "explorer" | "calculator" | "notepad";
export type VirtualFile = { id: string; parent: string; name: string; kind: "folder" | "text" | "image" | "audio" | "video"; origin?: string; content?: string; media?: string; deleted?: boolean; protected?: boolean };
export type AppWindow = { open: boolean; minimized: boolean; maximized: boolean; x: number; y: number; z: number };
export type WindowsState = { version: 1; mode: WindowsMode; nodes: VirtualFile[]; folder: string; selected: string | null; clipboard: { id: string; cut: boolean } | null; windows: Record<WindowsApp, AppWindow>; active: WindowsApp | null; flags: string[]; nextId: number; message: LocalizedText | null };
export type WindowsAction =
  | { type: "reset" }
  | { type: "open" | "focus" | "minimize" | "maximize" | "close"; app: WindowsApp }
  | { type: "position"; app: WindowsApp; x: number; y: number }
  | { type: "calculation"; expression: string; result: number }
  | { type: "navigate"; folder: string }
  | { type: "select"; id: string | null }
  | { type: "clipboard"; id: string; cut: boolean }
  | { type: "paste"; parent?: string }
  | { type: "folder" | "text"; parent?: string; name: string; content?: string }
  | { type: "rename"; id: string; name: string }
  | { type: "delete" | "restore"; id: string }
  | { type: "message"; message: LocalizedText | null };

const folder = (id: string, name: string): VirtualFile => ({ id, parent: "home", name, kind: "folder", protected: true });
const photo = (id: string, parent: string, name: string): VirtualFile => ({ id, parent, name, kind: "image", origin: "club-photo", media: "session2/items/unite-centrale-lenovo.jpg" });
const note = (id: string, parent: string, name: string, content: string): VirtualFile => ({ id, parent, name, kind: "text", origin: "club-invitation", content });
const windowDefaults = (x: number, y: number): AppWindow => ({ open: false, minimized: false, maximized: false, x, y, z: 1 });

export function createWindowsState(mode: WindowsMode): WindowsState {
  const nodes: VirtualFile[] = [folder("desktop", "Bureau"), folder("documents", "Documents"), folder("images", "Images"), folder("downloads", "Téléchargements")];
  if (mode === "copy") nodes.push({ id: "publication", parent: "documents", name: "Publication", kind: "folder" }, photo("source-photo", "images", "Photo_club.jpg"));
  else if (mode === "move") nodes.push({ id: "radio", parent: "documents", name: "Radio", kind: "folder" }, { id: "source-audio", parent: "downloads", name: "audio001.wav", kind: "audio", origin: "club-audio", media: "session3/medias/message-sonore.wav" });
  else if (mode === "restore") nodes.push({ ...note("lost-note", "documents", "consignes.txt", "Club informatique\nObserver le matériel. Préparer une affiche. Ranger les fichiers dans Documents."), deleted: true });
  else if (mode === "rename") nodes.push(photo("source-photo", "images", "IMG_0007.jpg"));
  else if (mode === "project") nodes.push(photo("source-photo", "downloads", "Photo_club.jpg"), note("source-note", "documents", "Invitation.txt", "Invitation au club informatique\nVendredi à 16 h, salle informatique. Apporte tes idées !"));
  else if (mode === "assessment") nodes.push(photo("source-photo", "downloads", "Photo_club.jpg"), note("source-note", "documents", "Consigne.txt", "Présenter le club informatique aux nouveaux élèves."), { ...note("lost-note", "documents", "Brouillon.txt", "Premières idées pour notre affiche du club."), origin: "club-draft", deleted: true });
  else nodes.push(photo("source-photo", "images", "Photo_club.jpg"), note("source-note", "documents", "Bienvenue.txt", "Bienvenue dans le bureau d’entraînement.\nTu peux écrire, enregistrer et organiser tes fichiers."));
  const windows = { explorer: windowDefaults(35, 35), calculator: windowDefaults(100, 45), notepad: windowDefaults(70, 65) };
  if (mode !== "desktop") windows.explorer.open = true;
  return { version: 1, mode, nodes, folder: "home", selected: null, clipboard: null, windows, active: mode === "desktop" ? null : "explorer", flags: [], nextId: 1, message: null };
}

/** Local drafts are optional: reject damaged data rather than crashing the lesson. */
export function isWindowsState(value: unknown, mode: WindowsMode): value is WindowsState {
  if (!value || typeof value !== "object") return false;
  const s = value as WindowsState;
  const apps = ["explorer", "calculator", "notepad"];
  if (s.version !== 1 || s.mode !== mode || !Array.isArray(s.nodes) || s.nodes.length < 4 || s.nodes.length > 100 || !Array.isArray(s.flags) || !s.flags.every(f => typeof f === "string") || !Number.isSafeInteger(s.nextId) || s.nextId < 1 || !s.windows) return false;
  if (!apps.every(app => {
    const w = s.windows[app as WindowsApp];
    return w && [w.open,w.minimized,w.maximized].every(v => typeof v === "boolean") && [w.x,w.y,w.z].every(Number.isFinite);
  }) || (s.active !== null && !apps.includes(s.active))) return false;
  if (!s.nodes.every(n => n && typeof n.id === "string" && typeof n.parent === "string" && typeof n.name === "string" && ["folder","text","image","audio","video"].includes(n.kind) && [n.content,n.media,n.origin].every(v => v === undefined || typeof v === "string") && [n.deleted,n.protected].every(v => v === undefined || typeof v === "boolean"))) return false;
  const ids = new Set(s.nodes.map(n => n.id));
  if (ids.size !== s.nodes.length || s.nodes.some(n => n.parent !== "home" && !s.nodes.some(p => p.id === n.parent && p.kind === "folder"))) return false;
  if (!["desktop","documents","images","downloads"].every(id => s.nodes.some(n => n.id === id && n.parent === "home" && n.kind === "folder" && n.protected && !n.deleted))) return false;
  for (const n of s.nodes) {
    const seen = new Set<string>(); let parent: VirtualFile | undefined = n;
    while (parent) { if (seen.has(parent.id)) return false; seen.add(parent.id); parent = s.nodes.find(p => p.id === parent!.parent); }
  }
  if (!["home","trash"].includes(s.folder) && !s.nodes.some(n => n.id === s.folder && n.kind === "folder")) return false;
  if (s.selected !== null && !ids.has(s.selected)) return false;
  if (s.clipboard !== null && (!s.clipboard || !ids.has(s.clipboard.id) || typeof s.clipboard.cut !== "boolean")) return false;
  if (s.message !== null && (!s.message || typeof s.message.fr !== "string" || typeof s.message.ar !== "string")) return false;
  return !s.nodes.some(n => n.id === `created-${s.nextId}`);
}

export function isTrashed(node: VirtualFile, nodes: VirtualFile[]): boolean {
  const visited = new Set<string>();
  let current: VirtualFile | undefined = node;
  while (current) { if (current.deleted || visited.has(current.id)) return true; visited.add(current.id); current = nodes.find(n => n.id === current!.parent); }
  return false;
}
export function descendants(nodes: VirtualFile[], id: string): VirtualFile[] {
  const result: VirtualFile[] = []; const pending = [id]; const visited = new Set<string>();
  while (pending.length) { const parent = pending.shift()!; if (visited.has(parent)) continue; visited.add(parent); for (const n of nodes.filter(n => n.parent === parent)) { result.push(n); if (n.kind === "folder") pending.push(n.id); } }
  return result;
}
export function pathFor(nodes: VirtualFile[], id: string): string {
  if (id === "home") return "Ce PC"; if (id === "trash") return "Corbeille";
  const names: string[] = []; const visited = new Set<string>(); let n = nodes.find(x => x.id === id);
  while (n && !visited.has(n.id)) { names.unshift(n.name); visited.add(n.id); n = nodes.find(x => x.id === n!.parent); }
  return ["Ce PC", ...names].join(" / ");
}
export function validWindowsName(name: string): boolean {
  return name.length > 0 && name.length <= 80 && !/[\u0000-\u001f\\/:*?"<>|]/.test(name) && !/[. ]$/.test(name) && name !== "." && name !== ".." && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name);
}
const sameName = (a: string, b: string) => a.normalize("NFKC").toLocaleLowerCase("fr") === b.normalize("NFKC").toLocaleLowerCase("fr");
const addFlag = (flags: string[], flag: string) => [...new Set([...flags, flag])];
const error = (s: WindowsState, fr: string, ar: string): WindowsState => ({ ...s, message: t(fr, ar) });

/** File operations modify this simulated file system only. */
export function windowsReducer(s: WindowsState, action: WindowsAction): WindowsState {
  if (action.type === "reset") return createWindowsState(s.mode);
  if (action.type === "message") return { ...s, message: action.message };
  if (action.type === "select") return { ...s, selected: action.id, message: null };
  if (action.type === "navigate") {
    if (!["home", "trash"].includes(action.folder) && !s.nodes.some(n => n.id === action.folder && n.kind === "folder" && !isTrashed(n, s.nodes))) return s;
    return { ...s, folder: action.folder, selected: null, message: null };
  }
  if (["open", "focus", "minimize", "maximize", "close", "position"].includes(action.type) && "app" in action) {
    const app = action.app; const old = s.windows[app]; let flags = s.flags;
    const w = { ...old }; let active = s.active;
    if (action.type === "open" || action.type === "focus") {
      if (action.type === "focus" && !old.open) return s;
      w.open = true; w.minimized = false; w.z = Math.max(...Object.values(s.windows).map(x => x.z)) + 1;
      if (old.minimized) flags = addFlag(flags, `restored-${app}`);
      flags = addFlag(flags, `opened-${app}`);
      if (s.active && s.active !== app && s.windows[s.active].open) flags = addFlag(flags, "switched-app");
      active = app;
    } else if (action.type === "minimize" && old.open) { w.minimized = true; flags = addFlag(flags, `minimized-${app}`); active = null; }
    else if (action.type === "maximize" && old.open) { w.maximized = !w.maximized; flags = addFlag(flags, w.maximized ? `maximized-${app}` : `sized-${app}`); active = app; }
    else if (action.type === "position" && !old.maximized && old.open) {
      if (!Number.isFinite(action.x) || !Number.isFinite(action.y)) return s;
      w.x = Math.max(0, action.x); w.y = Math.max(0, action.y);
      if (w.x !== old.x || w.y !== old.y) flags = addFlag(flags, `moved-${app}`);
    } else if (action.type === "close" && old.open) {
      w.open = false; w.minimized = false; w.maximized = false;
      if (app === "calculator" && s.windows.explorer.open && flags.includes("opened-calculator")) flags = addFlag(flags, "closed-calculator-only");
      active = Object.entries(s.windows).filter(([key, value]) => key !== app && value.open && !value.minimized).sort((a, b) => b[1].z - a[1].z)[0]?.[0] as WindowsApp ?? null;
    }
    return { ...s, active, windows: { ...s.windows, [app]: w }, flags, message: null };
  }
  if (action.type === "calculation") {
    const expression = action.expression.replace(/\s/g, "");
    return action.result === 20 && ["12+8", "8+12"].includes(expression) ? { ...s, flags: addFlag(s.flags, "calculated-20") } : s;
  }
  if (action.type === "clipboard") {
    const node = s.nodes.find(n => n.id === action.id);
    if (!node || node.protected || isTrashed(node, s.nodes)) return s;
    return { ...s, clipboard: { id: node.id, cut: action.cut }, flags: addFlag(s.flags, action.cut ? "used-cut" : "used-copy"), message: t(action.cut ? "Prêt à déplacer : ouvre le dossier de destination, puis colle." : "Prêt à copier : ouvre le dossier de destination, puis colle.", action.cut ? "جاهز للنقل: افتح مجلد الوجهة ثم ألصق." : "جاهز للنسخ: افتح مجلد الوجهة ثم ألصق.") };
  }
  if (action.type === "folder" || action.type === "text") {
    const parent = action.parent ?? s.folder; const name = action.name.trim();
    if (!s.nodes.some(n => n.id === parent && n.kind === "folder" && !isTrashed(n, s.nodes))) return error(s, "Ouvre d’abord Documents ou un dossier.", "افتح Documents أو مجلدا أولا.");
    if (!validWindowsName(name)) return error(s, "Nom invalide. Évite les caractères \\ / : * ? et un point final.", "الاسم غير صالح. تجنب الرموز المحجوزة والنقطة في النهاية.");
    if (s.nodes.some(n => n.parent === parent && !isTrashed(n, s.nodes) && sameName(n.name, name))) return error(s, "Ce nom existe déjà dans ce dossier.", "يوجد هذا الاسم في المجلد.");
    if (s.nodes.length >= 100) return error(s, "Le bureau d’entraînement contient déjà 100 éléments.", "يحتوي مكتب التدريب على 100 عنصر.");
    const node: VirtualFile = { id: `created-${s.nextId}`, parent, name, kind: action.type === "folder" ? "folder" : "text", ...(action.type === "text" ? { content: (action.content ?? "").slice(0,1600), origin: "student-text" } : {}) };
    return { ...s, nodes: [...s.nodes, node], nextId: s.nextId + 1, selected: node.id, flags: addFlag(s.flags, action.type === "folder" ? "created-folder" : "saved-text"), message: t(`${name} a été créé.`, `تم إنشاء ${name}.`) };
  }
  if (action.type === "rename") {
    const node = s.nodes.find(n => n.id === action.id); const name = action.name.trim();
    if (!node || node.protected || isTrashed(node, s.nodes)) return s;
    if (!validWindowsName(name)) return error(s, "Choisis un nom valide et conserve l’extension du fichier.", "اختر اسما صالحا وحافظ على امتداد الملف.");
    if (node.kind !== "folder" && name.split(".").pop()?.toLowerCase() !== node.name.split(".").pop()?.toLowerCase()) return error(s, "Changer l’extension ne convertit pas le fichier. Conserve son extension.", "لا يغير تبديل الامتداد نوع الملف. حافظ على امتداده.");
    if (s.nodes.some(n => n.id !== node.id && n.parent === node.parent && !isTrashed(n, s.nodes) && sameName(n.name, name))) return error(s, "Un autre élément porte déjà ce nom.", "يحمل عنصر آخر هذا الاسم.");
    return { ...s, nodes: s.nodes.map(n => n.id === node.id ? { ...n, name } : n), flags: addFlag(s.flags, "renamed-file"), message: t("Nom modifié ; le contenu et le format sont conservés.", "تغير الاسم وبقي المحتوى والنوع محفوظين.") };
  }
  if (action.type === "paste") {
    if (!s.clipboard) return error(s, "Sélectionne d’abord un élément, puis utilise Copier ou Couper.", "حدد عنصرا ثم استعمل نسخ أو قص.");
    const source = s.nodes.find(n => n.id === s.clipboard!.id); const parent = action.parent ?? s.folder;
    if (!source || isTrashed(source, s.nodes)) return s;
    if (!s.nodes.some(n => n.id === parent && n.kind === "folder" && !isTrashed(n, s.nodes))) return error(s, "Ouvre un dossier pour coller.", "افتح مجلدا للصق.");
    if (parent === source.id || descendants(s.nodes, source.id).some(n => n.id === parent)) return error(s, "Un dossier ne peut pas être placé dans lui-même.", "لا يمكن وضع مجلد داخل نفسه.");
    if (s.clipboard.cut && source.parent === parent) return { ...s, clipboard: null, message: t("L’élément est déjà ici.", "العنصر موجود هنا.") };
    let name = source.name;
    if (s.nodes.some(n => n.parent === parent && !isTrashed(n, s.nodes) && sameName(n.name, name))) {
      if (s.clipboard.cut) return error(s, "Ce nom existe dans le dossier de destination. Renomme d’abord le fichier.", "يوجد هذا الاسم في مجلد الوجهة. أعد التسمية أولا.");
      const dot = source.kind === "folder" ? -1 : source.name.lastIndexOf(".");
      const base = dot > 0 ? source.name.slice(0,dot) : source.name; const ext = dot > 0 ? source.name.slice(dot) : "";
      let i = 1; do { name = `${base} - Copie${i === 1 ? "" : ` (${i})`}${ext}`; i++; } while (s.nodes.some(n => n.parent === parent && !isTrashed(n,s.nodes) && sameName(n.name,name)));
    }
    if (s.clipboard.cut) return { ...s, nodes: s.nodes.map(n => n.id === source.id ? { ...n, parent } : n), selected: source.id, clipboard: null, flags: addFlag(s.flags,"moved-file"), message: t("L’élément a été déplacé.", "تم نقل العنصر.") };
    const copying = [source, ...descendants(s.nodes,source.id).filter(n => !isTrashed(n,s.nodes))];
    if (copying.length + s.nodes.length > 100) return error(s,"Cette copie dépasse la capacité du bureau d’entraînement.","تتجاوز هذه النسخة سعة مكتب التدريب.");
    const ids = new Map(copying.map((n,i) => [n.id, `created-${s.nextId+i}`]));
    const copies = copying.map(n => ({ ...n, id: ids.get(n.id)!, parent: n.id === source.id ? parent : ids.get(n.parent)!, name: n.id === source.id ? name : n.name, protected: false, deleted: false }));
    return { ...s, nodes: [...s.nodes,...copies], nextId: s.nextId+copies.length, selected: copies[0].id, flags: addFlag(s.flags,"copied-file"), message: t("Copie créée. L’original reste à sa place.","أنشئت نسخة وبقي الأصل في مكانه.") };
  }
  if (action.type === "delete" || action.type === "restore") {
    const node = s.nodes.find(n => n.id === action.id); if (!node || node.protected) return s;
    if (action.type === "restore" && !node.deleted) return s;
    if (action.type === "delete" && isTrashed(node,s.nodes)) return s;
    if (action.type === "restore" && s.nodes.some(n => n.id !== node.id && n.parent === node.parent && !isTrashed(n,s.nodes) && sameName(n.name,node.name))) return error(s,"Un élément du même nom existe déjà à l’emplacement d’origine.","يوجد عنصر بالاسم نفسه في الموضع الأصلي.");
    return { ...s, nodes: s.nodes.map(n => n.id === node.id ? { ...n, deleted: action.type === "delete" } : n), selected: null, flags: addFlag(s.flags, action.type === "delete" ? "deleted-file" : "restored-file"), message: action.type === "delete" ? t("Élément placé dans la Corbeille.","وضع العنصر في سلة المحذوفات.") : t("Élément restauré à son emplacement d’origine.","أعيد العنصر إلى موضعه الأصلي.") };
  }
  return s;
}

function findFolder(s: WindowsState, parent: string, name: string) { return s.nodes.find(n => n.kind === "folder" && n.parent === parent && !isTrashed(n,s.nodes) && sameName(n.name,name)); }
export function windowsCriteria(s: WindowsState, mode = s.mode): { label: LocalizedText; correct: boolean; points: number }[] {
  const live = s.nodes.filter(n => !isTrashed(n,s.nodes)); const photo = live.find(n => n.id === "source-photo"); const note = live.find(n => n.id === "source-note"); const flags = new Set(s.flags);
  const criterion = (fr: string, ar: string, correct: unknown, points=1) => ({ label:t(fr,ar),correct:Boolean(correct),points });
  if (mode === "desktop") return [
    criterion("Ouvrir la Calculatrice.","فتح الحاسبة.",flags.has("opened-calculator")),
    criterion("Calculer 12 + 8 et afficher 20.","حساب 12 + 8 وإظهار 20.",flags.has("calculated-20")),
    criterion("Déplacer sa fenêtre par la barre de titre.","تحريك النافذة من شريط العنوان.",flags.has("moved-calculator")),
    criterion("Agrandir puis rétablir la taille de la fenêtre.","تكبير النافذة ثم استعادة حجمها.",flags.has("maximized-calculator")&&flags.has("sized-calculator")),
    criterion("Réduire puis retrouver la Calculatrice dans la barre des tâches.","تصغير الحاسبة ثم إظهارها من شريط المهام.",flags.has("minimized-calculator")&&flags.has("restored-calculator")),
    criterion("Ouvrir l’Explorateur et passer d’une application à l’autre.","فتح المستكشف والانتقال بين التطبيقين.",flags.has("opened-explorer")&&flags.has("switched-app")),
    criterion("Fermer la Calculatrice en gardant l’Explorateur ouvert.","إغلاق الحاسبة مع إبقاء المستكشف مفتوحا.",flags.has("closed-calculator-only")&&s.windows.explorer.open),
  ];
  if (mode === "copy") return [criterion("L’original reste dans Images.","يبقى الأصل داخل Images.",photo?.parent==="images"&&flags.has("copied-file")),criterion("Une copie de Photo_club.jpg est dans Documents / Publication.","توجد نسخة من الصورة داخل Documents / Publication.",live.some(n=>n.id!=="source-photo"&&n.parent==="publication"&&n.origin==="club-photo"&&n.name==="Photo_club.jpg"))];
  if (mode === "move") { const audio=live.find(n=>n.id==="source-audio");return [criterion("L’enregistrement est dans Documents / Radio.","التسجيل داخل Documents / Radio.",audio?.parent==="radio"),criterion("Son nom est Message_club.wav ; le format est conservé.","اسمه Message_club.wav مع الحفاظ على نوعه.",audio?.name==="Message_club.wav"),criterion("L’original n’est plus dans Téléchargements.","لم يعد الأصل داخل Téléchargements.",audio&&audio.parent!=="downloads")]; }
  if (mode === "restore") return [criterion("consignes.txt est restauré dans Documents.","أعيد consignes.txt داخل Documents.",live.some(n=>n.id==="lost-note"&&n.parent==="documents")&&flags.has("restored-file"))];
  if (mode === "rename") return [criterion("La photo s’appelle Materiel_club.jpg dans Images.","اسم الصورة Materiel_club.jpg داخل Images.",photo?.name==="Materiel_club.jpg"&&photo.parent==="images"),criterion("Le contenu et le format de l’image sont conservés.","بقي محتوى الصورة ونوعها محفوظين.",photo?.kind==="image"&&photo.origin==="club-photo"&&flags.has("renamed-file"))];
  if (mode === "assessment") { const target=findFolder(s,"documents","Bilan_club");return [
    criterion("Créer Bilan_club dans Documents.","إنشاء Bilan_club داخل Documents.",target,2),
    criterion("Y déplacer Photo_club.jpg depuis Téléchargements.","نقل الصورة من Téléchargements إلى المجلد.",target&&photo?.parent===target.id&&photo.name==="Photo_club.jpg",2),
    criterion("Copier Consigne.txt dans Bilan_club en gardant l’original dans Documents.","نسخ Consigne.txt إلى Bilan_club مع إبقاء الأصل داخل Documents.",note?.parent==="documents"&&note.name==="Consigne.txt"&&target&&live.some(n=>n.id!=="source-note"&&n.origin==="club-invitation"&&n.parent===target.id),2),
    criterion("Renommer cette copie Invitation.txt dans Bilan_club.","إعادة تسمية هذه النسخة Invitation.txt داخل Bilan_club.",target&&live.some(n=>n.id!=="source-note"&&n.parent===target.id&&n.origin==="club-invitation"&&n.name==="Invitation.txt"),2),
    criterion("Restaurer Brouillon.txt dans Documents.","استعادة Brouillon.txt داخل Documents.",flags.has("restored-file")&&live.some(n=>n.id==="lost-note"&&n.parent==="documents"),2),
  ]; }
  const project=findFolder(s,"documents","Expo_club");const photos=project&&findFolder(s,project.id,"Photos");const texts=project&&findFolder(s,project.id,"Textes");
  return [criterion("Créer Documents / Expo_club.","إنشاء Documents / Expo_club.",project),criterion("Y créer Photos et Textes.","إنشاء Photos وTextes داخله.",photos&&texts),criterion("Déplacer Photo_club.jpg dans Photos.","نقل Photo_club.jpg إلى Photos.",photos&&photo?.parent===photos.id),criterion("Copier Invitation.txt dans Textes en gardant l’original.","نسخ Invitation.txt إلى Textes مع إبقاء الأصل.",texts&&note?.parent==="documents"&&live.some(n=>n.id!=="source-note"&&n.parent===texts.id&&n.name==="Invitation.txt"&&n.origin==="club-invitation"))];
}

export function windowsEvidence(s: WindowsState) {
  return { environment:"simulation Windows 11", mode:s.mode, criteria:windowsCriteria(s).map(c=>({ label:c.label.fr,correct:c.correct,points:c.points })), files:s.nodes.filter(n=>!n.protected).map(n=>({ id:n.id,name:n.name,kind:n.kind,path:pathFor(s.nodes,n.parent),deleted:Boolean(n.deleted),origin:n.origin })), actions:s.flags };
}

/** A small arithmetic parser; never executes text as JavaScript. */
export function calculateExpression(raw: string): number | null {
  const text=raw.replace(/,/g,".").replace(/×/g,"*").replace(/÷/g,"/").replace(/\s/g,"");
  if (!/^-?\d+(?:\.\d+)?(?:[+*/-]-?\d+(?:\.\d+)?)*$/.test(text) || text.length>70) return null;
  const tokens=text.match(/(?:^|(?<=[+*/-]))-?\d+(?:\.\d+)?|[+*/-]/g);if(!tokens)return null;
  const numbers:number[]=[];const operators:string[]=[];const priority=(op:string)=>op==="*"||op==="/"?2:1;
  const apply=()=>{const b=numbers.pop()!,a=numbers.pop()!,op=operators.pop();numbers.push(op==="+"?a+b:op==="-"?a-b:op==="*"?a*b:a/b);};
  for(const token of tokens){if(/^-?\d/.test(token))numbers.push(Number(token));else {while(operators.length&&priority(operators[operators.length-1])>=priority(token))apply();operators.push(token);}}
  while(operators.length)apply();const result=numbers[0];return numbers.length===1&&Number.isFinite(result)?Math.round(result*1e10)/1e10:null;
}
