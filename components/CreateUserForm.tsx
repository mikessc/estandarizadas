"use client";
import { useActionState, useState } from "react";
import { createUser } from "@/app/actions";

type Teacher = { id: string; name: string };

/** Sin `teachers`: formulario del profesor (solo alumnos). Con `teachers`: formulario del admin. */
export default function CreateUserForm({ teachers }: { teachers?: Teacher[] }) {
  const [state, action, pending] = useActionState(createUser, undefined);
  const [role, setRole] = useState("STUDENT");
  const isAdmin = !!teachers;
  return (
    <form action={action} className="card space-y-3">
      <h2 className="text-xl font-bold">{isAdmin ? "Crear usuario" : "Crear alumno"}</h2>
      {isAdmin && (
        <select name="role" value={role} onChange={(e) => setRole(e.target.value)} className="input" aria-label="Rol">
          <option value="STUDENT">Alumno</option>
          <option value="TEACHER">Profesor</option>
        </select>
      )}
      <input name="name" required placeholder="Nombre completo" className="input" />
      <input name="email" type="email" required placeholder="Correo" className="input" />
      <input name="password" required minLength={6} placeholder="Contraseña inicial" className="input" />
      {isAdmin && role === "STUDENT" && (
        <label className="block">
          Profesor
          <TeacherSelect teachers={teachers} />
        </label>
      )}
      {state?.error && <p className="text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-green-700">{state.ok}</p>}
      <button className="btn w-full" disabled={pending}>
        {pending ? "Creando…" : "Crear"}
      </button>
    </form>
  );
}

export function TeacherSelect({
  teachers,
  value,
  onChange,
}: {
  teachers: Teacher[];
  value?: string;
  onChange?: (id: string) => void;
}) {
  return (
    <select
      name="teacherId"
      className="input mt-1"
      {...(onChange ? { value, onChange: (e) => onChange(e.target.value) } : { defaultValue: "" })}
    >
      <option value="">Sin profesor</option>
      {teachers.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
