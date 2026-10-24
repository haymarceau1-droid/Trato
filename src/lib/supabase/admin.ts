import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/** Cliente con service role: solo servidor, nunca importar desde componentes cliente. */
export const createAdminClient = () =>
  createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
