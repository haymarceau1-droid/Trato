"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

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
  return (
    <section
      aria-label="Aviso de cookies"
      className="border-foreground bg-card fixed right-3 bottom-[4.75rem] left-3 z-40 rounded-md border-2 p-4 shadow-2xl md:right-auto md:bottom-4 md:left-4 md:max-w-sm"
    >
      <p className="text-sm">
        Usamos solo cookies necesarias para tu sesión y tu borrador. Sin publicidad ni rastreo.{" "}
        <Link href="/cookies" className="font-semibold underline">
          Más información
        </Link>
      </p>
      <Button
        className="mt-3 w-full"
        onClick={() => {
          try {
            localStorage.setItem(KEY, "1");
          } catch {
            /* sin almacenamiento: se mostrará de nuevo */
          }
          window.dispatchEvent(new Event(EVENT));
        }}
      >
        Entendido
      </Button>
    </section>
  );
}
