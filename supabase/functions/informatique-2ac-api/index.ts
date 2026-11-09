import { createLearningService } from "./learning-service.ts";
import { validSession3Evaluation } from "./session3-evaluation.ts";
import { session4LabEvaluationId, session4QuizEvaluationId, validSession4Evaluation } from "./session4-evaluation.ts";
import { session4AppliedEvaluationId, validSession4AppliedEvaluation } from "./session4-applied-evaluation.ts";

const allowedOrigins = new Set([
  "https://tabdellah.github.io",
  "https://lab-2ac-v3-test.tahtoh-abdellah.chatgpt.site",
  "https://lab-2ac-seance2-atelier.tahtoh-abdellah.chatgpt.site",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

const activityTypes = new Set([
  "unit1_exercise",
  "quiz",
  "practical_evaluation",
  "photo_challenge",
  "workshop",
  "session_completion",
]);

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const pageSize = 50;

type TeacherConfig = {
  password_hash: string;
  session_secret: string;
};

type ParticipantRow = {
  id: string;
  student_one: string;
  student_two: string | null;
  class_name: string;
  group_name: string;
  is_pair: boolean;
  created_at: string;
};

type SubmissionRow = {
  id: string;
  participant_id: string;
  session_id: number;
  activity_type: string;
  activity_id: string;
  response: unknown;
  is_correct: boolean | null;
  score: number | null;
  max_score: number | null;
  created_at: string;
};

type Filters = {
  className: string;
  groupName: string;
  sessionId: number | null;
  search: string;
};

type SessionAccessRow = {
  session_id: number;
  is_unlocked: boolean;
  updated_at: string;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function validPracticalEvaluation(
  activityType: string,
  sessionId: number,
  activityId: string,
  answer: unknown,
  isCorrect: boolean | null,
  score: number | null,
  maxScore: number | null,
) {
  if (activityType !== "practical_evaluation") return true;
  if (sessionId === 4 && activityId === session4AppliedEvaluationId) {
    return validSession4AppliedEvaluation(answer, isCorrect, score, maxScore);
  }
  if (sessionId === 4 && (activityId === session4QuizEvaluationId || activityId === session4LabEvaluationId)) {
    return isRecord(answer) && answer.format === activityId && validSession4Evaluation(answer, isCorrect, score, maxScore);
  }
  if (sessionId === 3 && activityId === "session-3-bilan-situations-v5") {
    return validSession3Evaluation(answer, isCorrect, score, maxScore);
  }
  if (sessionId !== 2 || isCorrect !== true || !isRecord(answer) || answer.completed !== true) return false;

  const errors = Number(answer.errors);
  if (!Number.isInteger(errors) || errors < 0 || errors > 1000) return false;

  if (activityId === "s2-evaluation-assembler") {
    return answer.total === 23
      && Array.isArray(answer.placements)
      && answer.placements.length === 23
      && score === 23
      && maxScore === 23;
  }

  if (activityId === "s2-evaluation-depanner") {
    return Array.isArray(answer.cases)
      && answer.cases.length === 6
      && answer.score === 12
      && answer.maxScore === 12
      && score === 12
      && maxScore === 12;
  }

  return false;
}

function same(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function base64url(value: Uint8Array) {
  return btoa(String.fromCharCode(...value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

function cors(origin: string | null) {
  const allowed = Boolean(
    origin &&
      (allowedOrigins.has(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")),
  );
  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : "https://tabdellah.github.io",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function database(path: string, init: RequestInit = {}) {
  const url = Deno.env.get("SUPABASE_URL");
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !secret) throw new Error("Supabase environment is unavailable");

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Database request failed (${response.status}): ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

async function databaseRows<T>(path: string, maximum: number) {
  const rows: T[] = [];
  const batchSize = 1000;
  while (rows.length < maximum) {
    const end = Math.min(rows.length + batchSize, maximum) - 1;
    const batch = (await database(path, { headers: { Range: `${rows.length}-${end}` } })) as T[];
    rows.push(...batch);
    if (batch.length < batchSize) break;
  }
  return rows;
}

let cachedConfig: TeacherConfig | null = null;
async function teacherConfig() {
  if (cachedConfig) return cachedConfig;
  const rows = (await database(
    "course_2ac_teacher_config?select=password_hash,session_secret&config_key=eq.default&limit=1",
  )) as TeacherConfig[];
  if (!rows[0]) throw new Error("Teacher configuration is missing");
  cachedConfig = rows[0];
  return cachedConfig;
}

async function createSession() {
  const config = await teacherConfig();
  const payload = base64url(
    encoder.encode(JSON.stringify({ role: "teacher", exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60 })),
  );
  return `${payload}.${await sign(payload, config.session_secret)}`;
}

async function validSession(token: unknown) {
  if (typeof token !== "string" || token.length > 1000) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  const config = await teacherConfig();
  if (!same(signature, await sign(payload, config.session_secret))) return false;
  try {
    const decoded = JSON.parse(decoder.decode(fromBase64url(payload))) as { role?: string; exp?: number };
    return decoded.role === "teacher" && Number(decoded.exp) > Date.now() / 1000;
  } catch {
    return false;
  }
}

function publicParticipant(row: ParticipantRow) {
  return {
    id: row.id,
    studentOne: row.student_one,
    studentTwo: row.student_two,
    className: row.class_name,
    groupName: row.group_name,
    isPair: row.is_pair,
  };
}

function readFilters(value: unknown): Filters {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const requestedClass = cleanText(raw.className, 10);
  const requestedGroup = cleanText(raw.groupName, 5);
  const requestedSession = Number(raw.sessionId);
  return {
    className: /^2\/[1-9]$/.test(requestedClass) ? requestedClass : "",
    groupName: requestedGroup === "1" || requestedGroup === "2" ? requestedGroup : "",
    sessionId:
      Number.isInteger(requestedSession) && requestedSession >= 1 && requestedSession <= 15
        ? requestedSession
        : null,
    search: cleanText(raw.search, 80).toLocaleLowerCase("fr"),
  };
}

function completedSessions(submissions: SubmissionRow[]) {
  const progress = new Map<string, number>();
  const seen = new Set<string>();
  for (const row of submissions) {
    if (row.activity_type !== "session_completion") continue;
    const key = `${row.participant_id}:${row.activity_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (row.is_correct) progress.set(row.participant_id, (progress.get(row.participant_id) || 0) + 1);
  }
  return progress;
}

function attemptView(row: SubmissionRow, participant: ParticipantRow, progress: Map<string, number>) {
  return {
    id: row.id,
    participantId: row.participant_id,
    studentOne: participant.student_one,
    studentTwo: participant.student_two,
    className: participant.class_name,
    groupName: participant.group_name,
    isPair: participant.is_pair,
    sessionId: row.session_id,
    activityType: row.activity_type,
    activityId: row.activity_id,
    evaluationStage: row.activity_id === "s2-evaluation-assembler"
      ? "assembly"
      : row.activity_id === "s2-evaluation-depanner"
        ? "repair"
        : row.activity_id === "session-2-quiz"
          ? "quiz"
          : null,
    responseJson: JSON.stringify(row.response),
    isCorrect: row.is_correct,
    score: row.score,
    maxScore: row.max_score,
    createdAt: row.created_at,
    completedSessions: progress.get(row.participant_id) || 0,
  };
}

async function teacherData(filtersValue: unknown) {
  const filters = readFilters(filtersValue);
  const [participants, submissions] = await Promise.all([
    databaseRows<ParticipantRow>(
      "course_2ac_participants?select=id,student_one,student_two,class_name,group_name,is_pair,created_at&order=created_at.desc",
      10000,
    ),
    databaseRows<SubmissionRow>(
      "course_2ac_submissions?select=id,participant_id,session_id,activity_type,activity_id,response,is_correct,score,max_score,created_at&order=created_at.desc",
      25001,
    ),
  ]);

  const filteredParticipants = participants.filter((participant) => {
    if (filters.className && participant.class_name !== filters.className) return false;
    if (filters.groupName && participant.group_name !== filters.groupName) return false;
    if (filters.search) {
      const names = `${participant.student_one} ${participant.student_two || ""}`.toLocaleLowerCase("fr");
      if (!names.includes(filters.search)) return false;
    }
    return true;
  });
  const participantIds = new Set(filteredParticipants.map((participant) => participant.id));
  const participantMap = new Map(participants.map((participant) => [participant.id, participant]));
  const filteredSubmissions = submissions.filter(
    (submission) =>
      participantIds.has(submission.participant_id) &&
      (filters.sessionId === null || submission.session_id === filters.sessionId),
  );
  const progress = completedSessions(submissions);
  return { filteredParticipants, filteredSubmissions, participantMap, progress, submissions };
}

async function dashboard(filtersValue: unknown, pageValue: unknown) {
  const { filteredParticipants, filteredSubmissions, participantMap, progress, submissions } =
    await teacherData(filtersValue);
  const requestedPage = Number(pageValue);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 10000) : 1;
  const offset = (page - 1) * pageSize;
  const graded = filteredSubmissions.filter((row) => row.is_correct !== null);
  const correct = graded.filter((row) => row.is_correct).length;
  const scored = filteredSubmissions.filter((row) => row.score !== null && row.max_score !== null);
  const scoreSum = scored.reduce((total, row) => total + Number(row.score), 0);
  const maxScoreSum = scored.reduce((total, row) => total + Number(row.max_score), 0);

  const attempts = filteredSubmissions
    .slice(offset, offset + pageSize)
    .flatMap((row) => {
      const participant = participantMap.get(row.participant_id);
      return participant ? [attemptView(row, participant, progress)] : [];
    });

  const learners = filteredParticipants
    .map((participant) => {
      const participantSubmissions = submissions.filter((row) => row.participant_id === participant.id);
      const gradedAttempts = participantSubmissions.filter((row) => row.is_correct !== null);
      const correctAttempts = gradedAttempts.filter((row) => row.is_correct).length;
      const successRate = gradedAttempts.length > 0
        ? Math.round((correctAttempts / gradedAttempts.length) * 100)
        : null;
      const scoredAttempts = participantSubmissions.filter(
        (row) => row.score !== null && row.max_score !== null && row.max_score > 0,
      );
      const scorePercentages = scoredAttempts.map(
        (row) => Math.round((Number(row.score) / Number(row.max_score)) * 100),
      );
      return {
        ...publicParticipant(participant),
        createdAt: participant.created_at,
        totalAttempts: participantSubmissions.length,
        gradedAttempts: gradedAttempts.length,
        correctAttempts,
        successRate,
        gradeOutOf20: successRate === null ? null : Math.round((successRate / 5) * 10) / 10,
        averageScore: scorePercentages.length > 0
          ? Math.round(scorePercentages.reduce((total, value) => total + value, 0) / scorePercentages.length)
          : null,
        bestScore: scorePercentages.length > 0 ? Math.max(...scorePercentages) : null,
        completedSessions: progress.get(participant.id) || 0,
        lastAttemptAt: participantSubmissions[0]?.created_at || null,
      };
    })
    .sort((left, right) => {
      const leftTime = left.lastAttemptAt ? Date.parse(left.lastAttemptAt) : 0;
      const rightTime = right.lastAttemptAt ? Date.parse(right.lastAttemptAt) : 0;
      if (rightTime !== leftTime) return rightTime - leftTime;
      return `${left.studentOne} ${left.studentTwo || ""}`.localeCompare(
        `${right.studentOne} ${right.studentTwo || ""}`,
        "fr",
        { sensitivity: "base" },
      );
    })
    .slice(0, 500);

  return {
    sessionAccess: await sessionAccess(),
    stats: {
      totalParticipants: filteredParticipants.length,
      totalAttempts: filteredSubmissions.length,
      correctRate: graded.length > 0 ? Math.round((correct / graded.length) * 100) : 0,
      averageScore: maxScoreSum > 0 ? Math.round((scoreSum / maxScoreSum) * 100) : 0,
    },
    attempts,
    learners,
    pagination: {
      page,
      pageSize,
      totalItems: filteredSubmissions.length,
      totalPages: Math.max(1, Math.ceil(filteredSubmissions.length / pageSize)),
    },
  };
}

async function exportRows(filtersValue: unknown) {
  const { filteredSubmissions, participantMap, progress } = await teacherData(filtersValue);
  return {
    rows: filteredSubmissions.slice(0, 25000).flatMap((row) => {
      const participant = participantMap.get(row.participant_id);
      return participant ? [attemptView(row, participant, progress)] : [];
    }),
    truncated: filteredSubmissions.length > 25000,
  };
}

async function learnerReport(participantIdValue: unknown) {
  const participantId = cleanText(participantIdValue, 50);
  if (!/^[0-9a-f-]{36}$/i.test(participantId)) throw new Error("Invalid participant id");
  const [participants, submissions] = await Promise.all([
    databaseRows<ParticipantRow>(
      `course_2ac_participants?select=id,student_one,student_two,class_name,group_name,is_pair,created_at&id=eq.${encodeURIComponent(participantId)}&limit=1`,
      1,
    ),
    databaseRows<SubmissionRow>(
      `course_2ac_submissions?select=id,participant_id,session_id,activity_type,activity_id,response,is_correct,score,max_score,created_at&participant_id=eq.${encodeURIComponent(participantId)}&order=created_at.desc`,
      25001,
    ),
  ]);
  const participant = participants[0];
  if (!participant) return null;
  const progress = completedSessions(submissions);
  return {
    participant: publicParticipant(participant),
    attempts: submissions.slice(0, 25000).map((row) => attemptView(row, participant, progress)),
    truncated: submissions.length > 25000,
  };
}

async function deleteAllStudentData() {
  await database("course_2ac_submissions?id=not.is.null", { method: "DELETE" });
  await database("course_2ac_participants?id=not.is.null", { method: "DELETE" });
  return { deleted: true };
}

async function deleteLearner(participantIdValue: unknown) {
  const participantId = cleanText(participantIdValue, 50);
  if (!/^[0-9a-f-]{36}$/i.test(participantId)) throw new Error("Invalid participant id");
  const participants = (await database(
    `course_2ac_participants?select=id&id=eq.${encodeURIComponent(participantId)}&limit=1`,
  )) as Array<{ id: string }>;
  if (!participants[0]) return null;
  // La clé étrangère ON DELETE CASCADE supprime automatiquement toutes les tentatives associées.
  await database(`course_2ac_participants?id=eq.${encodeURIComponent(participantId)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  return { deleted: true };
}

async function sessionAccess() {
  const rows = (await database(
    "course_2ac_session_access?select=session_id,is_unlocked,updated_at&order=session_id.asc",
  )) as SessionAccessRow[];
  return rows.map((row) => ({
    sessionId: row.session_id,
    isUnlocked: row.is_unlocked,
    updatedAt: row.updated_at,
  }));
}

async function sessionIsUnlocked(sessionId: number) {
  const rows = (await database(
    `course_2ac_session_access?select=is_unlocked&session_id=eq.${sessionId}&limit=1`,
  )) as Array<{ is_unlocked: boolean }>;
  return rows[0]?.is_unlocked === true;
}

async function updateSessionAccess(sessionIdValue: unknown, unlockedValue: unknown) {
  const sessionId = Number(sessionIdValue);
  if (!Number.isInteger(sessionId) || sessionId < 1 || sessionId > 15 || typeof unlockedValue !== "boolean") {
    throw new Error("Invalid session access update");
  }
  await database(`course_2ac_session_access?session_id=eq.${sessionId}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ is_unlocked: unlockedValue, updated_at: new Date().toISOString() }),
  });
  return sessionAccess();
}

const learningService = createLearningService({database,secret:async()=>(await teacherConfig()).session_secret});

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  const headers = cors(origin);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return json({ error: "Méthode refusée." }, 405, headers);

  const originAllowed =
    !origin ||
    allowedOrigins.has(origin) ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:");
  if (!originAllowed) return json({ error: "Origine refusée." }, 403, headers);

  try {
    const rawBody = await request.text();
    if (encoder.encode(rawBody).length > 600000) return json({error:"Requête trop volumineuse."},413,headers);
    const body = JSON.parse(rawBody) as Record<string, unknown>;
    if (!isRecord(body)) return json({error:"Requête invalide."},400,headers);

    if (body.action === "login") {
      const password = typeof body.password === "string" ? body.password : "";
      const config = await teacherConfig();
      if (!password || password.length > 200 || !same(await sha256(password), config.password_hash)) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        return json({ error: "Mot de passe incorrect." }, 401, headers);
      }
      return json({ token: await createSession(), expiresIn: 28800 }, 200, headers);
    }

    const learningResult = await learningService.publicAction(body);
    if (learningResult) return json(learningResult.body, learningResult.status, headers);

    if (body.action === "session_access") {
      return json({ sessions: await sessionAccess() }, 200, headers);
    }

    if (body.action === "submit") {
      const id = cleanText(body.id, 100);
      const participantId = cleanText(body.participantId, 50);
      const activityType = cleanText(body.activityType, 40);
      const activityId = cleanText(body.activityId, 120);
      const sessionId = Number(body.sessionId);
      const responseText = JSON.stringify(body.answer ?? null);
      const score = Number.isInteger(body.score) ? Number(body.score) : null;
      const maxScore = Number.isInteger(body.maxScore) ? Number(body.maxScore) : null;
      const isCorrect = typeof body.isCorrect === "boolean" ? body.isCorrect : null;
      if (
        id.length < 8 ||
        !/^[0-9a-f-]{36}$/i.test(participantId) ||
        !activityTypes.has(activityType) ||
        !activityId ||
        !Number.isInteger(sessionId) ||
        sessionId < 1 ||
        sessionId > 15 ||
        encoder.encode(responseText).length > 12000 ||
        ((score === null) !== (maxScore === null)) ||
        (score !== null && (score < 0 || score > 1000 || maxScore === null || maxScore < 1 || maxScore > 1000 || score > maxScore)) ||
        !validPracticalEvaluation(activityType, sessionId, activityId, body.answer, isCorrect, score, maxScore)
      ) {
        return json({ error: "Tentative invalide." }, 400, headers);
      }
      if (!(await sessionIsUnlocked(sessionId))) {
        return json({ error: "Cette séance est verrouillée par le professeur. / هذه الحصة مقفلة من طرف الأستاذ." }, 423, headers);
      }
      const participant = (await database(
        `course_2ac_participants?select=id&id=eq.${encodeURIComponent(participantId)}&limit=1`,
      )) as Array<{ id: string }>;
      if (!participant[0]) return json({ error: "Élève introuvable. Recommencez l’identification." }, 404, headers);
      await database("course_2ac_submissions?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
        body: JSON.stringify({
          id,
          participant_id: participantId,
          session_id: sessionId,
          activity_type: activityType,
          activity_id: activityId,
          response: body.answer ?? null,
          is_correct: isCorrect,
          score,
          max_score: maxScore,
        }),
      });
      return json({ saved: true }, 201, headers);
    }

    if (!(await validSession(body.token))) return json({ error: "Session expirée." }, 401, headers);
    if (body.action === "teacher_course") {
      // A private demonstration grant, never a change to student session access.
      const payload = JSON.parse(decoder.decode(fromBase64url(String(body.token).split(".")[0]))) as { exp: number };
      return json({ role: "teacher", sessionIds: Array.from({ length: 15 }, (_, i) => i + 1), expiresAt: new Date(payload.exp * 1000).toISOString() }, 200, headers);
    }
    const learningAdmin = await learningService.adminAction(body);
    if (learningAdmin) return json(learningAdmin, 200, headers);
    if (body.action === "dashboard") return json(await dashboard(body.filters, body.page), 200, headers);
    if (body.action === "export") return json(await exportRows(body.filters), 200, headers);
    if (body.action === "learner_report") {
      const report = await learnerReport(body.participantId);
      return report ? json(report, 200, headers) : json({ error: "Élève introuvable." }, 404, headers);
    }
    if (body.action === "update_session_access") {
      return json({ sessions: await updateSessionAccess(body.sessionId, body.isUnlocked) }, 200, headers);
    }
    if (body.action === "delete_all_data") {
      if (body.confirmation !== "EFFACER") return json({ error: "Confirmation invalide." }, 400, headers);
      return json(await deleteAllStudentData(), 200, headers);
    }
    if (body.action === "delete_learner") {
      if (body.confirmation !== "SUPPRIMER") return json({ error: "Confirmation invalide." }, 400, headers);
      const result = await deleteLearner(body.participantId);
      return result ? json(result, 200, headers) : json({ error: "Élève introuvable." }, 404, headers);
    }
    return json({ error: "Action inconnue." }, 400, headers);
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && Number(error.status)>=400 && Number(error.status)<500) return json({error:error instanceof Error?error.message:"Requête invalide."},Number(error.status),headers);
    console.error("informatique_2ac_api_error", error);
    return json(
      { error: "Service momentanément indisponible. / الخدمة غير متاحة مؤقتا." },
      500,
      headers,
    );
  }
});
