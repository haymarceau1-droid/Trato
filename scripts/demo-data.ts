import { buildTitle } from "../src/lib/listings/title";
import { slugify } from "../src/lib/listings/slug";

const CITIES: [string, string][] = [
  ["ciudad-de-mexico", "Ciudad de México"],
  ["nuevo-leon", "Monterrey"],
  ["jalisco", "Guadalajara"],
  ["puebla", "Puebla"],
  ["queretaro", "Querétaro"],
  ["guanajuato", "León"],
  ["yucatan", "Mérida"],
  ["baja-california", "Tijuana"],
  ["estado-de-mexico", "Naucalpan"],
  ["veracruz", "Veracruz"],
];

type Auto = [
  brand: string,
  model: string,
  version: string,
  year: number,
  price: number,
  km: number,
  body: string,
  trans: "manual" | "automatica",
  liters: number,
];
const AUTOS: Auto[] = [
  ["Nissan", "Versa", "Advance", 2019, 215000, 78000, "sedan", "manual", 1.6],
  ["Nissan", "March", "Sense", 2018, 148000, 82000, "hatchback", "manual", 1.6],
  ["Nissan", "Sentra", "Exclusive", 2017, 205000, 98000, "sedan", "automatica", 1.8],
  ["Nissan", "Kicks", "Advance", 2020, 335000, 54000, "suv", "automatica", 1.6],
  ["Nissan", "NP300", "Estaquitas", 2016, 189000, 142000, "pickup", "manual", 2.4],
  ["Chevrolet", "Aveo", "LT", 2018, 139000, 91000, "sedan", "manual", 1.6],
  ["Chevrolet", "Onix", "Premier", 2021, 268000, 36000, "hatchback", "automatica", 1.2],
  ["Chevrolet", "Spark", "LT", 2017, 112000, 105000, "hatchback", "manual", 1.2],
  ["Chevrolet", "Silverado", "LT", 2017, 459000, 128000, "pickup", "automatica", 5.3],
  ["Volkswagen", "Jetta", "Comfortline", 2018, 245000, 88000, "sedan", "automatica", 1.4],
  ["Volkswagen", "Vento", "Starline", 2019, 198000, 74000, "sedan", "manual", 1.6],
  ["Volkswagen", "Tiguan", "Comfortline", 2019, 385000, 67000, "suv", "automatica", 1.4],
  ["Volkswagen", "Polo", "Hatchback", 2020, 236000, 49000, "hatchback", "manual", 1.6],
  ["Toyota", "Corolla", "LE", 2019, 289000, 71000, "sedan", "automatica", 1.8],
  ["Toyota", "Yaris", "Core", 2020, 232000, 52000, "hatchback", "manual", 1.5],
  ["Toyota", "Hilux", "SR", 2018, 389000, 112000, "pickup", "manual", 2.7],
  ["Toyota", "RAV4", "XLE", 2017, 355000, 118000, "suv", "automatica", 2.5],
  ["Kia", "Rio", "EX", 2019, 225000, 69000, "sedan", "automatica", 1.6],
  ["Kia", "Forte", "EX", 2018, 219000, 85000, "sedan", "automatica", 2.0],
  ["Kia", "Sportage", "LX", 2018, 318000, 94000, "suv", "automatica", 2.4],
  ["Mazda", "Mazda 3", "i Sport", 2018, 255000, 83000, "sedan", "automatica", 2.0],
  ["Mazda", "CX-5", "i Grand Touring", 2019, 395000, 62000, "suv", "automatica", 2.5],
  ["Mazda", "Mazda 2", "i Touring", 2017, 175000, 99000, "hatchback", "manual", 1.5],
  ["Honda", "Civic", "Turbo Plus", 2018, 329000, 76000, "sedan", "automatica", 1.5],
  ["Honda", "CR-V", "EX", 2016, 289000, 123000, "suv", "automatica", 2.4],
  ["Ford", "Figo", "Impulse", 2018, 129000, 88000, "hatchback", "manual", 1.5],
  ["Ford", "Ranger", "XLT", 2019, 449000, 91000, "pickup", "automatica", 2.2],
  ["Hyundai", "Grand i10", "GL", 2019, 158000, 57000, "sedan", "manual", 1.2],
  ["Suzuki", "Swift", "GLS", 2018, 164000, 79000, "hatchback", "manual", 1.2],
  ["MG", "MG 5", "Excite", 2022, 255000, 31000, "sedan", "automatica", 1.5],
];

