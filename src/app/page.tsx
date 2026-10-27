import type { Metadata } from "next";
import Link from "next/link";
import {
  CaretRight as ChevronRight,
  HandCoins,
  Handshake,
  ImageSquare,
  MapPin,
  Phone,
  Receipt,
  ShieldCheck,
} from "@/components/ui/icons";
import { brand } from "@/config/brand";
import { site } from "@/config/site";
import { PRICE_RANGES } from "@/lib/constants";
import { buildUrl, parseFilters } from "@/lib/listings/filters-url";
import { MexicoFlag } from "@/components/ui/mexico-flag";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Comparison } from "@/components/home/comparison";
import { VehicleDoors } from "@/components/home/vehicle-doors";
import dynamic from "next/dynamic";
import { logoBrands } from "@/lib/brand-picks";
import { marketLine } from "@/lib/market-line";
import { slugify } from "@/lib/listings/slug";
import {
  getFavoriteIds,
  getLatest,
  getMarketStats,
  getStateCounts,
  getTypeCounts,
  getUser,
} from "@/lib/listings/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { ListingGrid } from "@/components/listings/listing-card";
import { SearchBox } from "@/components/listings/search-box";

export const metadata: Metadata = {
  title: { absolute: `${brand.name} — Compra y vende autos y motos usados en México` },
  description: brand.shortDescription,
  alternates: { canonical: "/" },
};

const FAQ = [
  [
    "¿Cuánto cuesta vender mi auto o moto?",
    `Nada. Publicar, editar y renovar es gratis, y ${brand.name} no cobra comisión cuando lo vendes. Tú y el comprador cierran el trato directamente.`,
  ],
  [
    "¿Cómo sé que el vendedor es real?",
    "Los vendedores con “Teléfono verificado” confirmaron su celular con un código por SMS. Aun así, revisa siempre el vehículo en persona: factura original, tarjeta de circulación y consulta en el REPUVE.",
  ],
  [
    "¿Quién ve mi número de teléfono?",
    "Solo las personas que inician sesión y te contactan desde tu anuncio. Nunca se muestra en la página pública ni en Google, así evitas llamadas de spam.",
  ],
  [
    "¿Qué hago si me piden dinero antes de ver el auto?",
    "No lo des: es la estafa más común. Apartados, depósitos y “gastos de envío” son señal de alerta. Usa el botón Reportar y lo revisamos.",
  ],
  [
    "¿Cuánto dura mi anuncio y puedo cambiarlo?",
    `${site.listingTtlDays} días. Puedes editar precio y fotos, pausarlo, renovarlo o marcarlo como vendido cuando quieras desde Mis anuncios.`,
  ],
  [
    "¿Puedo pagar o cobrar dentro de la app?",
    `No, y es a propósito: ${brand.name} nunca toca tu dinero. El pago se hace en persona, al recibir el vehículo y firmar la compraventa.`,
  ],
] as const;

// El mapa está bajo la zona visible y trae ~35 KB de trazados: se carga aparte para no frenar la portada.
const MexicoMap = dynamic(() => import("@/components/home/mexico-map").then((m) => m.MexicoMap), {
  loading: () => (
    <div className="bg-muted aspect-[8/5] w-full animate-pulse rounded-md" aria-hidden />
  ),
});

const HABITS = [
  [
    "Nunca des anticipos",
    "Apartar con dinero antes de ver el vehículo es la estafa más común. El pago se hace al recibirlo.",
    HandCoins,
  ],
  [
    "Verifica en el REPUVE",
    "Consulta gratis si tiene reporte de robo, con la placa o el número de serie (NIV).",
    ShieldCheck,
  ],
  [
    "Revisa la factura original",
    "El nombre y el NIV deben coincidir con el vehículo y con la tarjeta de circulación.",
    Receipt,
  ],
  [
    "Reúnete en un lugar público",
    "De día y con compañía. Si puedes, lleva a tu mecánico a revisarlo.",
    MapPin,
  ],
] as const;

const STEPS = [
  [
    "Publica tu auto o moto",
    "Sube las fotos, elige marca y modelo, pon el precio. Son siete pasos cortos y tu borrador se guarda solo.",
    ImageSquare,
  ],
  [
    "Te escriben por WhatsApp",
    "Solo quien inicia sesión ve tu contacto. Tu número nunca aparece en Google ni en el anuncio.",
    Phone,
  ],
  [
    "Revisan el vehículo contigo",
    "Prueba de manejo en un lugar público, papeles a la vista y pago al entregar. Sin anticipos.",
    Handshake,
  ],
] as const;

