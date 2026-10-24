import { describe, expect, it } from "vitest";
import {
  buildUrl,
  countActiveFilters,
  normalizeFilters,
  parseFilters,
} from "@/lib/listings/filters-url";
import { listingPath, parseListingId, slugify } from "@/lib/listings/slug";

describe("parseFilters / buildUrl", () => {
  it("interpreta estado y ciudad desde la ruta", () => {
    const f = parseFilters("auto", ["nuevo-leon", "monterrey"]);
    expect(f).toMatchObject({ state: "nuevo-leon", city: "monterrey" });
  });

  it("interpreta marca y modelo desde la ruta", () => {
    expect(parseFilters("auto", ["nissan", "versa"])).toMatchObject({
      brand: "nissan",
      model: "versa",
    });
  });

  it("interpreta carrocería y tipo de moto", () => {
    expect(parseFilters("auto", ["suv"]).body).toBe("suv");
    expect(parseFilters("moto", ["doble-proposito"]).body).toBe("doble_proposito");
  });

  it("lee filtros de la query y sanea números", () => {
    const f = parseFilters("auto", [], {
      precio_max: "200000",
      desde: "2018",
      km_max: "abc",
      orden: "precio_asc",
      pagina: "3",
    });
    expect(f).toMatchObject({ priceMax: 200000, yearMin: 2018, sort: "precio_asc", page: 3 });
    expect(f.kmMax).toBeUndefined();
  });

  it("ignora orden inválido", () => {
    expect(parseFilters("auto", [], { orden: "hack" }).sort).toBe("recientes");
  });

  it("ida y vuelta conserva los filtros", () => {
    const url = buildUrl(
      parseFilters("auto", ["nissan", "versa"], { precio_max: "250000", transmision: "manual" }),
    );
    expect(url).toBe("/autos/nissan/versa?precio_max=250000&transmision=manual");
  });

  it("estado en ruta y marca en query", () => {
    const f = parseFilters("moto", ["jalisco"], { marca: "italika" });
    expect(buildUrl(f)).toBe("/motos/jalisco?marca=italika");
  });

  it("omite valores por defecto", () => {
    expect(buildUrl(parseFilters("auto"))).toBe("/autos");
  });
});

describe("slug", () => {
  it("quita acentos y símbolos", () => {
    expect(slugify("Nuevo León")).toBe("nuevo-leon");
    expect(slugify("  Mazda 3 — Sedán ")).toBe("mazda-3-sedan");
  });

  it("extrae el id del final de la URL", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000";
    const path = listingPath({ slug: "nissan-versa-2019-monterrey", id });
    expect(parseListingId(path.replace("/anuncio/", ""))).toBe(id);
    expect(parseListingId("sin-id")).toBeNull();
  });
});

describe("countActiveFilters / normalizeFilters", () => {
  it("cuenta grupos de filtros, no campos", () => {
    const f = parseFilters("auto", ["nuevo-leon", "monterrey"], {
      precio_min: "1",
      precio_max: "9",
      transmision: "manual",
    });
    expect(countActiveFilters(f)).toBe(3); // ubicación + precio + transmisión
    expect(countActiveFilters(parseFilters("moto"))).toBe(0);
  });

  it("normaliza filtros no confiables (valores raros se descartan)", () => {
    const dirty = {
      type: "auto",
      sort: "hack",
      page: 99,
      priceMax: -5,
      kmMax: 1e12,
      brand: "nissan",
    } as never;
    const f = normalizeFilters(dirty);
    expect(f.sort).toBe("recientes");
    expect(f.brand).toBe("nissan");
    expect(f.page).toBe(1);
  });
});
