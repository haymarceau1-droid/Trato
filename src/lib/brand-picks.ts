import { BRAND_LOGO_SLUGS } from "@/lib/brand-logos";
import { POPULAR_BRANDS, getCatalog } from "@/lib/catalog";
import type { VehicleType } from "@/lib/constants";

/**
 * Marcas que tienen logo SVG, para las rejillas y atajos con logo: primero las más populares
 * en México y luego el resto en orden alfabético. Las marcas sin logo siguen disponibles
 * en el buscador, el formulario y el catálogo completo.
 */
export function logoBrands(type: VehicleType, limit?: number): string[] {
  const withLogo = getCatalog(type)
    .filter((b) => BRAND_LOGO_SLUGS.has(b.slug))
    .map((b) => b.name);
  const popular = POPULAR_BRANDS[type].filter((n) => withLogo.includes(n));
  const rest = withLogo.filter((n) => !popular.includes(n));
  return [...popular, ...rest].slice(0, limit);
}
