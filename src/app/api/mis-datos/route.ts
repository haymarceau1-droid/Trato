import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Derecho de acceso: descarga en JSON los datos personales de la persona con sesión iniciada. */
export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  const id = auth.user.id;

  const [profile, listings, favorites, reports] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("listings").select("*, listing_photos(storage_path, position)").eq("user_id", id),
    supabase.from("favorites").select("listing_id, created_at").eq("user_id", id),
    supabase
      .from("reports")
      .select("listing_id, reason, comment, status, created_at")
      .eq("reporter_id", id),
  ]);

  const body = {
    generado_en: new Date().toISOString(),
    cuenta: { id, correo: auth.user.email ?? null, celular: auth.user.phone || null },
    perfil: profile.data,
    anuncios: listings.data ?? [],
    favoritos: favorites.data ?? [],
    reportes_enviados: reports.data ?? [],
  };
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mis-datos.json"',
      "Cache-Control": "no-store",
    },
  });
}
