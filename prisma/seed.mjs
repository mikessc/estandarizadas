import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// `vercel env pull` escribe "[Sensitive]" en lugar del valor real de las variables sensibles.
for (const k of ["STORAGE_DATABASE_URL", "STORAGE_DATABASE_URL_UNPOOLED", "ADMIN_EMAIL", "ADMIN_PASSWORD"]) {
  const v = process.env[k];
  if (!v || v.startsWith("["))
    throw new Error(`${k} falta o no tiene su valor real en .env.local (Vercel no descarga variables sensibles).`);
}

const prisma = new PrismaClient();
const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
// Si ya existe, restablece la contraseña a ADMIN_PASSWORD.
await prisma.user.upsert({
  where: { email },
  update: { passwordHash, role: "ADMIN" },
  create: { email, passwordHash, role: "ADMIN", name: "Administrador" },
});
const admin = await prisma.user.findUniqueOrThrow({ where: { email }, select: { email: true, role: true } });
const host = new URL(process.env.STORAGE_DATABASE_URL).host;
console.log(`Admin listo en ${host}: ${admin.email} (${admin.role})`);
await prisma.$disconnect();
