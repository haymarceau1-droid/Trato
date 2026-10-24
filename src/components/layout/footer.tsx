import Link from "next/link";
import { EnvelopeSimple, MapPin, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { brand } from "@/config/brand";
import { LinkButton } from "@/components/ui/button";
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

export function Footer() {
  return (
    <footer className="theme-dark bg-background text-foreground mt-16 overflow-hidden pb-24 md:pb-0">
      <div aria-hidden className="stripes h-3" />

      {/* Llamada a la acción */}
      <div className="container-page border-border flex flex-col gap-6 border-b py-12 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl space-y-4">
          <h2 className="text-4xl leading-none md:text-5xl">
            Tu siguiente auto o moto está a un mensaje.
          </h2>
          <p className="text-muted-foreground">
            Busca con calma, revisa en persona y paga al recibirlo. Nosotros cuidamos el resto.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/autos" size="lg">
            Ver autos
          </LinkButton>
          <LinkButton href="/motos" size="lg" variant="outline">
            Ver motos
          </LinkButton>
        </div>
      </div>

      {/* Enlaces */}
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="text-muted-foreground max-w-xs text-sm">{brand.tagline}</p>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <EnvelopeSimple className="size-4" aria-hidden />
              <a href={`mailto:${brand.contactEmail}`} className="hover:text-foreground underline">
                {brand.contactEmail}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden /> Hecho en México, para todo México
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4" aria-hidden /> Sin comisiones. Sin anticipos.
            </li>
          </ul>
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

      {/* Marca grande + legal */}
      <div
        aria-hidden
        className="font-display text-foreground/10 -mb-[0.12em] text-center text-[26vw] leading-[0.8] tracking-wide uppercase select-none md:text-[18vw]"
      >
        {brand.name}
      </div>
      <div className="border-border text-muted-foreground container-page flex flex-col items-center justify-between gap-2 border-t py-4 text-xs md:flex-row">
        <p>
          © {new Date().getFullYear()} {brand.name}. {brand.name} no participa en las operaciones
          entre compradores y vendedores.
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
