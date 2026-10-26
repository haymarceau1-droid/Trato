/** Punto único de marca: nombre, eslogan y colores. Cambia aquí y se refleja en todo el sitio. */
/** Un solo rojo en todo el sitio (claro y oscuro): cumple contraste AA con texto blanco. */
export const brand = {
  name: "rodara.mx",
  tagline: "Compra y vende autos y motos usados, sin estafas.",
  shortDescription:
    "Compra y vende autos y motos usados en México. Vendedores con celular verificado, sin comisiones y con una guía para revisar factura, REPUVE y tenencia.",
  contactEmail: "hola@rodara.mx",
  logoMark: "R",
  /**
   * Datos del responsable para Términos y Aviso de privacidad (LFPDPPP exige identificarlo y dar domicilio).
   * Reemplaza los textos entre [corchetes] antes de lanzar: mientras tanto se muestran como pendientes.
   */
  legal: {
    responsable: "[Nombre completo o razón social]",
    domicilio: "[Calle, número, colonia, código postal, ciudad y estado]",
    rfc: "[RFC]",
    updated: "24 de octubre de 2026",
  },
  colors: {
    light: {
      background: "#f4eeeb",
      foreground: "#170f0e",
      card: "#faf6f4",
      muted: "#ebe2de",
      mutedForeground: "#5a4e4b",
      border: "#ddd2cd",
      primary: "#e32630",
      primaryForeground: "#ffffff",
      primarySoft: "#f8dcd9",
      success: "#15803d",
      successSoft: "#dcfce7",
      danger: "#e32630",
      warning: "#92400e",
      warningSoft: "#fef3c7",
    },
    dark: {
      background: "#0a0a0a",
      foreground: "#f5f1f0",
      card: "#151515",
      muted: "#1f1c1b",
      mutedForeground: "#aaa19e",
      border: "#2e2928",
      primary: "#e32630",
      primaryForeground: "#ffffff",
      primarySoft: "#3a1214",
      success: "#4ade80",
      successSoft: "#12351f",
      danger: "#e32630",
      warning: "#fbbf24",
      warningSoft: "#3a2d0b",
    },
  },
} as const;

const toVars = (c: Record<string, string>) =>
  Object.entries(c)
    .map(([k, v]) => `--${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${v}`)
    .join(";");

/** `.theme-dark` fuerza la paleta oscura en una sección (p. ej. el héroe negro de la landing). */
export const brandCss = `:root{${toVars(brand.colors.light)}}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${toVars(brand.colors.dark)}}}:root[data-theme="dark"]{${toVars(brand.colors.dark)}}.theme-dark{${toVars(brand.colors.dark)};color-scheme:dark}`;
