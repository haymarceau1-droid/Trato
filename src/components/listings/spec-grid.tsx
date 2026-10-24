import type { Listing } from "@/types";
import {
  BODY_TYPES,
  FUELS,
  INVOICE_TYPES,
  MOTO_TYPES,
  TRACTIONS,
  TRANSMISSIONS,
  labelOf,
  stateName,
} from "@/lib/constants";
import { formatKm } from "@/lib/format";

export function SpecGrid({ l }: { l: Listing }) {
  const rows: [string, string | null][] = [
    ["Año", String(l.year)],
    ["Kilometraje", formatKm(l.mileage_km)],
    ["Transmisión", labelOf(TRANSMISSIONS, l.transmission)],
    ["Combustible", labelOf(FUELS, l.fuel)],
    ...(l.vehicle_type === "auto"
      ? ([
          ["Carrocería", labelOf(BODY_TYPES, l.body_type)],
          ["Puertas", l.doors ? String(l.doors) : null],
          ["Motor", l.engine_liters ? `${l.engine_liters} L` : null],
          ["Tracción", l.traction ? labelOf(TRACTIONS, l.traction) : null],
        ] as [string, string | null][])
      : ([
          ["Tipo", labelOf(MOTO_TYPES, l.moto_type)],
          ["Cilindrada", l.engine_cc ? `${l.engine_cc} cc` : null],
        ] as [string, string | null][])),
    ["Color", l.color],
    ["Dueños", l.owners_count ? String(l.owners_count) : null],
    ["Factura", labelOf(INVOICE_TYPES, l.invoice_type)],
    ["Placas de", l.plates_state ? stateName(l.plates_state) : null],
    ["Tenencia al corriente", l.tenencia_al_corriente ? "Sí" : "No"],
  ];
  return (
    <dl className="border-border bg-border grid grid-cols-2 gap-px overflow-hidden rounded-2xl border sm:grid-cols-3">
      {rows
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <div key={k} className="bg-card p-3">
            <dt className="text-muted-foreground text-xs">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
    </dl>
  );
}
