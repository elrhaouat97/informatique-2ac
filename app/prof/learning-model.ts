import {unit1Labs} from '../unit1-labs';
import {session4Activities,session4AppliedEvaluationId,session4LabEvaluationId,session4QuizEvaluationId} from '../session4-data';
import {workshopExercises,workshopRows,workshopTotals,type SavedWorkshopEvidence,type WorkshopRow} from '../../lib/workshop-progress';
import type {ActivityProgress,LearningAnalytics,RosterStudent} from '@/lib/supabase-api';
export type Mastery='acquired'|'developing'|'not-acquired'|'unassessed';
export const masteryLabels:Record<Mastery,string>={acquired:'Acquis',developing:'En cours d’acquisition','not-acquired':'Non acquis',unassessed:'Non évalué'};
type Target={id:string;title:string;objective:string;type:string};
const groups:Record<number,Array<[string,number[]]>>={
 1:[['Manipuler la souris et saisir un texte',[1,2,3]],['Définir l’informatique',[4,5]],['Reconnaître les formes de l’information',[6,7]],['Comprendre le traitement de l’information',[8,9]],['Distinguer les types de traitement',[10,11,12,13,14]]],
 2:[['Reconnaître les éléments du poste',[1,2]],['Choisir les périphériques adaptés',[3,4,5,10]],['Identifier les composants et diagnostiquer',[6,7,11,12]],['Comparer et convertir les capacités',[8,9]]],
 3:[['Reconnaître l’information et son traitement',[1,2]],['Mobiliser les connaissances sur le matériel',[3,4,5]],['Convertir les capacités de stockage',[6]],['Distinguer matériel, systèmes et applications',[7,8,9]],['Utiliser le bureau et les fenêtres Windows',[10,11,12,13,20,21]],['Comprendre les fichiers et leurs contenus',[14,15,16,22]],['Organiser, copier, déplacer et restaurer',[17,18,19,23,24,25]]],
};
export function targetsFor(sessionId:number):Target[]{
 if(sessionId===4)return session4Activities.filter(a=>a.kind!=='practice').map(a=>({id:a.id,title:a.title.fr,type:'workshop',objective:a.objective}));
 if(sessionId<=3){const lab=unit1Labs[sessionId as 1|2|3];return lab.exercises.map((e,i)=>({id:e.id,title:e.title.fr,type:'unit1_exercise',objective:groups[sessionId].find(([,ns])=>ns.includes(i+1))?.[0]||'Mettre en pratique'}))}
 return workshopExercises(sessionId).filter(exercise=>!exercise.declared).map(exercise=>({id:exercise.id,title:exercise.title.fr,type:exercise.type,objective:'Interpréter la photo de la séance'}));
}
export function mastery(passed:number,observed:number,total:number):Mastery{return observed===0?'unassessed':passed===total&&total>0?'acquired':observed===total&&passed/total<.5?'not-acquired':'developing'}
export type TargetResult = Target & { passed: boolean; observed: boolean; graded: boolean };
export type Objective = { title: string; status: Mastery; passed: number; observed: number; total: number };
export type TeacherWorkshopRow = WorkshopRow & { lastAt: string | null; pair: boolean };
export type LearnerProgress = {
  student: RosterStudent;
  targets: TargetResult[];
  workshop: TeacherWorkshopRow[];
  objectives: Objective[];
  status: Mastery;
  passed: number;
  observed: number;
  total: number;
  percent: number;
  workshopGrade: number | null;
  graded: number;
  correct: number;
  successRate: number | null;
  grade: number | null;
  gradeLabel: string;
  lastAt: string | null;
  pair: boolean;
  activities: ActivityProgress[];
};

