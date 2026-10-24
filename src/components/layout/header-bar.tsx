"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Barra flotante: se estrecha un poco al bajar y se despliega al subir o al llegar arriba.
 * El contenedor (header.tsx) tiene altura fija, así que cambiar de tamaño no mueve la página:
 * eso evitaba el parpadeo (el cambio de altura provocaba otro scroll que lo revertía).
 */
export function HeaderBar({ children }: { children: ReactNode }) {
  const [compact, setCompact] = useState(false);
  const last = useRef(0);
  const acc = useRef(0);
  const lockedUntil = useRef(0);

  useEffect(() => {
    last.current = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - last.current;
        last.current = y;

        if (y < 48) {
          acc.current = 0;
          setCompact(false);
          return;
        }
        // Acumula el desplazamiento en una misma dirección; al invertirse, reinicia.
        acc.current = Math.sign(delta) === Math.sign(acc.current) ? acc.current + delta : delta;
        if (performance.now() < lockedUntil.current) return;
        if (acc.current > 40) {
          setCompact(true);
          lockedUntil.current = performance.now() + 350;
          acc.current = 0;
        } else if (acc.current < -40) {
          setCompact(false);
          lockedUntil.current = performance.now() + 350;
          acc.current = 0;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      data-compact={compact}
      className={cn(
        "group/bar theme-dark bg-background/95 text-foreground pointer-events-auto mx-auto flex items-center gap-2 rounded-md border border-white/10 py-1 pr-1.5 pl-4 shadow-2xl ring-1 shadow-black/30 ring-black/40 backdrop-blur-xl",
        "transition-[max-width,height] duration-300 ease-out md:pr-2 md:pl-5",
        compact ? "h-14 max-w-[60rem] md:h-14" : "h-14 max-w-5xl md:h-16",
      )}
    >
      {children}
    </div>
  );
}
