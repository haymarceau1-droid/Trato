"use server";

import { revalidatePath } from "next/cache";
import { site } from "@/config/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { listingSchema, photoPathsSchema, type ListingInput } from "@/lib/validation/listing";
import { buildTitle } from "@/lib/listings/title";
import { listingPath, slugify } from "@/lib/listings/slug";
import { detectSuspicious, REVIEW_MESSAGES, type ReviewReason } from "@/lib/trust/suspicious";
import { PHOTO_BUCKET } from "@/lib/listings/photos";
import { dbError, fail, requireUser, type Result } from "./_shared";

type SupabaseClient = Awaited<ReturnType<typeof requireUser>>["supabase"];

function toRow(v: ListingInput) {
  const title = buildTitle(v);
  const isAuto = v.vehicle_type === "auto";
  return {
    vehicle_type: v.vehicle_type,
    title,
    slug: slugify(`${title} ${v.city}`),
    brand: v.brand,
    brand_slug: slugify(v.brand),
    model: v.model,
    model_slug: slugify(v.model),
    version: v.version ?? null,
    year: v.year,
    color: v.color ?? null,
    transmission: v.transmission,
    fuel: v.fuel,
    mileage_km: v.mileage_km,
    owners_count: v.owners_count ?? null,
    invoice_type: v.invoice_type,
    plates_state: v.plates_state || null,
    tenencia_al_corriente: v.tenencia_al_corriente,
    body_type: isAuto ? (v.body_type ?? null) : null,
    doors: isAuto ? (v.doors ?? null) : null,
    engine_liters: isAuto ? (v.engine_liters ?? null) : null,
    traction: isAuto ? (v.traction ?? null) : null,
    moto_type: isAuto ? null : (v.moto_type ?? null),
    engine_cc: isAuto ? null : (v.engine_cc ?? null),
    price_mxn: v.price_mxn,
    negotiable: v.negotiable,
    state: v.state,
    city: v.city,
    city_slug: slugify(v.city),
    description: v.description,
  };
}

async function reviewReasons(
  supabase: SupabaseClient,
  v: ListingInput,
  excludeId?: string,
): Promise<ReviewReason[]> {
  const { data: median } = await supabase.rpc("median_price", {
    p_type: v.vehicle_type,
    p_brand_slug: slugify(v.brand),
    p_model_slug: slugify(v.model),
    p_year: v.year,
    p_exclude: excludeId ?? null,
  });
  return detectSuspicious({
    description: v.description,
    price: v.price_mxn,
    medianPrice: (median as number | null) ?? null,
  });
}

const photosOk = (paths: string[], uid: string, id: string) =>
  paths.every((p) => p.startsWith(`${uid}/${id}/`) && !p.includes(".."));

async function savePhotos(supabase: SupabaseClient, listingId: string, paths: string[]) {
  await supabase.from("listing_photos").delete().eq("listing_id", listingId);
  const { error } = await supabase
    .from("listing_photos")
    .insert(
      paths.map((storage_path, position) => ({ listing_id: listingId, storage_path, position })),
    );
  return error;
}

async function flag(listingId: string, reasons: ReviewReason[]) {
  await createAdminClient()
    .from("listings")
    .update({ needs_review: true, review_reasons: reasons })
    .eq("id", listingId);
}

export async function createListing(
  id: string,
  input: unknown,
  photoPaths: string[],
): Promise<Result<{ path: string; warnings: string[] }>> {
  const { supabase, user } = await requireUser();
  if (!user) return fail("Inicia sesión para publicar.");

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Revisa los datos del anuncio.");
  const photos = photoPathsSchema.safeParse(photoPaths);
  if (!photos.success) return fail(photos.error.issues[0]?.message ?? "Revisa las fotos.");
  if (!photosOk(photos.data, user.id, id))
    return fail("Las fotos no son válidas. Súbelas de nuevo.");

  const reasons = await reviewReasons(supabase, parsed.data);
  const row = toRow(parsed.data);
  const { error } = await supabase.from("listings").insert({ id, user_id: user.id, ...row });
  if (error) return fail(dbError(error.message));

  const photoError = await savePhotos(supabase, id, photos.data);
  if (photoError) {
    await supabase.from("listings").delete().eq("id", id);
    return fail(dbError(photoError.message));
  }
  if (reasons.length) await flag(id, reasons);

  revalidatePath("/mis-anuncios");
  return {
    ok: true,
    path: listingPath({ slug: row.slug, id }),
    warnings: reasons.map((r) => REVIEW_MESSAGES[r]),
  };
}

