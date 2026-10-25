import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CaretRight as ChevronRight,
  Handshake,
  ImageSquare,
  Phone,
  ShieldCheck,
} from "@/components/ui/icons";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";
import { BODY_TYPES, MOTO_TYPES, PRICE_RANGES } from "@/lib/constants";
import { buildUrl, parseFilters } from "@/lib/listings/filters-url";
import { BodyIcon } from "@/components/ui/body-icon";
import { BrandLogo } from "@/components/ui/brand-logo";
import { MexicoMap } from "@/components/home/mexico-map";
import { logoBrands } from "@/lib/brand-picks";
import { marketLine } from "@/lib/market-line";
import { slugify } from "@/lib/listings/slug";
import {
  getFavoriteIds,
  getLatest,
  getMarketStats,
  getStateCounts,
  getUser,
} from "@/lib/listings/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { ListingGrid } from "@/components/listings/listing-card";
import { SearchBox } from "@/components/listings/search-box";
import { ScamTips } from "@/components/trust/scam-tips";

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
  const [latest, user, stateCounts, market] = await Promise.all([
    getLatest(8),
    getUser(),
    getStateCounts(),
    getMarketStats(),
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
            <ShieldCheck className="text-primary size-4 shrink-0" aria-hidden />
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

      {/* Dos puertas */}
      <section className="container-page grid gap-4 pb-4 md:grid-cols-2" aria-label="Categorías">
        {(
          [
            {
              type: "auto",
              href: "/autos",
              title: "Autos",
              hint: "Sedanes, SUV, pickups y vans",
              dark: false,
            },
            {
              type: "moto",
              href: "/motos",
              title: "Motos",
              hint: "Scooters, de trabajo, deportivas y choppers",
              dark: true,
            },
          ] as const
        ).map(({ type, href, title, hint, dark }) => (
          <Link
            key={type}
            href={href}
            className={cn(
              "group flex min-h-72 flex-col justify-between rounded-md border-2 p-6 transition-colors md:p-8",
              dark
                ? "theme-dark bg-background text-foreground hover:border-primary border-[#0a0a0a]"
                : "border-border bg-card text-foreground hover:border-primary",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
                {hint}
              </p>
              <ArrowUpRight
                className="group-hover:text-primary size-8 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                aria-hidden
              />
            </div>
            <div>
              <h2 className="text-7xl leading-[0.85] uppercase md:text-8xl">{title}</h2>
              <ul
                aria-label={`Marcas de ${title.toLowerCase()}`}
                className="text-muted-foreground mt-6 flex flex-wrap items-center gap-x-6 gap-y-3"
              >
                {logoBrands(type, 6).map((name) => (
                  <li key={name} title={name} className="flex items-center gap-2">
                    <BrandLogo name={name} className="size-7" />
                    <span className="sr-only">{name}</span>
                  </li>
                ))}
                <li className="text-sm font-semibold underline underline-offset-4">y muchas más</li>
              </ul>
            </div>
          </Link>
        ))}
      </section>

      {/* Recién publicados */}
      <section className="container-page py-14" aria-labelledby="recientes">
        <div className="rule mb-6 flex items-baseline justify-between pt-3">
          <h2 id="recientes" className="text-3xl">
            Recién publicados
          </h2>
          <Link href="/autos" className="text-sm font-semibold underline underline-offset-4">
            Ver todos
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

      {/* Explora por tipo */}
      <section className="container-page pb-14" aria-labelledby="atajos">
        <h2 id="atajos" className="mb-5 text-3xl">
          Explora por tipo
        </h2>
        <TypeRail
          label="Autos"
          items={BODY_TYPES.map((b) => ({
            value: b.value,
            label: b.label,
            href: buildUrl({ ...typeFilters.auto, body: b.value }),
          }))}
        />
        <TypeRail
          label="Motos"
          items={MOTO_TYPES.map((b) => ({
            value: b.value,
            label: b.label,
            href: buildUrl({ ...typeFilters.moto, body: b.value }),
          }))}
        />
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground mr-1 w-full text-sm font-semibold md:w-auto">
            Autos por presupuesto
          </span>
          {PRICE_RANGES.map((r) => (
            <Link
              key={r.label}
              href={buildUrl({
                ...typeFilters.auto,
                priceMin: "min" in r ? r.min : undefined,
                priceMax: "max" in r ? r.max : undefined,
              })}
              className="border-border bg-card hover:border-foreground inline-flex min-h-11 items-center rounded-sm border px-4 text-sm font-semibold"
            >
              {r.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-border bg-card border-y py-14" aria-labelledby="como">
        <div className="container-page">
          <h2 id="como" className="mb-8 text-3xl">
            Cómo funciona
          </h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {STEPS.map(([title, text, Icon], i) => (
              <li key={title}>
                <span className="bg-foreground text-background grid size-12 place-items-center rounded-md">
                  <Icon className="size-6" aria-hidden />
                </span>
                <p className="text-muted-foreground mt-4 text-xs font-semibold tracking-widest uppercase">
                  Paso {i + 1}
                </p>
                <h3 className="mt-1 mb-1 text-xl">{title}</h3>
                <p className="text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Seguridad */}
      <section
        className="container-page grid gap-8 py-14 lg:grid-cols-2 lg:items-start"
        aria-labelledby="seguro"
      >
        <div className="space-y-4">
          <h2 id="seguro" className="text-3xl md:text-4xl">
            Comprar un usado con tranquilidad: cuatro hábitos
          </h2>
          <p className="text-muted-foreground max-w-md">
            Son los que más dinero ahorran a quien compra un auto o una moto. Los recordamos en cada
            anuncio y en la guía te explicamos, paso a paso, cómo revisar la factura y consultar el
            REPUVE.
          </p>
          <LinkButton href="/consejos" variant="outline">
            Leer la guía
          </LinkButton>
        </div>
        <ScamTips showRepuve />
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
              <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-widest uppercase">
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
            <h3 className="text-muted-foreground mb-4 text-sm font-semibold tracking-widest uppercase">
              Por estado
            </h3>
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

function TypeRail({
  label,
  items,
}: {
  label: string;
  items: { value: string; label: string; href: string }[];
}) {
  return (
    <div className="mt-4 first-of-type:mt-0">
      <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-widest uppercase">
        {label}
      </h3>
      <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-7 md:overflow-visible md:px-0">
        {items.map((t) => (
          <li key={t.value} className="shrink-0 md:shrink">
            <Link
              href={t.href}
              className="border-border bg-card hover:border-foreground flex w-28 flex-col items-center gap-2 rounded-md border px-2 py-4 text-sm font-semibold transition-colors md:w-full"
            >
              <BodyIcon value={t.value} className="h-9 w-14" />
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
