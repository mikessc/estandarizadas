import Link from "next/link";
import { getExam } from "@/lib/exams";
import { formatDate, pct } from "@/lib/format";

type S = {
  id: string;
  name: string;
  email: string;
  attempts: { examId: string; score: number; total: number; createdAt: Date }[];
};

/** Lista de alumnos con su último intento. `attempts` debe venir con el más reciente primero. */
export default function StudentTable({ students }: { students: S[] }) {
  if (!students.length) return <p className="text-slate-500">No hay alumnos.</p>;
  return (
    <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {students.map((s) => {
        const last = s.attempts[0];
        return (
          <li key={s.id}>
            <Link href={`/alumnos/${s.id}`} className="block p-3 hover:bg-slate-50">
              <span className="block font-semibold">{s.name}</span>
              <span className="block text-base text-slate-500">
                {last
                  ? `${getExam(last.examId)?.subject ?? last.examId} · ${last.score}/${last.total} (${pct(last.score, last.total)} %) · ${formatDate(last.createdAt)}`
                  : "Sin intentos"}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
