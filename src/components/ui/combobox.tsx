"use client";

import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { inputClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface ComboItem {
  label: string;
  /** Texto secundario a la derecha (p. ej. el estado de una ciudad). */
  hint?: string;
  icon?: ReactNode;
  /** Datos que recibe onSelect (el texto del campo siempre es `label`). */
  data?: unknown;
}

/** Quita acentos letra por letra: la longitud no cambia, así el resaltado coincide con el texto original. */
const plain = (s: string) => [...s].map((c) => c.normalize("NFD")[0]?.toLowerCase() ?? c).join("");

function Highlight({ text, query }: { text: string; query: string }) {
  const q = plain(query.trim());
  const i = q ? plain(text).indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <strong className="font-bold">{text.slice(i, i + q.length)}</strong>
      {text.slice(i + q.length)}
    </>
  );
}

/**
 * Campo de texto libre con sugerencias (mejor que <datalist>, que en móvil casi no se ve).
 * Con `filter` (por defecto) filtra y ordena `items` aquí; con `filter={false}` muestra tal cual lo que reciba.
 */
export function Combobox({
  value,
  onChange,
  onSelect,
  items,
  filter = true,
  max = 8,
  minChars = 0,
  placeholder,
  label,
  invalid,
  autoComplete,
  inputMode,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect?: (item: ComboItem) => void;
  items: ComboItem[];
  filter?: boolean;
  max?: number;
  minChars?: number;
  placeholder?: string;
  label: string;
  invalid?: boolean;
  autoComplete?: string;
  inputMode?: "search" | "text";
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);

  const shown = useMemo(() => {
    const q = plain(value.trim());
    if (q.length < minChars) return [];
    if (!filter) return items.slice(0, max);
    if (!q) return items.slice(0, max);
    return (
      items
        .map((it) => ({ it, at: plain(it.label).indexOf(q) }))
        .filter((x) => x.at >= 0)
        // Primero los que empiezan con lo escrito, luego los que lo contienen.
        .sort(
          (a, b) =>
            (a.at === 0 ? 0 : 1) - (b.at === 0 ? 0 : 1) || a.it.label.length - b.it.label.length,
        )
        .slice(0, max)
        .map((x) => x.it)
    );
  }, [items, value, filter, max, minChars]);

  // Si lo escrito ya es exactamente la única sugerencia, no hay nada que sugerir.
  const exact = shown.length === 1 && plain(shown[0]!.label) === plain(value.trim());
  const visible = open && shown.length > 0 && !exact;

  const choose = (it: ComboItem) => {
    onChange(it.label);
    onSelect?.(it);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div className="relative">
      <input
        ref={input}
        role="combobox"
        aria-label={label}
        aria-expanded={visible}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={visible && active >= 0 ? `${id}-${active}` : undefined}
        aria-invalid={invalid ? true : undefined}
        autoComplete={autoComplete ?? "off"}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        className={cn(inputClass, className)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((a) => (shown.length ? (a + 1) % shown.length : -1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => (shown.length ? (a <= 0 ? shown.length - 1 : a - 1) : -1));
          } else if (e.key === "Enter" && visible && active >= 0) {
            e.preventDefault();
            choose(shown[active]!);
          } else if (e.key === "Escape" && visible) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
      />
      {visible && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label={`Sugerencias de ${label.toLowerCase()}`}
          className="border-border bg-card absolute top-full right-0 left-0 z-30 mt-1 max-h-64 overflow-auto rounded-md border p-1 shadow-2xl"
        >
          {shown.map((it, i) => (
            <li
              key={`${it.label}-${it.hint ?? ""}`}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === active}
              // mousedown (no click) para elegir antes de que el campo pierda el foco.
              onMouseDown={(e) => {
                e.preventDefault();
                choose(it);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-2 rounded-sm px-3 text-sm font-normal",
                i === active && "bg-muted",
              )}
            >
              {it.icon}
              <span className="min-w-0 flex-1 truncate">
                <Highlight text={it.label} query={value} />
              </span>
              {it.hint && <span className="text-muted-foreground shrink-0 text-xs">{it.hint}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
