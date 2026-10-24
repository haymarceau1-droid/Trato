import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ ok: false }, { status: 400 });
  const supabase = await createClient();
  await supabase.rpc("increment_views", { p_id: id });
  return NextResponse.json({ ok: true });
}
