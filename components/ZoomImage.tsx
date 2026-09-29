"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ZoomImage({ src, alt = "" }: { src?: string; alt?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  if (!src) return null;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        title="Toca para ampliar"
        onClick={() => setOpen(true)}
        className="mx-auto my-3 block h-auto max-w-full cursor-zoom-in rounded-lg bg-white"
      />
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-label={alt || "Imagen ampliada"}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/85 p-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="max-h-full max-w-full rounded bg-white" />
            <button className="absolute right-3 top-3 rounded-full bg-white px-4 py-2 text-xl font-bold" aria-label="Cerrar">
              ✕
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
