import { sessions, type LocalizedText } from "../app/course-data.ts";
import { photoChallenges } from "../app/practice-data.ts";
import { unit1Labs, type Unit1Exercise } from "../app/unit1-labs.ts";
import { guidedFileChecks, systemLabChecks, type SystemLabState } from "../app/session3-system-model.ts";
import { isWindowsState, windowsCriteria, type WindowsMode } from "../app/session3-windows-model.ts";
import { session4Activities, session4AllActivities, session4NetworkEquipment, session4OriginalStock, type Session4Activity, type Session4LegacyActivity } from "../app/session4-data.ts";
import { freshSession4Draft, session4ActivityChecks } from "../app/session4-model.ts";

type WorkshopType = "unit1_exercise" | "photo_challenge" | "workshop";
export type WorkshopExercise = {
  id: string;
  title: LocalizedText;
  type: WorkshopType;
  declared: boolean;
  previous?: {id: string; weight: number};
};
export type WorkshopEvidence = { activityId: string; percent: number; confirmed: boolean };
export type SavedWorkshopEvidence = WorkshopEvidence & { participantId: string; updatedAt: string };
export type WorkshopAttempt = {
  id: string;
  activityId: string;
  isCorrect: boolean | null;
  score: number | null;
  maxScore: number | null;
};
export type WorkshopAttemptTotals = {
  activityId: string;
  attempts: number;
  graded: number;
  correct: number;
  successful: boolean;
  bestScore: number | null;
  maxScore: number | null;
};
export type WorkshopRow = WorkshopExercise & {
  percent: number | null;
  confirmed: boolean;
  attempts: number;
  graded: number;
  correct: number;
};
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
export function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
}
const conversion = (value: string) => normalizeAnswer(value).replace(/\s/g, "").replace(",", ".");
const ratio = (earned: number, total: number) => total > 0 ? Math.round(100 * Math.min(earned, total) / total) : 0;
const percentOf = (checks: boolean[]) => ratio(checks.filter(Boolean).length, checks.length);

export function workshopExercises(sessionId: number, includeEarlier = false): WorkshopExercise[] {
  const lab = unit1Labs[sessionId as 1 | 2 | 3];
  if (lab) return lab.exercises.map(ex => ({ id: ex.id, title: ex.title, type: "unit1_exercise", declared: false }));
  if (sessionId === 4) {
    return (includeEarlier ? session4AllActivities : session4Activities).map(activity => ({
      id: activity.id, title: activity.title, type: "workshop", declared: activity.kind === "practice",
      ...("previousId" in activity && activity.previousId
        ? {previous: {id: activity.previousId, weight: session4OriginalStock.length / session4NetworkEquipment.length}}
        : {}),
    }));
  }
  const session = sessions.find(item => item.id === sessionId);
  const challenge = photoChallenges[sessionId];
  if (!session || !challenge) return [];
  return [
    { id: `session-${sessionId}-photo`, title: challenge.prompt, type: "photo_challenge", declared: false },
    ...session.workshops.map(item => ({ id: `session-${sessionId}-workshop-${item.label}`, title: item.text, type: "workshop" as const, declared: true })),
  ];
}

