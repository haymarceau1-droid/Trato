import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

export const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });

export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { supabase, user: null } as const;
  return { supabase, user: data.user } as const;
}

export async function requireAdmin() {
  const ctx = await requireUser();
  if (!ctx.user) return null;
  const { data } = await ctx.supabase.rpc("is_admin");
  return data ? { supabase: ctx.supabase, user: ctx.user } : null;
}

/** Traduce los errores lanzados por los triggers/RLS de la base de datos. */
export function dbError(message: string | undefined): string {
  const m = message ?? "";
  if (m.includes("limite_activos"))
    return "Ya tienes 5 anuncios activos. Pausa o marca como vendido uno para publicar otro.";
  if (m.includes("limite_diario"))
    return "Llegaste al límite de 10 publicaciones por día. Intenta mañana.";
  if (m.includes("cuenta bloqueada"))
    return "Tu cuenta está bloqueada. Escríbenos desde la página de contacto.";
  if (m.includes("maximo_12_fotos")) return "Máximo 12 fotos por anuncio.";
  return "Algo salió mal. Intenta de nuevo en un momento.";
}
