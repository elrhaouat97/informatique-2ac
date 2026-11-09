import type { SavedWorkshopEvidence, WorkshopAttempt, WorkshopEvidence } from "./workshop-progress";

const endpoint = process.env.NEXT_PUBLIC_COURSE_API_ENDPOINT
  || "https://xrwtcyliibooudyoovqo.supabase.co/functions/v1/informatique-2ac-api";
const publishableKey = "sb_publishable_3eVvxtKaHPzZfI4nSMrU-A_iPHGJUWt";
const teacherSessionKey = "lab2ac-teacher-session";

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

async function call<T>(body: Record<string, unknown>, keepalive = false): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), (["learning_session", "learning_state", "save_learning_state", "roster_suggestions"].includes(String(body.action)) ? 8_000 : 20_000));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: publishableKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      keepalive,
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      const error = new Error(data.error || "Service momentanément indisponible.") as Error & { status?: number; data?:unknown };
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Le service met trop de temps à répondre. Réessayez.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function registerParticipant(payload: Omit<StudentProfile, "id">) {
  const data = await call<{ participant: StudentProfile }>({ action: "register", ...payload });
  return data.participant;
}

export function submitCourseAttempt(payload: Record<string, unknown>) {
  return call<{ saved: true }>({ action: "submit", ...payload });
}

export async function getSessionAccess() {
  const data = await call<{ sessions: SessionAccess[] }>({ action: "session_access" });
  return data.sessions;
}

export async function teacherLogin(password: string) {
  const data = await call<{ token: string; expiresIn: number }>({ action: "login", password });
  window.localStorage.setItem(teacherSessionKey, data.token);
  return data.token;
}

export function teacherToken() {
  return typeof window === "undefined" ? "" : window.localStorage.getItem(teacherSessionKey) || "";
}

export function teacherLogout() {
  if (typeof window !== "undefined") window.localStorage.removeItem(teacherSessionKey);
}

export function teacherCourseAccess(token = teacherToken()) {
  return call<{ role: "teacher"; sessionIds: number[]; expiresAt: string }>({ action: "teacher_course", token });
}

export function teacherDashboard<T>(filters: ProfessorFilters, page: number, token = teacherToken()) {
  return call<T>({ action: "dashboard", token, filters, page });
}

export function teacherExport<T>(filters: ProfessorFilters, token = teacherToken()) {
  return call<T>({ action: "export", token, filters });
}

export function teacherLearnerReport<T>(participantId: string, token = teacherToken()) {
  return call<T>({ action: "learner_report", token, participantId });
}

export function teacherDeleteAllData(token = teacherToken()) {
  return call<{ deleted: true }>({ action: "delete_all_data", token, confirmation: "EFFACER" });
}

export function teacherDeleteLearner(participantId: string, token = teacherToken()) {
  return call<{ deleted: true }>({ action: "delete_learner", token, participantId, confirmation: "SUPPRIMER" });
}

export type RosterStudent={id:string;fullName:string;className:string;groupName:string|null;massarCode?:string|null;source:"registration"|"import"|"manual";active:boolean};
export type ActivityProgress={participantId:string;sessionId:number;activityId:string;activityType:string;attempts:number;graded:number;correct:number;successful:boolean;firstSuccessAt:string|null;lastAt:string;bestScore:number|null;maxScore:number|null;sections:number[]|null};
export type LearningAnalytics={students:RosterStudent[];participants:Array<StudentProfile&{createdAt:string}>;activities:ActivityProgress[];sessionAccess:SessionAccess[];generatedAt:string;truncated:boolean};
export function rosterSuggestions(className:string,groupName:string){return call<{students:Array<{id:string;fullName:string}>}>({action:"roster_suggestions",className,groupName})}
export async function openLearnerSession(profile:StudentProfile){const data=await call<{participant:StudentProfile}>({action:"learning_session",participantId:profile.id,resumeToken:profile.resumeToken});return data.participant}
export function loadLearningState(resumeToken:string){return call<{checkpoints:import("./learning-storage").LearningSnapshot[];progress:Array<{sessionId:number;completedIds:string[]}>}>({action:"learning_state",resumeToken})}
export function saveLearningState(resumeToken:string,checkpoint:import("./learning-storage").LearningSnapshot,keepalive=false){return call<{saved:true;revision:number}>({action:"save_learning_state",resumeToken,checkpoint},keepalive)}
export function learnerWorkshop(resumeToken: string, sessionId: number) {
  return call<{ attempts: WorkshopAttempt[]; drafts: WorkshopEvidence[]; truncated: boolean }>({ action: "learner_workshop", resumeToken, sessionId });
}
export function teacherWorkshop(sessionId: number, token = teacherToken()) {
  return call<{ drafts: SavedWorkshopEvidence[]; truncated: boolean }>({ action: "teacher_workshop", token, sessionId });
}
export function teacherLearningAnalytics(token=teacherToken()){return call<LearningAnalytics>({action:"learning_analytics",token})}
export function teacherImportRoster(students:Array<Partial<RosterStudent>&{fullName:string;className:string}>,token=teacherToken()){return call<{saved:number}>({action:"import_roster",token,students})}
export function teacherUpdateRoster(id:string,changes:Partial<RosterStudent>,token=teacherToken()){return call<{saved:true}>({action:"update_roster",token,id,changes})}
export function teacherSetRosterActive(ids:string[],active:boolean,token=teacherToken()){return call<{updated:number;ids:string[];active:boolean}>({action:"set_roster_active",token,ids,active})}

export async function teacherUpdateSessionAccess(sessionId: number, isUnlocked: boolean, token = teacherToken()) {
  const data = await call<{ sessions: SessionAccess[] }>({
    action: "update_session_access",
    token,
    sessionId,
    isUnlocked,
  });
  return data.sessions;
}
