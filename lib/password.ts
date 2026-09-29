// Lógica pura (sin imports) para poder probarla con `node --test`.

/** Mensaje de error para una contraseña nueva, o undefined si es válida. Con `current`, además exige que sea distinta. */
export function newPasswordError(password: string, confirm: string, current?: string) {
  if (password.length < 6) return "La nueva contraseña debe tener al menos 6 caracteres.";
  if (password !== confirm) return "La confirmación no coincide con la nueva contraseña.";
  if (current !== undefined && password === current) return "La nueva contraseña debe ser distinta de la actual.";
}
