"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import LearningTeacherPortal, {TeacherNavigation, type TeacherSection} from "./learning-dashboard";
import {teacherLearningAnalytics, type LearningAnalytics} from "@/lib/supabase-api";
import { session3Lab } from "../session3-lab-data";
import { session4AllActivities, session4AppliedEvaluationId, session4LabEvaluationId, session4QuizEvaluationId } from "../session4-data";
import Session4TeacherReport from "./session4-report";
import { filterReportAttempts, initialReportScope, reportSessionIds, type ReportScope } from "./learner-report-model";
import {
  BookOpen,
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
  Trash2,
  UnlockKeyhole,
  Users,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  teacherDashboard,
  teacherDeleteAllData,
  teacherDeleteLearner,
  teacherExport,
  teacherLearnerReport,
  teacherLogin,
  teacherLogout,
  teacherToken,
  teacherUpdateSessionAccess,
  type ProfessorFilters,
  type SessionAccess,
} from "@/lib/supabase-api";

type Attempt = {
  id: string;
  participantId: string;
  studentOne: string;
  studentTwo: string | null;
  className: string;
  groupName: string;
  isPair: number;
  sessionId: number;
  activityType: string;
  activityId: string;
  evaluationStage?: "assembly" | "repair" | "quiz" | null;
  responseJson: string;
  isCorrect: boolean | number | null;
  score: number | null;
  maxScore: number | null;
  createdAt: string;
  completedSessions: number;
};

type Learner = {
  id: string;
  studentOne: string;
  studentTwo: string | null;
  className: string;
  groupName: string;
  isPair: number;
  createdAt: string;
  totalAttempts: number;
  gradedAttempts: number;
  correctAttempts: number;
  successRate: number | null;
  gradeOutOf20: number | null;
  averageScore: number | null;
  bestScore: number | null;
  completedSessions: number;
  lastAttemptAt: string | null;
};

type DashboardData = {
  sessionAccess: SessionAccess[];
  stats: {
    totalParticipants: number;
    totalAttempts: number;
    correctRate: number;
    averageScore: number;
  };
  attempts: Attempt[];
  learners: Learner[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

type FilterState = ProfessorFilters;

const emptyFilters: FilterState = {
  className: "",
  groupName: "",
  sessionId: "",
  search: "",
};

const evaluationPreviewKey = "lab2ac-session2-evaluation-preview-attempts";

function isSession2EvaluationPreview() {
  const previewEnabled = process.env.NODE_ENV === "development"
    || process.env.NEXT_PUBLIC_SESSION2_EVALUATION_PREVIEW === "true";
  if (!previewEnabled || typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("preview") === "session2-evaluation";
}

const activityLabels: Record<string, string> = {
  unit1_exercise: "Exercice U1",
  quiz: "QCM",
  practical_evaluation: "Évaluation pratique",
  photo_challenge: "Défi image",
  workshop: "Atelier pratique",
  session_completion: "Validation de séance",
};

const session1ActivityLabels: Record<string, string> = {
  "s1-geste-clic": "Précision de la souris",
  "s1-geste-double": "Ouvrir par double-clic",
  "s1-geste-saisie": "Écrire et valider avec Entrée",
  "s1-definition-mot": "Construire le mot informatique",
  "s1-definition-informatique": "Définir l’informatique",
  "s1-formes-associer": "Associer les formes d’information",
  "s1-formes-selection": "Reconnaître les formes d’information",
  "s1-traitement-ordre": "De la photo sombre à la photo claire",
  "s1-traitement-definition": "Définir un traitement",
  "s1-types-image": "Reconnaître un traitement manuel",
  "s1-types-associer": "Classer les types de traitement",
  "s1-automatique-caracteristiques": "Caractéristiques d’un traitement automatique",
  "s1-situation-notes": "Situation-problème · élection du délégué",
  "s1-exemple-automatique": "Produire un exemple de traitement automatique",
  "session-1-quiz": "Évaluation de la séance 1",
  "session-1-completion": "Validation de la séance 1",
};

const session2ActivityLabels: Record<string, string> = {
  "s2-composition-qcu": "Composition d’un ordinateur · QCU",
  "s2-poste-reperes": "Reconnaître le poste informatique",
  "s2-classer-peripheriques": "Classer les périphériques · glisser-déposer",
  "s2-qcm-visioconference": "Périphériques d’une visioconférence · QCM",
  "s2-poste-fonctions": "Fonctions des éléments du poste",
  "s2-peripherique-ou-composant": "Périphérique ou composant interne",
  "s2-sens-information": "Sens de circulation de l’information",
  "s2-peripheriques-roles": "Rôle des périphériques",
  "s2-situation-expose": "Matériel nécessaire pour un exposé",
  "s2-choisir-ordinateur-simple": "Choisir un ordinateur · besoin simple",
  "s2-branchements": "Branchements et ports",
  "s2-composants-roles": "Composants internes et rôles",
  "s2-diagnostic-memoire": "Diagnostic de la mémoire RAM",
  "s2-unites-ordre": "Ordre des unités de capacité",
  "s2-conversions-capacites": "Conversions des unités de capacité",
  "s2-defi-poste-complet": "Composer le poste du club · sélection multiple",
  "s2-assembler-pc": "Assembler le PC · composants essentiels",
  "s2-depanner-pc": "Dépanner le PC · diagnostic et réparation",
  "s2-evaluation-assembler": "Évaluation pratique · assembler le PC",
  "s2-evaluation-depanner": "Évaluation pratique · dépanner le PC",
  "s2-choix-ordinateur-bureautique": "Choisir un ordinateur · travail scolaire",
  "s2-choix-ordinateur-multimedia": "Choisir un ordinateur · multimédia",
  "s2-choisir-ordinateur-complexe": "Choisir un ordinateur · multimédia",
  "s2-diagnostic-lenteur": "Diagnostic de la mémoire RAM",
  "s2-securite": "Sécurité du matériel",
  "s2-defi-final": "Stockage et transport d’un fichier",
  "session-2-quiz": "Évaluation QCM + justification · séance 2",
  "session-2-completion": "Validation de la séance 2",
};

const session2Competencies = [
  { label: "Composition du poste", ids: ["s2-composition-qcu", "s2-poste-reperes"] },
  { label: "Périphériques et fonctions", ids: ["s2-classer-peripheriques", "s2-qcm-visioconference", "s2-peripheriques-roles"] },
  { label: "Composants internes", ids: ["s2-composants-roles", "s2-diagnostic-memoire"] },
  { label: "Unités et conversions", ids: ["s2-unites-ordre", "s2-conversions-capacites"] },
  { label: "Choisir un poste", ids: ["s2-defi-poste-complet"] },
  { label: "Assembler et dépanner", ids: ["s2-assembler-pc", "s2-depanner-pc"] },
] as const;

const session1Competencies = [
  { label: "Gestes de base", ids: ["s1-geste-clic", "s1-geste-double", "s1-geste-saisie"] },
  { label: "Informatique et information", ids: ["s1-definition-mot", "s1-definition-informatique"] },
  { label: "Formes de l’information", ids: ["s1-formes-associer", "s1-formes-selection"] },
  { label: "Étapes d’un traitement", ids: ["s1-traitement-ordre", "s1-traitement-definition", "s1-situation-notes"] },
  { label: "Types de traitement", ids: ["s1-types-image", "s1-types-associer", "s1-automatique-caracteristiques", "s1-exemple-automatique"] },
] as const;

const session3Competencies = [
  {label:"Information et traitement",ids:[0,1,2].map(i=>session3Lab.exercises[i].id)},
  {label:"Matériel et conversions",ids:[3,4,5].map(i=>session3Lab.exercises[i].id)},
  {label:"Système d’exploitation et applications",ids:[6,7,8].map(i=>session3Lab.exercises[i].id)},
  {label:"Bureau et fenêtres Windows",ids:[9,10,11,12,19,20].map(i=>session3Lab.exercises[i].id)},
  {label:"Fichiers et organisation des dossiers",ids:[13,14,15,16,17,18,21,22,23,24].map(i=>session3Lab.exercises[i].id)},
];

const pedagogicalSessions = {
  1: {
    title: "Information et traitement",
    exerciseCount: 14,
    competencies: session1Competencies,
  },
  2: {
    title: "Environnement matériel d’un système informatique",
    exerciseCount: 12,
    competencies: session2Competencies,
  },
  3: {
    title:"Système d’exploitation · Windows et fichiers",
    exerciseCount:session3Lab.exercises.length,
    competencies:session3Competencies,
  },
} as const;

function activityName(attempt: Pick<Attempt, "activityId" | "activityType">) {
  if (attempt.activityId === session4AppliedEvaluationId) return "Séance 4 · Réseau local · 4 missions pratiques /20";
  if (attempt.activityId === session4LabEvaluationId) return "Séance 4 · QCM et simulateur réseau · Évaluation /20";
  if (attempt.activityId === session4QuizEvaluationId) return "Séance 4 · Réseau local · Évaluation /20";
  if (attempt.activityId === "session-4-tp-messagerie") return "Séance 4 · Échange réel BeeBEEP · déclaré";
  const session4Activity=session4AllActivities.find(a=>a.id===attempt.activityId);
  if(session4Activity)return `Séance 4 · ${session4Activity.title.fr}${session4Activity.kind==="practice"?" · déclaré":""}`;
  if (attempt.activityId === "session-3-bilan-situations-v5") return "Séance 3 · Bilan en trois situations / 20";
  return session1ActivityLabels[attempt.activityId] ?? session2ActivityLabels[attempt.activityId] ?? session3Lab.exercises.find(exercise => exercise.id === attempt.activityId)?.title.fr ?? activityLabels[attempt.activityType] ?? attempt.activityType;
}

const answerLabels: Record<string, string> = {
  answers: "Réponses au QCM",
  question: "Question",
  selectedChoice: "Réponse choisie",
  selectedIndex: "Choix sélectionné",
  selectedIndices: "Choix sélectionnés",
  matches: "Classement proposé",
  sequence: "Ordre proposé",
  text: "Réponse saisie",
  completed: "Activité terminée",
  workshop: "Atelier",
  mode: "Mode",
  completedTargets: "Cibles réussies",
  clickedTarget: "Cible choisie",
  expectedTarget: "Cible attendue",
  correct: "Résultat",
  correctChoice: "Réponse attendue",
  correctChoices: "Réponses attendues",
  correctIndex: "Indice attendu",
  correctIndices: "Indices attendus",
  displayedChoice: "Lettre affichée",
  displayedCorrectChoice: "Lettre attendue",
  selectedJustification: "Justification choisie",
  correctJustification: "Justification attendue",
  displayedJustification: "Numéro de justification affiché",
  displayedCorrectJustification: "Numéro de justification attendu",
  answerCorrect: "Résultat de la réponse",
  justificationCorrect: "Résultat de la justification",
  earnedPoints: "Points obtenus",
  maxPoints: "Points possibles",
  selectedChoices: "Réponses choisies",
  expectedSequence: "Ordre attendu",
  acceptedAnswers: "Réponses acceptées",
  scenario: "Situation de panne",
  selectedComponent: "Composant choisi",
  correctComponent: "Composant attendu",
  selectedRepair: "Réparation choisie",
  correctRepair: "Réparation attendue",
  componentCorrect: "Diagnostic du composant",
  repairCorrect: "Diagnostic de la réparation",
  errors: "Erreurs",
  total: "Éléments à placer",
  placements: "Classement réalisé",
  cases: "Pannes diagnostiquées",
  componentAttempts: "Composants essayés",
  repairAttempts: "Réparations essayées",
};

function studentName(item: Pick<Attempt, "studentOne" | "studentTwo">) {
  return item.studentTwo ? `${item.studentOne} + ${item.studentTwo}` : item.studentOne;
}

function sortLearnersByLatestSubmission(learners: Learner[]) {
  return [...learners].sort((left, right) => {
    const leftTime = left.lastAttemptAt ? Date.parse(left.lastAttemptAt) : 0;
    const rightTime = right.lastAttemptAt ? Date.parse(right.lastAttemptAt) : 0;
    if (rightTime !== leftTime) return rightTime - leftTime;
    return studentName(left).localeCompare(studentName(right), "fr", { sensitivity: "base" });
  });
}

function parseDatabaseDate(value: string) {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  return new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(normalized) ? normalized : `${normalized}Z`);
}

function formatDateTime(value: string | null) {
  if (!value) return "Aucune tentative";
  const date = parseDatabaseDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Africa/Casablanca",
  }).format(date);
}

function displayAnswerValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value || "—";
  if (Array.isArray(value)) return value.map(displayAnswerValue).join(" · ");
  if (typeof value === "object") {
    const localized = value as { fr?: unknown; ar?: unknown };
    if (typeof localized.fr === "string" || typeof localized.ar === "string") {
      return [localized.fr, localized.ar].filter(Boolean).join(" / ");
    }
    return JSON.stringify(value);
  }
  return String(value);
}

function parseAttemptAnswer(row: Attempt) {
  try {
    return JSON.parse(row.responseJson) as unknown;
  } catch {
    return row.responseJson;
  }
}

function answerPreview(row: Attempt) {
  const answer = parseAttemptAnswer(row);
  if (answer && typeof answer === "object" && !Array.isArray(answer)) {
    const record = answer as Record<string, unknown>;
    if (record.environment === "simulation Windows 11" && Array.isArray(record.criteria)) {
      const criteria = record.criteria as Array<{label:string;correct:boolean}>;
      return criteria.map(c => `${c.correct ? "✓" : "À revoir"} : ${c.label}`).join(" · ");
    }
    const quizAnswers = Array.isArray(record.answers) ? record.answers as Array<Record<string, unknown>> : [];
    if (quizAnswers.length > 0) {
      return quizAnswers.map((item, index) => {
        const justification = item.selectedJustification === null || item.selectedJustification === undefined
          ? ""
          : ` · justification : ${displayAnswerValue(item.selectedJustification)}`;
        return `Q${index + 1}: ${displayAnswerValue(item.selectedChoice)}${justification}`;
      }).join(" · ");
    }
    const conversions = Array.isArray(record.conversions) ? record.conversions as Array<Record<string, unknown>> : [];
    if (conversions.length > 0) {
      return conversions.map((item) => `${displayAnswerValue(item.conversion)} : ${displayAnswerValue(item.answer)}`).join(" · ");
    }
    const placements = Array.isArray(record.placements) ? record.placements as Array<Record<string, unknown>> : [];
    if (placements.length > 0) {
      return `${placements.length} éléments correctement placés · ${displayAnswerValue(record.errors)} erreur(s) avant réussite`;
    }
    const repairCases = Array.isArray(record.cases) ? record.cases as Array<Record<string, unknown>> : [];
    if (repairCases.length > 0) {
      return `${repairCases.length} pannes résolues · ${displayAnswerValue(record.errors)} erreur(s) avant réussite`;
    }
    if (record.selectedComponent || record.selectedRepair) {
      return `${displayAnswerValue(record.selectedComponent)} → ${displayAnswerValue(record.selectedRepair)}`;
    }
    return displayAnswerValue(
      record.selectedChoice ?? record.selectedChoices ?? record.text ?? record.sequence ?? record.matches ?? record.completed,
    );
  }
  return displayAnswerValue(answer);
}

function attemptPercentage(attempt: Attempt) {
  if (attempt.score !== null && attempt.maxScore !== null && attempt.maxScore > 0) {
    return Math.round((attempt.score / attempt.maxScore) * 100);
  }
  if (attempt.isCorrect === null) return null;
  return attempt.isCorrect ? 100 : 0;
}

function percentageToGrade(percentage: number | null) {
  return percentage === null ? null : Math.round((percentage / 5) * 10) / 10;
}

function attemptErrorCount(attempt: Attempt | null) {
  if (!attempt) return null;
  const answer = parseAttemptAnswer(attempt);
  if (!answer || typeof answer !== "object" || Array.isArray(answer)) return null;
  const errors = Number((answer as Record<string, unknown>).errors);
  return Number.isInteger(errors) && errors >= 0 ? errors : null;
}

function bestAttempt(attempts: Attempt[], activityId: string) {
  return attempts
    .filter((attempt) => attempt.activityId === activityId)
    .reduce<Attempt | null>((best, attempt) => {
      if (!best) return attempt;
      const percentageDifference = (attemptPercentage(attempt) ?? -1) - (attemptPercentage(best) ?? -1);
      if (percentageDifference !== 0) return percentageDifference > 0 ? attempt : best;
      const errorDifference = (attemptErrorCount(best) ?? Number.MAX_SAFE_INTEGER) - (attemptErrorCount(attempt) ?? Number.MAX_SAFE_INTEGER);
      if (errorDifference !== 0) return errorDifference > 0 ? attempt : best;
      return Date.parse(attempt.createdAt) > Date.parse(best.createdAt) ? attempt : best;
    }, null);
}

function sessionSummaryForAttempts(attempts: Attempt[], sessionId: 1 | 2 | 3) {
  const config = pedagogicalSessions[sessionId];
  const sessionAttempts = attempts.filter((attempt) => attempt.sessionId === sessionId);
  const successfulIds = new Set(sessionAttempts.filter((attempt) => attempt.activityType === "unit1_exercise" && Boolean(attempt.isCorrect) && (sessionId !== 3 || session3Lab.exercises.some(e=>e.id===attempt.activityId))).map((attempt) => attempt.activityId));
  const bestQuiz = bestAttempt(sessionAttempts, `session-${sessionId}-quiz`);
  const bestBilan = sessionId === 3 ? bestAttempt(sessionAttempts,"session-3-bilan-situations-v5") : null;
  const bestAssembly = sessionId === 2 ? bestAttempt(sessionAttempts, "s2-evaluation-assembler") : null;
  const bestRepair = sessionId === 2 ? bestAttempt(sessionAttempts, "s2-evaluation-depanner") : null;
  const evaluationAttempts = (sessionId === 3 ? [bestBilan] : [bestAssembly, bestRepair, bestQuiz]).filter((attempt): attempt is Attempt => Boolean(attempt));
  const evaluationScore = evaluationAttempts.reduce((total, attempt) => total + (attempt.score ?? 0), 0);
  const evaluationMaxScore = evaluationAttempts.reduce((total, attempt) => total + (attempt.maxScore ?? 0), 0);
  const evaluationPercentage = ((sessionId === 2 && evaluationAttempts.length === 3) || (sessionId === 3 && Boolean(bestBilan))) && evaluationMaxScore > 0
    ? Math.round((evaluationScore / evaluationMaxScore) * 100)
    : null;
  const competencies = config.competencies.map((competency) => {
    const acquired = competency.ids.filter((id) => successfulIds.has(id)).length;
    return `${competency.label}: ${acquired === competency.ids.length ? "Acquis" : acquired > 0 ? "En cours" : "À travailler"} (${acquired}/${competency.ids.length})`;
  }).join(" · ");
  return {
    attempts: sessionAttempts.length,
    exercises: successfulIds.size,
    successfulIds,
    bestQuiz,
    bestBilan,
    bestAssembly,
    bestRepair,
    evaluationPercentage,
    evaluationGrade: percentageToGrade(evaluationPercentage),
    completedEvaluationStages: evaluationAttempts.length,
    competencies,
  };
}

