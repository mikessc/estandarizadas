import Link from "next/link";
import { HOME, requireRole } from "@/lib/auth";
import { getVisibleStudent } from "@/lib/access";
import { prisma } from "@/lib/db";
import { getExams } from "@/lib/exams";
import AttemptList from "@/components/AttemptList";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default async function StudentAttempts({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ examen?: string }>;
}) {
  const s = await requireRole("TEACHER", "ADMIN");
  const student = await getVisibleStudent(s, (await params).id);
  const { examen } = await searchParams;
  const attempts = await prisma.attempt.findMany({
    where: { studentId: student.id, ...(examen && { examId: examen }) },
    orderBy: { createdAt: "desc" },
  });
  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-base ${active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"}`;
  const back = s.role === "ADMIN" ? "/admin?tab=alumnos" : HOME.TEACHER;

  return (
    <div className="space-y-4">
      <Link href={back} className="text-blue-700 underline">
        ← Alumnos
      </Link>
      <h1 className="text-2xl font-bold">{student.name}</h1>
      <ResetPasswordForm userId={student.id} />
      <nav className="flex flex-wrap gap-2">
        <Link href={`/alumnos/${student.id}`} className={chip(!examen)}>
          Todos
        </Link>
        {getExams().map((e) => (
          <Link key={e.id} href={`/alumnos/${student.id}?examen=${e.id}`} className={chip(examen === e.id)}>
            {e.subject}
          </Link>
        ))}
      </nav>
      <AttemptList attempts={attempts} />
    </div>
  );
}
