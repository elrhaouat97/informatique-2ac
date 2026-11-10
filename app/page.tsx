"use client";

import Link from "next/link";
import { publicAsset } from "../lib/public-assets";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  ExternalLink,
  FileCheck2,
  FlaskConical,
  FolderKanban,
  Gamepad2,
  Home,
  ImageIcon,
  Languages,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  Menu,
  MousePointer2,
  MonitorCog,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  Target,
  UserRoundPen,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getUnit,
  sessions,
  units,
  type CourseSession,
  type Lang,
  type LocalizedText,
  type QuizQuestion,
} from "./course-data";
import { photoChallenges } from "./practice-data";
import {
  unit1Labs,
  type Unit1Exercise,
} from "./unit1-labs";
import { Session3Overview, Session3SystemLab } from "./session3-system-lab";
import { NextLessonFooter } from "./next-lesson";
import { evaluationPassed } from "../lib/supabase-api";
import type { SystemLabState } from "./session3-system-model";
import { Session3GuidedFiles } from "./session3-guided-files";
import { Session3Trace } from "./session3-trace";
import { Session3ExerciseGuide } from "./session3-exercise-guides";
import { Session3Windows11 } from "./session3-windows11";
import { Session3Assessment } from "./session3-assessment";
import type { WindowsState, WindowsMode } from "./session3-windows-model";
import { Session3Text, Session3TranslationScope, useSession3Translation } from "./session3-translation";
import "./session3-theme.css";
import {LearningProvider,LearningSaveBadge,useDurableLessonState} from "../lib/learning-context";
import {forgetActiveProfile,lastLearningView,resumeOverview,readSnapshot,rememberedActiveProfile,rememberProfile,saveSnapshot} from "../lib/learning-storage";
import {StudentIdentification,ResumeStudent} from "./student-identification";
import { teacherDemoProfile, useTeacherCourse } from "../lib/teacher-course-context";
import { TeacherExerciseNavigator } from "./teacher-exercise-navigator";
import { Session3WorkshopRecap } from "./session3-workshop-summary";
import { WorkshopSummary, WorkshopSummaryLink, workshopSummaryTitle } from "./workshop-summary";
import { normalizeAnswer, unit1DraftPercent } from "../lib/workshop-progress";
import { rememberWorkshopAttempts, workshopAttemptKey } from "../lib/workshop-attempt-cache";
import Session4Lesson from "./session4-lesson";
import {
  getSessionAccess,
  registerParticipant,
  submitCourseAttempt,
  type SessionAccess,
  type StudentProfile,
} from "@/lib/supabase-api";

type ViewTab = "mission" | "workshop" | "trace" | "quiz";

type SubmissionInput = {
  sessionId: number;
  activityType: "unit1_exercise" | "quiz" | "practical_evaluation" | "photo_challenge" | "workshop" | "session_completion";
  activityId: string;
  answer: unknown;
  isCorrect?: boolean;
  score?: number;
  maxScore?: number;
};

type QueuedSubmission = SubmissionInput & {
  id: string;
  participantId: string;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

type ExerciseDraft = {
  savedAt?:number;
  exerciseRevision?:number;
  choice: number | null;
  multi: number[];
  matches: Record<number, number>;
  sequence: number[];
  textValue: string;
  conversionValues: Record<number, string>;
  diagnosticComponent: number | null;
  diagnosticRepair: number | null;
  gestureProgress: number;
  systemLab?: SystemLabState;
  windows11?: WindowsState;
  result: boolean | null;
};

const activeParticipantKey = "lab2ac-active-participant";
const submissionQueueKey = "lab2ac-submission-queue";
const evaluationPreviewKey = "lab2ac-session2-evaluation-preview-attempts";

function session2PreviewTab(): ViewTab | null {
  const previewEnabled = process.env.NODE_ENV === "development"
    || process.env.NEXT_PUBLIC_SESSION2_EVALUATION_PREVIEW === "true";
  if (!previewEnabled || typeof window === "undefined") return null;
  const preview = new URLSearchParams(window.location.search).get("preview");
  if (preview === "session2-mission") return "mission";
  if (preview === "session2-workshop") return "workshop";
  if (preview === "session2-trace") return "trace";
  if (preview === "session2-evaluation") return "quiz";
  return null;
}

function isSession2EvaluationPreview() {
  return session2PreviewTab() === "quiz";
}

function session3PreviewTab(): ViewTab | null {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") return null;
  const preview = new URLSearchParams(window.location.search).get("preview");
  if (preview === "session3-mission") return "mission";
  if (preview === "session3-workshop") return "workshop";
  if (preview === "session3-trace") return "trace";
  if (preview === "session3-evaluation") return "quiz";
  return null;
}

const ui = {
  fr: {
    program: "Programme",
    overview: "Vue d’ensemble",
    progress: "Ma progression",
    finished: "terminées",
    session: "Séance",
    sessions: "séances",
    hours: "heures",
    pair: "Travail en binôme",
    room: "Salle informatique · 15 postes",
    start: "Commencer le parcours",
    continue: "Continuer",
    open: "Ouvrir la séance",
    all: "Toutes",
    mission: "Mission",
    workshop: "Atelier",
    trace: "Trace écrite",
    quiz: "Évaluation",
    situation: "Situation-problème",
    goal: "Votre mission",
    objectives: "Objectifs d’apprentissage",
    organization: "Organisation du binôme",
    pilot: "Pilote",
    pilotText: "manipule pendant 15 min",
    copilot: "Copilote",
    copilotText: "observe et vérifie, puis on inverse",
    timing: "120 minutes, minute par minute",
    total: "Total exact",
    minutes: "min",
    workshopTitle: "Deux ateliers, une production",
    beginner: "Je débute sur ordinateur",
    beginnerIntro: "Aucune expérience n’est nécessaire. Fais ces gestes lentement avec ton binôme.",
    photoChallenge: "Photo-défi",
    realPhoto: "Observer une situation réelle",
    practiceTime: "85 min de pratique",
    choose: "Choisis une réponse",
    wellDone: "Bien vu !",
    tryAgain: "Observe encore et réessaie.",
    startPractice: "Passer à la pratique",
    peerCheck: "10 min · vérification par un autre binôme",
    validate: "Atelier terminé",
    deliverable: "Production attendue",
    notebook: "Trace écrite structurée",
    vocabulary: "Vocabulaire clé",
    quizTitle: "Vérification rapide",
    quizIntro: "Répondez aux questions puis vérifiez votre résultat.",
    check: "Vérifier mes réponses",
    retry: "Recommencer",
    correct: "Bonne réponse",
    wrong: "À revoir",
    score: "Votre score",
    complete: "Marquer comme terminée",
    completed: "Séance terminée",
    previous: "Précédente",
    next: "Suivante",
    timer: "Chronomètre de séance",
    reset: "Remettre à 2 h",
    back: "Retour au programme",
  },
  ar: {
    program: "البرنامج",
    overview: "نظرة عامة",
    progress: "تقدمي",
    finished: "منجزة",
    session: "الحصة",
    sessions: "حصص",
    hours: "ساعات",
    pair: "عمل ثنائي",
    room: "قاعة الإعلاميات · 15 حاسوبا",
    start: "ابدأ المسار",
    continue: "متابعة",
    open: "فتح الحصة",
    all: "الكل",
    mission: "المهمة",
    workshop: "الورشة",
    trace: "خلاصة الدرس",
    quiz: "التقويم",
    situation: "الوضعية المشكلة",
    goal: "مهمتكم",
    objectives: "أهداف التعلم",
    organization: "تنظيم العمل الثنائي",
    pilot: "القائد",
    pilotText: "يستعمل الحاسوب لمدة 15 دقيقة",
    copilot: "الملاحظ",
    copilotText: "يراقب ويتحقق ثم نتبادل الأدوار",
    timing: "120 دقيقة، مرحلة بمرحلة",
    total: "المجموع المضبوط",
    minutes: "د",
    workshopTitle: "ورشتان وإنتاج واحد",
    beginner: "أنا مبتدئ في استعمال الحاسوب",
    beginnerIntro: "لا تحتاج إلى خبرة سابقة. أنجز هذه الحركات بهدوء مع زميلك.",
    photoChallenge: "تحدي الصورة",
    realPhoto: "ملاحظة وضعية حقيقية",
    practiceTime: "85 دقيقة من التطبيق",
    choose: "اختر جوابا",
    wellDone: "أحسنت الملاحظة!",
    tryAgain: "لاحظ من جديد ثم أعد المحاولة.",
    startPractice: "الانتقال إلى التطبيق",
    peerCheck: "10 دقائق · تحقق من طرف ثنائية أخرى",
    validate: "أنهيت الورشة",
    deliverable: "الإنتاج المطلوب",
    notebook: "خلاصة الدرس المنظمة",
    vocabulary: "المفردات الأساسية",
    quizTitle: "تحقق سريع",
    quizIntro: "أجب عن الأسئلة ثم تحقق من النتيجة.",
    check: "تحقق من الأجوبة",
    retry: "إعادة المحاولة",
    correct: "جواب صحيح",
    wrong: "يحتاج مراجعة",
    score: "نتيجتك",
    complete: "تحديد الحصة كمنجزة",
    completed: "الحصة منجزة",
    previous: "السابقة",
    next: "التالية",
    timer: "مؤقت الحصة",
    reset: "إرجاع ساعتين",
    back: "العودة إلى البرنامج",
  },
} as const;

const tabItems: { id: ViewTab; icon: typeof Target }[] = [
  { id: "mission", icon: Target },
  { id: "workshop", icon: FlaskConical },
  { id: "trace", icon: BookOpen },
  { id: "quiz", icon: FileCheck2 },
];

function txt(value: LocalizedText, lang: Lang) {
  return value[lang];
}

function bilingualAria(value: LocalizedText) {
  return `${value.fr} — ${value.ar}`;
}

function BilingualText({ value, className = "" }: { value: LocalizedText; className?: string }) {
  const hoverTranslation = useSession3Translation();
  if (hoverTranslation) return <Session3Text value={value} className={className} />;
  const isSharedText = value.fr.trim().toLocaleLowerCase() === value.ar.trim().toLocaleLowerCase();

  if (isSharedText) {
    return (
      <span className={`bilingual-copy bilingual-copy-single ${className}`.trim()}>
        <span className="bilingual-copy-fr" dir="auto">{value.fr}</span>
      </span>
    );
  }

  return (
    <span className={`bilingual-copy ${className}`.trim()}>
      <span className="bilingual-copy-fr" lang="fr" dir="ltr">{value.fr}</span>
      <span className="bilingual-copy-ar" lang="ar" dir="rtl">{value.ar}</span>
    </span>
  );
}

function quizHasJustification(question: QuizQuestion): question is QuizQuestion & {
  justifications: LocalizedText[];
  justificationAnswer: number;
} {
  return Boolean(
    question.justifications?.length &&
    Number.isInteger(question.justificationAnswer),
  );
}

function readSubmissionQueue() {
  try {
    const stored = window.localStorage.getItem(submissionQueueKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? (parsed as QueuedSubmission[]) : [];
  } catch {
    return [];
  }
}

function writeSubmissionQueue(queue: QueuedSubmission[]) {
  window.localStorage.setItem(submissionQueueKey, JSON.stringify(queue));
}

function createClientSubmissionId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const values = new Uint32Array(4);
  crypto.getRandomValues(values);
  return `${Date.now().toString(36)}-${Array.from(values, (value) => value.toString(36)).join("-")}`;
}

function isStudentProfile(value: unknown): value is StudentProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<StudentProfile>;
  return Boolean(
    profile.id &&
    profile.studentOne &&
    profile.className &&
    profile.groupName &&
    typeof profile.isPair === "boolean"
  );
}

function StudentIdentityGate({ onReady }: { onReady: (profile: StudentProfile) => void }) {
  return <StudentIdentification onReady={onReady}/>;
}

const learningRecord=(value:unknown):value is Record<string,unknown>=>Boolean(value&&typeof value==="object"&&!Array.isArray(value));
function useLearningField<T extends object,K extends keyof T>(setState:React.Dispatch<React.SetStateAction<T>>,field:K){return useCallback((next:React.SetStateAction<T[K]>)=>setState(current=>{const value=typeof next==="function"?(next as (v:T[K])=>T[K])(current[field]):next;return Object.is(value,current[field])?current:{...current,[field]:value}}),[setState,field]);}


function padTime(value: number) {
  return String(value).padStart(2, "0");
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${padTime(hours)}:${padTime(minutes)}:${padTime(secs)}`;
}

function UnitMark({ unit }: { unit: number }) {
  return <span className={`unit-mark unit-${unit}`}>U{unit}</span>;
}

function Sidebar({
  lang,
  selectedId,
  completed,
  unlockedSessions,
  isOpen,
  onClose,
  onToggle,
  onHome,
  onOpenSession,
}: {
  lang: Lang;
  selectedId: number | null;
  completed: Set<number>;
  unlockedSessions: Set<number>;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onHome: () => void;
  onOpenSession: (id: number) => void;
}) {
  const labels = ui[lang];
  return (
    <>
      <button
        className={`sidebar-scrim ${isOpen ? "visible" : ""}`}
        aria-label={lang === "fr" ? "Fermer le menu" : "إغلاق القائمة"}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={isOpen
            ? (lang === "fr" ? "Réduire le programme" : "طي البرنامج")
            : (lang === "fr" ? "Développer le programme" : "فتح البرنامج")}
        >
          {isOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
        </button>
        <div className="brand-row">
          <button className="brand" onClick={onHome} aria-label={labels.overview}>
            <span className="brand-symbol" aria-hidden="true">{"//"}</span>
            <span>
              <strong>LAB·2AC</strong>
              <small>INFORMATIQUE</small>
            </span>
          </button>
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="Fermer">
            <X size={19} />
          </button>
        </div>

        <button className={`home-link ${selectedId === null ? "active" : ""}`} onClick={onHome}>
          <Home size={17} />
          <span>{labels.overview}</span>
        </button>

        <Link href="/jeux" className="games-link">
          <Gamepad2 size={19} />
          <span>{lang === "fr" ? "Jeux interactifs" : "ألعاب تفاعلية"}</span>
        </Link>

        <div className="sidebar-scroll">
          <p className="sidebar-label">{labels.program}</p>
          {units.map((unit) => {
            const unitSessions = sessions.filter((session) => session.unit === unit.id);
            return (
              <section className="sidebar-unit" key={unit.id}>
                <div className="sidebar-unit-title">
                  <UnitMark unit={unit.id} />
                  <span>{txt(unit.title, lang)}</span>
                  <small>{unit.hours}h</small>
                </div>
                <div className="sidebar-session-list">
                  {unitSessions.map((session) => (
                    <button
                      key={session.id}
                      className={`sidebar-session ${selectedId === session.id ? "active" : ""} ${unlockedSessions.has(session.id) ? "" : "locked"}`}
                      onClick={() => onOpenSession(session.id)}
                      disabled={!unlockedSessions.has(session.id)}
                    >
                      <span className="sidebar-session-number">{padTime(session.id)}</span>
                      <span className="sidebar-session-name">{txt(session.title, lang)}</span>
                      {!unlockedSessions.has(session.id) ? (
                        <LockKeyhole className="session-lock" size={14} />
                      ) : completed.has(session.id) ? (
                        <CheckCircle2 className="session-check" size={15} />
                      ) : (
                        <ChevronRight size={14} className="session-chevron" />
                      )}
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="progress-panel">
          <div className="progress-copy">
            <span>{labels.progress}</span>
            <strong>{completed.size}/15</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${(completed.size / 15) * 100}%` }} />
          </div>
          <small>{completed.size} {labels.finished}</small>
        </div>
      </aside>
    </>
  );
}

function StudentIdentityBadge({
  lang,
  student,
  onChangeStudent,
}: {
  lang: Lang;
  student: StudentProfile;
  onChangeStudent: () => void;
}) {
  const teacherMode = useTeacherCourse();
  if (teacherMode) return <span className="student-chip solo"><BookOpen size={18} /><strong>Professeur · démonstration</strong></span>;
  const studentLabel = student.isPair && student.studentTwo
    ? `${student.studentOne} + ${student.studentTwo}`
    : student.studentOne;
  const organizationLabel = student.isPair
    ? (lang === "fr" ? "Binôme" : "ثنائي")
    : (lang === "fr" ? "Individuel" : "فردي");

  return (
    <button
      className={`student-chip ${student.isPair ? "pair" : "solo"}`}
      onClick={onChangeStudent}
      title={`${organizationLabel} · ${studentLabel}`}
      aria-label={`${organizationLabel} : ${studentLabel}. ${lang === "fr" ? "Changer d’élève" : "تغيير التلميذ"}`}
      type="button"
    >
      <span className="student-chip-icon" aria-hidden="true">
        {student.isPair ? <Users size={16} /> : <UserRoundPen size={16} />}
      </span>
      <span className="student-chip-content">
        <span className="student-chip-name-row">
          <small className="student-mode-badge">{organizationLabel}</small>
          <strong>{studentLabel}</strong>
        </span>
        <small className="student-chip-meta">{student.className}</small>
      </span>
    </button>
  );
}

