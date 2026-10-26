"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { countActiveFilters, type Filters } from "@/lib/listings/filters-url";
import type { CatalogBrand } from "@/types";
import dynamic from "next/dynamic";

// La ventana de filtros (histograma, rango de precio…) se descarga al primer uso.
const loadDialog = () => import("./filter-dialog").then((m) => m.FilterDialog);
const FilterDialog = dynamic(loadDialog);
import { SearchPill } from "./search-pill";

/**
 * Buscador a la Airbnb: barra con tres tramos y atajos por categoría en escritorio; en móvil, solo un
 * botón "Filtros" que abre la ventana con todo y contador en vivo.
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
  const [everOpened, setEverOpened] = useState(false);
  const openDialog = () => {
    setEverOpened(true);
    setOpen(true);
  };
  const active = countActiveFilters(filters);

  return (
    <div className="space-y-4">
      <SearchPill filters={filters} brands={brands} />

      <Button
        variant="outline"
        size="lg"
        onClick={openDialog}
        onPointerEnter={() => void loadDialog()}
        onFocus={() => void loadDialog()}
        className="w-full md:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden /> Filtros
        {active > 0 && (
          <span className="bg-primary text-primary-foreground grid size-5 place-items-center rounded-sm text-xs">
            {active}
          </span>
        )}
      </Button>

      <div className="hidden items-start gap-3 md:flex">
        <div className="min-w-0 flex-1">{children}</div>
        <Button
          variant="outline"
          onClick={openDialog}
          onPointerEnter={() => void loadDialog()}
          onFocus={() => void loadDialog()}
          className="shrink-0"
        >
          <SlidersHorizontal className="size-4" aria-hidden /> Filtros
          {active > 0 && (
            <span className="bg-primary text-primary-foreground grid size-5 place-items-center rounded-sm text-xs">
              {active}
            </span>
          )}
        </Button>
      </div>

      {everOpened && (
        <FilterDialog
          open={open}
          onClose={() => setOpen(false)}
          filters={filters}
          brands={brands}
        />
      )}
    </div>
  );
}
