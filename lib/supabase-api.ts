// LOCAL MODE (owner decision, 2026-11-09): no server. Students simply type
// their name and start working; every record lives in this browser's
// localStorage. This module keeps the exact same exported API and response
// shapes as the former Supabase-backed implementation, so no page changes
// were needed. Data is per-device: the teacher space shows the learners
// registered on the same browser.
import {
  workshopEvidence,
  workshopExercises,
  type SavedWorkshopEvidence,
  type WorkshopAttempt,
  type WorkshopEvidence,
} from "./workshop-progress";
import type { LearningSnapshot } from "./learning-storage";

export type StudentProfile = {
  id: string;
  studentOne: string;
  studentTwo: string | null;
  className: string;
  groupName: string;
  isPair: boolean;
  studentOneId?: string;
  studentTwoId?: string | null;
  resumeToken?: string;
};

export type ProfessorFilters = {
  className: string;
  groupName: string;
  sessionId: string;
  search: string;
};

export type SessionAccess = {
  sessionId: number;
  isUnlocked: boolean;
  updatedAt: string;
};

export type RosterStudent = {
  id: string;
  fullName: string;
  className: string;
  groupName: string | null;
  massarCode?: string | null;
  source: "registration" | "import" | "manual";
  active: boolean;
};

export type ActivityProgress = {
  participantId: string;
  sessionId: number;
  activityId: string;
  activityType: string;
  attempts: number;
  graded: number;
  correct: number;
  successful: boolean;
  firstSuccessAt: string | null;
  lastAt: string;
  bestScore: number | null;
  maxScore: number | null;
  sections: number[] | null;
};

export type LearningAnalytics = {
  students: RosterStudent[];
  participants: Array<StudentProfile & { createdAt: string }>;
  activities: ActivityProgress[];
  sessionAccess: SessionAccess[];
  generatedAt: string;
  truncated: boolean;
};

// ---------------------------------------------------------------------------
// Local store
// ---------------------------------------------------------------------------

const DB_KEY = "lab2ac-local-db-v1";
const teacherSessionKey = "lab2ac-teacher-session";
// Teacher-space password for this local copy (the server copy checked a
// salted hash in the original author's database; here the owner is the
// teacher, so the password is a plain local constant he can ask to change).
const TEACHER_PASSWORD = "Wahda@2026";

type LocalParticipant = StudentProfile & { createdAt: string; resumeToken: string; identityKey: string };
type LocalRoster = RosterStudent & { nameNormalized: string; registrationKey: string | null };
type LocalSubmission = {
  id: string;
  participantId: string;
  sessionId: number;
  activityType: string;
  activityId: string;
  response: unknown;
  isCorrect: boolean | null;
  score: number | null;
  maxScore: number | null;
  createdAt: string;
};
type LocalCheckpoint = {
  participantId: string;
  sessionId: number;
  kind: string;
  version: 1;
  changedAt: number;
  revision: number;
  data: Record<string, unknown>;
  workshopProgress?: WorkshopEvidence[];
  updatedAt: string;
};
type LocalDB = {
  roster: LocalRoster[];
  participants: LocalParticipant[];
  submissions: LocalSubmission[];
  checkpoints: LocalCheckpoint[];
  sessionAccess: Record<string, { isUnlocked: boolean; updatedAt: string }>;
};

const emptyDB = (): LocalDB => ({ roster: [], participants: [], submissions: [], checkpoints: [], sessionAccess: {} });

function loadDB(): LocalDB {
  if (typeof window === "undefined") return emptyDB();
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) return emptyDB();
    const parsed = JSON.parse(raw) as Partial<LocalDB>;
    return {
      roster: Array.isArray(parsed.roster) ? parsed.roster : [],
      participants: Array.isArray(parsed.participants) ? parsed.participants : [],
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
      checkpoints: Array.isArray(parsed.checkpoints) ? parsed.checkpoints : [],
      sessionAccess: parsed.sessionAccess && typeof parsed.sessionAccess === "object" ? parsed.sessionAccess : {},
    };
  } catch {
    return emptyDB();
  }
}

function saveDB(db: LocalDB) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // Storage full or unavailable: the in-page flow keeps working for the
    // current session; persistence is best-effort in local mode.
  }
}

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const text = (v: unknown) => (typeof v === "string" ? v.normalize("NFKC").trim().replace(/\s+/g, " ") : "");
const normal = (v: unknown) => text(v).toLocaleLowerCase("fr");
const nowISO = () => new Date().toISOString();

