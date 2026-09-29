import { LETTERS, type Letter, type Question } from "@/lib/grade";
import { OptionContent, QuestionText } from "./QuestionBody";

/** Pregunta ya calificada: correcta en verde, la del alumno en rojo si falló. */
export default function ReviewedQuestion({
  q,
  given,
  givenLabel,
}: {
  q: Question;
  given: Letter | null;
  givenLabel: string;
}) {
  const ok = given === q.answer;
  return (
    <article id={`q${q.number}`} className="card scroll-mt-4 space-y-3">
      <p className="text-base text-slate-500">
        <span className={`mr-1 font-bold ${ok ? "text-green-600" : "text-red-600"}`} aria-label={ok ? "Correcta" : "Incorrecta"}>
          {ok ? "✓" : "✗"}
        </span>
        Pregunta {q.number} · {q.block}
        <span className="block italic">{q.skill}</span>
      </p>
      <QuestionText q={q} />
      {!given && <p className="font-semibold text-red-700">Sin responder</p>}
      <ul className="space-y-2">
        {LETTERS.map((l) => {
          const style =
            l === q.answer ? "border-green-600 bg-green-50" : l === given ? "border-red-600 bg-red-50" : "border-slate-200";
          return (
            <li key={l} className={`flex gap-3 rounded-xl border-2 p-2 ${style}`}>
              <span className="w-6 shrink-0 font-bold">{l}</span>
              <div className="min-w-0 flex-1">
                <OptionContent option={q.options[l]} />
                {l === q.answer && <p className="text-base font-semibold text-green-700">✓ Correcta</p>}
                {l === given && <p className={`text-base font-semibold ${ok ? "text-green-700" : "text-red-700"}`}>{givenLabel}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
