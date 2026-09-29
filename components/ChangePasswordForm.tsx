"use client";
import { useActionState } from "react";
import { changePassword } from "@/app/actions";

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="card space-y-3">
      <h2 className="text-xl font-bold">Cambiar mi contraseña</h2>
      <input name="current" type="password" required autoComplete="current-password" placeholder="Contraseña actual" className="input" />
      <input name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="Nueva contraseña" className="input" />
      <input name="confirm" type="password" required minLength={6} autoComplete="new-password" placeholder="Confirmar nueva contraseña" className="input" />
      {state?.error && <p className="text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-green-700">{state.ok}</p>}
      <button className="btn w-full" disabled={pending}>
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
