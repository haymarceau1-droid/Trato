export type VehicleType = "auto" | "moto";

export const VEHICLE_TYPES: { value: VehicleType; label: string; plural: string; path: string }[] =
  [
    { value: "auto", label: "Auto", plural: "Autos", path: "autos" },
    { value: "moto", label: "Moto", plural: "Motos", path: "motos" },
  ];

export const vehiclePath = (t: VehicleType) => (t === "auto" ? "autos" : "motos");

export const TRANSMISSIONS = [
  { value: "manual", label: "Manual" },
  { value: "automatica", label: "Automática" },
] as const;

export const FUELS = [
  { value: "gasolina", label: "Gasolina" },
  { value: "diesel", label: "Diésel" },
  { value: "hibrido", label: "Híbrido" },
  { value: "electrico", label: "Eléctrico" },
] as const;

export const INVOICE_TYPES = [
  { value: "original", label: "Factura original" },
  { value: "refacturado", label: "Refacturado" },
  { value: "aseguradora", label: "Factura de aseguradora" },
  { value: "sin_factura", label: "Sin factura" },
] as const;

export const BODY_TYPES = [
  { value: "sedan", label: "Sedán" },
  { value: "hatchback", label: "Hatchback" },
  { value: "suv", label: "SUV" },
  { value: "pickup", label: "Pickup" },
  { value: "van", label: "Van" },
  { value: "coupe", label: "Coupé" },
  { value: "convertible", label: "Convertible" },
] as const;

export const TRACTIONS = [
  { value: "4x2", label: "4x2" },
  { value: "4x4", label: "4x4" },
  { value: "awd", label: "AWD" },
] as const;

export const MOTO_TYPES = [
  { value: "deportiva", label: "Deportiva" },
  { value: "chopper", label: "Chopper" },
  { value: "touring", label: "Touring" },
  { value: "doble_proposito", label: "Doble propósito" },
  { value: "scooter", label: "Scooter" },
  { value: "trabajo", label: "Trabajo" },
  { value: "naked", label: "Naked" },
] as const;

export const REPORT_REASONS = [
  { value: "posible_estafa", label: "Posible estafa" },
  { value: "precio_falso", label: "Precio falso" },
  { value: "auto_robado", label: "Vehículo robado" },
  { value: "datos_falsos", label: "Datos falsos" },
  { value: "ya_vendido", label: "Ya está vendido" },
  { value: "otro", label: "Otro motivo" },
] as const;

export const SORTS = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
  { value: "km_asc", label: "Menor kilometraje" },
] as const;

export const PRICE_RANGES = [
  { label: "Hasta $100,000", max: 100000 },
  { label: "$100,000 – $200,000", min: 100000, max: 200000 },
  { label: "$200,000 – $350,000", min: 200000, max: 350000 },
  { label: "Más de $350,000", min: 350000 },
] as const;

export const labelOf = (list: readonly { value: string; label: string }[], v?: string | null) =>
  list.find((i) => i.value === v)?.label ?? v ?? "";

/** Los 32 estados (espejo de supabase/seed.sql). */
export const MX_STATES = [
  ["aguascalientes", "Aguascalientes"],
  ["baja-california", "Baja California"],
  ["baja-california-sur", "Baja California Sur"],
  ["campeche", "Campeche"],
  ["chiapas", "Chiapas"],
  ["chihuahua", "Chihuahua"],
  ["ciudad-de-mexico", "Ciudad de México"],
  ["coahuila", "Coahuila"],
  ["colima", "Colima"],
  ["durango", "Durango"],
  ["estado-de-mexico", "Estado de México"],
  ["guanajuato", "Guanajuato"],
  ["guerrero", "Guerrero"],
  ["hidalgo", "Hidalgo"],
  ["jalisco", "Jalisco"],
  ["michoacan", "Michoacán"],
  ["morelos", "Morelos"],
  ["nayarit", "Nayarit"],
  ["nuevo-leon", "Nuevo León"],
  ["oaxaca", "Oaxaca"],
  ["puebla", "Puebla"],
  ["queretaro", "Querétaro"],
  ["quintana-roo", "Quintana Roo"],
  ["san-luis-potosi", "San Luis Potosí"],
  ["sinaloa", "Sinaloa"],
  ["sonora", "Sonora"],
  ["tabasco", "Tabasco"],
  ["tamaulipas", "Tamaulipas"],
  ["tlaxcala", "Tlaxcala"],
  ["veracruz", "Veracruz"],
  ["yucatan", "Yucatán"],
  ["zacatecas", "Zacatecas"],
].map(([slug, name]) => ({ slug, name }));

export const stateBySlug = (slug?: string | null) => MX_STATES.find((s) => s.slug === slug);
export const stateName = (slug?: string | null) => stateBySlug(slug)?.name ?? slug ?? "";

/** Tope del control deslizante de precio (lo que pasa de aquí cuenta como "+"). */
export const PRICE_CAP = { auto: 800_000, moto: 250_000 } as const;
