import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";

const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Sugerencias del buscador: marcas y "Marca Modelo" del catálogo. Sin base de datos, cacheable. */
export function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("t") === "motos" ? "moto" : "auto";
  const q = plain((url.searchParams.get("q") ?? "").trim()).slice(0, 40);
  if (q.length < 2) return NextResponse.json({ items: [] });

  const hits: { label: string; kind: "brand" | "model"; score: number }[] = [];
  for (const b of getCatalog(type)) {
    const bn = plain(b.name);
    if (bn.includes(q))
      hits.push({ label: b.name, kind: "brand", score: bn.startsWith(q) ? 0 : 2 });
    for (const m of b.models) {
      const full = plain(`${b.name} ${m.name}`);
      const at = full.indexOf(q);
      if (at >= 0)
        hits.push({
          label: `${b.name} ${m.name}`,
          kind: "model",
          score: at === 0 || plain(m.name).startsWith(q) ? 1 : 3,
        });
    }
  }
  hits.sort((a, b) => a.score - b.score || a.label.length - b.label.length);
  return NextResponse.json(
    { items: hits.slice(0, 8).map(({ label, kind }) => ({ label, kind })) },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
  );
}
