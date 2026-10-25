import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";
import { BodyIcon } from "@/components/ui/body-icon";
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
 * Dos paneles tipo cartel: al pasar el ratón el panel se ensancha, se tiñe de rojo y el vehículo "arranca".
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
                "group/panel relative isolate flex min-h-[22rem] flex-1 flex-col justify-between overflow-hidden rounded-md p-6 transition-[flex-grow,background-color,color] duration-500 ease-out md:min-h-0 md:p-8",
                "hover:bg-primary hover:text-primary-foreground focus-within:bg-primary focus-within:text-primary-foreground md:focus-within:grow-[1.45] md:hover:grow-[1.45]",
                d.dark ? "theme-dark bg-background text-foreground" : "bg-card text-foreground",
              )}
            >
              {/* Vehículo de fondo: arranca al pasar el ratón */}
              <BodyIcon
                value={d.icon}
                className="absolute top-20 -right-6 -z-10 h-36 w-48 opacity-[0.08] transition-all duration-700 ease-out group-focus-within/panel:-translate-x-10 group-focus-within/panel:opacity-30 group-hover/panel:-translate-x-10 group-hover/panel:opacity-30 md:top-auto md:-right-8 md:h-60 md:w-80 md:opacity-[0.12]"
              />

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
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-sm border border-current/30 px-2.5 text-sm font-semibold hover:border-current"
                      >
                        <BodyIcon value={t.value} className="h-3.5 w-5" />
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
                          className="block hover:opacity-100"
                        >
                          <BrandLogo name={name} className="size-6" />
                          <span className="sr-only">{name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <span
                    aria-hidden
                    className="bg-foreground text-background group-hover/panel:bg-background group-hover/panel:text-foreground inline-flex h-14 shrink-0 items-center gap-2 rounded-full pr-4 pl-5 font-semibold transition-colors"
                  >
                    {d.cta}
                    <ArrowUpRight className="size-5 transition-transform duration-300 group-hover/panel:translate-x-0.5 group-hover/panel:-translate-y-0.5" />
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
