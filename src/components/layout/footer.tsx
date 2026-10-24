import Link from "next/link";
import {
  ArrowUpRight,
  EnvelopeSimple,
  HandCoins,
  Handshake,
  SealCheck,
} from "@phosphor-icons/react/dist/ssr";
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

export function Footer() {
  return (
    <footer className="theme-dark bg-background text-foreground mt-24 pb-24 md:pb-0">
      {/* Tarjeta que sobresale del pie */}
      <div className="container-page -translate-y-1/2">
        <div className="flex flex-col gap-6 rounded-md bg-[#d4141c] p-8 text-white shadow-2xl shadow-black/30 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-xl">
            <h2 className="text-3xl leading-none md:text-5xl">
              Tu siguiente auto o moto está a un mensaje.
            </h2>
            <p className="mt-3 opacity-90">
              Busca con calma, revisa en persona y paga al recibirlo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/autos"
              className="font-display inline-flex min-h-12 items-center gap-2 rounded-sm bg-[#0a0a0a] px-6 text-lg text-white uppercase hover:opacity-90"
            >
              Ver autos <ArrowUpRight className="size-5" aria-hidden />
            </Link>
            <Link
              href="/motos"
              className="font-display inline-flex min-h-12 items-center gap-2 rounded-sm border-2 border-current px-6 text-lg uppercase hover:bg-black/10"
            >
              Ver motos <ArrowUpRight className="size-5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      {/* Promesas */}
      <ul className="container-page -mt-12 grid gap-6 pb-12 md:grid-cols-3">
        {promises.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="bg-primary-soft text-primary grid size-11 shrink-0 place-items-center rounded-sm">
              <Icon weight="duotone" className="size-6" aria-hidden />
            </span>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-muted-foreground text-sm">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Enlaces */}
      <div className="container-page border-border grid gap-10 border-t py-12 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div className="space-y-4">
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
          <nav key={c.title} aria-label={c.title}>
            <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
              {c.title}
            </h3>
            <ul className="space-y-1 text-sm">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href!} className="hover:text-primary inline-block py-1.5 font-medium">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Estados */}
      <nav aria-label="Autos por estado" className="container-page border-border border-t py-8">
        <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
          Autos usados por estado
        </h3>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {MX_STATES.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/autos/${s.slug}`}
                className="text-muted-foreground hover:text-foreground inline-block py-1"
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Marca grande + legal */}
      <div aria-hidden className="relative overflow-hidden">
        <div className="font-display from-foreground/15 -mb-[0.1em] bg-gradient-to-b to-transparent bg-clip-text text-center text-[26vw] leading-[0.8] tracking-wide text-transparent uppercase select-none md:text-[18vw]">
          {brand.name}
        </div>
      </div>
      <div className="border-border text-muted-foreground container-page flex flex-col items-center justify-between gap-2 border-t py-4 text-xs md:flex-row">
        <p>
          © {new Date().getFullYear()} {brand.name}. Hecho en México. {brand.name} no participa en
          las operaciones entre compradores y vendedores.
        </p>
        <p className="flex gap-4">
          <Link href="/terminos" className="hover:text-foreground underline">
            Términos
          </Link>
          <Link href="/privacidad" className="hover:text-foreground underline">
            Privacidad
          </Link>
        </p>
      </div>
    </footer>
  );
}
