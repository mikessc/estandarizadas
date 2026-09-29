import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Role = "ADMIN" | "TEACHER" | "STUDENT";
export type Session = { id: string; name: string; role: Role };

export const COOKIE = "session";
const MAX_AGE = 60 * 60 * 24 * 30;
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export const HOME: Record<Role, string> = { ADMIN: "/admin", TEACHER: "/profesor", STUDENT: "/alumno" };

export async function verifyToken(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return { id: payload.sub!, name: payload.name as string, role: payload.role as Role };
  } catch {
    return null;
  }
}

export async function createSession(s: Session) {
  const token = await new SignJWT({ name: s.name, role: s.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(s.id)
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession() {
  return verifyToken((await cookies()).get(COOKIE)?.value);
}

/** Verificación en el servidor: el proxy es solo la primera barrera. */
export async function requireRole(...roles: Role[]): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/login");
  if (!roles.includes(s.role)) redirect(HOME[s.role]);
  return s;
}
