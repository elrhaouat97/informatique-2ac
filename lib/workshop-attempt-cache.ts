import type { WorkshopAttempt } from "./workshop-progress";

export const workshopAttemptEvent = "lab2ac-workshop-attempt";
const memory = new Map<string, WorkshopAttempt[]>();

export function workshopAttemptKey(participantId: string, sessionId: number) {
  return `lab2ac-workshop-attempts:${participantId}:${sessionId}`;
}

export function readWorkshopAttempts(key: string): WorkshopAttempt[] {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown;
    if (Array.isArray(saved)) {
      return [...new Map([...saved, ...(memory.get(key) ?? [])].map(attempt => [attempt.id, attempt])).values()];
    }
  } catch {}
  return memory.get(key) ?? [];
}

/** The same ID identifies an offline attempt and its eventual server copy. */
export function rememberWorkshopAttempts(key: string, attempts: WorkshopAttempt[]): WorkshopAttempt[] {
  const merged = [...new Map([...readWorkshopAttempts(key), ...attempts].map(attempt => [attempt.id, attempt])).values()];
  try {
    localStorage.setItem(key, JSON.stringify(merged));
    memory.delete(key);
  } catch {
    memory.set(key, merged);
  }
  window.dispatchEvent(new CustomEvent(workshopAttemptEvent, { detail: key }));
  return merged;
}
