/** Atajos de un toque para rellenar un campo de texto. */
export function QuickPick({
  label,
  items,
  onPick,
}: {
  label: string;
  items: string[];
  onPick: (v: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onPick(i)}
              className="border-border bg-card hover:border-foreground min-h-11 rounded-sm border px-3 text-sm font-medium"
            >
              {i}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
