"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseFacebook, profileSchema, toMxE164 } from "@/lib/validation/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { PHOTO_BUCKET } from "@/lib/listings/photos";
import { createClient } from "@/lib/supabase/server";
import { fail, requireUser, type Result } from "./_shared";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(input: unknown): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return fail("Inicia sesión.");
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Revisa tus datos.");
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name,
      state: parsed.data.state || null,
      city: parsed.data.city || null,
    })
    .eq("id", user.id);
  if (error) return fail("No pudimos guardar tus datos. Nada cambió; intenta de nuevo.");
  revalidatePath("/cuenta");
  return { ok: true };
}

/** Guarda el WhatsApp del vendedor (queda sin verificar; solo el OTP por SMS da el distintivo). */
export async function updatePhone(raw: string): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return fail("Inicia sesión.");
  const phone = toMxE164(raw);
  if (!phone) return fail("Escribe un celular mexicano válido de 10 dígitos.");
  const { error } = await supabase.from("profiles").update({ phone }).eq("id", user.id);
  if (error) return fail("No pudimos guardar tu número. Nada cambió; intenta de nuevo.");
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Guarda el Facebook del vendedor (opcional; vacío lo quita). Se muestra solo como botón de contacto. */
export async function updateFacebook(raw: string): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return fail("Inicia sesión.");
  const facebook = raw.trim() ? parseFacebook(raw) : null;
  if (raw.trim() && !facebook)
    return fail("No reconocimos ese usuario. Pega el enlace de tu perfil de Facebook.");
  const { error } = await supabase.from("profiles").update({ facebook }).eq("id", user.id);
  if (error) return fail("No pudimos guardar tu Facebook. Nada cambió; intenta de nuevo.");
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Cancelación de datos (derecho ARCO): borra fotos, anuncios, favoritos, reportes y perfil.
 * Los anuncios, favoritos y reportes se eliminan en cascada al borrar el usuario de Auth.
 */
export async function deleteAccount(confirm: string): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return fail("Inicia sesión.");
  if (confirm.trim().toUpperCase() !== "BORRAR") return fail("Escribe BORRAR para confirmar.");

  const admin = createAdminClient();
  // Fotos propias en el bucket (carpeta {user_id}/…), en lotes.
  const folder = async (prefix: string): Promise<string[]> => {
    const { data } = await admin.storage.from(PHOTO_BUCKET).list(prefix, { limit: 1000 });
    const out: string[] = [];
    for (const f of data ?? []) {
      if (f.id) out.push(`${prefix}/${f.name}`);
      else out.push(...(await folder(`${prefix}/${f.name}`)));
    }
    return out;
  };
  const files = await folder(user.id);
  if (files.length) await admin.storage.from(PHOTO_BUCKET).remove(files);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return fail("No pudimos borrar tu cuenta. Escríbenos y lo hacemos manualmente.");
  await supabase.auth.signOut();
  redirect("/?cuenta=borrada");
}
