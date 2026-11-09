"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, BarChart3, BookOpen } from "lucide-react";
import type { LocalizedText } from "./course-data";
import { Session3Text, useSession3Translation } from "./session3-translation";
import { useTeacherCourse } from "../lib/teacher-course-context";
import { useLearnerResumeToken } from "../lib/learning-context";
import { learnerWorkshop } from "../lib/supabase-api";
import { readWorkshopAttempts, rememberWorkshopAttempts, workshopAttemptEvent, workshopAttemptKey } from "../lib/workshop-attempt-cache";
import { attemptTotals, workshopEvidence, workshopExercises, workshopRows, workshopTotals, type WorkshopAttempt, type WorkshopEvidence, type WorkshopRow } from "../lib/workshop-progress";
import "./workshop-summary.css";

const t = (fr: string, ar: string): LocalizedText => ({ fr, ar });
export const workshopSummaryTitle = t("Bilan de la séance", "حصيلة الحصة");

function Text({ value }: { value: LocalizedText }) {
  const translateOnHover = useSession3Translation();
  return translateOnHover
    ? <Session3Text value={value} />
    : <span>{value.fr}<small className="workshop-ar" lang="ar" dir="rtl">{value.ar}</small></span>;
}

export function WorkshopSummaryLink({ onClick }: { onClick: () => void }) {
  const teacher = useTeacherCourse();
  return <button type="button" className="workshop-summary-link" onClick={onClick}>
    <BarChart3 size={19} aria-hidden="true" />
    <Text value={teacher ? workshopSummaryTitle : t("Voir mon bilan", "عرض حصيلتي")} />
  </button>;
}

function useWorkshopHistory(participantId: string, sessionId: number) {
  const teacher = useTeacherCourse();
  const token = useLearnerResumeToken();
  const key = workshopAttemptKey(participantId, sessionId);
  const [attempts, setAttempts] = useState<WorkshopAttempt[]>([]);
  const [drafts, setDrafts] = useState<WorkshopEvidence[]>([]);
  const [status, setStatus] = useState<"loading" | "saved" | "local" | "truncated">("loading");

  useEffect(() => {
    if (teacher) return;
    let active = true;
    function update() { setAttempts(readWorkshopAttempts(key)); }
    function onAttempt(event: Event) { if ((event as CustomEvent).detail === key) update(); }
    function onStorage(event: StorageEvent) { if (event.key === key) update(); }
    async function load() {
      update();
      if (!token || navigator.onLine === false) { setStatus("local"); return; }
      setStatus("loading");
      try {
        const history = await learnerWorkshop(token, sessionId);
        if (!active) return;
        setAttempts(rememberWorkshopAttempts(key, history.attempts));
        setDrafts(history.drafts);
        setStatus(history.truncated ? "truncated" : "saved");
      } catch {
        if (active) setStatus("local");
      }
    }
    void load();
    const reconnect = () => void load();
    window.addEventListener("online", reconnect);
    window.addEventListener("storage", onStorage);
    window.addEventListener(workshopAttemptEvent, onAttempt);
    return () => {
      active = false;
      window.removeEventListener("online", reconnect);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(workshopAttemptEvent, onAttempt);
    };
  }, [key, sessionId, teacher, token]);
  return { attempts, drafts, status };
}

function stateOf(row: WorkshopRow) {
  if (row.confirmed) return row.declared ? t("Déclaré · à vérifier", "تم التصريح · للتحقق") : t("Réussi", "ناجح");
  if (row.percent === null) return t("À faire", "لم يبدأ بعد");
  if (row.percent === 100) return row.declared ? t("À déclarer", "ينتظر التصريح") : t("À valider", "ينتظر التحقق");
  return row.declared ? t("Avancement déclaré", "تقدم مصرح به") : t("En cours", "قيد الإنجاز");
}

