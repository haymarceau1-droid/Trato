import { conditionLabel } from "@/lib/condition";

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-semibold">{label}</p>
        <p className="text-sm">
          <span className="font-display text-xl">{value}</span>
          <span className="text-muted-foreground">/100 · {conditionLabel(value)}</span>
        </p>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="bg-muted mt-2 h-2.5 overflow-hidden rounded-full"
      >
        <div className="bg-primary h-full rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/** Estado de carrocería y mecánica según el vendedor (se oculta en anuncios antiguos sin calificación). */
export function ConditionBars({
  body,
  mechanical,
}: {
  body: number | null;
  mechanical: number | null;
}) {
  if (body === null && mechanical === null) return null;
  return (
    <div className="border-border bg-card space-y-4 rounded-md border p-4">
      {body !== null && <Bar label="Carrocería" value={body} />}
      {mechanical !== null && <Bar label="Mecánica" value={mechanical} />}
      <p className="text-muted-foreground text-xs">
        Calificación del vendedor, solo orientativa. Revisa el vehículo en persona, de preferencia
        con tu mecánico, antes de pagar.
      </p>
    </div>
  );
}
