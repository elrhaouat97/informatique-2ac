"use client";

import { useId } from "react";
import { List } from "lucide-react";
import { useTeacherCourse } from "../lib/teacher-course-context";

export function TeacherExerciseNavigator({ index, titles, onGo, label = "Aller à l’exercice" }: {
  index: number;
  titles: string[];
  onGo: (index: number) => void;
  label?: string;
}) {
  const teacher = useTeacherCourse();
  const id = useId();
  if (!teacher) return null;
  return <div className="teacher-exercise-navigator">
    <label htmlFor={id}><List size={19} aria-hidden="true" /><span>{label}<small>Accès direct · aucune réponse requise</small></span></label>
    <select id={id} value={index} onChange={event => onGo(Number(event.target.value))}>
      {titles.map((title, i) => <option key={i} value={i}>{String(i + 1).padStart(2, "0")} · {title}</option>)}
    </select>
  </div>;
}
