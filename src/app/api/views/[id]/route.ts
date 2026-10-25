import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COOKIE = "vw";

/** Cuenta una visita por navegador y anuncio (cookie con los últimos 30 vistos): evita inflar el contador a golpe de peticiones. */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ ok: false }, { status: 400 });

  const jar = await cookies();
  const seen = (jar.get(COOKIE)?.value ?? "").split(",").filter((x) => UUID.test(x));
  if (seen.includes(id)) return NextResponse.json({ ok: true, counted: false });

  const supabase = await createClient();
  await supabase.rpc("increment_views", { p_id: id });
  jar.set(COOKIE, [id, ...seen].slice(0, 30).join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/api/views",
  });
  return NextResponse.json({ ok: true, counted: true });
}
