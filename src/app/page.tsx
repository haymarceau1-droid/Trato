import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { brand } from "@/config/brand";
import { site } from "@/config/site";
import { BODY_TYPES, MOTO_TYPES, MX_STATES, PRICE_RANGES } from "@/lib/constants";
import { buildUrl, parseFilters } from "@/lib/listings/filters-url";
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
    "¿Publicar cuesta algo?",
    `No. Publicar y contactar vendedores es gratis. ${brand.name} no cobra comisiones ni interviene en el pago: tú y la otra persona cierran el trato directamente.`,
  ],
  [
    "¿Cómo sé que un vendedor es confiable?",
    "Los vendedores con el distintivo “Teléfono verificado” confirmaron su número con un código por SMS. Aun así, sigue siempre nuestros consejos: no des anticipos, revisa la factura y verifica el vehículo en el REPUVE.",
  ],
  [
    "¿Dónde veo el teléfono del vendedor?",
    "Al iniciar sesión, puedes contactar al vendedor por WhatsApp o llamada desde el anuncio. Así protegemos los números de spam.",
  ],
  [
    "¿Cuánto dura un anuncio?",
    `${site.listingTtlDays} días. Puedes renovarlo cuando quieras desde Mis anuncios, o marcarlo como vendido.`,
  ],
  [
    "¿Puedo pagar dentro de la app?",
    `No. ${brand.name} no procesa pagos ni retiene dinero. Desconfía de quien te pida pagar por adelantado o fuera de un trato en persona.`,
  ],
  [
    "Vi un anuncio sospechoso, ¿qué hago?",
    "Usa el botón Reportar en el anuncio. Nuestro equipo lo revisa y, si un anuncio recibe varios reportes, se pausa automáticamente mientras lo revisamos.",
  ],
] as const;

const BRANDS = [
  ["autos", "nissan", "Nissan"],
  ["autos", "chevrolet", "Chevrolet"],
  ["autos", "volkswagen", "Volkswagen"],
  ["autos", "toyota", "Toyota"],
  ["autos", "kia", "Kia"],
  ["autos", "mazda", "Mazda"],
  ["motos", "italika", "Italika"],
  ["motos", "honda", "Honda Motos"],
  ["motos", "yamaha", "Yamaha"],
  ["motos", "vento", "Vento"],
] as const;

const FACTS = [
  ["$0", "de comisión. Tú y la otra persona cierran el trato."],
  ["60", "días dura cada anuncio. Lo renuevas cuando quieras."],
  ["12", "fotos por anuncio, y la primera es la portada."],
  ["5", "anuncios activos por persona, para que nadie sature."],
] as const;

const STEPS = [
  [
    "Publica",
    "Sube las fotos, elige marca y modelo, pon tu precio. Son siete pasos cortos y se guarda tu borrador.",
  ],
  [
    "Te escriben",
    "Quien esté interesado entra con su cuenta y te contacta por WhatsApp o llamada desde tu anuncio.",
  ],
  ["Cierran en persona", "Lugar público, papeles a la vista, pago al entregar. Nada de anticipos."],
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
      <section className="theme-dark bg-background text-foreground">
        <div className="container-page grid gap-10 py-10 md:py-16 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="text-muted-foreground mb-4 text-sm font-semibold tracking-widest uppercase">
              Clasificados de autos y motos · México
            </p>
            <h1 className="text-5xl leading-[0.95] md:text-7xl">
              Compra y vende
              <br />
              usados.
              <br />
              <span className="text-primary">Sin estafas.</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-lg text-lg">
              Anuncios gratis, vendedores con teléfono confirmado por SMS y una regla simple: el
              dinero se mueve en persona, nunca por adelantado.
            </p>
            <SearchBox className="mt-8 max-w-xl" />
            <p className="mt-4 text-sm">
              <Link
                href="/publicar"
                className="text-primary font-semibold underline underline-offset-4"
              >
                ¿Vendes? Publica gratis en 3 minutos
              </Link>
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-1">
            {FACTS.map(([n, text]) => (
              <div key={n} className="border-border border-t-2 pt-3">
                <dt className="font-display text-primary text-5xl leading-none">{n}</dt>
                <dd className="text-muted-foreground mt-1 text-sm">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div aria-hidden className="stripes h-3" />
      </section>

      {/* Dos puertas */}
      <section className="grid md:grid-cols-2" aria-label="Categorías">
        <Link
          href="/autos"
          className="bg-primary text-primary-foreground group flex items-end justify-between gap-4 p-8 md:p-12"
        >
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
          className="theme-dark bg-background text-foreground group flex items-end justify-between gap-4 p-8 md:p-12"
        >
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
            title="Todavía no hay anuncios"
            hint="Puedes ser quien publique el primero. Toma unos 3 minutos."
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
            La mayoría de las estafas se evitan con cuatro hábitos
          </h2>
          <p className="text-muted-foreground max-w-md">
            Los repetimos en cada anuncio porque son los que más dinero ahorran. En la guía
            explicamos cómo revisar la factura y consultar el REPUVE paso a paso.
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
            <h2 className="text-4xl md:text-5xl">¿Tienes un auto o moto que vender?</h2>
            <p className="mt-2 max-w-lg opacity-90">
              Es gratis, sin comisión. Hasta {site.maxActivePerUser} anuncios activos por cuenta.
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
            Por marca y por estado
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <LinkList
            title="Marcas"
            items={BRANDS.map(([t, slug, label]) => ({ label, href: `/${t}/${slug}` }))}
          />
          <LinkList
            title="Autos por estado"
            items={MX_STATES.slice(0, 12).map((s) => ({ label: s.name, href: `/autos/${s.slug}` }))}
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-border bg-card border-t py-14" aria-labelledby="faq">
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
      <ul className="divide-border border-border divide-y border-y">
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
