"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass as Search } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

/** Pestañas pegadas a la barra, como carpeta de archivo. */
export function SearchBox({ className }: { className?: string }) {
  const router = useRouter();
  const [type, setType] = useState<"autos" | "motos">("autos");
  const [q, setQ] = useState("");

  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/${type}?q=${encodeURIComponent(q.trim())}` : `/${type}`);
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
                ? "bg-white text-[#0a0a0a]"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="flex bg-white">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            type === "autos"
              ? "Marca, modelo o año. Ej. Versa 2019"
              : "Marca o modelo. Ej. Italika FT150"
          }
          aria-label="Buscar"
          className="min-h-14 min-w-0 flex-1 bg-transparent px-4 text-base text-[#0a0a0a] placeholder:text-[#6b6361]"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="bg-primary text-primary-foreground font-display inline-flex min-h-14 items-center gap-2 px-5 text-lg uppercase hover:opacity-90"
        >
          <Search className="size-5" aria-hidden />
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>
    </form>
  );
}
