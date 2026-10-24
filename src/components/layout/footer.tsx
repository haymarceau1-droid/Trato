import Link from "next/link";
import { brand } from "@/config/brand";
import { Logo } from "./logo";

const cols = [
  {
    title: "Explora",
    links: [
      ["/autos", "Autos usados"],
      ["/motos", "Motos usadas"],
      ["/autos/suv", "SUV"],
      ["/autos/pickup", "Pickups"],
    ],
  },
  {
    title: "Ayuda",
    links: [
      ["/consejos", "Consejos para comprar seguro"],
      ["/como-vender", "Cómo vender rápido"],
      ["/contacto", "Contacto"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["/terminos", "Términos y condiciones"],
      ["/privacidad", "Aviso de privacidad"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="theme-dark bg-background text-foreground mt-16 pb-24 md:pb-0">
      <div aria-hidden className="stripes h-3" />
      <div className="container-page grid gap-8 py-10 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-muted-foreground text-sm">{brand.tagline}</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h2 className="mb-3 text-sm font-bold">{c.title}</h2>
            <ul className="text-muted-foreground space-y-2 text-sm">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href!} className="hover:text-foreground inline-block py-1">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-border text-muted-foreground border-t py-4 text-center text-xs">
        © {new Date().getFullYear()} {brand.name}. {brand.name} no participa en las operaciones
        entre compradores y vendedores.
      </div>
    </footer>
  );
}
