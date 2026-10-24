export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

const validUrl = (u: string) => {
  try {
    return /^https?:$/.test(new URL(u).protocol);
  } catch {
    return false;
  }
};

/** Con una URL mal pegada (sin https://, con comillas…) la app arranca igual, solo que sin datos. */
export const supabaseConfigured = validUrl(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 0;
