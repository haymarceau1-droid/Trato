import { describe, expect, it } from "vitest";
import { marketLine } from "@/lib/market-line";

describe("marketLine", () => {
  it("sin datos no muestra cifras inventadas", () => {
    expect(marketLine({ active: 0, sold: 0, sold30d: 0 })).toBe(
      "El mercado de usados de México, seguro y sin comisiones",
    );
  });

  it("usa cifras reales y prefiere las ventas del último mes", () => {
    expect(marketLine({ active: 1240, sold: 300, sold30d: 42 })).toBe(
      "Mercado de usados seguro · 1,240 vehículos en venta · 42 vendidos este mes",
    );
  });

  it("sin ventas recientes usa el total y respeta el singular", () => {
    expect(marketLine({ active: 1, sold: 7, sold30d: 0 })).toBe(
      "Mercado de usados seguro · 1 vehículo en venta · 7 ya vendidos",
    );
  });

  it("solo ventas, sin anuncios activos", () => {
    expect(marketLine({ active: 0, sold: 3, sold30d: 0 })).toBe(
      "Mercado de usados seguro · 3 ya vendidos",
    );
  });
});
