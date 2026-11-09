"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StudentProfile } from "./supabase-api";

// This scope is mounted only after the API validates the teacher's signed session.
// Its separate local identity must never be registered or uploaded as a learner.
const TeacherCourseContext = createContext(false);
export const teacherDemoProfile: StudentProfile = {
  id: "00000000-0000-4000-8000-0000000000f0",
  studentOne: "Professeur · démonstration",
  studentTwo: null,
  className: "2/1",
  groupName: "1",
  isPair: false,
};

export function TeacherCourseScope({ children }: { children: ReactNode }) {
  return <TeacherCourseContext.Provider value={true}>{children}</TeacherCourseContext.Provider>;
}

export function useTeacherCourse() {
  return useContext(TeacherCourseContext);
}
