import { formatKm, formatMXN } from "@/lib/format";
import { stateName } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Vista previa en vivo: cómo se verá la tarjeta del anuncio en los resultados. */
export function ListingPreview({
  cover,
  title,
  price,
  negotiable,
  year,
  km,
  city,
  state,
  className,
}: {
  cover?: string;
  title: string;
  price?: number;
  negotiable?: boolean;
  year?: number;
  km?: number;
  city?: string;
  state?: string;
  className?: string;
}) {
  const bits = [
    year ? String(year) : null,
    km !== undefined && !Number.isNaN(km) ? formatKm(km) : null,
    city || (state ? stateName(state) : null),
  ].filter(Boolean);
  return (
    <div className={cn("space-y-3", className)}>
      <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-md">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="Portada de tu anuncio" className="size-full object-cover" />
        ) : (
          <p className="text-muted-foreground absolute inset-0 grid place-items-center px-6 text-center text-sm">
            Tu foto de portada aparecerá aquí
          </p>
        )}
      </div>
      <div className="space-y-0.5">
        <p className={cn("line-clamp-1 font-semibold", !title && "text-muted-foreground")}>
          {title || "Marca, modelo y año"}
        </p>
        <p className="text-muted-foreground line-clamp-1 min-h-5 text-sm">
          {bits.length ? bits.join(" · ") : "Año · kilometraje · ciudad"}
        </p>
        <p className="flex items-baseline gap-2 pt-1">
          <span className={cn("font-display text-xl", !price && "text-muted-foreground")}>
            {price && !Number.isNaN(price) ? formatMXN(price) : "$ — MXN"}
          </span>
          {negotiable && (
            <span className="text-muted-foreground text-xs font-semibold">Negociable</span>
          )}
        </p>
      </div>
    </div>
  );
}
