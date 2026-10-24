import { describe, expect, it } from "vitest";
import { detectSuspicious } from "@/lib/trust/suspicious";

const base = {
  description: "Auto en excelente estado, un solo dueño.",
  price: 200000,
  medianPrice: 210000,
};

describe("detectSuspicious", () => {
  it("no marca un anuncio normal", () => {
    expect(detectSuspicious(base)).toEqual([]);
  });

  it("marca precio más de 40 % por debajo de la mediana", () => {
    expect(detectSuspicious({ ...base, price: 120000, medianPrice: 210000 })).toContain(
      "precio_bajo",
    );
    expect(detectSuspicious({ ...base, price: 130000, medianPrice: 210000 })).not.toContain(
      "precio_bajo",
    );
  });

  it("ignora el precio si no hay mediana", () => {
    expect(detectSuspicious({ ...base, price: 1000, medianPrice: null })).toEqual([]);
  });

  it.each([
    "Pido anticipo de $5,000",
    "Se aparta con depósito para apartar",
    "Apartado con $3000",
    "ANTICIPO",
  ])("detecta solicitudes de anticipo: %s", (description) => {
    expect(detectSuspicious({ ...base, description })).toContain("anticipo");
  });

  it.each(["Llama al 55 1234 5678", "Whatsapp 5512345678", "Tel: +52 (81) 1234-5678"])(
    "detecta teléfonos: %s",
    (description) => {
      expect(detectSuspicious({ ...base, description })).toContain("telefono");
    },
  );

  it("no confunde kilometraje o precio con teléfono", () => {
    expect(detectSuspicious({ ...base, description: "85,000 km, precio $289,000" })).not.toContain(
      "telefono",
    );
  });

  it.each([
    "Más fotos en https://ejemplo.com/x",
    "escríbeme a wa.me/521234",
    "visita www.mi-sitio.mx",
    "mira autos.com",
  ])("detecta enlaces: %s", (description) => {
    expect(detectSuspicious({ ...base, description })).toContain("enlace");
  });
});
