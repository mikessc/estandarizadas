import "server-only";
import { notFound } from "next/navigation";
import { prisma } from "./db";
import type { Session } from "./auth";

/** Admin ve a todos; profesor solo a sus alumnos ligados; alumno solo a sí mismo. */
export async function getVisibleStudent(s: Session, studentId: string) {
  if (s.role === "STUDENT" && studentId !== s.id) notFound();
  const student = await prisma.user.findFirst({
    where: { id: studentId, role: "STUDENT", ...(s.role === "TEACHER" && { teacherId: s.id }) },
  });
  if (!student) notFound();
  return student;
}