function readEvaluationPreviewAttempts() {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(evaluationPreviewKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? parsed as Attempt[] : [];
  } catch {
    return [];
  }
}

function evaluationPreviewDashboard(): DashboardData {
  const attempts = readEvaluationPreviewAttempts().sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  const gradedAttempts = attempts.filter((attempt) => attempt.isCorrect !== null);
  const correctAttempts = gradedAttempts.filter((attempt) => Boolean(attempt.isCorrect)).length;
  const scorePercentages = attempts
    .map(attemptPercentage)
    .filter((value): value is number => value !== null);
  const averageScore = scorePercentages.length > 0
    ? Math.round(scorePercentages.reduce((total, value) => total + value, 0) / scorePercentages.length)
    : 0;
  const bestScore = scorePercentages.length > 0 ? Math.max(...scorePercentages) : null;
  const latestAttempt = attempts[0];
  const learner: Learner = {
    id: latestAttempt?.participantId ?? "00000000-0000-4000-8000-000000000002",
    studentOne: latestAttempt?.studentOne ?? "Élève test · Séance 2",
    studentTwo: latestAttempt?.studentTwo ?? null,
    className: latestAttempt?.className ?? "2/1",
    groupName: latestAttempt?.groupName ?? "1",
    isPair: latestAttempt?.isPair ?? 0,
    createdAt: latestAttempt?.createdAt ?? new Date().toISOString(),
    totalAttempts: attempts.length,
    gradedAttempts: gradedAttempts.length,
    correctAttempts,
    successRate: gradedAttempts.length > 0 ? Math.round((correctAttempts / gradedAttempts.length) * 100) : null,
    gradeOutOf20: bestScore === null ? null : percentageToGrade(bestScore),
    averageScore: scorePercentages.length > 0 ? averageScore : null,
    bestScore,
    completedSessions: 0,
    lastAttemptAt: latestAttempt?.createdAt ?? null,
  };

  return {
    sessionAccess: Array.from({ length: 15 }, (_, index) => ({
      sessionId: index + 1,
      isUnlocked: index === 1,
      updatedAt: new Date().toISOString(),
    })),
    stats: {
      totalParticipants: 1,
      totalAttempts: attempts.length,
      correctRate: gradedAttempts.length > 0 ? Math.round((correctAttempts / gradedAttempts.length) * 100) : 0,
      averageScore,
    },
    attempts,
    learners: [learner],
    pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
  };
}

function attemptExportRows(row: Attempt) {
  const date = parseDatabaseDate(row.createdAt);
  const dateText = new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "short",
    timeZone: "Africa/Casablanca",
  }).format(date);
  const timeText = new Intl.DateTimeFormat("fr-MA", {
    timeStyle: "medium",
    timeZone: "Africa/Casablanca",
  }).format(date);

  const answer = parseAttemptAnswer(row);
  const answerRecord = answer && typeof answer === "object" && !Array.isArray(answer)
    ? answer as Record<string, unknown>
    : null;
  const evaluationStage = row.evaluationStage
    ?? (row.activityId === "s2-evaluation-assembler" ? "assembly"
      : row.activityId === "s2-evaluation-depanner" ? "repair"
        : row.activityId === "session-2-quiz" ? "quiz" : null);
  const evaluationStageLabel = evaluationStage === "assembly"
    ? "1 · Assembler"
    : evaluationStage === "repair"
      ? "2 · Dépanner"
      : evaluationStage === "quiz"
        ? "3 · QCM + justification"
        : "";
  const evaluationErrors = answerRecord && Number.isInteger(Number(answerRecord.errors))
    ? Number(answerRecord.errors)
    : "";
  const base = [
    dateText,
    timeText,
    row.className,
    `Groupe ${row.groupName}`,
    row.studentOne,
    row.studentTwo ?? "",
    row.isPair ? "Binôme" : "Individuel",
    row.sessionId,
    activityName(row),
    row.activityId,
    evaluationStageLabel,
    evaluationErrors,
  ];
  const scorePercent = attemptPercentage(row);
  const gradeOutOf20 = percentageToGrade(scorePercent);
  const quizAnswers = answer && typeof answer === "object" && !Array.isArray(answer) &&
    Array.isArray((answer as Record<string, unknown>).answers)
    ? (answer as { answers: Array<Record<string, unknown>> }).answers
    : [];
  const conversionAnswers = answer && typeof answer === "object" && !Array.isArray(answer) &&
    Array.isArray((answer as Record<string, unknown>).conversions)
    ? (answer as { conversions: Array<Record<string, unknown>> }).conversions
    : [];
  const placementAnswers = answerRecord && Array.isArray(answerRecord.placements)
    ? answerRecord.placements as Array<Record<string, unknown>>
    : [];
  const repairCaseAnswers = answerRecord && Array.isArray(answerRecord.cases)
    ? answerRecord.cases as Array<Record<string, unknown>>
    : [];

  const details = quizAnswers.length > 0
    ? quizAnswers.map((item, index) => {
      const answerCorrect = typeof item.answerCorrect === "boolean" ? item.answerCorrect : Boolean(item.correct);
      const hasJustification = item.correctJustification !== null && item.correctJustification !== undefined;
      const justificationCorrect = typeof item.justificationCorrect === "boolean" ? item.justificationCorrect : null;
      return {
        number: index + 1,
        question: displayAnswerValue(item.question),
        selected: displayAnswerValue(item.selectedChoice),
        expected: displayAnswerValue(item.correctChoice),
        answerResult: answerCorrect ? "Correcte" : "Incorrecte",
        selectedJustification: hasJustification ? displayAnswerValue(item.selectedJustification) : "",
        expectedJustification: hasJustification ? displayAnswerValue(item.correctJustification) : "",
        justificationResult: !hasJustification ? "" : justificationCorrect ? "Correcte" : "Incorrecte",
        questionPoints: typeof item.earnedPoints === "number" ? item.earnedPoints : item.correct ? 1 : 0,
        questionMaxPoints: typeof item.maxPoints === "number" ? item.maxPoints : 1,
        result: item.correct ? "Correct" : "Incorrect",
      };
    })
    : conversionAnswers.length > 0
      ? conversionAnswers.map((item, index) => ({
        number: index + 1,
        question: displayAnswerValue(item.conversion),
        selected: displayAnswerValue(item.answer),
        expected: displayAnswerValue(item.expected),
        answerResult: item.correct ? "Correcte" : "Incorrecte",
        selectedJustification: "",
        expectedJustification: "",
        justificationResult: "",
        questionPoints: item.correct ? 1 : 0,
        questionMaxPoints: 1,
        result: item.correct ? "Correct" : "Incorrect",
      }))
      : placementAnswers.length > 0
        ? placementAnswers.map((item, index) => ({
          number: index + 1,
          question: `Placer : ${displayAnswerValue(item.element)}`,
          selected: displayAnswerValue(item.destination),
          expected: displayAnswerValue(item.destination),
          answerResult: "Correcte après validation",
          selectedJustification: "",
          expectedJustification: "",
          justificationResult: "",
          questionPoints: 1,
          questionMaxPoints: 1,
          result: "Correct",
        }))
        : repairCaseAnswers.length > 0
          ? repairCaseAnswers.map((item, index) => ({
            number: index + 1,
            question: displayAnswerValue(item.scenario),
            selected: `Composant(s) essayé(s) : ${displayAnswerValue(item.componentAttempts)} · Réparation(s) essayée(s) : ${displayAnswerValue(item.repairAttempts)}`,
            expected: `Composant : ${displayAnswerValue(item.correctComponent)} · Réparation : ${displayAnswerValue(item.correctRepair)}`,
            answerResult: "Panne résolue",
            selectedJustification: "",
            expectedJustification: "",
            justificationResult: "",
            questionPoints: 2,
            questionMaxPoints: 2,
            result: "Correct",
          }))
      : [{
      number: "",
      question: answer && typeof answer === "object" && !Array.isArray(answer)
        ? displayAnswerValue((answer as Record<string, unknown>).question)
        : "",
      selected: answerPreview(row),
      expected: answer && typeof answer === "object" && !Array.isArray(answer)
        ? displayAnswerValue(
          (answer as Record<string, unknown>).correctChoice ??
          (answer as Record<string, unknown>).correctChoices ??
          (answer as Record<string, unknown>).expectedSequence ??
          (answer as Record<string, unknown>).acceptedAnswers,
        )
        : "",
      answerResult: row.isCorrect === null ? "Non évaluée" : row.isCorrect ? "Correcte" : "Incorrecte",
      selectedJustification: "",
      expectedJustification: "",
      justificationResult: "",
      questionPoints: "",
      questionMaxPoints: "",
      result: row.isCorrect === null ? "Non évalué" : row.isCorrect ? "Correct" : "Incorrect",
    }];

  const labDetails = [session4LabEvaluationId,session4AppliedEvaluationId].includes(row.activityId) && Array.isArray(answerRecord?.practical)
    ? (answerRecord.practical as Array<Record<string, unknown>>).map((item,index)=>({
        number: details.length + index + 1,
        question: `${typeof item.section === "number" ? `Mission ${item.section+1} · ` : ""}${displayAnswerValue(item.criterion)}`,
        selected: item.correct ? "Geste réalisé" : "Geste à revoir",
        expected: "Geste réalisé",
        answerResult: item.correct ? "Validé" : "À revoir",
        selectedJustification: "",
        expectedJustification: "",
        justificationResult: "",
        questionPoints: typeof item.earnedPoints === "number" ? item.earnedPoints : 0,
        questionMaxPoints: typeof item.maxPoints === "number" ? item.maxPoints : "",
        result: item.correct ? "Correct" : "Incorrect",
      }))
    : [];
  return [...details,...labDetails].map((detail) => [
    ...base,
    detail.number,
    detail.question,
    detail.selected,
    detail.expected,
    detail.answerResult,
    detail.selectedJustification,
    detail.expectedJustification,
    detail.justificationResult,
    detail.questionPoints,
    detail.questionMaxPoints,
    detail.result,
    row.score ?? "",
    row.maxScore ?? "",
    scorePercent ?? "",
    gradeOutOf20 ?? "",
    row.isCorrect === null ? "Non évalué" : row.isCorrect ? "Correct" : "Incorrect",
    row.completedSessions,
    15,
  ]);
}

