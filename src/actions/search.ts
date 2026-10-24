"use server";

import { normalizeFilters, type Filters } from "@/lib/listings/filters-url";
import { PRICE_CAP } from "@/lib/constants";
import { previewFilters as preview } from "@/lib/listings/queries";

/** Resultados y distribución de precios para la ventana de filtros (se actualiza mientras eliges). */
export async function previewFilters(input: Filters) {
  const f = normalizeFilters(input);
  return { cap: PRICE_CAP[f.type], ...(await preview(f, PRICE_CAP[f.type])) };
}
