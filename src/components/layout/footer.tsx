import Link from "next/link";
import {
  ArrowUpRight,
  EnvelopeSimple,
  HandCoins,
  Handshake,
  SealCheck,
} from "@/components/ui/icons";
import { brand } from "@/config/brand";
import { MX_STATES } from "@/lib/constants";
import { Logo } from "./logo";

const cols = [
  {
    title: "Autos",
    links: [
      ["/autos", "Todos los autos"],
      ["/autos/sedan", "Sedanes"],
      ["/autos/suv", "SUV"],
      ["/autos/pickup", "Pickups"],
      ["/autos/hatchback", "Hatchbacks"],
    ],
  },
  {
    title: "Motos",
    links: [
      ["/motos", "Todas las motos"],
      ["/motos/scooter", "Scooters"],
      ["/motos/trabajo", "De trabajo"],
      ["/motos/deportiva", "Deportivas"],
      ["/motos/doble-proposito", "Doble propósito"],
    ],
  },
  {
    title: "Compra y vende bien",
    links: [
      ["/consejos", "Consejos para comprar seguro"],
      ["/como-vender", "Cómo vender rápido"],
      ["/precios", "Precios y planes"],
      ["/publicar", "Publicar mi vehículo"],
      ["/contacto", "Contacto"],
    ],
  },
];

const promises = [
  {
    icon: SealCheck,
    title: "Celular verificado",
    text: "Cada vendedor confirma su número por SMS.",
  },
  { icon: HandCoins, title: "Cero comisiones", text: "Vender y comprar aquí no te cuesta nada." },
  { icon: Handshake, title: "Pago en persona", text: "Revisas el vehículo y pagas al recibirlo." },
];

function StateLinks() {
  return (
    <ul className="flex flex-wrap gap-x-4 text-sm">
      {MX_STATES.map((s) => (
        <li key={s.slug}>
          <Link
            href={`/autos/${s.slug}`}
            className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center"
          >
            {s.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer className="theme-dark bg-background text-foreground mt-16 pb-24 md:pb-0">
      {/* Tarjeta que sobresale del pie */}
      <div className="container-page pt-14">
        <div className="bg-primary text-primary-foreground flex flex-col gap-4 rounded-md p-5 md:flex-row md:items-center md:justify-between md:gap-6 md:p-10">
          <div className="max-w-xl">
            <h2 className="text-2xl leading-none md:text-5xl">
              Tu siguiente auto o moto está a un mensaje.
            </h2>
            <p className="mt-2 text-sm opacity-90 md:mt-3 md:text-base">
              Busca con calma, revisa en persona y paga al recibirlo.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap">
            <Link
              href="/autos"
              className="font-display inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#0a0a0a] px-3 text-base text-white uppercase hover:opacity-90 md:min-h-12 md:px-6 md:text-lg"
            >
              Ver autos <ArrowUpRight className="size-5" aria-hidden />
            </Link>
            <Link
              href="/motos"
              className="font-display inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border-2 border-current px-3 text-base uppercase hover:bg-black/10 md:min-h-12 md:px-6 md:text-lg"
            >
              Ver motos <ArrowUpRight className="size-5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      {/* Promesas */}
      <ul className="container-page grid grid-cols-3 gap-3 py-8 md:gap-6 md:py-12">
        {promises.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex flex-col items-center gap-2 text-center md:flex-row md:items-start md:gap-3 md:text-left"
          >
            <span className="bg-primary-soft text-primary grid size-11 shrink-0 place-items-center rounded-sm">
              <Icon weight="duotone" className="size-6" aria-hidden />
            </span>
            <div>
              <p className="text-sm leading-tight font-semibold md:text-base">{title}</p>
              <p className="text-muted-foreground hidden text-sm md:block">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Enlaces */}
      <div className="container-page border-border grid grid-cols-2 gap-x-6 gap-y-6 border-t py-8 md:grid-cols-[1.3fr_repeat(3,1fr)] md:gap-10 md:py-12">
        <div className="col-span-2 space-y-4 md:col-span-1">
          <Logo />
          <p className="text-muted-foreground max-w-xs text-sm">{brand.tagline}</p>
          <a
            href={`mailto:${brand.contactEmail}`}
            className="border-border hover:border-foreground inline-flex min-h-11 items-center gap-2 rounded-sm border px-4 text-sm font-medium"
          >
            <EnvelopeSimple className="size-4" aria-hidden /> {brand.contactEmail}
          </a>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title} className="last:col-span-2 md:last:col-span-1">
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold">{c.title}</h3>
            <ul className="text-sm">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href!}
                    className="hover:text-primary inline-flex min-h-11 min-w-11 items-center font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Estados: plegable en móvil para que el pie no sea interminable */}
      <nav
        aria-label="Autos por estado"
        className="container-page border-border border-t py-2 md:py-8"
      >
        <details className="group md:hidden">
          <summary className="text-muted-foreground flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold">
            Autos usados por estado
            <span aria-hidden className="transition-transform group-open:rotate-90">
              ›
            </span>
          </summary>
          <StateLinks />
        </details>
        <div className="hidden md:block">
          <h3 className="text-muted-foreground mb-3 text-sm font-semibold">
            Autos usados por estado
          </h3>
          <StateLinks />
        </div>
      </nav>

      {/* Marca grande + legal */}
      <div aria-hidden className="relative overflow-hidden">
        <div className="font-display from-foreground/15 -mb-[0.1em] bg-gradient-to-b to-transparent bg-clip-text text-center text-[17vw] leading-[0.8] tracking-wide text-transparent uppercase select-none md:text-[24vw]">
          {brand.name}
        </div>
      </div>
      <div className="border-border text-muted-foreground container-page flex flex-col items-center justify-between gap-2 border-t py-4 text-xs md:flex-row">
        <p>
          © {new Date().getFullYear()} {brand.name}. Hecho en México. {brand.name} no participa en
          las operaciones entre compradores y vendedores.
        </p>
        <p className="flex flex-wrap justify-center gap-x-5">
          {[
            ["/terminos", "Términos"],
            ["/privacidad", "Privacidad"],
            ["/cookies", "Cookies"],
            ["/privacidad#arco", "Derechos ARCO"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href!}
              className="hover:text-foreground inline-flex min-h-11 items-center underline"
            >
              {label}
            </Link>
          ))}
        </p>
      </div>
    </footer>
  );
}
