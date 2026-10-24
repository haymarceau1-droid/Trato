"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { previewFilters } from "@/actions/search";
import { X } from "@/components/ui/icons";
import {
  BODY_TYPES,
  FUELS,
  MOTO_TYPES,
  MX_STATES,
  PRICE_CAP,
  TRANSMISSIONS,
} from "@/lib/constants";
import { formatKm } from "@/lib/format";
import { buildUrl, type Filters } from "@/lib/listings/filters-url";
import { slugify } from "@/lib/listings/slug";
import type { CatalogBrand } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { PriceRange } from "./price-range";

const KM_PRESETS = [50_000, 100_000, 150_000, 200_000];
const YEAR_PRESETS = [2022, 2020, 2018, 2015, 2010];
const num = (v: string) => (v === "" ? undefined : Math.max(0, Math.floor(Number(v))) || undefined);

function Block({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="border-border border-b py-6 first:pt-0 last:border-b-0">
      <h3 className="text-xl">{title}</h3>
      {hint && <p className="text-muted-foreground mt-1 text-sm">{hint}</p>}
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

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
              "min-h-11 rounded-sm border px-4 text-sm font-semibold",
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

export function FilterDialog({
  open,
  onClose,
  filters,
  brands,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  brands: CatalogBrand[];
}) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const [f, setF] = useState<Filters>(filters);
  const [preview, setPreview] = useState<{ count: number; histogram: number[] } | null>(null);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((p) => ({ ...p, [k]: v }));
  const cap = PRICE_CAP[f.type];
  const models = brands.find((b) => b.slug === f.brand)?.models ?? [];

  // Abre/cierra el <dialog> nativo y parte siempre de los filtros de la URL.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setF(filters);
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open, filters]);

  // Contador en vivo (con pausa de 300 ms para no saturar mientras mueves el control).
  useEffect(() => {
    if (!open) return;
    let alive = true;
    const t = setTimeout(() => {
      previewFilters(f).then(
        (r) => alive && setPreview({ count: r.count, histogram: r.histogram }),
      );
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [f, open]);

  const count = preview?.count;
  const clearAll: Filters = { type: f.type, sort: f.sort, page: 1 };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label="Filtros"
      className="bg-background text-foreground m-0 h-dvh max-h-none w-screen max-w-none p-0 backdrop:bg-black/50 md:m-auto md:h-auto md:max-h-[88dvh] md:w-[min(42rem,92vw)] md:rounded-md"
    >
      <form
        className="flex h-dvh flex-col md:h-auto md:max-h-[88dvh]"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(buildUrl({ ...f, page: 1 }));
          onClose();
        }}
      >
        <header className="border-border flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-2xl">Filtros</h2>
          <Button variant="ghost" size="icon" aria-label="Cerrar filtros" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <Block
            title="Rango de precio"
            hint="Moviendo los controles ves cuántos hay en cada tramo."
          >
            <PriceRange
              min={f.priceMin}
              max={f.priceMax}
              cap={cap}
              step={f.type === "auto" ? 5_000 : 1_000}
              histogram={preview?.histogram ?? Array<number>(28).fill(0)}
              onChange={(a, b) => setF((p) => ({ ...p, priceMin: a, priceMax: b }))}
            />
          </Block>

          <Block title="Kilometraje máximo">
            <Chips
              label="Kilometraje máximo"
              value={f.kmMax}
              options={KM_PRESETS.map((k) => ({ value: k, label: formatKm(k) }))}
              onChange={(v) => set("kmMax", v)}
            />
          </Block>

          <Block title="Año">
            <Chips
              label="Año mínimo"
              value={f.yearMin}
              options={YEAR_PRESETS.map((y) => ({ value: y, label: `${y} o más nuevo` }))}
              onChange={(v) => set("yearMin", v)}
            />
          </Block>

          <Block title={f.type === "auto" ? "Carrocería" : "Tipo de moto"}>
            <Chips
              label={f.type === "auto" ? "Carrocería" : "Tipo de moto"}
              value={f.body}
              options={f.type === "auto" ? BODY_TYPES : MOTO_TYPES}
              onChange={(v) => set("body", v)}
            />
            {f.type === "moto" && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  aria-label="Cilindrada mínima"
                  placeholder="cc desde"
                  value={f.ccMin ?? ""}
                  onChange={(e) => set("ccMin", num(e.target.value))}
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  aria-label="Cilindrada máxima"
                  placeholder="cc hasta"
                  value={f.ccMax ?? ""}
                  onChange={(e) => set("ccMax", num(e.target.value))}
                />
              </div>
            )}
          </Block>

          <Block title="Transmisión">
            <Chips
              label="Transmisión"
              value={f.transmission}
              options={TRANSMISSIONS}
              onChange={(v) => set("transmission", v)}
            />
          </Block>

          <Block title="Combustible">
            <Chips
              label="Combustible"
              value={f.fuel}
              options={FUELS}
              onChange={(v) => set("fuel", v)}
            />
          </Block>

          <Block title="Marca y modelo">
            <div className="grid gap-3 sm:grid-cols-2">
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
                <option value="">{models.length ? "Todos los modelos" : "Elige una marca"}</option>
                {models.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>
          </Block>

          <Block title="Ubicación">
            <div className="grid gap-3 sm:grid-cols-2">
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
            </div>
          </Block>
        </div>

        <footer className="border-border bg-card flex items-center justify-between gap-3 border-t px-5 py-4 md:rounded-b-md">
          <button
            type="button"
            className="min-h-11 px-1 text-sm font-semibold underline underline-offset-4"
            onClick={() => setF(clearAll)}
          >
            Borrar todo
          </button>
          <Button type="submit" size="lg" disabled={count === 0}>
            {count === undefined
              ? "Mostrar resultados"
              : count === 0
                ? "Sin resultados"
                : `Mostrar ${count.toLocaleString("es-MX")} ${count === 1 ? "vehículo" : "vehículos"}`}
          </Button>
        </footer>
      </form>
    </dialog>
  );
}
