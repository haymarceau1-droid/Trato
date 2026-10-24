import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { stateName } from "@/lib/constants";
import { formatMXN } from "@/lib/format";
import { coverOf, photoUrl } from "@/lib/listings/photos";
import {
  getFavoriteIds,
  getListing,
  getPublicProfile,
  getSimilar,
  getUser,
} from "@/lib/listings/queries";
import { listingPath, parseListingId } from "@/lib/listings/slug";
import { ListingView } from "@/components/listings/listing-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseListingId((await params).slug);
  const l = id ? await getListing(id) : null;
  if (!l || l.status !== "active")
    return { title: "Anuncio no disponible", robots: { index: false } };
  const title = `${l.title} — ${formatMXN(l.price_mxn)}`;
  const description =
    `${l.year} · ${l.mileage_km.toLocaleString("es-MX")} km · ${l.city}, ${stateName(l.state)}. ${l.description.slice(0, 120)}`.trim();
  const cover = coverOf(l);
  return {
    title,
    description,
    alternates: { canonical: listingPath(l) },
    openGraph: {
      title,
      description,
      type: "website",
      url: listingPath(l),
      images: cover ? [{ url: photoUrl(cover), alt: l.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cover ? [photoUrl(cover)] : undefined,
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const slugParam = (await params).slug;
  const id = parseListingId(slugParam);
  if (!id) notFound();
  const l = await getListing(id);
  if (!l) notFound();
  if (slugParam !== `${l.slug}-${l.id}`) redirect(listingPath(l));

  const user = await getUser();
  const [seller, similar, favorites] = await Promise.all([
    getPublicProfile(l.user_id),
    getSimilar(l),
    getFavoriteIds(user?.id),
  ]);

  return (
    <ListingView
      l={l}
      seller={seller}
      similar={similar}
      favorites={favorites}
      isOwner={user?.id === l.user_id}
    />
  );
}
