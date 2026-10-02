import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "katex/dist/katex.min.css";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Práctica Pruebas MEP" };
const ICON = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  return (
    <html lang="es">
      <body>
        <header className="bg-blue-600 text-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="text-lg font-bold">
              📚 Práctica MEP
            </Link>
            {s && (
              <form action={logout} className="flex items-center gap-1">
                <Link href="/cuenta" className="p-2 hover:text-mep-gold" aria-label="Mi cuenta" title="Mi cuenta">
                  <svg {...ICON}>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                </Link>
                <button className="p-2 hover:text-mep-gold" aria-label="Salir" title="Salir">
                  <svg {...ICON}>
                    <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-5">{children}</main>
      </body>
    </html>
  );
}
