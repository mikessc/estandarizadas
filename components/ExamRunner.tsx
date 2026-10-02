"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAttempt } from "@/app/actions";
import { LETTERS, type Answers, type PublicQuestion } from "@/lib/grade";
import { OptionContent, QuestionText } from "./QuestionBody";

export default function ExamRunner({
  userId,
  examId,
  questions,
}: {
  userId: string;
  examId: string;
  questions: PublicQuestion[];
}) {
  // Por usuario: varios alumnos comparten la misma computadora o tablet.
  const key = `progreso:${userId}:${examId}`;
  const [answers, setAnswers] = useState<Answers>({});
  const [i, setI] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "null");
      if (saved) {
        setAnswers(saved.answers ?? {});
        setI(Math.min(saved.i ?? 0, questions.length - 1));
      }
    } catch {}
    setLoaded(true);
  }, [key, questions.length]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify({ answers, i }));
    } catch {}
  }, [key, answers, i, loaded]);

  const go = (n: number) => {
    setI(n);
    window.scrollTo({ top: 0 });
  };
  const q = questions[i];
  const answered = questions.filter((x) => answers[x.id]).length;

  function submit() {
    const missing = questions.length - answered;
    if (
      missing > 0 &&
      !confirm(`Tienes ${missing} pregunta(s) sin responder. Contarán como incorrectas. ¿Entregar de todos modos?`)
    )
      return;
    startTransition(async () => {
      const id = await submitAttempt(examId, answers);
      try {
        localStorage.removeItem(key);
      } catch {}
      router.push(`/intento/${id}`);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex justify-between text-base text-slate-600">
          <span>
            Pregunta {q.number} de {questions.length} · {q.block}
          </span>
          <span>
            {answered}/{questions.length}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${(answered / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="card">
        <QuestionText q={q} />
      </div>

      <fieldset className="space-y-3">
        <legend className="sr-only">Opciones</legend>
        {LETTERS.map((l) => {
          const checked = answers[q.id] === l;
          return (
            <label
              key={l}
              className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-3 ${checked ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"}`}
            >
              <input
                type="radio"
                name={q.id}
                checked={checked}
                onChange={() => setAnswers({ ...answers, [q.id]: l })}
                className="sr-only"
              />
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${checked ? "bg-blue-600 text-white" : "bg-slate-100"}`}
              >
                {l}
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <OptionContent option={q.options[l]} />
              </div>
            </label>
          );
        })}
      </fieldset>

      <div className="flex gap-3">
        <button className="btn-light flex-1" onClick={() => go(i - 1)} disabled={i === 0}>
          ← Anterior
        </button>
        <button className="btn flex-1" onClick={() => go(i + 1)} disabled={i === questions.length - 1}>
          Siguiente →
        </button>
      </div>

      <div className="card">
        <p className="mb-2 text-base text-slate-600">Ir a la pregunta:</p>
        <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
          {questions.map((x, n) => (
            <button
              key={x.id}
              onClick={() => go(n)}
              aria-label={`Pregunta ${n + 1}${answers[x.id] ? ", respondida" : ""}`}
              className={`aspect-square rounded-lg text-base font-semibold ${n === i ? "ring-2 ring-blue-600 ring-offset-1" : ""} ${
                answers[x.id] ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {n + 1}
            </button>
          ))}
        </div>
        <button className="btn-gold mt-4 w-full" onClick={submit} disabled={pending}>
          {pending ? "Entregando…" : "Entregar examen"}
        </button>
      </div>
    </div>
  );
}
