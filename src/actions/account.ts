"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { profileSchema, toMxE164 } from "@/lib/validation/profile";
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
  if (error) return fail("No pudimos guardar tu perfil. Intenta de nuevo.");
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
  if (error) return fail("No pudimos guardar tu número. Intenta de nuevo.");
  revalidatePath("/", "layout");
  return { ok: true };
}
