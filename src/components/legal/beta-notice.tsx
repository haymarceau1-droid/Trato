"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";

const KEY = "trato:aviso-beta";
const EVENT = "trato:aviso-beta-change";

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

/** Ventana de bienvenida (una sola vez): avisa que la plataforma está en beta. */
export function BetaNotice() {
  // En el servidor se considera "visto" para no mostrarlo en el HTML inicial ni parpadear.
  const seen = useSyncExternalStore(subscribe, seenNow, () => true);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!seen) button.current?.focus();
  }, [seen]);
  if (seen) return null;

  const close = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* sin almacenamiento: se mostrará de nuevo */
    }
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onKeyDown={(e) => e.key === "Escape" && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="beta-title"
        className="border-foreground bg-card w-full max-w-md rounded-md border-2 p-6 shadow-2xl"
      >
        <p className="bg-primary text-primary-foreground inline-block rounded-sm px-2 py-1 text-xs font-semibold">
          Beta
        </p>
        <h2 id="beta-title" className="mt-3 text-2xl">
          Bienvenido a {brand.name}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Estamos en versión beta: la plataforma sigue en construcción, así que puede que algo no
          funcione perfecto o cambie de un día a otro. Si ves un error o tienes una idea, nos ayuda
          mucho que nos lo cuentes.
        </p>
        <Button ref={button} size="lg" className="mt-5 w-full" onClick={close}>
          Entendido, continuar
        </Button>
      </div>
    </div>
  );
}
