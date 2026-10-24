import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MX_STATES, VEHICLE_TYPES, type VehicleType, vehiclePath } from "@/lib/constants";
import { buildUrl, parseFilters, type Filters } from "@/lib/listings/filters-url";
import type { Listing } from "@/types";
import { getCatalog } from "@/lib/catalog";
import { getFavoriteIds, getUser, searchListings } from "@/lib/listings/queries";
import { searchDescription, searchHeading } from "@/lib/seo/metadata";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { StateShape } from "@/components/ui/state-shape";
import { site } from "@/config/site";
import { ActiveFilters } from "./active-filters";
import { QuickFilters } from "./quick-filters";
import { DesktopFilters, MobileFilters, SortSelect } from "./filters";
import { ListingGrid } from "./listing-card";
import { Pagination } from "./pagination";

type Props = {
  params: Promise<{ filtros?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function searchMetadata(
  type: VehicleType,
  { params, searchParams }: Props,
): Promise<Metadata> {
  const filters = parseFilters(type, (await params).filtros, await searchParams);
  const brands = getCatalog(type);
  const heading = searchHeading(filters, brands);
  const { total } = await searchListings(filters);
  const canonical = buildUrl({ ...filters, page: filters.page });
  const pathOnly = canonical.split("?")[0]!;
  const hasQuery =
    canonical.includes("?") && canonical.split("?")[1]!.replace(/(^|&)pagina=\d+/, "") !== "";
  return {
    title: heading,
    description: searchDescription(heading, total),
    alternates: { canonical: filters.page > 1 ? canonical : pathOnly },
    robots: hasQuery ? { index: false, follow: true } : undefined,
    openGraph: { title: heading, description: searchDescription(heading, total) },
  };
}

export async function SearchPage(type: VehicleType, { params, searchParams }: Props) {
  const segments = (await params).filtros ?? [];
  if (segments.length > 2) notFound();
  const filters = parseFilters(type, segments, await searchParams);
  const [{ items, total }, user] = await Promise.all([searchListings(filters), getUser()]);
  const favorites = await getFavoriteIds(user?.id);
  return <SearchView filters={filters} items={items} total={total} favorites={favorites} />;
}

/** Solo presentación: la usan la búsqueda real y la página de ejemplo. */
export function SearchView({
  filters,
  items,
  total,
  favorites,
}: {
  filters: Filters;
  items: Listing[];
  total: number;
  favorites: Set<string>;
}) {
  const type = filters.type;
  const brands = getCatalog(type);
  const heading = searchHeading(filters, brands);
  const other = VEHICLE_TYPES.find((v) => v.value !== type)!;
  const plural = VEHICLE_TYPES.find((v) => v.value === type)!.plural;
  const brandName = brands.find((b) => b.slug === filters.brand)?.name ?? filters.brand;

  return (
    <div className="container-page py-6">
      <nav aria-label="Migas de pan" className="text-muted-foreground mb-3 text-sm">
        <Link href="/" className="hover:underline">
          Inicio
        </Link>{" "}
        /{" "}
        <Link href={`/${vehiclePath(type)}`} className="hover:underline">
          {plural}
        </Link>
      </nav>

      <header className="border-border flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-4">
          {filters.brand && <BrandLogo name={brandName!} className="size-12 shrink-0" />}
          {filters.state && <StateShape slug={filters.state} className="size-14 shrink-0" />}
          <div>
            <h1 className="text-3xl leading-tight md:text-4xl">{heading}</h1>
            <p className="text-muted-foreground mt-1" aria-live="polite">
              <strong className="text-foreground">{total.toLocaleString("es-MX")}</strong>{" "}
              {total === 1 ? "vehículo" : "vehículos"}
              {filters.q ? ` para “${filters.q}”` : ""}
              {total > 0
                ? ` · página ${filters.page} de ${Math.max(1, Math.ceil(total / site.pageSize))}`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MobileFilters filters={filters} brands={brands} />
          <SortSelect filters={filters} />
        </div>
      </header>

      <div className="mt-5 space-y-4">
        <QuickFilters filters={filters} />
        <ActiveFilters filters={filters} brands={brands} />
      </div>

      <div className="mt-6 flex gap-8">
        <DesktopFilters filters={filters} brands={brands} />
        <div className="min-w-0 flex-1">
          {items.length ? (
            <>
              <ListingGrid items={items} favorites={favorites} dense />
              <Pagination filters={filters} total={total} />
            </>
          ) : (
            <EmptyState
              title="No hay autos ni motos con esos filtros… todavía"
              hint="Prueba con un rango de precio o de año más amplio, o quita la marca. Cada día se publican vehículos nuevos."
            >
              <div className="flex flex-wrap justify-center gap-2">
                <LinkButton href={`/${vehiclePath(type)}`} variant="outline">
                  Quitar filtros
                </LinkButton>
                <LinkButton href={`/${vehiclePath(other.value)}`} variant="ghost">
                  Ver {other.plural.toLowerCase()}
                </LinkButton>
              </div>
            </EmptyState>
          )}
        </div>
      </div>

      <section aria-labelledby="por-estado" className="mt-14">
        <h2 id="por-estado" className="rule mb-4 pt-3 text-2xl">
          {plural} usados por estado
        </h2>
        <ul className="flex flex-wrap gap-2">
          {MX_STATES.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/${vehiclePath(type)}/${s.slug}`}
                className="border-border bg-card hover:border-foreground inline-flex min-h-11 items-center gap-2 rounded-sm border px-3 text-sm font-medium"
              >
                <StateShape slug={s.slug} className="size-5" />
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