function Topbar({
  lang,
  selected,
  timerSeconds,
  timerRunning,
  student,
  saveStatus,
  onToggleLang,
  onToggleTimer,
  onResetTimer,
  onMenu,
  onChangeStudent,
  onRetrySave,
}: {
  lang: Lang;
  selected: CourseSession | null;
  timerSeconds: number;
  timerRunning: boolean;
  student: StudentProfile;
  saveStatus: SaveStatus;
  onToggleLang: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onMenu: () => void;
  onChangeStudent: () => void;
  onRetrySave: () => void;
}) {
  const labels = ui[lang];
  return (
    <header className="topbar">
      <div className="topbar-path">
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Menu">
          <Menu size={20} />
        </button>
        <span>{selected ? `U${selected.unit}` : labels.program}</span>
        <ChevronRight size={14} />
        <strong>{selected ? `${labels.session} ${padTime(selected.id)}` : labels.overview}</strong>
      </div>
      <div className="topbar-actions">
        {saveStatus !== "idle" && (
          <button
            className={`save-status ${saveStatus}`}
            onClick={saveStatus === "error" ? onRetrySave : undefined}
            type="button"
            aria-label={saveStatus === "error" ? (lang === "fr" ? "Réessayer l’enregistrement" : "إعادة محاولة التسجيل") : undefined}
          >
            {saveStatus === "saving" && <LoaderCircle className="spin" size={14} />}
            {saveStatus === "saved" && <CheckCircle2 size={14} />}
            {saveStatus === "error" && <AlertTriangle size={14} />}
            <span>{saveStatus === "saving"
              ? (lang === "fr" ? "Enregistrement…" : "جارٍ التسجيل…")
              : saveStatus === "saved"
                ? (lang === "fr" ? "Réponses enregistrées" : "تم تسجيل الإجابات")
                : (lang === "fr" ? "Réessayer" : "إعادة المحاولة")}</span>
          </button>
        )}
        {selected && (
          <div className={`mini-timer ${timerRunning ? "running" : ""}`}>
            <Clock3 size={15} />
            <span>{formatTime(timerSeconds)}</span>
            <button onClick={onToggleTimer} aria-label={timerRunning ? "Pause" : "Start"}>
              {timerRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button onClick={onResetTimer} aria-label={labels.reset}>
              <RefreshCw size={13} />
            </button>
          </div>
        )}
        <StudentIdentityBadge lang={lang} student={student} onChangeStudent={onChangeStudent} />
        <button className="lang-switch" onClick={onToggleLang}>
          <Languages size={17} />
          <span>{lang === "fr" ? "العربية" : "Français"}</span>
        </button>
      </div>
    </header>
  );
}

function Dashboard({
  lang,
  completed,
  unlockedSessions,
  onOpenSession,
  participantId,
}: {
  lang: Lang;
  completed: Set<number>;
  unlockedSessions: Set<number>;
  onOpenSession: (id: number) => void;
  participantId: string;
}) {
  const labels = ui[lang];
  const [filter, setFilter] = useState<number | "all">("all");
  const visibleSessions = filter === "all" ? sessions : sessions.filter((session) => session.unit === filter);
  const nextSession = sessions.find((session) => unlockedSessions.has(session.id) && !evaluationPassed(participantId, session.id))
    ?? sessions.find((session) => unlockedSessions.has(session.id) && !completed.has(session.id))
    ?? sessions.find((session) => unlockedSessions.has(session.id))
    ?? null;
  const journeyStarted = sessions.some((session) => evaluationPassed(participantId, session.id)) || completed.size > 0;

  return (
    <div className="dashboard page-enter">
      <section className="dashboard-hero">
        <div className="hero-grid-mark" aria-hidden="true">
          <span>01</span><span>05</span><span>10</span><span>15</span>
        </div>
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> PARCOURS INTERACTIF · 2AC</div>
          <h1>
            {lang === "fr" ? (
              <>15 séances.<br /><em>30 heures.</em><br />Un vrai laboratoire.</>
            ) : (
              <>15 حصة.<br /><em>30 ساعة.</em><br />مختبر حقيقي.</>
            )}
          </h1>
          <p>
            {lang === "fr"
              ? "Même si tu n’as jamais touché un ordinateur : un geste montré, puis tu pratiques — toujours avec ton binôme."
              : "حتى لو لم تستعمل الحاسوب من قبل: حركة واحدة معروضة ثم تطبقها — دائما مع زميلك."}
          </p>
          {nextSession ? (
            <button className="primary-button hero-start" onClick={() => onOpenSession(nextSession.id)}>
              {lang === "fr"
                ? (journeyStarted ? `Continuer : séance ${nextSession.id}` : `Commencer : séance ${nextSession.id}`)
                : (journeyStarted ? `تابع: الحصة ${nextSession.id}` : `ابدأ: الحصة ${nextSession.id}`)}
              {lang === "fr" ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            </button>
          ) : (
            <div className="no-open-session"><LockKeyhole size={18} />{lang === "fr" ? "Aucune séance ouverte par le professeur." : "لا توجد حصة مفتوحة من طرف الأستاذ."}</div>
          )}
        </div>
        <div className="hero-data">
          <div className="hero-stat hero-stat-main">
            <span>{Object.values(unit1Labs).reduce((total, lab) => total + lab.exercises.length, 0)}</span>
            <small>{lang === "fr" ? "exercices interactifs dans l’unité 1" : "تمرينًا تفاعليًا في الوحدة 1"}</small>
          </div>
          <div className="hero-stat"><span>15</span><small>{labels.sessions}</small></div>
          <div className="hero-stat"><span>30h</span><small>{lang === "fr" ? "au total" : "في المجموع"}</small></div>
          <div className="hero-room">
            <MonitorCog size={20} />
            <div><strong>{labels.room}</strong><span>{labels.pair} · {lang === "fr" ? "débutants accompagnés" : "دعم للمبتدئين"}</span></div>
          </div>
        </div>
      </section>

      <section className="unit-overview">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{lang === "fr" ? "ARCHITECTURE DU PARCOURS" : "بنية المسار"}</span>
            <h2>{lang === "fr" ? "4 unités qui construisent l’autonomie" : "أربع وحدات لبناء الاستقلالية"}</h2>
          </div>
          <span className="section-rule" />
        </div>
        <div className="unit-cards">
          {units.map((unit) => (
            <button className={`unit-card unit-${unit.id}`} key={unit.id} onClick={() => setFilter(unit.id)}>
              <div className="unit-card-top">
                <UnitMark unit={unit.id} />
                <span>{unit.hours}H</span>
              </div>
              <strong>{txt(unit.title, lang)}</strong>
              <small>{unit.sessions} {labels.sessions}</small>
              <div className="unit-card-meter">
                {Array.from({ length: unit.sessions }).map((_, index) => {
                  const unitSession = sessions.filter((item) => item.unit === unit.id)[index];
                  return <span key={index} className={completed.has(unitSession.id) ? "done" : ""} />;
                })}
              </div>
            </button>
          ))}
        </div>
      </section>

      <Link href="/jeux" className="games-banner">
        <span className="games-banner-icon"><Gamepad2 size={30} /></span>
        <span className="games-banner-copy">
          <strong>{lang === "fr" ? "Jeux interactifs" : "ألعاب تفاعلية"}</strong>
          <small>{lang === "fr" ? "Des exercices en jeux : cartes mémoire, QCM, ordre et paires — une question à la fois, avec des images !" : "تمارين على شكل ألعاب: بطاقات ذاكرة، أسئلة متعددة الخيارات، ترتيب وأزواج — سؤال واحد في كل مرة، بالصور!"}</small>
        </span>
        <span className="games-banner-cta">
          {lang === "fr" ? "Jouer" : "العب"}
          {lang === "fr" ? <ArrowRight size={19} /> : <ArrowLeft size={19} />}
        </span>
      </Link>

      <section className="sessions-section">
        <div className="section-heading session-heading">
          <div>
            <span className="eyebrow">{lang === "fr" ? "FEUILLE DE ROUTE" : "خارطة الطريق"}</span>
            <h2>{lang === "fr" ? "Les 15 séances" : "الحصص الخمس عشرة"}</h2>
          </div>
          <div className="filter-row" role="group" aria-label="Filtrer par unité">
            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>{labels.all}</button>
            {units.map((unit) => (
              <button className={filter === unit.id ? "active" : ""} onClick={() => setFilter(unit.id)} key={unit.id}>U{unit.id}</button>
            ))}
          </div>
        </div>
        <div className="session-grid">
          {visibleSessions.map((session) => {
            const unit = getUnit(session.unit);
            const done = completed.has(session.id);
            return (
              <button
                className={`session-card unit-${session.unit} ${done ? "done" : ""} ${unlockedSessions.has(session.id) ? "" : "locked"}`}
                key={session.id}
                onClick={() => onOpenSession(session.id)}
                disabled={!unlockedSessions.has(session.id)}
              >
                <div className="session-card-top">
                  <span className="session-index">{padTime(session.id)}</span>
                  <span className="session-duration"><Clock3 size={13} /> 2H</span>
                </div>
                <div className="session-card-unit">U{session.unit} · {txt(unit.title, lang)}</div>
                <h3>{txt(session.title, lang)}</h3>
                <p>{txt(session.subtitle, lang)}</p>
                <div className="session-card-foot">
                  <span>
                    {!unlockedSessions.has(session.id)
                      ? (lang === "fr" ? "Verrouillée par le professeur" : "مقفلة من طرف الأستاذ")
                      : `${labels.open} · ${session.unit === 1
                      ? `${unit1Labs[session.id as 1 | 2 | 3].exercises.length} ${lang === "fr" ? "exercices" : "تمرينًا"}`
                      : `85 min ${lang === "fr" ? "pratique" : "تطبيق"}`}`}
                  </span>
                  {!unlockedSessions.has(session.id) ? <LockKeyhole size={18} /> : done ? <CheckCircle2 size={19} /> : <ArrowRight size={19} />}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MissionView({ session, lang, completed, onToggleCompleted, onBack, onStartPractice }: {
  session: CourseSession;
  lang: Lang;
  completed: boolean;
  onToggleCompleted: () => void;
  onBack: () => void;
  onStartPractice: () => void;
}) {
  const teacherMode = useTeacherCourse();
  const [showFullSituation, setShowFullSituation] = useState(false);
  const labels = ui[lang];
  const unit = getUnit(session.unit);
  const situationParts = lang === "fr"
    ? [
        { label: "Contexte", value: session.situation.fr },
        { label: "Fonction", value: session.mission.fr },
        { label: "Consigne", value: `Avec ton binôme, réalise les activités proposées et prépare : ${session.deliverable.fr}` },
        { label: "Tâches / activités", value: session.workshops.map((workshop) => `Atelier ${workshop.label} : ${workshop.text.fr}`).join(" · ") },
      ]
    : [
        { label: "السياق", value: session.situation.ar },
        { label: "الوظيفة", value: session.mission.ar },
        { label: "التعليمة", value: `أنجز الأنشطة مع زميلك ثم حضّر: ${session.deliverable.ar}` },
        { label: "المهام / الأنشطة", value: session.workshops.map((workshop) => `الورشة ${workshop.label}: ${workshop.text.ar}`).join(" · ") },
      ];
  return (
    <div className="tab-content simple-mission page-enter">
      {session.objectives[0] && (
        <div className="mission-goal" role="note">
          <Sparkles size={19} aria-hidden="true" />
          <p><strong lang="ar" dir="rtl">هدف الحصة:</strong> <span lang="ar" dir="rtl">{session.objectives[0].ar}</span></p>
        </div>
      )}
      <section className={`session-hero unit-${session.unit}`}>
        <div className="session-hero-number"><span>{labels.session}</span><strong>{padTime(session.id)}</strong></div>
        <div className="session-hero-copy">
          <div className="session-meta">
            <UnitMark unit={session.unit} />
            <span>{txt(unit.title, lang)}</span>
            <span className="meta-dot" />
            <Clock3 size={15} />
            <strong>2H · {session.unit === 1
              ? `${unit1Labs[session.id as 1 | 2 | 3].exercises.length} ${lang === "fr" ? "EXERCICES" : "تمرينًا"}`
              : "85 MIN PRATIQUE"}</strong>
          </div>
          <h1>{session.id === 3 ? <BilingualText value={session.title} /> : txt(session.title, lang)}</h1>
          <p>{session.id === 3 ? <BilingualText value={session.subtitle} /> : txt(session.subtitle, lang)}</p>
        </div>
        {!teacherMode && <button className={`complete-button ${completed ? "done" : ""}`} onClick={onToggleCompleted}>
          {completed ? <CheckCircle2 size={19} /> : <Circle size={19} />}
          {session.id === 3 ? <BilingualText value={{ fr: completed ? ui.fr.completed : ui.fr.complete, ar: completed ? ui.ar.completed : ui.ar.complete }} /> : completed ? labels.completed : labels.complete}
        </button>}
        <div className="session-hero-pattern" aria-hidden="true"><span /><span /><span /><span /></div>
      </section>
      {session.brief && !teacherMode && (
        <article className="content-card brief-card">
          <span className="card-kicker"><Sparkles size={16} /> <span lang="ar" dir="rtl">القصة باختصار</span></span>
          <p className="brief-text"><span lang="ar" dir="rtl">{session.brief.ar}</span></p>
          <p className="brief-fr">{session.brief.fr}</p>
          {session.id !== 2 && (
            <button type="button" className="brief-toggle" onClick={() => setShowFullSituation(value => !value)} aria-expanded={showFullSituation}>
              {showFullSituation
                ? <><span lang="ar" dir="rtl">إخفاء التفاصيل</span></>
                : <><BookOpen size={16} /><span lang="ar" dir="rtl">اقرأ المزيد — التفاصيل الكاملة</span></>}
            </button>
          )}
        </article>
      )}
      {session.id === 2 ? (
        <>
          <section className="s2-mission-intro" aria-labelledby="s2-mission-intro-title">
            <div className="s2-mission-intro-copy">
              <span className="card-kicker"><BookOpen size={18} /> Avant de commencer · قبل أن تبدأ</span>
              <h2 id="s2-mission-intro-title"><BilingualText value={{
                fr: "Aujourd’hui, tu vas comprendre comment fonctionne le matériel d’un ordinateur.",
                ar: "اليوم ستفهم كيف تعمل معدات الحاسوب.",
              }} /></h2>
              <p><BilingualText value={{
                fr: "Prends deux minutes pour lire cette mission. Elle t’explique ce que tu vas apprendre et comment avancer dans l’atelier.",
                ar: "خذ دقيقتين لقراءة هذه المهمة. ستتعرف على ما ستتعلمه وكيف ستتقدم في الورشة.",
              }} /></p>
            </div>
            <aside className="s2-mission-challenge">
              <Target size={30} />
              <span>TON DÉFI · تحديك</span>
              <strong><BilingualText value={{
                fr: "Aider le collège à choisir, assembler et dépanner un poste informatique.",
                ar: "مساعدة المؤسسة على اختيار حاسوب وتركيبه وإصلاحه.",
              }} /></strong>
            </aside>
          </section>

          <section className="s2-mission-orientation">
            <article className="s2-learning-card">
              <header>
                <span><Target size={19} /></span>
                <div>
                  <small>CE QUE JE VAIS APPRENDRE · ماذا سأتعلم؟</small>
                  <h2><BilingualText value={{ fr: "Mes objectifs", ar: "أهدافي" }} /></h2>
                </div>
              </header>
              <ol>
                {[
                  { fr: "Distinguer l’unité centrale des périphériques.", ar: "أميز الوحدة المركزية عن الملحقات." },
                  { fr: "Classer les périphériques selon le sens de l’information.", ar: "أصنف الملحقات حسب اتجاه انتقال المعلومة." },
                  { fr: "Reconnaître les composants internes et leurs rôles.", ar: "أتعرف على المكونات الداخلية ووظائفها." },
                  { fr: "Convertir les capacités et choisir un ordinateur adapté.", ar: "أحوّل وحدات السعة وأختار حاسوبا مناسبا." },
                ].map((objective, index) => (
                  <li key={objective.fr}><span className="s2-step-number">{index + 1}</span><BilingualText value={objective} /></li>
                ))}
              </ol>
            </article>

            <article className="s2-route-card">
              <header>
                <span><MousePointer2 size={19} /></span>
                <div>
                  <small>CE QUE JE VAIS FAIRE · ماذا سأنجز؟</small>
                  <h2><BilingualText value={{ fr: "Mon parcours", ar: "مساري" }} /></h2>
                </div>
              </header>
              <ol>
                {[
                  { fr: "Observer et reconnaître le matériel", ar: "ألاحظ المعدات وأتعرف عليها" },
                  { fr: "Classer les périphériques et associer les fonctions", ar: "أصنف الملحقات وأربطها بوظائفها" },
                  { fr: "Calculer les conversions de capacité", ar: "أحسب تحويلات وحدات السعة" },
                  { fr: "Choisir une configuration adaptée", ar: "أختار تجهيزا مناسبا" },
                  { fr: "Assembler puis dépanner le PC", ar: "أركب الحاسوب ثم أشخص أعطاله" },
                ].map((step, index) => (
                  <li key={step.fr}><span className="s2-step-number">{index + 1}</span><BilingualText value={step} /></li>
                ))}
              </ol>
            </article>
          </section>

          <section className="s2-mission-rules" aria-label="Règles de réussite / قواعد النجاح">
            {[
              { fr: "Lis toute la consigne en français et en arabe.", ar: "اقرأ التعليمة كاملة بالفرنسية والعربية." },
              { fr: "Observe l’image et vérifie le nombre de réponses demandé.", ar: "لاحظ الصورة وتحقق من عدد الأجوبة المطلوبة." },
              { fr: "Vérifie, corrige puis réessaie : la suite se débloque après la réussite.", ar: "تحقق وصحح ثم أعد المحاولة: يفتح التالي بعد النجاح." },
            ].map((rule) => (
              <div key={rule.fr}><CheckCircle2 size={20} /><BilingualText value={rule} /></div>
            ))}
          </section>
        </>
      ) : session.id === 3 ? <Session3Overview /> : (
        (teacherMode || !session.brief || showFullSituation) && (
        <article className="content-card situation-card simple-situation">
          <span className="card-kicker"><FolderKanban size={16} /> {labels.situation}</span>
          <div className="situation-parts">
            {situationParts.map((part, index) => (
              <section key={part.label} className={index === 2 ? "instruction" : ""}>
                <span>{index + 1}</span>
                <div><strong>{part.label}</strong><p>{part.value}</p></div>
              </section>
            ))}
          </div>
        </article>
        )
      )}
      {session.id === 2 && (
        <>
          <section className="s2-restaurant-launcher" aria-labelledby="s2-restaurant-title">
            <div>
              <span className="card-kicker"><Sparkles size={16} /> Activité de découverte · نشاط استكشافي</span>
              <h2 id="s2-restaurant-title"><BilingualText value={{
                fr: "Découvre le restaurant de l’ordinateur",
                ar: "اكتشف مطعم الحاسوب",
              }} /></h2>
              <p><BilingualText value={{
                fr: "Explore cette activité dans un nouvel onglet, puis reviens ici pour observer le matériel et commencer les exercices.",
                ar: "استكشف هذا النشاط في علامة تبويب جديدة، ثم عد إلى هنا لملاحظة المعدات وبدء التمارين.",
              }} /></p>
            </div>
            <a
              href="https://tabdellah.github.io/c0/Le_restaurant_ordinateur.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{lang === "fr" ? "Ouvrir l’activité" : "فتح النشاط"}</span>
              <ExternalLink size={18} aria-hidden="true" />
            </a>
          </section>

          <section className="mission-visual-library" aria-labelledby="mission-visual-title">
          <div className="mission-visual-heading">
            <span className="card-kicker"><ImageIcon size={16} />{lang === "fr" ? "J’observe avant de pratiquer" : "ألاحظ قبل التطبيق"}</span>
            <h2 id="mission-visual-title"><BilingualText value={{ fr: "Trois repères pour comprendre le matériel", ar: "ثلاث دعامات لفهم معدات الحاسوب" }} /></h2>
            <p><BilingualText value={{ fr: "Observe les images avec ton binôme. Ne cherche pas à tout mémoriser : repère le sens de circulation de l’information et le rôle de chaque matériel.", ar: "لاحظ الصور مع زميلك. لا تحاول حفظ كل شيء، بل ابحث عن اتجاه انتقال المعلومة ووظيفة كل جهاز." }} /></p>
          </div>
          <div className="mission-visual-grid">
            {[
              { src: "session2/mission-categories.png", fr: "1 · Comment circule l’information ?", ar: "1 · كيف تنتقل المعلومة؟" },
              { src: "session2/mission-fonctions.png", fr: "2 · À quoi sert chaque périphérique ?", ar: "2 · ما وظيفة كل ملحق؟" },
              { src: "session2/mission-composants.png", fr: "3 · Que trouve-t-on dans l’unité centrale ?", ar: "3 · ماذا نجد داخل الوحدة المركزية؟" },
            ].map((visual) => (
          <figure key={visual.src}>
            <img src={publicAsset(visual.src)} alt={lang === "fr" ? visual.fr : visual.ar} loading="lazy" />
            <figcaption>
              <BilingualText value={{ fr: visual.fr, ar: visual.ar }} />
              <a href={visual.src} target="_blank" rel="noreferrer">
                <ImageIcon size={15} />
                {lang === "fr" ? "Agrandir l’image" : "تكبير الصورة"}
              </a>
            </figcaption>
          </figure>
            ))}
          </div>
          </section>
        </>
      )}
      <div className={`mission-support-grid ${session.id === 2 ? "s2-mission-support" : ""}`}>
        {session.id !== 2 && (
          <article className="content-card objective-card">
            <span className="card-kicker">{session.id === 3 ? <BilingualText value={{ fr: ui.fr.objectives, ar: ui.ar.objectives }} /> : labels.objectives}</span>
            <ol className="objective-list">
              {session.objectives.map((objective, index) => (
                <li key={objective.fr}><span>{index + 1}</span><p>{session.id === 3 ? <BilingualText value={objective} /> : txt(objective, lang)}</p></li>
              ))}
            </ol>
          </article>
        )}
        <article className="content-card pair-card">
          <span className="card-kicker"><Users size={16} /> {session.id === 3 ? <BilingualText value={{ fr: ui.fr.organization, ar: ui.ar.organization }} /> : labels.organization}</span>
          <div className="role-row"><span>P</span><div><strong>{session.id === 3 ? <BilingualText value={{ fr: ui.fr.pilot, ar: ui.ar.pilot }} /> : labels.pilot}</strong><small>{session.id === 3 ? <BilingualText value={{ fr: ui.fr.pilotText, ar: ui.ar.pilotText }} /> : labels.pilotText}</small></div></div>
          <div className="role-row"><span>C</span><div><strong>{session.id === 3 ? <BilingualText value={{ fr: ui.fr.copilot, ar: ui.ar.copilot }} /> : labels.copilot}</strong><small>{session.id === 3 ? <BilingualText value={{ fr: ui.fr.copilotText, ar: ui.ar.copilotText }} /> : labels.copilotText}</small></div></div>
        </article>
      </div>
      <button className="practice-button mission-start-button" onClick={onStartPractice}>
        <MousePointer2 size={18} />
        {session.id === 2
          ? <BilingualText value={{ fr: "J’ai compris — commencer l’atelier", ar: "فهمت — أبدأ الورشة" }} />
          : session.id === 3 ? <BilingualText value={{ fr: ui.fr.startPractice, ar: ui.ar.startPractice }} /> : labels.startPractice}
      </button>
      <button className="back-link mission-back-link" onClick={onBack}><ArrowLeft size={17} />{session.id === 3 ? <BilingualText value={{ fr: ui.fr.back, ar: ui.ar.back }} /> : labels.back}</button>
    </div>
  );
}

function ExerciseNavigation({ index, total, done, lang, onPrevious, onNext, nextLabel, nextDisabled = false, progressLabel, resultStatus, onReviewLesson }: {
  index: number;
  total: number;
  done: number;
  lang: Lang;
  onPrevious: () => void;
  onNext: () => void;
  nextLabel?: LocalizedText;
  nextDisabled?: boolean;
  progressLabel?: LocalizedText;
  resultStatus?: boolean | null;
  onReviewLesson?: () => void;
}) {
  const teacherMode = useTeacherCourse();
  const percent = total ? Math.round(done / total * 100) : 0;
  const milestone = teacherMode ? null : done >= total && total > 0
    ? { fr: "Atelier terminé, bravo !", ar: "أنهيت كل تمارين الورشة، برافو!" }
    : done >= 10
      ? { fr: "Excellent rythme, continue !", ar: "إيقاع رائع، واصل!" }
      : done >= 5
        ? { fr: "Beau travail, tu avances bien !", ar: "عمل جميل، أنت تتقدم بسرعة!" }
        : null;
  return (
    <nav className="exercise-navigation simple-exercise-navigation" aria-label="Navigation des exercices / التنقل بين التمارين">
      <button type="button" disabled={index === 0} onClick={onPrevious}>
        <ArrowLeft size={18} />
        <BilingualText value={{ fr: "Exercice précédent", ar: "التمرين السابق" }} />
      </button>
      <div className="exercise-progress-summary" aria-live="polite">
        <strong>{lang === "fr" ? "Exercice" : "التمرين"} {index + 1} / {total}</strong>
        {!teacherMode && <div className="exercise-progress-track" role="progressbar" aria-label="Exercices réussis / التمارين الناجحة" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
          <span style={{ width: `${percent}%` }} />
        </div>}
        {teacherMode ? <small>Mode professeur · navigation libre</small> : <small>{done}/{total} {txt(progressLabel ?? { fr: "réussis", ar: "ناجحة" }, lang)}</small>}
        {milestone && <div className="exercise-milestone" role="status"><span aria-hidden="true">⭐</span><BilingualText value={milestone} /></div>}
        {!teacherMode && resultStatus !== undefined && resultStatus !== null && (
          <div className={`exercise-current-status ${resultStatus === true ? "success" : resultStatus === false ? "retry" : "waiting"}`} role="status" aria-live="polite">
            {resultStatus === true ? <CheckCircle2 size={16} /> : resultStatus === false ? <AlertTriangle size={16} /> : <LockKeyhole size={16} />}
            <BilingualText value={resultStatus === true
              ? { fr: "Exercice réussi · la suite est débloquée", ar: "تم التمرين بنجاح · تم فتح التالي" }
              : { fr: "Pas encore réussi · corrige puis réessaie", ar: "لم ينجح بعد · صحح ثم أعد المحاولة" }} />
          </div>
        )}
      </div>
      <button type="button" className="exercise-next-button" disabled={!teacherMode && nextDisabled} onClick={onNext}>
        <BilingualText value={nextLabel ?? { fr: "Exercice suivant", ar: "التمرين التالي" }} />
        <ArrowRight size={18} />
      </button>
      {!teacherMode && nextDisabled && resultStatus !== true && (
        <p className="exercise-next-hint"><LockKeyhole size={14} aria-hidden="true" /><span lang="ar" dir="rtl">جرّب هاد التمرين أولا — ملي تحاول، غادي يتفتح ليك التالي وخا ما كملتيش، وترجع ليه من بعد من الحصيلة.</span></p>
      )}
      {!teacherMode && resultStatus === false && onReviewLesson && (
        <div className="exercise-help">
          <p><span lang="ar" dir="rtl"><strong>صعب شوية؟</strong> الجواب موجود في خلاصة الدرس — راجعها وارجع لهاد التمرين.</span></p>
          <button type="button" onClick={onReviewLesson}><BookOpen size={16} /><span lang="ar" dir="rtl">راجع خلاصة الدرس</span></button>
        </div>
      )}
    </nav>
  );
}

function sameNumbers(left: number[], right: number[]) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function shuffledIndices(length: number, seed: string) {
  const indices = Array.from({ length }, (_, index) => index);
  let state = Array.from(seed).reduce((value, character) => Math.imul(value ^ character.charCodeAt(0), 16777619), 2166136261) >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let index = indices.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [indices[index], indices[randomIndex]] = [indices[randomIndex], indices[index]];
  }
  return indices;
}

function ExercisePlayer({
  exercise,
  lang,
  alreadyCompleted,
  onComplete,
  onResult,
  draft,
  onDraftChange,
  participantId,
}: {
  exercise: Unit1Exercise;
  lang: Lang;
  alreadyCompleted: boolean;
  onComplete: () => void;
  onResult: (answer: unknown, correct: boolean, score: number) => void;
  draft?: ExerciseDraft;
  onDraftChange: (draft: ExerciseDraft) => void;
  participantId?: string;
}) {
  type WorkingDraft=Omit<ExerciseDraft,"multi">&{multi:Set<number>};
  const initialDraft:WorkingDraft={choice:draft?.choice??null,multi:new Set(draft?.multi??[]),matches:draft?.matches??{},sequence:draft?.sequence??[],textValue:draft?.textValue??"",conversionValues:draft?.conversionValues??{},diagnosticComponent:draft?.diagnosticComponent??null,diagnosticRepair:draft?.diagnosticRepair??null,gestureProgress:draft?.gestureProgress??(exercise.type==="gesture"&&exercise.mode==="precision"&&alreadyCompleted?5:0),systemLab:draft?.systemLab,windows11:draft?.windows11,result:draft?draft.result:(alreadyCompleted?true:null)};
  const [working,setWorkingRaw]=useState(initialDraft),workingRef=useRef(working),draftCallback=useRef(onDraftChange);draftCallback.current=onDraftChange;
  const setWorking=useCallback((update:React.SetStateAction<WorkingDraft>)=>{const next=typeof update==="function"?update(workingRef.current):update;if(next===workingRef.current)return;workingRef.current=next;draftCallback.current({...next,multi:[...next.multi]});setWorkingRaw(next)},[]);
  const {choice,multi,matches,sequence,textValue,conversionValues,diagnosticComponent,diagnosticRepair,gestureProgress,systemLab,windows11,result}=working;
  const setChoice=useLearningField(setWorking,"choice"),setMulti=useLearningField(setWorking,"multi"),setMatches=useLearningField(setWorking,"matches"),setSequence=useLearningField(setWorking,"sequence"),setTextValue=useLearningField(setWorking,"textValue"),setConversionValues=useLearningField(setWorking,"conversionValues"),setDiagnosticComponent=useLearningField(setWorking,"diagnosticComponent"),setDiagnosticRepair=useLearningField(setWorking,"diagnosticRepair"),setGestureProgress=useLearningField(setWorking,"gestureProgress"),setSystemLab=useLearningField(setWorking,"systemLab"),setWindows11=useLearningField(setWorking,"windows11"),setResult=useLearningField(setWorking,"result");
  const [dragSelection,setDragSelection]=useState<number|null>(null);
  const resultRef=useRef<HTMLDivElement>(null);
  const seedPrefix = `${participantId ?? "anon"}-`;
  const choiceOrder = useMemo(
    () => shuffledIndices(exercise.type === "choice" || exercise.type === "multi" ? exercise.choices.length : 0, `${seedPrefix}${exercise.id}-choices`),
    [exercise],
  );
  const categoryOrder = useMemo(
    () => shuffledIndices(exercise.type === "match" ? exercise.categories.length : 0, `${seedPrefix}${exercise.id}-categories`),
    [exercise],
  );
  const sequenceOrder = useMemo(
    () => {
      const order = shuffledIndices(exercise.type === "sequence" ? exercise.steps.length : 0, `${seedPrefix}${exercise.id}-sequence`);
      return exercise.type === "sequence" && exercise.id.startsWith("s3-") && order.every((value, index) => value === index)
        ? exercise.shuffled
        : order;
    },
    [exercise],
  );
  const diagnosticComponentOrder = useMemo(
    () => shuffledIndices(exercise.type === "diagnostic" ? exercise.components.length : 0, `${seedPrefix}${exercise.id}-components`),
    [exercise],
  );
  const diagnosticRepairOrder = useMemo(
    () => shuffledIndices(exercise.type === "diagnostic" ? exercise.repairs.length : 0, `${seedPrefix}${exercise.id}-repairs`),
    [exercise],
  );

  const typeLabel: Record<Unit1Exercise["type"], LocalizedText> = {
    choice: { fr: "Choix unique", ar: "اختيار واحد" },
    multi: { fr: "Choix multiple", ar: "اختيار متعدد" },
    match: { fr: "Classement", ar: "تصنيف" },
    sequence: { fr: "Mise en ordre", ar: "ترتيب" },
    text: { fr: "Réponse courte", ar: "جواب قصير" },
    conversions: { fr: "Conversions", ar: "تحويلات" },
    diagnostic: { fr: "Diagnostic en 2 étapes", ar: "تشخيص في مرحلتين" },
    gesture: { fr: "Manipulation", ar: "تطبيق عملي" },
    "system-lab": { fr: "Manipulation guidée", ar: "تطبيق موجه" },
    hotspot: { fr: "Je repère sur l’image", ar: "أحدد على الصورة" },
  };
  const currentTypeLabel = exercise.type === "match" && exercise.interaction === "drag"
    ? { fr: "Glisser-déposer", ar: "سحب وإفلات" }
    : typeLabel[exercise.type];

  function recordResult(correct: boolean, answer: unknown) {
    setResult(correct);
    const score = correct ? 100 : unit1DraftPercent(exercise, {...workingRef.current, multi: [...workingRef.current.multi]}) ?? 0;
    onResult(answer, correct, score);
    if (correct) onComplete();
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }));
  }

  function checkCurrent() {
    if (exercise.type === "hotspot") recordResult(choice === exercise.answer, {
      question: exercise.prompt,
      image: exercise.image.src,
      selectedZone: choice,
      expectedZone: exercise.answer,
    });
    if (exercise.type === "choice") recordResult(choice === exercise.answer, {
      question: exercise.prompt,
      selectedIndex: choice,
      selectedChoice: choice === null ? null : exercise.choices[choice],
      correctIndex: exercise.answer,
      correctChoice: exercise.choices[exercise.answer],
    });
    if (exercise.type === "multi") {
      const selectedIndices = [...multi].sort((a, b) => a - b);
      recordResult(sameNumbers(selectedIndices, [...exercise.answers].sort((a, b) => a - b)), {
        question: exercise.prompt,
        selectedIndices,
        selectedChoices: selectedIndices.map((index) => exercise.choices[index]),
        correctIndices: exercise.answers,
        correctChoices: exercise.answers.map((index) => exercise.choices[index]),
      });
    }
    if (exercise.type === "match") {
      recordResult(
        exercise.rows.every((row, index) => matches[index] === row.answer),
        {
          question: exercise.prompt,
          matches: exercise.rows.map((row, index) => ({
            item: row.label,
            selected: matches[index] === undefined ? null : exercise.categories[matches[index]],
            expected: exercise.categories[row.answer],
            correct: matches[index] === row.answer,
          })),
        }
      );
    }
    if (exercise.type === "sequence") {
      recordResult(sameNumbers(sequence, exercise.steps.map((_, index) => index)), {
        question: exercise.prompt,
        sequence: sequence.map((index) => exercise.steps[index]),
        expectedSequence: exercise.steps,
      });
    }
    if (exercise.type === "text") {
      const proposed = normalizeAnswer(textValue);
      const acceptedAnswers = [...exercise.accepted.fr, ...exercise.accepted.ar];
      recordResult(acceptedAnswers.some((answer) => normalizeAnswer(answer) === proposed), {
        question: exercise.prompt,
        text: textValue.trim(),
        acceptedAnswers,
      });
    }
    if (exercise.type === "conversions") {
      const details = exercise.rows.map((row, index) => {
        const proposed = normalizeAnswer(conversionValues[index] ?? "").replace(/\s/g, "").replace(",", ".");
        const correct = row.accepted.some((answer) => normalizeAnswer(answer).replace(/\s/g, "").replace(",", ".") === proposed);
        return { conversion: `${row.before} … ${row.after}`, answer: conversionValues[index] ?? "", expected: row.accepted[0], correct };
      });
      recordResult(details.every((item) => item.correct), { question: exercise.prompt, conversions: details });
    }
    if (exercise.type === "diagnostic") {
      const componentCorrect = diagnosticComponent === exercise.componentAnswer;
      const repairCorrect = diagnosticRepair === exercise.repairAnswer;
      recordResult(componentCorrect && repairCorrect, {
        question: exercise.prompt,
        scenario: exercise.scenario,
        selectedComponent: diagnosticComponent === null ? null : exercise.components[diagnosticComponent].label,
        correctComponent: exercise.components[exercise.componentAnswer].label,
        selectedRepair: diagnosticRepair === null ? null : exercise.repairs[diagnosticRepair],
        correctRepair: exercise.repairs[exercise.repairAnswer],
        componentCorrect,
        repairCorrect,
      });
    }
  }

  function checkSystemLab(state: SystemLabState, checks: boolean[]) {
    if (exercise.type !== "system-lab") return;
    recordResult(checks.every(Boolean), {
      question: exercise.prompt,
      mode: exercise.mode,
      environment: "simulation",
      checks,
      completedMissions: checks.filter(Boolean).length,
      totalMissions: checks.length,
      state,
    });
  }

  const canCheck =
    (exercise.type === "hotspot" && choice !== null) ||
    (exercise.type === "choice" && choice !== null) ||
    (exercise.type === "multi" && multi.size > 0) ||
    (exercise.type === "match" && Object.keys(matches).length > 0) ||
    (exercise.type === "sequence" && sequence.length > 0) ||
    (exercise.type === "text" && textValue.trim().length > 0) ||
    (exercise.type === "conversions" && exercise.rows.some((_, index) => conversionValues[index]?.trim())) ||
    (exercise.type === "diagnostic" && (diagnosticComponent !== null || diagnosticRepair !== null));

  return (
    <article data-exercise-id={exercise.id} className={`exercise-player level-${exercise.level} ${exercise.id.startsWith("s3-") ? "s3-visual-exercise" : ""}`}>
      <div className="exercise-copy">
        <div className="exercise-meta">
          <strong>{txt(currentTypeLabel, lang)}</strong>
          {exercise.minutes && <small className="exercise-time"><Clock3 size={14} />{exercise.minutes} min</small>}
          {alreadyCompleted && <small><CheckCircle2 size={14} />{lang === "fr" ? "Déjà réussi" : "تم بنجاح"}</small>}
        </div>
        <h3><BilingualText value={exercise.title} /></h3>
        <div className="exercise-prompt">
          <span className="instruction-label">التعليمة · Consigne</span>
          <p className="prompt-ar-first"><span lang="ar" dir="rtl" className="prompt-ar">{exercise.prompt.ar}</span><small className="prompt-fr">{exercise.prompt.fr}</small></p>
          {exercise.tasks && <ol className="exercise-task-list">{exercise.tasks.map((task, index) => <li key={index}><BilingualText value={task} /></li>)}</ol>}
          {exercise.instructionImage && <figure className="exercise-instruction-image"><img src={publicAsset(exercise.instructionImage.src)} alt={bilingualAria(exercise.instructionImage.alt)} /><figcaption><BilingualText value={exercise.instructionImage.caption} /></figcaption></figure>}
        </div>
      </div>

      {exercise.id.startsWith("s3-") && <Session3ExerciseGuide id={exercise.id} />}
      {exercise.image && exercise.type !== "hotspot" && (
        <figure className="exercise-image">
          <img src={publicAsset(exercise.image.src)} alt={bilingualAria(exercise.image.alt)} loading="lazy" referrerPolicy="no-referrer" />
          <figcaption><ImageIcon size={14} />{txt(exercise.image.caption, lang)}</figcaption>
        </figure>
      )}

      {exercise.type === "hotspot" && (
        <figure className="s3-hotspot-figure">
          <div className="s3-hotspot-canvas">
            <img src={publicAsset(exercise.image.src)} alt={bilingualAria(exercise.image.alt)} />
            {exercise.regions.map((region, index) => <button
              type="button"
              key={index}
              className={`s3-hotspot-area ${choice === index ? "selected" : ""} ${result === true && choice === index ? "correct" : ""}`}
              style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.width}%`, height: `${region.height}%` }}
              aria-label={`Zone ${index + 1} / المنطقة ${index + 1}`}
              aria-pressed={choice === index}
              onClick={() => { setChoice(index); setResult(null); }}
            ><span>{index + 1}</span></button>)}
          </div>
          <figcaption><BilingualText value={exercise.image.caption} /></figcaption>
        </figure>
      )}

      {exercise.type === "choice" && (
        <div className="exercise-options">
          {choiceOrder.map((originalIndex, displayIndex) => {
            const item = exercise.choices[originalIndex];
            return (
            <button
              className={`${choice === originalIndex ? "selected" : ""} ${exercise.choiceImages?.[originalIndex] ? "option-with-image" : ""}`}
              key={item.fr}
              onClick={() => { setChoice(originalIndex); setResult(null); }}
            >
              <span className="option-marker">{String.fromCharCode(65 + displayIndex)}</span>
              {exercise.choiceImages?.[originalIndex] && <img className="option-image" src={publicAsset(exercise.choiceImages[originalIndex] ?? "")} alt="" loading="lazy" />}
              <BilingualText value={item} />
            </button>
            );
          })}
        </div>
      )}

      {exercise.type === "multi" && (
        <div className="exercise-options multi-options">
          {choiceOrder.map((originalIndex) => {
            const item = exercise.choices[originalIndex];
            const selected = multi.has(originalIndex);
            return (
              <button
                className={`${selected ? "selected" : ""} ${exercise.choiceImages?.[originalIndex] ? "option-with-image" : ""}`}
                key={item.fr}
                onClick={() => {
                  setMulti((current) => {
                    const next = new Set(current);
                    if (next.has(originalIndex)) next.delete(originalIndex); else next.add(originalIndex);
                    return next;
                  });
                  setResult(null);
                }}
              >
                <span className="option-marker">{selected ? <Check size={14} /> : <Circle size={14} />}</span>
                {exercise.choiceImages?.[originalIndex] && <img className="option-image" src={publicAsset(exercise.choiceImages[originalIndex] ?? "")} alt="" loading="lazy" />}
                <BilingualText value={item} />
              </button>
            );
          })}
        </div>
      )}

      {exercise.type === "match" && exercise.interaction === "drag" && (
        <div className="drag-classification">
          <section className="drag-bank" aria-label={lang === "fr" ? "Éléments à classer" : "عناصر التصنيف"}>
            <header>
              <strong>{lang === "fr" ? "Cartes à classer" : "بطاقات للتصنيف"}</strong>
              <small>{lang === "fr" ? "Glisse ou touche une carte" : "اسحب أو المس بطاقة"}</small>
            </header>
            <div className="drag-card-list">
              {exercise.rows.map((row, rowIndex) => matches[rowIndex] === undefined ? (
                <button
                  type="button"
                  draggable
                  className={`drag-card ${dragSelection === rowIndex ? "selected" : ""}`}
                  key={row.label.fr}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", String(rowIndex));
                    event.dataTransfer.effectAllowed = "move";
                    setDragSelection(rowIndex);
                  }}
                  onClick={() => setDragSelection((current) => current === rowIndex ? null : rowIndex)}
                >
                  {row.image && <img src={publicAsset(row.image)} alt="" loading="lazy" />}
                  <strong><BilingualText value={row.label} /></strong>
                </button>
              ) : null)}
              {Object.keys(matches).length === exercise.rows.length && (
                <p className="drag-bank-empty"><CheckCircle2 size={17} />{lang === "fr" ? "Toutes les cartes sont placées." : "تم وضع جميع البطاقات."}</p>
              )}
            </div>
          </section>
          <div className="drag-zones">
            {categoryOrder.map((categoryIndex) => {
              const category = exercise.categories[categoryIndex];
              const placedRows = exercise.rows
                .map((row, rowIndex) => ({ row, rowIndex }))
                .filter(({ rowIndex }) => matches[rowIndex] === categoryIndex);
              const placeRow = (rowIndex: number) => {
                if (!Number.isInteger(rowIndex) || !exercise.rows[rowIndex]) return;
                setMatches((current) => ({ ...current, [rowIndex]: categoryIndex }));
                setDragSelection(null);
                setResult(null);
              };
              return (
                <section
                  className={`drag-zone ${dragSelection !== null ? "ready" : ""}`}
                  key={category.fr}
                  onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}
                  onDrop={(event) => {
                    event.preventDefault();
                    placeRow(Number(event.dataTransfer.getData("text/plain")));
                  }}
                  onClick={() => { if (dragSelection !== null) placeRow(dragSelection); }}
                >
                  <header>
                    <strong><BilingualText value={category} /></strong>
                    <small>{placedRows.length}</small>
                  </header>
                  <div className="drag-zone-items">
                    {placedRows.map(({ row, rowIndex }) => (
                      <button
                        type="button"
                        draggable
                        className={`drag-card placed ${result === false ? (row.answer === categoryIndex ? "answer-correct" : "answer-wrong") : ""}`}
                        key={row.label.fr}
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", String(rowIndex));
                          event.dataTransfer.effectAllowed = "move";
                          setDragSelection(rowIndex);
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          setMatches((current) => {
                            const next = { ...current };
                            delete next[rowIndex];
                            return next;
                          });
                          setDragSelection(rowIndex);
                          setResult(null);
                        }}
                        title={lang === "fr" ? "Toucher pour déplacer" : "المس لنقل البطاقة"}
                      >
                        {row.image && <img src={publicAsset(row.image)} alt="" loading="lazy" />}
                        <strong><BilingualText value={row.label} /></strong>
                      </button>
                    ))}
                    {placedRows.length === 0 && <p>{lang === "fr" ? "Dépose ici" : "ضع هنا"}</p>}
                  </div>
                </section>
              );
            })}
          </div>
          <button
            type="button"
            className="reset-drag"
            onClick={() => { setMatches({}); setDragSelection(null); setResult(null); }}
          >
            <RefreshCw size={15} />{lang === "fr" ? "Recommencer le classement" : "إعادة التصنيف"}
          </button>
        </div>
      )}

      {exercise.type === "match" && exercise.interaction !== "drag" && (
        <div className="match-board">
          {exercise.rows.map((row, rowIndex) => (
            <div
              className={`match-row ${result === false ? (matches[rowIndex] === row.answer ? "answer-correct" : "answer-wrong") : ""}`}
              key={row.label.fr}
            >
              <div className="match-item">
                {row.content && <div className="s3-text-document"><BilingualText value={row.content} /></div>}
                {row.image && !row.video && <img src={publicAsset(row.image)} alt="" loading="lazy" />}
                {row.audio && <audio src={publicAsset(row.audio)} controls preload="metadata" aria-label={bilingualAria(row.label)} />}
                {row.video && <video src={publicAsset(row.video)} poster={publicAsset(row.image)} controls playsInline preload="metadata" aria-label={bilingualAria(row.label)} />}
                <strong><BilingualText value={row.label} /></strong>
              </div>
              <div className="match-answers">
                {exercise.categories.length > 5 ? (
                  <select
                    value={matches[rowIndex] ?? ""}
                    onChange={(event) => {
                      setMatches((current) => ({ ...current, [rowIndex]: Number(event.target.value) }));
                      setResult(null);
                    }}
                    aria-label={`${row.label.fr} / ${row.label.ar}`}
                  >
                    <option value="" disabled>{lang === "fr" ? "Choisir la réponse…" : "اختر الجواب…"}</option>
                    {categoryOrder.map((categoryIndex) => (
                      <option key={categoryIndex} value={categoryIndex}>
                        {exercise.categories[categoryIndex].fr} — {exercise.categories[categoryIndex].ar}
                      </option>
                    ))}
                  </select>
                ) : categoryOrder.map((categoryIndex) => {
                  const category = exercise.categories[categoryIndex];
                  return (
                  <button
                    key={category.fr}
                    className={`${matches[rowIndex] === categoryIndex ? "selected" : ""} ${exercise.categoryImages?.[categoryIndex] ? "visual-answer" : ""}`}
                    onClick={() => { setMatches((current) => ({ ...current, [rowIndex]: categoryIndex })); setResult(null); }}
                  >
                    {exercise.categoryImages?.[categoryIndex] && <img src={publicAsset(exercise.categoryImages[categoryIndex] ?? "")} alt="" loading="lazy" />}
                    <BilingualText value={category} />
                  </button>
                  );
                })}
              </div>
              {result === false && matches[rowIndex] !== row.answer && !exercise.id.startsWith("s3-") && (
                <small className="match-correction">
                  {lang === "fr" ? "Réponse attendue : " : "الجواب الصحيح: "}
                  <b>{txt(exercise.categories[row.answer], lang)}</b>
                </small>
              )}
            </div>
          ))}
        </div>
      )}

      {exercise.type === "sequence" && (
        <div className="sequence-board">
          <div className="sequence-answer" aria-label={lang === "fr" ? "Ordre choisi" : "الترتيب المختار"}>
            {exercise.steps.map((_, index) => {
              const selectedIndex = sequence[index];
              return (
                <div className={selectedIndex === undefined ? "empty" : "filled"} key={index}>
                  <span>{index + 1}</span>
                  <p>
                    {selectedIndex !== undefined && exercise.stepImages?.[selectedIndex] && <img src={publicAsset(exercise.stepImages[selectedIndex])} alt="" />}
                    <BilingualText
                      value={selectedIndex === undefined
                        ? { fr: "Choisir une étape", ar: "اختر مرحلة" }
                        : exercise.steps[selectedIndex]}
                    />
                  </p>
                </div>
              );
            })}
          </div>
          <div className="sequence-bank">
            {sequenceOrder.map((stepIndex) => (
              <button
                key={stepIndex}
                disabled={sequence.includes(stepIndex)}
                onClick={() => { setSequence((current) => [...current, stepIndex]); setResult(null); }}
              >
                {exercise.stepImages?.[stepIndex] && <img src={publicAsset(exercise.stepImages[stepIndex])} alt="" />}
                <BilingualText value={exercise.steps[stepIndex]} />
              </button>
            ))}
          </div>
          <button className="reset-sequence" onClick={() => { setSequence([]); setResult(null); }}>
            <RefreshCw size={15} />{lang === "fr" ? "Recommencer l’ordre" : "إعادة الترتيب"}
          </button>
        </div>
      )}

      {exercise.type === "text" && (
        <div className="text-answer">
          <input
            value={textValue}
            onChange={(event) => { setTextValue(event.target.value); setResult(null); }}
            onKeyDown={(event) => { if (event.key === "Enter" && textValue.trim()) checkCurrent(); }}
            placeholder={`${exercise.placeholder.fr} / ${exercise.placeholder.ar}`}
            aria-label={bilingualAria(exercise.prompt)}
          />
          <small>{lang === "fr" ? "Entrée ou le bouton Vérifier" : "اضغط Enter أو زر التحقق"}</small>
        </div>
      )}

      {exercise.type === "conversions" && (
        <div className="conversion-board">
          {exercise.rows.map((row, index) => (
            <label className={result === false ? "conversion-review" : ""} key={`${row.before}-${row.after}`}>
              <strong>{row.before}</strong>
              <input
                inputMode="decimal"
                value={conversionValues[index] ?? ""}
                onChange={(event) => {
                  setConversionValues((current) => ({ ...current, [index]: event.target.value }));
                  setResult(null);
                }}
                aria-label={`${row.before} ${row.after}`}
              />
              <strong>{row.after}</strong>
              {result === false && !exercise.id.startsWith("s3-") && <small>{lang === "fr" ? "Réponse :" : "الجواب:"} {row.accepted[0]}</small>}
            </label>
          ))}
        </div>
      )}

      {exercise.type === "diagnostic" && (
        <div className="diagnostic-board">
          <div className="diagnostic-scenario">
            <AlertTriangle size={24} />
            <div>
              <strong>{lang === "fr" ? "Panne observée" : "العطل الملاحظ"}</strong>
              <BilingualText value={exercise.scenario} />
            </div>
          </div>
          <section className="diagnostic-step">
            <header><span>1</span><strong>{lang === "fr" ? "Quel composant est en cause ?" : "ما المكوّن المسؤول؟"}</strong></header>
            <div className="diagnostic-options component-options">
              {diagnosticComponentOrder.map((originalIndex) => {
                const component = exercise.components[originalIndex];
                return (
                  <button
                    type="button"
                    className={diagnosticComponent === originalIndex ? "selected" : ""}
                    key={component.label.fr}
                    onClick={() => { setDiagnosticComponent(originalIndex); setResult(null); }}
                  >
                    {component.image && <img src={publicAsset(component.image)} alt="" loading="lazy" />}
                    <BilingualText value={component.label} />
                  </button>
                );
              })}
            </div>
          </section>
          <section className="diagnostic-step">
            <header><span>2</span><strong>{lang === "fr" ? "Quelle réparation choisis-tu ?" : "ما الإصلاح الذي تختاره؟"}</strong></header>
            <div className="diagnostic-options repair-options">
              {diagnosticRepairOrder.map((originalIndex) => (
                <button
                  type="button"
                  className={diagnosticRepair === originalIndex ? "selected" : ""}
                  key={exercise.repairs[originalIndex].fr}
                  onClick={() => { setDiagnosticRepair(originalIndex); setResult(null); }}
                >
                  <BilingualText value={exercise.repairs[originalIndex]} />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {exercise.type === "gesture" && exercise.mode === "precision" && (
        <div className="precision-board">
          {[1, 2, 3, 4, 5].map((target) => (
            <button
              key={target}
              className={`precision-target target-${target} ${gestureProgress >= target ? "hit" : ""}`}
              disabled={gestureProgress >= target}
              onClick={() => {
                if (target === gestureProgress + 1) {
                  const next = gestureProgress + 1;
                  setGestureProgress(next);
                  setResult(null);
                  if (next === 5) recordResult(true, { mode: "precision", completedTargets: 5 });
                } else {
                  setGestureProgress(0);
                  recordResult(false, { mode: "precision", clickedTarget: target, expectedTarget: gestureProgress + 1 });
                }
              }}
            >
              {gestureProgress >= target ? <Check size={18} /> : target}
            </button>
          ))}
          <span>{gestureProgress}/5</span>
        </div>
      )}

      {exercise.type === "gesture" && exercise.mode === "double" && (
        <div className="double-click-board">
          <button
            onClick={() => setResult(false)}
            onDoubleClick={() => recordResult(true, { mode: "double_click", completed: true })}
            aria-label="Dossier à ouvrir par double-clic — مجلد يفتح بالنقر المزدوج"
          >
            <FolderKanban size={54} />
            <BilingualText
              className="double-click-label"
              value={result === true
                ? { fr: "Dossier ouvert", ar: "تم فتح المجلد" }
                : { fr: "Mon dossier", ar: "مجلدي" }}
            />
          </button>
        </div>
      )}

      {exercise.type === "gesture" && exercise.mode === "typing" && (
        <div className="typing-board">
          <label htmlFor={`typing-${exercise.id}`}><BilingualText value={{ fr: "Ton prénom", ar: "اسمك" }} /></label>
          <input
            id={`typing-${exercise.id}`}
            value={textValue}
            enterKeyHint="enter"
            onChange={(event) => { setTextValue(event.target.value); setResult(null); }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.nativeEvent.keyCode === 13) recordResult(textValue.trim().length >= 2, { mode: "typing", text: textValue.trim() });
            }}
            placeholder="Écris ici… / اكتب هنا…"
          />
          <button
            type="button"
            className="typing-enter"
            onClick={() => recordResult(textValue.trim().length >= 2, { mode: "typing", text: textValue.trim() })}
          >
            Entrée / إدخال ↵
          </button>
          <p className="typing-mobile-hint">
            <BilingualText value={{ fr: "Sur téléphone : écris ton prénom, puis touche le bouton « Entrée » juste à côté.", ar: "في الهاتف: اكتب اسمك ثم اضغط على زر «Entrée» اللي بجانب الخانة." }} />
          </p>
        </div>
      )}

      {exercise.type === "system-lab" && (
        exercise.mode.startsWith("windows11-")
          ? <Session3Windows11 key={exercise.id} mode={exercise.mode.slice(10) as WindowsMode} initialState={windows11} onStateChange={setWindows11} onValidate={(answer,checks)=>recordResult(checks.every(Boolean),{question:exercise.prompt,...answer})} />
          : exercise.mode === "guided-files"
          ? <Session3GuidedFiles initialState={systemLab} onStateChange={setSystemLab} onValidate={checkSystemLab} />
          : <Session3SystemLab mode={exercise.mode as "windows" | "files"} initialState={systemLab} onStateChange={setSystemLab} onValidate={checkSystemLab} />
      )}

      {exercise.type !== "gesture" && exercise.type !== "system-lab" && (
        <div className="exercise-actions">
          <button className="check-exercise" disabled={!canCheck} onClick={checkCurrent}>
            <CheckCircle2 size={17} />{lang === "fr" ? "Vérifier ma réponse" : "التحقق من جوابي"}
          </button>
        </div>
      )}

      {exercise.hint && result === false && (
        <div className="exercise-hint">
          <Lightbulb size={16} />
          <span>
            <strong>{lang === "fr" ? "Indice" : "مساعدة"}</strong>
            <BilingualText value={exercise.hint} />
          </span>
        </div>
      )}

      {result !== null && (
        <div ref={resultRef} className={`exercise-result ${result ? "correct" : "wrong"}`} role="status" aria-live="assertive">
          {result ? <CheckCircle2 size={20} /> : <Lightbulb size={20} />}
          <div>
            <strong>{result ? (lang === "fr" ? "Exercice réussi" : "تمرين ناجح") : (lang === "fr" ? "Pas encore" : "ليس بعد")}</strong>
            <p>
              <BilingualText
                value={result ? exercise.feedback : exercise.id.startsWith("s3-") ? {
                  fr: "Observe encore le document. Utilise l’indice, puis réessaie.",
                  ar: "لاحظ الوثيقة من جديد. استعن بالتلميح ثم حاول مرة أخرى.",
                } : {
                  fr: `Observe la correction, comprends ton erreur puis essaie de nouveau. ${exercise.feedback.fr}`,
                  ar: `لاحظ التصحيح وافهم خطأك ثم حاول من جديد. ${exercise.feedback.ar}`,
                }}
              />
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

function HistoryMark(){return <CheckCircle2 size={17}/>;}

function Unit1Workshop({
  session,
  lang,
  participantId,
  onRecordSubmission,
  onGoToTrace,
  onGoToEvaluation,
}: {
  session: CourseSession;
  lang: Lang;
  participantId: string;
  onRecordSubmission: (submission: SubmissionInput) => void;
  onGoToTrace: () => void;
  onGoToEvaluation: () => void;
}) {
  const lab = unit1Labs[session.id as 1 | 2 | 3];
  type WorkshopState={version:1;exerciseId?:string;showSummary?:boolean;completedIds:string[];drafts:Record<string,ExerciseDraft>};
  const initial=useMemo<WorkshopState>(()=>{let ids:string[]=[];try{const parsed=JSON.parse(localStorage.getItem(`lab2ac-unit1-session-${session.id}-${participantId}`)??"[]");if(Array.isArray(parsed))ids=parsed.filter(id=>lab.exercises.some(ex=>ex.id===id));}catch{}return {version:1,completedIds:ids,drafts:{}}},[session.id,participantId,lab]);
  const durable=useDurableLessonState<WorkshopState>({participantId,sessionId:session.id,kind:"workshop",initial,validate:(v):v is WorkshopState=>learningRecord(v)&&v.version===1&&Array.isArray(v.completedIds)&&(!v.drafts||learningRecord(v.drafts))});
  const {value:work,setValue:setWork,ready:progressLoaded}=durable;
  const completedExercises=new Set((work.completedIds??[]).filter(id=>lab.exercises.some(e=>e.id===id)));
  const savedIndex=lab.exercises.findIndex(ex=>ex.id===work.exerciseId);
  const firstMissing=lab.exercises.findIndex(ex=>!completedExercises.has(ex.id));
  const exerciseIndex=savedIndex>=0?savedIndex:firstMissing>=0?firstMissing:lab.exercises.length-1;
  const exercise=lab.exercises[exerciseIndex];
  const drafts=work.drafts??{};
  const exerciseAnchorRef=useRef<HTMLDivElement>(null);
  const currentResult=completedExercises.has(exercise.id)?true:(drafts[exercise.id]?.result??null);
  const keepDraft=useCallback((draft:ExerciseDraft)=>setWork(current=>{
    const revisedDraft = {...draft, exerciseRevision: exercise.revision ?? 0};
    const previous=current.drafts?.[exercise.id];
    if(previous){const {savedAt,...content}=previous;void savedAt;if(JSON.stringify(content)===JSON.stringify(revisedDraft))return current;}
    return {...current,exerciseId:exercise.id,drafts:{...current.drafts,[exercise.id]:{...revisedDraft,savedAt:Date.now()}}};
  }),[exercise.id,exercise.revision,setWork]);
  useEffect(()=>{const timer=window.setTimeout(()=>exerciseAnchorRef.current?.scrollIntoView({behavior:"auto",block:"start"}),120);return()=>window.clearTimeout(timer)},[exerciseIndex,work.showSummary]);
  function goExercise(index:number){setWork(current=>index===lab.exercises.length?{...current,showSummary:true}:{...current,showSummary:false,exerciseId:lab.exercises[Math.max(0,Math.min(lab.exercises.length-1,index))].id});}
  function markCompleted(id:string){setWork(current=>{const ids=[...new Set([...current.completedIds,id])];try{localStorage.setItem(`lab2ac-unit1-session-${session.id}-${participantId}`,JSON.stringify(ids));}catch{}return {...current,completedIds:ids};});}
  if(!progressLoaded)return <div className="learning-loading"><LoaderCircle size={19} className="spin"/> Recherche de ton travail sauvegardé… / البحث عن عملك المحفوظ…</div>;
  const navigationTitles = [...lab.exercises.map(item => txt(item.title, lang)), txt(workshopSummaryTitle, lang)];
  if (work.showSummary) return <div className="tab-content unit1-lab page-enter" ref={exerciseAnchorRef}>
    <TeacherExerciseNavigator index={lab.exercises.length} titles={navigationTitles} onGo={goExercise} />
    <WorkshopSummary sessionId={session.id} participantId={participantId} state={work}
      onBack={() => goExercise(exerciseIndex)} onResume={goExercise} onTrace={onGoToTrace} onEvaluate={onGoToEvaluation}>
      {session.id === 3 && <Session3WorkshopRecap />}
    </WorkshopSummary>
  </div>;

  return (
    <div className="tab-content unit1-lab page-enter">
      <TeacherExerciseNavigator index={exerciseIndex} titles={navigationTitles} onGo={goExercise} />
      {durable.restored&&completedExercises.size>0&&<p className="learning-resumed-note"><HistoryMark/>{completedExercises.size} exercice(s) déjà réussi(s) : tu reprends ton parcours ici. / تستأنف مسارك من هنا.</p>}
      {session.id === 3 && <div className="s3-phase-banner"><BilingualText value={exercise.stage === "recall"
        ? { fr: "Étape 1 · Je réactive les séances 1 et 2 — 25 min", ar: "المرحلة 1 · أستحضر الحصتين 1 و2 — 25 دقيقة" }
        : exercise.stage === "discover"
          ? { fr: "Étape 2 · Je découvre le système d’exploitation — 20 min", ar: "المرحلة 2 · أكتشف نظام التشغيل — 20 دقيقة" }
          : { fr: "Étape 3 · Je manipule Windows et j’organise mes fichiers — 55 min", ar: "المرحلة 3 · أستعمل Windows وأنظم ملفاتي — 55 دقيقة" }} /></div>}
      <div className="exercise-counter" ref={exerciseAnchorRef}>
        <span>{lang === "fr" ? "EXERCICE" : "تمرين"} {padTime(exerciseIndex + 1)}</span>
      </div>

      <div className="workshop-summary-entry"><WorkshopSummaryLink onClick={() => goExercise(lab.exercises.length)} /></div>
      <ExercisePlayer
        key={exercise.id}
        exercise={exercise}
        lang={lang}
        participantId={participantId}
        draft={!exercise.revision || drafts[exercise.id]?.exerciseRevision === exercise.revision ? drafts[exercise.id] : undefined}
        onDraftChange={keepDraft}
        alreadyCompleted={completedExercises.has(exercise.id)}
        onComplete={() => markCompleted(exercise.id)}
        onResult={(answer, correct, score) => onRecordSubmission({
          sessionId: session.id,
          activityType: "unit1_exercise",
          activityId: exercise.id,
          answer,
          isCorrect: correct,
          score,
          maxScore: 100,
        })}
      />

      <ExerciseNavigation
        index={exerciseIndex}
        total={lab.exercises.length}
        done={lab.exercises.filter((item) => completedExercises.has(item.id)).length}
        lang={lang}
        onPrevious={() => goExercise(exerciseIndex-1)}
        onNext={() => goExercise(exerciseIndex+1)}
        nextLabel={exerciseIndex === lab.exercises.length - 1 ? workshopSummaryTitle : undefined}
        nextDisabled={currentResult === null}
        resultStatus={currentResult}
        onReviewLesson={onGoToTrace}
      />
    </div>
  );
}

function StandardWorkshopView({
  session,
  lang,
  participantId,
  onRecordSubmission,
  onGoToTrace,
  onGoToEvaluation,
}: {
  session: CourseSession;
  lang: Lang;
  participantId:string;
  onRecordSubmission: (submission: SubmissionInput) => void;
  onGoToTrace: () => void;
  onGoToEvaluation: () => void;
}) {
  const labels = ui[lang];
  type StandardState={version:1;exerciseIndex:number;checked:boolean[];photoAnswer:number|null;showSummary?:boolean;declaredProgress?:Record<string,number>};
  const persistent=useDurableLessonState<StandardState>({participantId,sessionId:session.id,kind:"workshop",initial:{version:1,exerciseIndex:0,checked:session.workshops.map(()=>false),photoAnswer:null},validate:(v):v is StandardState=>learningRecord(v)&&v.version===1&&Number.isInteger(v.exerciseIndex)&&Number(v.exerciseIndex)>=0&&Number(v.exerciseIndex)<=session.workshops.length&&Array.isArray(v.checked)&&(v.photoAnswer===null||Number.isInteger(v.photoAnswer))});
  const {exerciseIndex,checked,photoAnswer,showSummary,declaredProgress}=persistent.value;
  const setPhotoAnswer=useLearningField(persistent.setValue,"photoAnswer");
  const challenge = photoChallenges[session.id];
  const photoChoiceOrder = useMemo(
    () => shuffledIndices(challenge.choices.length, `${participantId}-session-${session.id}-photo`),
    [challenge, session.id, participantId],
  );
  const photoCorrect = photoAnswer === challenge.answer;
  const total = session.workshops.length + 1;
  const titles = [txt(challenge.prompt, lang), ...session.workshops.map(item => txt(item.text, lang)), txt(workshopSummaryTitle, lang)];
  function go(index: number) {
    persistent.setValue(state => index === total
      ? {...state, showSummary: true}
      : {...state, showSummary: false, exerciseIndex: Math.max(0, Math.min(total - 1, index))});
  }
  const currentResult = exerciseIndex === 0
    ? photoAnswer === null ? null : photoCorrect
    : checked[exerciseIndex - 1] ? true : null;
  const exerciseAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    exerciseAnchorRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
  }, [exerciseIndex, showSummary]);

  if(!persistent.ready)return <div className="learning-loading">Recherche de ton atelier sauvegardé…</div>;
  return (
    <div className="tab-content standard-workshop simple-workshop page-enter">
      <TeacherExerciseNavigator index={showSummary ? total : exerciseIndex} titles={titles} onGo={go} />
      {showSummary ? <div ref={exerciseAnchorRef}><WorkshopSummary sessionId={session.id} participantId={participantId} state={persistent.value}
        onBack={() => go(exerciseIndex)} onResume={go} onTrace={onGoToTrace} onEvaluate={onGoToEvaluation} /></div> : <>
      <div className="exercise-counter" ref={exerciseAnchorRef}>
        <span>{lang === "fr" ? "EXERCICE" : "تمرين"} {padTime(exerciseIndex + 1)}</span>
      </div>
      <div className="workshop-summary-entry"><WorkshopSummaryLink onClick={() => go(total)} /></div>
      {exerciseIndex === 0 && (
      <article className="photo-challenge">
        <div className="photo-frame">
          <img src={publicAsset(challenge.image.src)} alt={txt(challenge.image.alt, lang)} loading="lazy" referrerPolicy="no-referrer" />
          <a href={challenge.image.source} target="_blank" rel="noreferrer">{challenge.image.credit}</a>
          <span><ImageIcon size={15} /> {labels.realPhoto}</span>
        </div>
        <div className="photo-task">
          <div className="photo-task-meta">
            <span>{labels.photoChallenge}</span>
            <strong>{txt(challenge.kind, lang)}</strong>
          </div>
          <div className="photo-question">
            <span className="instruction-label">Question / السؤال</span>
            <h3><BilingualText value={challenge.prompt} /></h3>
          </div>
          <p className="choose-label">{labels.choose}</p>
          <div className="photo-choices">
            {photoChoiceOrder.map((originalIndex, displayIndex) => {
              const choice = challenge.choices[originalIndex];
              const selected = photoAnswer === originalIndex;
              const correct = photoAnswer !== null && originalIndex === challenge.answer;
              const wrong = selected && photoAnswer !== challenge.answer;
              return (
                <button
                  key={choice.fr}
                  className={`${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                  onClick={() => {
                    setPhotoAnswer(originalIndex);
                    onRecordSubmission({
                      sessionId: session.id,
                      activityType: "photo_challenge",
                      activityId: `session-${session.id}-photo`,
                      answer: {
                        question: challenge.prompt,
                        selectedIndex: originalIndex,
                        displayedChoice: String.fromCharCode(65 + displayIndex),
                        selectedChoice: choice,
                        correctIndex: challenge.answer,
                        correctChoice: challenge.choices[challenge.answer],
                      },
                      isCorrect: originalIndex === challenge.answer,
                    });
                  }}
                >
                  <span>{String.fromCharCode(65 + displayIndex)}</span>
                  <BilingualText value={choice} />
                  {correct && <Check size={16} />}
                </button>
              );
            })}
          </div>
          {photoAnswer !== null && (
            <div className={`photo-feedback ${photoCorrect ? "correct" : "wrong"}`}>
              {photoCorrect ? <CheckCircle2 size={18} /> : <Lightbulb size={18} />}
              <div><strong>{photoCorrect ? labels.wellDone : labels.tryAgain}</strong><p>{txt(challenge.feedback, lang)}</p></div>
            </div>
          )}
        </div>
      </article>
      )}
      {exerciseIndex > 0 && (
      <div className="workshop-grid single-workshop-grid">
        {session.workshops.map((workshop, index) => exerciseIndex !== index + 1 ? null : (
          <article className={`workshop-card ${checked[index] ? "checked" : ""}`} key={workshop.label}>
            <div className="workshop-card-top">
              <span className="workshop-letter">{workshop.label}</span>
              <span><Clock3 size={14} /> {workshop.duration} {labels.minutes}</span>
            </div>
            <h3>{lang === "fr" ? `Atelier ${workshop.label}` : `الورشة ${workshop.label}`}</h3>
            <div className="exercise-prompt">
              <span className="instruction-label">Consigne / التعليمة</span>
              <BilingualText value={workshop.text} />
            </div>
            {!checked[index] && <label className="workshop-milestone">
              <BilingualText value={{fr: "Déclare ton avancement", ar: "صرح بتقدمك"}} />
              <select value={declaredProgress?.[`session-${session.id}-workshop-${workshop.label}`] ?? 0} onChange={event => {
                const percent = Number(event.target.value);
                const id = `session-${session.id}-workshop-${workshop.label}`;
                persistent.setValue(state => ({...state, declaredProgress: {...state.declaredProgress, [id]: percent}}));
              }}>
                <option value={0}>À faire · لم يبدأ بعد</option>
                <option value={25}>25 % · J’ai commencé · بدأت</option>
                <option value={50}>50 % · J’ai fait la moitié · أنجزت النصف</option>
                <option value={75}>75 % · Il me reste une étape · بقيت خطوة</option>
              </select>
            </label>}
            <button type="button" disabled={checked[index]} onClick={() => {
              persistent.setValue(state => ({...state, checked: state.checked.map((value, itemIndex) => itemIndex === index || value)}));
              onRecordSubmission({
                sessionId: session.id,
                activityType: "workshop",
                activityId: `session-${session.id}-workshop-${workshop.label}`,
                answer: { completed: true, workshop: workshop.label, verification: "declaration-eleve" },
                score: 100,
                maxScore: 100,
              });
            }}>
              {checked[index] ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              <BilingualText value={checked[index]
                ? {fr: "Terminé · déclaré", ar: "تم التصريح بالإنجاز"}
                : {fr: "Déclarer l’atelier terminé", ar: "التصريح بإتمام الورشة"}} />
            </button>
          </article>
        ))}
      </div>
      )}
      <ExerciseNavigation
        index={exerciseIndex}
        total={total}
        done={checked.filter(Boolean).length + (photoCorrect ? 1 : 0)}
        lang={lang}
        onPrevious={() => go(exerciseIndex - 1)}
        onNext={() => go(exerciseIndex + 1)}
        nextLabel={exerciseIndex === total - 1 ? workshopSummaryTitle : undefined}
        nextDisabled={exerciseIndex === 0 ? currentResult === null : currentResult !== true}
        resultStatus={currentResult}
        onReviewLesson={onGoToTrace}
      />
      </>}
    </div>
  );
}

function WorkshopView({
  session,
  lang,
  participantId,
  onRecordSubmission,
  onGoToTrace,
  onGoToEvaluation,
}: {
  session: CourseSession;
  lang: Lang;
  participantId: string;
  onRecordSubmission: (submission: SubmissionInput) => void;
  onGoToTrace: () => void;
  onGoToEvaluation: () => void;
}) {
  if (session.unit === 1) {
    return <Unit1Workshop session={session} lang={lang} participantId={participantId} onRecordSubmission={onRecordSubmission} onGoToTrace={onGoToTrace} onGoToEvaluation={onGoToEvaluation} />;
  }
  return <StandardWorkshopView session={session} lang={lang} participantId={participantId} onRecordSubmission={onRecordSubmission} onGoToTrace={onGoToTrace} onGoToEvaluation={onGoToEvaluation} />;
}

function TraceView({ session, lang }: { session: CourseSession; lang: Lang }) {
  if (session.id === 3) return <Session3Trace />;
  const labels = ui[lang];
  const hasSections = Boolean(session.traceSections?.length);
  return (
    <div className="tab-content page-enter">
      <article className={`notebook ${hasSections ? "notebook-expanded" : ""}`}>
        <div className="notebook-margin" aria-hidden="true" />
        <div className="notebook-heading">
          <div>
            <span>{labels.session} {padTime(session.id)}</span>
            <h2>{session.id === 1
              ? txt({ fr: "Rappel sur le système informatique", ar: "تذكير بالنظام المعلوماتي" }, lang)
              : session.id === 2
                ? txt({ fr: "Environnement matériel d’un système informatique", ar: "البيئة المادية لنظام معلوماتي" }, lang)
              : txt(session.title, lang)}</h2>
            {session.id === 2 && (
              <h3 className="notebook-subtitle">
                {txt({ fr: "I- La configuration monoposte", ar: "I- التجهيز أحادي الحاسوب" }, lang)}
              </h3>
            )}
          </div>
          <BookOpen size={29} />
        </div>
        {hasSections ? (
          <div className="notebook-sections">
            {session.traceSections!.map((section) => (
              <section className={`trace-section ${section.cards?.length || section.wide ? "trace-section-with-cards" : ""}`} key={section.title.fr}>
                <h3>{txt(section.title, lang)}</h3>
                {section.image && <img className={`trace-section-image trace-section-image-${section.image.size ?? "full"}`} src={publicAsset(section.image.src)} alt={bilingualAria(section.image.alt)} loading="lazy" />}
                {section.cards?.length ? (
                  <div className="trace-component-grid">
                    {section.cards.map((card) => (
                      <article className="trace-component-card" key={card.title.fr}>
                        {card.image
                          ? <img src={publicAsset(card.image)} alt={bilingualAria(card.title)} loading="lazy" />
                          : <span className="trace-component-symbol" aria-hidden="true">{card.icon ?? "•"}</span>}
                        <strong>{txt(card.title, lang)}</strong>
                        <p>{txt(card.text, lang)}</p>
                      </article>
                    ))}
                  </div>
                ) : null}
                {section.items.length > 0 && (
                  <ul>
                    {section.items.map((item) => <li key={item.fr}>{txt(item, lang)}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="notebook-lines">
            {session.trace.map((line, index) => (
              <p key={line.fr}><strong>{index + 1}.</strong> {txt(line, lang)}</p>
            ))}
          </div>
        )}
        {session.vocabulary.length > 0 && <div className="vocabulary-box">
          <span>{labels.vocabulary}</span>
          <div>
            {session.vocabulary.map((word) => (
              <div key={word.fr}><strong>{word.fr}</strong><small dir="rtl">{word.ar}</small></div>
            ))}
          </div>
        </div>}
      </article>
    </div>
  );
}

type Session2EvaluationStage = "assembly" | "repair" | "simulator";

type EvaluationAssemblyItem = {
  id: string;
  label: LocalizedText;
  image: string;
  target: string;
};

type EvaluationAssemblyZone = {
  id: string;
  label: LocalizedText;
  hint: LocalizedText;
};

type EvaluationAssemblyResult = {
  completed: true;
  errors: number;
  total: number;
  placements: Array<{
    element: LocalizedText;
    destination: LocalizedText;
  }>;
};

type EvaluationRepairResult = {
  completed: true;
  errors: number;
  score: number;
  maxScore: number;
  cases: Array<{
    scenario: LocalizedText;
    componentAttempts: LocalizedText[];
    correctComponent: LocalizedText;
    repairAttempts: LocalizedText[];
    correctRepair: LocalizedText;
  }>;
};

const evaluationInternalZones: EvaluationAssemblyZone[] = [
  { id: "connect", label: { fr: "Connecter tous les composants", ar: "ربط جميع المكونات" }, hint: { fr: "Support principal du PC", ar: "الدعامة الرئيسية للحاسوب" } },
  { id: "calculate", label: { fr: "Exécuter les instructions", ar: "تنفيذ التعليمات" }, hint: { fr: "Le cerveau de l’ordinateur", ar: "دماغ الحاسوب" } },
  { id: "temporary", label: { fr: "Mémoriser temporairement", ar: "الحفظ المؤقت" }, hint: { fr: "Mémoire rapide de travail", ar: "ذاكرة عمل سريعة" } },
  { id: "permanent", label: { fr: "Stocker durablement", ar: "التخزين الدائم" }, hint: { fr: "Conserve système et fichiers", ar: "يحفظ النظام والملفات" } },
  { id: "graphics", label: { fr: "Traiter les images", ar: "معالجة الصور" }, hint: { fr: "Affichage et 3D", ar: "العرض والرسوم ثلاثية الأبعاد" } },
  { id: "network", label: { fr: "Se connecter au réseau", ar: "الاتصال بالشبكة" }, hint: { fr: "Communication réseau", ar: "الاتصال بالشبكة" } },
  { id: "power", label: { fr: "Fournir l’énergie", ar: "توفير الطاقة" }, hint: { fr: "Alimente tous les composants", ar: "يزود كل المكونات بالطاقة" } },
  { id: "audio", label: { fr: "Gérer le son", ar: "معالجة الصوت" }, hint: { fr: "Entrées et sorties audio", ar: "مداخل ومخارج الصوت" } },
];

const evaluationInternalItems: EvaluationAssemblyItem[] = [
  { id: "motherboard", label: { fr: "Carte mère", ar: "اللوحة الأم" }, image: "session2/items/ex12-card-02.jpg", target: "connect" },
  { id: "cpu", label: { fr: "Processeur (CPU)", ar: "المعالج (CPU)" }, image: "session2/items/ex12-card-01.png", target: "calculate" },
  { id: "ram", label: { fr: "Mémoire RAM", ar: "ذاكرة RAM" }, image: "session2/items/ex12-card-03.jpg", target: "temporary" },
  { id: "ssd", label: { fr: "Disque SSD", ar: "قرص SSD" }, image: "session2/items/ex12-card-05.jpg", target: "permanent" },
  { id: "gpu", label: { fr: "Carte graphique", ar: "بطاقة الرسوم" }, image: "session2/items/ex12-card-06.jpg", target: "graphics" },
  { id: "network-card", label: { fr: "Carte réseau", ar: "بطاقة الشبكة" }, image: "session2/items/ex12-card-09.jpg", target: "network" },
  { id: "power-supply", label: { fr: "Alimentation", ar: "مزود الطاقة" }, image: "session2/items/ex12-card-07.jpg", target: "power" },
  { id: "sound-card", label: { fr: "Carte son", ar: "بطاقة الصوت" }, image: "session2/items/carte-son.png", target: "audio" },
];

const evaluationPeripheralZones: EvaluationAssemblyZone[] = [
  { id: "input", label: { fr: "Périphériques d’entrée", ar: "ملحقات الإدخال" }, hint: { fr: "Envoient des informations vers l’unité centrale", ar: "ترسل المعلومات إلى الوحدة المركزية" } },
  { id: "output", label: { fr: "Périphériques de sortie", ar: "ملحقات الإخراج" }, hint: { fr: "Restituent les informations", ar: "تعرض المعلومات" } },
  { id: "input-output", label: { fr: "Périphériques d’entrée / sortie", ar: "ملحقات الإدخال والإخراج" }, hint: { fr: "Reçoivent et envoient des informations", ar: "تستقبل وترسل المعلومات" } },
  { id: "storage", label: { fr: "Périphériques de stockage", ar: "ملحقات التخزين" }, hint: { fr: "Conservent les informations", ar: "تحفظ المعلومات" } },
];

const evaluationPeripheralItems: EvaluationAssemblyItem[] = [
  { id: "keyboard", label: { fr: "Clavier", ar: "لوحة المفاتيح" }, image: "session2/items/ex02-card-05.jpg", target: "input" },
  { id: "mouse", label: { fr: "Souris", ar: "الفأرة" }, image: "session2/items/ex02-card-04.jpg", target: "input" },
  { id: "scanner", label: { fr: "Scanner", ar: "الماسح الضوئي" }, image: "session2/items/ex02-card-06.jpg", target: "input" },
  { id: "gamepad", label: { fr: "Manette de jeu", ar: "ذراع اللعب" }, image: "session2/items/ex02-card-03.jpg", target: "input" },
  { id: "monitor", label: { fr: "Écran", ar: "الشاشة" }, image: "session2/items/ex02-card-16.png", target: "output" },
  { id: "speakers", label: { fr: "Haut-parleurs", ar: "مكبرات الصوت" }, image: "session2/items/ex02-card-01.jpg", target: "output" },
  { id: "printer", label: { fr: "Imprimante", ar: "الطابعة" }, image: "session2/items/ex02-card-09.jpg", target: "output" },
  { id: "projector", label: { fr: "Vidéoprojecteur", ar: "مسلاط" }, image: "session2/items/ex02-card-15.jpg", target: "output" },
  { id: "touchscreen", label: { fr: "Écran tactile", ar: "شاشة لمسية" }, image: "session2/items/ex02-card-11.jpg", target: "input-output" },
  { id: "router", label: { fr: "Routeur", ar: "موجه" }, image: "session2/items/ex02-card-08.jpg", target: "input-output" },
  { id: "headset", label: { fr: "Casque-micro", ar: "سماعة بميكروفون" }, image: "session2/items/ex02-card-14.jpg", target: "input-output" },
  { id: "hard-drive", label: { fr: "Disque dur", ar: "قرص صلب" }, image: "session2/items/ex02-card-12.jpg", target: "storage" },
  { id: "sd-card", label: { fr: "Carte SD", ar: "بطاقة SD" }, image: "session2/items/ex02-card-17.jpg", target: "storage" },
  { id: "usb-key", label: { fr: "Clé USB", ar: "مفتاح USB" }, image: "session2/items/ex02-card-07.jpg", target: "storage" },
  { id: "dvd", label: { fr: "DVD", ar: "قرص DVD" }, image: "session2/items/ex02-card-10.png", target: "storage" },
];

const evaluationRepairComponents = evaluationInternalItems.map(({ id, label, image }) => ({ id, label, image }));

const evaluationRepairCases = [
  {
    id: "ram-slow",
    scenario: { fr: "Le PC possède 4 Go de RAM. Il devient très lent lorsque plusieurs logiciels sont ouverts.", ar: "يتوفر الحاسوب على 4 Go من RAM ويصبح بطيئا جدا عند فتح عدة برامج." },
    component: "ram",
    repairs: [
      { id: "ram-16", label: { fr: "Remplacer la RAM par 16 Go", ar: "استبدال RAM بذاكرة 16 Go" } },
      { id: "speaker-add", label: { fr: "Ajouter des haut-parleurs", ar: "إضافة مكبرات صوت" } },
      { id: "keyboard-change", label: { fr: "Changer le clavier", ar: "تغيير لوحة المفاتيح" } },
    ],
    repair: "ram-16",
  },
  {
    id: "gpu-game",
    scenario: { fr: "Un jeu 3D saccade, alors que le stockage et la mémoire sont suffisants.", ar: "تتقطع لعبة ثلاثية الأبعاد رغم كفاية التخزين والذاكرة." },
    component: "gpu",
    repairs: [
      { id: "gpu-dedicated", label: { fr: "Installer une carte graphique dédiée", ar: "تركيب بطاقة رسوم مستقلة" } },
      { id: "printer-driver", label: { fr: "Réinstaller l’imprimante", ar: "إعادة تثبيت الطابعة" } },
      { id: "dvd-add", label: { fr: "Ajouter un lecteur DVD", ar: "إضافة قارئ DVD" } },
    ],
    repair: "gpu-dedicated",
  },
  {
    id: "network-offline",
    scenario: { fr: "Le câble réseau est branché, mais le PC ne détecte aucune connexion.", ar: "سلك الشبكة موصول لكن الحاسوب لا يكتشف أي اتصال." },
    component: "network-card",
    repairs: [
      { id: "network-install", label: { fr: "Installer ou remplacer la carte réseau", ar: "تركيب أو استبدال بطاقة الشبكة" } },
      { id: "ram-clean", label: { fr: "Nettoyer la mémoire RAM", ar: "تنظيف ذاكرة RAM" } },
      { id: "screen-change", label: { fr: "Changer l’écran", ar: "تغيير الشاشة" } },
    ],
    repair: "network-install",
  },
  {
    id: "power-shutdown",
    scenario: { fr: "Le PC s’éteint dès qu’un jeu sollicite fortement ses composants.", ar: "ينطفئ الحاسوب عندما تستهلك اللعبة مكوناته بشكل كبير." },
    component: "power-supply",
    repairs: [
      { id: "psu-650", label: { fr: "Installer une alimentation de 650 W adaptée", ar: "تركيب مزود طاقة مناسب بقدرة 650 W" } },
      { id: "mouse-change", label: { fr: "Changer la souris", ar: "تغيير الفأرة" } },
      { id: "sound-driver", label: { fr: "Mettre à jour le pilote audio", ar: "تحديث برنامج تشغيل الصوت" } },
    ],
    repair: "psu-650",
  },
  {
    id: "ssd-boot",
    scenario: { fr: "Le démarrage dure plusieurs minutes et l’ancien disque est presque plein.", ar: "يستغرق الإقلاع عدة دقائق والقرص القديم شبه ممتلئ." },
    component: "ssd",
    repairs: [
      { id: "ssd-512", label: { fr: "Installer un SSD de 512 Go et y transférer le système", ar: "تركيب SSD بسعة 512 Go ونقل النظام إليه" } },
      { id: "webcam-add", label: { fr: "Ajouter une webcam", ar: "إضافة كاميرا ويب" } },
      { id: "router-reset", label: { fr: "Redémarrer le routeur", ar: "إعادة تشغيل الموجه" } },
    ],
    repair: "ssd-512",
  },
  {
    id: "cpu-calculation",
    scenario: { fr: "Les calculs et les traitements complexes sont très lents, même avec assez de RAM.", ar: "الحسابات والمعالجات المعقدة بطيئة جدا رغم توفر RAM كافية." },
    component: "cpu",
    repairs: [
      { id: "cpu-upgrade", label: { fr: "Installer un processeur plus puissant et compatible", ar: "تركيب معالج أقوى ومتوافق" } },
      { id: "usb-format", label: { fr: "Formater une clé USB", ar: "تهيئة مفتاح USB" } },
      { id: "speaker-add-2", label: { fr: "Ajouter des haut-parleurs", ar: "إضافة مكبرات صوت" } },
    ],
    repair: "cpu-upgrade",
  },
] satisfies Array<{
  id: string;
  scenario: LocalizedText;
  component: string;
  repairs: Array<{ id: string; label: LocalizedText }>;
  repair: string;
}>;

function Session2AssemblyEvaluation({
  lang,
  participantId,
  onComplete,
  onContinue,
}: {
  lang: Lang;
  participantId:string;
  onComplete: (result: EvaluationAssemblyResult) => void;
  onContinue: () => void;
}) {
  const teacherMode = useTeacherCourse();
  type AssemblyState={version:1;section:"internal"|"peripherals";placements:Record<string,string>;errors:number;shuffleAttempt:string};
  const persistent=useDurableLessonState<AssemblyState>({participantId,sessionId:2,kind:"assembly",initial:{version:1,section:"internal",placements:{},errors:0,shuffleAttempt:"initial"},validate:(v):v is AssemblyState=>learningRecord(v)&&v.version===1&&["internal","peripherals"].includes(String(v.section))&&learningRecord(v.placements)&&Number.isInteger(v.errors)&&typeof v.shuffleAttempt==="string"});
  const {section,placements,errors,shuffleAttempt}=persistent.value;
  const setSection=useLearningField(persistent.setValue,"section"),setPlacements=useLearningField(persistent.setValue,"placements"),setErrors=useLearningField(persistent.setValue,"errors"),setShuffleAttempt=useLearningField(persistent.setValue,"shuffleAttempt");
  const [selectedItem,setSelectedItem]=useState<string|null>(null);
  const [feedback,setFeedback]=useState<{kind:"good"|"bad";text:LocalizedText}|null>(null);
  const reportedRef = useRef(false);
  const allItems = useMemo(() => [...evaluationInternalItems, ...evaluationPeripheralItems], []);
  const shuffledInternalItems = useMemo(
    () => shuffledIndices(evaluationInternalItems.length, `evaluation-assembly-internal-${shuffleAttempt}`).map((index) => evaluationInternalItems[index]),
    [shuffleAttempt],
  );
  const shuffledPeripheralItems = useMemo(
    () => shuffledIndices(evaluationPeripheralItems.length, `evaluation-assembly-peripherals-${shuffleAttempt}`).map((index) => evaluationPeripheralItems[index]),
    [shuffleAttempt],
  );
  const internalDone = evaluationInternalItems.every((item) => placements[item.id] === item.target);
  const peripheralsDone = evaluationPeripheralItems.every((item) => placements[item.id] === item.target);
  const allDone = internalDone && peripheralsDone;
  const items = section === "internal" ? shuffledInternalItems : shuffledPeripheralItems;
  const zones = section === "internal" ? evaluationInternalZones : evaluationPeripheralZones;
  const placedInSection = items.filter((item) => placements[item.id] === item.target).length;

  useEffect(() => {
    if(!persistent.ready||shuffleAttempt!=="initial")return;
    const randomValues = new Uint32Array(2);
    window.crypto.getRandomValues(randomValues);
    setShuffleAttempt(`${randomValues[0]}-${randomValues[1]}`);
  }, [persistent.ready,shuffleAttempt,setShuffleAttempt]);

  useEffect(() => {
    if (!allDone || reportedRef.current) return;
    reportedRef.current = true;
    onComplete({
      completed: true,
      errors,
      total: allItems.length,
      placements: allItems.map((item) => ({
        element: item.label,
        destination: [...evaluationInternalZones, ...evaluationPeripheralZones].find((zone) => zone.id === item.target)!.label,
      })),
    });
  }, [allDone, allItems, errors, onComplete]);

  const placeItem = useCallback((itemId: string, zoneId: string) => {
    const item = allItems.find((candidate) => candidate.id === itemId);
    if (!item || placements[item.id]) return;
    if (item.target !== zoneId) {
      setErrors((current) => current + 1);
      setFeedback({
        kind: "bad",
        text: { fr: `${item.label.fr} ne correspond pas à cette zone. Observe sa fonction puis réessaie.`, ar: `${item.label.ar} لا يناسب هذه الخانة. لاحظ وظيفته ثم أعد المحاولة.` },
      });
      return;
    }
    setPlacements((current) => ({ ...current, [item.id]: zoneId }));
    setSelectedItem(null);
    setFeedback({
      kind: "good",
      text: { fr: `${item.label.fr} est bien placé.`, ar: `تم وضع ${item.label.ar} في المكان الصحيح.` },
    });
  }, [allItems, placements]);

  function placeSelectedItem(zoneId: string) {
    if (selectedItem) placeItem(selectedItem, zoneId);
  }

  if(!persistent.ready)return <div className="learning-loading">Recherche de l’assemblage sauvegardé…</div>;
  return (
    <section className="native-practical-evaluation">
      <header className="native-practical-heading">
        <div>
          <span>ÉTAPE 2 / الخطوة 2</span>
          <h2><BilingualText value={{ fr: "Assembler le PC", ar: "تركيب الحاسوب" }} /></h2>
          <p><BilingualText value={{
            fr: "Clique sur une image puis sur sa destination, ou glisse-la directement. Chaque élément doit rejoindre sa fonction ou sa famille.",
            ar: "انقر على صورة ثم على مكانها، أو اسحبها مباشرة. ضع كل عنصر حسب وظيفته أو فئته.",
          }} /></p>
        </div>
        <div className="native-score-chip"><strong>{Object.keys(placements).length}/{allItems.length}</strong><span>{lang === "fr" ? "éléments placés" : "عنصرا موضوعا"}</span></div>
      </header>

      <div className="assembly-section-tabs" role="tablist" aria-label="Parties de l’assemblage">
        <button type="button" role="tab" aria-selected={section === "internal"} onClick={() => setSection("internal")}>
          <span>1</span><BilingualText value={{ fr: "Dans l’unité centrale", ar: "داخل الوحدة المركزية" }} /><small>{evaluationInternalItems.filter((item) => placements[item.id]).length}/8</small>
        </button>
        <button type="button" role="tab" aria-selected={section === "peripherals"} disabled={!teacherMode && !internalDone} onClick={() => setSection("peripherals")}>
          <span>{internalDone ? <Check size={16} /> : teacherMode ? "2" : <LockKeyhole size={14} />}</span><BilingualText value={{ fr: "Autour de l’unité centrale", ar: "حول الوحدة المركزية" }} /><small>{evaluationPeripheralItems.filter((item) => placements[item.id]).length}/15</small>
        </button>
      </div>

      <div className="assembly-instruction">
        <MousePointer2 size={20} />
        <BilingualText value={section === "internal"
          ? { fr: "Associe les 8 composants internes à leur fonction exacte.", ar: "اربط المكونات الداخلية الثمانية بوظيفتها الصحيحة." }
          : { fr: "Classe les 15 périphériques dans les quatre familles.", ar: "صنّف الملحقات الخمسة عشر في الفئات الأربع." }} />
      </div>

      <div className={`assembly-workspace ${section === "peripherals" ? "peripheral-workspace" : ""}`}>
        <div className="assembly-bank" aria-label="Éléments à placer">
          <div className="assembly-bank-head"><strong>{lang === "fr" ? "Éléments à placer" : "العناصر المطلوب وضعها"}</strong><span>{placedInSection}/{items.length}</span></div>
          <div className="assembly-bank-grid">
            {items.filter((item) => !placements[item.id]).map((item) => (
              <button
                type="button"
                draggable
                className={selectedItem === item.id ? "selected" : ""}
                key={item.id}
                onClick={() => setSelectedItem((current) => current === item.id ? null : item.id)}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", item.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
              >
                <img src={publicAsset(item.image)} alt={bilingualAria(item.label)} />
                <BilingualText value={item.label} />
              </button>
            ))}
            {items.every((item) => placements[item.id]) && (
              <div className="assembly-bank-complete"><CheckCircle2 size={25} /><BilingualText value={{ fr: "Tous les éléments sont placés", ar: "تم وضع جميع العناصر" }} /></div>
            )}
          </div>
        </div>

        <div className="assembly-zones">
          {zones.map((zone) => {
            const zoneItems = items.filter((item) => placements[item.id] === zone.id);
            return (
              <div
                className={`assembly-zone ${selectedItem ? "ready" : ""} ${zoneItems.length ? "filled" : ""}`}
                key={zone.id}
                role="button"
                tabIndex={0}
                onClick={() => placeSelectedItem(zone.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") placeSelectedItem(zone.id);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  placeItem(event.dataTransfer.getData("text/plain"), zone.id);
                }}
              >
                <header><strong><BilingualText value={zone.label} /></strong><small><BilingualText value={zone.hint} /></small></header>
                <div className="assembly-zone-content">
                  {zoneItems.length === 0 ? <span className="assembly-drop-label">{lang === "fr" ? "Déposer ici" : "ضع هنا"}</span> : zoneItems.map((item) => (
                    <span className="assembly-placed-item" key={item.id}><img src={publicAsset(item.image)} alt="" /><BilingualText value={item.label} /><CheckCircle2 size={15} /></span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {feedback && <div className={`native-practical-feedback ${feedback.kind}`} aria-live="polite">{feedback.kind === "good" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}<BilingualText value={feedback.text} /></div>}

      <div className="native-practical-footer">
        <div className="native-progress"><span style={{ width: `${(Object.keys(placements).length / allItems.length) * 100}%` }} /></div>
        {!internalDone ? (
          <p><LockKeyhole size={16} /><BilingualText value={{ fr: "Place correctement les 8 composants pour continuer.", ar: "ضع المكونات الثمانية بشكل صحيح للمتابعة." }} /></p>
        ) : section === "internal" ? (
          <button type="button" onClick={() => setSection("peripherals")}><BilingualText value={{ fr: "Continuer avec les périphériques", ar: "المتابعة مع الملحقات" }} /><ChevronRight size={18} /></button>
        ) : allDone ? (
          <button type="button" onClick={onContinue}><BilingualText value={{ fr: "Passer au dépannage", ar: "الانتقال إلى إصلاح الأعطال" }} /><ChevronRight size={18} /></button>
        ) : (
          <p><LockKeyhole size={16} /><BilingualText value={{ fr: "Classe correctement tous les périphériques.", ar: "صنّف جميع الملحقات بشكل صحيح." }} /></p>
        )}
      </div>
    </section>
  );
}

function Session2RepairEvaluation({
  lang,
  participantId,
  onComplete,
}: {
  lang: Lang;
  participantId:string;
  onComplete: (result: EvaluationRepairResult) => void;
}) {
  const teacherMode = useTeacherCourse();
  type RepairState={version:1;caseIndex:number;componentSolved:Record<number,boolean>;repairSolved:Record<number,boolean>;wrongComponents:Record<number,string[]>;wrongRepairs:Record<number,string[]>;reports:Array<{componentAttempts:LocalizedText[];repairAttempts:LocalizedText[]}>;errors:number};
  const persistent=useDurableLessonState<RepairState>({participantId,sessionId:2,kind:"repair",initial:{version:1,caseIndex:0,componentSolved:{},repairSolved:{},wrongComponents:{},wrongRepairs:{},reports:evaluationRepairCases.map(()=>({componentAttempts:[],repairAttempts:[]})),errors:0},validate:(v):v is RepairState=>learningRecord(v)&&v.version===1&&Number.isInteger(v.caseIndex)&&Number(v.caseIndex)>=0&&Number(v.caseIndex)<evaluationRepairCases.length&&learningRecord(v.componentSolved)&&learningRecord(v.repairSolved)&&learningRecord(v.wrongComponents)&&learningRecord(v.wrongRepairs)&&Array.isArray(v.reports)&&v.reports.length===evaluationRepairCases.length&&Number.isInteger(v.errors)});
  const {caseIndex,componentSolved,repairSolved,wrongComponents,wrongRepairs,reports,errors}=persistent.value;
  const setCaseIndex=useLearningField(persistent.setValue,"caseIndex"),setComponentSolved=useLearningField(persistent.setValue,"componentSolved"),setRepairSolved=useLearningField(persistent.setValue,"repairSolved"),setWrongComponents=useLearningField(persistent.setValue,"wrongComponents"),setWrongRepairs=useLearningField(persistent.setValue,"wrongRepairs"),setReports=useLearningField(persistent.setValue,"reports"),setErrors=useLearningField(persistent.setValue,"errors");
  const [feedback,setFeedback]=useState<{kind:"good"|"bad";text:LocalizedText}|null>(null);
  const reportedRef = useRef(false);
  const currentCase = evaluationRepairCases[caseIndex];
  const completedCases = evaluationRepairCases.filter((_, index) => repairSolved[index]).length;
  const allDone = completedCases === evaluationRepairCases.length;
  const correctComponent = evaluationRepairComponents.find((item) => item.id === currentCase.component)!;

  useEffect(() => {
    if (!allDone || reportedRef.current) return;
    reportedRef.current = true;
    onComplete({
      completed: true,
      errors,
      score: evaluationRepairCases.length * 2,
      maxScore: evaluationRepairCases.length * 2,
      cases: evaluationRepairCases.map((item, index) => ({
        scenario: item.scenario,
        componentAttempts: reports[index].componentAttempts,
        correctComponent: evaluationRepairComponents.find((component) => component.id === item.component)!.label,
        repairAttempts: reports[index].repairAttempts,
        correctRepair: item.repairs.find((repair) => repair.id === item.repair)!.label,
      })),
    });
  }, [allDone, errors, onComplete, reports]);

  function recordAttempt(kind: "component" | "repair", label: LocalizedText) {
    setReports((current) => current.map((report, index) => index === caseIndex
      ? { ...report, [kind === "component" ? "componentAttempts" : "repairAttempts"]: [...report[kind === "component" ? "componentAttempts" : "repairAttempts"], label] }
      : report));
  }

  function chooseComponent(componentId: string) {
    if (componentSolved[caseIndex]) return;
    const component = evaluationRepairComponents.find((item) => item.id === componentId)!;
    recordAttempt("component", component.label);
    if (componentId === currentCase.component) {
      setComponentSolved((current) => ({ ...current, [caseIndex]: true }));
      setFeedback({ kind: "good", text: { fr: `${component.label.fr} explique bien les symptômes. Choisis maintenant la réparation.`, ar: `${component.label.ar} يفسر الأعراض. اختر الآن الإصلاح المناسب.` } });
    } else {
      setErrors((current) => current + 1);
      setWrongComponents((current) => ({ ...current, [caseIndex]: [...(current[caseIndex] ?? []), componentId] }));
      setFeedback({ kind: "bad", text: { fr: "Ce composant n’explique pas tous les symptômes. Relis la situation.", ar: "هذا المكون لا يفسر جميع الأعراض. أعد قراءة الوضعية." } });
    }
  }

  function chooseRepair(repairId: string) {
    if (!componentSolved[caseIndex] || repairSolved[caseIndex]) return;
    const repair = currentCase.repairs.find((item) => item.id === repairId)!;
    recordAttempt("repair", repair.label);
    if (repairId === currentCase.repair) {
      setRepairSolved((current) => ({ ...current, [caseIndex]: true }));
      setFeedback({ kind: "good", text: { fr: "Diagnostic complet : le composant et la réparation sont corrects.", ar: "اكتمل التشخيص: المكون والإصلاح صحيحان." } });
    } else {
      setErrors((current) => current + 1);
      setWrongRepairs((current) => ({ ...current, [caseIndex]: [...(current[caseIndex] ?? []), repairId] }));
      setFeedback({ kind: "bad", text: { fr: "Cette action ne répare pas la panne décrite. Cherche une solution liée au composant.", ar: "هذا الإجراء لا يصلح العطل الموصوف. ابحث عن حل مرتبط بالمكون." } });
    }
  }

  function goToNextCase() {
    if (!repairSolved[caseIndex] || caseIndex >= evaluationRepairCases.length - 1) return;
    setCaseIndex((current) => current + 1);
    setFeedback(null);
  }

  if(!persistent.ready)return <div className="learning-loading">Recherche du diagnostic sauvegardé…</div>;
  return (
    <section className="native-practical-evaluation repair-evaluation">
      <header className="native-practical-heading">
        <div>
          <span>ÉTAPE 3 / الخطوة 3</span>
          <h2><BilingualText value={{ fr: "Dépanner le PC", ar: "إصلاح أعطال الحاسوب" }} /></h2>
          <p><BilingualText value={{ fr: "Pour chaque panne, identifie d’abord le composant responsable, puis choisis la réparation cohérente.", ar: "لكل عطل، حدد أولا المكون المسؤول ثم اختر الإصلاح المناسب." }} /></p>
        </div>
        <div className="native-score-chip"><strong>{completedCases}/{evaluationRepairCases.length}</strong><span>{lang === "fr" ? "pannes résolues" : "أعطال محلولة"}</span></div>
      </header>

      <div className="repair-case-progress" aria-label="Progression des pannes">
        {evaluationRepairCases.map((item, index) => (
          <button type="button" key={item.id} disabled={!teacherMode && index > completedCases} className={`${index === caseIndex ? "active" : ""} ${repairSolved[index] ? "done" : ""}`} onClick={() => (teacherMode || index <= completedCases) && setCaseIndex(index)}>
            {repairSolved[index] ? <Check size={15} /> : index + 1}
          </button>
        ))}
      </div>

      <article className="repair-scenario-card">
        <div className="repair-scenario-number"><span>{lang === "fr" ? "PANNE" : "العطل"}</span><strong>{String(caseIndex + 1).padStart(2, "0")}</strong></div>
        <div><small>Situation-problème / الوضعية المشكلة</small><h3><BilingualText value={currentCase.scenario} /></h3></div>
      </article>

      <section className={`repair-native-step ${componentSolved[caseIndex] ? "solved" : ""}`}>
        <header><span>{componentSolved[caseIndex] ? <Check size={17} /> : "1"}</span><div><strong><BilingualText value={{ fr: "Quel composant est responsable ?", ar: "ما المكون المسؤول؟" }} /></strong><small>{lang === "fr" ? "Observe la fonction de chaque composant" : "لاحظ وظيفة كل مكون"}</small></div></header>
        <div className="repair-component-grid">
          {evaluationRepairComponents.map((component) => {
            const isCorrect = componentSolved[caseIndex] && component.id === currentCase.component;
            const isWrong = (wrongComponents[caseIndex] ?? []).includes(component.id);
            return (
              <button type="button" key={component.id} disabled={componentSolved[caseIndex]} className={`${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`} onClick={() => chooseComponent(component.id)}>
                <img src={publicAsset(component.image)} alt={bilingualAria(component.label)} />
                <BilingualText value={component.label} />
                {isCorrect && <CheckCircle2 size={18} />}
              </button>
            );
          })}
        </div>
      </section>

      <section className={`repair-native-step ${!componentSolved[caseIndex] ? "locked" : ""} ${repairSolved[caseIndex] ? "solved" : ""}`}>
        <header><span>{repairSolved[caseIndex] ? <Check size={17} /> : componentSolved[caseIndex] ? "2" : <LockKeyhole size={15} />}</span><div><strong><BilingualText value={{ fr: "Quelle réparation faut-il effectuer ?", ar: "ما الإصلاح الذي يجب القيام به؟" }} /></strong><small>{componentSolved[caseIndex] ? txt(correctComponent.label, lang) : (lang === "fr" ? "Trouve d’abord le composant" : "حدد المكون أولا")}</small></div></header>
        {componentSolved[caseIndex] && (
          <div className="repair-solution-grid">
            {currentCase.repairs.map((repair) => {
              const isCorrect = repairSolved[caseIndex] && repair.id === currentCase.repair;
              const isWrong = (wrongRepairs[caseIndex] ?? []).includes(repair.id);
              return <button type="button" key={repair.id} disabled={repairSolved[caseIndex]} className={`${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`} onClick={() => chooseRepair(repair.id)}><BilingualText value={repair.label} />{isCorrect && <CheckCircle2 size={18} />}</button>;
            })}
          </div>
        )}
      </section>

      {feedback && <div className={`native-practical-feedback ${feedback.kind}`} aria-live="polite">{feedback.kind === "good" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}<BilingualText value={feedback.text} /></div>}

      <div className="native-practical-footer">
        <div className="native-progress"><span style={{ width: `${(completedCases / evaluationRepairCases.length) * 100}%` }} /></div>
        {allDone ? (
          <p className="evaluation-complete"><CheckCircle2 size={18} /><BilingualText value={{ fr: "Évaluation terminée avec succès", ar: "تم إنهاء التقويم بنجاح" }} /></p>
        ) : repairSolved[caseIndex] ? (
          <button type="button" onClick={goToNextCase}><BilingualText value={{ fr: "Panne suivante", ar: "العطل التالي" }} /><ChevronRight size={18} /></button>
        ) : (
          <p><LockKeyhole size={16} /><BilingualText value={{ fr: "Résous les deux étapes pour continuer.", ar: "أنجز المرحلتين للمتابعة." }} /></p>
        )}
      </div>
    </section>
  );
}

function QuizView({
  session,
  lang,
  participantId,
  onRecordSubmission,
}: {
  session: CourseSession;
  lang: Lang;
  participantId:string;
  onRecordSubmission: (submission: SubmissionInput) => void;
}) {
  const teacherMode = useTeacherCourse();
  const labels = ui[lang];
  const isBilingual = true;
  type QuizState={version:1;evaluationStage:Session2EvaluationStage;questionIndex:number;answers:Record<number,number>;justifications:Record<number,number>;submitted:boolean;shuffleRound:number;practicalResults:{assembly?:EvaluationAssemblyResult;repair?:EvaluationRepairResult}};
  const persistent=useDurableLessonState<QuizState>({participantId,sessionId:session.id,kind:"quiz",initial:{version:1,evaluationStage:"simulator",questionIndex:0,answers:{},justifications:{},submitted:false,shuffleRound:0,practicalResults:{}},validate:(v):v is QuizState=>learningRecord(v)&&v.version===1&&["simulator","assembly","repair"].includes(String(v.evaluationStage))&&Number.isInteger(v.questionIndex)&&Number(v.questionIndex)>=0&&Number(v.questionIndex)<session.quiz.length&&learningRecord(v.answers)&&learningRecord(v.justifications)&&typeof v.submitted==="boolean"&&Number.isInteger(v.shuffleRound)&&learningRecord(v.practicalResults)});
  const {evaluationStage,questionIndex,answers,justifications,submitted,shuffleRound,practicalResults}=persistent.value;
  const setEvaluationStage=useLearningField(persistent.setValue,"evaluationStage"),setQuestionIndex=useLearningField(persistent.setValue,"questionIndex"),setAnswers=useLearningField(persistent.setValue,"answers"),setJustifications=useLearningField(persistent.setValue,"justifications"),setSubmitted=useLearningField(persistent.setValue,"submitted"),setShuffleRound=useLearningField(persistent.setValue,"shuffleRound"),setPracticalResults=useLearningField(persistent.setValue,"practicalResults");
  const practicalSignaturesRef = useRef(new Set<string>());
  useEffect(()=>{if(practicalResults.assembly)practicalSignaturesRef.current.add("assembly");if(practicalResults.repair)practicalSignaturesRef.current.add("repair")},[practicalResults]);
  const quizChoiceOrders = useMemo(
    () => {
      void shuffleRound;
      return session.quiz.map((question, questionIndex) =>
        shuffledIndices(question.choices.length, `${participantId}-session-${session.id}-quiz-${questionIndex}-round-${shuffleRound}`)
      );
    },
    [session, shuffleRound],
  );
  const quizJustificationOrders = useMemo(
    () => {
      void shuffleRound;
      return session.quiz.map((question, questionIndex) =>
        quizHasJustification(question)
          ? shuffledIndices(question.justifications.length, `${participantId}-session-${session.id}-quiz-${questionIndex}-justification-round-${shuffleRound}`)
          : []
      );
    },
    [session, shuffleRound],
  );
  const score = session.quiz.reduce((total, question, index) => {
    const answerPoint = answers[index] === question.answer ? 1 : 0;
    const justificationPoint = quizHasJustification(question) && justifications[index] === question.justificationAnswer ? 1 : 0;
    return total + answerPoint + justificationPoint;
  }, 0);
  const maxScore = session.quiz.reduce((total, item) => total + (quizHasJustification(item) ? 2 : 1), 0);
  const answeredQuestions = session.quiz.reduce((total, item, index) => {
    const answerChosen = Number.isInteger(answers[index]);
    const justificationChosen = !quizHasJustification(item) || Number.isInteger(justifications[index]);
    return total + (answerChosen && justificationChosen ? 1 : 0);
  }, 0);
  const question = session.quiz[questionIndex];
  const hasJustification = quizHasJustification(question);
  const answerCorrect = answers[questionIndex] === question.answer;
  const justificationCorrect = hasJustification && justifications[questionIndex] === question.justificationAnswer;
  const questionScore = (answerCorrect ? 1 : 0) + (justificationCorrect ? 1 : 0);
  const questionAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session.id === 2) return;
    questionAnchorRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
  }, [evaluationStage, questionIndex, session.id]);

  const recordAssemblyResult = useCallback((result: EvaluationAssemblyResult) => {
    if (practicalSignaturesRef.current.has("assembly") || practicalResults.assembly) return;
    practicalSignaturesRef.current.add("assembly");
    setPracticalResults((current) => ({ ...current, assembly: result }));
    onRecordSubmission({
      sessionId: 2,
      activityType: "practical_evaluation",
      activityId: "s2-evaluation-assembler",
      answer: result,
      isCorrect: true,
      score: result.total,
      maxScore: result.total,
    });
  }, [onRecordSubmission,practicalResults.assembly,practicalResults.repair,setPracticalResults]);

  const recordRepairResult = useCallback((result: EvaluationRepairResult) => {
    if (practicalSignaturesRef.current.has("repair") || practicalResults.repair) return;
    practicalSignaturesRef.current.add("repair");
    setPracticalResults((current) => ({ ...current, repair: result }));
    onRecordSubmission({
      sessionId: 2,
      activityType: "practical_evaluation",
      activityId: "s2-evaluation-depanner",
      answer: result,
      isCorrect: true,
      score: result.score,
      maxScore: result.maxScore,
    });
  }, [onRecordSubmission,practicalResults.assembly,practicalResults.repair,setPracticalResults]);

  function submitQuiz() {
    const detailedAnswers = session.quiz.map((question, questionIndex) => {
      const selectedIndex = answers[questionIndex];
      const selectedJustificationIndex = justifications[questionIndex];
      const hasQuestionJustification = quizHasJustification(question);
      const answerIsCorrect = selectedIndex === question.answer;
      const justificationIsCorrect = hasQuestionJustification
        ? selectedJustificationIndex === question.justificationAnswer
        : null;
      return {
        questionIndex,
        question: question.question,
        selectedIndex,
        selectedChoice: question.choices[selectedIndex],
        correctIndex: question.answer,
        correctChoice: question.choices[question.answer],
        displayedChoice: String.fromCharCode(65 + quizChoiceOrders[questionIndex].indexOf(selectedIndex)),
        displayedCorrectChoice: String.fromCharCode(65 + quizChoiceOrders[questionIndex].indexOf(question.answer)),
        selectedJustificationIndex: hasQuestionJustification ? selectedJustificationIndex : null,
        selectedJustification: hasQuestionJustification ? question.justifications[selectedJustificationIndex] : null,
        correctJustificationIndex: hasQuestionJustification ? question.justificationAnswer : null,
        correctJustification: hasQuestionJustification ? question.justifications[question.justificationAnswer] : null,
        displayedJustification: hasQuestionJustification ? quizJustificationOrders[questionIndex].indexOf(selectedJustificationIndex) + 1 : null,
        displayedCorrectJustification: hasQuestionJustification ? quizJustificationOrders[questionIndex].indexOf(question.justificationAnswer) + 1 : null,
        answerCorrect: answerIsCorrect,
        justificationCorrect: justificationIsCorrect,
        earnedPoints: (answerIsCorrect ? 1 : 0) + (justificationIsCorrect ? 1 : 0),
        maxPoints: hasQuestionJustification ? 2 : 1,
        correct: answerIsCorrect && (!hasQuestionJustification || justificationIsCorrect === true),
      };
    });
    onRecordSubmission({
      sessionId: session.id,
      activityType: "quiz",
      activityId: `session-${session.id}-quiz`,
      answer: { answers: detailedAnswers },
      isCorrect: score === maxScore,
      score,
      maxScore,
    });
    setSubmitted(true);
  }

  if(!persistent.ready)return <div className="learning-loading">Recherche de ton évaluation sauvegardée…</div>;
  return (
    <div className="tab-content simple-quiz page-enter">
      {session.id === 2 && (
        <div className="evaluation-stage-tabs" role="tablist" aria-label="Étapes de l’évaluation / مراحل التقويم">
          <button type="button" role="tab" aria-selected={evaluationStage === "simulator"} onClick={() => setEvaluationStage("simulator")}>
            <ExternalLink size={18} /><span className="evaluation-stage-number">1</span><BilingualText value={{ fr: "Simulateur", ar: "المحاكي" }} />
          </button>
          <button type="button" role="tab" aria-selected={evaluationStage === "assembly"} onClick={() => setEvaluationStage("assembly")}>
            <MonitorCog size={18} /><span className="evaluation-stage-number">2</span><BilingualText value={{ fr: "Assembler", ar: "تركيب" }} />
          </button>
          <button type="button" role="tab" aria-selected={evaluationStage === "repair"} disabled={!teacherMode && !practicalResults.assembly} onClick={() => setEvaluationStage("repair")}>
            {teacherMode || practicalResults.assembly ? <AlertTriangle size={18} /> : <LockKeyhole size={17} />}<span className="evaluation-stage-number">3</span><BilingualText value={{ fr: "Dépanner", ar: "إصلاح" }} />
          </button>
        </div>
      )}

      {session.id === 2 && (
        <section className="session2-simulator-card" hidden={evaluationStage !== "simulator"}>
          <div className="session2-simulator-icon"><MonitorCog size={34} /></div>
          <div>
            <span>ÉTAPE 1 · ACTIVITÉ D’EXPLORATION / الخطوة 1 · نشاط استكشافي</span>
            <h2><BilingualText value={{ fr: "Simulateur du matériel informatique", ar: "محاكي معدات الحاسوب" }} /></h2>
            <p><BilingualText value={{
              fr: "Commence par ouvrir le simulateur dans un nouvel onglet et réalise les activités proposées. Reviens ensuite ici pour passer à l’assemblage du PC.",
              ar: "ابدأ بفتح المحاكي في علامة تبويب جديدة وأنجز الأنشطة المقترحة، ثم عد إلى هنا للانتقال إلى تركيب الحاسوب.",
            }} /></p>
          </div>
          <a href="https://tabdellah.github.io/sim/" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={19} />
            <BilingualText value={{ fr: "Ouvrir le simulateur", ar: "فتح المحاكي" }} />
          </a>
        </section>
      )}

      {session.id === 2 && (
        <div hidden={evaluationStage !== "assembly"}>
          <Session2AssemblyEvaluation
            participantId={participantId}
            lang={lang}
            onComplete={recordAssemblyResult}
            onContinue={() => setEvaluationStage("repair")}
          />
        </div>
      )}

      {session.id === 2 && (
        <div hidden={evaluationStage !== "repair"}>
          <Session2RepairEvaluation
            participantId={participantId}
            lang={lang}
            onComplete={recordRepairResult}
          />
        </div>
      )}

      <div className="evaluation-quiz-content" hidden={session.id === 2}>
      <TeacherExerciseNavigator index={questionIndex} titles={session.quiz.map(item => txt(item.question, lang))} onGo={setQuestionIndex} label="Aller à la question" />
      <div className="exercise-counter" ref={questionAnchorRef}>
        <span>{lang === "fr" ? "QUESTION" : "السؤال"} {padTime(questionIndex + 1)}</span>
      </div>
      {session.quiz.some(quizHasJustification) && (
        <div className="quiz-double-choice-intro">
          <CheckCircle2 size={20} />
          <BilingualText value={{
            fr: "Pour chaque question : choisis la bonne réponse, puis la justification qui prouve ton raisonnement.",
            ar: "في كل سؤال: اختر الجواب الصحيح ثم اختر التعليل الذي يثبت فهمك.",
          }} />
          <strong>2 points</strong>
        </div>
      )}
      <div className="quiz-layout simple-quiz-layout">
        <div className="quiz-questions">
            <article className="quiz-question" key={question.question.fr}>
              <div className="question-title">
                <span>{padTime(questionIndex + 1)}</span>
                <div><small>Question / السؤال</small><h3><BilingualText value={question.question} /></h3></div>
              </div>
              {question.image && <figure className="s3-quiz-visual"><img src={publicAsset(question.image.src)} alt={bilingualAria(question.image.alt)} loading="lazy" /></figure>}
              <div className="choices">
                {quizChoiceOrders[questionIndex].map((originalIndex, displayIndex) => {
                  const choice = question.choices[originalIndex];
                  const selected = answers[questionIndex] === originalIndex;
                  const correct = submitted && originalIndex === question.answer;
                  const wrong = submitted && selected && originalIndex !== question.answer;
                  return (
                    <button
                      type="button"
                      disabled={submitted}
                      className={`${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                      key={choice.fr}
                      onClick={() => !submitted && setAnswers((current) => ({ ...current, [questionIndex]: originalIndex }))}
                    >
                      <span className="choice-letter">{String.fromCharCode(65 + displayIndex)}</span>
                      {isBilingual ? <BilingualText value={choice} /> : <span>{txt(choice, lang)}</span>}
                      {correct && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
              {hasJustification && (
                <div className="quiz-justification-block">
                  <div className="justification-title">
                    <span aria-hidden="true">2</span>
                    <div>
                      <small>Justification / التعليل</small>
                      <h4><BilingualText value={{
                        fr: "Pourquoi cette réponse est-elle correcte ?",
                        ar: "لماذا هذا الجواب صحيح؟",
                      }} /></h4>
                    </div>
                  </div>
                  <div className="choices justification-choices">
                    {quizJustificationOrders[questionIndex].map((originalIndex, displayIndex) => {
                      const justification = question.justifications[originalIndex];
                      const selected = justifications[questionIndex] === originalIndex;
                      const correct = submitted && originalIndex === question.justificationAnswer;
                      const wrong = submitted && selected && originalIndex !== question.justificationAnswer;
                      return (
                        <button
                          type="button"
                          disabled={submitted}
                          className={`${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                          key={justification.fr}
                          onClick={() => !submitted && setJustifications((current) => ({ ...current, [questionIndex]: originalIndex }))}
                        >
                          <span className="choice-letter">{displayIndex + 1}</span>
                          <BilingualText value={justification} />
                          {correct && <Check size={16} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {submitted && (
                <div className={`answer-note ${questionScore === (hasJustification ? 2 : 1) ? "correct" : "wrong"}`}>
                  {hasJustification ? (
                    <>
                      <strong>{questionScore}/2</strong>
                      <BilingualText value={questionScore === 2
                        ? { fr: "Réponse et justification correctes", ar: "الجواب والتعليل صحيحان" }
                        : questionScore === 1 && answerCorrect
                          ? { fr: "Bonne réponse, mais justification à revoir", ar: "الجواب صحيح لكن التعليل يحتاج إلى مراجعة" }
                          : questionScore === 1
                            ? { fr: "Justification correcte, mais réponse à revoir", ar: "التعليل صحيح لكن الجواب يحتاج إلى مراجعة" }
                            : { fr: "Réponse et justification à revoir", ar: "الجواب والتعليل يحتاجان إلى مراجعة" }} />
                    </>
                  ) : isBilingual
                    ? <BilingualText value={answerCorrect
                      ? { fr: "Réponse correcte", ar: "إجابة صحيحة" }
                      : { fr: "À revoir", ar: "تحتاج إلى مراجعة" }} />
                    : (answerCorrect ? labels.correct : labels.wrong)}
                </div>
              )}
            </article>
          {submitted && (
            <div className="quiz-result">
              <div><span>{labels.score}</span><strong>{score}/{maxScore}</strong></div>
              <p>{score === maxScore ? (lang === "fr" ? "Excellent : les réponses et leurs justifications sont maîtrisées." : "ممتاز: تم إتقان الأجوبة وتعليلاتها.") : (lang === "fr" ? "Consulte les questions à revoir, puis recommence l’évaluation." : "راجع الأسئلة التي تحتاج إلى تصحيح ثم أعد التقويم.")}</p>
            </div>
          )}
        </div>
      </div>
      <ExerciseNavigation
        index={questionIndex}
        total={session.quiz.length}
        done={answeredQuestions}
        lang={lang}
        progressLabel={{ fr: "questions complétées", ar: "أسئلة مكتملة" }}
        onPrevious={() => setQuestionIndex((current) => Math.max(0, current - 1))}
        onNext={() => {
          if (questionIndex < session.quiz.length - 1) setQuestionIndex((current) => current + 1);
          else if (!submitted) submitQuiz();
          else {
            setAnswers({});
            setJustifications({});
            setSubmitted(false);
            setQuestionIndex(0);
            setShuffleRound((current) => current + 1);
          }
        }}
        nextDisabled={questionIndex === session.quiz.length - 1 && !submitted && answeredQuestions < session.quiz.length}
        nextLabel={questionIndex === session.quiz.length - 1
          ? submitted ? { fr: "Recommencer", ar: "إعادة المحاولة" } : { fr: "Valider l’évaluation", ar: "تأكيد التقويم" }
          : undefined}
      />
      </div>
    </div>
  );
}

function SessionPage({
  session,
  lang,
  student,
  activeTab,
  completed,
  participantId,
  onTab,
  onToggleCompleted,
  onBack,
  onChangeStudent,
  onRecordSubmission,
  saveStatus,
  unlockedSessions,
  onOpenSession,
}: {
  session: CourseSession;
  lang: Lang;
  student: StudentProfile;
  activeTab: ViewTab;
  completed: boolean;
  participantId: string;
  onTab: (tab: ViewTab) => void;
  onToggleCompleted: () => void;
  onBack: () => void;
  onChangeStudent: () => void;
  onRecordSubmission: (submission: SubmissionInput) => void;
  saveStatus: SaveStatus;
  unlockedSessions: Set<number>;
  onOpenSession: (id: number) => void;
}) {
  const teacherMode = useTeacherCourse();
  const [visitedTabs, setVisitedTabs] = useState<ViewTab[]>([activeTab]);
  const [evalPassed, setEvalPassed] = useState<boolean>(() => evaluationPassed(participantId, session.id));

  function handleRecordSubmission(submission: SubmissionInput) {
    onRecordSubmission(submission);
    const counts = session.id === 2
      ? submission.activityType === "quiz"
      : submission.activityType === "quiz" || submission.activityType === "practical_evaluation";
    if (counts && typeof submission.score === "number" && typeof submission.maxScore === "number" && submission.maxScore > 0 && submission.score * 2 >= submission.maxScore) setEvalPassed(true);
  }

  function showTab(tab: ViewTab) {
    setVisitedTabs((current) => current.includes(tab) ? current : [...current, tab]);
    onTab(tab);
    window.requestAnimationFrame(() => {
      document.querySelector(".main-scroll")?.scrollTo({ top: 0, behavior: "auto" });
    });
  }

  const stageOrder: ViewTab[] = ["mission", "workshop", "trace", "quiz"];
  const maxVisitedIdx = Math.max(...visitedTabs.map((t) => stageOrder.indexOf(t)));
  const tabLocked = (t: ViewTab) => !teacherMode && stageOrder.indexOf(t) > maxVisitedIdx + 1;

  function goToTrace() {
    showTab("trace");
  }
  if (session.id === 4) return <Session4Lesson student={student} activeTab={activeTab} onTab={onTab} onBack={onBack} onChangeStudent={onChangeStudent} onRecordSubmission={handleRecordSubmission} unlockedSessions={unlockedSessions} onOpenSession={onOpenSession} />;
  return (
    <div className={`session-page page-enter unit-${session.unit}`}>
      <div className="session-student-identity">
        {session.id === 3 && <div className="s3-brand"><span aria-hidden="true"><FlaskConical size={23} /></span><div><strong>LAB 2AC</strong><small>SÉANCE 03 · INFORMATIQUE</small></div></div>}
        <StudentIdentityBadge lang={lang} student={student} onChangeStudent={onChangeStudent} />
      </div>
      {session.id === 3 && <p className="s3-translation-help"><Languages size={17} aria-hidden="true" /><BilingualText value={{ fr: "Survole une phrase pour lire sa traduction arabe. Éloigne le pointeur pour la masquer.", ar: "مرر المؤشر فوق عبارة لقراءة ترجمتها العربية كاملة، وأبعده لإخفائها." }} /></p>}
      {!teacherMode && <LearningSaveBadge/>}
      <nav className="tab-nav" aria-label="Contenu de la séance">
        {tabItems.map(({ id, icon: Icon }) => (
          <button className={`${activeTab === id ? "active" : ""} ${tabLocked(id) ? "locked" : ""}`} aria-current={activeTab === id ? "page" : undefined} onClick={() => showTab(id)} key={id} disabled={tabLocked(id)}>
            <Icon size={17} />
            {session.id === 3 ? <BilingualText value={{ fr: ui.fr[id], ar: ui.ar[id] }} /> : <span>{ui.fr[id]}<small lang="ar" dir="rtl">{ui.ar[id]}</small></span>}
            {tabLocked(id) && <LockKeyhole size={13} aria-hidden="true" />}
          </button>
        ))}
      </nav>

      {visitedTabs.includes("mission") && (
        <section className="session-panel" data-panel="mission" hidden={activeTab !== "mission"}>
          <MissionView session={session} lang={lang} completed={completed} onToggleCompleted={onToggleCompleted} onBack={onBack} onStartPractice={() => showTab("workshop")} />
        </section>
      )}
      {visitedTabs.includes("workshop") && (
        <section className="session-panel" data-panel="workshop" hidden={activeTab !== "workshop"}>
        <WorkshopView
          key={`${participantId}-${session.id}`}
          session={session}
          lang={lang}
          participantId={participantId}
          onRecordSubmission={handleRecordSubmission}
          onGoToTrace={goToTrace}
          onGoToEvaluation={() => showTab(visitedTabs.includes("trace") ? "quiz" : "trace")}
        />
        </section>
      )}
      {visitedTabs.includes("trace") && (
        <section className="session-panel" data-panel="trace" hidden={activeTab !== "trace"}>
          <div className="trace-guide">
            <BookOpen size={20} aria-hidden="true" />
            <p><strong lang="ar" dir="rtl">اقرأ خلاصة الدرس جيدا قبل المرور إلى التقويم، لتختبر مهارتك بنفسك.</strong><small>{lang === "fr" ? "Lis bien la trace écrite avant de passer à l'évaluation." : "Lis bien la trace écrite avant l'évaluation."}</small></p>
          </div>
          <TraceView session={session} lang={lang} />
          <button type="button" className="stage-cta" onClick={() => showTab("quiz")}>
            <span lang="ar" dir="rtl">قرأت الدرس — هيّا إلى التقويم</span>
            <small>{lang === "fr" ? "J'ai lu le cours, à moi l'évaluation" : "J'ai lu le cours — à l'évaluation"}</small>
            {lang === "fr" ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
        </section>
      )}
      {visitedTabs.includes("quiz") && (
        <section className="session-panel" data-panel="quiz" hidden={activeTab !== "quiz"}>
          {session.id === 3
            ? <Session3Assessment key={`${participantId}-3`} participantId={participantId} onRecordSubmission={handleRecordSubmission} />
            : <QuizView key={`${participantId}-${session.id}`} session={session} lang={lang} participantId={participantId} onRecordSubmission={handleRecordSubmission} />}
        </section>
      )}

      {teacherMode || evalPassed ? (
        <>
          {!teacherMode && (
            <div className="pass-celebration" role="status">
              <span className="pass-celebration-star" aria-hidden="true">🎉</span>
              <div>
                <strong lang="ar" dir="rtl">أحسنت! أنهيت هذه الحصة بنجاح</strong>
                <small>{lang === "fr" ? "Bravo, séance réussie ! La suivante t'attend." : "Bravo ! Séance réussie, la suivante t'attend."}</small>
              </div>
              <span className="pass-celebration-star" aria-hidden="true">⭐</span>
            </div>
          )}
          <NextLessonFooter currentId={session.id} lang={lang} unlockedSessions={unlockedSessions} onOpenSession={onOpenSession} onBack={onBack} />
        </>
      ) : activeTab === "quiz" ? (
        <div className="next-lesson locked-hint">
          <span className="next-lesson-icon"><LockKeyhole size={26} /></span>
          <div className="next-lesson-copy">
            <strong>{lang === "fr" ? "La séance suivante se débloque ici" : "الحصة الموالية تُفتح من هنا"}</strong>
            <small>{lang === "fr" ? "Réussis l'évaluation (la moitié des points ou plus) et le bouton apparaîtra." : "انجح في التقويم (النصف من النقاط أو أكثر) وسيظهر الزر."}</small>
          </div>
        </div>
      ) : null}

      {saveStatus !== "idle" && (
        <div className={`session-save-status ${saveStatus}`} role="status">
          {saveStatus === "saving" ? <LoaderCircle size={14} className="spin" /> : saveStatus === "saved" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {saveStatus === "saving" ? "Enregistrement… / جار الحفظ…" : saveStatus === "saved" ? "Réponse enregistrée / تم حفظ الإجابة" : "Réponse en attente d’envoi / الإجابة في انتظار الإرسال"}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const teacherMode = useTeacherCourse();
  const [lang, setLang] = useState<Lang>("fr");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>("mission");
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(7200);
  const [timerRunning, setTimerRunning] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [resumeCandidate,setResumeCandidate]=useState<StudentProfile|null>(null);
  const [identityLoaded, setIdentityLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [sessionAccess, setSessionAccess] = useState<SessionAccess[]>([]);
  const [sessionAccessLoaded, setSessionAccessLoaded] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewSessionId, setPreviewSessionId] = useState(2);
  const mainRef = useRef<HTMLElement>(null);
  const submissionFlushRef = useRef(false);
  const saveStatusTimerRef = useRef<number | null>(null);
  const autoOpenedSessionRef = useRef(false);

  useEffect(() => {
    const hydration = window.setTimeout(() => {
      if (teacherMode) {
        setStudentProfile(teacherDemoProfile);
        setSessionAccess(sessions.map(session => ({ sessionId: session.id, isUnlocked: true, updatedAt: "" })));
        setSessionAccessLoaded(true);
        setIdentityLoaded(true);
        return;
      }
      const preview3Tab = session3PreviewTab();
      const previewTab = preview3Tab ?? session2PreviewTab();
      const previewSessionId = preview3Tab ? 3 : 2;
      if (previewTab) {
        const previewProfile: StudentProfile = {
          id: "00000000-0000-4000-8000-000000000002",
          studentOne: `Élève test · Séance ${previewSessionId}`,
          studentTwo: null,
          className: "2/1",
          groupName: "1",
          isPair: false,
        };
        setPreviewMode(true);
        setPreviewSessionId(previewSessionId);
        setStudentProfile(previewProfile);
        setSessionAccess([{ sessionId: previewSessionId, isUnlocked: true, updatedAt: new Date().toISOString() }]);
        setSessionAccessLoaded(true);
        setSelectedId(previewSessionId);
        setActiveTab(previewTab);
        autoOpenedSessionRef.current = true;
        setIdentityLoaded(true);
        return;
      }
      const storedLang = window.localStorage.getItem("lab2ac-lang");
      if (storedLang === "ar") setLang("ar");
      const storedParticipant=rememberedActiveProfile();
      if(storedParticipant)setResumeCandidate(storedParticipant);
      setIdentityLoaded(true);
    }, 0);
    return () => window.clearTimeout(hydration);
  }, [teacherMode]);

  useEffect(() => {
    if (!studentProfile) {
      setCompleted(new Set());
      return;
    }
    const stored = window.localStorage.getItem(`lab2ac-progress-${studentProfile.id}`);
    if (!stored) {
      setCompleted(new Set());
      return;
    }
    try { setCompleted(new Set(JSON.parse(stored) as number[])); } catch { setCompleted(new Set()); }
  }, [studentProfile]);

  useEffect(() => () => {
    if (saveStatusTimerRef.current !== null) window.clearTimeout(saveStatusTimerRef.current);
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => {
      setTimerSeconds((value) => {
        if (value <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  const selected = useMemo(() => sessions.find((session) => session.id === selectedId) ?? null, [selectedId]);

  async function flushPendingSubmissions() {
    if (teacherMode) return;
    if (submissionFlushRef.current) return;
    const queue = readSubmissionQueue();
    if (queue.length === 0) {
      setSaveStatus("idle");
      return;
    }

    submissionFlushRef.current = true;
    setSaveStatus("saving");
    try {
      let retainedFailure=false;
      // Keep rejected copies for recovery while allowing other learners’ valid work through.
      for (const pending of queue) {
        try {
          await submitCourseAttempt(pending as unknown as Record<string, unknown>);
          writeSubmissionQueue(readSubmissionQueue().filter(item=>item.id!==pending.id));
        } catch(error) {
          const status=(error as Error&{status?:number}).status;
          if(!status||status>=500||status===429)throw error;
          retainedFailure=true;
        }
      }
      if(retainedFailure){setSaveStatus("error");return;}
      setSaveStatus("saved");
      if (saveStatusTimerRef.current !== null) window.clearTimeout(saveStatusTimerRef.current);
      saveStatusTimerRef.current = window.setTimeout(() => setSaveStatus("idle"), 2400);
    } catch {
      setSaveStatus("error");
    } finally {
      submissionFlushRef.current = false;
    }
  }

  useEffect(() => {
    if (!studentProfile || previewMode || teacherMode) return;
    void flushPendingSubmissions();
    const retry=()=>void flushPendingSubmissions();
    window.addEventListener("online",retry);
    const timer=window.setInterval(retry,15000);
    return()=>{window.removeEventListener("online",retry);window.clearInterval(timer)};
  }, [previewMode, studentProfile, teacherMode]);

  useEffect(() => {
    if (teacherMode) {
      setSessionAccess(sessions.map(session => ({ sessionId: session.id, isUnlocked: true, updatedAt: "" })));
      setSessionAccessLoaded(true);
      return;
    }
    if (!studentProfile) {
      setSessionAccess([]);
      setSessionAccessLoaded(false);
      return;
    }
    if (previewMode) {
      setSessionAccess([{ sessionId: previewSessionId, isUnlocked: true, updatedAt: new Date().toISOString() }]);
      setSessionAccessLoaded(true);
      return;
    }
    let cancelled = false;
    try {const cached=JSON.parse(localStorage.getItem("lab2ac-session-access-cache")||"null");if(Array.isArray(cached)&&cached.every(s=>Number.isInteger(s.sessionId)&&typeof s.isUnlocked==="boolean")){setSessionAccess(cached);setSessionAccessLoaded(true);}}catch{}
    let refreshTimer: number | null = null;
    const refreshAccess = async () => {
      try {
        const access = await getSessionAccess();
        if (cancelled) return;
        try {localStorage.setItem("lab2ac-session-access-cache",JSON.stringify(access));}catch{}
        setSessionAccess(access);
        setSessionAccessLoaded(true);
      } catch {
        if (cancelled) return;
        // Conserver la dernière autorisation valide pendant une coupure réseau.
        // Une séance ne doit être verrouillée que par une réponse réussie du backend.
        setSessionAccessLoaded(true);
      } finally {
        if (!cancelled) refreshTimer = window.setTimeout(() => void refreshAccess(), 10_000);
      }
    };
    void refreshAccess();
    return () => {
      cancelled = true;
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
    };
  }, [previewMode, studentProfile, previewSessionId, teacherMode]);

  const unlockedSessions = useMemo(
    () => new Set(sessionAccess.filter((session) => session.isUnlocked).map((session) => session.sessionId)),
    [sessionAccess],
  );

  useEffect(() => {
    if (!studentProfile || !sessionAccessLoaded || autoOpenedSessionRef.current) return;
    autoOpenedSessionRef.current = true;
    const hashMatch = window.location.hash.match(/^#seance-(\d+)$/);
    const requested = hashMatch ? Number(hashMatch[1]) : null;
    if (requested && unlockedSessions.has(requested)) {
      openSession(requested);
      return;
    }
    const last=lastLearningView(studentProfile.id);
    if(last&&unlockedSessions.has(last.sessionId)){openSession(last.sessionId);return;}
    const recovered=resumeOverview(studentProfile.id);
    if(recovered.sessionId&&unlockedSessions.has(recovered.sessionId)){openSession(recovered.sessionId);return;}
    const openSessions = [...unlockedSessions];
    if (openSessions.length === 1) openSession(openSessions[0]);
  }, [sessionAccessLoaded, studentProfile, unlockedSessions]);

  useEffect(() => {
    if (selectedId !== null && sessionAccessLoaded && !unlockedSessions.has(selectedId)) goHome();
  }, [selectedId, sessionAccessLoaded, unlockedSessions]);

  function recordSubmission(submission: SubmissionInput) {
    if (!studentProfile || teacherMode) return;
    if (previewMode) {
      const previewAttempt = {
        ...submission,
        id: createClientSubmissionId(),
        participantId: studentProfile.id,
        studentOne: studentProfile.studentOne,
        studentTwo: studentProfile.studentTwo,
        className: studentProfile.className,
        groupName: studentProfile.groupName,
        isPair: studentProfile.isPair ? 1 : 0,
        responseJson: JSON.stringify(submission.answer ?? null),
        isCorrect: submission.isCorrect ?? null,
        score: submission.score ?? null,
        maxScore: submission.maxScore ?? null,
        createdAt: new Date().toISOString(),
        completedSessions: 0,
      };
      try {
        const stored = window.localStorage.getItem(evaluationPreviewKey);
        const current = stored ? JSON.parse(stored) as unknown : [];
        const attempts = Array.isArray(current) ? current : [];
        window.localStorage.setItem(evaluationPreviewKey, JSON.stringify([previewAttempt, ...attempts]));
        setSaveStatus("saved");
        if (saveStatusTimerRef.current !== null) window.clearTimeout(saveStatusTimerRef.current);
        saveStatusTimerRef.current = window.setTimeout(() => setSaveStatus("idle"), 2400);
      } catch {
        setSaveStatus("error");
      }
      return;
    }
    const queued: QueuedSubmission = {
      ...submission,
      id: createClientSubmissionId(),
      participantId: studentProfile.id,
    };
    if (queued.activityType === "unit1_exercise" || queued.activityType === "photo_challenge" || queued.activityType === "workshop") {
      rememberWorkshopAttempts(workshopAttemptKey(queued.participantId, queued.sessionId), [{
        id: queued.id, activityId: queued.activityId, isCorrect: queued.isCorrect ?? null,
        score: queued.score ?? null, maxScore: queued.maxScore ?? null,
      }]);
    }
    writeSubmissionQueue([...readSubmissionQueue(), queued]);
    void flushPendingSubmissions();
  }

  function handleIdentityReady(profile: StudentProfile) {
    if (teacherMode) return;
    rememberProfile(profile);setResumeCandidate(null);setStudentProfile(profile);
  }
  const refreshIdentity=useCallback((profile:StudentProfile)=>setStudentProfile(profile),[]);

  function changeStudent() {
    if (teacherMode) return;
    forgetActiveProfile();setResumeCandidate(null);
    setStudentProfile(null);
    setSelectedId(null);
    setActiveTab("mission");
    setCompleted(new Set());
    setSidebarOpen(false);
    setTimerRunning(false);
    setTimerSeconds(7200);
    setSaveStatus("idle");
    setSessionAccess([]);
    setSessionAccessLoaded(false);
    autoOpenedSessionRef.current = false;
    window.history.replaceState(null, "", window.location.pathname);
  }

  function openSession(id: number) {
    if (!unlockedSessions.has(id)) return;
    setSelectedId(id);
    const saved=studentProfile?readSnapshot<Record<string,unknown>>(studentProfile.id,id,"view"):null;
    const workshop=studentProfile?readSnapshot<Record<string,unknown>>(studentProfile.id,id,"workshop"):null;
    const tab=saved&&["mission","workshop","trace","quiz"].includes(String(saved.data.activeTab))?saved.data.activeTab as ViewTab:workshop?"workshop":"mission";
    setActiveTab(tab);
    if(studentProfile)saveSnapshot(studentProfile.id,id,"view",{activeTab:tab});
    setSidebarOpen(false);
    setTimerSeconds(7200);
    setTimerRunning(false);
    window.history.replaceState(null, "", `#seance-${id}`);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goHome() {
    setSelectedId(null);
    if (window.matchMedia("(max-width: 860px)").matches) setSidebarOpen(false);
    setTimerRunning(false);
    window.history.replaceState(null, "", window.location.pathname);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleComplete() {
    if (!selected || !studentProfile || teacherMode) return;
    const willComplete = !completed.has(selected.id);
    setCompleted((current) => {
      const next = new Set(current);
      if (willComplete) next.add(selected.id);
      else next.delete(selected.id);
      window.localStorage.setItem(`lab2ac-progress-${studentProfile.id}`, JSON.stringify([...next]));
      return next;
    });
    recordSubmission({
      sessionId: selected.id,
      activityType: "session_completion",
      activityId: `session-${selected.id}-completion`,
      answer: { completed: willComplete },
      isCorrect: willComplete,
    });
  }

  function toggleLang() {
    setLang((current) => {
      const next = current === "fr" ? "ar" : "fr";
      window.localStorage.setItem("lab2ac-lang", next);
      return next;
    });
  }

  if (!identityLoaded) {
    return <div className="identity-loading"><LoaderCircle className="spin" size={26} /><span>LAB·2AC</span></div>;
  }

  if (!studentProfile) {
    if(resumeCandidate)return <ResumeStudent profile={resumeCandidate} onResume={()=>handleIdentityReady(resumeCandidate)} onOther={()=>{forgetActiveProfile();setResumeCandidate(null)}}/>;
    return <StudentIdentityGate onReady={handleIdentityReady} />;
  }

  return (
    <LearningProvider profile={studentProfile} disabled={previewMode || teacherMode} onProfileUpdate={refreshIdentity}>
    <Session3TranslationScope enabled={selected?.id === 3} scopeKey={`${selectedId}-${activeTab}`}>
    <div className={`app-shell ${selected ? "session-focus" : ""} ${selected?.id === 3 ? "session3-theme" : ""}`} dir={selected?.id === 3 ? "ltr" : lang === "ar" ? "rtl" : "ltr"}>
      <Sidebar
        lang={selected?.id === 3 ? "fr" : lang}
        selectedId={selectedId}
        completed={completed}
        unlockedSessions={unlockedSessions}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((value) => !value)}
        onHome={goHome}
        onOpenSession={openSession}
      />
      {selected && (
        <button
          type="button"
          className="session-sidebar-trigger"
          onClick={() => setSidebarOpen(true)}
          aria-label={lang === "fr" ? "Ouvrir le programme" : "فتح البرنامج"}
        >
          <Menu size={19} />
        </button>
      )}
      <div className="app-main">
        {!selected && (
        <Topbar
          lang={lang}
          selected={selected}
          timerSeconds={timerSeconds}
          timerRunning={timerRunning}
          student={studentProfile}
          saveStatus={saveStatus}
          onToggleLang={toggleLang}
          onToggleTimer={() => setTimerRunning((value) => !value)}
          onResetTimer={() => { setTimerSeconds(7200); setTimerRunning(false); }}
          onMenu={() => setSidebarOpen(true)}
          onChangeStudent={changeStudent}
          onRetrySave={() => void flushPendingSubmissions()}
        />
        )}
        <main className="main-scroll" ref={mainRef}>
          {!sessionAccessLoaded ? (
            <div className="session-access-loading"><LoaderCircle className="spin" size={25} /><span>{lang === "fr" ? "Ouverture de la séance autorisée…" : "جار فتح الحصة المسموح بها…"}</span></div>
          ) : selected ? (
            <SessionPage
              key={`${studentProfile.id}-${selected.id}`}
              session={selected}
              lang={selected.id === 3 ? "fr" : lang}
              student={studentProfile}
              activeTab={activeTab}
              completed={completed.has(selected.id)}
              participantId={studentProfile.id}
              onTab={tab=>{setActiveTab(tab);saveSnapshot(studentProfile.id,selected.id,"view",{activeTab:tab})}}
              onToggleCompleted={toggleComplete}
              onBack={goHome}
              onChangeStudent={changeStudent}
              onRecordSubmission={recordSubmission}
              saveStatus={saveStatus}
              unlockedSessions={unlockedSessions}
              onOpenSession={openSession}
            />
          ) : (
            <Dashboard lang={lang} completed={completed} unlockedSessions={unlockedSessions} onOpenSession={openSession} participantId={studentProfile.id} />
          )}
          {!selected && <div className="site-credit">
            <span>LAB·2AC</span>
            <p>Prof. Mohamed ELRHAOUAT · Collège Al Wahda</p>
          </div>}
        </main>
      </div>
    </div>
    </Session3TranslationScope>
    </LearningProvider>
  );
}
