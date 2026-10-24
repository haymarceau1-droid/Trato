/**
 * Genera public/estados/<slug>.svg: la silueta de cada estado (viewBox 24×24, un solo color).
 * Fuente de geometría: github.com/angelnmara/geojson (mexicoHigh.json). Se proyecta (equirectangular
 * corregida por latitud), se escala para llenar el recuadro y se simplifica (Douglas-Peucker).
 * Uso: npm run catalog:states
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { MX_STATES } from "../src/lib/constants";
import { slugify } from "../src/lib/listings/slug";

const URL = "https://raw.githubusercontent.com/angelnmara/geojson/master/mexicoHigh.json";
const ALIAS: Record<string, string> = { mexico: "estado-de-mexico" };
const SIZE = 24;
const PAD = 1.5;
const TOLERANCE = 0.09;
const COS_LAT = Math.cos((23 * Math.PI) / 180);

type Pt = [number, number];
type Geometry =
  { type: "Polygon"; coordinates: Pt[][] } | { type: "MultiPolygon"; coordinates: Pt[][][] };
type Collection = { features: { properties: { name: string }; geometry: Geometry }[] };

function simplify(points: Pt[], tol: number): Pt[] {
  if (points.length < 3) return points;
  const [a, b] = [points[0]!, points[points.length - 1]!];
  let max = 0;
  let idx = 0;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1e-9;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i]!;
    const d = Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
    if (d > max) {
      max = d;
      idx = i;
    }
  }
  if (max <= tol) return [a, b];
  return [
    ...simplify(points.slice(0, idx + 1), tol).slice(0, -1),
    ...simplify(points.slice(idx), tol),
  ];
}

/** Un anillo es cerrado (inicio = fin): se parte por el punto más lejano antes de simplificar. */
function simplifyRing(ring: Pt[], tol: number): Pt[] {
  const r = ring.slice(0, -1);
  const [x0, y0] = r[0]!;
  let far = 0;
  let best = -1;
  r.forEach(([x, y], i) => {
    const d = Math.hypot(x - x0, y - y0);
    if (d > best) {
      best = d;
      far = i;
    }
  });
  const left = simplify(r.slice(0, far + 1), tol);
  const right = simplify([...r.slice(far), r[0]!], tol);
  return [...left.slice(0, -1), ...right.slice(0, -1)];
}

const area = (r: Pt[]) =>
  Math.abs(
    r.reduce(
      (s, p, i) => s + (p[0] * r[(i + 1) % r.length]![1] - r[(i + 1) % r.length]![0] * p[1]),
      0,
    ) / 2,
  );

/** Mapa de México completo (una sola proyección) para la portada: src/lib/mexico-map.ts. */
function writeMap(data: Collection) {
  const W = 960;
  const feats = data.features.map((f) => {
    const base = slugify(f.properties.name);
    const slug = ALIAS[base] ?? base;
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    return {
      slug,
      rings: polys.flatMap((p) => p).map((r) => r.map(([lon, lat]): Pt => [lon * COS_LAT, -lat])),
    };
  });
  const all = feats.flatMap((f) => f.rings.flat());
  const minX = Math.min(...all.map((p) => p[0]));
  const maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1]));
  const maxY = Math.max(...all.map((p) => p[1]));
  const scale = W / (maxX - minX);
  const H = Math.ceil((maxY - minY) * scale);
  const paths: Record<string, string> = {};
  for (const f of feats) {
    paths[f.slug] = f.rings
      .map((r): Pt[] => r.map(([x, y]) => [(x - minX) * scale, (y - minY) * scale]))
      .filter((r) => area(r) > 2.5)
      .map((r) => simplifyRing(r, 0.7))
      .filter((r) => r.length >= 3)
      .map((r) => "M" + r.map(([x, y]) => `${+x.toFixed(1)} ${+y.toFixed(1)}`).join("L") + "Z")
      .join("");
  }
  const body = Object.entries(paths)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, d]) => `  ${JSON.stringify(k)}: ${JSON.stringify(d)},`)
    .join("\n");
  writeFileSync(
    "src/lib/mexico-map.ts",
    `// GENERADO por scripts/generate-states.ts (npm run catalog:states). No editar a mano.\nexport const MAP_VIEWBOX = "0 0 ${W} ${H}";\nexport const MAP_PATHS: Record<string, string> = {\n${body}\n};\n`,
  );
}

async function main() {
  const data = (await (await fetch(URL)).json()) as Collection;
  mkdirSync("public/estados", { recursive: true });
  const done = new Set<string>();

  for (const f of data.features) {
    const base = slugify(f.properties.name);
    const slug = ALIAS[base] ?? base;
    if (!MX_STATES.some((s) => s.slug === slug))
      throw new Error(`Estado sin equivalente: ${f.properties.name}`);
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    const rings: Pt[][] = polys.flatMap((p) => p);
    const proj = (r: Pt[]): Pt[] => r.map(([lon, lat]) => [lon * COS_LAT, -lat]);
    const projected = rings.map(proj);
    const all = projected.flat();
    const minX = Math.min(...all.map((p) => p[0]));
    const maxX = Math.max(...all.map((p) => p[0]));
    const minY = Math.min(...all.map((p) => p[1]));
    const maxY = Math.max(...all.map((p) => p[1]));
    const scale = (SIZE - 2 * PAD) / Math.max(maxX - minX, maxY - minY);
    const ox = (SIZE - (maxX - minX) * scale) / 2;
    const oy = (SIZE - (maxY - minY) * scale) / 2;
    const norm = (r: Pt[]): Pt[] =>
      r.map(([x, y]) => [(x - minX) * scale + ox, (y - minY) * scale + oy]);

    const d = projected
      .map(norm)
      .filter((r) => area(r) > 0.25) // fuera islotes diminutos
      .map((r) => simplifyRing(r, TOLERANCE))
      .filter((r) => r.length >= 3)
      .map((r) => "M" + r.map(([x, y]) => `${+x.toFixed(2)} ${+y.toFixed(2)}`).join("L") + "Z")
      .join("");

    writeFileSync(
      `public/estados/${slug}.svg`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}"><path fill-rule="evenodd" d="${d}"/></svg>\n`,
    );
    done.add(slug);
  }
  writeMap(data);
  const missing = MX_STATES.filter((s) => !done.has(s.slug)).map((s) => s.name);
  if (missing.length) throw new Error(`Faltan: ${missing.join(", ")}`);
  console.log(`public/estados: ${done.size} siluetas`);
}

main();
