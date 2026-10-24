import type { Metadata } from "next";
import { SearchView } from "@/components/listings/search-page";
import { parseFilters } from "@/lib/listings/filters-url";
import { sampleResults } from "@/lib/sample";

export const metadata: Metadata = {
  title: "Ejemplo de resultados",
  robots: { index: false, follow: false },
};

/** Página testigo del listado con anuncios ficticios (sin base de datos). */
export default function ExampleResultsPage() {
  const filters = parseFilters("auto", ["nissan"], { precio_max: "350000", transmision: "manual" });
  const items = sampleResults();
  return (
    <SearchView filters={filters} items={items} total={134} favorites={new Set([items[1]!.id])} />
  );
}