/** Null means that the learner has not provided any evidence for this exercise. */
export function unit1DraftPercent(exercise: Unit1Exercise, value: unknown): number | null {
  const draft = record(value);
  switch (exercise.type) {
    case "choice":
    case "hotspot":
      return Number.isInteger(draft.choice) ? (draft.choice === exercise.answer ? 100 : 0) : null;
    case "multi": {
      const selected = new Set(list(draft.multi));
      const union = new Set([...selected, ...exercise.answers]);
      return selected.size ? ratio(exercise.answers.filter(i => selected.has(i)).length, union.size) : null;
    }
    case "match": {
      const matches = record(draft.matches);
      return Object.keys(matches).length ? percentOf(exercise.rows.map((row, index) => matches[index] === row.answer)) : null;
    }
    case "sequence": {
      const sequence = list(draft.sequence);
      return sequence.length ? percentOf(exercise.steps.map((_, index) => sequence[index] === index)) : null;
    }
    case "text": {
      const answer = normalizeAnswer(text(draft.textValue));
      return answer ? ([...exercise.accepted.fr, ...exercise.accepted.ar].some(value => normalizeAnswer(value) === answer) ? 100 : 0) : null;
    }
    case "conversions": {
      const answers = record(draft.conversionValues);
      return Object.values(answers).some(text) ? percentOf(exercise.rows.map((row, index) => {
        const answer = conversion(text(answers[index]));
        return !!answer && row.accepted.some(value => conversion(value) === answer);
      })) : null;
    }
    case "diagnostic":
      return Number.isInteger(draft.diagnosticComponent) || Number.isInteger(draft.diagnosticRepair)
        ? percentOf([draft.diagnosticComponent === exercise.componentAnswer, draft.diagnosticRepair === exercise.repairAnswer])
        : null;
    case "gesture":
      if (exercise.mode === "precision") {
        return typeof draft.gestureProgress === "number" && draft.gestureProgress > 0 ? ratio(draft.gestureProgress, 5) : null;
      }
      if (exercise.mode === "typing") {
        const entered = text(draft.textValue);
        return entered ? ratio(entered.length, 2) : null;
      }
      return null;
    case "system-lab": {
      if (exercise.mode.startsWith("windows11-")) {
        const mode = exercise.mode.slice(10) as WindowsMode;
        if (!isWindowsState(draft.windows11, mode)) return null;
        const checks = windowsCriteria(draft.windows11, mode);
        return checks.some(check => check.correct)
          ? ratio(checks.reduce((sum, check) => sum + (check.correct ? check.points : 0), 0), checks.reduce((sum, check) => sum + check.points, 0))
          : draft.windows11.flags.length ? 0 : null;
      }
      const lab = record(draft.systemLab);
      if (!Array.isArray(lab.flags) || !Array.isArray(lab.files) || !lab.files.every(file => file && typeof file === "object")) return null;
      const state = lab as SystemLabState;
      const checks = exercise.mode === "guided-files" ? guidedFileChecks(state) : systemLabChecks(exercise.mode === "files" ? "files" : "windows", state);
      return checks.some(Boolean) || lab.flags.length ? percentOf(checks) : null;
    }
  }
}

export function session4DraftPercent(activity: Session4Activity | Session4LegacyActivity, value: unknown): number | null {
  const raw = record(value);
  const strings = (value: unknown) => list(value).filter((item): item is string => typeof item === "string");
  const draft = {
    ...freshSession4Draft(),
    selections: Object.fromEntries(Object.entries(record(raw.selections)).filter((entry): entry is [string, string] => typeof entry[1] === "string")),
    links: strings(raw.links),
    internet: raw.internet !== false,
    tested: raw.tested === true,
    delivered: raw.delivered === true,
    checks: strings(raw.checks),
    commands: strings(raw.commands),
    command: text(raw.command),
    shared: raw.shared === true,
    opened: raw.opened === true,
    permission: text(raw.permission),
    path: text(raw.path),
    ip: text(raw.ip),
    host: text(raw.host),
    peerIP: text(raw.peerIP),
    proof: text(raw.proof),
    simulator: raw.simulator as ReturnType<typeof freshSession4Draft>["simulator"],
  };
  const checks = session4ActivityChecks(activity, draft);
  const started = checks.some(Boolean) || !draft.internet || draft.links.length || draft.checks.length
    || Object.keys(draft.selections).length || draft.ip || draft.host || draft.peerIP || draft.proof
    || draft.commands.length || draft.command || draft.path || draft.tested || raw.result === false;
  return started ? percentOf(checks) : null;
}

export function workshopEvidence(sessionId: number, value: unknown): WorkshopEvidence[] {
  const state = record(value);
  if (state.version !== 1) return [];
  const drafts = record(state.drafts);
  const completed = new Set(list(state.completedIds));
  if (sessionId === 4) {
    return session4AllActivities.flatMap(activity => {
      const confirmed = completed.has(activity.id);
      const previousId = "previousId" in activity ? activity.previousId : undefined;
      const draft = drafts[activity.id] ?? (previousId ? drafts[previousId] : undefined);
      const percent = confirmed ? 100 : session4DraftPercent(activity, draft);
      return percent === null ? [] : [{ activityId: activity.id, percent, confirmed }];
    });
  }
  const lab = unit1Labs[sessionId as 1 | 2 | 3];
  return workshopExercises(sessionId).flatMap((exercise, index) => {
    const draft = record(drafts[exercise.id]);
    let percent: number | null = null;
    let confirmed = completed.has(exercise.id);
    if (lab) {
      const item = lab.exercises[index];
      if (!item.revision || item.revision === draft.exerciseRevision) percent = unit1DraftPercent(item, draft);
    } else if (index === 0) {
      if (Number.isInteger(state.photoAnswer)) {
        confirmed = state.photoAnswer === photoChallenges[sessionId].answer;
        percent = confirmed ? 100 : 0;
      }
    } else {
      confirmed = list(state.checked)[index - 1] === true;
      const value = record(state.declaredProgress)[exercise.id];
      if (value === 25 || value === 50 || value === 75) percent = value;
    }
    return confirmed || percent !== null ? [{ activityId: exercise.id, percent: confirmed ? 100 : percent!, confirmed }] : [];
  });
}

