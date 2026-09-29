import "server-only";
import { notFound } from "next/navigation";
import { prisma } from "./db";
import { getExam } from "./exams";
import type { Session } from "./auth";
import type { Answers } from "./grade";

/** Admin ve a todos; profesor solo a sus alumnos ligados; alumno solo a sí mismo. */
export async function getVisibleStudent(s: Session, studentId: string) {
  if (s.role === "STUDENT" && studentId !== s.id) notFound();
  const student = await prisma.user.findFirst({
    where: { id: studentId, role: "STUDENT", ...(s.role === "TEACHER" && { teacherId: s.id }) },
  });
  if (!student) notFound();
  return student;
}

/** Intento con su alumno y examen, o 404 si la sesión no puede verlo. */
export async function getVisibleAttempt(s: Session, attemptId: string) {
  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt) notFound();
  const student = await getVisibleStudent(s, attempt.studentId);
  const exam = getExam(attempt.examId);
  if (!exam) notFound();
  return { attempt, answers: attempt.answers as Answers, student, exam };
}
