import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/types";
import { formatKm, formatMXN } from "@/lib/format";
import { coverOf, photoUrl } from "@/lib/listings/photos";
import { listingPath } from "@/lib/listings/slug";
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
    <article className="group relative">
      <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-md">
        {cover && (
          <Image
            src={photoUrl(cover)}
            alt={listing.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        <FavoriteButton
          listingId={listing.id}
          initial={favorite}
          className="absolute top-2 right-2 z-10"
        />
      </div>
      <div className="mt-3 space-y-0.5">
        <h3 className="line-clamp-1 font-semibold">
          <Link href={listingPath(listing)} className="after:absolute after:inset-0">
            {listing.title}
          </Link>
        </h3>
        <p className="text-muted-foreground line-clamp-1 text-sm">
          {listing.year} · {formatKm(listing.mileage_km)} · {listing.city}
        </p>
        <p className="flex items-baseline gap-2 pt-1">
          <span className="font-display text-xl">{formatMXN(listing.price_mxn)}</span>
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