function fail(message: string, status = 400): never {
  throw Object.assign(new Error(message), { status });
}

function isSuggestibleStudentName(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const name = value.normalize("NFKC").trim().replace(/\s+/gu, " ");
  if (name.length < 2 || name.length > 100 || !/^[\p{L}\p{M}\s.'’ʼ-]+$/u.test(name)) return false;
  const letters = name.match(/\p{L}/gu) ?? [];
  if (letters.length < 2) return false;
  const words = name.toLocaleLowerCase("fr").match(/\p{L}[\p{L}\p{M}]*/gu) ?? [];
  if (words.every((word) => new Set([...word]).size === 1)) return false;
  const markers = new Set(["test", "tests", "demo", "demonstration", "exemple"]);
  return !words.some((word) => markers.has(word.normalize("NFD").replace(/\p{M}/gu, "")));
}

function publicProfile(p: LocalParticipant): StudentProfile {
  return {
    id: p.id,
    studentOne: p.studentOne,
    studentTwo: p.studentTwo,
    className: p.className,
    groupName: p.groupName,
    isPair: p.isPair,
    studentOneId: p.studentOneId,
    studentTwoId: p.studentTwoId ?? null,
    resumeToken: p.resumeToken,
  };
}

function participantByToken(db: LocalDB, resumeToken: unknown): LocalParticipant {
  const p = typeof resumeToken === "string" ? db.participants.find((item) => item.resumeToken === resumeToken) : undefined;
  if (!p) fail("Session de sauvegarde expirée.", 401);
  return p as LocalParticipant;
}

// ---------------------------------------------------------------------------
// Registration / identification (student entry — name only, no server)
// ---------------------------------------------------------------------------

function resolveMember(
  db: LocalDB,
  id: unknown,
  name: unknown,
  cls: string,
  group: string,
): LocalRoster {
  if (typeof id === "string" && id) {
    const row = db.roster.find(
      (r) => r.id === id && r.className === cls && r.active && (r.groupName === group || r.groupName === null),
    );
    if (row) return row;
    fail("Choisis un nom de ta classe et de ton groupe.");
  }
  const fullName = text(name);
  if (!isSuggestibleStudentName(fullName)) {
    fail("Saisis un nom complet valide, sans chiffres ni symboles. / اكتب اسما كاملا صحيحا دون أرقام أو رموز.");
  }
  const key = normal(fullName);
  const matches = db.roster.filter(
    (r) => r.className === cls && r.nameNormalized === key && (r.groupName === group || r.groupName === null),
  );
  const active = matches.filter((r) => r.active);
  if (active.length === 1) return active[0];
  if (active.length > 1) fail("Plusieurs noms identiques : choisis ton nom dans la liste.");
  if (matches.length) fail("Ce nom a été archivé. Contacte ton professeur.");
  const row: LocalRoster = {
    id: uuid(),
    fullName,
    className: cls,
    groupName: group,
    massarCode: null,
    source: "registration",
    active: true,
    nameNormalized: key,
    registrationKey: `${cls}|${group}|${key}`,
  };
  db.roster.push(row);
  return row;
}

export async function registerParticipant(payload: Omit<StudentProfile, "id">) {
  const db = loadDB();
  const cls = text(payload.className);
  const group = text(payload.groupName);
  const pair = payload.isPair === true;
  if (!/^(2\/[1-5]|3\/[1-4])$/.test(cls) || !["1", "2"].includes(group)) fail("Choisis ta classe et ton groupe.");
  const one = resolveMember(db, payload.studentOneId, payload.studentOne, cls, group);
  const two = pair ? resolveMember(db, payload.studentTwoId, payload.studentTwo, cls, group) : null;
  if (two && two.id === one.id) fail("Un binôme doit contenir deux élèves différents.");
  const members = [one.id, ...(two ? [two.id] : [])].sort();
  const identityKey = `${cls}|${group}|${pair ? "pair" : "solo"}|${members[0]}|${members[1] || ""}`;
  let participant = db.participants.find((p) => p.identityKey === identityKey);
  if (!participant) {
    participant = {
      id: uuid(),
      studentOne: one.fullName,
      studentTwo: two ? two.fullName : null,
      className: cls,
      groupName: group,
      isPair: pair,
      studentOneId: one.id,
      studentTwoId: two ? two.id : null,
      resumeToken: uuid(),
      createdAt: nowISO(),
      identityKey,
    };
    db.participants.push(participant);
  }
  saveDB(db);
  return publicProfile(participant);
}

export function rosterSuggestions(className: string, groupName: string) {
  const db = loadDB();
  const cls = text(className);
  const group = text(groupName);
  if (!/^(2\/[1-5]|3\/[1-4])$/.test(cls) || !["1", "2"].includes(group)) fail("Classe ou groupe invalide.");
  const students = db.roster
    .filter((r) => r.active && r.className === cls && (r.groupName === group || r.groupName === null))
    .filter((r) => isSuggestibleStudentName(r.fullName))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "fr"))
    .slice(0, 1000)
    .map((r) => ({ id: r.id, fullName: r.fullName }));
  return Promise.resolve({ students });
}

