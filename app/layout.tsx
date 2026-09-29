import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "katex/dist/katex.min.css";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Práctica Pruebas MEP" };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  return (
    <html lang="es">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="text-lg font-bold text-blue-700">
              📚 Práctica MEP
            </Link>
            {s && (
              <form action={logout} className="flex items-center gap-3 text-base">
                <span className="truncate text-slate-600">{s.name}</span>
                <Link href="/cuenta" className="shrink-0 text-blue-700 underline">
                  Mi cuenta
                </Link>
                <button className="rounded-lg px-2 py-1 text-blue-700 underline">Salir</button>
              </form>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-5">{children}</main>
      </body>
    </html>
  );
}
