import Link from "next/link";
import {
  CalendarBlank,
  CaretRight,
  Clock,
  MapPin,
  Eye,
  Gauge,
  GasPump,
  GearSix,
  PencilSimple,
  Receipt,
  SealCheck,
  ShieldCheck,
} from "@/components/ui/icons";
import { FUELS, INVOICE_TYPES, TRANSMISSIONS, labelOf, stateName } from "@/lib/constants";
import { formatKm, formatMXN, formatMonthYearShort, timeAgo } from "@/lib/format";
import { photoUrl } from "@/lib/listings/photos";
import { listingJsonLd } from "@/lib/seo/jsonld";
import type { Listing, PublicProfile } from "@/types";
import { FacebookIcon } from "@/components/ui/facebook-icon";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button, LinkButton } from "@/components/ui/button";
import { ScamTips } from "@/components/trust/scam-tips";
import { ReportDialog } from "@/components/trust/report-dialog";
import { ContactButtons, MobileContactBar } from "./contact-buttons";
import { FavoriteButton } from "./favorite-button";
import { Gallery } from "./gallery";
import { ListingGrid } from "./listing-card";
import { ShareButton } from "./share-button";
import { ConditionBars } from "./condition-bars";
import { LocationMap } from "./location-map";
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
        <MobileContactBar
          listingId={l.id}
          price={formatMXN(l.price_mxn)}
          hasFacebook={seller?.has_facebook}
        />
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
        <h1 className="flex items-center gap-3 text-3xl leading-tight md:text-4xl">
          <BrandLogo name={l.brand} className="size-9 shrink-0 md:size-11" />
          {l.title}
        </h1>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="text-foreground inline-flex items-center gap-1.5 font-semibold">
            <MapPin className="size-4" aria-hidden /> {l.city}, {stateName(l.state)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden /> {timeAgo(l.created_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="size-4" aria-hidden /> {l.views_count} vistas
          </span>
        </div>
      </header>

      <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
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
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="border-border bg-card space-y-4 rounded-md border p-5">
            <div>
              <p className="text-muted-foreground text-sm font-semibold">Precio</p>
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
                <Button size="lg" variant="whatsapp">
                  <WhatsAppIcon className="size-5" /> WhatsApp
                </Button>
                <Button size="lg" variant="outline">
                  Llamar
                </Button>
                <Button size="lg" variant="outline" className="col-span-2">
                  <FacebookIcon className="size-5" /> Contactar en Facebook
                </Button>
              </div>
            ) : live ? (
              <ContactButtons listingId={l.id} hasFacebook={seller?.has_facebook} />
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
            <section
              aria-labelledby="vendedor"
              className="border-border bg-card overflow-hidden rounded-md border"
            >
              <div className="flex items-center gap-4 p-5">
                <span
                  aria-hidden
                  className="bg-primary text-primary-foreground font-display grid size-14 shrink-0 place-items-center rounded-md text-2xl"
                >
                  {seller.display_name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-sm font-semibold">Vendedor</p>
                  <h2 id="vendedor" className="truncate text-2xl leading-tight">
                    {seller.display_name}
                  </h2>
                </div>
              </div>

              <dl className="border-border grid grid-cols-3 divide-x divide-[var(--border)] border-y text-center">
                <div className="px-2 py-3">
                  <dt className="text-muted-foreground text-xs">Desde</dt>
                  <dd className="mt-0.5 text-[13px] font-semibold sm:text-sm">
                    {formatMonthYearShort(seller.created_at)}
                  </dd>
                </div>
                <div className="px-2 py-3">
                  <dt className="text-muted-foreground text-xs">En venta</dt>
                  <dd className="mt-0.5 text-[13px] font-semibold sm:text-sm">
                    {seller.active_listings}{" "}
                    {seller.active_listings === 1 ? "vehículo" : "vehículos"}
                  </dd>
                </div>
                <div className="px-2 py-3">
                  <dt className="text-muted-foreground text-xs">Celular</dt>
                  <dd className="mt-0.5 text-[13px] font-semibold sm:text-sm">
                    {seller.phone_verified ? (
                      <span className="text-success inline-flex items-center gap-1">
                        <SealCheck weight="fill" className="size-3.5 sm:size-4" aria-hidden />{" "}
                        Verificado
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Sin verificar</span>
                    )}
                  </dd>
                </div>
              </dl>

              <Link
                href={demo ? "#" : `/vendedor/${seller.id}`}
                className="hover:bg-muted flex min-h-12 items-center justify-between px-5 text-sm font-semibold"
              >
                Ver todos sus vehículos
                <CaretRight className="size-4" aria-hidden />
              </Link>
            </section>
          )}
        </aside>

        <div className="min-w-0 space-y-8 lg:col-start-1 lg:row-start-2">
          <section aria-labelledby="descripcion">
            <h2 id="descripcion" className="rule mb-3 pt-3 text-2xl">
              Lo que dice el vendedor
            </h2>
            <p className="max-w-prose text-[15px] leading-relaxed whitespace-pre-line">
              {l.description ||
                "El vendedor no agregó descripción. Pregúntale lo que quieras saber."}
            </p>
          </section>

          {(l.body_condition !== null || l.mechanical_condition !== null) && (
            <section aria-labelledby="estado">
              <h2 id="estado" className="rule mb-4 pt-3 text-2xl">
                Estado del vehículo
              </h2>
              <ConditionBars body={l.body_condition} mechanical={l.mechanical_condition} />
            </section>
          )}

          <section aria-labelledby="caracteristicas">
            <h2 id="caracteristicas" className="rule mb-4 pt-3 text-2xl">
              Ficha técnica
            </h2>
            <SpecGrid l={l} />
          </section>

          <section aria-labelledby="ubicacion">
            <h2 id="ubicacion" className="rule mb-4 pt-3 text-2xl">
              Dónde está
            </h2>
            <LocationMap l={l} />
          </section>

          <ScamTips showRepuve />
        </div>
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
