"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "@phosphor-icons/react/dist/ssr";
import { BODY_TYPES, FUELS, MOTO_TYPES, MX_STATES, SORTS, TRANSMISSIONS } from "@/lib/constants";
import { buildUrl, type Filters } from "@/lib/listings/filters-url";
import { slugify } from "@/lib/listings/slug";
import type { CatalogBrand } from "@/types";
import { Button, buttonClass } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

const num = (v: string) => (v === "" ? undefined : Math.max(0, Math.floor(Number(v))) || undefined);

function FilterForm({
  filters,
  brands,
  onDone,
}: {
  filters: Filters;
  brands: CatalogBrand[];
  onDone?: () => void;
}) {
  const router = useRouter();
  const [f, setF] = useState<Filters>(filters);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((p) => ({ ...p, [k]: v }));
  const models = brands.find((b) => b.slug === f.brand)?.models ?? [];
  const bodyOptions = f.type === "auto" ? BODY_TYPES : MOTO_TYPES;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(buildUrl({ ...f, page: 1 }));
        onDone?.();
      }}
    >
      <Field label="Marca">
        <Select
          value={f.brand ?? ""}
          onChange={(e) =>
            setF((p) => ({ ...p, brand: e.target.value || undefined, model: undefined }))
          }
        >
          <option value="">Todas</option>
          {brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Modelo">
        <Select
          value={f.model ?? ""}
          disabled={!models.length}
          onChange={(e) => set("model", e.target.value || undefined)}
        >
          <option value="">Todos</option>
          {models.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Año desde">
          <Input
            type="number"
            inputMode="numeric"
            min={1950}
            value={f.yearMin ?? ""}
            onChange={(e) => set("yearMin", num(e.target.value))}
          />
        </Field>
        <Field label="Año hasta">
          <Input
            type="number"
            inputMode="numeric"
            min={1950}
            value={f.yearMax ?? ""}
            onChange={(e) => set("yearMax", num(e.target.value))}
          />
        </Field>
        <Field label="Precio mín. (MXN)">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={f.priceMin ?? ""}
            onChange={(e) => set("priceMin", num(e.target.value))}
          />
        </Field>
        <Field label="Precio máx. (MXN)">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={f.priceMax ?? ""}
            onChange={(e) => set("priceMax", num(e.target.value))}
          />
        </Field>
      </div>
      <Field label="Kilometraje máximo">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          value={f.kmMax ?? ""}
          onChange={(e) => set("kmMax", num(e.target.value))}
        />
      </Field>
      <Field label="Estado">
        <Select
          value={f.state ?? ""}
          onChange={(e) =>
            setF((p) => ({ ...p, state: e.target.value || undefined, city: undefined }))
          }
        >
          <option value="">Todo México</option>
          {MX_STATES.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Ciudad">
        <Input
          defaultValue={f.city?.replace(/-/g, " ") ?? ""}
          key={f.state ?? "all"}
          placeholder="Ej. Monterrey"
          onChange={(e) => set("city", slugify(e.target.value) || undefined)}
        />
      </Field>
      <Field label="Transmisión">
        <Select
          value={f.transmission ?? ""}
          onChange={(e) => set("transmission", e.target.value || undefined)}
        >
          <option value="">Cualquiera</option>
          {TRANSMISSIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Combustible">
        <Select value={f.fuel ?? ""} onChange={(e) => set("fuel", e.target.value || undefined)}>
          <option value="">Cualquiera</option>
          {FUELS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={f.type === "auto" ? "Carrocería" : "Tipo de moto"}>
        <Select value={f.body ?? ""} onChange={(e) => set("body", e.target.value || undefined)}>
          <option value="">Todas</option>
          {bodyOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>
      {f.type === "moto" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cilindrada mín. (cc)">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={f.ccMin ?? ""}
              onChange={(e) => set("ccMin", num(e.target.value))}
            />
          </Field>
          <Field label="Cilindrada máx. (cc)">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={f.ccMax ?? ""}
              onChange={(e) => set("ccMax", num(e.target.value))}
            />
          </Field>
        </div>
      )}
      <div className="bg-background sticky bottom-0 -mx-1 flex gap-2 px-1 py-3 lg:static lg:bg-transparent lg:p-0">
        <Button type="submit" className="flex-1">
          Ver resultados
        </Button>
        <a
          href={`/${f.type === "auto" ? "autos" : "motos"}`}
          className={buttonClass({ variant: "outline" })}
        >
          Limpiar
        </a>
      </div>
    </form>
  );
}

/** Botón + pantalla completa en móvil. */
export function MobileFilters({ filters, brands }: { filters: Filters; brands: CatalogBrand[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <Button variant="outline" className="lg:hidden" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="size-4" aria-hidden /> Filtros
      </Button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        aria-label="Filtros"
        className="bg-background text-foreground m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto p-4 backdrop:bg-black/50 lg:hidden"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Filtros</h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cerrar filtros"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </Button>
        </div>
        {open && <FilterForm filters={filters} brands={brands} onDone={() => setOpen(false)} />}
      </dialog>
    </>
  );
}

/** Panel lateral en escritorio. */
export function DesktopFilters({ filters, brands }: { filters: Filters; brands: CatalogBrand[] }) {
  return (
    <aside aria-label="Filtros" className="hidden w-64 shrink-0 lg:block">
      <h2 className="mb-4 text-lg font-bold">Filtros</h2>
      <FilterForm filters={filters} brands={brands} />
    </aside>
  );
}

export function SortSelect({ filters }: { filters: Filters }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only sm:not-sr-only">Ordenar</span>
      <Select
        className="min-h-11 w-auto"
        value={filters.sort}
        onChange={(e) =>
          router.push(buildUrl({ ...filters, sort: e.target.value as Filters["sort"], page: 1 }))
        }
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
    </label>
  );
}
