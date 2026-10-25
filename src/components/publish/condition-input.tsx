"use client";

import { conditionLabel } from "@/lib/condition";

/** Barómetro de 0 a 100 (de 5 en 5). Hasta que la persona lo mueve no hay valor y se pide que lo indique. */
export function ConditionInput({
  label,
  hint,
  value,
  error,
  onChange,
}: {
  label: string;
  hint: string;
  value: number | undefined;
  error?: string;
  onChange: (v: number) => void;
}) {
  const set = value !== undefined && !Number.isNaN(value);
  const pct = set ? value : 50;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={`cond-${label}`} className="font-semibold">
          {label}
        </label>
        <p className="text-sm">
          {set ? (
            <>
              <span className="font-display text-xl">{value}</span>
              <span className="text-muted-foreground">/100 · {conditionLabel(value)}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Mueve para indicarlo</span>
          )}
        </p>
      </div>
      <input
        id={`cond-${label}`}
        type="range"
        min={0}
        max={100}
        step={5}
        value={pct}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(Number(e.target.value))}
        // En móvil basta tocar la barra: el primer toque ya fija el valor.
        onPointerUp={(e) => onChange(Number((e.target as HTMLInputElement).value))}
        className={`h-11 w-full cursor-pointer ${set ? "accent-[var(--primary)]" : "opacity-50"}`}
      />
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>0 · Necesita trabajo</span>
        <span>100 · Como nuevo</span>
      </div>
      <p className="text-muted-foreground text-xs">{hint}</p>
      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
