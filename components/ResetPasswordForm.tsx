"use client";
import { useActionState } from "react";
import { resetPassword } from "@/app/actions";

export default function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  return (
    <details>
      <summary className="cursor-pointer text-blue-700 underline">Restablecer contraseña</summary>
      <form action={action} className="mt-2 space-y-2">
        <input type="hidden" name="userId" value={userId} />
        <input name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="Nueva contraseña" className="input" />
        <input name="confirm" type="password" required minLength={6} autoComplete="new-password" placeholder="Confirmar contraseña" className="input" />
        {state?.error && <p className="text-red-600">{state.error}</p>}
        {state?.ok && <p className="text-green-700">{state.ok}</p>}
        <button className="btn-light" disabled={pending}>
          {pending ? "Guardando…" : "Restablecer"}
        </button>
      </form>
    </details>
  );
}
