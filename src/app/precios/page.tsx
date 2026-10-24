import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { site } from "@/config/site";
import { CaretRight, Check } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Precios",
  description: `Publicar tu auto o moto es gratis (hasta ${site.maxActivePerUser} anuncios). Impulsa tu anuncio desde $200 MXN o publica como negocio con un plan mensual.`,
  alternates: { canonical: "/precios" },
};

const money = (n: number) => `$${n.toLocaleString("es-MX")}`;
const mail = (subject: string) =>
  `mailto:${brand.contactEmail}?subject=${encodeURIComponent(subject)}`;

/** Impulsos por anuncio (para particulares y negocios). */
const BOOSTS = [
  { days: 7, price: 200, hint: "Para venderlo esta semana" },
  { days: 15, price: 350, hint: "El más elegido", featured: true },
  { days: 30, price: 600, hint: "Máxima visibilidad" },
] as const;

/** Planes mensuales para negocios (precios sin IVA). */
const PLANS = [
  {
    name: "Profesional",
    price: 1490,
    who: "Lotes y vendedores independientes",
    features: [
      "Hasta 30 anuncios activos",
      "Perfil de negocio verificado con tu logo",
      "2 impulsos de 7 días incluidos al mes",
      "Estadísticas de vistas y contactos",
    ],
  },
  {
    name: "Agencia",
    price: 3990,
    who: "Agencias y grupos con varias sucursales",
    featured: true,
    features: [
      "Hasta 100 anuncios activos",
      "Varias personas en la misma cuenta",
      "10 impulsos de 7 días incluidos al mes",
      "Carga masiva de inventario por archivo",
      "Soporte prioritario",
    ],
  },
  {
    name: "A la medida",
    price: null,
    who: "Distribuidores y redes con inventario grande",
    features: [
      "Más de 100 anuncios activos",
      "Integración con tu sistema de inventario",
      "Condiciones y facturación acordadas contigo",
    ],
  },
] as const;

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2.5 text-[15px]">
      {items.map((i) => (
        <li key={i} className="flex items-start gap-3">
          <Check weight="bold" className="text-primary mt-1 size-4 shrink-0" aria-hidden />
          {i}
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  return (
    <>
      <section className="container-page py-14 text-center md:py-20">
        <h1 className="mx-auto max-w-4xl text-5xl leading-[0.95] uppercase md:text-7xl">
          Gratis para ti. <span className="text-primary">Pagas solo si quieres más.</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
          {brand.name} no cobra comisión por tus ventas. Publicar es gratis para particulares; si
          quieres vender más rápido, o eres un negocio, hay opciones sencillas.
        </p>
        <p
          role="note"
          className="border-border bg-card mx-auto mt-6 inline-block rounded-sm border px-3 py-1.5 text-sm font-semibold"
        >
          Los pagos se activan muy pronto. Hoy todo es gratis mientras abrimos.
        </p>
      </section>

      {/* Particulares */}
      <section className="container-page pb-14" aria-labelledby="particulares">
        <div className="border-foreground bg-card grid gap-8 rounded-md border-2 p-6 md:grid-cols-[1fr_1.1fr] md:p-10">
          <div>
            <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
              Particulares
            </p>
            <h2 id="particulares" className="mt-2 text-6xl leading-none md:text-7xl">
              $0
            </h2>
            <p className="mt-3 text-lg font-semibold">
              Hasta {site.maxActivePerUser} anuncios activos, siempre gratis.
            </p>
            <p className="text-muted-foreground mt-2">
              Sin comisión cuando vendes, sin cuota mensual y sin letra pequeña. Si ya tienes{" "}
              {site.maxActivePerUser} activos, marca uno como vendido o pausa otro y publicas el
              siguiente.
            </p>
            <LinkButton href="/publicar" size="lg" className="mt-6">
              Publicar gratis
            </LinkButton>
          </div>
          <Bullets
            items={[
              `Hasta ${site.maxActivePerUser} anuncios activos al mismo tiempo`,
              `Hasta ${site.maxPhotos} fotos por anuncio`,
              `${site.listingTtlDays} días de duración, renovables cuando quieras`,
              "Contacto directo por WhatsApp y llamada",
              "Distintivo de celular verificado",
              "Editar, pausar o borrar sin costo",
              "Consejos y avisos anti-estafa en cada anuncio",
            ]}
          />
        </div>
      </section>

      {/* Impulsos */}
      <section className="container-page pb-14" aria-labelledby="impulso">
        <div className="rule pt-3">
          <h2 id="impulso" className="text-3xl md:text-4xl">
            Impulsa tu anuncio desde {money(200)}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            ¿Tienes prisa? Un anuncio impulsado aparece primero en los resultados y lleva la
            etiqueta “Destacado”. Lo puede pedir cualquiera, particular o negocio, anuncio por
            anuncio. Si no lo impulsas, tu anuncio sigue visible igual.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {BOOSTS.map((b) => (
            <li
              key={b.days}
              className={cn(
                "flex flex-col rounded-md border-2 p-6",
                "featured" in b && b.featured ? "border-primary bg-card" : "border-border bg-card",
              )}
            >
              <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
                {b.hint}
              </p>
              <p className="font-display mt-3 text-5xl leading-none">{money(b.price)}</p>
              <p className="text-muted-foreground mt-1 text-sm">MXN por anuncio</p>
              <p className="mt-4 text-lg font-bold">{b.days} días destacado</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Primero en los resultados y con etiqueta “Destacado”.
              </p>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-4 text-sm">
          Pago único por impulso. No se renueva solo ni se cobra nada sin que tú lo pidas.
        </p>
      </section>

      {/* Negocios */}
      <section className="container-page pb-14" aria-labelledby="negocios">
        <div className="rule pt-3">
          <h2 id="negocios" className="text-3xl md:text-4xl">
            Para negocios: lotes, agencias y distribuidores
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Si vendes vehículos como negocio, el plan mensual quita el límite de{" "}
            {site.maxActivePerUser} anuncios y te da un perfil verificado, impulsos incluidos y
            herramientas para manejar tu inventario. Sigue sin haber comisión por venta.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 lg:grid-cols-3">
          {PLANS.map((p) => (
            <li
              key={p.name}
              className={cn(
                "flex flex-col rounded-md border-2 p-6",
                "featured" in p && p.featured
                  ? "theme-dark bg-background text-foreground border-[#0a0a0a]"
                  : "border-border bg-card",
              )}
            >
              <h3 className="text-2xl">{p.name}</h3>
              <p className="text-muted-foreground text-sm">{p.who}</p>
              <p className="mt-5">
                {p.price ? (
                  <>
                    <span className="font-display text-5xl leading-none">{money(p.price)}</span>
                    <span className="text-muted-foreground text-sm"> MXN/mes + IVA</span>
                  </>
                ) : (
                  <span className="font-display text-4xl leading-none">Hablemos</span>
                )}
              </p>
              <div className="my-6 flex-1">
                <Bullets items={p.features} />
              </div>
              <LinkButton
                href={mail(`Plan ${p.name} (${brand.name})`)}
                variant={"featured" in p && p.featured ? "primary" : "outline"}
                className="w-full"
              >
                {p.price ? "Quiero este plan" : "Contactar ventas"}
              </LinkButton>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-4 text-sm">
          Precios en pesos mexicanos más IVA. Cancelas cuando quieras: tus anuncios pasan al plan
          gratuito (los {site.maxActivePerUser} más recientes siguen activos).
        </p>
      </section>

      {/* Preguntas */}
      <section className="container-page max-w-3xl pb-16" aria-labelledby="dudas">
        <h2 id="dudas" className="mb-4 text-3xl">
          Dudas sobre los precios
        </h2>
        <div className="divide-border border-foreground divide-y border-y-2">
          {[
            [
              "¿Cobran comisión cuando vendo?",
              `No. Nunca. ${brand.name} no toca tu dinero: el pago lo haces tú con el comprador, en persona.`,
            ],
            [
              "¿Qué pasa si publico más de 5 anuncios como particular?",
              `El límite gratuito es de ${site.maxActivePerUser} anuncios activos a la vez. Para más, el plan Profesional o superior te quita ese límite.`,
            ],
            [
              "¿Impulsar garantiza que se venda?",
              "No lo garantiza: le da más visibilidad. Un buen precio, buenas fotos y una descripción clara siguen siendo lo que cierra la venta.",
            ],
            [
              "¿Cuándo se activan los pagos?",
              `Muy pronto. Escríbenos a ${brand.contactEmail} y te avisamos, o para reservar tu plan de negocio.`,
            ],
          ].map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                {q}
                <CaretRight
                  className="size-5 shrink-0 transition-transform group-open:rotate-90"
                  aria-hidden
                />
              </summary>
              <p className="text-muted-foreground pt-2">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
