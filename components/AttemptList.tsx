import Link from "next/link";
import { getExam } from "@/lib/exams";
import { formatDate, pct } from "@/lib/format";

type A = { id: string; examId: string; score: number; total: number; createdAt: Date };

export default function AttemptList({ attempts }: { attempts: A[] }) {
  if (!attempts.length) return <p className="text-slate-500">Aún no hay intentos.</p>;
  return (
    <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {attempts.map((a) => (
        <li key={a.id}>
          <Link href={`/intento/${a.id}`} className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50">
            <span>
              <span className="block font-semibold">{getExam(a.examId)?.subject ?? a.examId}</span>
              <span className="text-base text-slate-500">{formatDate(a.createdAt)}</span>
            </span>
            <span className="text-right font-bold">
              {a.score}/{a.total}
              <span className="block text-base font-normal text-slate-500">{pct(a.score, a.total)} %</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
