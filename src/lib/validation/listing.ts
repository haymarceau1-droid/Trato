import { z } from "zod";
import { site } from "@/config/site";
import {
  BODY_TYPES,
  FUELS,
  INVOICE_TYPES,
  MOTO_TYPES,
  MX_STATES,
  TRACTIONS,
  TRANSMISSIONS,
} from "@/lib/constants";

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((i) => i.value) as [T[number]["value"], ...T[number]["value"][]];

const num = (msg: string) => z.number({ error: msg });
const optText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((v) => v || undefined);
const optNum = (min: number, max: number, msg: string) =>
  z.number({ error: msg }).min(min, msg).max(max, msg).optional();

const thisYear = new Date().getFullYear();

export const listingSchema = z
  .object({
    vehicle_type: z.enum(["auto", "moto"], { error: "Elige auto o moto" }),
    brand: z.string().trim().min(1, "Elige o escribe la marca").max(40),
    model: z.string().trim().min(1, "Elige o escribe el modelo").max(60),
    version: optText(60),
    year: num("Escribe el año")
      .int()
      .min(1950, "Año no válido")
      .max(thisYear + 1, "Año no válido"),
    color: optText(30),
    transmission: z.enum(values(TRANSMISSIONS), { error: "Elige la transmisión" }),
    fuel: z.enum(values(FUELS), { error: "Elige el combustible" }),
    mileage_km: num("Escribe el kilometraje")
      .int()
      .min(0, "No puede ser negativo")
      .max(1_999_999, "Kilometraje no válido"),
    owners_count: optNum(1, 20, "Entre 1 y 20 dueños"),
    invoice_type: z.enum(values(INVOICE_TYPES), { error: "Elige el tipo de factura" }),
    plates_state: optText(40),
    tenencia_al_corriente: z.boolean(),
    body_type: z.enum(values(BODY_TYPES)).optional(),
    doors: optNum(2, 6, "Entre 2 y 6 puertas"),
    engine_liters: optNum(0.1, 14.9, "Cilindrada no válida"),
    traction: z.enum(values(TRACTIONS)).optional(),
    moto_type: z.enum(values(MOTO_TYPES)).optional(),
    engine_cc: optNum(20, 2999, "Cilindrada no válida"),
    body_condition: num("Indica el estado de la carrocería")
      .int()
      .min(0, "Entre 0 y 100")
      .max(100, "Entre 0 y 100"),
    mechanical_condition: num("Indica el estado de la mecánica")
      .int()
      .min(0, "Entre 0 y 100")
      .max(100, "Entre 0 y 100"),
    price_mxn: num("Escribe el precio")
      .int()
      .min(1000, "El precio mínimo es $1,000")
      .max(99_999_999, "Precio no válido"),
    negotiable: z.boolean(),
    state: z.enum(MX_STATES.map((s) => s.slug) as [string, ...string[]], {
      error: "Elige el estado",
    }),
    city: z.string().trim().min(2, "Escribe la ciudad").max(60),
    description: z
      .string()
      .trim()
      .max(site.maxDescription, `Máximo ${site.maxDescription} caracteres`),
  })
  .superRefine((v, ctx) => {
    if (v.vehicle_type === "auto" && !v.body_type)
      ctx.addIssue({ code: "custom", path: ["body_type"], message: "Elige la carrocería" });
    if (v.vehicle_type === "moto") {
      if (!v.moto_type)
        ctx.addIssue({ code: "custom", path: ["moto_type"], message: "Elige el tipo de moto" });
      if (!v.engine_cc)
        ctx.addIssue({
          code: "custom",
          path: ["engine_cc"],
          message: "Escribe la cilindrada (cc)",
        });
    }
  });

export type ListingInput = z.infer<typeof listingSchema>;

export const photoPathsSchema = z
  .array(z.string().min(1))
  .min(site.minPhotos, "Sube al menos 1 foto")
  .max(site.maxPhotos, `Máximo ${site.maxPhotos} fotos`);
