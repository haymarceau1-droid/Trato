"use client";

import Link from "next/link";
import { useState } from "react";
import { MAP_PATHS, MAP_VIEWBOX } from "@/lib/mexico-map";
import { MX_STATES, stateName } from "@/lib/constants";
import { STATE_BLURBS } from "@/lib/state-blurbs";
import { cn } from "@/lib/utils";
import { StateShape } from "@/components/ui/state-shape";

type Kind = "autos" | "motos";

/**
 * Mapa de México con los 32 estados clicables. Los estados con anuncios se tiñen de rojo;
 * al pasar o enfocar uno se muestra su nombre y cuántos anuncios hay.
 */
export function MexicoMap({ counts }: { counts: Record<string, number> }) {
  const [kind, setKind] = useState<Kind>("autos");
  const [hover, setHover] = useState<string | null>(null);
  // En pantalla táctil el primer toque solo elige el estado (muestra su ficha); el segundo, o el enlace de la ficha, abre la lista.
  const [picked, setPicked] = useState<string | null>(null);
  const active = hover ?? picked;
  const setActive = setHover;
  const max = Math.max(1, ...Object.values(counts));
  const shade = (slug: string) => {
    const n = counts[slug] ?? 0;
    if (!n) return "fill-border";
    const r = n / max;
    return r > 0.66 ? "fill-primary" : r > 0.33 ? "fill-primary/70" : "fill-primary/40";
  };
  const activeCount = active ? (counts[active] ?? 0) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
      <div>
        <svg
          viewBox={MAP_VIEWBOX}
          role="group"
          aria-label="Mapa de México: elige un estado"
          className="w-full"
          onMouseLeave={() => setActive(null)}
        >
          {MX_STATES.map((s) => (
            <Link
              key={s.slug}
              href={`/${kind}/${s.slug}`}
              aria-label={`${s.name}${counts[s.slug] ? `, ${counts[s.slug]} anuncios` : ""}`}
              onMouseEnter={() => setActive(s.slug)}
              onFocus={() => setActive(s.slug)}
              onBlur={() => setActive(null)}
              onClick={(e) => {
                if (window.matchMedia("(hover: none)").matches && picked !== s.slug) {
                  e.preventDefault();
                  setPicked(s.slug);
                }
              }}
            >
              <path
                d={MAP_PATHS[s.slug]}
                fillRule="evenodd"
                className={cn(
                  "stroke-background cursor-pointer transition-colors",
                  active === s.slug ? "fill-foreground" : shade(s.slug),
                )}
                strokeWidth={1.2}
                strokeLinejoin="round"
              />
            </Link>
          ))}
        </svg>
      </div>

      <div className="space-y-5">
        <div role="radiogroup" aria-label="Tipo de vehículo" className="flex">
          {(["autos", "motos"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={kind === k}
              onClick={() => setKind(k)}
              className={cn(
                "font-display min-h-11 px-6 text-lg tracking-wide uppercase",
                kind === k ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
              )}
            >
              {k}
            </button>
          ))}
        </div>

        <div
          className="border-border bg-card flex min-h-32 items-center gap-4 rounded-md border p-4"
          aria-live="polite"
        >
          {active ? (
            <>
              <StateShape slug={active} className="size-16" />
              <div>
                <p className="font-display text-2xl">{stateName(active)}</p>
                <p className="mt-1 text-sm">{STATE_BLURBS[active]}</p>
                <p className="text-muted-foreground text-sm">
                  {activeCount
                    ? `${activeCount} ${activeCount === 1 ? "anuncio" : "anuncios"} activos`
                    : "Sé el primero en publicar aquí"}
                </p>
                <Link
                  href={`/${kind}/${active}`}
                  className="text-primary mt-1 inline-flex min-h-11 items-center text-sm font-semibold underline"
                >
                  Ver {kind} en {stateName(active)}
                </Link>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">
              Pasa el cursor o toca un estado para ver {kind} usados en esa zona.
            </p>
          )}
        </div>

        <ul className="flex flex-wrap gap-x-4 text-sm">
          {MX_STATES.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/${kind}/${s.slug}`}
                className="hover:text-primary inline-flex min-h-11 items-center font-medium"
                onMouseEnter={() => setActive(s.slug)}
                onMouseLeave={() => setActive(null)}
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
