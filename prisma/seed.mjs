import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("Faltan ADMIN_EMAIL y ADMIN_PASSWORD");

const prisma = new PrismaClient();
const email = ADMIN_EMAIL.trim().toLowerCase();
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
await prisma.user.upsert({
  where: { email },
  update: { passwordHash, role: "ADMIN" },
  create: { email, passwordHash, role: "ADMIN", name: "Administrador" },
});
console.log(`Admin listo: ${email}`);
await prisma.$disconnect();
