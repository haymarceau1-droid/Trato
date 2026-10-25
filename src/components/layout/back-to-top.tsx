"use client";

import { useEffect, useState } from "react";

/** Botón "volver arriba": aparece al bajar un buen tramo y se aparta de las barras fijas de móvil. */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Volver arriba"
      tabIndex={show ? 0 : -1}
      onClick={() => {
        const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
      }}
      className={
        "bg-foreground text-background fixed right-4 bottom-20 z-30 grid size-12 place-items-center rounded-full shadow-xl transition-all duration-200 hover:opacity-90 md:right-6 md:bottom-6 [body:has(.sticky-actions)_&]:bottom-36 md:[body:has(.sticky-actions)_&]:bottom-6 " +
        (show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0")
      }
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-5"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
