/** Punto único de marca: nombre, eslogan y colores. Cambia aquí y se refleja en todo el sitio. */
export const brand = {
  name: "Trato",
  tagline: "Compra y vende autos y motos usados, sin estafas.",
  shortDescription:
    "Anuncios gratuitos de autos y motos usados en México. Vendedores con teléfono verificado y consejos para comprar seguro.",
  contactEmail: "hola@trato.mx",
  logoMark: "T",
  colors: {
    light: {
      background: "#f8faf8",
      foreground: "#14201a",
      card: "#ffffff",
      muted: "#eef2ee",
      mutedForeground: "#4b5a52",
      border: "#d9e1da",
      primary: "#15803d",
      primaryForeground: "#ffffff",
      primarySoft: "#dcfce7",
      danger: "#b91c1c",
      warning: "#92400e",
      warningSoft: "#fef3c7",
    },
    dark: {
      background: "#0d1511",
      foreground: "#eef5f0",
      card: "#16211b",
      muted: "#1d2a23",
      mutedForeground: "#a3b3aa",
      border: "#2b3a32",
      primary: "#22c55e",
      primaryForeground: "#05200f",
      primarySoft: "#12351f",
      danger: "#f87171",
      warning: "#fbbf24",
      warningSoft: "#3a2d0b",
    },
  },
} as const;

const toVars = (c: Record<string, string>) =>
  Object.entries(c)
    .map(([k, v]) => `--${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${v}`)
    .join(";");

export const brandCss = `:root{${toVars(brand.colors.light)}}@media (prefers-color-scheme: dark){:root{${toVars(brand.colors.dark)}}}`;
