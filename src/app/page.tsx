import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CaretRight as ChevronRight,
  Car,
  Motorcycle,
} from "@phosphor-icons/react/dist/ssr";
import { brand } from "@/config/brand";
import { site } from "@/config/site";
import { BODY_TYPES, MOTO_TYPES, MX_STATES, PRICE_RANGES } from "@/lib/constants";
import { buildUrl, parseFilters } from "@/lib/listings/filters-url";
import { BrandLogo } from "@/components/ui/brand-logo";
import { POPULAR_BRANDS } from "@/lib/catalog";
import { slugify } from "@/lib/listings/slug";
import { getFavoriteIds, getLatest, getUser } from "@/lib/listings/queries";
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
  ],
  [
    "Te escriben por WhatsApp",
    "Solo quien inicia sesión ve tu contacto. Tu número nunca aparece en Google ni en el anuncio.",
  ],
  [
    "Revisan el vehículo contigo",
    "Prueba de manejo en un lugar público, papeles a la vista y pago al entregar. Sin anticipos.",
  ],
] as const;

export default async function Home() {
  const [latest, user] = await Promise.all([getLatest(8), getUser()]);
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
        <div className="container-page flex flex-col items-center py-14 text-center md:py-24">
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
      <section className="grid md:grid-cols-2" aria-label="Categorías">
        <Link
          href="/autos"
          className="bg-card text-foreground group relative flex items-end justify-between gap-4 overflow-hidden p-8 md:p-12"
        >
          <Car
            weight="duotone"
            aria-hidden
            className="text-primary absolute -right-4 -bottom-6 size-44 opacity-30 md:size-56"
          />
          <span>
            <span className="font-display block text-4xl uppercase md:text-5xl">Autos</span>
            <span className="opacity-90">Sedanes, SUV, pickups, vans</span>
          </span>
          <ArrowUpRight
            className="size-10 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            aria-hidden
          />
        </Link>
        <Link
          href="/motos"
          className="theme-dark bg-background text-foreground group relative flex items-end justify-between gap-4 overflow-hidden p-8 md:p-12"
        >
          <Motorcycle
            weight="duotone"
            aria-hidden
            className="text-primary absolute -right-4 -bottom-6 size-44 opacity-30 md:size-56"
          />
          <span>
            <span className="font-display block text-4xl uppercase md:text-5xl">Motos</span>
            <span className="text-muted-foreground">
              Scooters, de trabajo, deportivas, choppers
            </span>
          </span>
          <ArrowUpRight
            className="size-10 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            aria-hidden
          />
        </Link>
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

      {/* Atajos de búsqueda */}
      <section className="container-page pb-14" aria-labelledby="atajos">
        <div className="rule pt-3">
          <h2 id="atajos" className="mb-6 text-3xl">
            Busca por
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <LinkList
            title="Carrocería"
            items={BODY_TYPES.map((b) => ({
              label: b.label,
              href: buildUrl({ ...typeFilters.auto, body: b.value }),
            }))}
          />
          <LinkList
            title="Tipo de moto"
            items={MOTO_TYPES.map((b) => ({
              label: b.label,
              href: buildUrl({ ...typeFilters.moto, body: b.value }),
            }))}
          />
          <LinkList
            title="Presupuesto (autos)"
            items={PRICE_RANGES.map((r) => ({
              label: r.label,
              href: buildUrl({
                ...typeFilters.auto,
                priceMin: "min" in r ? r.min : undefined,
                priceMax: "max" in r ? r.max : undefined,
              }),
            }))}
          />
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-border bg-card border-y py-14" aria-labelledby="como">
        <div className="container-page">
          <h2 id="como" className="mb-8 text-3xl">
            Cómo funciona
          </h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span aria-hidden className="font-display text-primary text-6xl leading-none">
                  {i + 1}
                </span>
                <div>
                  <h3 className="mb-1 text-xl">{title}</h3>
                  <p className="text-muted-foreground">{text}</p>
                </div>
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
        <div className="bg-primary text-primary-foreground flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="text-4xl md:text-5xl">¿Vas a vender tu auto o moto?</h2>
            <p className="mt-2 max-w-lg opacity-90">
              Es gratis, sin comisión y puedes pausarlo o borrarlo cuando quieras. Hasta{" "}
              {site.maxActivePerUser} anuncios activos por persona.
            </p>
          </div>
          <Link
            href="/publicar"
            className="font-display inline-flex min-h-14 shrink-0 items-center bg-[#0a0a0a] px-8 text-xl text-white uppercase hover:opacity-90"
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
                {POPULAR_BRANDS[type].map((name) => (
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
          <LinkList
            title="Autos por estado (los 32)"
            items={MX_STATES.map((s) => ({ label: s.name, href: `/autos/${s.slug}` }))}
          />
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

function LinkList({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-widest uppercase">
        {title}
      </h3>
      <ul
        className={`divide-border border-border divide-y border-y ${items.length > 12 ? "sm:columns-2" : ""}`}
      >
        {items.map((i) => (
          <li key={i.label}>
            <Link
              href={i.href}
              className="hover:text-primary flex min-h-11 items-center justify-between py-2 font-medium"
            >
              {i.label}
              <ChevronRight className="size-4 opacity-40" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
