"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Barra flotante: se estrecha un poco y baja de altura al bajar; se despliega al subir
 * o al llegar arriba del todo. El menú sigue visible en ambos estados.
 */
export function HeaderBar({ children }: { children: ReactNode }) {
  const [compact, setCompact] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    last.current = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - last.current;
        if (y < 48) setCompact(false);
        else if (delta > 6) setCompact(true);
        else if (delta < -6) setCompact(false);
        if (Math.abs(delta) > 6 || y < 48) last.current = y;
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
        compact ? "h-12 max-w-4xl" : "h-14 max-w-5xl md:h-16",
      )}
    >
      {children}
    </div>
  );
}
