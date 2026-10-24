import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Camera,
  ChevronRight,
  Flag,
  MessageCircle,
  ShieldCheck,
  Tag,
  Wallet,
} from "lucide-react";
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

      {/* Hero */}
      <section className="border-border from-primary-soft to-background border-b bg-gradient-to-b">
        <div className="container-page grid gap-8 py-10 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="bg-card text-primary inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold shadow-sm">
              <BadgeCheck className="size-4" aria-hidden /> Vendedores con teléfono verificado
            </p>
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight md:text-5xl">
              Compra y vende <span className="text-primary">autos y motos usados</span>, sin
              estafas.
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg">
              Encuentra tu próximo vehículo o véndelo gratis. Sin comisiones, directo con la otra
              persona y con consejos para cuidar tu dinero.
            </p>
            <SearchBox className="max-w-xl" />
            <div className="flex flex-wrap gap-2">
              <LinkButton href="/publicar" size="lg">
                Publica gratis en 3 minutos
              </LinkButton>
              <LinkButton href="/consejos" size="lg" variant="outline">
                Consejos para comprar seguro
              </LinkButton>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3 text-sm" aria-label="Ventajas">
            {[
              [Wallet, "100 % gratis", "Sin comisiones ni cargos ocultos"],
              [ShieldCheck, "Más confianza", "Teléfono verificado por SMS"],
              [MessageCircle, "Directo por WhatsApp", "Habla con el vendedor al instante"],
              [Flag, "Moderación activa", "Reportes revisados por personas"],
            ].map(([Icon, title, hint]) => {
              const I = Icon as typeof Wallet;
              return (
                <li
                  key={title as string}
                  className="border-border bg-card rounded-2xl border p-4 shadow-sm"
                >
                  <I className="text-primary mb-2 size-6" aria-hidden />
                  <p className="font-bold">{title as string}</p>
                  <p className="text-muted-foreground">{hint as string}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Atajos */}
      <section className="container-page space-y-8 py-12" aria-labelledby="atajos">
        <h2 id="atajos" className="text-2xl font-extrabold">
          ¿Qué buscas?
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              href: "/autos",
              title: "Autos usados",
              hint: "Sedanes, SUV, pickups y más",
              emoji: "🚗",
            },
            {
              href: "/motos",
              title: "Motos usadas",
              hint: "Scooters, deportivas, de trabajo",
              emoji: "🏍️",
            },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group border-border bg-card flex items-center justify-between rounded-2xl border p-6 transition-shadow hover:shadow-md"
            >
              <div>
                <p className="text-xl font-extrabold">{c.title}</p>
                <p className="text-muted-foreground text-sm">{c.hint}</p>
              </div>
              <span className="flex items-center gap-2 text-4xl" aria-hidden>
                {c.emoji}
                <ChevronRight className="text-muted-foreground group-hover:text-primary size-6" />
              </span>
            </Link>
          ))}
        </div>

        <div className="space-y-5">
          <ChipRow
            title="Autos por carrocería"
            items={BODY_TYPES.map((b) => ({
              label: b.label,
              href: buildUrl({ ...typeFilters.auto, body: b.value }),
            }))}
          />
          <ChipRow
            title="Motos por tipo"
            items={MOTO_TYPES.map((b) => ({
              label: b.label,
              href: buildUrl({ ...typeFilters.moto, body: b.value }),
            }))}
          />
          <ChipRow
            title="Autos por presupuesto"
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

      {/* Últimos anuncios */}
      <section className="container-page pb-12" aria-labelledby="recientes">
        <div className="mb-4 flex items-end justify-between">
          <h2 id="recientes" className="text-2xl font-extrabold">
            Últimos anuncios
          </h2>
          <Link
            href="/autos"
            className="text-primary min-h-11 py-2 text-sm font-semibold hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        {latest.length ? (
          <ListingGrid items={latest} favorites={favorites} />
        ) : (
          <EmptyState
            title="Aún no hay anuncios"
            hint="Sé la primera persona en publicar. Es gratis y toma 3 minutos."
          >
            <LinkButton href="/publicar">Publicar mi anuncio</LinkButton>
          </EmptyState>
        )}
      </section>

      {/* Cómo funciona */}
      <section className="border-border bg-card border-y py-14" aria-labelledby="como">
        <div className="container-page">
          <h2 id="como" className="mb-8 text-center text-2xl font-extrabold">
            Así de fácil funciona
          </h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {[
              [
                Camera,
                "1. Publica",
                "Sube fotos, elige marca, modelo y precio. Te guiamos paso a paso.",
              ],
              [
                MessageCircle,
                "2. Conecta",
                "Los interesados te escriben por WhatsApp o te llaman desde tu anuncio.",
              ],
              [
                Tag,
                "3. Cierra con seguridad",
                "Reúnanse en un lugar público, revisen papeles y concreten el trato.",
              ],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Camera;
              return (
                <li key={title as string} className="space-y-3 text-center">
                  <span className="bg-primary-soft text-primary mx-auto grid size-14 place-items-center rounded-2xl">
                    <I className="size-7" aria-hidden />
                  </span>
                  <h3 className="text-lg font-bold">{title as string}</h3>
                  <p className="text-muted-foreground">{text as string}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Confianza */}
      <section
        className="container-page grid gap-6 py-14 lg:grid-cols-2 lg:items-center"
        aria-labelledby="seguro"
      >
        <div className="space-y-3">
          <h2 id="seguro" className="text-2xl font-extrabold">
            Comprar usado sin sustos
          </h2>
          <p className="text-muted-foreground">
            Las estafas con autos usados existen, pero se evitan con cuatro hábitos. Los repetimos
            en cada anuncio para que no se te pasen.
          </p>
          <LinkButton href="/consejos" variant="outline">
            Leer la guía completa
          </LinkButton>
        </div>
        <ScamTips showRepuve />
      </section>

      {/* CTA vendedor */}
      <section className="container-page pb-14">
        <div className="bg-primary text-primary-foreground flex flex-col items-start justify-between gap-5 rounded-3xl p-8 md:flex-row md:items-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold md:text-3xl">¿Vas a vender tu auto o moto?</h2>
            <p className="opacity-90">
              Publica gratis en 3 minutos y recibe contactos directos. Hasta {site.maxActivePerUser}{" "}
              anuncios activos por cuenta.
            </p>
          </div>
          <Link
            href="/publicar"
            className="bg-card text-primary inline-flex min-h-12 shrink-0 items-center rounded-xl px-6 text-base font-bold hover:opacity-90"
          >
            Publicar ahora
          </Link>
        </div>
      </section>

      {/* Explora */}
      <section className="container-page space-y-6 pb-14" aria-labelledby="explora">
        <h2 id="explora" className="text-2xl font-extrabold">
          Explora por marca y estado
        </h2>
        <ChipRow
          title="Marcas populares"
          items={BRANDS.map(([t, slug, label]) => ({ label, href: `/${t}/${slug}` }))}
        />
        <ChipRow
          title="Autos usados por estado"
          items={MX_STATES.slice(0, 12).map((s) => ({ label: s.name, href: `/autos/${s.slug}` }))}
        />
      </section>

      {/* FAQ */}
      <section className="border-border bg-card border-t py-14" aria-labelledby="faq">
        <div className="container-page max-w-3xl">
          <h2 id="faq" className="mb-6 text-2xl font-extrabold">
            Preguntas frecuentes
          </h2>
          <div className="divide-border border-border divide-y rounded-2xl border">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group p-4">
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

function ChipRow({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-muted-foreground mb-2 text-sm font-semibold">{title}</h3>
      <ul className="flex flex-wrap gap-2">
        {items.map((i) => (
          <li key={i.label}>
            <Link
              href={i.href}
              className="border-border bg-card hover:border-primary hover:text-primary inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium"
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
