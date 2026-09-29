import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getExams } from "@/lib/exams";
import { pct } from "@/lib/format";
import AttemptList from "@/components/AttemptList";

export default async function StudentHome() {
  const s = await requireRole("STUDENT");
  const attempts = await prisma.attempt.findMany({ where: { studentId: s.id }, orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-4 text-2xl font-bold">¡Hola, {s.name}! Elige un examen</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {getExams().map((e) => {
            const mine = attempts.filter((a) => a.examId === e.id);
            const best = Math.max(0, ...mine.map((a) => a.score));
            const total = e.questions.length;
            return (
              <Link key={e.id} href={`/alumno/examen/${e.id}`} className="card block hover:border-blue-400">
                <h2 className="text-xl font-bold">{e.subject}</h2>
                <p className="text-slate-600">{total} preguntas</p>
                <p className="mt-2 text-base">
                  {mine.length
                    ? `Mejor nota: ${best}/${total} (${pct(best, total)} %) · ${mine.length} intento(s)`
                    : "Sin intentos todavía"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-xl font-bold">Mis intentos</h2>
        <AttemptList attempts={attempts} />
      </section>
    </div>
  );
}
