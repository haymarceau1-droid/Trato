import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Clock, Eye, MapPin, Pencil } from "lucide-react";
import { brand } from "@/config/brand";
import { stateName } from "@/lib/constants";
import { formatMXN, formatMonthYear, timeAgo } from "@/lib/format";
import { coverOf, photoUrl } from "@/lib/listings/photos";
import {
  getFavoriteIds,
  getListing,
  getPublicProfile,
  getSimilar,
  getUser,
} from "@/lib/listings/queries";
import { listingPath, parseListingId } from "@/lib/listings/slug";
import { listingJsonLd } from "@/lib/seo/jsonld";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { ContactButtons } from "@/components/listings/contact-buttons";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { Gallery } from "@/components/listings/gallery";
import { ListingGrid } from "@/components/listings/listing-card";
import { ShareButton } from "@/components/listings/share-button";
import { SpecGrid } from "@/components/listings/spec-grid";
import { ViewBeacon } from "@/components/listings/view-beacon";
import { ReportDialog } from "@/components/trust/report-dialog";
import { ScamTips } from "@/components/trust/scam-tips";
import { VerifiedBadge } from "@/components/trust/verified-badge";

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

const statusNote = {
  paused: "Tu anuncio está en pausa y no es visible para otras personas.",
  sold: "Marcaste este anuncio como vendido.",
  expired: "Este anuncio venció. Renuévalo desde Mis anuncios.",
  removed: "Este anuncio fue retirado por moderación.",
} as const;

export default async function ListingPage({ params }: Props) {
  const slugParam = (await params).slug;
  const id = parseListingId(slugParam);
  if (!id) notFound();
  const l = await getListing(id);
  if (!l) notFound();
  if (slugParam !== `${l.slug}-${l.id}`) redirect(listingPath(l));

  const user = await getUser();
  const isOwner = user?.id === l.user_id;
  const [seller, similar, favorites] = await Promise.all([
    getPublicProfile(l.user_id),
    getSimilar(l),
    getFavoriteIds(user?.id),
  ]);
  const photos = [...l.listing_photos]
    .sort((a, b) => a.position - b.position)
    .map((p) => photoUrl(p.storage_path));
  const live = l.status === "active";

  return (
    <div className="container-page py-4 md:py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(listingJsonLd(l)).replace(/</g, "\\u003c"),
        }}
      />
      {live && <ViewBeacon listingId={l.id} />}
      <nav aria-label="Migas de pan" className="text-muted-foreground mb-3 text-sm">
        <Link href={l.vehicle_type === "auto" ? "/autos" : "/motos"} className="hover:underline">
          {l.vehicle_type === "auto" ? "Autos" : "Motos"}
        </Link>
        {" / "}
        <Link
          href={`/${l.vehicle_type === "auto" ? "autos" : "motos"}/${l.brand_slug}`}
          className="hover:underline"
        >
          {l.brand}
        </Link>
      </nav>

      {!live && (
        <p
          role="status"
          className="bg-warning-soft text-warning mb-4 rounded-xl p-3 text-sm font-medium"
        >
          {statusNote[l.status as keyof typeof statusNote]}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-6">
          <Gallery photos={photos} title={l.title} />

          <section className="space-y-3 lg:hidden">
            <PriceBlock l={l} />
          </section>

          <section aria-labelledby="caracteristicas">
            <h2 id="caracteristicas" className="mb-3 text-lg font-bold">
              Características
            </h2>
            <SpecGrid l={l} />
          </section>

          {l.description && (
            <section aria-labelledby="descripcion">
              <h2 id="descripcion" className="mb-2 text-lg font-bold">
                Descripción
              </h2>
              <p className="text-[15px] leading-relaxed whitespace-pre-line">{l.description}</p>
            </section>
          )}

          <ScamTips showRepuve />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="border-border bg-card hidden space-y-3 rounded-2xl border p-5 lg:block">
            <PriceBlock l={l} />
          </div>

          <div className="border-border bg-card space-y-3 rounded-2xl border p-4">
            {isOwner ? (
              <LinkButton
                href={`/mis-anuncios/${l.id}/editar`}
                variant="outline"
                className="w-full"
              >
                <Pencil className="size-4" aria-hidden /> Editar mi anuncio
              </LinkButton>
            ) : live ? (
              <ContactButtons listingId={l.id} />
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <FavoriteButton
                listingId={l.id}
                initial={favorites.has(l.id)}
                className="border-border border"
              />
              <ShareButton title={l.title} />
              {!isOwner && <ReportDialog listingId={l.id} />}
            </div>
          </div>

          {seller && (
            <div className="border-border bg-card rounded-2xl border p-4">
              <p className="text-muted-foreground text-xs">Vendedor</p>
              <Link href={`/vendedor/${seller.id}`} className="text-lg font-bold hover:underline">
                {seller.display_name}
              </Link>
              <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-sm">
                {seller.phone_verified ? (
                  <VerifiedBadge />
                ) : (
                  <Badge tone="gray">Teléfono sin verificar</Badge>
                )}
                <span>
                  En {brand.name} desde {formatMonthYear(seller.created_at)}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {seller.active_listings} anuncios activos
              </p>
            </div>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similares" className="mt-12">
          <h2 id="similares" className="mb-4 text-xl font-bold">
            Anuncios similares
          </h2>
          <ListingGrid items={similar} favorites={favorites} />
        </section>
      )}
    </div>
  );
}

function PriceBlock({ l }: { l: Awaited<ReturnType<typeof getListing>> & object }) {
  return (
    <>
      <p className="text-3xl font-extrabold">{formatMXN(l.price_mxn)}</p>
      {l.negotiable && <Badge tone="green">Precio negociable</Badge>}
      <h1 className="text-xl font-bold">{l.title}</h1>
      <ul className="text-muted-foreground space-y-1 text-sm">
        <li className="flex items-center gap-2">
          <MapPin className="size-4" aria-hidden /> {l.city}, {stateName(l.state)}
        </li>
        <li className="flex items-center gap-2">
          <Clock className="size-4" aria-hidden /> {timeAgo(l.created_at)}
        </li>
        <li className="flex items-center gap-2">
          <Eye className="size-4" aria-hidden /> {l.views_count} vistas
        </li>
      </ul>
    </>
  );
}
