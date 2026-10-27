import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";
import { BodyIcon } from "@/components/ui/body-icon";
import { buttonClass } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { BODY_TYPES, MOTO_TYPES } from "@/lib/constants";
import { logoBrands } from "@/lib/brand-picks";
import { buildUrl, parseFilters } from "@/lib/listings/filters-url";
import { slugify } from "@/lib/listings/slug";
import { cn } from "@/lib/utils";

const DOORS = [
  {
    type: "auto",
    href: "/autos",
    title: "Autos",
    cta: "Ver autos",
    tagline: "Para la familia, el trabajo y el fin de semana.",
    icon: "sedan",
    types: BODY_TYPES,
    dark: false,
  },
  {
    type: "moto",
    href: "/motos",
    title: "Motos",
    cta: "Ver motos",
    tagline: "Para moverte rápido y llegar a tiempo.",
    icon: "chopper",
    types: MOTO_TYPES,
    dark: true,
  },
] as const;

/**
 * Dos paneles tipo cartel: al pasar el ratón el panel se ensancha, se marca con el rojo de la marca y aparecen los tipos.
 * Todo el panel es un enlace; los tipos y marcas son accesos directos por encima.
 */
export function VehicleDoors({ counts }: { counts: { auto: number; moto: number } }) {
  return (
    <section className="container-page pb-14" aria-label="Autos y motos">
      <div className="flex flex-col gap-3 md:h-[30rem] md:flex-row">
        {DOORS.map((d) => {
          const base = parseFilters(d.type);
          const n = counts[d.type];
          return (
            <article
              key={d.type}
              className={cn(
                "group/panel relative isolate flex min-h-[22rem] flex-1 flex-col justify-between overflow-hidden rounded-md border-2 p-6 transition-[flex-grow,border-color] duration-500 ease-out md:min-h-0 md:p-8",
                "hover:border-primary focus-within:border-primary md:focus-within:grow-[1.45] md:hover:grow-[1.45]",
                d.dark
                  ? "theme-dark bg-background text-foreground border-[#0a0a0a]"
                  : "border-border bg-card text-foreground",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-7xl leading-[0.85] uppercase md:text-8xl">
                  <Link
                    href={d.href}
                    className="after:absolute after:inset-0 after:z-0 focus-visible:outline-none"
                  >
                    {d.title}
                  </Link>
                </h2>
                {n > 0 && (
                  <p className="text-right">
                    <span className="font-display block text-4xl leading-none md:text-5xl">
                      {n.toLocaleString("es-MX")}
                    </span>
                    <span className="text-sm opacity-70">disponibles</span>
                  </p>
                )}
              </div>

              <div className="relative z-10 space-y-5">
                <p className="max-w-[15rem] text-lg font-medium">{d.tagline}</p>

                <ul
                  aria-label={`Tipos de ${d.title.toLowerCase()}`}
                  className="flex flex-wrap gap-1.5 transition-opacity duration-300 md:opacity-0 md:group-focus-within/panel:opacity-100 md:group-hover/panel:opacity-100 [@media(hover:none)]:opacity-100"
                >
                  {d.types.slice(0, 6).map((t, i) => (
                    <li key={t.value} className={i >= 4 ? "hidden md:block" : undefined}>
                      <Link
                        href={buildUrl({ ...base, body: t.value })}
                        className="border-border bg-card/50 hover:border-foreground inline-flex min-h-11 items-center gap-1.5 rounded-sm border px-2.5 text-sm font-semibold"
                      >
                        <BodyIcon value={t.value} className="h-4 w-6" />
                        {t.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="flex items-end justify-between gap-4">
                  <ul
                    aria-label={`Marcas de ${d.title.toLowerCase()}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 opacity-70"
                  >
                    {logoBrands(d.type, 5).map((name, i) => (
                      <li
                        key={name}
                        title={name}
                        className={i >= 3 ? "hidden md:block" : undefined}
                      >
                        <Link
                          href={buildUrl({ ...base, brand: slugify(name) })}
                          className="flex size-11 items-center justify-center hover:opacity-100"
                        >
                          <BrandLogo name={name} className="size-6" />
                          <span className="sr-only">{name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href={d.href} className={buttonClass({ size: "lg" }, "shrink-0")}>
                    {d.cta}
                    <ArrowUpRight className="size-5" aria-hidden />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