export function learnerProgress(data: LearningAnalytics, student: RosterStudent, sessionId: number, saved: SavedWorkshopEvidence[] = []): LearnerProgress {
  const dossiers = data.participants.filter(p => p.studentOneId === student.id || p.studentTwoId === student.id);
  const ids = new Set(dossiers.map(p => p.id));
  const pairs = new Set(dossiers.filter(p => p.isPair).map(p => p.id));
  const activities = data.activities.filter(a => ids.has(a.participantId) && a.sessionId === sessionId);
  const drafts = saved.filter(row => ids.has(row.participantId));
  const exercises = workshopExercises(sessionId);
  const exerciseTypes = new Map(exercises.map(exercise => [exercise.id, exercise.type]));
  const attempts = activities.filter(a => exerciseTypes.get(a.activityId) === a.activityType);
  const workshop = workshopRows(exercises, drafts, attempts).map(row => {
    const evidence = drafts.filter(d => d.activityId === row.id);
    const results = attempts.filter(a => a.activityId === row.id);
    return {
      ...row,
      lastAt: [...results.map(a => a.lastAt), ...evidence.map(d => d.updatedAt)].sort().at(-1) ?? null,
      pair: [...results, ...evidence].some(item => pairs.has(item.participantId)),
    };
  });
  const byId = new Map(workshop.map(row => [row.id, row]));
  const targets = targetsFor(sessionId).map(target => {
    const row = byId.get(target.id);
    return { ...target, passed: !!row?.confirmed, observed: row?.percent != null, graded: !!row?.graded || !!row?.confirmed };
  });
  function statusFor(group: TargetResult[]) {
    const passed = group.filter(t => t.passed).length;
    const observed = group.filter(t => t.observed).length;
    const status = mastery(passed, observed, group.length);
    return status === "not-acquired" && group.some(t => !t.graded) ? "developing" : status;
  }
  const objectives = [...new Set(targets.map(t => t.objective))].map(title => {
    const group = targets.filter(t => t.objective === title);
    return { title, passed: group.filter(t => t.passed).length, observed: group.filter(t => t.observed).length, total: group.length, status: statusFor(group) };
  });
  const total = workshopTotals(workshop);
 const best=(id:string)=>activities.filter(a=>a.activityId===id&&a.bestScore!==null&&a.maxScore!==null&&a.maxScore>0).sort((a,b)=>(b.bestScore!/b.maxScore!)-(a.bestScore!/a.maxScore!))[0];
 let grade:number|null=null,gradeLabel='Évaluation non remise';
 if(sessionId===4){const a=best(session4AppliedEvaluationId)??best(session4LabEvaluationId)??best(session4QuizEvaluationId);if(a){grade=20*a.bestScore!/a.maxScore!;gradeLabel=a.activityId===session4AppliedEvaluationId?'Réseau local · 4 missions pratiques /20':a.activityId===session4LabEvaluationId?'Réseau local · QCM et simulateur /20':'Réseau local · 4 situations /20'}}
 else if(sessionId===3){const a=best('session-3-bilan-situations-v5');if(a){grade=20*a.bestScore!/a.maxScore!;gradeLabel='Bilan en trois situations'}}
 else if(sessionId===2){const q=best('session-2-quiz'),a=best('s2-evaluation-assembler'),r=best('s2-evaluation-depanner');if(q&&a&&r){grade=20*(q.bestScore!+a.bestScore!+r.bestScore!)/(q.maxScore!+a.maxScore!+r.maxScore!);gradeLabel='Assembler + dépanner + QCM'}else if(q||a||r)gradeLabel='Évaluation en partie remise'}
 else{const a=best(`session-${sessionId}-quiz`);if(a){grade=20*a.bestScore!/a.maxScore!;gradeLabel='QCM · meilleure note'}}
  return {
    student, targets, workshop, objectives, status: statusFor(targets),
    passed: total.finished, observed: workshop.filter(row => row.percent !== null).length,
    total: workshop.length, percent: total.percent, workshopGrade: total.grade,
    graded: total.graded, correct: total.correct, successRate: total.successRate,
    grade: grade === null ? null : Math.round(grade * 10) / 10, gradeLabel,
    lastAt: [...activities.map(a => a.lastAt), ...drafts.map(d => d.updatedAt)].sort().at(-1) ?? null,
    pair: [...activities, ...drafts].some(item => pairs.has(item.participantId)), activities,
  };
}
export function progressRows(data: LearningAnalytics, sessionId: number, saved: SavedWorkshopEvidence[] = []) {
  return data.students.filter(s => s.active).map(s => learnerProgress(data, s, sessionId, saved));
}
export function successTimeline(rows:LearnerProgress[]){const events=new Map<string,number>();for(const r of rows){for(const t of r.targets){const first=r.activities.filter(a=>a.activityId===t.id&&a.activityType===t.type&&a.successful&&a.firstSuccessAt).map(a=>a.firstSuccessAt!).sort()[0];if(first){const day=first.slice(0,10);events.set(day,(events.get(day)||0)+1)}}}let total=0;return [...events].sort(([a],[b])=>a.localeCompare(b)).map(([day,value])=>({day,value:total+=value}))}
