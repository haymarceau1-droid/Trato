import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
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
    <article className="group border-border bg-card relative overflow-hidden rounded-2xl border transition-shadow hover:shadow-md">
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
        <FavoriteButton
          listingId={listing.id}
          initial={favorite}
          className="absolute top-2 right-2 z-10"
        />
      </div>
      <div className="space-y-1 p-3">
        <p className="text-lg font-extrabold">{formatMXN(listing.price_mxn)}</p>
        <h3 className="line-clamp-1 text-sm font-medium">
          <Link href={listingPath(listing)} className="after:absolute after:inset-0">
            {listing.title}
          </Link>
        </h3>
        <p className="text-muted-foreground line-clamp-1 text-xs">
          {listing.year} · {formatKm(listing.mileage_km)} · {listing.city}
        </p>
        {listing.negotiable && (
          <p className="text-primary inline-flex items-center gap-1 text-xs font-semibold">
            <BadgeCheck className="size-3.5" aria-hidden /> Negociable
          </p>
        )}
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
        <li key={i} className="border-border bg-card overflow-hidden rounded-2xl border">
          <div className="bg-muted aspect-[4/3] animate-pulse" />
          <div className="space-y-2 p-3">
            <div className="bg-muted h-5 w-2/3 animate-pulse rounded" />
            <div className="bg-muted h-4 w-full animate-pulse rounded" />
            <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}
