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
    hint: "Sedanes, SUV, pickups y vans de particulares.",
    cta: "Ver todos los autos",
    icon: "sedan",
    types: BODY_TYPES,
    dark: false,
  },
  {
    type: "moto",
    href: "/motos",
    title: "Motos",
    hint: "Scooters, de trabajo, deportivas y choppers.",
    cta: "Ver todas las motos",
    icon: "chopper",
    types: MOTO_TYPES,
    dark: true,
  },
] as const;

/** Dos puertas de entrada: cada tarjeta enseña cuántos hay, los tipos con su silueta y las marcas con logo. */
export function VehicleDoors({ counts }: { counts: { auto: number; moto: number } }) {
  return (
    <section className="container-page grid gap-4 pb-14 md:grid-cols-2" aria-label="Autos y motos">
      {DOORS.map((d) => {
        const base = parseFilters(d.type);
        const n = counts[d.type];
        return (
          <article
            key={d.type}
            className={cn(
              "relative flex flex-col overflow-hidden rounded-md border-2 p-6 md:p-8",
              d.dark
                ? "theme-dark bg-background text-foreground border-[#0a0a0a]"
                : "border-border bg-card text-foreground",
            )}
          >
            <BodyIcon
              value={d.icon}
              className="text-foreground/[0.06] pointer-events-none absolute -top-4 -right-6 h-48 w-60"
            />
            <div className="relative flex items-start justify-between gap-4">
              <h2 className="text-6xl leading-[0.85] uppercase md:text-7xl">
                <Link href={d.href} className="hover:text-primary transition-colors">
                  {d.title}
                </Link>
              </h2>
              {n > 0 && (
                <p className="border-border bg-background/60 mt-1 shrink-0 rounded-sm border px-2.5 py-1 text-sm font-semibold">
                  {n.toLocaleString("es-MX")} disponibles
                </p>
              )}
            </div>
            <p className="text-muted-foreground relative mt-3 max-w-xs">{d.hint}</p>

            <ul
              aria-label={`Tipos de ${d.title.toLowerCase()}`}
              className="relative mt-6 flex flex-wrap gap-2"
            >
              {d.types.map((t) => (
                <li key={t.value}>
                  <Link
                    href={buildUrl({ ...base, body: t.value })}
                    className="border-border hover:border-foreground bg-background/40 inline-flex min-h-11 items-center gap-2 rounded-sm border px-3 text-sm font-semibold transition-colors"
                  >
                    <BodyIcon value={t.value} className="h-4 w-6" />
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>

            <ul
              aria-label={`Marcas de ${d.title.toLowerCase()}`}
              className="text-muted-foreground relative mt-6 flex flex-wrap items-center gap-x-5 gap-y-3"
            >
              {logoBrands(d.type, 7).map((name) => (
                <li key={name} title={name}>
                  <Link
                    href={buildUrl({ ...base, brand: slugify(name) })}
                    className="hover:text-foreground block transition-colors"
                  >
                    <BrandLogo name={name} className="size-7" />
                    <span className="sr-only">{name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="min-h-8 flex-1" />
            <Link
              href={d.href}
              className="bg-primary text-primary-foreground group relative inline-flex min-h-12 items-center justify-between gap-3 self-start rounded-sm px-5 font-semibold hover:opacity-90"
            >
              {d.cta}
              <ArrowUpRight
                className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </Link>
          </article>
        );
      })}
    </section>
  );
}
