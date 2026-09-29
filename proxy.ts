// Next 16 renombró middleware.ts a proxy.ts. Primera barrera por rol; cada página vuelve a validar.
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, HOME, verifyToken, type Role } from "@/lib/auth";

const RULES: [string, Role[]][] = [
  ["/admin", ["ADMIN"]],
  ["/profesor", ["TEACHER"]],
  ["/alumnos", ["TEACHER", "ADMIN"]],
  ["/alumno", ["STUDENT"]],
  ["/intento", ["STUDENT", "TEACHER", "ADMIN"]],
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifyToken(req.cookies.get(COOKIE)?.value);
  const to = (p: string) => NextResponse.redirect(new URL(p, req.url));

  if (pathname === "/login") return session ? to(HOME[session.role]) : NextResponse.next();
  if (!session) return to("/login");
  if (pathname === "/") return to(HOME[session.role]);

  const rule = RULES.find(([p]) => pathname === p || pathname.startsWith(p + "/"));
  if (rule && !rule[1].includes(session.role)) return to(HOME[session.role]);
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|exams/|favicon.ico).*)"] };
