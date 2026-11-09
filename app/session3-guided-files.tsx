"use client";

import { publicAsset } from "../lib/public-assets";

import { useEffect, useState } from "react";
import { ArrowRight, Check, FileText, Folder, FolderPlus, Scissors } from "lucide-react";
import type { LocalizedText } from "./course-data";
import { guidedFileChecks, initialSystemLabState, type SystemLabState } from "./session3-system-model";
import { Session3Text } from "./session3-translation";

const t = (fr: string, ar: string): LocalizedText => ({ fr, ar });
function Copy({ value }: { value: LocalizedText }) {
  return <Session3Text value={value} />;
}

export function initialGuidedFilesState(): SystemLabState {
  return { ...initialSystemLabState(), files: [{ id: "photo", parent: "root", name: "photo.jpg", kind: "image" }] };
}

const steps = [
  t("Clique sur Nouveau dossier.", "انقر على مجلد جديد."),
  t("Écris Photos, puis clique sur Créer.", "اكتب Photos ثم انقر على إنشاء."),
  t("Clique une fois sur photo.jpg.", "انقر مرة واحدة على photo.jpg."),
  t("Clique sur Couper.", "انقر على قص."),
  t("Clique sur Ouvrir, sous le dossier Photos.", "انقر على فتح أسفل المجلد Photos."),
  t("Clique sur Coller.", "انقر على لصق."),
];

export function Session3GuidedFiles({ initialState, onStateChange, onValidate }: {
  initialState?: SystemLabState;
  onStateChange: (state: SystemLabState) => void;
  onValidate: (state: SystemLabState, checks: boolean[]) => void;
}) {
  const [state, setState] = useState<SystemLabState>(initialState ?? initialGuidedFilesState);
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => onStateChange(state), [state, onStateChange]);
  const checks = guidedFileChecks(state);
  const step = checks.findIndex((done) => !done);
  const complete = step === -1;
  const flag = (flags: string[], value: string) => [...new Set([...flags, value])];
  const photo = state.files.find((file) => file.id === "photo");
  const folder = state.files.find((file) => file.id === "photos");
  const photoVisible = photo?.parent === state.folder;

  return <section className="s3-system-lab s3-guided-files">
    <div className="s3-guided-goal">
      <strong><Copy value={t("But : mettre la photo dans le dossier Photos.", "الهدف: وضع الصورة داخل المجلد Photos.")} /></strong>
      <div className="s3-guided-goal-picture" aria-hidden="true"><div><img src={publicAsset("session2/items/unite-centrale-lenovo.jpg")} alt="" /><span>photo.jpg</span></div><ArrowRight size={30} /><div><Folder size={54} /><span>Photos</span></div></div>
    </div>
    <div className={`s3-current-mission ${complete ? "done" : ""}`} role="status" aria-live="polite">
      <strong>{complete ? <Check size={20} /> : `${step + 1} / 6`}</strong>
      <Copy value={complete ? t("Bravo ! La photo est dans Photos.", "أحسنت! أصبحت الصورة داخل Photos.") : steps[step]} />
    </div>
    <div className="s3-guided-workspace">
      <div className="s3-file-toolbar">
        <button type="button" className={step === 0 ? "next-action" : ""} disabled={step !== 0} onClick={() => setState((s) => ({ ...s, flags: flag(s.flags, "guided-create") }))}><FolderPlus size={22} /><Copy value={t("Nouveau dossier", "مجلد جديد")} /></button>
        <button type="button" className={step === 3 ? "next-action" : ""} disabled={step !== 3} onClick={() => setState((s) => ({ ...s, clipboard: { id: "photo", cut: true }, flags: flag(s.flags, "guided-cut") }))}><Scissors size={22} /><Copy value={t("Couper", "قص")} /></button>
        <button type="button" className={step === 5 ? "next-action" : ""} disabled={step !== 5} onClick={() => setState((s) => ({ ...s, files: s.files.map((file) => file.id === "photo" ? { ...file, parent: "photos" } : file), selection: null, clipboard: null }))}><FileText size={22} /><Copy value={t("Coller", "لصق")} /></button>
      </div>
      <div className="s3-guided-location"><Copy value={t("Tu es dans :", "أنت داخل:")} /><strong>{state.folder === "photos" ? "Mes fichiers › Photos" : "Mes fichiers"}</strong></div>
      {step === 1 && <form className="s3-name-form s3-guided-name" onSubmit={(event) => {
        event.preventDefault();
        if (name.trim().toLowerCase() !== "photos") { setError(true); return; }
        setState((s) => ({ ...s, files: [...s.files, { id: "photos", parent: "root", name: "Photos", kind: "folder" }] }));
        setError(false);
      }}><label><Copy value={t("Nom du dossier", "اسم المجلد")} /><input autoFocus value={name} onChange={(event) => { setName(event.target.value); setError(false); }} placeholder="Photos" autoComplete="off" /></label><button type="submit"><Copy value={t("Créer", "إنشاء")} /></button>{error && <p role="alert"><Copy value={t("Écris le nom Photos.", "اكتب الاسم Photos.")} /></p>}</form>}
      <div className="s3-guided-items">
        {photoVisible && <button type="button" className={`s3-guided-photo ${state.selection === "photo" ? "selected" : ""} ${state.clipboard?.cut ? "cut" : ""} ${step === 2 ? "next-action" : ""}`} disabled={step !== 2} aria-pressed={state.selection === "photo"} onClick={() => setState((s) => ({ ...s, selection: "photo", flags: flag(s.flags, "guided-select") }))}><img src={publicAsset("session2/items/unite-centrale-lenovo.jpg")} alt="" /><strong>photo.jpg</strong>{state.selection === "photo" && <small><Copy value={t("Photo sélectionnée", "الصورة محددة")} /></small>}</button>}
        {folder && state.folder === "root" && <div className="s3-guided-folder"><Folder size={67} /><strong>Photos</strong><button type="button" className={step === 4 ? "next-action" : ""} disabled={step !== 4} onClick={() => setState((s) => ({ ...s, folder: "photos", selection: null, flags: flag(s.flags, "guided-open") }))}><Copy value={t("Ouvrir", "فتح")} /></button></div>}
        {step === 5 && <p className="s3-guided-empty"><Copy value={t("Photos est vide. La photo est prête à être collée ici.", "المجلد Photos فارغ. الصورة جاهزة للصق هنا.")} /></p>}
      </div>
    </div>
    <div className="s3-lab-validation"><strong>{checks.filter(Boolean).length} / 6</strong><button type="button" disabled={!complete} onClick={() => onValidate(state, checks)}><Check size={18} /><Copy value={t("Vérifier mon rangement", "أتحقق من ترتيبي")} /></button></div>
    <details className="s3-missions-details"><summary><Copy value={t("Refaire dans Windows", "التطبيق في Windows")} /></summary><p><Copy value={t("Télécharge la photo. Avec ton professeur, refais les mêmes gestes sur le poste.", "حمل الصورة وأعد الحركات نفسها على الحاسوب بمساعدة أستاذك.")} /></p><a href="session2/items/unite-centrale-lenovo.jpg" download="photo.jpg"><Copy value={t("Télécharger photo.jpg", "تحميل photo.jpg")} /></a></details>
  </section>;
}
