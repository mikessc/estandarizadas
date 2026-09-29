import { requireRole } from "@/lib/auth";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function Account() {
  const s = await requireRole("ADMIN", "TEACHER", "STUDENT");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mi cuenta</h1>
      <p className="text-slate-600">{s.name}</p>
      <ChangePasswordForm />
    </div>
  );
}
