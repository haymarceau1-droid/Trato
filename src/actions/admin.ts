"use server";

import { revalidatePath } from "next/cache";
import { fail, requireAdmin, type Result } from "./_shared";

const NO_ADMIN = "No tienes permisos de administrador.";

export async function resolveReport(
  id: string,
  status: "revisado" | "descartado",
): Promise<Result> {
  const ctx = await requireAdmin();
  if (!ctx) return fail(NO_ADMIN);
  const { error } = await ctx.supabase.from("reports").update({ status }).eq("id", id);
  if (error) return fail("No se pudo actualizar el reporte.");
  revalidatePath("/admin/reportes");
  return { ok: true };
}

/** Retira un anuncio o lo restablece (y limpia la marca de revisión). */
export async function moderateListing(id: string, action: "remove" | "restore"): Promise<Result> {
  const ctx = await requireAdmin();
  if (!ctx) return fail(NO_ADMIN);
  const patch =
    action === "remove"
      ? { status: "removed", removed_reason: "moderacion" }
      : { status: "active", needs_review: false, review_reasons: [], removed_reason: null };
  const { error } = await ctx.supabase.from("listings").update(patch).eq("id", id);
  if (error) return fail("No se pudo actualizar el anuncio.");
  if (action === "restore")
    await ctx.supabase
      .from("reports")
      .update({ status: "descartado" })
      .eq("listing_id", id)
      .eq("status", "nuevo");
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function setUserBlocked(userId: string, blocked: boolean): Promise<Result> {
  const ctx = await requireAdmin();
  if (!ctx) return fail(NO_ADMIN);
  if (userId === ctx.user.id) return fail("No puedes bloquearte a ti mismo.");
  const { error } = await ctx.supabase
    .from("profiles")
    .update({ is_blocked: blocked })
    .eq("id", userId);
  if (error) return fail("No se pudo actualizar el usuario.");
  if (blocked)
    await ctx.supabase
      .from("listings")
      .update({ status: "removed", removed_reason: "usuario_bloqueado" })
      .eq("user_id", userId)
      .in("status", ["active", "paused"]);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
