"use client";

import { useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const money = (n: number) => `$${n.toLocaleString("es-MX")}`;

interface Tier {
  name: string;
  up: number;
  price: string;
  note: string;
  href: string;
  cta: string;
}

/** "¿Cuántos anuncios vas a tener activos?" → qué opción te conviene. Los topes salen de los planes de la página. */
export function PlanPicker({
  free,
  tiers,
}: {
  free: number;
  tiers: { name: string; limit: number; price: number | null; href: string }[];
}) {
  const [n, setN] = useState(3);
  const max = 150;

  const all: Tier[] = [
    {
      name: "Particular",
      up: free,
      price: "$0",
      note: "Gratis para siempre. Si tienes prisa, impulsa un anuncio desde $200.",
      href: "/publicar",
      cta: "Publicar gratis",
    },
    ...tiers.map((t) => ({
      name: t.name,
      up: t.limit,
      price: t.price ? `${money(t.price)} MXN/mes + IVA` : "A tu medida",
      note: t.price
        ? `Hasta ${t.limit} anuncios activos, sin comisión por venta.`
        : "Para inventarios de más de 100 anuncios.",
      href: t.href,
      cta: t.price ? "Quiero este plan" : "Contactar ventas",
    })),
  ];
  const pick = all.find((t) => n <= t.up) ?? all[all.length - 1]!;

  return (
    <div className="border-border bg-card rounded-md border p-5 md:p-8">
      <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-center">
        <div>
          <label htmlFor="n-anuncios" className="text-xl font-semibold">
            ¿Cuántos anuncios vas a tener activos a la vez?
          </label>
          <p className="font-display mt-3 text-6xl leading-none">{n >= max ? `${max}+` : n}</p>
          <input
            id="n-anuncios"
            type="range"
            min={1}
            max={max}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="accent-primary mt-4 h-11 w-full cursor-pointer"
          />
          <div className="text-muted-foreground flex justify-between text-xs">
            <span>1</span>
            <span>{max}+</span>
          </div>
        </div>
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "rounded-md border-2 p-5",
            pick.name === "Particular" ? "border-primary" : "border-foreground",
          )}
        >
          <p className="text-muted-foreground text-sm font-semibold">Te conviene</p>
          <p className="mt-1 text-3xl">{pick.name}</p>
          <p className="mt-1 font-semibold">{pick.price}</p>
          <p className="text-muted-foreground mt-2 text-sm">{pick.note}</p>
          <LinkButton href={pick.href} className="mt-4 w-full sm:w-auto">
            {pick.cta}
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
