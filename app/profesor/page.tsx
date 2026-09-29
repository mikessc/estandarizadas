import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import StudentTable from "@/components/StudentTable";
import CreateUserForm from "@/components/CreateUserForm";

export default async function TeacherHome() {
  const s = await requireRole("TEACHER");
  const students = await prisma.user.findMany({
    where: { role: "STUDENT", teacherId: s.id },
    orderBy: { name: "asc" },
    include: { attempts: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return (
    <div className="space-y-6">
      <section>
        <h1 className="mb-3 text-2xl font-bold">Mis alumnos</h1>
        <StudentTable students={students} />
      </section>
      <CreateUserForm />
    </div>
  );
}
