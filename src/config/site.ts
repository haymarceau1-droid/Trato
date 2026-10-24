/** Reglas de negocio y límites. */
export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "es-MX",
  timeZone: "America/Mexico_City",
  pageSize: 12,
  listingTtlDays: 60,
  maxActivePerUser: 5,
  maxPublishPerDay: 10,
  maxReportsPerDay: 10,
  reportsToAutoPause: 3,
  minPhotos: 1,
  maxPhotos: 12,
  maxDescription: 2000,
  /** Precio más de 40 % por debajo de la mediana → revisión. */
  suspiciousPriceRatio: 0.6,
  minSamplesForMedian: 5,
  repuveUrl: "https://www2.repuve.gob.mx:8443/ciudadania/servletconsulta",
} as const;
