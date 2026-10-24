"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SearchBox({ className }: { className?: string }) {
  const router = useRouter();
  const [type, setType] = useState<"autos" | "motos">("autos");
  const [q, setQ] = useState("");

  return (
    <form
      role="search"
      className={cn("space-y-3", className)}
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/${type}?q=${encodeURIComponent(q.trim())}` : `/${type}`);
      }}
    >
      <div
        role="radiogroup"
        aria-label="Tipo de vehículo"
        className="bg-muted inline-flex rounded-xl p-1"
      >
        {(["autos", "motos"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={type === v}
            onClick={() => setType(v)}
            className={cn(
              "min-h-10 rounded-lg px-5 text-sm font-semibold",
              type === v ? "bg-card shadow-sm" : "text-muted-foreground",
            )}
          >
            {v === "autos" ? "Autos" : "Motos"}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={type === "autos" ? "Busca: Nissan Versa 2019" : "Busca: Italika FT150"}
          aria-label="Buscar"
          className="border-border bg-card min-h-12 min-w-0 flex-1 rounded-xl border px-4 text-base"
        />
        <Button type="submit" size="lg" aria-label="Buscar">
          <Search className="size-5" aria-hidden />
          <span className="hidden sm:inline">Buscar</span>
        </Button>
      </div>
    </form>
  );
}
