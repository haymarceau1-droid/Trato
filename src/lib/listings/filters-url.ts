import {
  BODY_TYPES,
  MOTO_TYPES,
  SORTS,
  stateBySlug,
  vehiclePath,
  type VehicleType,
} from "@/lib/constants";

export interface Filters {
  type: VehicleType;
  q?: string;
  state?: string;
  city?: string;
  brand?: string;
  model?: string;
  body?: string; // body_type (auto) o moto_type (moto)
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  kmMax?: number;
  transmission?: string;
  fuel?: string;
  ccMin?: number;
  ccMax?: number;
  sort: (typeof SORTS)[number]["value"];
  page: number;
}

type Params = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const int = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return Number.isFinite(n) && one(v) !== undefined && n >= 0 ? Math.floor(n) : undefined;
};

const typeSlugs = (type: VehicleType): string[] =>
  (type === "auto" ? BODY_TYPES : MOTO_TYPES).map((b) => b.value);
const toUrlSlug = (v: string) => v.replace(/_/g, "-");
const fromUrlSlug = (v: string) => v.replace(/-/g, "_");

/** Lee `/autos/[...segmentos]?query` y devuelve los filtros normalizados. */
export function parseFilters(
  type: VehicleType,
  segments: string[] = [],
  params: Params = {},
): Filters {
  const f: Filters = { type, sort: "recientes", page: 1 };
  const [s0, s1] = segments;
  if (s0) {
    if (stateBySlug(s0)) {
      f.state = s0;
      f.city = s1;
    } else if (typeSlugs(type).includes(fromUrlSlug(s0))) {
      f.body = fromUrlSlug(s0);
    } else {
      f.brand = s0;
      f.model = s1;
    }
  }
  f.q = one(params.q)?.slice(0, 80);
  f.state ??= one(params.estado);
  f.city ??= one(params.ciudad);
  f.brand ??= one(params.marca);
  f.model ??= one(params.modelo);
  f.body ??= one(params.tipo);
  f.yearMin = int(params.desde);
  f.yearMax = int(params.hasta);
  f.priceMin = int(params.precio_min);
  f.priceMax = int(params.precio_max);
  f.kmMax = int(params.km_max);
  f.ccMin = int(params.cc_min);
  f.ccMax = int(params.cc_max);
  f.transmission = one(params.transmision);
  f.fuel = one(params.combustible);
  const sort = one(params.orden);
  if (SORTS.some((s) => s.value === sort)) f.sort = sort as Filters["sort"];
  f.page = Math.max(1, int(params.pagina) ?? 1);
  return f;
}

/** Construye la URL canónica: la categoría principal va en la ruta, el resto en la query. */
export function buildUrl(f: Filters): string {
  const segs: string[] = [];
  const q = new URLSearchParams();
  const set = (k: string, v: string | number | undefined) =>
    v !== undefined && v !== "" && q.set(k, String(v));

  let pathBy: "state" | "brand" | "body" | null = null;
  if (f.state) {
    pathBy = "state";
    segs.push(f.state);
    if (f.city) segs.push(f.city);
  } else if (f.brand) {
    pathBy = "brand";
    segs.push(f.brand);
    if (f.model) segs.push(f.model);
  } else if (f.body) {
    pathBy = "body";
    segs.push(toUrlSlug(f.body));
  }
  if (pathBy !== "brand") {
    set("marca", f.brand);
    set("modelo", f.model);
  }
  if (pathBy !== "body") set("tipo", f.body);
  set("q", f.q);
  set("desde", f.yearMin);
  set("hasta", f.yearMax);
  set("precio_min", f.priceMin);
  set("precio_max", f.priceMax);
  set("km_max", f.kmMax);
  set("cc_min", f.ccMin);
  set("cc_max", f.ccMax);
  set("transmision", f.transmission);
  set("combustible", f.fuel);
  if (f.sort !== "recientes") set("orden", f.sort);
  if (f.page > 1) set("pagina", f.page);

  const base = `/${[vehiclePath(f.type), ...segs].join("/")}`;
  const qs = q.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Cuántos filtros hay aplicados (sin contar orden ni página), para el contador del botón. */
export function countActiveFilters(f: Filters): number {
  const groups: unknown[][] = [
    [f.q],
    [f.state, f.city],
    [f.brand, f.model],
    [f.body],
    [f.yearMin, f.yearMax],
    [f.priceMin, f.priceMax],
    [f.kmMax],
    [f.ccMin, f.ccMax],
    [f.transmission],
    [f.fuel],
  ];
  return groups.filter((g) => g.some((v) => v !== undefined && v !== "")).length;
}

/** Reconstruye filtros válidos a partir de datos no confiables (p. ej. de un Server Action). */
export function normalizeFilters(input: Filters): Filters {
  const url = new URL(buildUrl({ ...input, page: 1 }), "http://local");
  const type = input.type === "moto" ? "moto" : "auto";
  const segments = url.pathname.split("/").filter(Boolean).slice(1);
  return parseFilters(type, segments, Object.fromEntries(url.searchParams));
}
