import {
  CalendarBlank,
  CarProfile,
  Certificate,
  Engine,
  Gauge,
  GasPump,
  GearSix,
  MapPinArea,
  Motorcycle,
  Palette,
  Receipt,
  Users,
  Tire,
} from "@/components/ui/icons";
import type { IconType } from "@/components/ui/icons";
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

type Row = [label: string, value: string | null, icon: IconType];

export function SpecGrid({ l }: { l: Listing }) {
  const rows: Row[] = [
    ["Año", String(l.year), CalendarBlank],
    ["Kilometraje", formatKm(l.mileage_km), Gauge],
    ["Transmisión", labelOf(TRANSMISSIONS, l.transmission), GearSix],
    ["Combustible", labelOf(FUELS, l.fuel), GasPump],
    ...(l.vehicle_type === "auto"
      ? ([
          ["Carrocería", labelOf(BODY_TYPES, l.body_type), CarProfile],
          ["Puertas", l.doors ? String(l.doors) : null, CarProfile],
          ["Motor", l.engine_liters ? `${l.engine_liters} L` : null, Engine],
          ["Tracción", l.traction ? labelOf(TRACTIONS, l.traction) : null, Tire],
        ] as Row[])
      : ([
          ["Tipo", labelOf(MOTO_TYPES, l.moto_type), Motorcycle],
          ["Cilindrada", l.engine_cc ? `${l.engine_cc} cc` : null, Engine],
        ] as Row[])),
    ["Color", l.color, Palette],
    ["Dueños", l.owners_count ? String(l.owners_count) : null, Users],
    ["Factura", labelOf(INVOICE_TYPES, l.invoice_type), Receipt],
    ["Placas de", l.plates_state ? stateName(l.plates_state) : null, MapPinArea],
    ["Tenencia al corriente", l.tenencia_al_corriente ? "Sí" : "No", Certificate],
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {rows
        .filter(([, v]) => v)
        .map(([k, v, Icon]) => (
          <div
            key={k}
            className="border-border bg-card flex items-center gap-3 rounded-md border p-3"
          >
            <span className="bg-primary-soft text-primary grid size-10 shrink-0 place-items-center rounded-sm">
              <Icon weight="duotone" className="size-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <dt className="text-muted-foreground text-xs">{k}</dt>
              <dd className="truncate font-semibold">{v}</dd>
            </div>
          </div>
        ))}
    </dl>
  );
}
