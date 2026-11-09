type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue => Boolean(value && typeof value === "object" && !Array.isArray(value));
const shortText = (value: unknown, maximum = 1000): value is string => typeof value === "string" && value.length > 0 && value.length <= maximum;
const localized = (value: unknown): value is {fr:string;ar:string} => record(value) && shortText(value.fr) && shortText(value.ar);
const normalized = (value: string) => value.normalize("NFKC").toLocaleLowerCase("fr");

/** Versioned contract for the lesson-3 assessment. Existing lesson-2 grading is unchanged. */
export function validSession3Evaluation(answer: unknown, isCorrect: boolean | null, score: number | null, maxScore: number | null): boolean {
  if (!record(answer) || answer.format !== "session3-bilan-situations-v5" || maxScore !== 20 || score === null || !Number.isInteger(score) || score < 0 || score > 20 || answer.score !== score || answer.maxScore !== 20 || isCorrect !== (score === 20)) return false;
  if (!Array.isArray(answer.answers) || answer.answers.length !== 15 || !Array.isArray(answer.sections) || answer.sections.length !== 3 || !answer.sections.every(Number.isInteger)) return false;
  const claimedSections = answer.sections;
  const dossier = answer.dossier;
  if (!record(dossier) || dossier.environment !== "simulation Windows 11" || dossier.mode !== "assessment" || !Array.isArray(dossier.files) || dossier.files.length > 100 || !Array.isArray(dossier.criteria) || dossier.criteria.length !== 5 || !Array.isArray(dossier.actions) || dossier.actions.length > 100 || !dossier.actions.every(a => shortText(a,80))) return false;
  if (!dossier.files.every(f => record(f) && shortText(f.id,100) && shortText(f.name,80) && shortText(f.path,8000) && ["folder","text","image","audio","video"].includes(String(f.kind)) && typeof f.deleted === "boolean" && (f.origin === undefined || shortText(f.origin,100)))) return false;
  const files = dossier.files as Array<RecordValue & {id:string;name:string;kind:string;path:string;deleted:boolean}>;
  if (new Set(files.map(f=>f.id)).size !== files.length) return false;
  const live = files.filter(f=>!f.deleted);
  const documents = "Ce PC / Documents";
  const target = live.find(f=>f.kind === "folder" && f.path === documents && normalized(f.name) === "bilan_club");
  const targetPath = target ? `${documents} / ${target.name}` : null;
  const photo = live.find(f=>f.id === "source-photo");
  const original = live.find(f=>f.id === "source-note");
  const copies = targetPath ? live.filter(f=>f.id !== "source-note" && f.kind === "text" && f.path === targetPath && f.origin === "club-invitation") : [];
  const practical = [
    Boolean(target),
    Boolean(targetPath && photo?.path === targetPath && photo.name === "Photo_club.jpg"),
    Boolean(original?.path === documents && original.name === "Consigne.txt" && copies.length),
    copies.some(f=>f.name === "Invitation.txt"),
    dossier.actions.includes("restored-file") && live.some(f=>f.id === "lost-note" && f.path === documents),
  ];
  for (let i=0;i<5;i++) {
    const criterion = dossier.criteria[i];
    if (!record(criterion) || !shortText(criterion.label) || criterion.points !== 2 || criterion.correct !== practical[i]) return false;
  }
  const expected = ["Matériel","Matériel","Système d’exploitation","Système d’exploitation","Application","Application","Texte","Image","Son","Vidéo"];
  const sections = [0,0,0];
  for (let i=0;i<15;i++) {
    const row = answer.answers[i];
    if (!record(row) || !localized(row.question) || !localized(row.selectedChoice) || !localized(row.correctChoice)) return false;
    const correct = i<10 ? row.selectedChoice.fr === expected[i] : practical[i-10];
    const points = i<10 ? 1 : 2;
    if (i<10 && row.correctChoice.fr !== expected[i]) return false;
    if (row.correct !== correct || row.answerCorrect !== correct || row.maxPoints !== points || row.earnedPoints !== (correct ? points : 0)) return false;
    sections[i<6?0:i<10?1:2] += correct ? points : 0;
  }
  return sections.every((value,i)=>value === claimedSections[i]) && sections.reduce((sum,value)=>sum+value,0) === score;
}
