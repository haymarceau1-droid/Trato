"use server";

import { site } from "@/config/site";
import { reportSchema } from "@/lib/validation/report";
import { dbError, fail, requireUser, type Result } from "./_shared";

export async function createReport(input: unknown): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return fail("Inicia sesión para reportar un anuncio.");
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Revisa el reporte.");

  const { data: listing } = await supabase
    .from("listings")
    .select("user_id")
    .eq("id", parsed.data.listing_id)
    .maybeSingle();
  if (!listing) return fail("No encontramos ese anuncio.");
  if (listing.user_id === user.id) return fail("No puedes reportar tu propio anuncio.");

  const { data: allowed } = await supabase.rpc("rate_limit_hit", {
    p_action: "report",
    p_max: site.maxReportsPerDay,
    p_window: "24 hours",
  });
  if (!allowed) return fail("Enviaste demasiados reportes hoy. Intenta mañana.");

  const { error } = await supabase
    .from("reports")
    .insert({ ...parsed.data, comment: parsed.data.comment || null, reporter_id: user.id });
  if (error)
    return fail(
      error.code === "23505" ? "Ya reportaste este anuncio. Gracias." : dbError(error.message),
    );
  return { ok: true };
}
