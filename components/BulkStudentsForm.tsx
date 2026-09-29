"use client";
import { useState, useTransition } from "react";
import { createBulkStudents, previewBulkStudents } from "@/app/actions";
import { TeacherSelect } from "./CreateUserForm";

type Preview = Awaited<ReturnType<typeof previewBulkStudents>>;
type Result = Awaited<ReturnType<typeof createBulkStudents>>;

export default function BulkStudentsForm({ teachers }: { teachers: { id: string; name: string }[] }) {
  const [text, setText] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [pending, start] = useTransition();
  const valid = preview?.filter((r) => !r.errors.length).length ?? 0;

  return (
    <details className="card">
      <summary className="cursor-pointer text-xl font-bold">Agregar varios alumnos</summary>
      <div className="mt-3 space-y-3">
        <p className="text-base text-slate-600">
          Un alumno por línea: <code>Nombre, correo, contraseña</code>. También puedes pegar tres columnas desde Excel.
        </p>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setPreview(null);
          }}
          rows={8}
          placeholder={"Ana Mora, ana@escuela.cr, clave123\nLuis Rojas, luis@escuela.cr, clave456"}
          className="input font-mono text-base"
        />
        <label className="block">
          Profesor para todos
          <TeacherSelect teachers={teachers} value={teacherId} onChange={setTeacherId} />
        </label>
        <button
          type="button"
          className="btn-light w-full"
          disabled={pending || !text.trim()}
          onClick={() =>
            start(async () => {
              setResult(null);
              setPreview(await previewBulkStudents(text));
            })
          }
        >
          Revisar lista
        </button>

        {preview && (
          <>
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 text-base">
              {preview.map((r) => (
                <li key={r.line} className={`p-2 ${r.errors.length ? "bg-red-50" : ""}`}>
                  <span className="text-slate-500">Línea {r.line}: </span>
                  {r.name || "—"} · {r.email || "—"}
                  {r.errors.length > 0 ? (
                    <span className="block font-semibold text-red-700">✗ {r.errors.join(", ")}</span>
                  ) : (
                    <span className="ml-1 text-green-700">✓</span>
                  )}
                </li>
              ))}
            </ul>
            {preview.length > valid && (
              <p className="text-base text-slate-600">Las líneas con error no se crearán.</p>
            )}
            <button
              type="button"
              className="btn w-full"
              disabled={pending || valid === 0}
              onClick={() =>
                start(async () => {
                  setResult(await createBulkStudents(text, teacherId));
                  setPreview(null);
                  setText("");
                })
              }
            >
              {pending ? "Creando…" : `Crear ${valid} alumno${valid === 1 ? "" : "s"}`}
            </button>
          </>
        )}

        {result && (
          <div className="space-y-2 rounded-xl border border-slate-200 p-3 text-base">
            <p className="font-semibold text-green-700">Creados: {result.created.length}</p>
            {result.created.length > 0 && (
              <ul className="list-disc pl-6">
                {result.created.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}
            <p className={`font-semibold ${result.failed.length ? "text-red-700" : "text-slate-600"}`}>
              Con error: {result.failed.length}
            </p>
            {result.failed.length > 0 && (
              <ul className="list-disc pl-6">
                {result.failed.map((f) => (
                  <li key={f.line}>
                    Línea {f.line} ({f.name || "—"}, {f.email || "—"}): {f.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </details>
  );
}
