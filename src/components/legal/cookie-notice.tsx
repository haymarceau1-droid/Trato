"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Button, buttonClass } from "@/components/ui/button";

const KEY = "trato:aviso-cookies";
const EVENT = "trato:aviso-cookies-change";

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
};
const seenNow = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Aviso informativo (no bloqueante): solo usamos cookies necesarias, así que no hay nada que aceptar o rechazar.
 * Si algún día se añaden cookies de análisis o publicidad, aquí debe pasar a ser un consentimiento previo (opt-in).
 */
export function CookieNotice() {
  // En el servidor se considera "visto" para no mostrarlo en el HTML inicial ni parpadear.
  const seen = useSyncExternalStore(subscribe, seenNow, () => true);
  if (seen) return null;

  const accept = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* sin almacenamiento: se mostrará de nuevo */
    }
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <section
      role="region"
      aria-labelledby="cookie-title"
      className="border-border bg-card cookie-in fixed right-3 bottom-[4.75rem] left-3 z-40 rounded-md border p-5 shadow-2xl md:right-auto md:bottom-4 md:left-4 md:w-[24rem]"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="bg-primary-soft text-primary grid size-10 shrink-0 place-items-center rounded-full"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
            <path d="M8.5 8.5v.01M16 15.5v.01M12 12v.01M11 17v.01M7 14v.01" />
          </svg>
        </span>
        <div className="min-w-0">
          <h2 id="cookie-title" className="text-lg leading-tight">
            Solo cookies necesarias
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Sin publicidad ni rastreo: guardamos lo mínimo para que el sitio funcione.
          </p>
        </div>
      </div>

      <details className="group mt-3 text-sm">
        <summary className="hover:text-primary flex min-h-9 cursor-pointer list-none items-center gap-1 font-semibold">
          Qué guardamos
          <span aria-hidden className="transition-transform group-open:rotate-90">
            ›
          </span>
        </summary>
        <ul className="text-muted-foreground mt-1 space-y-1.5 pl-1">
          <li>
            <strong className="text-foreground">Tu sesión:</strong> para que sigas conectado.
          </li>
          <li>
            <strong className="text-foreground">Tu borrador:</strong> si empiezas a publicar un
            anuncio, se guarda en tu navegador.
          </li>
          <li>
            <strong className="text-foreground">Tus ajustes:</strong> tema claro u oscuro y este
            aviso, para no repetirlo.
          </li>
        </ul>
      </details>

      <div className="mt-4 flex gap-2">
        <Button className="flex-1" onClick={accept}>
          Entendido
        </Button>
        <Link href="/cookies" className={buttonClass({ variant: "outline" })}>
          Política de cookies
        </Link>
      </div>
    </section>
  );
}