function AnswerDetails({ attempt }: { attempt: Attempt }) {
  let answer: unknown;
  try {
    answer = JSON.parse(attempt.responseJson);
  } catch {
    answer = attempt.responseJson;
  }

  if (
    answer &&
    typeof answer === "object" &&
    Array.isArray((answer as { answers?: unknown }).answers)
  ) {
    const {answers,practical} = answer as {answers:Array<Record<string,unknown>>;practical?:unknown};
    return (
      <div className="prof-quiz-details">
        {attempt.activityId === session4AppliedEvaluationId && <>
          <h4>Barème des quatre missions</h4>
          <div className="prof-evaluation-step-list">{["Équipements et topologies /6","Montage du réseau /5","CMD /3","Partage du fichier /6"].map((title,index)=><article key={title}><strong>{title}</strong><span>{displayAnswerValue((answer as {sections?:unknown[]}).sections?.[index])} point(s)</span></article>)}</div>
          <h4>Configuration remise</h4>
          {(()=>{const evidence=(answer as {evidence?:Record<string,unknown>}).evidence;const network=evidence?.network as {selections?:Record<string,string>}|undefined;const terminal=evidence?.terminal as {ip?:string;host?:string;commands?:string[]}|undefined;const s=network?.selections;return <div className="prof-simple-answer"><p>Ports du switch : PC-21 · {s?.['build-port-pc21']||'non branché'} ; PC-22 · {s?.['build-port-pc22']||'non branché'} ; point d’accès · {s?.['build-port-ap']||'non branché'}.</p><p>Wi-Fi : point d’accès · {s?.['build-ssid']||'non choisi'} ; portable · {s?.['build-laptop']||'non choisi'}.</p><p>Adresse relevée : {terminal?.ip||'non relevée'} · Nom relevé : {terminal?.host||'non relevé'}.</p><p>Commandes exécutées : {terminal?.commands?.join(' ; ')||'aucune'}.</p></div>;})()}
        </>}
        {[session4LabEvaluationId,session4AppliedEvaluationId].includes(attempt.activityId) && Array.isArray(practical) && <>
          <h4>{attempt.activityId===session4AppliedEvaluationId?"Réseau, CMD et partage : détail des gestes":"Manipulation dans le simulateur"}</h4>
          {(practical as Array<Record<string,unknown>>).map((item,index)=><article key={index}>
            <div className="prof-question-line">
              <strong>{displayAnswerValue(item.criterion)}</strong>
              <span className={item.correct?"prof-result-good":"prof-result-bad"}>
                {item.correct?<CheckCircle2 size={14}/>:<XCircle size={14}/>}
                {displayAnswerValue(item.earnedPoints)}/{displayAnswerValue(item.maxPoints)} pts
              </span>
            </div>
          </article>)}
          <h4>{attempt.activityId===session4AppliedEvaluationId?"Équipements et topologies":"Questions du QCM"}</h4>
        </>}
        {answers.map((item, index) => {
          const answerCorrect = typeof item.answerCorrect === "boolean" ? item.answerCorrect : Boolean(item.correct);
          const hasJustification = item.correctJustification !== null && item.correctJustification !== undefined;
          const justificationCorrect = typeof item.justificationCorrect === "boolean" ? item.justificationCorrect : null;
          const earnedPoints = typeof item.earnedPoints === "number" ? item.earnedPoints : item.correct ? 1 : 0;
          const maxPoints = typeof item.maxPoints === "number" ? item.maxPoints : 1;
          return (
            <article key={`${index}-${displayAnswerValue(item.question)}`}>
              <div className="prof-question-line">
                <strong>{attempt.activityId === "session-3-bilan-situations-v5" ? "Critère" : "Question"} {index + 1}</strong>
                <span className={item.correct ? "prof-result-good" : "prof-result-bad"}>
                  {item.correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {earnedPoints}/{maxPoints} point{maxPoints > 1 ? "s" : ""}
                </span>
              </div>
              <p>{displayAnswerValue(item.question)}</p>
              <dl>
                <div className={answerCorrect ? "prof-detail-correct" : "prof-detail-incorrect"}>
                  <dt>Réponse choisie</dt>
                  <dd>{displayAnswerValue(item.selectedChoice)} <small>{answerCorrect ? "Correcte" : "Incorrecte"}</small></dd>
                </div>
                <div><dt>Réponse attendue</dt><dd>{displayAnswerValue(item.correctChoice)}</dd></div>
                {item.displayedChoice !== undefined && <div><dt>Lettre affichée</dt><dd>{displayAnswerValue(item.displayedChoice)}</dd></div>}
                {hasJustification && (
                  <>
                    <div className={justificationCorrect ? "prof-detail-correct" : "prof-detail-incorrect"}>
                      <dt>Justification choisie</dt>
                      <dd>{displayAnswerValue(item.selectedJustification)} <small>{justificationCorrect ? "Correcte" : "Incorrecte"}</small></dd>
                    </div>
                    <div><dt>Justification attendue</dt><dd>{displayAnswerValue(item.correctJustification)}</dd></div>
                    <div><dt>Numéro affiché</dt><dd>{displayAnswerValue(item.displayedJustification)}</dd></div>
                  </>
                )}
              </dl>
            </article>
          );
        })}
      </div>
    );
  }

  if (answer && typeof answer === "object" && !Array.isArray(answer) && Array.isArray((answer as Record<string, unknown>).conversions)) {
    const conversions = (answer as { conversions: Array<Record<string, unknown>> }).conversions;
    return (
      <div className="prof-conversion-details">
        {conversions.map((item, index) => (
          <article key={`${index}-${displayAnswerValue(item.conversion)}`}>
            <strong>{displayAnswerValue(item.conversion)}</strong>
            <span>Réponse : <b>{displayAnswerValue(item.answer)}</b></span>
            <span>Attendu : <b>{displayAnswerValue(item.expected)}</b></span>
            <em className={item.correct ? "prof-result-good" : "prof-result-bad"}>
              {item.correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              {item.correct ? "Correcte" : "Incorrecte"}
            </em>
          </article>
        ))}
      </div>
    );
  }

  if (answer && typeof answer === "object" && !Array.isArray(answer) && Array.isArray((answer as Record<string, unknown>).placements)) {
    const record = answer as Record<string, unknown>;
    const placements = record.placements as Array<Record<string, unknown>>;
    return (
      <div className="prof-practical-details">
        <div className="prof-practical-summary">
          <strong>{placements.length}/{displayAnswerValue(record.total)} éléments placés</strong>
          <span>{displayAnswerValue(record.errors)} erreur(s) avant la réussite</span>
        </div>
        <div className="prof-practical-grid">
          {placements.map((item, index) => (
            <article key={`${index}-${displayAnswerValue(item.element)}`}>
              <strong>{displayAnswerValue(item.element)}</strong>
              <span>→ {displayAnswerValue(item.destination)}</span>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (answer && typeof answer === "object" && !Array.isArray(answer) && Array.isArray((answer as Record<string, unknown>).cases)) {
    const record = answer as Record<string, unknown>;
    const repairCases = record.cases as Array<Record<string, unknown>>;
    return (
      <div className="prof-practical-details">
        <div className="prof-practical-summary">
          <strong>{repairCases.length} pannes résolues</strong>
          <span>{displayAnswerValue(record.errors)} erreur(s) avant la réussite</span>
        </div>
        <div className="prof-repair-case-list">
          {repairCases.map((item, index) => (
            <article key={`${index}-${displayAnswerValue(item.scenario)}`}>
              <header><span>Panne {String(index + 1).padStart(2, "0")}</span><strong>{displayAnswerValue(item.scenario)}</strong></header>
              <dl>
                <div><dt>Composant attendu</dt><dd>{displayAnswerValue(item.correctComponent)}</dd></div>
                <div><dt>Essais de l’élève</dt><dd>{displayAnswerValue(item.componentAttempts)}</dd></div>
                <div><dt>Réparation attendue</dt><dd>{displayAnswerValue(item.correctRepair)}</dd></div>
                <div><dt>Essais de l’élève</dt><dd>{displayAnswerValue(item.repairAttempts)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (answer && typeof answer === "object" && !Array.isArray(answer)) {
    const record = answer as Record<string, unknown>;
    if (record.question) {
      const received = record.selectedChoice ?? record.selectedChoices ?? record.text ?? record.sequence ?? record.matches;
      const expected = record.correctChoice ?? record.correctChoices ?? record.expectedSequence ?? record.acceptedAnswers;
      return (
        <dl className="prof-answer-list prof-pedagogical-answer">
          <div><dt>Question</dt><dd>{displayAnswerValue(record.question)}</dd></div>
          <div><dt>Réponse de l’élève</dt><dd>{received === undefined ? "Aucune réponse" : displayAnswerValue(received)}</dd></div>
          <div><dt>Réponse attendue</dt><dd>{expected === undefined ? "—" : displayAnswerValue(expected)}</dd></div>
          <div><dt>Résultat</dt><dd>{attempt.isCorrect === null ? "Non évalué" : attempt.isCorrect ? "Correct" : "Incorrect"}</dd></div>
        </dl>
      );
    }
    return (
      <dl className="prof-answer-list">
        {Object.entries(record).filter(([key]) => key !== "selectedIndex" && key !== "correctIndex").map(([key, value]) => (
          <div key={key}>
            <dt>{answerLabels[key] ?? key}</dt>
            <dd>{displayAnswerValue(value)}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return <p className="prof-answer-plain">{displayAnswerValue(answer)}</p>;
}

function SessionLearningReport({ attempts, sessionId, onOpenAttempt }: { attempts: Attempt[]; sessionId: 1 | 2 | 3; onOpenAttempt?:(attempt:Attempt)=>void }) {
  const config = pedagogicalSessions[sessionId];
  const sessionAttempts = attempts.filter((attempt) => attempt.sessionId === sessionId);
  const summary = sessionSummaryForAttempts(attempts,sessionId);
  const {successfulIds,bestQuiz,bestBilan,bestAssembly,bestRepair,evaluationPercentage,evaluationGrade} = summary;
  const bestEvaluation = sessionId === 3 ? bestBilan : bestQuiz;
  const evaluationAttempts = [bestAssembly,bestRepair,bestQuiz].filter((attempt):attempt is Attempt=>Boolean(attempt));
  const evaluationScore = evaluationAttempts.reduce((sum,a)=>sum+(a.score??0),0);
  const evaluationMaxScore = evaluationAttempts.reduce((sum,a)=>sum+(a.maxScore??0),0);
  const bilanAnswer = bestBilan ? parseAttemptAnswer(bestBilan) : null;
  const bilanSections = bilanAnswer && typeof bilanAnswer === "object" && "sections" in bilanAnswer && Array.isArray(bilanAnswer.sections) ? bilanAnswer.sections as number[] : null;
  if (sessionAttempts.length === 0) return null;

  const progressPercent = Math.round((successfulIds.size / config.exerciseCount) * 100);
  const gradedAttempts = sessionAttempts.filter((attempt) => attempt.isCorrect !== null);
  const correctAttempts = gradedAttempts.filter((attempt) => Boolean(attempt.isCorrect)).length;
  const successPercent = gradedAttempts.length > 0 ? Math.round((correctAttempts / gradedAttempts.length) * 100) : 0;

  return (
    <section className="prof-session2-report" aria-label={`Bilan de la séance ${sessionId}`}>
      <div className="prof-session2-head">
        <div><small>BILAN PÉDAGOGIQUE · SÉANCE {String(sessionId).padStart(2, "0")}</small><strong>{config.title}</strong></div>
        <span>{sessionAttempts.length} tentative(s)</span>
      </div>
      <div className="prof-session2-overview">
        <article className="prof-session2-progress-card">
          <div className="prof-progress-ring" style={{ "--progress": `${progressPercent * 3.6}deg` } as React.CSSProperties}>
            <span><strong>{progressPercent}%</strong><small>progression</small></span>
          </div>
          <div><strong>{successfulIds.size}/{config.exerciseCount}</strong><span>exercices différents réussis</span></div>
        </article>
        <article className="prof-session2-score-card">
          <span className="prof-session2-card-icon"><GraduationCap size={20} /></span>
          <div><small>{sessionId === 3 ? "MEILLEUR BILAN / 20" : "MEILLEURE ÉVALUATION"}</small><strong>{bestEvaluation ? `${bestEvaluation.score ?? 0}/${bestEvaluation.maxScore ?? 0}` : "—"}</strong><span>{bestEvaluation ? `${attemptPercentage(bestEvaluation) ?? 0}% de réussite` : "Évaluation non réalisée"}</span></div>
        </article>
        <article className="prof-session2-score-card success">
          <span className="prof-session2-card-icon"><Target size={20} /></span>
          <div><small>RÉUSSITE DES TENTATIVES</small><strong>{successPercent}%</strong><span>{correctAttempts}/{gradedAttempts.length} réponses corrigées réussies</span></div>
        </article>
      </div>
      {sessionId === 2 && (
        <section className="prof-evaluation-path" aria-label="Bilan de l’évaluation de la séance 2">
          <header>
            <div><small>ÉVALUATION EN 3 ÉTAPES</small><strong>Assembler · Dépanner · QCM avec justification</strong></div>
            <span className={evaluationAttempts.length === 3 ? "complete" : "pending"}>
              {evaluationAttempts.length === 3
                ? `${evaluationPercentage}% · ${evaluationGrade}/20`
                : `${evaluationAttempts.length}/3 étapes terminées`}
            </span>
          </header>
          <div className="prof-evaluation-stage-grid">
            <article className={bestAssembly ? "complete" : "pending"}>
              <span className="prof-evaluation-stage-icon"><Activity size={19} /></span>
              <div><small>ÉTAPE 1</small><strong>Assembler le PC</strong><p>{bestAssembly ? `${bestAssembly.score}/${bestAssembly.maxScore} éléments · ${attemptErrorCount(bestAssembly) ?? 0} erreur(s) avant réussite` : "Non réalisée"}</p></div>
            </article>
            <article className={bestRepair ? "complete" : "pending"}>
              <span className="prof-evaluation-stage-icon"><AlertTriangle size={19} /></span>
              <div><small>ÉTAPE 2</small><strong>Dépanner le PC</strong><p>{bestRepair ? `6 pannes résolues · ${attemptErrorCount(bestRepair) ?? 0} erreur(s) avant réussite` : "Non réalisée"}</p></div>
            </article>
            <article className={bestQuiz ? "complete" : "pending"}>
              <span className="prof-evaluation-stage-icon"><GraduationCap size={19} /></span>
              <div><small>ÉTAPE 3</small><strong>QCM + justification</strong><p>{bestQuiz ? `${bestQuiz.score}/${bestQuiz.maxScore} points · ${attemptPercentage(bestQuiz) ?? 0}%` : "Non réalisée"}</p></div>
            </article>
          </div>
          <footer>
            <span>Calcul global : points obtenus aux trois étapes ÷ points possibles.</span>
            <strong>{evaluationPercentage === null ? "Bilan disponible après les 3 étapes" : `${evaluationScore}/${evaluationMaxScore} points · note ${evaluationGrade}/20`}</strong>
          </footer>
        </section>
      )}
      {sessionId === 3 && <section className="prof-evaluation-path" aria-label="Bilan de l’évaluation de la séance 3">
        <header><div><small>BILAN EN TROIS SITUATIONS</small><strong>Classer · Reconnaître · Organiser</strong></div><span className={bestBilan?"complete":"pending"}>{bestBilan?`${bestBilan.score}/${bestBilan.maxScore} points` : "Bilan non remis"}</span></header>
        <div className="prof-evaluation-stage-grid">{[{name:"Le poste du club",maximum:6},{name:"Les fichiers à utiliser",maximum:4},{name:"Le dossier à remettre",maximum:10}].map((part,i)=><article className={bestBilan?"complete":"pending"} key={part.name}><span className="prof-evaluation-stage-icon"><Target size={19}/></span><div><small>SITUATION {i+1}</small><strong>{part.name}</strong><p>{bilanSections&&Number.isFinite(bilanSections[i])?`${bilanSections[i]}/${part.maximum} points`:"Non remise"}</p></div></article>)}</div>
        <footer><span>Le bilan est noté sur 20. Les tentatives d’entraînement sont comptées séparément.</span>{bestBilan&&onOpenAttempt&&<button type="button" className="prof-detail-button" onClick={()=>onOpenAttempt(bestBilan)}><Eye size={15}/>Consulter les 15 critères</button>}</footer>
      </section>}
      <div className="prof-competency-title"><strong>Maîtrise des compétences</strong><span>Une compétence est acquise lorsque tous ses exercices sont réussis.</span></div>
      <div className="prof-competency-grid">
        {config.competencies.map((competency) => {
          const acquired = competency.ids.filter((id) => successfulIds.has(id)).length;
          const percentage = Math.round((acquired / competency.ids.length) * 100);
          const status = percentage === 100 ? "Acquis" : percentage > 0 ? "En cours" : "À travailler";
          return (
            <article className={percentage === 100 ? "acquired" : percentage > 0 ? "progress" : "missing"} key={competency.label}>
              <div><strong>{competency.label}</strong><span>{percentage}%</span></div>
              <i><b style={{ width: `${percentage}%` }} /></i>
              <footer><small>{status}</small><span>{acquired}/{competency.ids.length} exercices</span></footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function ProfessorDashboard() {
  const [section,setSection] = useState<TeacherSection>("progress");
  const [learningData,setLearningData] = useState<LearningAnalytics|null>(null);
  const [authState, setAuthState] = useState<"checking" | "login" | "ready">("checking");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(emptyFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [learnerToDelete, setLearnerToDelete] = useState<Learner | null>(null);
  const [deletingLearnerId, setDeletingLearnerId] = useState<string | null>(null);
  const [updatingSessionId, setUpdatingSessionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [learnerAttempts, setLearnerAttempts] = useState<Attempt[]>([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportScope, setReportScope] = useState<ReportScope>("all");
  const reportRequestRef = useRef(0);
  const [reportView, setReportView] = useState<"answers" | "summary">("answers");

  const loadDashboard = useCallback(async (nextFilters: FilterState, nextPage: number) => {
    if (isSession2EvaluationPreview()) {
      setSection("answers");
      setData(evaluationPreviewDashboard());
      setAuthState("ready");
      setLoading(false);
      setError("");
      return;
    }
    if (!teacherToken()) {
      setAuthState("login");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      if(section!=="answers") setLearningData(await teacherLearningAnalytics());
      else {const payload = await teacherDashboard<DashboardData>(nextFilters, nextPage);setData(payload);}
      setAuthState("ready");
    } catch (loadError) {
      if ((loadError as Error & { status?: number }).status === 401) {
        teacherLogout();
        setAuthState("login");
        setData(null);
        return;
      }
      const message = loadError instanceof Error ? loadError.message : "Chargement impossible.";
      setError(message);
      setAuthState("ready");
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    void loadDashboard(appliedFilters, page);
  }, [appliedFilters, loadDashboard, page]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      await teacherLogin(password);
      setPassword("");
      setAuthState("checking");
      await loadDashboard(appliedFilters, page);
    } catch (loginFailure) {
      setLoginError(loginFailure instanceof Error ? loginFailure.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    teacherLogout();
    setData(null);
    setLearningData(null);
    setAuthState("login");
  }

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters });
  }

  function resetFilters() {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  }

  async function downloadCsv() {
    setExporting(true);
    setError("");
    try {
      const payload = isSession2EvaluationPreview()
        ? { rows: readEvaluationPreviewAttempts(), truncated: false }
        : await teacherExport<{ rows: Attempt[]; truncated: boolean }>(appliedFilters);
      const header = [
        "Date",
        "Heure (Maroc)",
        "Classe",
        "Groupe",
        "Élève 1",
        "Élève 2",
        "Organisation",
        "Séance",
        "Type",
        "Activité",
        "Étape de l’évaluation",
        "Erreurs avant réussite",
        "N° question",
        "Question",
        "Réponse de l’élève",
        "Réponse attendue",
        "Résultat de la réponse",
        "Justification de l’élève",
        "Justification attendue",
        "Résultat de la justification",
        "Points de la question",
        "Points possibles de la question",
        "Résultat de la question",
        "Points de la tentative",
        "Points possibles de la tentative",
        "Pourcentage de la tentative (%)",
        "Note de la tentative (/20)",
        "Résultat de la tentative",
        "Séances terminées",
        "Nombre total de séances",
      ];
      const rows = payload.rows.flatMap(attemptExportRows);
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
      worksheet["!cols"] = [
        { wch: 12 }, { wch: 13 }, { wch: 10 }, { wch: 11 }, { wch: 24 }, { wch: 24 },
        { wch: 14 }, { wch: 9 }, { wch: 20 }, { wch: 30 }, { wch: 25 }, { wch: 22 }, { wch: 12 }, { wch: 48 },
        { wch: 48 }, { wch: 48 }, { wch: 22 }, { wch: 55 }, { wch: 55 }, { wch: 26 },
        { wch: 21 }, { wch: 29 }, { wch: 22 }, { wch: 22 }, { wch: 31 }, { wch: 30 },
        { wch: 27 }, { wch: 24 }, { wch: 18 }, { wch: 24 },
      ];
      if (rows.length > 0) worksheet["!autofilter"] = { ref: `A1:AD${rows.length + 1}` };

      const summaryHeader = [
        "Classe", "Groupe", "Élève 1", "Élève 2", "Organisation", "Nombre de tentatives",
        "Tentatives corrigées", "Réponses correctes", "Taux de réussite (%)", "Note indicative (/20)",
        "Score moyen des QCM (%)", "Meilleur score QCM (%)", "Séances terminées", "Total des séances",
        "Dernière tentative (Maroc)", "S1 - Tentatives", "S1 - Exercices réussis (/14)",
        "S1 - Meilleur QCM (points)", "S1 - Maximum du QCM", "S1 - Meilleur QCM (%)", "S1 - Bilan des compétences",
        "S2 - Tentatives", "S2 - Exercices réussis (/12)",
        "S2 - Assemblage (points)", "S2 - Assemblage (maximum)", "S2 - Assemblage (erreurs)",
        "S2 - Dépannage (points)", "S2 - Dépannage (maximum)", "S2 - Dépannage (erreurs)",
        "S2 - QCM (points)", "S2 - QCM (maximum)", "S2 - QCM (%)",
        "S2 - Évaluation globale (%)", "S2 - Note globale (/20)", "S2 - Étapes réussies (/3)",
        "S2 - Bilan des compétences",
        "S3 - Tentatives", "S3 - Exercices réussis (/25)", "S3 - Bilan (points)", "S3 - Bilan (maximum)",
        "S3 - Bilan (%)", "S3 - Bilan des compétences",
      ];
      const summaryRows = (data?.learners ?? []).map((learner) => {
        const learnerRows = payload.rows.filter((attempt) => attempt.participantId === learner.id);
        const session1 = sessionSummaryForAttempts(learnerRows, 1);
        const session2 = sessionSummaryForAttempts(learnerRows, 2);
        const session3 = sessionSummaryForAttempts(learnerRows, 3);
        return [
          learner.className,
          `Groupe ${learner.groupName}`,
          learner.studentOne,
          learner.studentTwo ?? "",
          learner.isPair ? "Binôme" : "Individuel",
          learner.totalAttempts,
          learner.gradedAttempts,
          learner.correctAttempts,
          learner.successRate ?? "",
          learner.gradeOutOf20 ?? "",
          learner.averageScore ?? "",
          learner.bestScore ?? "",
          learner.completedSessions,
          15,
          learner.lastAttemptAt ? formatDateTime(learner.lastAttemptAt) : "Aucune tentative",
          session1.attempts,
          session1.exercises,
          session1.bestQuiz?.score ?? "",
          session1.bestQuiz?.maxScore ?? "",
          session1.bestQuiz ? attemptPercentage(session1.bestQuiz) ?? "" : "",
          session1.competencies,
          session2.attempts,
          session2.exercises,
          session2.bestAssembly?.score ?? "",
          session2.bestAssembly?.maxScore ?? "",
          attemptErrorCount(session2.bestAssembly) ?? "",
          session2.bestRepair?.score ?? "",
          session2.bestRepair?.maxScore ?? "",
          attemptErrorCount(session2.bestRepair) ?? "",
          session2.bestQuiz?.score ?? "",
          session2.bestQuiz?.maxScore ?? "",
          session2.bestQuiz ? attemptPercentage(session2.bestQuiz) ?? "" : "",
          session2.evaluationPercentage ?? "",
          session2.evaluationGrade ?? "",
          session2.completedEvaluationStages,
          session2.competencies,
          session3.attempts,
          session3.exercises,
          session3.bestBilan?.score ?? "",
          session3.bestBilan?.maxScore ?? "",
          session3.evaluationPercentage ?? "",
          session3.competencies,
        ];
      });
      const summaryWorksheet = XLSX.utils.aoa_to_sheet([summaryHeader, ...summaryRows]);
      summaryWorksheet["!cols"] = summaryHeader.map((label) => ({
        wch: label.includes("Bilan des compétences") ? 90 : Math.min(36, Math.max(12, label.length + 3)),
      }));
      if (summaryRows.length > 0) summaryWorksheet["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(summaryHeader.length-1)}${summaryRows.length + 1}` };
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Résumé par élève");
      XLSX.utils.book_append_sheet(workbook, worksheet, "Réponses détaillées");
      const exportDate = new Intl.DateTimeFormat("fr-CA", { timeZone: "Africa/Casablanca" }).format(new Date());
      XLSX.writeFile(workbook, `suivi-eleves-2ac-${exportDate}.xlsx`, { compression: true });
      if (payload.truncated) setError("L’export a été limité aux 25 000 tentatives les plus récentes.");
    } catch (exportError) {
      if ((exportError as Error & { status?: number }).status === 401) {
        logout();
        return;
      }
      setError(exportError instanceof Error ? exportError.message : "Export impossible.");
    } finally {
      setExporting(false);
    }
  }

  async function deleteAllData() {
    if (deleteConfirmation !== "EFFACER") return;
    setDeleting(true);
    setError("");
    try {
      await teacherDeleteAllData();
      setDeleteDialogOpen(false);
      setDeleteConfirmation("");
      setSelectedLearner(null);
      setLearnerAttempts([]);
      setFilters(emptyFilters);
      setAppliedFilters(emptyFilters);
      setPage(1);
      await loadDashboard(emptyFilters, 1);
    } catch (deleteError) {
      if ((deleteError as Error & { status?: number }).status === 401) {
        logout();
        return;
      }
      setError(deleteError instanceof Error ? deleteError.message : "Suppression impossible.");
    } finally {
      setDeleting(false);
    }
  }

  async function deleteSelectedLearner() {
    if (!learnerToDelete) return;
    setDeletingLearnerId(learnerToDelete.id);
    setError("");
    try {
      await teacherDeleteLearner(learnerToDelete.id);
      if (selectedLearner?.id === learnerToDelete.id) {
        setSelectedLearner(null);
        setLearnerAttempts([]);
      }
      setLearnerToDelete(null);
      setPage(1);
      await loadDashboard(appliedFilters, 1);
    } catch (deleteError) {
      if ((deleteError as Error & { status?: number }).status === 401) {
        logout();
        return;
      }
      setError(deleteError instanceof Error ? deleteError.message : "Suppression de l’élève impossible.");
    } finally {
      setDeletingLearnerId(null);
    }
  }

  async function toggleSessionAccess(session: SessionAccess) {
    setUpdatingSessionId(session.sessionId);
    setError("");
    try {
      const sessionAccess = await teacherUpdateSessionAccess(session.sessionId, !session.isUnlocked);
      setData((current) => current ? { ...current, sessionAccess } : current);
    } catch (updateError) {
      if ((updateError as Error & { status?: number }).status === 401) {
        logout();
        return;
      }
      setError(updateError instanceof Error ? updateError.message : "Modification impossible.");
    } finally {
      setUpdatingSessionId(null);
    }
  }

  async function openLearnerReport(learner: Learner) {
    setSelectedLearner(learner);
    setLearnerAttempts([]);
    setSelectedAttemptId(null);
    const reportRequest = ++reportRequestRef.current;
    setReportScope("all");
    setReportView("answers");
    setReportLoading(true);
    setError("");
    try {
      if (isSession2EvaluationPreview()) {
        const attempts = readEvaluationPreviewAttempts();
        setLearnerAttempts(attempts);
        setReportScope(initialReportScope(attempts,"2"));
        return;
      }
      const report = await teacherLearnerReport<{ attempts: Attempt[]; truncated: boolean }>(learner.id);
      if (reportRequest !== reportRequestRef.current) return;
      setLearnerAttempts(report.attempts);
      setReportScope(initialReportScope(report.attempts,appliedFilters.sessionId));
      if (report.truncated) setError("Le rapport est limité aux 25 000 tentatives les plus récentes.");
    } catch (reportError) {
      if (reportRequest !== reportRequestRef.current) return;
      if ((reportError as Error & { status?: number }).status === 401) {
        logout();
        return;
      }
      setError(reportError instanceof Error ? reportError.message : "Rapport impossible à charger.");
    } finally {
      if (reportRequest === reportRequestRef.current) setReportLoading(false);
    }
  }

  if (authState === "checking" && !data) {
    return (
      <main className="prof-loading">
        <LoaderCircle className="spin" size={30} />
        <span>Ouverture de l’espace professeur…</span>
      </main>
    );
  }

  if (authState === "login") {
    return (
      <main className="prof-login-page">
        <section className="prof-login-card">
          <div className="prof-login-visual">
            <span className="prof-brand-mark">{"//"}</span>
            <div>
              <small>LAB·2AC</small>
              <h1>Espace professeur</h1>
              <p>Consultez les tentatives, les réponses et la progression de vos élèves.</p>
            </div>
            <div className="prof-security-note"><ShieldCheck size={19} /> Accès protégé et invisible depuis l’espace élève</div>
          </div>
          <form className="prof-login-form" onSubmit={login}>
            <span className="prof-login-icon"><KeyRound size={24} /></span>
            <div>
              <small>ACCÈS ENSEIGNANT</small>
              <h2>Bienvenue, Prof. Mohamed</h2>
              <p>Saisissez le mot de passe de l’espace professeur.</p>
            </div>
            <label>
              <span>Mot de passe</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                autoFocus
              />
            </label>
            {loginError && <div className="prof-login-error"><XCircle size={17} />{loginError}</div>}
            <button type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="spin" size={18} /> : <ShieldCheck size={18} />}
              Ouvrir le tableau de bord
            </button>
            <a href="../enseignant/cours/"><BookOpen size={16} /> Cours professeur</a><a href="../"><ArrowLeft size={16} /> Retour au cours</a>
          </form>
        </section>
      </main>
    );
  }

  if(section!=="answers") return <LearningTeacherPortal initialData={learningData} section={section} onSection={setSection} onLogout={logout} onExpired={logout}/>;

  return (
    <main className="prof-page">
      <header className="prof-header">
        <div className="prof-brand">
          <span className="prof-brand-mark">{"//"}</span>
          <span><strong>LAB·2AC</strong><small>ESPACE PROFESSEUR</small></span>
        </div>
        <div className="prof-header-actions">
          <a href="../enseignant/cours/"><BookOpen size={16} /> Cours professeur</a>
          <a href="../"><ArrowLeft size={16} /> Cours élève</a>
          <button onClick={() => void logout()}><LogOut size={16} /> Déconnexion</button>
        </div>
      </header>

      <div className="prof-content">
        <TeacherNavigation section={section} onChange={setSection}/>
        <section className="prof-title-row">
          <div>
            <span><GraduationCap size={17} /> SUIVI PÉDAGOGIQUE</span>
            <h1>Tableau de bord des élèves</h1>
            <p>Réponses, scores et progression enregistrés en temps réel.</p>
          </div>
          <div className="prof-title-actions">
            <button className="prof-export" type="button" onClick={() => void downloadCsv()} disabled={exporting || deleting}>
              <FileSpreadsheet size={18} />
              <span><strong>{exporting ? "Préparation…" : "Exporter Excel (.xlsx)"}</strong><small>Résumé des notes + réponses détaillées</small></span>
              {exporting ? <LoaderCircle className="spin" size={17} /> : <Download size={17} />}
            </button>
            <button className="prof-delete-data" type="button" onClick={() => setDeleteDialogOpen(true)} disabled={deleting}>
              <Trash2 size={17} /> Effacer les données
            </button>
          </div>
        </section>

        <section className="prof-session-control" aria-labelledby="session-control-title">
          <div className="prof-session-control-head">
            <div>
              <span><LockKeyhole size={16} /> ACCÈS DES ÉLÈVES</span>
              <h2 id="session-control-title">Verrouillage des séances</h2>
              <p>Seules les séances ouvertes peuvent être consultées et enregistrer des réponses.</p>
            </div>
            <strong>{data?.sessionAccess.filter((session) => session.isUnlocked).length ?? 0} ouverte(s)</strong>
          </div>
          <div className="prof-session-lock-grid">
            {(data?.sessionAccess ?? []).map((session) => (
              <button
                type="button"
                key={session.sessionId}
                className={session.isUnlocked ? "unlocked" : "locked"}
                onClick={() => void toggleSessionAccess(session)}
                disabled={updatingSessionId !== null}
                aria-pressed={session.isUnlocked}
              >
                <span>S{String(session.sessionId).padStart(2, "0")}</span>
                {updatingSessionId === session.sessionId
                  ? <LoaderCircle className="spin" size={16} />
                  : session.isUnlocked ? <UnlockKeyhole size={16} /> : <LockKeyhole size={16} />}
                <small>{session.isUnlocked ? "Ouverte" : "Fermée"}</small>
              </button>
            ))}
          </div>
        </section>

        <form className="prof-filters" onSubmit={applyFilters}>
          <span className="prof-filter-title"><Filter size={17} /> Filtres</span>
          <label>
            <span>Classe</span>
            <select value={filters.className} onChange={(event) => setFilters((current) => ({ ...current, className: event.target.value }))}>
              <option value="">Toutes</option>
              {Array.from({ length: 9 }, (_, index) => <option key={index} value={`2/${index + 1}`}>{`2/${index + 1}`}</option>)}
            </select>
          </label>
          <label>
            <span>Groupe</span>
            <select value={filters.groupName} onChange={(event) => setFilters((current) => ({ ...current, groupName: event.target.value }))}>
              <option value="">Tous</option>
              <option value="1">Groupe 1</option>
              <option value="2">Groupe 2</option>
            </select>
          </label>
          <label>
            <span>Séance</span>
            <select value={filters.sessionId} onChange={(event) => setFilters((current) => ({ ...current, sessionId: event.target.value }))}>
              <option value="">Toutes</option>
              {Array.from({ length: 15 }, (_, index) => <option key={index} value={index + 1}>Séance {index + 1}</option>)}
            </select>
          </label>
          <label className="prof-search-field">
            <span>Élève</span>
            <span><Search size={16} /><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Rechercher un nom…" /></span>
          </label>
          <button className="prof-apply" type="submit"><Filter size={16} /> Appliquer</button>
          <button className="prof-reset" type="button" onClick={resetFilters}><RefreshCw size={16} /> Réinitialiser</button>
        </form>

        {error && <div className="prof-page-error"><XCircle size={18} /><span>{error}</span><button onClick={() => void loadDashboard(appliedFilters, page)}>Réessayer</button></div>}

        <section className="prof-stats" aria-label="Indicateurs principaux">
          <article><span className="prof-stat-icon"><Users /></span><div><strong>{data?.stats.totalParticipants ?? 0}</strong><small>Élèves / binômes</small></div></article>
          <article><span className="prof-stat-icon"><Activity /></span><div><strong>{data?.stats.totalAttempts ?? 0}</strong><small>Tentatives</small></div></article>
          <article><span className="prof-stat-icon"><Target /></span><div><strong>{data?.stats.correctRate ?? 0}%</strong><small>Réponses correctes</small></div></article>
          <article><span className="prof-stat-icon"><GraduationCap /></span><div><strong>{data?.stats.averageScore ?? 0}%</strong><small>Moyenne des QCM</small></div></article>
        </section>

        <section className="prof-data-card">
          <div className="prof-data-head prof-learners-head">
            <div><strong>Rapports des élèves</strong><span>Une ligne par élève ou binôme</span></div>
            {loading && <span className="prof-refreshing"><LoaderCircle className="spin" size={16} /> Actualisation…</span>}
          </div>
          {data && data.learners.length > 0 ? (
                <div className="prof-learner-list">
                  {sortLearnersByLatestSubmission(data.learners).map((learner) => (
                    <article className="prof-learner-card" key={learner.id}>
                      <header>
                        <div className="prof-learner-identity">
                          <strong>{studentName(learner)}</strong>
                          <span>{learner.isPair ? "Binôme" : "Individuel"} · {learner.className} · Groupe {learner.groupName}</span>
                        </div>
                        <div className="prof-learner-actions">
                          <button className="prof-detail-button" onClick={() => void openLearnerReport(learner)}><Eye size={15} /> Consulter le rapport</button>
                          <button className="prof-delete-learner-button" onClick={() => setLearnerToDelete(learner)} aria-label={`Supprimer ${studentName(learner)}`}><Trash2 size={15} /> Supprimer</button>
                        </div>
                      </header>
                      <div className="prof-learner-metrics">
                        <div><span>Tentatives</span><strong>{learner.totalAttempts}</strong></div>
                        <div><span>Réussite</span><strong>{learner.gradedAttempts > 0 ? `${learner.correctAttempts}/${learner.gradedAttempts}` : "—"}</strong></div>
                        <div><span>Pourcentage</span><strong className="prof-percentage">{learner.successRate === null ? "—" : `${learner.successRate}%`}</strong></div>
                        <div><span>Note indicative</span><strong className="prof-grade">{learner.gradeOutOf20 === null ? "—" : `${learner.gradeOutOf20}/20`}</strong></div>
                        <div><span>Score moyen</span><strong>{learner.averageScore === null ? "—" : `${learner.averageScore}%`}</strong></div>
                        <div><span>Meilleur score</span><strong>{learner.bestScore === null ? "—" : `${learner.bestScore}%`}</strong></div>
                        <div className="prof-metric-progress"><span>Séances terminées</span><span className="prof-wide-progress"><i><b style={{ width: `${Math.round((learner.completedSessions / 15) * 100)}%` }} /></i><strong>{learner.completedSessions}/15</strong></span></div>
                        <div className="prof-metric-date"><span>Dernière tentative</span><strong><Clock3 size={13} />{formatDateTime(learner.lastAttemptAt)}</strong></div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="prof-empty"><Users size={28} /><strong>Aucun élève</strong><p>Aucune inscription ne correspond aux filtres sélectionnés.</p></div>
              )}
        </section>
      </div>

      <Dialog open={Boolean(selectedLearner)} onOpenChange={(open) => { if (!open) { reportRequestRef.current += 1; setSelectedLearner(null); setSelectedAttemptId(null); setReportLoading(false); } }}>
        <DialogContent className="prof-answer-dialog prof-learner-report-dialog">
          {selectedLearner && (
            <>
              <DialogHeader>
                <span className="prof-dialog-kicker">RAPPORT INDIVIDUEL</span>
                <DialogTitle>{studentName(selectedLearner)}</DialogTitle>
                <DialogDescription>
                  {selectedLearner.className} · Groupe {selectedLearner.groupName} · {selectedLearner.isPair ? "Binôme" : "Individuel"}
                </DialogDescription>
              </DialogHeader>
              <p className="prof-report-global-caption">Statistiques globales · toutes les séances</p>
              <div className="prof-report-summary">
                <article><small>Tentatives</small><strong>{selectedLearner.totalAttempts}</strong></article>
                <article><small>Réussite</small><strong>{selectedLearner.gradedAttempts > 0 ? `${selectedLearner.correctAttempts}/${selectedLearner.gradedAttempts}` : "—"}</strong></article>
                <article><small>Pourcentage</small><strong>{selectedLearner.successRate === null ? "—" : `${selectedLearner.successRate}%`}</strong></article>
                <article className="grade"><small>Note indicative</small><strong>{selectedLearner.gradeOutOf20 === null ? "—" : `${selectedLearner.gradeOutOf20}/20`}</strong></article>
                <article><small>Progression</small><strong>{selectedLearner.completedSessions}/15</strong></article>
              </div>
              {!reportLoading && learnerAttempts.length > 0 && (
                <div className="prof-report-view-tabs">
                  <button className={reportView === "answers" ? "active" : ""} onClick={() => setReportView("answers")}><Eye size={15} /> Réponses <span>{learnerAttempts.length}</span></button>
                  <button className={reportView === "summary" ? "active" : ""} onClick={() => setReportView("summary")}><Target size={15} /> Bilan pédagogique</button>
                </div>
              )}
              {!reportLoading && reportView === "summary" && (
                <div className="prof-session-reports">
                  <SessionLearningReport attempts={learnerAttempts} sessionId={1} />
                  <SessionLearningReport attempts={learnerAttempts} sessionId={2} />
                  <SessionLearningReport attempts={learnerAttempts} sessionId={3} onOpenAttempt={attempt=>{setReportView("answers");setReportScope(3);setSelectedAttemptId(attempt.id)}} />
                  <Session4TeacherReport attempts={learnerAttempts} onOpenAttempt={attempt=>{setReportView("answers");setReportScope(4);setSelectedAttemptId(attempt.id)}} />
                  {!learnerAttempts.some((attempt) => [1,2,3].includes(attempt.sessionId)) && (
                    <div className="prof-empty"><Target size={25} /><strong>Aucun bilan disponible</strong><p>L’élève n’a pas encore envoyé de réponse pour les séances 1, 2 ou 3.</p></div>
                  )}
                </div>
              )}
              {!reportLoading && reportView === "answers" && learnerAttempts.length > 0 && (
                <div className="prof-report-toolbar">
                  <div><strong>Historique des réponses</strong><span>{reportScope === "all" ? "Toutes les séances" : `Séance ${reportScope} uniquement`} · {filterReportAttempts(learnerAttempts,reportScope).length} réponse(s)</span></div>
                  <div>
                    {reportSessionIds(learnerAttempts).map(id=><button type="button" aria-pressed={reportScope===id} className={reportScope===id?"active":""} key={id} onClick={()=>{setReportScope(id);setSelectedAttemptId(null)}}>Séance {id}<span className="prof-report-scope-count">{learnerAttempts.filter(a=>a.sessionId===id).length}</span></button>)}
                    <button type="button" aria-pressed={reportScope === "all"} className={reportScope === "all" ? "active" : ""} onClick={() => {setReportScope("all");setSelectedAttemptId(null)}}>Toutes</button>
                  </div>
                </div>
              )}
              {reportLoading ? (
                <div className="prof-report-loading"><LoaderCircle className="spin" size={22} /> Chargement des réponses…</div>
              ) : reportView === "answers" && learnerAttempts.length > 0 ? (
                <div className="prof-report-attempts">
                  {filterReportAttempts(learnerAttempts,reportScope).map((attempt) => {
                    const expanded = selectedAttemptId === attempt.id;
                    const percentage = attemptPercentage(attempt);
                    const grade = percentageToGrade(percentage);
                    return (
                      <article className={`prof-report-attempt ${expanded ? "expanded" : ""}`} key={attempt.id}>
                        <button type="button" onClick={() => setSelectedAttemptId(expanded ? null : attempt.id)}>
                          <span><strong>S{String(attempt.sessionId).padStart(2, "0")} · {activityName(attempt)}</strong><small>{formatDateTime(attempt.createdAt)} · {attempt.activityId}</small></span>
                          <span className={`prof-result ${attempt.isCorrect === null ? "neutral" : attempt.isCorrect ? "good" : "bad"}`}>
                            {attempt.isCorrect === null ? "Non évalué" : attempt.isCorrect ? "Correct" : "Incorrect"}
                          </span>
                          <span className="prof-attempt-mark">
                            <strong>{percentage === null ? "—" : `${percentage}%`}</strong>
                            <small>{grade === null ? "" : `${grade}/20`}</small>
                          </span>
                          <Eye size={16} />
                        </button>
                        {expanded && <div className="prof-report-answer"><AnswerDetails attempt={attempt} /></div>}
                      </article>
                    );
                  })}
                  {reportScope !== "all" && !learnerAttempts.some(attempt=>attempt.sessionId===reportScope) && <div className="prof-report-no-session"><Activity size={22}/><strong>Aucune réponse pour la séance {reportScope}</strong><span>Les autres réponses sont disponibles dans les onglets des séances ou dans « Toutes ».</span></div>}
                </div>
              ) : reportView === "answers" ? (
                <div className="prof-empty"><Activity size={25} /><strong>Aucune tentative</strong><p>Cet élève n’a encore envoyé aucune réponse.</p></div>
              ) : null}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={(open) => { if (!deleting) { setDeleteDialogOpen(open); if (!open) setDeleteConfirmation(""); } }}>
        <DialogContent className="prof-delete-dialog">
          <DialogHeader>
            <span className="prof-delete-icon"><AlertTriangle size={24} /></span>
            <DialogTitle>Effacer toutes les données ?</DialogTitle>
            <DialogDescription>
              Cette action supprimera définitivement les élèves inscrits, leurs réponses, leurs scores et leur progression. La configuration du site sera conservée.
            </DialogDescription>
          </DialogHeader>
          <label className="prof-delete-confirmation">
            <span>Écrivez <strong>EFFACER</strong> pour confirmer</span>
            <input
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value.toUpperCase())}
              placeholder="EFFACER"
              autoComplete="off"
              disabled={deleting}
            />
          </label>
          <div className="prof-delete-actions">
            <button type="button" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Annuler</button>
            <button type="button" className="danger" onClick={() => void deleteAllData()} disabled={deleteConfirmation !== "EFFACER" || deleting}>
              {deleting ? <LoaderCircle className="spin" size={17} /> : <Trash2 size={17} />}
              {deleting ? "Suppression…" : "Effacer définitivement"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(learnerToDelete)} onOpenChange={(open) => { if (!open && !deletingLearnerId) setLearnerToDelete(null); }}>
        <DialogContent className="prof-delete-dialog prof-delete-learner-dialog">
          <DialogHeader>
            <span className="prof-delete-icon"><AlertTriangle size={24} /></span>
            <DialogTitle>Supprimer cet élève ?</DialogTitle>
            <DialogDescription>
              {learnerToDelete && <><strong>{studentName(learnerToDelete)}</strong><br />{learnerToDelete.className} · Groupe {learnerToDelete.groupName}</>}
            </DialogDescription>
          </DialogHeader>
          <p className="prof-delete-learner-warning">L’élève et toutes ses réponses, tentatives, notes et données de progression seront définitivement supprimés. Les autres élèves ne seront pas affectés.</p>
          <div className="prof-delete-actions">
            <button type="button" onClick={() => setLearnerToDelete(null)} disabled={Boolean(deletingLearnerId)}>Annuler</button>
            <button type="button" className="danger" onClick={() => void deleteSelectedLearner()} disabled={Boolean(deletingLearnerId)}>
              {deletingLearnerId ? <LoaderCircle className="spin" size={17} /> : <Trash2 size={17} />}
              {deletingLearnerId ? "Suppression…" : "Supprimer définitivement"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
