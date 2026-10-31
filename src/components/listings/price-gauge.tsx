import { formatMXN } from "@/lib/format";
import { cn } from "@/lib/utils";

type Verdict = { label: string; tone: "good" | "avg" | "high" | "low" };

/** Qué tan caro o barato está frente al precio medio de anuncios similares (ratio = precio / mediana). */
function verdict(ratio: number): Verdict {
  if (ratio < 0.6) return { label: "Precio muy bajo: verifica con cuidado", tone: "low" };
  if (ratio < 0.92) return { label: "Buen precio", tone: "good" };
  if (ratio <= 1.08) return { label: "En el promedio", tone: "avg" };
  if (ratio <= 1.25) return { label: "Algo por encima del promedio", tone: "high" };
  return { label: "Por encima del mercado", tone: "high" };
}

const dot = {
  good: "bg-success",
  avg: "bg-foreground/50",
  high: "bg-primary",
  low: "bg-warning",
} as const;

/**
 * Jauge de precio: tres tramos (buen precio · promedio · alto) y un marcador que se desliza hasta donde cae este anuncio.
 * Solo se muestra cuando hay suficientes anuncios parecidos para sacar un precio medio.
 */
export function PriceGauge({ price, median }: { price: number; median: number }) {
  const ratio = price / median;
  const v = verdict(ratio);
  // 0,70 × el promedio queda a la izquierda del todo y 1,30 × a la derecha.
  const pos = Math.min(1, Math.max(0, (ratio - 0.7) / 0.6));
  const pct = Math.round(Math.abs(ratio - 1) * 100);
  const diff =
    pct === 0
      ? "Casi igual al precio medio"
      : `${pct} % ${ratio < 1 ? "por debajo" : "por encima"} del precio medio`;

  return (
    <section
      aria-label="Comparación de precio con anuncios similares"
      className="border-border mt-4 space-y-3 border-t pt-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-semibold">
            <span aria-hidden className={cn("size-2.5 rounded-full", dot[v.tone])} />
            {v.label}
          </p>
          <p className="text-muted-foreground text-sm">
            {diff} ({formatMXN(median)})
          </p>
        </div>
      </div>

      <div
        role="img"
        aria-label={`${v.label}. ${diff}.`}
        className="relative pt-5"
        style={{ "--pos": `${(pos * 100).toFixed(1)}%` } as React.CSSProperties}
      >
        {/* Marcador */}
        <div className="gauge-marker absolute top-0 z-10 -translate-x-1/2">
          <span className="bg-foreground text-background block rounded-sm px-1.5 py-0.5 text-[10px] leading-none font-semibold">
            Este anuncio
          </span>
          <span className="bg-foreground mx-auto block h-3 w-0.5" />
        </div>
        {/* Tramos */}
        <div className="grid grid-cols-3 gap-1">
          <span className="bg-success h-2.5 rounded-l-full" />
          <span className="bg-foreground/25 h-2.5" />
          <span className="bg-primary h-2.5 rounded-r-full" />
        </div>
        <div className="text-muted-foreground mt-1.5 grid grid-cols-3 text-xs font-medium">
          <span>Buen precio</span>
          <span className="text-center">Promedio</span>
          <span className="text-right">Alto</span>
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        Frente a anuncios activos del mismo modelo (±2 años). Es orientativo: el estado, la versión
        y el kilometraje cambian el valor.
      </p>
    </section>
  );
}
