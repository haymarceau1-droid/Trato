import { describe, expect, it } from "vitest";
import { POPULAR_BRANDS, getCatalog } from "@/lib/catalog";
import { MX_CITIES } from "@/lib/cities";
import { STATE_BLURBS } from "@/lib/state-blurbs";
import { MX_STATES } from "@/lib/constants";

describe("catálogo", () => {
  it.each(["auto", "moto"] as const)("%s: marcas y modelos sin slugs duplicados", (type) => {
    const brands = getCatalog(type);
    expect(new Set(brands.map((b) => b.slug)).size).toBe(brands.length);
    for (const b of brands) {
      expect(b.slug).toMatch(/^[a-z0-9-]+$/);
      expect(new Set(b.models.map((m) => m.slug)).size).toBe(b.models.length);
    }
  });

  it("incluye las marcas principales del mercado mexicano", () => {
    const autos = getCatalog("auto").map((b) => b.name);
    for (const n of [
      "Nissan",
      "Chevrolet",
      "Volkswagen",
      "Toyota",
      "Kia",
      "Mazda",
      "Honda",
      "Ford",
      "MG",
      "BYD",
    ]) {
      expect(autos).toContain(n);
    }
    const motos = getCatalog("moto").map((b) => b.name);
    for (const n of ["Italika", "Honda", "Yamaha", "Vento", "Bajaj", "KTM", "Harley-Davidson"]) {
      expect(motos).toContain(n);
    }
  });

  it("las marcas populares existen en el catálogo", () => {
    for (const type of ["auto", "moto"] as const) {
      const names = getCatalog(type).map((b) => b.name);
      POPULAR_BRANDS[type].forEach((n) => expect(names).toContain(n));
    }
  });
});

describe("estados", () => {
  it("son los 32, sin duplicados, y todos tienen ciudades sugeridas", () => {
    expect(MX_STATES).toHaveLength(32);
    expect(new Set(MX_STATES.map((s) => s.slug)).size).toBe(32);
    for (const s of MX_STATES) expect(MX_CITIES[s.slug]?.length, s.slug).toBeGreaterThan(0);
  });
});

describe("frases por estado", () => {
  it("hay una frase corta para cada uno de los 32 estados", () => {
    for (const s of MX_STATES) {
      const blurb = STATE_BLURBS[s.slug];
      expect(blurb, s.slug).toBeTruthy();
      expect(blurb!.length, s.slug).toBeLessThan(100);
    }
  });
});
