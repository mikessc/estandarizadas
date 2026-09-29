import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import StudentTable from "@/components/StudentTable";
import CreateUserForm from "@/components/CreateUserForm";
import BulkStudentsForm from "@/components/BulkStudentsForm";
import { resetPassword, setTeacher } from "../actions";

const ROLE = { ADMIN: "Admin", TEACHER: "Profesor", STUDENT: "Alumno" } as const;

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; profesor?: string }>;
}) {
  await requireRole("ADMIN");
  const sp = await searchParams;
  const tab = sp.tab === "alumnos" ? "alumnos" : "usuarios";
  const tabClass = (t: string) =>
    `flex-1 rounded-xl py-2 text-center font-semibold ${tab === t ? "bg-blue-600 text-white" : "bg-white border border-slate-300"}`;

  return (
    <div className="space-y-5">
      <nav className="flex gap-2">
        <Link href="/admin" className={tabClass("usuarios")}>
          Usuarios
        </Link>
        <Link href="/admin?tab=alumnos" className={tabClass("alumnos")}>
          Alumnos
        </Link>
      </nav>
      {tab === "usuarios" ? <Users profesor={sp.profesor ?? ""} /> : <Students />}
    </div>
  );
}

async function Students() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
    include: { attempts: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return <StudentTable students={students} />;
}

/** profesor: "" = todos los usuarios; "ninguno" = alumnos sin profesor; id = alumnos de ese profesor. */
async function Users({ profesor }: { profesor: string }) {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    include: { teacher: { select: { name: true } } },
  });
  const teachers = users.filter((u) => u.role === "TEACHER").map(({ id, name }) => ({ id, name }));
  const shown = profesor
    ? users.filter((u) => u.role === "STUDENT" && u.teacherId === (profesor === "ninguno" ? null : profesor))
    : users;
  return (
    <>
      <CreateUserForm teachers={teachers} />
      <BulkStudentsForm teachers={teachers} />
      <form className="flex gap-2" aria-label="Filtrar por profesor">
        <select name="profesor" defaultValue={profesor} className="input" aria-label="Profesor">
          <option value="">Todos los usuarios</option>
          <option value="ninguno">Alumnos sin profesor</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              Alumnos de {t.name}
            </option>
          ))}
        </select>
        <button className="btn-light shrink-0 !py-2">Filtrar</button>
      </form>
      {shown.length === 0 && <p className="text-slate-500">No hay usuarios con este filtro.</p>}
      <ul className="space-y-3">
        {shown.map((u) => (
          <li key={u.id} className="card space-y-2">
            <p>
              <span className="font-semibold">{u.name}</span>{" "}
              <span className="rounded-full bg-slate-100 px-2 text-base">{ROLE[u.role]}</span>
              <span className="block text-base text-slate-500">{u.email}</span>
              {u.role === "STUDENT" && (
                <span className="block text-base text-slate-500">Profesor: {u.teacher?.name ?? "Sin profesor"}</span>
              )}
            </p>
            {u.role === "STUDENT" && (
              <form action={setTeacher} className="flex gap-2">
                <input type="hidden" name="studentId" value={u.id} />
                <select name="teacherId" defaultValue={u.teacherId ?? ""} className="input" aria-label="Profesor">
                  <option value="">— Sin profesor —</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button className="btn-light shrink-0 !py-2">Guardar</button>
              </form>
            )}
            <form action={resetPassword} className="flex gap-2">
              <input type="hidden" name="userId" value={u.id} />
              <input name="password" required minLength={6} placeholder="Nueva contraseña" className="input" />
              <button className="btn-light shrink-0 !py-2">Restablecer</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