export async function openLearnerSession(profile: StudentProfile) {
  const db = loadDB();
  const participant = db.participants.find((p) => p.id === profile.id);
  if (!participant) fail("Dossier introuvable. Identifie-toi à nouveau.", 404);
  return publicProfile(participant);
}

// ---------------------------------------------------------------------------
// Session access — everything is open by default in local mode; the teacher
// can still lock a séance from his space (stored on this device).
// ---------------------------------------------------------------------------

function allSessionAccess(db: LocalDB): SessionAccess[] {
  return Array.from({ length: 15 }, (_, i) => {
    const sessionId = i + 1;
    const stored = db.sessionAccess[String(sessionId)];
    return {
      sessionId,
      isUnlocked: stored ? stored.isUnlocked : true,
      updatedAt: stored ? stored.updatedAt : new Date(0).toISOString(),
    };
  });
}

export async function getSessionAccess() {
  return allSessionAccess(loadDB());
}

export async function teacherUpdateSessionAccess(sessionId: number, isUnlocked: boolean, token = teacherToken()) {
  void token;
  const db = loadDB();
  if (!Number.isInteger(sessionId) || sessionId < 1 || sessionId > 15 || typeof isUnlocked !== "boolean") {
    fail("Invalid session access update");
  }
  db.sessionAccess[String(sessionId)] = { isUnlocked, updatedAt: nowISO() };
  saveDB(db);
  return allSessionAccess(db);
}

// ---------------------------------------------------------------------------
// Attempts & learning state
// ---------------------------------------------------------------------------

export function submitCourseAttempt(payload: Record<string, unknown>) {
  const db = loadDB();
  const id = text(payload.id);
  if (id && db.submissions.some((s) => s.id === id)) return Promise.resolve({ saved: true as const });
  db.submissions.unshift({
    id: id || uuid(),
    participantId: text(payload.participantId),
    sessionId: Number(payload.sessionId),
    activityType: text(payload.activityType),
    activityId: text(payload.activityId),
    response: payload.answer ?? null,
    isCorrect: typeof payload.isCorrect === "boolean" ? payload.isCorrect : null,
    score: Number.isInteger(payload.score) ? Number(payload.score) : null,
    maxScore: Number.isInteger(payload.maxScore) ? Number(payload.maxScore) : null,
    createdAt: nowISO(),
  });
  saveDB(db);
  return Promise.resolve({ saved: true as const });
}

/** True when the student has passed this session's évaluation (score ≥ half the points). */
export function evaluationPassed(participantId: string, sessionId: number): boolean {
  try {
    const db = loadDB();
    // Séance 2 has NO visible QCM: its évaluation is the two practical stages
    // (assembler + dépanner). It is passed when BOTH stages are recorded with
    // at least half their points. (The former "quiz only" rule could never be
    // satisfied — the quiz block is hidden for séance 2 — which locked séance 3
    // forever; reported by students on 2026-11-10.)
    if (sessionId === 2) {
      const stages = new Map<string, LocalSubmission>();
      for (const s of db.submissions) {
        if (s.participantId !== participantId || s.sessionId !== 2 || s.activityType !== "practical_evaluation") continue;
        if (s.activityId === "s2-evaluation-assembler" || s.activityId === "s2-evaluation-depanner") stages.set(s.activityId, s);
      }
      const ok = (s?: LocalSubmission) => !!s && s.score !== null && s.maxScore !== null && s.maxScore > 0 && s.score * 2 >= s.maxScore;
      return ok(stages.get("s2-evaluation-assembler")) && ok(stages.get("s2-evaluation-depanner"));
    }
    return db.submissions.some((s) => {
      if (s.participantId !== participantId || s.sessionId !== sessionId) return false;
      const counts = s.activityType === "quiz" || s.activityType === "practical_evaluation";
      return counts && s.score !== null && s.maxScore !== null && s.maxScore > 0 && s.score * 2 >= s.maxScore;
    });
  } catch {
    return false;
  }
}

