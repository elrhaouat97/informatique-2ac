export type ReportScope = "all" | number;
type SessionAttempt = {sessionId:number;createdAt:string};
const validSession = (id:number) => Number.isInteger(id) && id >= 1 && id <= 15;

export function reportSessionIds(attempts:readonly SessionAttempt[]):number[] {
  return [...new Set([1,2,3,...attempts.map(a=>a.sessionId).filter(validSession)])].sort((a,b)=>a-b);
}

/** Respect the dashboard filter when it has data; otherwise open the latest active lesson. */
export function initialReportScope(attempts:readonly SessionAttempt[], requestedSession = ""):ReportScope {
  const requested = Number(requestedSession);
  if (validSession(requested) && attempts.some(a=>a.sessionId === requested)) return requested;
  const latest = attempts.filter(a=>validSession(a.sessionId)).reduce<SessionAttempt|null>((selected,a)=>{
    if (!selected) return a;
    return (Date.parse(a.createdAt)||0) > (Date.parse(selected.createdAt)||0) ? a : selected;
  },null);
  return latest?.sessionId ?? "all";
}

export function filterReportAttempts<T extends {sessionId:number}>(attempts:readonly T[],scope:ReportScope):T[] {
  return attempts.filter(a=>scope === "all" || a.sessionId === scope);
}