export function attemptTotals(attempts: WorkshopAttempt[]): WorkshopAttemptTotals[] {
  const rows = new Map<string, WorkshopAttemptTotals>();
  for (const attempt of attempts) {
    const row = rows.get(attempt.activityId) ?? { activityId: attempt.activityId, attempts: 0, graded: 0, correct: 0, successful: false, bestScore: null, maxScore: null };
    row.attempts += 1;
    if (attempt.isCorrect !== null) row.graded += 1;
    if (attempt.isCorrect === true) row.correct += 1;
    row.successful ||= attempt.isCorrect === true;
    if (attempt.score !== null && attempt.maxScore !== null && attempt.maxScore > 0
        && (row.bestScore === null || attempt.score / attempt.maxScore > row.bestScore / row.maxScore!)) {
      row.bestScore = attempt.score;
      row.maxScore = attempt.maxScore;
    }
    rows.set(attempt.activityId, row);
  }
  return [...rows.values()];
}

export function workshopRows(exercises: WorkshopExercise[], drafts: WorkshopEvidence[], attempts: WorkshopAttemptTotals[]): WorkshopRow[] {
  return exercises.map(exercise => {
    const evidence = drafts.filter(row => row.activityId === exercise.id);
    const results = attempts.filter(row => row.activityId === exercise.id);
    const confirmed = evidence.some(row => row.confirmed) || results.some(row => row.successful
      || (exercise.declared && row.bestScore !== null && row.bestScore === row.maxScore));
    const scores = [
      ...evidence.map(row => row.percent),
      ...results.flatMap(row => row.bestScore !== null && row.maxScore !== null && row.maxScore > 0
        ? [ratio(Math.max(0, row.bestScore), row.maxScore)]
        : row.graded ? [0] : []),
    ];
    // A result for five photos still contributes to the revised exercise with six photos.
    if (exercise.previous) {
      const {id, weight} = exercise.previous;
      for (const row of drafts) if (row.activityId === id) scores.push(Math.round(row.percent * weight));
      for (const row of attempts) if (row.activityId === id) {
        if (row.successful) scores.push(Math.round(100 * weight));
        else if (row.bestScore !== null && row.maxScore !== null && row.maxScore > 0) {
          scores.push(ratio(Math.max(0, row.bestScore) * weight, row.maxScore));
        } else if (row.graded) scores.push(0);
      }
    }
    return {
      ...exercise, confirmed, percent: confirmed ? 100 : scores.length ? Math.max(...scores) : null,
      attempts: results.reduce((n, row) => n + row.attempts, 0),
      graded: exercise.declared ? 0 : results.reduce((n, row) => n + row.graded, 0),
      correct: exercise.declared ? 0 : results.reduce((n, row) => n + row.correct, 0),
    };
  });
}

export function workshopTotals(rows: WorkshopRow[]) {
  const sum = rows.reduce((n, row) => n + (row.percent ?? 0), 0);
  const graded = rows.reduce((n, row) => n + row.graded, 0);
  const correct = rows.reduce((n, row) => n + row.correct, 0);
  return {
    percent: ratio(sum, 100 * rows.length),
    grade: rows.some(row => row.percent !== null) ? Math.round(2 * sum / rows.length) / 10 : null,
    graded, correct,
    successRate: graded ? ratio(correct, graded) : null,
    attempts: rows.reduce((n, row) => n + row.attempts, 0),
    finished: rows.filter(row => row.confirmed).length,
  };
}
