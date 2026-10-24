/**
 * Datos de demo vía API (service role): 30 autos + 15 motos para demo@trato.mx.
 * Uso: npm run seed:demo   (requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY)
 * Alternativa sin claves: pega supabase/demo.sql en el SQL Editor de Supabase (npm run demo:sql lo regenera).
 */
import { createClient } from "@supabase/supabase-js";
import { buildDemoRows, demoPhotos } from "./demo-data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
const db = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const email = "demo@trato.mx";
  const { data: created, error: userErr } = await db.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  let userId = created?.user?.id;
  if (userErr) {
    const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
    userId = list?.users.find((u) => u.email === email)?.id;
  }
  if (!userId) throw new Error(`No se pudo crear/encontrar el usuario demo: ${userErr?.message}`);
  await db
    .from("profiles")
    .update({
      display_name: "Vendedor Demo",
      phone: "+525512345678",
      phone_verified: true,
      state: "ciudad-de-mexico",
      city: "Ciudad de México",
    })
    .eq("id", userId);

  await db.from("listings").delete().eq("user_id", userId);
  const rows = buildDemoRows(userId);
  const { error } = await db.from("listings").insert(rows);
  if (error) throw error;
  const photos = rows.flatMap((r, n) => demoPhotos(n).map((p) => ({ ...p, listing_id: r.id })));
  const { error: photoErr } = await db.from("listing_photos").insert(photos);
  if (photoErr) throw photoErr;
  console.log(`Listo: ${rows.length} anuncios de demo para ${email}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
