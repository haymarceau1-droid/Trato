import { describe, expect, it } from "vitest";
import { formatKm, formatMXN, timeAgo } from "@/lib/format";
import { buildTitle } from "@/lib/listings/title";

describe("format", () => {
  it("formatea pesos y kilómetros", () => {
    expect(formatMXN(289000)).toBe("$289,000 MXN");
    expect(formatKm(85000)).toBe("85,000 km");
  });

  it("describe la antigüedad", () => {
    const now = Date.parse("2026-03-10T12:00:00Z");
    expect(timeAgo("2026-03-10T08:00:00Z", now)).toBe("Publicado hoy");
    expect(timeAgo("2026-03-07T12:00:00Z", now)).toBe("Publicado hace 3 días");
  });

  it("genera el título del anuncio", () => {
    expect(buildTitle({ brand: "Nissan", model: "Versa", year: 2019, version: "Advance" })).toBe(
      "Nissan Versa 2019 Advance",
    );
    expect(buildTitle({ brand: "Italika", model: "FT150", year: 2022 })).toBe("Italika FT150 2022");
  });
});
