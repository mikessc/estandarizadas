import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getVisibleAttempt } from "@/lib/access";
import { barColor, formatDate, pct } from "@/lib/format";
import { buildReport } from "@/lib/grade";
import ReviewedQuestion from "@/components/ReviewedQuestion";

export default async function AttemptReport({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireRole("STUDENT", "TEACHER", "ADMIN");
  const { attempt, answers, student, exam } = await getVisibleAttempt(s, (await params).id);
  const report = buildReport(exam, answers);
  const { blocks, reinforce } = report;
  // El alumno solo ve bloques y temas: las preguntas falladas (con "answer") no salen del servidor.
  const wrong = s.role === "STUDENT" ? [] : report.wrong;
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
      <div className="flex flex-wrap gap-3">
        <Link href={`/alumnos/${student.id}`} className="btn-light flex-1">
          ← Intentos de {student.name}
        </Link>
        <Link href={`/intento/${attempt.id}/revision`} className="btn flex-1">
          Ver todas las respuestas
        </Link>
      </div>
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
            <ReviewedQuestion
              key={q.id}
              q={q}
              given={q.given}
              givenLabel="✗ Respuesta del alumno"
            />
          ))}
        </section>
      )}

      {s.role === "STUDENT" && (
        <p className="card text-center text-lg font-semibold text-blue-800">
          {reinforce.length ? "Repasa estos temas y vuelve a intentarlo" : "¡Excelente! Respondiste todo bien."}
        </p>
      )}

      {actions}
    </div>
  );
}
