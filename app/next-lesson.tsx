import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { sessions, type Lang, type LocalizedText } from "./course-data";

function pick(value: LocalizedText, lang: Lang) {
  return lang === "ar" ? value.ar : value.fr;
}

/**
 * End-of-lesson block shown at the bottom of every séance:
 * one big button to jump straight to the next séance (or back to the
 * programme after the last one), so students never get lost.
 */
export function NextLessonFooter({
  currentId,
  lang,
  unlockedSessions,
  onOpenSession,
  onBack,
}: {
  currentId: number;
  lang: Lang;
  unlockedSessions: Set<number>;
  onOpenSession: (id: number) => void;
  onBack: () => void;
}) {
  const next = sessions.find((s) => s.id === currentId + 1);
  const Arrow = lang === "fr" ? ArrowRight : ArrowLeft;

  if (!next) {
    return (
      <div className="next-lesson done">
        <span className="next-lesson-icon"><CheckCircle2 size={30} /></span>
        <div className="next-lesson-copy">
          <strong>{lang === "fr" ? "Bravo ! C'était la dernière séance." : "برافو! كانت هذه آخر حصة."}</strong>
          <small>{lang === "fr" ? "Tu as terminé tout le parcours. Reviens au programme pour revoir une séance." : "أكملت المسار كاملًا. ارجع إلى البرنامج لمراجعة أي حصة."}</small>
        </div>
        <button type="button" className="next-lesson-btn" onClick={onBack}>
          {lang === "fr" ? "Retour au programme" : "العودة إلى البرنامج"}
        </button>
      </div>
    );
  }

  const locked = !unlockedSessions.has(next.id);
  return (
    <div className="next-lesson">
      <span className="next-lesson-icon"><Arrow size={30} /></span>
      <div className="next-lesson-copy">
        <strong>{lang === "fr" ? "Séance terminée ? Passe à la suivante !" : "أنهيت الحصة؟ انتقل إلى الحصة الموالية!"}</strong>
        <small>
          {lang === "fr" ? "Séance" : "الحصة"} {String(next.id).padStart(2, "0")} · {pick(next.title, lang)}
        </small>
      </div>
      <button type="button" className="next-lesson-btn" disabled={locked} onClick={() => onOpenSession(next.id)}>
        {locked ? <LockKeyhole size={18} /> : null}
        {locked
          ? (lang === "fr" ? "Verrouillée par le professeur" : "مقفلة من طرف الأستاذ")
          : (lang === "fr" ? "Séance suivante" : "الحصة الموالية")}
        {!locked && <Arrow size={19} />}
      </button>
    </div>
  );
}
