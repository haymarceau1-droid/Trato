import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { MX_STATES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { listingPath } from "@/lib/listings/slug";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = [
    "",
    "/autos",
    "/motos",
    "/consejos",
    "/como-vender",
    "/precios",
    "/cookies",
    "/contacto",
    "/terminos",
    "/privacidad",
  ].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const states = (["autos", "motos"] as const).flatMap((t) =>
    MX_STATES.map((s) => ({
      url: `${site.url}/${t}/${s.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.5,
    })),
  );

  let listings: MetadataRoute.Sitemap = [];
  if (supabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("listings")
        .select("id, slug, updated_at")
        .eq("status", "active")
        .gt("expires_at", now.toISOString())
        .order("created_at", { ascending: false })
        .limit(5000);
      listings = (data ?? []).map((l) => ({
        url: `${site.url}${listingPath(l)}`,
        lastModified: new Date(l.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    } catch {
      /* sitemap parcial si la base no responde */
    }
  }
  return [...staticPages, ...states, ...listings];
}
