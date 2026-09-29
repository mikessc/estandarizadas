"use client";
import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="card mx-auto mt-8 max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <label className="block">
        Correo
        <input name="email" type="email" required autoComplete="email" className="input mt-1" />
      </label>
      <label className="block">
        Contraseña
        <input name="password" type="password" required autoComplete="current-password" className="input mt-1" />
      </label>
      {state?.error && <p className="text-red-600">{state.error}</p>}
      <button className="btn w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
