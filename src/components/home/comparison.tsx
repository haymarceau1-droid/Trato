import { Car, Check, Gauge, HandCoins, ShieldCheck } from "@/components/ui/icons";
import { FacebookIcon } from "@/components/ui/facebook-icon";
import { LinkButton } from "@/components/ui/button";
import { brand } from "@/config/brand";

type Cell = { ok?: boolean; text: string };
const BENEFITS = [
  [
    ShieldCheck,
    "Vendedores más confiables",
    "Los vendedores confirman su celular por SMS y lo ves con un distintivo en su perfil.",
  ],
  [
    Gauge,
    "Sabes cómo está antes de ir",
    "Cada anuncio trae la calificación del vendedor de 0 a 100 para carrocería y mecánica.",
  ],
  [
    Car,
    "Todo es de autos y motos",
    "Filtras por marca, modelo, año, carrocería y estado sin ruido de otros productos.",
  ],
] as const;

const ROWS: { label: string; us: Cell; them: Cell }[] = [
  {
    label: "Enfoque",
    us: { ok: true, text: "Solo autos y motos" },
    them: { text: "Todo tipo de productos" },
  },
  {
    label: "Vendedor",
    us: { ok: true, text: "Celular verificado por SMS, con distintivo" },
    them: { text: "Depende del perfil de Facebook" },
  },
  {
    label: "Contacto",
    us: { ok: true, text: "WhatsApp o llamada; tu número nunca se publica" },
    them: { text: "Mensajes por Messenger" },
  },
  {
    label: "Estado del vehículo",
    us: { ok: true, text: "Calificación de 0 a 100 de carrocería y mecánica" },
    them: { text: "Descripción del vendedor" },
  },
  {
    label: "Anti-estafas",
    us: { ok: true, text: "Consejos en cada anuncio; 3 reportes pausan el anuncio" },
    them: { text: "Reportes de la comunidad" },
  },
  {
    label: "Costo para particulares",
    us: { ok: true, text: "Gratis hasta 5 anuncios, sin comisión" },
    them: { ok: true, text: "Gratis en ventas locales" },
  },
];

function Value({ cell }: { cell: Cell }) {
  return (
    <span className="flex items-start gap-2">
      {cell.ok ? (
        <Check weight="bold" className="text-primary mt-0.5 size-4 shrink-0" aria-label="Sí" />
      ) : (
        <span aria-hidden className="text-muted-foreground mt-0.5 w-4 shrink-0 text-center">
          –
        </span>
      )}
      <span>{cell.text}</span>
    </span>
  );
}

/** Comparativa honesta con Facebook Marketplace: solo hechos que podemos respaldar de nuestro lado. */
export function Comparison() {
  return (
    <section className="container-page pb-14" aria-labelledby="comparativa">
      <h2 id="comparativa" className="text-3xl md:text-4xl">
        {brand.name} frente a Facebook Marketplace
      </h2>
      <p className="text-muted-foreground mt-2 max-w-xl">
        Facebook Marketplace sirve para casi todo. {brand.name} se dedica solo a autos y motos.
      </p>
      <ul className="mt-6 grid gap-3 md:grid-cols-3" aria-label="Ventajas de usar rodara.mx">
        {BENEFITS.map(([Icon, title, text]) => (
          <li key={title} className="border-primary bg-card flex gap-4 rounded-md border-2 p-5">
            <span className="bg-primary text-primary-foreground grid size-11 shrink-0 place-items-center rounded-sm">
              <Icon className="size-6" aria-hidden />
            </span>
            <div>
              <h3 className="text-xl leading-tight">{title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-border bg-card mt-6 overflow-x-auto rounded-md border">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">
            Comparación entre {brand.name} y Facebook Marketplace
          </caption>
          <thead>
            <tr className="border-border border-b">
              <th scope="col" className="p-4" />
              <th
                scope="col"
                className="bg-primary-soft border-primary border-x-2 border-t-2 p-4 text-lg font-bold"
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="bg-primary text-primary-foreground font-display grid size-7 place-items-center rounded-sm"
                  >
                    {brand.logoMark}
                  </span>
                  {brand.name}
                </span>
              </th>
              <th scope="col" className="p-4 text-base font-bold">
                <span className="flex items-center gap-2">
                  <FacebookIcon className="size-6 shrink-0" />
                  Facebook Marketplace
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={r.label} className="border-border border-b last:border-0">
                <th scope="row" className="w-1/4 p-4 font-semibold">
                  {r.label}
                </th>
                <td
                  className={`bg-primary-soft/50 border-primary border-x-2 p-4 font-semibold ${
                    i === ROWS.length - 1 ? "border-b-2" : ""
                  }`}
                >
                  <Value cell={r.us} />
                </td>
                <td className="text-muted-foreground p-4">
                  <Value cell={r.them} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <LinkButton href="/publicar" size="lg">
          Publicar gratis en {brand.name}
        </LinkButton>
        <LinkButton href="/autos" variant="outline" size="lg">
          Ver autos y motos
        </LinkButton>
      </div>
      <p className="text-muted-foreground mt-4 max-w-2xl text-xs">
        Comparación basada en lo que cada servicio ofrece públicamente y puede cambiar. Facebook y
        Marketplace son marcas de Meta Platforms, Inc.; {brand.name} no está afiliado a Meta.
      </p>
    </section>
  );
}
