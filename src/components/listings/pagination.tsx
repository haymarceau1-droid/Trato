import Link from "next/link";
import { site } from "@/config/site";
import { buildUrl, type Filters } from "@/lib/listings/filters-url";

export function Pagination({ filters, total }: { filters: Filters; total: number }) {
  const pages = Math.ceil(total / site.pageSize);
  if (pages <= 1) return null;
  const link = (page: number) => buildUrl({ ...filters, page });
  const cls =
    "inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-muted";
  return (
    <nav aria-label="Paginación" className="mt-8 flex items-center justify-center gap-3">
      {filters.page > 1 && (
        <Link rel="prev" href={link(filters.page - 1)} className={cls}>
          ← Anterior
        </Link>
      )}
      <span className="text-muted-foreground text-sm">
        Página {filters.page} de {pages}
      </span>
      {filters.page < pages && (
        <Link rel="next" href={link(filters.page + 1)} className={cls}>
          Siguiente →
        </Link>
      )}
    </nav>
  );
}