export async function updateListing(
  id: string,
  input: unknown,
  photoPaths: string[],
): Promise<Result<{ path: string; warnings: string[] }>> {
  const { supabase, user } = await requireUser();
  if (!user) return fail("Inicia sesión para editar.");

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Revisa los datos del anuncio.");
  const photos = photoPathsSchema.safeParse(photoPaths);
  if (!photos.success) return fail(photos.error.issues[0]?.message ?? "Revisa las fotos.");
  if (!photosOk(photos.data, user.id, id))
    return fail("Las fotos no son válidas. Súbelas de nuevo.");

  const { data: current } = await supabase
    .from("listings")
    .select("id, listing_photos(storage_path)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!current) return fail("No encontramos ese anuncio.");

  const reasons = await reviewReasons(supabase, parsed.data, id);
  const row = toRow(parsed.data);
  const { error } = await supabase.from("listings").update(row).eq("id", id);
  if (error) return fail(dbError(error.message));
  const photoError = await savePhotos(supabase, id, photos.data);
  if (photoError) return fail(dbError(photoError.message));

  const dropped = (current.listing_photos as { storage_path: string }[])
    .map((p) => p.storage_path)
    .filter((p) => !photos.data.includes(p) && !p.startsWith("http"));
  if (dropped.length) await supabase.storage.from(PHOTO_BUCKET).remove(dropped);
  if (reasons.length) await flag(id, reasons);

  revalidatePath("/mis-anuncios");
  return {
    ok: true,
    path: listingPath({ slug: row.slug, id }),
    warnings: reasons.map((r) => REVIEW_MESSAGES[r]),
  };
}

export async function setListingStatus(
  id: string,
  status: "active" | "paused" | "sold",
): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return fail("Inicia sesión.");
  const { data: cur } = await supabase
    .from("listings")
    .select("status, needs_review")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!cur) return fail("No encontramos ese anuncio.");
  if (
    status === "active" &&
    (cur.status === "removed" || (cur.needs_review && cur.status === "paused"))
  )
    return fail("Este anuncio está en revisión. Te avisaremos cuando se reactive.");
  const { error } = await supabase.from("listings").update({ status }).eq("id", id);
  if (error) return fail(dbError(error.message));
  revalidatePath("/mis-anuncios");
  return { ok: true };
}

export async function renewListing(id: string): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return fail("Inicia sesión.");
  const { data: cur } = await supabase
    .from("listings")
    .select("status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!cur || cur.status === "removed") return fail("No se puede renovar este anuncio.");
  const expires_at = new Date(Date.now() + site.listingTtlDays * 86_400_000).toISOString();
  const patch: { expires_at: string; status?: "active" } = { expires_at };
  if (cur.status === "expired") patch.status = "active";
  const { error } = await supabase.from("listings").update(patch).eq("id", id);
  if (error) return fail(dbError(error.message));
  revalidatePath("/mis-anuncios");
  return { ok: true };
}

export async function deleteListing(id: string): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return fail("Inicia sesión.");
  const { data: cur } = await supabase
    .from("listings")
    .select("listing_photos(storage_path)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!cur) return fail("No encontramos ese anuncio.");
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) return fail(dbError(error.message));
  const paths = (cur.listing_photos as { storage_path: string }[])
    .map((p) => p.storage_path)
    .filter((p) => !p.startsWith("http"));
  if (paths.length) await supabase.storage.from(PHOTO_BUCKET).remove(paths);
  revalidatePath("/mis-anuncios");
  return { ok: true };
}

/** Aviso de precio para el paso 4 del formulario. */
export async function getPriceHint(input: {
  vehicle_type: "auto" | "moto";
  brand: string;
  model: string;
  year: number;
}): Promise<number | null> {
  const { supabase, user } = await requireUser();
  if (!user || !input.brand || !input.model || !input.year) return null;
  const { data } = await supabase.rpc("median_price", {
    p_type: input.vehicle_type,
    p_brand_slug: slugify(input.brand),
    p_model_slug: slugify(input.model),
    p_year: input.year,
  });
  return (data as number | null) ?? null;
}