function snapshotOf(c: LocalCheckpoint): LearningSnapshot {
  return {
    version: 1,
    changedAt: c.changedAt,
    data: c.data,
    participantId: c.participantId,
    sessionId: c.sessionId,
    kind: c.kind as LearningSnapshot["kind"],
    revision: c.revision,
    dirty: false,
  } as LearningSnapshot;
}

export function loadLearningState(resumeToken: string) {
  const db = loadDB();
  const participant = participantByToken(db, resumeToken);
  const checkpoints = db.checkpoints.filter((c) => c.participantId === participant.id).map(snapshotOf);
  const progressMap = new Map<number, Set<string>>();
  for (const s of db.submissions) {
    if (s.participantId !== participant.id) continue;
    if (s.activityType !== "unit1_exercise") continue;
    const successful = s.isCorrect === true || (s.score !== null && s.maxScore !== null && s.maxScore > 0 && s.score >= s.maxScore);
    if (!successful) continue;
    if (!progressMap.has(s.sessionId)) progressMap.set(s.sessionId, new Set());
    progressMap.get(s.sessionId)!.add(s.activityId);
  }
  const progress = [...progressMap].map(([sessionId, ids]) => ({ sessionId, completedIds: [...ids] }));
  return Promise.resolve({ checkpoints, progress });
}

export function saveLearningState(resumeToken: string, checkpoint: LearningSnapshot, keepalive = false) {
  void keepalive;
  const db = loadDB();
  const participant = participantByToken(db, resumeToken);
  const kinds = new Set(["workshop", "quiz", "assessment", "view", "assembly", "repair"]);
  const s = checkpoint as unknown as Record<string, unknown>;
  if (
    !s ||
    s.participantId !== participant.id ||
    s.version !== 1 ||
    !Number.isInteger(s.sessionId) ||
    Number(s.sessionId) < 1 ||
    Number(s.sessionId) > 15 ||
    !kinds.has(String(s.kind)) ||
    !Number.isInteger(s.revision) ||
    Number(s.revision) < 0 ||
    !Number.isFinite(s.changedAt) ||
    Number(s.changedAt) < 1 ||
    !s.data ||
    Array.isArray(s.data) ||
    typeof s.data !== "object"
  ) {
    fail("Sauvegarde invalide.");
  }
  const sessionId = Number(s.sessionId);
  const kind = String(s.kind);
  const index = db.checkpoints.findIndex(
    (c) => c.participantId === participant.id && c.sessionId === sessionId && c.kind === kind,
  );
  const stored = index >= 0 ? db.checkpoints[index] : null;
  if (stored && stored.revision !== Number(s.revision)) {
    const error = new Error("Une sauvegarde plus récente existe.") as Error & { status?: number; data?: unknown };
    error.status = 409;
    error.data = { checkpoint: snapshotOf(stored) };
    throw error;
  }
  const entry: LocalCheckpoint = {
    participantId: participant.id,
    sessionId,
    kind,
    version: 1,
    changedAt: Number(s.changedAt),
    revision: Number(s.revision) + 1,
    data: s.data as Record<string, unknown>,
    workshopProgress: kind === "workshop" ? workshopEvidence(sessionId, s.data) : undefined,
    updatedAt: nowISO(),
  };
  if (index >= 0) db.checkpoints[index] = entry;
  else db.checkpoints.push(entry);
  saveDB(db);
  return Promise.resolve({ saved: true as const, revision: entry.revision });
}

// ---------------------------------------------------------------------------
// Workshop (ateliers) — drafts from checkpoints, attempts from submissions
// ---------------------------------------------------------------------------

