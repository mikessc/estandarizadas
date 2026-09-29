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
import { EMAIL_RE, parseBulk } from "@/lib/bulk";

type FormState = { error?: string; ok?: string } | undefined;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

/** null si viene vacío; error si el id no es de un usuario con rol TEACHER. */
async function teacherIdOrNull(id: string) {
  if (!id) return null;
  if (!(await prisma.user.findFirst({ where: { id, role: "TEACHER" } }))) throw new Error("Profesor no válido.");
  return id;
}

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
  if (!name || !EMAIL_RE.test(email)) return { error: "Escribe un nombre y un correo válido." };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  // Admin: el alumno queda ligado al profesor elegido en el formulario.
  let teacherId: string | null = s.role === "TEACHER" ? s.id : null;
  if (s.role === "ADMIN" && role === "STUDENT") {
    try {
      teacherId = await teacherIdOrNull(str(f, "teacherId"));
    } catch {
      return { error: "El profesor elegido no es válido." };
    }
  }
  try {
    await prisma.user.create({
      data: { name, email, role, teacherId, passwordHash: await bcrypt.hash(password, 10) },
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
  const teacherId = await teacherIdOrNull(str(f, "teacherId"));
  await prisma.user.update({ where: { id: str(f, "studentId"), role: "STUDENT" }, data: { teacherId } });
  revalidatePath("/admin");
}

async function parseBulkWithDb(text: string) {
  const emails = parseBulk(text).map((r) => r.email);
  const found = await prisma.user.findMany({ where: { email: { in: emails } }, select: { email: true } });
  return parseBulk(text, new Set(found.map((u) => u.email)));
}

/** Vista previa de la creación masiva: errores por línea, sin guardar nada. */
export async function previewBulkStudents(text: string) {
  await requireRole("ADMIN");
  return (await parseBulkWithDb(text)).map(({ line, name, email, errors }) => ({ line, name, email, errors }));
}

/** Crea las líneas válidas (se vuelven a validar aquí) y reporta las que fallaron y por qué. */
export async function createBulkStudents(text: string, teacherIdRaw: string) {
  await requireRole("ADMIN");
  const teacherId = await teacherIdOrNull(teacherIdRaw);
  const created: string[] = [];
  const failed: { line: number; name: string; email: string; reason: string }[] = [];
  for (const r of await parseBulkWithDb(text)) {
    if (r.errors.length) {
      failed.push({ line: r.line, name: r.name, email: r.email, reason: r.errors.join(", ") });
      continue;
    }
    try {
      const passwordHash = await bcrypt.hash(r.password, 10);
      await prisma.user.create({ data: { name: r.name, email: r.email, role: "STUDENT", passwordHash, teacherId } });
      created.push(`${r.name} (${r.email})`);
    } catch (e) {
      const dup = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
      failed.push({ line: r.line, name: r.name, email: r.email, reason: dup ? "El correo ya existe" : "Error al guardar" });
    }
  }
  revalidatePath("/admin");
  return { created, failed };
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
