// Lógica pura (sin imports) para poder probarla con `node --test`.

export type BulkRow = { line: number; name: string; email: string; password: string; errors: string[] };

export const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Una línea por alumno: "Nombre, correo, contraseña" (también acepta tabuladores, al pegar desde Excel). */
export function parseBulk(text: string, existing: Set<string> = new Set()): BulkRow[] {
  const seen = new Set<string>();
  return text
    .split(/\r?\n/)
    .map((raw, i) => ({ raw: raw.trim(), line: i + 1 }))
    .filter((r) => r.raw)
    .map(({ raw, line }) => {
      const parts = raw.split(raw.includes("\t") ? "\t" : ",").map((p) => p.trim());
      const [name = "", email0 = "", password = ""] = parts;
      const email = email0.toLowerCase();
      const errors: string[] = [];
      if (parts.length > 3) errors.push("Formato inválido: sobran columnas");
      if (!name) errors.push("Falta el nombre");
      if (!EMAIL_RE.test(email)) errors.push("Correo inválido");
      else if (seen.has(email)) errors.push("Correo repetido en la lista");
      else if (existing.has(email)) errors.push("El correo ya existe");
      if (!password) errors.push("Contraseña vacía");
      else if (password.length < 6) errors.push("Contraseña de menos de 6 caracteres");
      seen.add(email);
      return { line, name, email, password, errors };
    });
}
