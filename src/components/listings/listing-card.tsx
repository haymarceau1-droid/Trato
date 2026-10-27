import Link from "next/link";
import type { Listing } from "@/types";
import { formatKm, formatMXN } from "@/lib/format";
import { isBoosted } from "@/lib/listings/boost";
import { photoUrl } from "@/lib/listings/photos";
import { BODY_TYPES, FUELS, MOTO_TYPES, TRANSMISSIONS, labelOf } from "@/lib/constants";
import { CardGallery } from "./card-gallery";
import { listingPath } from "@/lib/listings/slug";
import { Star } from "@/components/ui/icons";
import { FavoriteButton } from "./favorite-button";

export function ListingCard({
  listing,
  favorite,
  priority,
}: {
  listing: Listing;
  favorite: boolean;
  priority?: boolean;
}) {
  const photos = [...(listing.listing_photos ?? [])]
    .sort((a, b) => a.position - b.position)
    .slice(0, 6)
    .map((p) => photoUrl(p.storage_path));
  const boosted = isBoosted(listing);
  const facts = [
    labelOf(TRANSMISSIONS, listing.transmission),
    labelOf(FUELS, listing.fuel),
    listing.vehicle_type === "auto"
      ? labelOf(BODY_TYPES, listing.body_type)
      : labelOf(MOTO_TYPES, listing.moto_type),
    listing.body_condition !== null && listing.mechanical_condition !== null
      ? `Estado ${listing.body_condition}/${listing.mechanical_condition}`
      : null,
  ].filter((f): f is string => Boolean(f) && f !== "—");
  return (
    <article className="group relative isolate">
      <CardGallery photos={photos} alt={listing.title} priority={priority}>
        <p className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs font-semibold text-white">
          {facts.map((f) => (
            <span
              key={f}
              className="after:ml-2 after:opacity-50 after:content-['·'] last:after:hidden"
            >
              {f}
            </span>
          ))}
        </p>
      </CardGallery>
      {boosted && (
        <span className="bg-primary text-primary-foreground pointer-events-none absolute top-2 left-2 z-30 inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-semibold shadow">
          <Star className="size-3.5" weight="fill" aria-hidden /> Destacado
        </span>
      )}
      <FavoriteButton
        listingId={listing.id}
        initial={favorite}
        className="absolute top-2 right-2 z-30"
      />
      <div className="mt-3 space-y-0.5">
        <h3 className="line-clamp-1 font-semibold">
          <Link href={listingPath(listing)} className="after:absolute after:inset-0">
            {listing.title}
          </Link>
        </h3>
        <p className="text-muted-foreground line-clamp-1 text-sm">
          {listing.year} · {formatKm(listing.mileage_km)} · {listing.city}
        </p>
        <p className="flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className="font-display text-lg whitespace-nowrap sm:text-xl">
            {formatMXN(listing.price_mxn)}
          </span>
          {listing.negotiable && (
            <span className="text-muted-foreground text-xs font-semibold">Negociable</span>
          )}
        </p>
      </div>
    </article>
  );
}

export function ListingGrid({ items, favorites }: { items: Listing[]; favorites: Set<string> }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((l, i) => (
        <li key={l.id}>
          <ListingCard listing={l} favorite={favorites.has(l.id)} priority={i < 3} />
        </li>
      ))}
    </ul>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul aria-hidden className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className="bg-muted aspect-[4/3] animate-pulse rounded-md" />
          <div className="mt-3 space-y-2">
            <div className="bg-muted h-4 w-2/3 animate-pulse rounded-sm" />
            <div className="bg-muted h-3.5 w-full animate-pulse rounded-sm" />
            <div className="bg-muted h-5 w-1/3 animate-pulse rounded-sm" />
          </div>
        </li>
      ))}
    </ul>
  );
}
