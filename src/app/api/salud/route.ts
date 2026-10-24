import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/** Diagnóstico sin secretos: ¿hay variables?, ¿responde la base?, ¿hay tablas y anuncios? */
export async function GET() {
  const report: Record<string, unknown> = {
    variables_supabase: supabaseConfigured
      ? "ok"
      : "faltan o están mal (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    service_role: process.env.SUPABASE_SERVICE_ROLE_KEY ? "ok" : "falta SUPABASE_SERVICE_ROLE_KEY",
  };
  if (supabaseConfigured) {
    const supabase = await createClient();
    const states = await supabase.from("mx_states").select("slug", { count: "exact", head: true });
    const listings = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");
    report.estados = states.error
      ? `error: ${states.error.message} (¿migraciones aplicadas?)`
      : states.count;
    report.anuncios_activos = listings.error ? `error: ${listings.error.message}` : listings.count;
    if (!listings.error && listings.count === 0)
      report.pista = "Base lista pero vacía: ejecuta supabase/demo.sql en el SQL Editor.";
  }
  return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
}
