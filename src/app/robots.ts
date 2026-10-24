import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/publicar",
        "/mis-anuncios",
        "/favoritos",
        "/cuenta",
        "/acceder",
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
