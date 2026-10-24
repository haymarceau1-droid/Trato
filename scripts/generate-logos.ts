/**
 * Genera public/logos/<marca>.svg (monocromo, viewBox 24×24) y src/lib/brand-logos.ts con la lista de marcas que tienen logo.
 * Fuente: Simple Icons (datos CC0). Las marcas pertenecen a sus dueños; se usan solo para identificarlas.
 * Algunas marcas se retiraron de las versiones recientes, por eso se consulta también la v13.
 * Uso: npm run catalog:logos
 */
import { mkdirSync, writeFileSync } from "node:fs";
import * as latest from "simple-icons";
import * as v13 from "simple-icons-v13";
import { getCatalog } from "../src/lib/catalog";

type Icon = { slug: string; path: string };
const index = (mod: Record<string, unknown>) => {
  const map = new Map<string, Icon>();
  for (const v of Object.values(mod)) {
    const i = v as Partial<Icon>;
    if (i && typeof i === "object" && i.slug && i.path) map.set(i.slug, i as Icon);
  }
  return map;
};
const sources = [index(latest as never), index(v13 as never)];

/** Nombre del catálogo → slug de Simple Icons, cuando no coincide con el slug propio. */
const ALIAS: Record<string, string> = {
  "mercedes-benz": "mercedes",
  "land-rover": "landrover",
  "alfa-romeo": "alfaromeo",
  yamaha: "yamahamotorcorporation",
  "harley-davidson": "harleydavidson",
  piaggio: "piaggiogroup",
};

const found: Record<string, string> = {};
const missing: string[] = [];
const seen = new Set<string>();
for (const type of ["auto", "moto"] as const) {
  for (const b of getCatalog(type)) {
    if (seen.has(b.slug)) continue;
    seen.add(b.slug);
    const slug = ALIAS[b.slug] ?? b.slug.replace(/-/g, "");
    const icon = sources.map((s) => s.get(slug)).find(Boolean);
    if (icon) found[b.slug] = icon.path;
    else missing.push(b.name);
  }
}

mkdirSync("public/logos", { recursive: true });
for (const [slug, d] of Object.entries(found)) {
  writeFileSync(
    `public/logos/${slug}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${d}"/></svg>\n`,
  );
}
const slugs = Object.keys(found).sort();
writeFileSync(
  "src/lib/brand-logos.ts",
  `// GENERADO por scripts/generate-logos.ts (npm run catalog:logos). No editar a mano.\n// Marcas con logo en public/logos/<slug>.svg (Simple Icons, CC0; marcas registradas de sus dueños).\nexport const BRAND_LOGO_SLUGS = new Set<string>(${JSON.stringify(slugs)});\n`,
);
console.log(`${slugs.length} logos; sin logo (${missing.length}): ${missing.join(", ")}`);
