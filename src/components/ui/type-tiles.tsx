import { BodyIcon } from "@/components/ui/body-icon";
import { cn } from "@/lib/utils";

/** Selector visual de carrocería / tipo de moto: una silueta por opción. */
export function TypeTiles({
  label,
  value,
  options,
  error,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: readonly { value: string; label: string }[];
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
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
                "flex min-h-11 flex-col items-center gap-1 rounded-sm border-2 px-2 py-3 text-sm font-semibold",
                on
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card hover:border-foreground",
              )}
            >
              <BodyIcon value={o.value} className="h-9 w-12" />
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
