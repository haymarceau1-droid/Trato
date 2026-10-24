/**
 * Genera supabase/seed.sql (32 estados + catálogo de marcas y modelos) desde las fuentes de la app:
 *   src/lib/constants.ts (MX_STATES) y src/lib/catalog.ts.
 * Uso: npm run catalog:seed
 */
import { writeFileSync } from "node:fs";
import { MX_STATES } from "../src/lib/constants";
import { getCatalog } from "../src/lib/catalog";

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

const lines: string[] = [
  "-- GENERADO por scripts/generate-seed.ts — no editar a mano (npm run catalog:seed).",
  "",
  "-- Estados de la República (32 entidades federativas)",
  "insert into public.mx_states (slug, name) values",
  MX_STATES.map((s) => `  (${q(s.slug)}, ${q(s.name)})`).join(",\n"),
  "on conflict do nothing;",
  "",
  "-- Catálogo de marcas y modelos",
  "create or replace function pg_temp.add_catalog(p_type vehicle_type, p_brand text, p_models text[]) returns void",
  "language plpgsql as $$",
  "declare bid int; m text;",
  "begin",
  "  insert into public.catalog_brands (vehicle_type, name, slug)",
  "  values (p_type, p_brand, public.slugify(p_brand))",
  "  on conflict (vehicle_type, slug) do update set name = excluded.name",
  "  returning id into bid;",
  "  foreach m in array p_models loop",
  "    insert into public.catalog_models (brand_id, name, slug)",
  "    values (bid, m, public.slugify(m)) on conflict (brand_id, slug) do nothing;",
  "  end loop;",
  "end $$;",
  "",
];

for (const type of ["auto", "moto"] as const) {
  for (const b of getCatalog(type)) {
    const models = b.models.length
      ? `array[${b.models.map((m) => q(m.name)).join(", ")}]`
      : "array[]::text[]";
    lines.push(`select pg_temp.add_catalog('${type}', ${q(b.name)}, ${models});`);
  }
}

writeFileSync("supabase/seed.sql", lines.join("\n") + "\n");
const count = (t: "auto" | "moto") => getCatalog(t).reduce((n, b) => n + b.models.length, 0);
console.log(
  `seed.sql: ${MX_STATES.length} estados, ${getCatalog("auto").length} marcas de autos (${count("auto")} modelos), ${getCatalog("moto").length} marcas de motos (${count("moto")} modelos)`,
);
