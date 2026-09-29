"use client";
import { useActionState } from "react";
import { createUser } from "@/app/actions";

export default function CreateUserForm({ allowTeacher = false }: { allowTeacher?: boolean }) {
  const [state, action, pending] = useActionState(createUser, undefined);
  return (
    <form action={action} className="card space-y-3">
      <h2 className="text-xl font-bold">{allowTeacher ? "Crear usuario" : "Crear alumno"}</h2>
      {allowTeacher && (
        <select name="role" className="input">
          <option value="STUDENT">Alumno</option>
          <option value="TEACHER">Profesor</option>
        </select>
      )}
      <input name="name" required placeholder="Nombre completo" className="input" />
      <input name="email" type="email" required placeholder="Correo" className="input" />
      <input name="password" required minLength={6} placeholder="Contraseña inicial" className="input" />
      {state?.error && <p className="text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-green-700">{state.ok}</p>}
      <button className="btn w-full" disabled={pending}>
        {pending ? "Creando…" : "Crear"}
      </button>
    </form>
  );
}
