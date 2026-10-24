import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatMXN } from "@/lib/format";

const noStore = { "Cache-Control": "no-store" };
const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: noStore });

/** Revela el contacto del vendedor solo a usuarios con sesión. El teléfono nunca va en el HTML público. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return json({ error: "Inicia sesión para ver el contacto." }, 401);

  const { data: allowed } = await supabase.rpc("rate_limit_hit", {
    p_action: "contact",
    p_max: 60,
    p_window: "24 hours",
  });
  if (!allowed) return json({ error: "Viste muchos contactos hoy. Intenta más tarde." }, 429);

  const { data: listing } = await supabase
    .from("listings")
    .select("user_id, title, price_mxn, status")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();
  if (!listing) return json({ error: "Este anuncio ya no está disponible." }, 404);

  const { data: seller } = await createAdminClient()
    .from("profiles")
    .select("phone, is_blocked")
    .eq("id", listing.user_id)
    .single();
  if (!seller?.phone || seller.is_blocked)
    return json({ error: "El vendedor no tiene un teléfono disponible." }, 404);

  const digits = seller.phone.replace(/\D/g, "");
  const wa = digits.startsWith("52") && digits.length === 12 ? `521${digits.slice(2)}` : digits; // formato wa.me para móviles de México
  const text = `Hola, vi tu anuncio "${listing.title}" en ${brand.name} por ${formatMXN(listing.price_mxn)}. ¿Sigue disponible?`;
  return json({
    whatsapp: `https://wa.me/${wa}?text=${encodeURIComponent(text)}`,
    tel: `tel:${seller.phone}`,
  });
}
