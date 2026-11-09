import type { Metadata } from "next";
import ProfessorDashboard from "./professor-dashboard";
import "./professor.css";

export const metadata: Metadata = {
  title: "Espace professeur · LAB 2AC",
  description: "Suivi des réponses, des scores et de la progression des élèves.",
};

export default function ProfessorPage() {
  return <ProfessorDashboard />;
}