function workshopDrafts(db: LocalDB, sessionId: number, participantIds?: string[]) {
  const projections = new Map<string, SavedWorkshopEvidence>();
  for (const c of db.checkpoints) {
    if (c.kind !== "workshop" || c.sessionId !== sessionId) continue;
    if (participantIds && !participantIds.includes(c.participantId)) continue;
    const evidence = c.workshopProgress ?? workshopEvidence(sessionId, c.data);
    for (const item of evidence) {
      const key = `${c.participantId}:${item.activityId}`;
      const previous = projections.get(key);
      projections.set(key, {
        activityId: item.activityId,
        percent: Math.max(previous?.percent ?? 0, item.percent),
        confirmed: !!previous?.confirmed || item.confirmed,
        participantId: c.participantId,
        updatedAt: previous && previous.updatedAt > c.updatedAt ? previous.updatedAt : c.updatedAt,
      });
    }
  }
  return [...projections.values()];
}

export function learnerWorkshop(resumeToken: string, sessionId: number) {
  const db = loadDB();
  const participant = participantByToken(db, resumeToken);
  if (!Number.isInteger(sessionId) || sessionId < 1 || sessionId > 15) fail("Séance invalide.");
  const drafts = workshopDrafts(db, sessionId, [participant.id]).map(({ activityId, percent, confirmed }) => ({
    activityId,
    percent,
    confirmed,
  }));
  const definitions = new Map(workshopExercises(sessionId, true).map((item) => [item.id, item]));
  const attempts: WorkshopAttempt[] = [];
  for (const s of db.submissions) {
    if (s.participantId !== participant.id || s.sessionId !== sessionId) continue;
    if (!["unit1_exercise", "photo_challenge", "workshop"].includes(s.activityType)) continue;
    const definition = definitions.get(s.activityId);
    if (!definition || definition.type !== s.activityType) continue;
    attempts.push({ id: s.id, activityId: s.activityId, isCorrect: s.isCorrect, score: s.score, maxScore: s.maxScore });
  }
  return Promise.resolve({ attempts, drafts, truncated: false });
}

export function teacherWorkshop(sessionId: number, token = teacherToken()) {
  void token;
  const db = loadDB();
  if (!Number.isInteger(sessionId) || sessionId < 1 || sessionId > 15) fail("Séance invalide.");
  return Promise.resolve({ drafts: workshopDrafts(db, sessionId), truncated: false });
}

// ---------------------------------------------------------------------------
// Teacher space (local data only)
// ---------------------------------------------------------------------------

export async function teacherLogin(password: string) {
  if (password !== TEACHER_PASSWORD) fail("Mot de passe incorrect.", 401);
  const token = uuid();
  window.localStorage.setItem(teacherSessionKey, token);
  return token;
}

export function teacherToken() {
  return typeof window === "undefined" ? "" : window.localStorage.getItem(teacherSessionKey) || "";
}

export function teacherLogout() {
  if (typeof window !== "undefined") window.localStorage.removeItem(teacherSessionKey);
}

export function teacherCourseAccess(token = teacherToken()) {
  void token;
  return Promise.resolve({
    role: "teacher" as const,
    sessionIds: Array.from({ length: 15 }, (_, i) => i + 1),
    expiresAt: new Date(Date.now() + 30 * 86400_000).toISOString(),
  });
}

