import Link from "next/link";
import { BODY_TYPES, MOTO_TYPES } from "@/lib/constants";
import { logoBrands } from "@/lib/brand-picks";
import { buildUrl, type Filters } from "@/lib/listings/filters-url";
import { slugify } from "@/lib/listings/slug";
import { BodyIcon } from "@/components/ui/body-icon";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/lib/utils";

const chip =
  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-sm border px-3 text-sm font-semibold whitespace-nowrap";
const on = "border-foreground bg-foreground text-background";
const off = "border-border bg-card hover:border-foreground";

/** Atajos de un toque sobre el listado: marcas con logo y carrocería / tipo de moto. */
export function QuickFilters({ filters: f }: { filters: Filters }) {
  const types = f.type === "auto" ? BODY_TYPES : MOTO_TYPES;
  return (
    <div className="space-y-2">
      <ul aria-label="Marcas" className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {logoBrands(f.type, 14).map((name) => {
          const slug = slugify(name);
          const active = f.brand === slug;
          return (
            <li key={slug}>
              <Link
                href={buildUrl({
                  ...f,
                  brand: active ? undefined : slug,
                  model: undefined,
                  page: 1,
                })}
                aria-pressed={active}
                className={cn(chip, active ? on : off)}
              >
                <BrandLogo name={name} className="size-5" />
                {name}
              </Link>
            </li>
          );
        })}
      </ul>
      <ul
        aria-label={f.type === "auto" ? "Carrocería" : "Tipo de moto"}
        className="no-scrollbar flex gap-2 overflow-x-auto pb-1"
      >
        {types.map((t) => {
          const active = f.body === t.value;
          return (
            <li key={t.value}>
              <Link
                href={buildUrl({ ...f, body: active ? undefined : t.value, page: 1 })}
                aria-pressed={active}
                className={cn(chip, "font-medium", active ? on : off)}
              >
                <BodyIcon value={t.value} className="h-5 w-7" />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
