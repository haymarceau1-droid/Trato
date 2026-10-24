"use server";

import { revalidatePath } from "next/cache";
import { fail, requireUser, type Result } from "./_shared";

export async function toggleFavorite(listingId: string): Promise<Result<{ favorite: boolean }>> {
  const { supabase, user } = await requireUser();
  if (!user) return fail("Inicia sesión para guardar este vehículo en tus favoritos.");
  const { data: existing } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();
  const { error } = existing
    ? await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId)
    : await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId });
  if (error) return fail("No pudimos guardarlo. Intenta de nuevo, no se perdió nada.");
  revalidatePath("/favoritos");
  return { ok: true, favorite: !existing };
}