export default async function Home() {
  const [latest, user, stateCounts, market, typeCounts] = await Promise.all([
    getLatest(8),
    getUser(),
    getStateCounts(),
    getMarketStats(),
    getTypeCounts(),
  ]);
  const favorites = await getFavoriteIds(user?.id);
  const typeFilters = { auto: parseFilters("auto"), moto: parseFilters("moto") };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: brand.name,
            url: site.url,
            inLanguage: "es-MX",
            potentialAction: {
              "@type": "SearchAction",
              target: `${site.url}/autos?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      {/* Portada */}
      <section>
        <div className="container-page flex flex-col items-center pt-4 pb-14 text-center md:pt-6 md:pb-24">
          <p className="border-border bg-card mb-6 inline-flex max-w-full items-center gap-2 rounded-sm border px-3 py-1.5 text-sm font-semibold">
            <MexicoFlag className="size-5 shrink-0" />
            <span className="truncate">{marketLine(market)}</span>
          </p>
          <h1 className="text-[3.3rem] leading-[0.9] uppercase sm:text-7xl md:text-8xl lg:text-9xl">
            Tu próximo auto
            <br />o moto,
            <br />
            <span className="text-primary">sin sustos.</span>
          </h1>
          <p className="text-muted-foreground mt-6 max-w-xl text-lg md:text-xl">
            Autos y motos usados de particulares, en todo México. Gratis, sin comisión y con
            vendedores que confirman su celular.
          </p>
          <SearchBox className="mt-10 w-full max-w-2xl text-left" />
          <ul
            className="mt-6 flex flex-wrap justify-center gap-x-5 text-sm font-semibold"
            aria-label="Búsquedas frecuentes"
          >
            {[
              ["/autos/suv", "SUV"],
              ["/autos/pickup", "Pickups"],
              ["/autos/sedan", "Sedanes"],
              ["/motos/scooter", "Scooters"],
              ["/motos/trabajo", "Motos de trabajo"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href!}
                  className="hover:text-primary inline-flex min-h-11 items-center underline underline-offset-4"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Recién publicados */}
      <section className="container-page pb-14" aria-labelledby="recientes">
        <div className="rule mb-6 flex items-baseline justify-between pt-3">
          <h2 id="recientes" className="text-3xl">
            Recién publicados
          </h2>
          <Link href="/autos" className="text-sm font-semibold underline underline-offset-4">
            Ver todos los vehículos publicados
          </Link>
        </div>
        {latest.length ? (
          <ListingGrid items={latest} favorites={favorites} />
        ) : (
          <EmptyState
            title="Aún no hay autos ni motos publicados"
            hint="Publica el primero: es gratis, sin comisión y toma unos 3 minutos."
          >
            <LinkButton href="/publicar">Publicar el primero</LinkButton>
          </EmptyState>
        )}
      </section>

      <VehicleDoors counts={typeCounts} />

      {/* Presupuesto */}
      <section className="container-page pb-14" aria-labelledby="presupuesto">
        <h2 id="presupuesto" className="mb-4 text-2xl">
          Autos por presupuesto
        </h2>
        <ul className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((r) => (
            <li key={r.label}>
              <Link
                href={buildUrl({
                  ...typeFilters.auto,
                  priceMin: "min" in r ? r.min : undefined,
                  priceMax: "max" in r ? r.max : undefined,
                })}
                className="border-border bg-card hover:border-foreground inline-flex min-h-11 items-center rounded-sm border px-4 text-sm font-semibold"
              >
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Comparison />

      {/* Cómo funciona */}
      <section className="container-page py-14" aria-labelledby="como">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 id="como" className="text-4xl md:text-5xl">
              Cómo funciona
            </h2>
            <p className="text-muted-foreground mt-3 max-w-sm text-lg">
              De la foto al trato en tres pasos, sin intermediarios ni comisiones.
            </p>
            <LinkButton href="/publicar" size="lg" className="mt-6">
              Publicar mi vehículo
            </LinkButton>
          </div>
          <ol className="relative space-y-8">
            <span aria-hidden className="bg-border absolute top-6 bottom-6 left-6 w-px" />
            {STEPS.map(([title, text, Icon], i) => (
              <li key={title} className="relative flex gap-5">
                <span className="bg-foreground text-background relative z-10 grid size-12 shrink-0 place-items-center rounded-full">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="border-border bg-card flex-1 rounded-md border p-5">
                  <p className="text-muted-foreground text-sm font-semibold">Paso {i + 1}</p>
                  <h3 className="mt-1 text-2xl">{title}</h3>
                  <p className="text-muted-foreground mt-2">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Seguridad */}
      <section className="container-page pb-14" aria-labelledby="seguro">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="seguro" className="max-w-2xl text-3xl md:text-4xl">
              Comprar un usado con tranquilidad: cuatro hábitos
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              Son los que más dinero ahorran a quien compra un auto o una moto. Los recordamos en
              cada anuncio.
            </p>
          </div>
          <LinkButton href="/consejos" variant="outline" className="self-start md:self-auto">
            Leer la guía completa
          </LinkButton>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {HABITS.map(([title, text, Icon]) => (
            <li
              key={title}
              className="border-border bg-card flex gap-4 rounded-md border p-5 md:p-6"
            >
              <span className="bg-primary-soft text-primary grid size-12 shrink-0 place-items-center rounded-full">
                <Icon className="size-6" aria-hidden />
              </span>
              <div>
                <h3 className="text-xl">{title}</h3>
                <p className="text-muted-foreground mt-1">{text}</p>
                {title.includes("REPUVE") && (
                  <a
                    href={site.repuveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary mt-2 inline-block text-sm font-semibold underline"
                  >
                    Consultar el REPUVE
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Vender */}
      <section className="container-page pb-14">
        <div className="bg-foreground text-background flex flex-col gap-6 rounded-md p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="text-4xl md:text-5xl">¿Vas a vender tu auto o moto?</h2>
            <p className="mt-2 max-w-lg opacity-80">
              Es gratis, sin comisión y puedes pausarlo o borrarlo cuando quieras. Hasta{" "}
              {site.maxActivePerUser} anuncios activos por persona.
            </p>
          </div>
          <Link
            href="/publicar"
            className="font-display bg-primary text-primary-foreground inline-flex min-h-14 shrink-0 items-center rounded-sm px-8 text-xl uppercase hover:opacity-90"
          >
            Publicar
          </Link>
        </div>
      </section>

      {/* Explora */}
      <section className="container-page pb-14" aria-labelledby="explora">
        <div className="rule pt-3">
          <h2 id="explora" className="mb-6 text-3xl">
            Elige por marca o por estado
          </h2>
        </div>
        <div className="space-y-10">
          {(["auto", "moto"] as const).map((type) => (
            <div key={type}>
              <h3 className="text-muted-foreground mb-3 text-sm font-semibold">
                {type === "auto" ? "Marcas de autos" : "Marcas de motos"}
              </h3>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {logoBrands(type, type === "auto" ? 18 : undefined).map((name) => (
                  <li key={name}>
                    <Link
                      href={`/${type === "auto" ? "autos" : "motos"}/${slugify(name)}`}
                      className="border-border bg-card hover:border-foreground flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border p-4 text-center"
                    >
                      <BrandLogo name={name} className="size-9" />
                      <span className="text-sm font-semibold">{name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="text-muted-foreground mb-4 text-sm font-semibold">Por estado</h3>
            <MexicoMap counts={stateCounts} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14" aria-labelledby="faq">
        <div className="container-page max-w-3xl">
          <h2 id="faq" className="mb-6 text-3xl">
            Preguntas frecuentes
          </h2>
          <div className="divide-border border-foreground divide-y border-y-2">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                  {q}
                  <ChevronRight
                    className="size-5 shrink-0 transition-transform group-open:rotate-90"
                    aria-hidden
                  />
                </summary>
                <p className="text-muted-foreground pt-2">{a}</p>
              </details>
            ))}
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: FAQ.map(([q, a]) => ({
                  "@type": "Question",
                  name: q,
                  acceptedAnswer: { "@type": "Answer", text: a },
                })),
              }),
            }}
          />
        </div>
      </section>
    </>
  );
}
