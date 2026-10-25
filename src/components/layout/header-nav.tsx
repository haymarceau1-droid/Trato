"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/autos", label: "Autos", match: ["/autos"] },
  { href: "/motos", label: "Motos", match: ["/motos"] },
  { href: "/consejos", label: "Consejos", match: ["/consejos"] },
  { href: "/como-vender", label: "Cómo vender", match: ["/como-vender"] },
  { href: "/precios", label: "Precios", match: ["/precios"] },
];

/**
 * Enlaces del menú. Un solo punto rojo se desliza (con un pequeño rebote) bajo el enlace al que
 * apuntas y vuelve a la sección actual al salir. Se mueve por DOM directo para no re-renderizar al pasar el ratón.
 */
export function HeaderNav() {
  const path = usePathname();
  const nav = useRef<HTMLElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  const activeIndex = links.findIndex((l) =>
    l.match.some((m) => path === m || path.startsWith(m + "/")),
  );

  const place = useCallback((i: number) => {
    const el = nav.current?.querySelectorAll("a")[i];
    const d = dot.current;
    if (!d) return;
    if (!el) {
      d.style.opacity = "0";
      d.style.scale = "0";
      return;
    }
    // La primera vez aparece en su sitio, sin deslizarse desde el borde.
    d.style.transition = placed.current
      ? "transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms, scale 300ms cubic-bezier(0.34, 1.56, 0.64, 1)"
      : "none";
    d.style.transform = `translateX(${el.offsetLeft + el.offsetWidth / 2 - 3}px)`;
    d.style.opacity = "1";
    d.style.scale = "1";
    placed.current = true;
  }, []);

  useEffect(() => {
    place(activeIndex);
    const ro = new ResizeObserver(() => place(activeIndex));
    if (nav.current) ro.observe(nav.current);
    return () => ro.disconnect();
  }, [activeIndex, place]);

  return (
    <nav
      ref={nav}
      aria-label="Principal"
      className="relative mx-auto hidden items-center gap-1 lg:flex"
      onMouseLeave={() => place(activeIndex)}
    >
      {links.map((l, i) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={i === activeIndex ? "page" : undefined}
          onMouseEnter={() => place(i)}
          onFocus={() => place(i)}
          onBlur={() => place(activeIndex)}
          className={cn(
            "px-4 py-2 text-sm font-semibold transition-[padding,color] group-data-[compact=true]/bar:px-3.5",
            i === activeIndex ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.label}
        </Link>
      ))}
      <span
        ref={dot}
        aria-hidden
        className="bg-primary pointer-events-none absolute top-full left-0 -mt-1.5 size-1.5 rounded-full opacity-0"
        style={{ scale: "0" }}
      />
    </nav>
  );
}
