import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/types";
import { formatKm, formatMXN } from "@/lib/format";
import { coverOf, photoUrl } from "@/lib/listings/photos";
import { listingPath } from "@/lib/listings/slug";
import { CalendarBlank, Gauge } from "@phosphor-icons/react/dist/ssr";
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
  const cover = coverOf(listing);
  return (
    <article className="group border-border bg-card hover:border-foreground relative overflow-hidden rounded-sm border transition-colors">
      <div className="bg-muted relative aspect-[4/3]">
        {cover && (
          <Image
            src={photoUrl(cover)}
            alt={listing.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        )}
        <p className="font-display bg-primary text-primary-foreground absolute bottom-0 left-0 px-2.5 py-1 text-lg">
          {formatMXN(listing.price_mxn)}
        </p>
        <FavoriteButton
          listingId={listing.id}
          initial={favorite}
          className="absolute top-2 right-2 z-10"
        />
      </div>
      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-1 font-semibold">
          <Link href={listingPath(listing)} className="after:absolute after:inset-0">
            {listing.title}
          </Link>
        </h3>
        <p className="text-muted-foreground flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1">
            <CalendarBlank weight="bold" className="size-4" aria-hidden /> {listing.year}
          </span>
          <span className="inline-flex items-center gap-1">
            <Gauge weight="bold" className="size-4" aria-hidden /> {formatKm(listing.mileage_km)}
          </span>
        </p>
        <p className="flex items-center justify-between gap-2">
          <span className="plate max-w-[70%] truncate">{listing.city}</span>
          {listing.negotiable && <span className="text-primary text-xs font-bold">Negociable</span>}
        </p>
      </div>
    </article>
  );
}

export function ListingGrid({ items, favorites }: { items: Listing[]; favorites: Set<string> }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((l, i) => (
        <li key={l.id}>
          <ListingCard listing={l} favorite={favorites.has(l.id)} priority={i < 2} />
        </li>
      ))}
    </ul>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul aria-hidden className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="border-border bg-card overflow-hidden rounded-md border">
          <div className="bg-muted aspect-[4/3] animate-pulse" />
          <div className="space-y-2 p-3">
            <div className="bg-muted h-5 w-2/3 animate-pulse rounded-sm" />
            <div className="bg-muted h-4 w-full animate-pulse rounded-sm" />
            <div className="bg-muted h-3 w-1/2 animate-pulse rounded-sm" />
          </div>
        </li>
      ))}
    </ul>
  );
}
