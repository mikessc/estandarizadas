import { redirect } from "next/navigation";
import { HOME, getSession } from "@/lib/auth";

export default async function Home() {
  const s = await getSession();
  redirect(s ? HOME[s.role] : "/login");
}
