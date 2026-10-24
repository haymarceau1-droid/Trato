"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { previewFilters } from "@/actions/search";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { StateShape } from "@/components/ui/state-shape";
import { logoBrands } from "@/lib/brand-picks";
import { MX_CITIES } from "@/lib/cities";
import { MX_STATES, PRICE_CAP, stateName } from "@/lib/constants";
import { formatMXN } from "@/lib/format";
import { buildUrl, type Filters } from "@/lib/listings/filters-url";
import { slugify } from "@/lib/listings/slug";
import type { CatalogBrand } from "@/types";
import { cn } from "@/lib/utils";
import { PriceRange } from "./price-range";

type Panel = "brand" | "where" | "price" | null;
const titleCase = (s: string) => s.replace(/-/g, " ").replace(/\b\p{L}/gu, (m) => m.toUpperCase());
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function priceLabel(f: Filters) {
  if (f.priceMin && f.priceMax) return `${formatMXN(f.priceMin)} – ${formatMXN(f.priceMax)}`;
  if (f.priceMax) return `Hasta ${formatMXN(f.priceMax)}`;
  if (f.priceMin) return `Desde ${formatMXN(f.priceMin)}`;
  return "Cualquier precio";
}

export function summary(f: Filters, brands: CatalogBrand[]) {
  const b = brands.find((x) => x.slug === f.brand);
  const m = b?.models.find((x) => x.slug === f.model);
  return {
    brand: b
      ? [b.name, m?.name].filter(Boolean).join(" ")
      : f.brand
        ? titleCase(f.brand)
        : "Cualquier marca",
    where: f.city ? titleCase(f.city) : f.state ? stateName(f.state) : "Todo México",
    price: priceLabel(f),
  };
}

function Segment({
  label,
  value,
  active,
  filled,
  onClick,
}: {
  label: string;
  value: string;
  active: boolean;
  filled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      className={cn(
        "min-w-0 flex-1 px-5 py-2.5 text-left transition-colors",
        active ? "bg-card shadow-[0_0_0_2px_var(--foreground)_inset]" : "hover:bg-muted",
      )}
    >
      <span className="block text-xs font-bold">{label}</span>
      <span
        className={cn(
          "block truncate text-sm",
          filled ? "text-foreground font-semibold" : "text-muted-foreground",
        )}
      >
        {value}
      </span>
    </button>
  );
}

function Tile({
  onClick,
  children,
  on,
}: {
  onClick: () => void;
  children: ReactNode;
  on?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-sm border p-2 text-center text-sm font-semibold",
        on
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:border-foreground",
      )}
    >
      {children}
    </button>
  );
}

