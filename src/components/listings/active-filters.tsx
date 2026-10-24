import Link from "next/link";
import { X } from "@/components/ui/icons";
import { BODY_TYPES, FUELS, MOTO_TYPES, TRANSMISSIONS, labelOf, stateName } from "@/lib/constants";
import { formatMXN, formatKm } from "@/lib/format";
import { buildUrl, type Filters } from "@/lib/listings/filters-url";
import type { CatalogBrand } from "@/types";

const titleCase = (s: string) => s.replace(/-/g, " ").replace(/\b\p{L}/gu, (m) => m.toUpperCase());

/** Filtros aplicados como etiquetas que se quitan con un toque. */
export function ActiveFilters({
  filters: f,
  brands,
}: {
  filters: Filters;
  brands: CatalogBrand[];
}) {
  const brand = brands.find((b) => b.slug === f.brand);
  const chips: { label: string; without: Partial<Filters> }[] = [];
  if (f.q) chips.push({ label: `“${f.q}”`, without: { q: undefined } });
  if (f.brand)
    chips.push({
      label: brand?.name ?? titleCase(f.brand),
      without: { brand: undefined, model: undefined },
    });
  if (f.model)
    chips.push({
      label: brand?.models.find((m) => m.slug === f.model)?.name ?? titleCase(f.model),
      without: { model: undefined },
    });
  if (f.state)
    chips.push({ label: stateName(f.state), without: { state: undefined, city: undefined } });
  if (f.city) chips.push({ label: titleCase(f.city), without: { city: undefined } });
  if (f.body)
    chips.push({
      label: labelOf(f.type === "auto" ? BODY_TYPES : MOTO_TYPES, f.body),
      without: { body: undefined },
    });
  if (f.yearMin || f.yearMax)
    chips.push({
      label: `Año ${f.yearMin ?? "…"}–${f.yearMax ?? "…"}`,
      without: { yearMin: undefined, yearMax: undefined },
    });
  if (f.priceMin || f.priceMax)
    chips.push({
      label: `${f.priceMin ? formatMXN(f.priceMin) : "Hasta"}${f.priceMax ? ` – ${formatMXN(f.priceMax)}` : "+"}`,
      without: { priceMin: undefined, priceMax: undefined },
    });
  if (f.kmMax) chips.push({ label: `Hasta ${formatKm(f.kmMax)}`, without: { kmMax: undefined } });
  if (f.ccMin || f.ccMax)
    chips.push({
      label: `${f.ccMin ?? 0}–${f.ccMax ?? "…"} cc`,
      without: { ccMin: undefined, ccMax: undefined },
    });
  if (f.transmission)
    chips.push({
      label: labelOf(TRANSMISSIONS, f.transmission),
      without: { transmission: undefined },
    });
  if (f.fuel) chips.push({ label: labelOf(FUELS, f.fuel), without: { fuel: undefined } });
  if (!chips.length) return null;

  return (
    <ul aria-label="Filtros aplicados" className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <li key={c.label}>
          <Link
            href={buildUrl({ ...f, ...c.without, page: 1 })}
            aria-label={`Quitar filtro ${c.label}`}
            className="bg-foreground text-background inline-flex min-h-11 items-center gap-1.5 rounded-sm px-3 text-sm font-semibold"
          >
            {c.label}
            <X className="size-4" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