function completedSessions(db: LocalDB) {
  const progress = new Map<string, number>();
  const seen = new Set<string>();
  for (const row of db.submissions) {
    if (row.activityType !== "session_completion") continue;
    const key = `${row.participantId}:${row.activityId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (row.isCorrect) progress.set(row.participantId, (progress.get(row.participantId) || 0) + 1);
  }
  return progress;
}

function attemptView(row: LocalSubmission, participant: LocalParticipant, progress: Map<string, number>) {
  return {
    id: row.id,
    participantId: row.participantId,
    studentOne: participant.studentOne,
    studentTwo: participant.studentTwo,
    className: participant.className,
    groupName: participant.groupName,
    isPair: participant.isPair,
    sessionId: row.sessionId,
    activityType: row.activityType,
    activityId: row.activityId,
    evaluationStage:
      row.activityId === "s2-evaluation-assembler"
        ? "assembly"
        : row.activityId === "s2-evaluation-depanner"
          ? "repair"
          : row.activityId === "session-2-quiz"
            ? "quiz"
            : null,
    responseJson: JSON.stringify(row.response),
    isCorrect: row.isCorrect,
    score: row.score,
    maxScore: row.maxScore,
    createdAt: row.createdAt,
    completedSessions: progress.get(row.participantId) || 0,
  };
}

function readFilters(value: ProfessorFilters) {
  const raw = (value && typeof value === "object" ? value : {}) as unknown as Record<string, unknown>;
  const requestedClass = text(raw.className);
  const requestedGroup = text(raw.groupName);
  const requestedSession = Number(raw.sessionId);
  return {
    className: /^(2\/[1-5]|3\/[1-4])$/.test(requestedClass) ? requestedClass : "",
    groupName: requestedGroup === "1" || requestedGroup === "2" ? requestedGroup : "",
    sessionId: Number.isInteger(requestedSession) && requestedSession >= 1 && requestedSession <= 15 ? requestedSession : null,
    search: text(raw.search).toLocaleLowerCase("fr"),
  };
}

function teacherData(db: LocalDB, filtersValue: ProfessorFilters) {
  const filters = readFilters(filtersValue);
  const filteredParticipants = db.participants.filter((participant) => {
    if (filters.className && participant.className !== filters.className) return false;
    if (filters.groupName && participant.groupName !== filters.groupName) return false;
    if (filters.search) {
      const names = `${participant.studentOne} ${participant.studentTwo || ""}`.toLocaleLowerCase("fr");
      if (!names.includes(filters.search)) return false;
    }
    return true;
  });
  const participantIds = new Set(filteredParticipants.map((p) => p.id));
  const participantMap = new Map(db.participants.map((p) => [p.id, p]));
  const filteredSubmissions = db.submissions.filter(
    (s) => participantIds.has(s.participantId) && (filters.sessionId === null || s.sessionId === filters.sessionId),
  );
  const progress = completedSessions(db);
  return { filteredParticipants, filteredSubmissions, participantMap, progress };
}

export function teacherDashboard<T>(filters: ProfessorFilters, page: number, token = teacherToken()) {
  void token;
  const db = loadDB();
  const { filteredParticipants, filteredSubmissions, participantMap, progress } = teacherData(db, filters);
  const pageSize = 50;
  const safePage = Number.isInteger(page) && page >= 1 ? page : 1;
  const offset = (safePage - 1) * pageSize;
  const attempts = filteredSubmissions
    .slice(offset, offset + pageSize)
    .flatMap((row) => {
      const participant = participantMap.get(row.participantId);
      return participant ? [attemptView(row, participant, progress)] : [];
    });
  const learners = filteredParticipants
    .map((participant) => {
      const own = db.submissions.filter((s) => s.participantId === participant.id);
      const gradedAttempts = own.filter((s) => s.isCorrect !== null || s.score !== null);
      const correctAttempts = own.filter((s) => s.isCorrect === true).length;
      const successRate = gradedAttempts.length ? Math.round((correctAttempts / gradedAttempts.length) * 100) : null;
      const scorePercentages = own
        .filter((s) => s.score !== null && s.maxScore !== null && s.maxScore > 0)
        .map((s) => Math.round(((s.score as number) / (s.maxScore as number)) * 100));
      return {
        ...publicProfile(participant),
        createdAt: participant.createdAt,
        totalAttempts: own.length,
        gradedAttempts: gradedAttempts.length,
        correctAttempts,
        successRate,
        gradeOutOf20: successRate === null ? null : Math.round((successRate / 5) * 10) / 10,
        averageScore: scorePercentages.length ? Math.round(scorePercentages.reduce((a, b) => a + b, 0) / scorePercentages.length) : null,
        bestScore: scorePercentages.length ? Math.max(...scorePercentages) : null,
        completedSessions: progress.get(participant.id) || 0,
        lastAttemptAt: own[0]?.createdAt || null,
      };
    })
    .sort((a, b) => String(b.lastAttemptAt || "").localeCompare(String(a.lastAttemptAt || "")));
  const graded = filteredSubmissions.filter((s) => s.isCorrect !== null);
  const correct = filteredSubmissions.filter((s) => s.isCorrect === true).length;
  const scoreSum = filteredSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const maxScoreSum = filteredSubmissions.reduce((sum, s) => sum + (s.maxScore || 0), 0);
  const result = {
    sessionAccess: allSessionAccess(db),
    stats: {
      totalParticipants: filteredParticipants.length,
      totalAttempts: filteredSubmissions.length,
      correctRate: graded.length > 0 ? Math.round((correct / graded.length) * 100) : 0,
      averageScore: maxScoreSum > 0 ? Math.round((scoreSum / maxScoreSum) * 100) : 0,
    },
    attempts,
    learners,
    pagination: {
      page: safePage,
      pageSize,
      totalItems: filteredSubmissions.length,
      totalPages: Math.max(1, Math.ceil(filteredSubmissions.length / pageSize)),
    },
  };
  return Promise.resolve(result as unknown as T);
}

export function teacherExport<T>(filters: ProfessorFilters, token = teacherToken()) {
  void token;
  const db = loadDB();
  const { filteredSubmissions, participantMap, progress } = teacherData(db, filters);
  const rows = filteredSubmissions.slice(0, 25000).flatMap((row) => {
    const participant = participantMap.get(row.participantId);
    return participant ? [attemptView(row, participant, progress)] : [];
  });
  return Promise.resolve({ rows, truncated: filteredSubmissions.length > 25000 } as unknown as T);
}

export function teacherLearnerReport<T>(participantId: string, token = teacherToken()) {
  void token;
  const db = loadDB();
  const participant = db.participants.find((p) => p.id === participantId);
  if (!participant) fail("Élève introuvable.", 404);
  const progress = completedSessions(db);
  const own = db.submissions.filter((s) => s.participantId === participantId);
  const result = {
    participant: publicProfile(participant),
    attempts: own.slice(0, 25000).map((row) => attemptView(row, participant, progress)),
    truncated: own.length > 25000,
  };
  return Promise.resolve(result as unknown as T);
}

export function teacherDeleteAllData(token = teacherToken()) {
  void token;
  const db = loadDB();
  db.submissions = [];
  db.participants = [];
  db.checkpoints = [];
  saveDB(db);
  return Promise.resolve({ deleted: true as const });
}

export function teacherDeleteLearner(participantId: string, token = teacherToken()) {
  void token;
  const db = loadDB();
  db.participants = db.participants.filter((p) => p.id !== participantId);
  db.submissions = db.submissions.filter((s) => s.participantId !== participantId);
  db.checkpoints = db.checkpoints.filter((c) => c.participantId !== participantId);
  saveDB(db);
  return Promise.resolve({ deleted: true as const });
}

export function teacherLearningAnalytics(token = teacherToken()) {
  void token;
  const db = loadDB();
  const activitiesMap = new Map<string, ActivityProgress & { firstSuccessSet: boolean }>();
  for (const s of [...db.submissions].reverse()) {
    const key = `${s.participantId}|${s.sessionId}|${s.activityId}`;
    let entry = activitiesMap.get(key);
    if (!entry) {
      entry = {
        participantId: s.participantId,
        sessionId: s.sessionId,
        activityId: s.activityId,
        activityType: s.activityType,
        attempts: 0,
        graded: 0,
        correct: 0,
        successful: false,
        firstSuccessAt: null,
        lastAt: s.createdAt,
        bestScore: null,
        maxScore: s.maxScore,
        sections: null,
        firstSuccessSet: false,
      };
      activitiesMap.set(key, entry);
    }
    entry.attempts += 1;
    entry.lastAt = s.createdAt > entry.lastAt ? s.createdAt : entry.lastAt;
    if (s.isCorrect !== null || s.score !== null) entry.graded += 1;
    if (s.isCorrect === true) entry.correct += 1;
    const fullScore = s.score !== null && s.maxScore !== null && s.maxScore > 0 && s.score >= s.maxScore;
    if (s.isCorrect === true || fullScore) {
      entry.successful = true;
      if (!entry.firstSuccessSet) {
        entry.firstSuccessAt = s.createdAt;
        entry.firstSuccessSet = true;
      }
    }
    if (s.score !== null) entry.bestScore = entry.bestScore === null ? s.score : Math.max(entry.bestScore, s.score);
    if (s.maxScore !== null) entry.maxScore = s.maxScore;
    const response = s.response as Record<string, unknown> | null;
    if (response && Array.isArray(response.sections) && response.sections.every((v) => typeof v === "number")) {
      entry.sections = response.sections as number[];
    }
  }
  const activities: ActivityProgress[] = [...activitiesMap.values()].map(({ firstSuccessSet, ...rest }) => {
    void firstSuccessSet;
    return rest;
  });
  const result: LearningAnalytics = {
    students: db.roster.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      className: r.className,
      groupName: r.groupName,
      massarCode: r.massarCode ?? null,
      source: r.source,
      active: r.active,
    })),
    participants: db.participants.map((p) => ({ ...publicProfile(p), createdAt: p.createdAt })),
    activities,
    sessionAccess: allSessionAccess(db),
    generatedAt: nowISO(),
    truncated: false,
  };
  return Promise.resolve(result);
}

// ---------------------------------------------------------------------------
// Roster management (teacher)
// ---------------------------------------------------------------------------

function validateRosterRow(row: Partial<RosterStudent> & { fullName: string; className: string }, existingId?: string): LocalRoster {
  const fullName = text(row.fullName);
  const cls = text(row.className);
  const group = row.groupName ? text(row.groupName) : null;
  const massar = row.massarCode ? text(row.massarCode).toUpperCase() : null;
  if (
    fullName.length < 2 ||
    fullName.length > 100 ||
    !/^(2\/[1-5]|3\/[1-4])$/.test(cls) ||
    (group !== null && !["1", "2"].includes(group)) ||
    (massar !== null && !/^[A-Z0-9]{5,20}$/.test(massar))
  ) {
    fail("Liste invalide : vérifie le nom, la classe, le groupe et le code Massar.");
  }
  return {
    id: existingId || (typeof row.id === "string" && row.id ? row.id : uuid()),
    fullName,
    className: cls,
    groupName: group,
    massarCode: massar,
    source: row.source === "manual" ? "manual" : "import",
    active: row.active !== false,
    nameNormalized: normal(fullName),
    registrationKey: null,
  };
}

export function teacherImportRoster(
  students: Array<Partial<RosterStudent> & { fullName: string; className: string }>,
  token = teacherToken(),
) {
  void token;
  if (!Array.isArray(students) || !students.length || students.length > 1000) {
    fail("Importe entre 1 et 1 000 élèves à la fois.");
  }
  const db = loadDB();
  const rows = students.map((s) => validateRosterRow(s));
  for (const row of rows) {
    if (row.massarCode) {
      const byMassar = db.roster.find((r) => r.massarCode === row.massarCode);
      if (byMassar) row.id = byMassar.id;
    }
    const index = db.roster.findIndex((r) => r.id === row.id);
    if (index >= 0) db.roster[index] = { ...row, registrationKey: db.roster[index].registrationKey };
    else db.roster.push(row);
  }
  saveDB(db);
  return Promise.resolve({ saved: rows.length });
}

export function teacherUpdateRoster(id: string, changes: Partial<RosterStudent>, token = teacherToken()) {
  void token;
  const db = loadDB();
  const index = db.roster.findIndex((r) => r.id === id);
  if (index < 0) fail("Élève introuvable.", 404);
  const current = db.roster[index];
  const next = validateRosterRow(
    {
      id: current.id,
      fullName: changes.fullName ?? current.fullName,
      className: changes.className ?? current.className,
      groupName: changes.groupName !== undefined ? changes.groupName : current.groupName,
      massarCode: changes.massarCode !== undefined ? changes.massarCode : current.massarCode,
      active: changes.active !== undefined ? changes.active : current.active,
      source: changes.source ?? current.source,
    },
    current.id,
  );
  next.source = ["manual", "import"].includes(String(changes.source)) ? (changes.source as RosterStudent["source"]) : current.source;
  next.registrationKey =
    next.fullName === current.fullName && next.className === current.className && next.groupName === current.groupName
      ? current.registrationKey
      : null;
  db.roster[index] = next;
  saveDB(db);
  return Promise.resolve({ saved: true as const });
}

export function teacherSetRosterActive(ids: string[], active: boolean, token = teacherToken()) {
  void token;
  if (!Array.isArray(ids) || !ids.length || ids.length > 1000 || typeof active !== "boolean") {
    fail("Sélection invalide : choisis entre 1 et 1 000 comptes.");
  }
  const db = loadDB();
  const unique = [...new Set(ids)];
  let updated = 0;
  for (const row of db.roster) {
    if (unique.includes(row.id)) {
      row.active = active;
      updated += 1;
    }
  }
  saveDB(db);
  return Promise.resolve({ updated, ids: unique, active });
}
