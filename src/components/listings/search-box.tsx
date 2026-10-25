"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass as Search } from "@/components/ui/icons";
import { Combobox, type ComboItem } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

/** Pestañas pegadas a la barra, como carpeta de archivo. */
export function SearchBox({ className }: { className?: string }) {
  const router = useRouter();
  const [type, setType] = useState<"autos" | "motos">("autos");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ComboItem[]>([]);

  // Sugerencias del catálogo mientras escribe (con pausa breve para no pedir en cada tecla).
  useEffect(() => {
    const text = q.trim();
    if (text.length < 2) return;
    const ctl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/sugerencias?t=${type}&q=${encodeURIComponent(text)}`, { signal: ctl.signal })
        .then((r) => r.json())
        .then((d: { items: { label: string }[] }) => setItems(d.items))
        .catch(() => {});
    }, 150);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q, type]);

  const go = (text: string) =>
    router.push(text.trim() ? `/${type}?q=${encodeURIComponent(text.trim())}` : `/${type}`);

  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        go(q);
      }}
    >
      <div role="radiogroup" aria-label="Tipo de vehículo" className="flex">
        {(["autos", "motos"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={type === v}
            onClick={() => setType(v)}
            className={cn(
              "font-display min-h-11 px-6 text-lg tracking-wide uppercase",
              type === v
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="border-foreground bg-card flex border-2">
        <div className="min-w-0 flex-1">
          <Combobox
            label="Buscar"
            filter={false}
            minChars={2}
            inputMode="search"
            value={q}
            items={items}
            onChange={setQ}
            onSelect={(it) => go(it.label)}
            placeholder={
              type === "autos"
                ? "Marca, modelo o año. Ej. Versa 2019"
                : "Marca o modelo. Ej. Italika FT150"
            }
            className="min-h-14 border-0 bg-transparent px-4"
          />
        </div>
        <button
          type="submit"
          aria-label="Buscar"
          className="font-display bg-primary text-primary-foreground inline-flex min-h-14 items-center gap-2 px-5 text-lg uppercase hover:opacity-90"
        >
          <Search className="size-5" aria-hidden />
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>
    </form>
  );
}
