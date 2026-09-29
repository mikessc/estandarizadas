import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getVisibleStudent } from "@/lib/access";
import { prisma } from "@/lib/db";
import { getExam } from "@/lib/exams";
import { barColor, formatDate, pct } from "@/lib/format";
import { LETTERS, buildReport, type Answers } from "@/lib/grade";
import { OptionContent, QuestionText } from "@/components/QuestionBody";

export default async function AttemptReport({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireRole("STUDENT", "TEACHER", "ADMIN");
  const attempt = await prisma.attempt.findUnique({ where: { id: (await params).id } });
  if (!attempt) notFound();
  const student = await getVisibleStudent(s, attempt.studentId);
  const exam = getExam(attempt.examId);
  if (!exam) notFound();
  const { blocks, reinforce, wrong } = buildReport(exam, attempt.answers as Answers);
  const p = pct(attempt.score, attempt.total);

  const actions =
    s.role === "STUDENT" ? (
      <div className="flex flex-wrap gap-3">
        <Link href="/alumno" className="btn-light flex-1">
          Volver al inicio
        </Link>
        <Link href={`/alumno/examen/${exam.id}`} className="btn flex-1">
          Repetir este examen
        </Link>
      </div>
    ) : (
      <Link href={`/alumnos/${student.id}`} className="btn-light w-full">
        ← Intentos de {student.name}
      </Link>
    );

  return (
    <div className="space-y-6">
      <section className="card text-center">
        <p className="text-slate-600">
          {exam.title}
          {s.role !== "STUDENT" && ` · ${student.name}`}
        </p>
        <p className="my-2 text-5xl font-extrabold">
          {attempt.score}/{attempt.total}
        </p>
        <p className="text-2xl font-bold">{p} %</p>
        <p className="mt-1 text-base text-slate-500">{formatDate(attempt.createdAt)}</p>
      </section>

      {actions}

      <section className="card space-y-3">
        <h2 className="text-xl font-bold">Resumen por bloque</h2>
        {blocks.map((b) => {
          const bp = pct(b.correct, b.total);
          return (
            <div key={b.name}>
              <div className="flex justify-between text-base">
                <span className="font-semibold">{b.name}</span>
                <span>
                  {b.correct}/{b.total} · {bp} %
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div className={`h-full ${barColor(bp)}`} style={{ width: `${bp}%` }} />
              </div>
            </div>
          );
        })}
      </section>

      {reinforce.length > 0 && (
        <section className="card space-y-4">
          <h2 className="text-xl font-bold">Temas para reforzar</h2>
          {reinforce.map((r) => (
            <div key={r.block}>
              <h3 className="font-semibold text-blue-800">{r.block}</h3>
              <ul className="mt-1 space-y-1.5">
                {r.skills.map((k) => (
                  <li key={k.skill} className="flex gap-2 text-base">
                    <span className="shrink-0 rounded-full bg-red-100 px-2 font-bold text-red-700">{k.errors}</span>
                    <span>{k.skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {wrong.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Preguntas para revisar ({wrong.length})</h2>
          {wrong.map((q) => (
            <article key={q.id} className="card space-y-3">
              <p className="text-base text-slate-500">
                Pregunta {q.number} · {q.block}
                <span className="block italic">{q.skill}</span>
              </p>
              <QuestionText q={q} />
              {!q.given && <p className="font-semibold text-red-700">Sin responder</p>}
              <ul className="space-y-2">
                {LETTERS.map((l) => {
                  const style =
                    l === q.answer
                      ? "border-green-600 bg-green-50"
                      : l === q.given
                        ? "border-red-600 bg-red-50"
                        : "border-slate-200";
                  return (
                    <li key={l} className={`flex gap-3 rounded-xl border-2 p-2 ${style}`}>
                      <span className="w-6 shrink-0 font-bold">{l}</span>
                      <div className="min-w-0 flex-1">
                        <OptionContent option={q.options[l]} />
                        {l === q.answer && <p className="text-base font-semibold text-green-700">✓ Respuesta correcta</p>}
                        {l === q.given && <p className="text-base font-semibold text-red-700">✗ {s.role === "STUDENT" ? "Tu respuesta" : "Respuesta del alumno"}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </section>
      )}

      {actions}
    </div>
  );
}