type Moto = [
  brand: string,
  model: string,
  year: number,
  price: number,
  km: number,
  type: string,
  cc: number,
];
const MOTOS: Moto[] = [
  ["Italika", "FT150", 2021, 17500, 14000, "trabajo", 150],
  ["Italika", "DM150", 2020, 15900, 18000, "doble_proposito", 150],
  ["Italika", "125Z", 2019, 12500, 22000, "naked", 125],
  ["Italika", "250Z", 2022, 31500, 8000, "naked", 250],
  ["Italika", "AT110", 2021, 13900, 9000, "scooter", 110],
  ["Honda", "CB190R", 2020, 42500, 16000, "naked", 190],
  ["Honda", "XR150L", 2021, 36500, 12000, "doble_proposito", 150],
  ["Honda", "Elite 125", 2019, 21000, 24000, "scooter", 125],
  ["Yamaha", "FZ25", 2019, 47500, 21000, "naked", 250],
  ["Yamaha", "YZF-R3", 2018, 74000, 19000, "deportiva", 321],
  ["Suzuki", "GN125", 2017, 16500, 31000, "trabajo", 125],
  ["Bajaj", "Pulsar NS200", 2020, 38000, 17000, "naked", 200],
  ["Vento", "Rocketman", 2021, 18500, 11000, "scooter", 150],
  ["Kawasaki", "Ninja 400", 2019, 98000, 14000, "deportiva", 399],
  ["Harley-Davidson", "Sportster", 2016, 149000, 28000, "chopper", 883],
];

const pick = <T>(arr: T[], i: number) => arr[i % arr.length]!;

export const demoId = (i: number) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`;

/** Fotos de relleno (picsum.photos): 4 por anuncio. No son de los vehículos. */
export const demoPhotos = (i: number) =>
  Array.from({ length: 4 }, (_, p) => ({
    position: p,
    storage_path: `https://picsum.photos/seed/trato-${i}-${p}/1200/900`,
  }));

export function buildDemoRows(userId: string) {
  return [
    ...AUTOS.map(([brand, model, version, year, price, km, body, trans, liters], i) => ({
      vehicle_type: "auto",
      brand,
      model,
      version,
      year,
      price_mxn: price,
      mileage_km: km,
      body_type: body,
      transmission: trans,
      engine_liters: liters,
      doors: body === "pickup" ? 4 : body === "hatchback" ? 5 : 4,
      traction: body === "pickup" || body === "suv" ? "4x2" : null,
      fuel: "gasolina",
      i,
    })),
    ...MOTOS.map(([brand, model, year, price, km, type, cc], i) => ({
      vehicle_type: "moto",
      brand,
      model,
      version: null,
      year,
      price_mxn: price,
      mileage_km: km,
      moto_type: type,
      engine_cc: cc,
      transmission: type === "scooter" ? "automatica" : "manual",
      fuel: "gasolina",
      i: i + 100,
    })),
  ].map(({ i, ...v }) => {
    const [state, city] = pick(CITIES, i);
    const title = buildTitle({ brand: v.brand, model: v.model, year: v.year, version: v.version });
    return {
      id: demoId(i),
      user_id: userId,
      ...v,
      title,
      slug: slugify(`${title} ${city}`),
      brand_slug: slugify(v.brand),
      model_slug: slugify(v.model),
      color: pick(["Blanco", "Negro", "Gris", "Rojo", "Azul", "Plata"], i),
      owners_count: 1 + (i % 2),
      invoice_type: pick(["original", "original", "refacturado"], i),
      tenencia_al_corriente: i % 5 !== 0,
      negotiable: i % 2 === 0,
      state,
      city,
      city_slug: slugify(city),
      plates_state: state,
      description: `${title} en excelente estado. Servicios al corriente, factura vigente y lista para trámite. Se puede revisar con mecánico. Trato en lugar público.`,
      created_at: new Date(Date.now() - (i % 20) * 86_400_000).toISOString(),
    };
  });
}
