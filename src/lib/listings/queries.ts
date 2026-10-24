import "server-only";
import { cache } from "react";
import { site } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import type { CatalogBrand, Listing, PublicProfile } from "@/types";
import type { VehicleType } from "@/lib/constants";
import type { Filters } from "./filters-url";

const SELECT = "*, listing_photos(id, storage_path, position)";
const ordered = { referencedTable: "listing_photos" } as const;

/** Si Supabase no está configurado (primer arranque) las páginas públicas se muestran vacías. */
async function safe<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  if (!supabaseConfigured) return fallback;
  try {
    return await fn();
  } catch (e) {
    console.error(e);
    return fallback;
  }
}

export const getUser = cache(async () => {
  if (!supabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();
  return { id: data.user.id, email: data.user.email ?? null, profile };
});

export async function searchListings(f: Filters): Promise<{ items: Listing[]; total: number }> {
  return safe({ items: [], total: 0 }, async () => {
    const supabase = await createClient();
    let q = supabase
      .from("listings")
      .select(SELECT, { count: "exact" })
      .eq("vehicle_type", f.type)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString());

    if (f.q) {
      const text = f.q.normalize("NFD").replace(/[̀-ͯ]/g, "");
      q = q.textSearch("search", text, { type: "websearch", config: "spanish" });
    }
    if (f.state) q = q.eq("state", f.state);
    if (f.city) q = q.eq("city_slug", f.city);
    if (f.brand) q = q.eq("brand_slug", f.brand);
    if (f.model) q = q.eq("model_slug", f.model);
    if (f.body) q = q.eq(f.type === "auto" ? "body_type" : "moto_type", f.body);
    if (f.yearMin) q = q.gte("year", f.yearMin);
    if (f.yearMax) q = q.lte("year", f.yearMax);
    if (f.priceMin) q = q.gte("price_mxn", f.priceMin);
    if (f.priceMax) q = q.lte("price_mxn", f.priceMax);
    if (f.kmMax) q = q.lte("mileage_km", f.kmMax);
    if (f.transmission) q = q.eq("transmission", f.transmission);
    if (f.fuel) q = q.eq("fuel", f.fuel);
    if (f.ccMin) q = q.gte("engine_cc", f.ccMin);
    if (f.ccMax) q = q.lte("engine_cc", f.ccMax);

    switch (f.sort) {
      case "precio_asc":
        q = q.order("price_mxn", { ascending: true });
        break;
      case "precio_desc":
        q = q.order("price_mxn", { ascending: false });
        break;
      case "km_asc":
        q = q.order("mileage_km", { ascending: true });
        break;
      default:
        q = q.order("created_at", { ascending: false });
    }
    const from = (f.page - 1) * site.pageSize;
    const { data, count, error } = await q
      .order("position", ordered)
      .range(from, from + site.pageSize - 1);
    if (error) throw error;
    return { items: (data ?? []) as Listing[], total: count ?? 0 };
  });
}

export async function getLatest(limit = 8, type?: VehicleType): Promise<Listing[]> {
  return safe([], async () => {
    const supabase = await createClient();
    let q = supabase
      .from("listings")
      .select(SELECT)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString());
    if (type) q = q.eq("vehicle_type", type);
    const { data, error } = await q
      .order("created_at", { ascending: false })
      .order("position", ordered)
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Listing[];
  });
}

/** Devuelve el anuncio aunque ya no esté activo si el RLS lo permite (dueño/admin). */
export const getListing = cache(async (id: string): Promise<Listing | null> =>
  safe(null, async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings")
      .select(SELECT)
      .eq("id", id)
      .order("position", ordered)
      .maybeSingle();
    return (data as Listing | null) ?? null;
  }),
);

export async function getSimilar(
  l: Pick<Listing, "id" | "vehicle_type" | "brand_slug" | "price_mxn">,
  limit = 4,
) {
  return safe([] as Listing[], async () => {
    const supabase = await createClient();
    const base = () =>
      supabase
        .from("listings")
        .select(SELECT)
        .eq("vehicle_type", l.vehicle_type)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .neq("id", l.id)
        .order("position", ordered);
    const { data } = await base().eq("brand_slug", l.brand_slug).limit(limit);
    let items = (data ?? []) as Listing[];
    if (items.length < limit) {
      const { data: more } = await base()
        .gte("price_mxn", l.price_mxn * 0.6)
        .lte("price_mxn", l.price_mxn * 1.4)
        .limit(limit * 2);
      const seen = new Set(items.map((i) => i.id));
      items = [...items, ...((more ?? []) as Listing[]).filter((i) => !seen.has(i.id))].slice(
        0,
        limit,
      );
    }
    return items;
  });
}

export async function getFavoriteIds(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();
  return safe(new Set<string>(), async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", userId);
    return new Set((data ?? []).map((r) => r.listing_id as string));
  });
}

export async function getFavoriteListings(userId: string): Promise<Listing[]> {
  return safe([], async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("favorites")
      .select(`created_at, listings(${SELECT})`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return (data ?? []).flatMap((r) => (r.listings ? [r.listings as unknown as Listing] : []));
  });
}

export async function getMyListings(userId: string): Promise<Listing[]> {
  return safe([], async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings")
      .select(SELECT)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .order("position", ordered);
    return (data ?? []) as Listing[];
  });
}

export async function getPublicProfile(id: string): Promise<PublicProfile | null> {
  return safe(null, async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("public_profiles").select("*").eq("id", id).maybeSingle();
    return (data as PublicProfile | null) ?? null;
  });
}

export async function getSellerListings(userId: string): Promise<Listing[]> {
  return safe([], async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings")
      .select(SELECT)
      .eq("user_id", userId)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .order("position", ordered);
    return (data ?? []) as Listing[];
  });
}

export const getCatalog = cache(async (type: VehicleType): Promise<CatalogBrand[]> =>
  safe([], async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("catalog_brands")
      .select("name, slug, vehicle_type, models:catalog_models(name, slug)")
      .eq("vehicle_type", type)
      .order("name");
    return ((data ?? []) as unknown as CatalogBrand[]).map((b) => ({
      ...b,
      models: [...b.models].sort((a, c) => a.name.localeCompare(c.name, "es")),
    }));
  }),
);

export async function getMedianPrice(
  type: VehicleType,
  brandSlug: string,
  modelSlug: string,
  year: number,
) {
  return safe<number | null>(null, async () => {
    const supabase = await createClient();
    const { data } = await supabase.rpc("median_price", {
      p_type: type,
      p_brand_slug: brandSlug,
      p_model_slug: modelSlug,
      p_year: year,
    });
    return (data as number | null) ?? null;
  });
}
