import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} — Autos y motos usados`,
    short_name: brand.name,
    description: brand.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: brand.colors.light.background,
    theme_color: brand.colors.light.primary,
    lang: "es-MX",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
