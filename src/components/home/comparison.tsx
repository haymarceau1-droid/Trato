import { Check } from "@/components/ui/icons";
import { brand } from "@/config/brand";

type Cell = { ok?: boolean; text: string };
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
      <div className="border-border bg-card mt-6 overflow-x-auto rounded-md border">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">
            Comparación entre {brand.name} y Facebook Marketplace
          </caption>
          <thead>
            <tr className="border-border border-b">
              <th scope="col" className="p-4" />
              <th scope="col" className="bg-primary-soft p-4 text-base font-bold">
                {brand.name}
              </th>
              <th scope="col" className="p-4 text-base font-bold">
                Facebook Marketplace
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label} className="border-border border-b last:border-0">
                <th scope="row" className="w-1/4 p-4 font-semibold">
                  {r.label}
                </th>
                <td className="bg-primary-soft/50 p-4">
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
      <p className="text-muted-foreground mt-3 max-w-2xl text-xs">
        Comparación basada en lo que cada servicio ofrece públicamente y puede cambiar. Facebook y
        Marketplace son marcas de Meta Platforms, Inc.; {brand.name} no está afiliado a Meta.
      </p>
    </section>
  );
}
