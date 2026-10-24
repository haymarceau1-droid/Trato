import { brand } from "@/config/brand";
import { VEHICLE_TYPES, BODY_TYPES, MOTO_TYPES, labelOf, stateName } from "@/lib/constants";
import type { Filters } from "@/lib/listings/filters-url";
import type { CatalogBrand } from "@/types";

const titleCase = (s: string) => s.replace(/-/g, " ").replace(/\b\p{L}/gu, (m) => m.toUpperCase());

/** Texto descriptivo de la búsqueda, p. ej. "Nissan Versa usados en Nuevo León". */
export function searchHeading(f: Filters, brands: CatalogBrand[]) {
  const plural = VEHICLE_TYPES.find((v) => v.value === f.type)!.plural;
  const b = brands.find((x) => x.slug === f.brand);
  const m = b?.models.find((x) => x.slug === f.model);
  const what = f.brand
    ? [b?.name ?? titleCase(f.brand), m?.name ?? (f.model ? titleCase(f.model) : "")]
        .filter(Boolean)
        .join(" ")
    : plural;
  const kind = f.body ? labelOf(f.type === "auto" ? BODY_TYPES : MOTO_TYPES, f.body) : "";
  const place = f.city
    ? `${titleCase(f.city)}, ${stateName(f.state)}`
    : f.state
      ? stateName(f.state)
      : "";
  const base = f.brand ? `${what} usados` : kind ? `${plural} ${kind} usados` : `${plural} usados`;
  return place ? `${base} en ${place}` : base;
}

export const searchDescription = (heading: string, total: number) =>
  `${total > 0 ? `${total} anuncios de` : "Encuentra"} ${heading.toLowerCase()} en ${brand.name}. Vendedores con teléfono verificado, sin comisiones y con consejos para comprar seguro.`;
