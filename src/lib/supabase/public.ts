import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Cliente anónimo sin cookies, para datos públicos que se pueden guardar en caché
 * (las políticas RLS ya limitan a anuncios activos y vigentes). Nunca para datos de una persona.
 */
export const createPublicClient = () =>
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
