"use server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { COOKIE, HOME, createSession, requireRole } from "@/lib/auth";
import { getExam } from "@/lib/exams";
import { sanitizeAnswers, score } from "@/lib/grade";

type FormState = { error?: string; ok?: string } | undefined;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function login(_: FormState, f: FormData): Promise<FormState> {
  const user = await prisma.user.findUnique({ where: { email: str(f, "email").toLowerCase() } });
  if (!user || !(await bcrypt.compare(String(f.get("password") ?? ""), user.passwordHash)))
    return { error: "Correo o contraseña incorrectos." };
  await createSession({ id: user.id, name: user.name, role: user.role });
  redirect(HOME[user.role]);
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/login");
}

export async function createUser(_: FormState, f: FormData): Promise<FormState> {
  const s = await requireRole("ADMIN", "TEACHER");
  const name = str(f, "name");
  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") ?? "");
  // Un profesor solo puede crear alumnos, y quedan ligados a él.
  const role = s.role === "ADMIN" && f.get("role") === "TEACHER" ? "TEACHER" : "STUDENT";
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return { error: "Escribe un nombre y un correo válido." };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  try {
    await prisma.user.create({
      data: {
        name,
        email,
        role,
        passwordHash: await bcrypt.hash(password, 10),
        teacherId: s.role === "TEACHER" ? s.id : null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { error: "Ese correo ya está registrado." };
    throw e;
  }
  revalidatePath(s.role === "ADMIN" ? "/admin" : "/profesor");
  return { ok: `${role === "TEACHER" ? "Profesor" : "Alumno"} creado: ${name}` };
}

export async function resetPassword(f: FormData) {
  await requireRole("ADMIN");
  const password = String(f.get("password") ?? "");
  if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
  await prisma.user.update({
    where: { id: str(f, "userId") },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });
  revalidatePath("/admin");
}

export async function setTeacher(f: FormData) {
  await requireRole("ADMIN");
  const teacherId = str(f, "teacherId") || null;
  if (teacherId && !(await prisma.user.findFirst({ where: { id: teacherId, role: "TEACHER" } })))
    throw new Error("Profesor no válido.");
  await prisma.user.update({ where: { id: str(f, "studentId"), role: "STUDENT" }, data: { teacherId } });
  revalidatePath("/admin");
}

/** Califica en el servidor: el navegador nunca recibe las respuestas correctas antes de entregar. */
export async function submitAttempt(examId: string, rawAnswers: unknown) {
  const s = await requireRole("STUDENT");
  const exam = getExam(examId);
  if (!exam) throw new Error("Examen no encontrado.");
  const answers = sanitizeAnswers(exam, rawAnswers);
  const attempt = await prisma.attempt.create({
    data: { studentId: s.id, examId, answers, score: score(exam, answers), total: exam.questions.length },
  });
  return attempt.id;
}
