import { describe, expect, it } from "vitest";
import { listingSchema, photoPathsSchema } from "@/lib/validation/listing";
import { messengerUrl, parseFacebook, toMxE164 } from "@/lib/validation/profile";

const auto = {
  vehicle_type: "auto",
  brand: "Nissan",
  model: "Versa",
  year: 2019,
  transmission: "manual",
  fuel: "gasolina",
  mileage_km: 85000,
  invoice_type: "original",
  tenencia_al_corriente: true,
  body_type: "sedan",
  body_condition: 80,
  mechanical_condition: 70,
  price_mxn: 215000,
  negotiable: true,
  state: "nuevo-leon",
  city: "Monterrey",
  description: "Buen estado",
};
const moto = {
  ...auto,
  vehicle_type: "moto",
  brand: "Italika",
  model: "FT150",
  body_type: undefined,
  moto_type: "doble_proposito",
  engine_cc: 150,
};

describe("listingSchema", () => {
  it("exige el estado de carrocería y mecánica entre 0 y 100", () => {
    const { body_condition: _b, ...sinCarroceria } = auto;
    expect(listingSchema.safeParse(sinCarroceria).success).toBe(false);
    expect(listingSchema.safeParse({ ...auto, mechanical_condition: 101 }).success).toBe(false);
    expect(listingSchema.safeParse({ ...auto, body_condition: -1 }).success).toBe(false);
    expect(
      listingSchema.safeParse({ ...auto, body_condition: 0, mechanical_condition: 100 }).success,
    ).toBe(true);
  });

  it("acepta un auto válido", () => {
    expect(listingSchema.safeParse(auto).success).toBe(true);
  });

  it("acepta una moto válida", () => {
    expect(listingSchema.safeParse(moto).success).toBe(true);
  });

  it("exige carrocería en autos", () => {
    const r = listingSchema.safeParse({ ...auto, body_type: undefined });
    expect(r.success).toBe(false);
    expect(r.error?.issues.some((i) => i.path[0] === "body_type")).toBe(true);
  });

  it("exige tipo y cilindrada en motos", () => {
    const r = listingSchema.safeParse({ ...moto, moto_type: undefined, engine_cc: undefined });
    expect(r.success).toBe(false);
    const paths = r.error?.issues.map((i) => i.path[0]);
    expect(paths).toContain("moto_type");
    expect(paths).toContain("engine_cc");
  });

  it.each([
    ["precio muy bajo", { price_mxn: 10 }],
    ["año futuro lejano", { year: 2999 }],
    ["km negativo", { mileage_km: -1 }],
    ["estado inexistente", { state: "narnia" }],
    ["descripción larga", { description: "x".repeat(2001) }],
  ])("rechaza %s", (_name, patch) => {
    expect(listingSchema.safeParse({ ...auto, ...patch }).success).toBe(false);
  });

  it("convierte textos vacíos opcionales en undefined", () => {
    const r = listingSchema.parse({ ...auto, version: "  ", color: "" });
    expect(r.version).toBeUndefined();
    expect(r.color).toBeUndefined();
  });
});

describe("photoPathsSchema", () => {
  it("exige entre 1 y 12 fotos", () => {
    expect(photoPathsSchema.safeParse([]).success).toBe(false);
    expect(photoPathsSchema.safeParse(["a"]).success).toBe(true);
    expect(
      photoPathsSchema.safeParse(Array.from({ length: 13 }, (_, i) => String(i))).success,
    ).toBe(false);
  });
});

describe("toMxE164", () => {
  it("normaliza celulares mexicanos", () => {
    expect(toMxE164("55 1234 5678")).toBe("+525512345678");
    expect(toMxE164("+52 81 1234 5678")).toBe("+528112345678");
  });
  it("rechaza números inválidos o de otros países", () => {
    expect(toMxE164("123")).toBeNull();
    expect(toMxE164("+1 202 555 0123")).toBeNull();
  });
});

describe("parseFacebook / messengerUrl", () => {
  it.each([
    ["juan.perez", "juan.perez"],
    ["@juan.perez", "juan.perez"],
    ["facebook.com/juan.perez", "juan.perez"],
    ["https://www.facebook.com/juan.perez/?ref=x", "juan.perez"],
    ["https://m.facebook.com/profile.php?id=100012345", "profile.php?id=100012345"],
    ["fb.com/juan.perez", "juan.perez"],
  ])("reconoce %s", (raw, out) => {
    expect(parseFacebook(raw)).toBe(out);
  });
  it.each(["", "ab", "juan perez", "https://evil.com/juan.perez", "javascript:alert(1)"])(
    "rechaza %j",
    (raw) => {
      expect(parseFacebook(raw)).toBeNull();
    },
  );
  it("arma el enlace de Messenger", () => {
    expect(messengerUrl("juan.perez")).toBe("https://m.me/juan.perez");
    expect(messengerUrl("profile.php?id=123")).toBe("https://m.me/123");
  });
});
