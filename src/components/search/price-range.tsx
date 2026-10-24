"use client";

import { formatMXN } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Selector de precio con histograma: las barras muestran cuántos anuncios hay en cada tramo
 * y se pintan de rojo dentro del rango elegido.
 */
export function PriceRange({
  min,
  max,
  cap,
  step,
  histogram,
  onChange,
}: {
  min?: number;
  max?: number;
  cap: number;
  step: number;
  histogram: number[];
  onChange: (min: number | undefined, max: number | undefined) => void;
}) {
  const lo = Math.min(min ?? 0, cap);
  const hi = Math.min(max ?? cap, cap);
  const peak = Math.max(1, ...histogram);
  const emit = (a: number, b: number) => onChange(a <= 0 ? undefined : a, b >= cap ? undefined : b);
  const pct = (v: number) => `${(v / cap) * 100}%`;

  return (
    <div>
      <div aria-hidden className="flex h-16 items-end gap-px">
        {histogram.map((n, i) => {
          const from = (i / histogram.length) * cap;
          const inside = from + cap / histogram.length > lo && from < hi;
          return (
            <span
              key={i}
              className={cn("flex-1 rounded-t-sm", inside ? "bg-primary" : "bg-border")}
              style={{ height: `${Math.max(4, (n / peak) * 100)}%` }}
            />
          );
        })}
      </div>

      <div className="dual-range relative mt-1 h-10">
        <span
          aria-hidden
          className="bg-border absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded-sm"
        />
        <span
          aria-hidden
          className="bg-foreground absolute top-1/2 h-1 -translate-y-1/2"
          style={{ left: pct(lo), right: `calc(100% - ${pct(hi)})` }}
        />
        <input
          type="range"
          aria-label="Precio mínimo"
          min={0}
          max={cap}
          step={step}
          value={lo}
          onChange={(e) => emit(Math.min(Number(e.target.value), hi - step), hi)}
        />
        <input
          type="range"
          aria-label="Precio máximo"
          min={0}
          max={cap}
          step={step}
          value={hi}
          onChange={(e) => emit(lo, Math.max(Number(e.target.value), lo + step))}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {[
          ["Mínimo", lo <= 0 ? "Sin mínimo" : formatMXN(lo)],
          ["Máximo", hi >= cap ? `${formatMXN(cap)}+` : formatMXN(hi)],
        ].map(([label, value]) => (
          <div key={label} className="border-border bg-card rounded-sm border px-3 py-2">
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
