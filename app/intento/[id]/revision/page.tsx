import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getVisibleAttempt } from "@/lib/access";
import { formatDate, pct } from "@/lib/format";
import ReviewedQuestion from "@/components/ReviewedQuestion";

const FILTERS = [
  { key: "todas", label: "Todas" },
  { key: "incorrectas", label: "Incorrectas" },
  { key: "correctas", label: "Correctas" },
  { key: "sin-responder", label: "Sin responder" },
] as const;
type Status = "correctas" | "incorrectas" | "sin-responder";
const CELL: Record<Status, string> = {
  correctas: "bg-green-500 text-white",
  incorrectas: "bg-red-500 text-white",
  "sin-responder": "bg-slate-200 text-slate-600",
};

export default async function AttemptReview({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ver?: string }>;
}) {
  const s = await requireRole("STUDENT", "TEACHER", "ADMIN");
  // Solo profesor y admin; al alumno no se le revela ni que la página existe.
  if (s.role === "STUDENT") notFound();
  const { attempt, answers, student, exam } = await getVisibleAttempt(s, (await params).id);
  const { ver: raw } = await searchParams;
  const ver = FILTERS.find((f) => f.key === raw)?.key ?? "todas";

  const rows = exam.questions.map((q) => {
    const given = answers[q.id] ?? null;
    const status: Status = !given ? "sin-responder" : given === q.answer ? "correctas" : "incorrectas";
    return { q, given, status };
  });
  const count = (k: string) => (k === "todas" ? rows.length : rows.filter((r) => r.status === k).length);
  const shown = rows.filter((r) => ver === "todas" || r.status === ver);
  const base = `/intento/${attempt.id}/revision`;

  const actions = (
    <div className="flex flex-wrap gap-3">
      <Link href={`/intento/${attempt.id}`} className="btn-light flex-1">
        ← Volver al reporte
      </Link>
      <Link href={`/alumnos/${student.id}`} className="btn-light flex-1">
        Intentos de {student.name}
      </Link>
    </div>
  );

  return (
    <div className="space-y-5">
      <section className="card">
        <h1 className="text-2xl font-bold">{student.name}</h1>
        <p className="text-slate-600">{exam.title}</p>
        <p className="mt-1 text-base text-slate-500">
          {formatDate(attempt.createdAt)} · Nota{" "}
          <strong className="text-slate-900">
            {attempt.score}/{attempt.total} ({pct(attempt.score, attempt.total)} %)
          </strong>
        </p>
      </section>

      {actions}

      <section className="card space-y-4">
        <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
          {rows.map(({ q, status }) => (
            <Link
              key={q.id}
              // Si el filtro la oculta, se quita el filtro para poder bajar a ella.
              href={`${ver === "todas" || status === ver ? `?ver=${ver}` : base}#q${q.number}`}
              aria-label={`Pregunta ${q.number}`}
              className={`flex aspect-square items-center justify-center rounded-lg text-base font-semibold ${CELL[status]}`}
            >
              {q.number}
            </Link>
          ))}
        </div>
        <nav className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "todas" ? base : `${base}?ver=${f.key}`}
              className={`rounded-full border px-3 py-1 text-base ${
                ver === f.key ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"
              }`}
            >
              {f.label} ({count(f.key)})
            </Link>
          ))}
        </nav>
      </section>

      {shown.length ? (
        shown.map(({ q, given }) => <ReviewedQuestion key={q.id} q={q} given={given} givenLabel="Respuesta del alumno" />)
      ) : (
        <p className="text-slate-500">No hay preguntas en este filtro.</p>
      )}

      {actions}
    </div>
  );
}
