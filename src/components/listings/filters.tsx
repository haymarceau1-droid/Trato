"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CaretRight, SlidersHorizontal, X } from "@/components/ui/icons";
import {
  BODY_TYPES,
  FUELS,
  MOTO_TYPES,
  MX_STATES,
  PRICE_RANGES,
  SORTS,
  TRANSMISSIONS,
} from "@/lib/constants";
import { buildUrl, countActiveFilters, type Filters } from "@/lib/listings/filters-url";
import { slugify } from "@/lib/listings/slug";
import { formatKm } from "@/lib/format";
import type { CatalogBrand } from "@/types";
import { Button, buttonClass } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const num = (v: string) => (v === "" ? undefined : Math.max(0, Math.floor(Number(v))) || undefined);
const KM_PRESETS = [50_000, 100_000, 150_000, 200_000];

/** Sección plegable del panel de filtros. */
function Section({
  title,
  children,
  open = true,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="group border-border border-b py-4 first:pt-0">
      <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-sm font-bold">
        {title}
        <CaretRight
          className="text-muted-foreground size-4 transition-transform group-open:rotate-90"
          aria-hidden
        />
      </summary>
      <div className="space-y-3 pt-3">{children}</div>
    </details>
  );
}

/** Opciones de una sola elección, como botones que se pueden quitar con un segundo toque. */
function Chips<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | undefined;
  options: readonly { value: T; label: string }[];
  onChange: (v: T | undefined) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? undefined : o.value)}
            className={cn(
              "min-h-10 rounded-sm border px-3 text-sm font-semibold",
              on
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card hover:border-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Range({
  label,
  prefix,
  min,
  max,
  onMin,
  onMax,
  placeholders,
}: {
  label: string;
  prefix?: string;
  min?: number;
  max?: number;
  onMin: (v: number | undefined) => void;
  onMax: (v: number | undefined) => void;
  placeholders: [string, string];
}) {
  const cell = "relative flex-1";
  const pad = prefix ? "pl-7" : "";
  return (
    <div role="group" aria-label={label} className="flex items-center gap-2">
      {(
        [
          [min, onMin, placeholders[0], "Mínimo"],
          [max, onMax, placeholders[1], "Máximo"],
        ] as const
      ).map(([value, onChange, ph, aria]) => (
        <div key={aria} className={cell}>
          {prefix && (
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
              {prefix}
            </span>
          )}
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            aria-label={`${label} ${aria.toLowerCase()}`}
            placeholder={ph}
            value={value ?? ""}
            onChange={(e) => onChange(num(e.target.value))}
            className={pad}
          />
        </div>
      ))}
    </div>
  );
}

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
  const clearHref = `/${f.type === "auto" ? "autos" : "motos"}`;
  const pending = countActiveFilters(f);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(buildUrl({ ...f, page: 1 }));
        onDone?.();
      }}
    >
      <Section title="Marca y modelo">
        <Select
          aria-label="Marca"
          value={f.brand ?? ""}
          onChange={(e) =>
            setF((p) => ({ ...p, brand: e.target.value || undefined, model: undefined }))
          }
        >
          <option value="">Todas las marcas</option>
          {brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Modelo"
          value={f.model ?? ""}
          disabled={!models.length}
          onChange={(e) => set("model", e.target.value || undefined)}
        >
          <option value="">
            {models.length ? "Todos los modelos" : "Elige una marca primero"}
          </option>
          {models.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.name}
            </option>
          ))}
        </Select>
      </Section>

      <Section title="Precio (MXN)">
        <Range
          label="Precio"
          prefix="$"
          min={f.priceMin}
          max={f.priceMax}
          onMin={(v) => set("priceMin", v)}
          onMax={(v) => set("priceMax", v)}
          placeholders={["Desde", "Hasta"]}
        />
        <div role="group" aria-label="Rangos de precio" className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((r) => {
            const min = "min" in r ? r.min : undefined;
            const max = "max" in r ? r.max : undefined;
            const on = f.priceMin === min && f.priceMax === max;
            return (
              <button
                key={r.label}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setF((p) => ({
                    ...p,
                    priceMin: on ? undefined : min,
                    priceMax: on ? undefined : max,
                  }))
                }
                className={cn(
                  "min-h-9 rounded-sm border px-2.5 text-xs font-semibold",
                  on
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:border-foreground",
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Año">
        <Range
          label="Año"
          min={f.yearMin}
          max={f.yearMax}
          onMin={(v) => set("yearMin", v)}
          onMax={(v) => set("yearMax", v)}
          placeholders={["Desde", "Hasta"]}
        />
      </Section>

      <Section title="Kilometraje máximo">
        <Chips
          label="Kilometraje máximo"
          value={f.kmMax}
          options={KM_PRESETS.map((k) => ({ value: k, label: formatKm(k) }))}
          onChange={(v) => set("kmMax", v)}
        />
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          aria-label="Kilometraje máximo"
          placeholder="Otro valor, en km"
          value={f.kmMax ?? ""}
          onChange={(e) => set("kmMax", num(e.target.value))}
        />
      </Section>

      <Section title="Ubicación">
        <Select
          aria-label="Estado"
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
        <Input
          aria-label="Ciudad"
          defaultValue={f.city?.replace(/-/g, " ") ?? ""}
          key={f.state ?? "all"}
          placeholder="Ciudad (ej. Monterrey)"
          onChange={(e) => set("city", slugify(e.target.value) || undefined)}
        />
      </Section>

      <Section title={f.type === "auto" ? "Carrocería" : "Tipo de moto"}>
        <Chips
          label={f.type === "auto" ? "Carrocería" : "Tipo de moto"}
          value={f.body}
          options={bodyOptions}
          onChange={(v) => set("body", v)}
        />
        {f.type === "moto" && (
          <Range
            label="Cilindrada"
            min={f.ccMin}
            max={f.ccMax}
            onMin={(v) => set("ccMin", v)}
            onMax={(v) => set("ccMax", v)}
            placeholders={["cc desde", "cc hasta"]}
          />
        )}
      </Section>

      <Section title="Motor y transmisión">
        <Chips
          label="Transmisión"
          value={f.transmission}
          options={TRANSMISSIONS}
          onChange={(v) => set("transmission", v)}
        />
        <Chips
          label="Combustible"
          value={f.fuel}
          options={FUELS}
          onChange={(v) => set("fuel", v)}
        />
      </Section>

      <div className="bg-card sticky bottom-0 -mx-1 flex gap-2 px-1 pt-4 pb-1 lg:bg-transparent">
        <Button type="submit" className="flex-1">
          Aplicar{pending ? ` (${pending})` : ""}
        </Button>
        <a href={clearHref} className={buttonClass({ variant: "outline" })}>
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
  const active = countActiveFilters(filters);

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
        {active > 0 && (
          <span className="bg-primary text-primary-foreground grid size-5 place-items-center rounded-sm text-xs">
            {active}
          </span>
        )}
      </Button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        aria-label="Filtros"
        className="bg-background text-foreground m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto p-4 backdrop:bg-black/50 lg:hidden"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl">Filtros</h2>
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
    <aside
      aria-label="Filtros"
      className="border-border bg-card hidden max-h-[calc(100dvh-7rem)] w-72 shrink-0 self-start overflow-y-auto rounded-md border p-5 lg:sticky lg:top-24 lg:block"
    >
      <h2 className="mb-4 text-2xl">Filtros</h2>
      <FilterForm filters={filters} brands={brands} />
    </aside>
  );
}

export function SortSelect({ filters }: { filters: Filters }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only sm:not-sr-only">Ordenar por</span>
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
