import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MX_STATES, VEHICLE_TYPES, type VehicleType, vehiclePath } from "@/lib/constants";
import { buildUrl, parseFilters } from "@/lib/listings/filters-url";
import { getCatalog } from "@/lib/catalog";
import { getFavoriteIds, getUser, searchListings } from "@/lib/listings/queries";
import { searchDescription, searchHeading } from "@/lib/seo/metadata";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ActiveFilters } from "./active-filters";
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
  const brands = getCatalog(type);
  const [{ items, total }, user] = await Promise.all([searchListings(filters), getUser()]);
  const favorites = await getFavoriteIds(user?.id);
  const heading = searchHeading(filters, brands);
  const other = VEHICLE_TYPES.find((v) => v.value !== type)!;

  return (
    <div className="container-page py-6">
      <nav aria-label="Migas de pan" className="text-muted-foreground mb-2 text-sm">
        <Link href="/" className="hover:underline">
          Inicio
        </Link>{" "}
        /{" "}
        <Link href={`/${vehiclePath(type)}`} className="hover:underline">
          {VEHICLE_TYPES.find((v) => v.value === type)!.plural}
        </Link>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold">
            {filters.brand && (
              <BrandLogo
                name={brands.find((b) => b.slug === filters.brand)?.name ?? filters.brand}
                className="size-8"
              />
            )}
            {heading}
          </h1>
          <p className="text-muted-foreground text-sm" aria-live="polite">
            {total.toLocaleString("es-MX")} resultados{filters.q ? ` para “${filters.q}”` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MobileFilters filters={filters} brands={brands} />
          <SortSelect filters={filters} />
        </div>
      </div>

      <div className="mt-4">
        <ActiveFilters filters={filters} brands={brands} />
      </div>

      <div className="mt-6 flex gap-8">
        <DesktopFilters filters={filters} brands={brands} />
        <div className="min-w-0 flex-1">
          {items.length ? (
            <>
              <ListingGrid items={items} favorites={favorites} />
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

      <section aria-labelledby="por-estado" className="mt-12">
        <h2 id="por-estado" className="mb-3 text-lg font-bold">
          {VEHICLE_TYPES.find((v) => v.value === type)!.plural} usados por estado
        </h2>
        <ul className="flex flex-wrap gap-2">
          {MX_STATES.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/${vehiclePath(type)}/${s.slug}`}
                className="border-border bg-card hover:bg-muted inline-flex min-h-11 items-center rounded-sm border px-4 text-sm"
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
