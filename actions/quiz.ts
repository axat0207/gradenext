// actions/quiz.ts
"use server";

import { cookies } from "next/headers";
import { GradeLevel } from "@/config/curriculum";

export async function setQuizSession(
  grade: GradeLevel,
  subject: string,
  config: any
) {
  const cookieStore = await cookies();

  cookieStore.set("quizGrade", grade.toString());
  cookieStore.set("quizSubject", subject);
  cookieStore.set("quizConfig", JSON.stringify(config));
}

export async function clearQuizSession() {
  const cookieStore = await cookies();

  cookieStore.delete("quizGrade");
  cookieStore.delete("quizSubject");
  cookieStore.delete("quizConfig");
}
