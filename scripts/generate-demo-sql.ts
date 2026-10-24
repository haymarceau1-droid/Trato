/**
 * Genera supabase/demo.sql: usuario demo + 30 autos + 15 motos, para pegar en el SQL Editor de Supabase
 * (no necesita claves). Idempotente: borra y recrea los anuncios del usuario demo.
 * Uso: npm run demo:sql
 */
import { writeFileSync } from "node:fs";
import { buildDemoRows, demoPhotos } from "./demo-data";

const USER_ID = "00000000-0000-4000-8000-00000000d3a0";
const q = (v: unknown): string =>
  v === null || v === undefined
    ? "null"
    : typeof v === "number" || typeof v === "boolean"
      ? String(v)
      : `'${String(v).replace(/'/g, "''")}'`;

const rows = buildDemoRows(USER_ID);
// Autos y motos tienen campos distintos: se usa la unión de columnas (lo que falta va como null).
const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];

const sql = [
  "-- GENERADO por scripts/generate-demo-sql.ts (npm run demo:sql). Datos de DEMO: no usar en producción.",
  "-- Pega este archivo completo en Supabase → SQL Editor → Run. Requiere haber aplicado las migraciones y seed.sql.",
  "",
  "insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at,",
  "  raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change, email_change_token_new)",
  `values ('00000000-0000-0000-0000-000000000000', '${USER_ID}', 'authenticated', 'authenticated', 'demo@trato.mx', '', now(), now(), now(),`,
  `  '{"provider":"email","providers":["email"]}', '{}', '', '', '', '')`,
  "on conflict (id) do nothing;",
  "",
  `update public.profiles set display_name = 'Vendedor Demo', phone = '+525512345678', phone_verified = true,`,
  `  state = 'ciudad-de-mexico', city = 'Ciudad de México' where id = '${USER_ID}';`,
  "",
  `delete from public.listings where user_id = '${USER_ID}';`,
  "",
  `insert into public.listings (${cols.join(", ")}) values`,
  rows
    .map((r) => `  (${cols.map((c) => q((r as Record<string, unknown>)[c])).join(", ")})`)
    .join(",\n") + ";",
  "",
  "insert into public.listing_photos (listing_id, storage_path, position) values",
  rows
    .flatMap((r, n) =>
      demoPhotos(n).map((p) => `  ('${r.id}', ${q(p.storage_path)}, ${p.position})`),
    )
    .join(",\n") + ";",
  "",
].join("\n");

writeFileSync("supabase/demo.sql", sql);
console.log(`supabase/demo.sql: ${rows.length} anuncios (${rows.length * 4} fotos)`);