export function WorkshopSummary({ sessionId, participantId, state, onBack, onResume, onTrace, onEvaluate, children }: {
  sessionId: number;
  participantId: string;
  state: unknown;
  onBack: () => void;
  onResume: (index: number) => void;
  onTrace: () => void;
  onEvaluate: () => void;
  children?: ReactNode;
}) {
  const teacher = useTeacherCourse();
  const history = useWorkshopHistory(participantId, sessionId);
  const rows = workshopRows(workshopExercises(sessionId), [...history.drafts, ...workshopEvidence(sessionId, state)], attemptTotals(history.attempts));
  const total = workshopTotals(rows);
  const firstMissing = rows.findIndex(row => !row.confirmed);
  const grade = total.grade?.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
  return <section className="workshop-summary" aria-labelledby={`workshop-summary-${sessionId}`}>
    <header className="workshop-summary-header">
      <span className="workshop-summary-kicker">APRÈS L’ATELIER · SÉANCE {String(sessionId).padStart(2, "0")}</span>
      <h2 id={`workshop-summary-${sessionId}`}><Text value={workshopSummaryTitle} /></h2>
      <p><Text value={t("Retrouve le travail enregistré et les exercices à poursuivre.", "راجع العمل المحفوظ والتمارين التي ستواصلها.")} /></p>
    </header>
    {!teacher && <>
      <div className="workshop-summary-metrics">
        <article><Text value={t("Progression du parcours", "تقدم المسار")} /><strong>{total.percent} %</strong><progress aria-label="Progression du parcours" max={100} value={total.percent} /></article>
        {total.finished >= rows.length
          ? <article><Text value={t("Note indicative de l’atelier", "النقطة التقديرية للورشة")} /><strong>{grade === undefined ? "—" : `${grade} / 20`}</strong><small>{total.finished} / {rows.length} <Text value={t("terminés", "مكتملة")} /></small></article>
          : <article><Text value={t("Encouragement", "تشجيع")} /><strong>{total.finished > 0 ? "⭐".repeat(Math.min(3, Math.max(1, Math.ceil(total.finished / 5)))) : "🚀"}</strong><small>{total.finished} / {rows.length} <Text value={t("terminés — continue, tu es sur la bonne voie !", "مكتملة — واصل، أنت في الطريق الصحيح!")} /></small></article>}
        <article><Text value={t("Réussite des tentatives", "نسبة نجاح المحاولات")} /><strong>{total.successRate === null ? "—" : `${total.successRate} %`}</strong><small><Text value={t(`${total.correct} sur ${total.graded} tentatives corrigées`, `${total.correct} من ${total.graded} محاولات مصححة`)} /></small></article>
      </div>
      {firstMissing >= 0 && <button type="button" className="workshop-summary-link" onClick={() => onResume(firstMissing)}>
        <ArrowLeft size={18} aria-hidden="true" />
        <Text value={t(`Reprendre à l’exercice ${firstMissing + 1}`, `استئناف العمل من التمرين ${firstMissing + 1}`)} />
      </button>}
      <h3><Text value={t("Détail des exercices", "تفاصيل التمارين")} /></h3>
      <div className="workshop-summary-table" tabIndex={0} role="region" aria-label="Détail des exercices">
        <table>
          <thead><tr>
            <th scope="col"><Text value={t("Exercice", "التمرين")} /></th>
            <th scope="col"><Text value={t("Progression", "التقدم")} /></th>
            <th scope="col"><Text value={t("Tentatives corrigées", "المحاولات المصححة")} /></th>
            <th scope="col"><Text value={t("État", "الحالة")} /></th>
          </tr></thead>
          <tbody>{rows.map((row, index) => <tr key={row.id}>
            <th scope="row"><span className="workshop-summary-number">{String(index + 1).padStart(2, "0")}</span><Text value={row.title} /></th>
            <td>{row.percent === null ? "—" : <div className="workshop-row-percent"><strong>{row.percent} %</strong><progress aria-label={`Progression de l’exercice ${index + 1}`} max={100} value={row.percent} /></div>}</td>
            <td>{row.graded ? <><strong>{row.graded}</strong><small>{row.correct} <Text value={t("réussie(s)", "ناجحة")} /></small></> : "—"}</td>
            <td><span className={`workshop-row-state ${row.confirmed && !row.declared ? "success" : row.percent !== null ? "started" : ""}`}><Text value={stateOf(row)} /></span></td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="workshop-summary-notes">
        <p><Text value={t("Chaque exercice compte autant. Le bilan retient le meilleur résultat parmi les tentatives corrigées et le travail sauvegardé. Les exercices à faire comptent pour 0 % dans le parcours.", "لكل تمرين الوزن نفسه. تعتمد الحصيلة أفضل نتيجة بين المحاولات المصححة والعمل المحفوظ. تحتسب التمارين غير المنجزة بنسبة 0٪ في المسار.")} /></p>
        {rows.some(row => row.declared) && <p><Text value={t("Les travaux sur les vrais postes entrent dans l’avancement déclaré. L’enseignant vérifie leur réalisation.", "تدخل الأعمال على الحواسيب الحقيقية ضمن التقدم المصرح به. يتحقق الأستاذ من إنجازها.")} /></p>}
        {history.status !== "saved" && <p role="status"><Text value={history.status === "loading"
          ? t("Chargement des tentatives enregistrées…", "تحميل المحاولات المسجلة…")
          : history.status === "truncated"
            ? t("L’historique affiché est partiel.", "السجل المعروض جزئي.")
            : t("Affichage du travail et des tentatives disponibles sur ce poste.", "عرض العمل والمحاولات المتاحة على هذا الحاسوب.")} /></p>}
      </div>
    </>}
    {children}
    <footer className="workshop-summary-actions">
      <button type="button" onClick={onBack}><ArrowLeft size={17} aria-hidden="true" /><Text value={t("Retour à l’atelier", "العودة إلى الورشة")} /></button>
      <button type="button" onClick={onTrace}><BookOpen size={17} aria-hidden="true" /><Text value={t("Lire la trace écrite", "قراءة خلاصة الدرس")} /></button>
      <button type="button" className="workshop-evaluation-link" onClick={onEvaluate}><Text value={t("Continuer", "المتابعة")} /><ArrowRight size={17} aria-hidden="true" /></button>
    </footer>
  </section>;
}
