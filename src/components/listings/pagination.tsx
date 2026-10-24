import Link from "next/link";
import { CaretLeft, CaretRight } from "@/components/ui/icons";
import { site } from "@/config/site";
import { buildUrl, type Filters } from "@/lib/listings/filters-url";
import { cn } from "@/lib/utils";

/** Páginas visibles: primera, última y una ventana alrededor de la actual, con "…" entre huecos. */
function windowed(current: number, pages: number): (number | "gap")[] {
  const set = new Set([1, pages, current - 1, current, current + 1]);
  const list = [...set].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  list.forEach((p, i) => {
    if (i && p - list[i - 1]! > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export function Pagination({ filters, total }: { filters: Filters; total: number }) {
  const pages = Math.ceil(total / site.pageSize);
  if (pages <= 1) return null;
  const link = (page: number) => buildUrl({ ...filters, page });
  const cell =
    "grid min-h-11 min-w-11 place-items-center rounded-sm border px-3 text-sm font-semibold";
  return (
    <nav aria-label="Paginación" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {filters.page > 1 && (
        <Link
          rel="prev"
          href={link(filters.page - 1)}
          aria-label="Página anterior"
          className={cn(cell, "border-border bg-card hover:border-foreground")}
        >
          <CaretLeft className="size-4" aria-hidden />
        </Link>
      )}
      {windowed(filters.page, pages).map((p, i) =>
        p === "gap" ? (
          <span key={`g${i}`} aria-hidden className="text-muted-foreground px-1">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={link(p)}
            aria-label={`Página ${p}`}
            aria-current={p === filters.page ? "page" : undefined}
            className={cn(
              cell,
              p === filters.page
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card hover:border-foreground",
            )}
          >
            {p}
          </Link>
        ),
      )}
      {filters.page < pages && (
        <Link
          rel="next"
          href={link(filters.page + 1)}
          aria-label="Página siguiente"
          className={cn(cell, "border-border bg-card hover:border-foreground")}
        >
          <CaretRight className="size-4" aria-hidden />
        </Link>
      )}
    </nav>
  );
}
