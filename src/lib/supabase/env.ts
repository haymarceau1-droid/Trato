export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
// Acepta el nombre clásico (anon) o el nuevo de Supabase (publishable). Acceso literal para que Next lo incruste.
export const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  ""
).trim();

const validUrl = (u: string) => {
  try {
    return /^https?:$/.test(new URL(u).protocol);
  } catch {
    return false;
  }
};

/** Con una URL mal pegada (sin https://, con comillas…) la app arranca igual, solo que sin datos. */
export const supabaseConfigured = validUrl(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 0;
