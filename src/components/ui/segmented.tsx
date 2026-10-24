import { cn } from "@/lib/utils";

/** Selector de una opción con botones grandes (mejor que un <select> en móvil para 2–4 opciones). */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  value: T | undefined;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
  error?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              className={cn(
                "min-h-11 flex-1 rounded-sm border-2 px-4 text-sm font-semibold whitespace-nowrap",
                on
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card hover:border-foreground",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="text-danger text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
