"use client";

import { useState, type ReactNode } from "react";
import { MagnifyingGlass, SlidersHorizontal } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { countActiveFilters, type Filters } from "@/lib/listings/filters-url";
import type { CatalogBrand } from "@/types";
import { FilterDialog } from "./filter-dialog";
import { SearchPill, summary } from "./search-pill";

/**
 * Buscador a la Airbnb: barra con tres tramos (escritorio) o resumen tocable (móvil),
 * atajos por categoría y un botón "Filtros" que abre la ventana con todo y contador en vivo.
 */
export function FilterBar({
  filters,
  brands,
  children,
}: {
  filters: Filters;
  brands: CatalogBrand[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const s = summary(filters, brands);
  const active = countActiveFilters(filters);

  return (
    <div className="space-y-4">
      <SearchPill filters={filters} brands={brands} />

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-border bg-card flex w-full items-center gap-3 rounded-md border p-3 text-left shadow-sm md:hidden"
      >
        <MagnifyingGlass className="size-6 shrink-0" aria-hidden />
        <span className="min-w-0">
          <span className="block truncate font-bold">
            {s.brand} · {s.where}
          </span>
          <span className="text-muted-foreground block truncate text-sm">{s.price}</span>
        </span>
      </button>

      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">{children}</div>
        <Button variant="outline" onClick={() => setOpen(true)} className="shrink-0">
          <SlidersHorizontal className="size-4" aria-hidden /> Filtros
          {active > 0 && (
            <span className="bg-primary text-primary-foreground grid size-5 place-items-center rounded-sm text-xs">
              {active}
            </span>
          )}
        </Button>
      </div>

      <FilterDialog open={open} onClose={() => setOpen(false)} filters={filters} brands={brands} />
    </div>
  );
}
