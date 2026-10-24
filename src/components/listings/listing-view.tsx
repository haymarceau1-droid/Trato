import Link from "next/link";
import {
  CalendarBlank,
  Clock,
  Eye,
  Gauge,
  GasPump,
  GearSix,
  MapPin,
  PencilSimple,
  Receipt,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import { brand } from "@/config/brand";
import { FUELS, INVOICE_TYPES, TRANSMISSIONS, labelOf, stateName } from "@/lib/constants";
import { formatKm, formatMXN, formatMonthYear, timeAgo } from "@/lib/format";
import { photoUrl } from "@/lib/listings/photos";
import { listingJsonLd } from "@/lib/seo/jsonld";
import type { Listing, PublicProfile } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { ScamTips } from "@/components/trust/scam-tips";
import { VerifiedBadge } from "@/components/trust/verified-badge";
import { ReportDialog } from "@/components/trust/report-dialog";
import { ContactButtons, MobileContactBar } from "./contact-buttons";
import { FavoriteButton } from "./favorite-button";
import { Gallery } from "./gallery";
import { ListingGrid } from "./listing-card";
import { ShareButton } from "./share-button";
import { SpecGrid } from "./spec-grid";
import { ViewBeacon } from "./view-beacon";

const statusNote = {
  paused: "Tu anuncio está en pausa y no es visible para otras personas.",
  sold: "Marcaste este anuncio como vendido.",
  expired: "Este anuncio venció. Renuévalo desde Mis anuncios.",
  removed: "Este anuncio fue retirado por moderación.",
} as const;

interface Props {
  l: Listing;
  seller: PublicProfile | null;
  similar: Listing[];
  favorites: Set<string>;
  isOwner: boolean;
  /** Página testigo: sin llamadas a la API ni a la base de datos. */
  demo?: boolean;
}

export function ListingView({ l, seller, similar, favorites, isOwner, demo }: Props) {
  const photos = [...l.listing_photos]
    .sort((a, b) => a.position - b.position)
    .map((p) => photoUrl(p.storage_path));
  const live = l.status === "active";
  const typePath = l.vehicle_type === "auto" ? "autos" : "motos";

  const facts = [
    { icon: CalendarBlank, text: String(l.year) },
    { icon: Gauge, text: formatKm(l.mileage_km) },
    { icon: GearSix, text: labelOf(TRANSMISSIONS, l.transmission) },
    { icon: GasPump, text: labelOf(FUELS, l.fuel) },
    { icon: Receipt, text: labelOf(INVOICE_TYPES, l.invoice_type) },
  ];

  return (
    <div className="container-page pt-4 pb-24 md:py-6">
      {!demo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(listingJsonLd(l)).replace(/</g, "\\u003c"),
          }}
        />
      )}
      {live && !demo && <ViewBeacon listingId={l.id} />}
      {live && !demo && !isOwner && (
        <MobileContactBar listingId={l.id} price={formatMXN(l.price_mxn)} />
      )}

      <nav aria-label="Migas de pan" className="text-muted-foreground mb-4 text-sm">
        <Link href={`/${typePath}`} className="hover:underline">
          {l.vehicle_type === "auto" ? "Autos" : "Motos"}
        </Link>
        {" / "}
        <Link href={`/${typePath}/${l.brand_slug}`} className="hover:underline">
          {l.brand}
        </Link>
        {" / "}
        <span aria-current="page">{l.model}</span>
      </nav>

      {demo && (
        <p
          role="note"
          className="bg-warning-soft text-warning mb-4 rounded-sm p-3 text-sm font-medium"
        >
          Página de ejemplo con datos ficticios para que veas cómo luce un anuncio. Nada de aquí es
          real.
        </p>
      )}
      {!live && (
        <p
          role="status"
          className="bg-warning-soft text-warning mb-4 rounded-sm p-3 text-sm font-medium"
        >
          {statusNote[l.status as keyof typeof statusNote]}
        </p>
      )}

      <header className="mb-5 space-y-3">
        <h1 className="text-3xl leading-tight md:text-4xl">{l.title}</h1>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="plate">
            {l.city}, {stateName(l.state)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden /> {timeAgo(l.created_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="size-4" aria-hidden /> {l.views_count} vistas
          </span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-8">
          <Gallery photos={photos} title={l.title} />

          <ul aria-label="Datos clave" className="flex flex-wrap gap-2">
            {facts.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="border-border bg-card inline-flex min-h-10 items-center gap-2 rounded-sm border px-3 text-sm font-semibold"
              >
                <Icon weight="duotone" className="text-primary size-5" aria-hidden />
                {text}
              </li>
            ))}
          </ul>

          <section aria-labelledby="descripcion">
            <h2 id="descripcion" className="rule mb-3 pt-3 text-2xl">
              Lo que dice el vendedor
            </h2>
            <p className="max-w-prose text-[15px] leading-relaxed whitespace-pre-line">
              {l.description ||
                "El vendedor no agregó descripción. Pregúntale lo que quieras saber."}
            </p>
          </section>

          <section aria-labelledby="caracteristicas">
            <h2 id="caracteristicas" className="rule mb-4 pt-3 text-2xl">
              Ficha técnica
            </h2>
            <SpecGrid l={l} />
          </section>

          <ScamTips showRepuve />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="border-border bg-card space-y-4 rounded-md border p-5">
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Precio
              </p>
              <p className="font-display text-4xl">{formatMXN(l.price_mxn)}</p>
              {l.negotiable && <Badge tone="green">Precio negociable</Badge>}
            </div>

            {isOwner ? (
              <LinkButton
                href={`/mis-anuncios/${l.id}/editar`}
                variant="outline"
                className="w-full"
              >
                <PencilSimple className="size-4" aria-hidden /> Editar mi anuncio
              </LinkButton>
            ) : demo ? (
              <div className="grid grid-cols-2 gap-2">
                <Button size="lg" disabled>
                  WhatsApp
                </Button>
                <Button size="lg" variant="outline" disabled>
                  Llamar
                </Button>
              </div>
            ) : live ? (
              <ContactButtons listingId={l.id} />
            ) : null}

            {!demo && (
              <div className="border-border flex flex-wrap items-center gap-2 border-t pt-4">
                <FavoriteButton
                  listingId={l.id}
                  initial={favorites.has(l.id)}
                  className="border-border border"
                />
                <ShareButton title={l.title} />
                {!isOwner && <ReportDialog listingId={l.id} />}
              </div>
            )}

            <p className="text-muted-foreground flex items-start gap-2 text-xs">
              <ShieldCheck
                weight="duotone"
                className="text-primary mt-0.5 size-4 shrink-0"
                aria-hidden
              />
              Ve el vehículo en persona y paga al recibirlo. Si alguien te pide un anticipo,
              repórtalo.
            </p>
          </div>

          {seller && (
            <div className="border-border bg-card flex gap-3 rounded-md border p-4">
              <span
                aria-hidden
                className="bg-primary-soft text-primary font-display grid size-12 shrink-0 place-items-center rounded-full text-xl"
              >
                {seller.display_name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-muted-foreground text-xs">Vendedor</p>
                <Link
                  href={demo ? "#" : `/vendedor/${seller.id}`}
                  className="block truncate text-lg font-bold hover:underline"
                >
                  {seller.display_name}
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  {seller.phone_verified ? (
                    <VerifiedBadge />
                  ) : (
                    <Badge tone="gray">Teléfono sin verificar</Badge>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <MapPin className="size-4" aria-hidden />
                  En {brand.name} desde {formatMonthYear(seller.created_at)} ·{" "}
                  {seller.active_listings} {seller.active_listings === 1 ? "vehículo" : "vehículos"}{" "}
                  en venta
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similares" className="mt-14">
          <h2 id="similares" className="rule mb-4 pt-3 text-2xl">
            Otros {l.brand} que te pueden interesar
          </h2>
          <ListingGrid items={similar} favorites={favorites} />
        </section>
      )}
    </div>
  );
}