/** Barra de búsqueda con tres tramos (marca, lugar, precio) y paneles que se abren debajo. */
export function SearchPill({ filters: f, brands }: { filters: Filters; brands: CatalogBrand[] }) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<{ min?: number; max?: number }>({});
  const [hist, setHist] = useState<number[]>(Array<number>(28).fill(0));
  const root = useRef<HTMLDivElement>(null);
  const s = summary(f, brands);
  const cap = PRICE_CAP[f.type];
  const go = (next: Partial<Filters>, close = true) => {
    router.push(buildUrl({ ...f, ...next, page: 1 }));
    setQuery("");
    if (close) setPanel(null);
  };

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggle = (p: Exclude<Panel, null>) => {
    setQuery("");
    setPanel((cur) => (cur === p ? null : p));
    if (p === "price") {
      setDraft({ min: f.priceMin, max: f.priceMax });
      previewFilters(f).then((r) => setHist(r.histogram));
    }
  };

  const brand = brands.find((b) => b.slug === f.brand);
  const q = norm(query);

  return (
    <div ref={root} className="relative hidden md:block">
      <div className="border-border bg-card flex divide-x divide-[var(--border)] overflow-hidden rounded-md border shadow-sm">
        <Segment
          label="Marca y modelo"
          value={s.brand}
          active={panel === "brand"}
          filled={!!f.brand}
          onClick={() => toggle("brand")}
        />
        <Segment
          label="Dónde"
          value={s.where}
          active={panel === "where"}
          filled={!!f.state}
          onClick={() => toggle("where")}
        />
        <Segment
          label="Precio"
          value={s.price}
          active={panel === "price"}
          filled={!!(f.priceMin || f.priceMax)}
          onClick={() => toggle("price")}
        />
      </div>

      {panel && (
        <div
          role="dialog"
          aria-label={
            panel === "brand"
              ? "Elegir marca y modelo"
              : panel === "where"
                ? "Elegir lugar"
                : "Elegir precio"
          }
          className="border-border bg-card absolute top-full right-0 left-0 z-30 mt-2 max-h-[28rem] overflow-y-auto rounded-md border p-5 shadow-2xl"
        >
          {panel === "brand" && (
            <div className="space-y-4">
              {brand ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-lg font-bold">
                      <BrandLogo name={brand.name} className="size-7" />
                      {brand.name}
                    </p>
                    <button
                      type="button"
                      className="text-sm font-semibold underline"
                      onClick={() => go({ brand: undefined, model: undefined }, false)}
                    >
                      Cambiar marca
                    </button>
                  </div>
                  <Input
                    autoFocus
                    placeholder="Buscar modelo"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Buscar modelo"
                  />
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    <Tile on={!f.model} onClick={() => go({ model: undefined })}>
                      Todos
                    </Tile>
                    {brand.models
                      .filter((m) => norm(m.name).includes(q))
                      .map((m) => (
                        <Tile
                          key={m.slug}
                          on={f.model === m.slug}
                          onClick={() => go({ model: m.slug })}
                        >
                          {m.name}
                        </Tile>
                      ))}
                  </div>
                </>
              ) : (
                <>
                  <Input
                    autoFocus
                    placeholder="Buscar marca (Nissan, Italika…)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Buscar marca"
                  />
                  {!q && (
                    <div>
                      <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-widest uppercase">
                        Populares
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                        {logoBrands(f.type, 12).map((name) => (
                          <Tile
                            key={name}
                            onClick={() => go({ brand: slugify(name), model: undefined }, false)}
                          >
                            <BrandLogo name={name} className="size-7" />
                            {name}
                          </Tile>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-widest uppercase">
                      {q ? "Resultados" : "Todas las marcas"}
                    </p>
                    <ul className="grid grid-cols-2 gap-x-4 sm:grid-cols-3 md:grid-cols-4">
                      {brands
                        .filter((b) => norm(b.name).includes(q))
                        .map((b) => (
                          <li key={b.slug}>
                            <button
                              type="button"
                              className="hover:text-primary w-full py-2 text-left text-sm font-medium"
                              onClick={() => go({ brand: b.slug, model: undefined }, false)}
                            >
                              {b.name}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {panel === "where" && (
            <div className="space-y-4">
              {f.state ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-lg font-bold">
                      <StateShape slug={f.state} className="size-8" />
                      {stateName(f.state)}
                    </p>
                    <button
                      type="button"
                      className="text-sm font-semibold underline"
                      onClick={() => go({ state: undefined, city: undefined }, false)}
                    >
                      Cambiar estado
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    <Tile on={!f.city} onClick={() => go({ city: undefined })}>
                      Todo el estado
                    </Tile>
                    {(MX_CITIES[f.state] ?? []).map((c) => (
                      <Tile
                        key={c}
                        on={f.city === slugify(c)}
                        onClick={() => go({ city: slugify(c) })}
                      >
                        {c}
                      </Tile>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <Input
                    autoFocus
                    placeholder="Buscar estado"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Buscar estado"
                  />
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {MX_STATES.filter((st) => norm(st.name).includes(q)).map((st) => (
                      <Tile
                        key={st.slug}
                        onClick={() => go({ state: st.slug, city: undefined }, false)}
                      >
                        <StateShape slug={st.slug} className="size-8" />
                        {st.name}
                      </Tile>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {panel === "price" && (
            <div className="mx-auto max-w-md space-y-4">
              <PriceRange
                min={draft.min}
                max={draft.max}
                cap={cap}
                step={f.type === "auto" ? 5_000 : 1_000}
                histogram={hist}
                onChange={(min, max) => setDraft({ min, max })}
              />
              <div className="flex justify-between gap-3">
                <Button
                  variant="ghost"
                  onClick={() => go({ priceMin: undefined, priceMax: undefined })}
                >
                  Quitar precio
                </Button>
                <Button onClick={() => go({ priceMin: draft.min, priceMax: draft.max })}>
                  Aplicar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
