import type { Metadata } from "next";
import TeacherCourseAccess from "./teacher-course-access";
import "../../prof/professor.css";
import "./teacher-course.css";

export const metadata: Metadata = {
  title: "Cours professeur · LAB 2AC",
  robots: { index: false, follow: false },
};

export default function TeacherCoursePage() {
  return <TeacherCourseAccess />;
}
