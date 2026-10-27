-- GENERADO: todas las migraciones (01–15) + catálogo (seed.sql). Pégalo completo en Supabase → SQL Editor → Run, UNA sola vez en un proyecto nuevo.

-- ===== 20260101000001_extensions_enums.sql =====
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create type vehicle_type as enum ('auto', 'moto');
create type listing_status as enum ('active', 'paused', 'sold', 'expired', 'removed');
create type transmission_type as enum ('manual', 'automatica');
create type fuel_type as enum ('gasolina', 'diesel', 'hibrido', 'electrico');
create type invoice_type as enum ('original', 'refacturado', 'aseguradora', 'sin_factura');
create type body_type as enum ('sedan', 'hatchback', 'suv', 'pickup', 'van', 'coupe', 'convertible');
create type traction_type as enum ('4x2', '4x4', 'awd');
create type moto_type as enum ('deportiva', 'chopper', 'touring', 'doble_proposito', 'scooter', 'trabajo', 'naked');
create type report_reason as enum ('posible_estafa', 'precio_falso', 'auto_robado', 'datos_falsos', 'ya_vendido', 'otro');
create type report_status as enum ('nuevo', 'revisado', 'descartado');
create type user_role as enum ('user', 'admin');

-- Slug en minúsculas, sin acentos, separado por guiones.
create or replace function public.slugify(txt text) returns text
language sql immutable as $$
  select trim(both '-' from regexp_replace(
    lower(translate(coalesce(txt, ''),
      'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
      'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC')),
    '[^a-z0-9]+', '-', 'g'))
$$;

-- ===== 20260101000002_geo_catalog.sql =====
create table public.mx_states (
  slug text primary key,
  name text not null unique
);

create table public.catalog_brands (
  id serial primary key,
  vehicle_type vehicle_type not null,
  name text not null,
  slug text not null,
  unique (vehicle_type, slug)
);

create table public.catalog_models (
  id serial primary key,
  brand_id int not null references public.catalog_brands(id) on delete cascade,
  name text not null,
  slug text not null,
  unique (brand_id, slug)
);

-- ===== 20260101000003_profiles.sql =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Usuario',
  phone text,
  phone_verified boolean not null default false,
  state text references public.mx_states(slug),
  city text,
  avatar_url text,
  role user_role not null default 'user',
  is_blocked boolean not null default false,
  is_pro boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and not is_blocked)
$$;

-- Crea el perfil al registrarse y sincroniza el estado de verificación del teléfono.
create or replace function public.handle_auth_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, phone, phone_verified)
  values (
    new.id,
    coalesce(nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Usuario'),
    nullif(new.phone, ''),
    new.phone_confirmed_at is not null
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_auth_user();

create or replace function public.sync_auth_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
     set phone = coalesce(nullif(new.phone, ''), phone),
         phone_verified = new.phone_confirmed_at is not null
   where id = new.id;
  return new;
end $$;

create trigger on_auth_user_updated after update of phone, phone_confirmed_at on auth.users
  for each row execute function public.sync_auth_user();

-- Un usuario normal no puede cambiar rol, bloqueo ni la verificación de su perfil.
create or replace function public.profiles_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.is_blocked := old.is_blocked;
    new.is_pro := old.is_pro;
    -- Cambiar el teléfono invalida la verificación (solo el OTP de Auth la otorga).
    new.phone_verified := case when new.phone is distinct from old.phone then false else old.phone_verified end;
  end if;
  return new;
end $$;

create trigger profiles_guard_trg before update on public.profiles
  for each row execute function public.profiles_guard();

-- ===== 20260101000004_listings.sql =====
-- unaccent no es IMMUTABLE; este envoltorio permite usarlo en columnas generadas.
create or replace function public.immutable_unaccent(txt text) returns text
language sql immutable parallel safe as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, txt)
$$;

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_type vehicle_type not null,
  status listing_status not null default 'active',
  slug text not null,
  title text not null,

  brand text not null,
  brand_slug text not null,
  model text not null,
  model_slug text not null,
  version text,
  year smallint not null check (year between 1950 and extract(year from now())::int + 1),
  color text,
  transmission transmission_type not null,
  fuel fuel_type not null,
  mileage_km int not null check (mileage_km >= 0 and mileage_km < 2000000),
  owners_count smallint check (owners_count between 1 and 20),
  invoice_type invoice_type not null,
  plates_state text references public.mx_states(slug),
  tenencia_al_corriente boolean not null default false,

  -- solo autos
  body_type body_type,
  doors smallint check (doors between 2 and 6),
  engine_liters numeric(3,1) check (engine_liters > 0 and engine_liters < 15),
  traction traction_type,
  -- solo motos
  moto_type moto_type,
  engine_cc int check (engine_cc > 0 and engine_cc < 3000),

  price_mxn int not null check (price_mxn > 0 and price_mxn < 100000000),
  negotiable boolean not null default false,
  state text not null references public.mx_states(slug),
  city text not null,
  city_slug text not null,
  description text not null default '' check (char_length(description) <= 2000),

  needs_review boolean not null default false,
  review_reasons text[] not null default '{}',
  reports_count int not null default 0,
  removed_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '60 days',
  sold_at timestamptz,
  views_count int not null default 0,

  search tsvector generated always as (
    to_tsvector('spanish', public.immutable_unaccent(title || ' ' || description))
  ) stored,

  constraint listings_type_fields check (
    (vehicle_type = 'auto' and body_type is not null and moto_type is null and engine_cc is null)
    or
    (vehicle_type = 'moto' and moto_type is not null and engine_cc is not null
       and body_type is null and doors is null and engine_liters is null and traction is null)
  )
);

create index listings_type_status_state on public.listings (vehicle_type, status, state);
create index listings_brand_model on public.listings (brand_slug, model_slug);
create index listings_price on public.listings (price_mxn);
create index listings_year on public.listings (year);
create index listings_created on public.listings (created_at desc);
create index listings_user on public.listings (user_id, status);
create index listings_expiry on public.listings (expires_at) where status = 'active';
create index listings_city on public.listings (state, city_slug);
create index listings_search on public.listings using gin (search);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at := now(); return new; end $$;

create trigger listings_touch before update on public.listings
  for each row execute function public.touch_updated_at();

-- ===== 20260101000005_photos_favorites_reports.sql =====
create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  position smallint not null check (position between 0 and 11),
  created_at timestamptz not null default now(),
  unique (listing_id, position) deferrable initially deferred
);
create index listing_photos_listing on public.listing_photos (listing_id, position);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
create index favorites_listing on public.favorites (listing_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason report_reason not null,
  comment text check (char_length(comment) <= 500),
  status report_status not null default 'nuevo',
  created_at timestamptz not null default now(),
  unique (listing_id, reporter_id)
);
create index reports_status on public.reports (status, created_at desc);

-- 3 reportes distintos → pausa automática y revisión.
create or replace function public.on_report_created() returns trigger
language plpgsql security definer set search_path = public as $$
declare total int;
begin
  select count(*) into total from public.reports where listing_id = new.listing_id and status <> 'descartado';
  update public.listings
     set reports_count = total,
         status = case when total >= 3 and status = 'active' then 'paused' else status end,
         needs_review = needs_review or total >= 3,
         review_reasons = case when total >= 3 and not ('reportes' = any(review_reasons))
                               then array_append(review_reasons, 'reportes') else review_reasons end
   where id = new.listing_id;
  return new;
end $$;

create trigger reports_after_insert after insert on public.reports
  for each row execute function public.on_report_created();

-- ===== 20260101000006_limits_functions.sql =====
create table public.rate_events (
  id bigserial primary key,
  user_id uuid not null,
  action text not null,
  created_at timestamptz not null default now()
);
create index rate_events_lookup on public.rate_events (user_id, action, created_at desc);
alter table public.rate_events enable row level security; -- sin políticas: solo vía funciones

-- Registra la acción y devuelve false si superó el límite en la ventana.
create or replace function public.rate_limit_hit(p_action text, p_max int, p_window interval)
returns boolean language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); n int;
begin
  if uid is null then return false; end if;
  select count(*) into n from public.rate_events
   where user_id = uid and action = p_action and created_at > now() - p_window;
  if n >= p_max then return false; end if;
  insert into public.rate_events (user_id, action) values (uid, p_action);
  delete from public.rate_events where created_at < now() - interval '3 days';
  return true;
end $$;

-- Mediana de precios de anuncios activos similares; null si hay menos de 5.
create or replace function public.median_price(
  p_type vehicle_type, p_brand_slug text, p_model_slug text, p_year int, p_exclude uuid default null
) returns int language sql stable security definer set search_path = public as $$
  select case when count(*) >= 5
    then (percentile_cont(0.5) within group (order by price_mxn))::int end
  from public.listings
  where vehicle_type = p_type and brand_slug = p_brand_slug and model_slug = p_model_slug
    and year between p_year - 2 and p_year + 2
    and status = 'active' and expires_at > now()
    and (p_exclude is null or id <> p_exclude)
$$;

create or replace function public.increment_views(p_id uuid) returns void
language sql security definer set search_path = public as $$
  update public.listings set views_count = views_count + 1
   where id = p_id and status = 'active'
$$;

-- Guardia a nivel de BD: límites y campos protegidos, incluso vía API directa.
create or replace function public.listings_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); blocked boolean; pro boolean; active_n int;
begin
  if uid is null or public.is_admin() then return new; end if;

  select is_blocked, is_pro into blocked, pro from public.profiles where id = uid;
  if blocked then raise exception 'cuenta bloqueada'; end if;

  if tg_op = 'INSERT' then
    new.user_id := uid;
    new.status := 'active';
    new.needs_review := false;
    new.review_reasons := '{}';
    new.reports_count := 0;
    new.removed_reason := null;
    new.views_count := 0;
    new.expires_at := now() + interval '60 days';
    new.sold_at := null;
    select count(*) into active_n from public.listings
     where user_id = uid and status = 'active' and expires_at > now();
    if not pro and active_n >= 5 then raise exception 'limite_activos'; end if;
    if not public.rate_limit_hit('create_listing', 10, interval '24 hours') then
      raise exception 'limite_diario';
    end if;
  else
    new.user_id := old.user_id;
    new.needs_review := old.needs_review;
    new.review_reasons := old.review_reasons;
    new.reports_count := old.reports_count;
    new.removed_reason := old.removed_reason;
    new.views_count := old.views_count;
    if old.status = 'removed' then new.status := 'removed'; end if;
    if new.status = 'removed' then new.status := old.status; end if;
    if new.status = 'expired' and old.status <> 'expired' then new.status := old.status; end if;
    -- Un anuncio en revisión o pausado por reportes no se reactiva solo.
    if old.needs_review and old.status = 'paused' and new.status = 'active' then new.status := 'paused'; end if;
    if new.status = 'active' and old.status <> 'active' then
      select count(*) into active_n from public.listings
       where user_id = uid and status = 'active' and expires_at > now() and id <> old.id;
      if not pro and active_n >= 5 then raise exception 'limite_activos'; end if;
    end if;
    if new.status = 'sold' and old.status <> 'sold' then new.sold_at := now(); end if;
    -- Renovar solo extiende desde hoy hasta 60 días.
    if new.expires_at is distinct from old.expires_at then
      new.expires_at := least(new.expires_at, now() + interval '60 days');
    end if;
  end if;
  return new;
end $$;

create trigger listings_guard_trg before insert or update on public.listings
  for each row execute function public.listings_guard();

-- Máximo 12 fotos por anuncio.
create or replace function public.photos_guard() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.listing_photos where listing_id = new.listing_id) >= 12 then
    raise exception 'maximo_12_fotos';
  end if;
  return new;
end $$;

create trigger photos_guard_trg before insert on public.listing_photos
  for each row execute function public.photos_guard();

-- Expira anuncios vencidos (se invoca desde pg_cron, ver migración 9).
create or replace function public.expire_listings() returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update public.listings set status = 'expired' where status = 'active' and expires_at <= now();
  get diagnostics n = row_count;
  return n;
end $$;

-- ===== 20260101000007_rls.sql =====
alter table public.mx_states enable row level security;
alter table public.catalog_brands enable row level security;
alter table public.catalog_models enable row level security;
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;

-- Catálogo y estados: lectura pública, escritura solo admin.
create policy states_read on public.mx_states for select using (true);
create policy brands_read on public.catalog_brands for select using (true);
create policy models_read on public.catalog_models for select using (true);
create policy brands_admin on public.catalog_brands for all using (public.is_admin()) with check (public.is_admin());
create policy models_admin on public.catalog_models for all using (public.is_admin()) with check (public.is_admin());

-- Perfiles: cada quien ve y edita el suyo; admin ve todos. El público usa public_profiles.
create policy profiles_self_read on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_update on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- Vista pública sin teléfono (corre con permisos del dueño de la vista a propósito).
create view public.public_profiles as
  select p.id, p.display_name, p.city, p.state, p.avatar_url, p.phone_verified, p.created_at,
         (select count(*) from public.listings l
           where l.user_id = p.id and l.status = 'active' and l.expires_at > now()) as active_listings
    from public.profiles p
   where not p.is_blocked;
grant select on public.public_profiles to anon, authenticated;

-- Anuncios: público solo activos y vigentes.
create policy listings_public_read on public.listings for select
  using (status = 'active' and expires_at > now());
create policy listings_owner_read on public.listings for select using (user_id = auth.uid());
create policy listings_admin_all on public.listings for all using (public.is_admin()) with check (public.is_admin());
create policy listings_owner_insert on public.listings for insert
  with check (user_id = auth.uid() and not exists (select 1 from public.profiles where id = auth.uid() and is_blocked));
create policy listings_owner_update on public.listings for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy listings_owner_delete on public.listings for delete using (user_id = auth.uid());

-- Fotos: siguen la visibilidad del anuncio.
create policy photos_read on public.listing_photos for select using (
  exists (select 1 from public.listings l where l.id = listing_id
          and ((l.status = 'active' and l.expires_at > now()) or l.user_id = auth.uid() or public.is_admin())));
create policy photos_owner_write on public.listing_photos for all
  using (exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid()))
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid()));
create policy photos_admin_all on public.listing_photos for all using (public.is_admin()) with check (public.is_admin());

-- Favoritos: solo los propios.
create policy favorites_own on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Reportes: crear (no bloqueado), ver los propios; admin modera.
create policy reports_insert on public.reports for insert
  with check (reporter_id = auth.uid() and not exists (select 1 from public.profiles where id = auth.uid() and is_blocked));
create policy reports_own_read on public.reports for select using (reporter_id = auth.uid());
create policy reports_admin_all on public.reports for all using (public.is_admin()) with check (public.is_admin());

-- Funciones expuestas
revoke all on function public.rate_limit_hit(text, int, interval) from public;
grant execute on function public.rate_limit_hit(text, int, interval) to authenticated;
grant execute on function public.median_price(vehicle_type, text, text, int, uuid) to anon, authenticated;
grant execute on function public.increment_views(uuid) to anon, authenticated;
revoke all on function public.expire_listings() from public;

-- ===== 20260101000008_storage.sql =====
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 1048576, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- Lectura pública (el bucket es público); escritura solo en la carpeta propia: {user_id}/...
create policy "photos upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photos update own folder" on storage.objects for update to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photos delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ===== 20260101000009_cron_expiry.sql =====
-- pg_cron viene incluido en Supabase. Si tu entorno local no lo tiene, esta migración no falla.
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('expire-listings', '15 6 * * *', 'select public.expire_listings()');
exception when others then
  raise notice 'pg_cron no disponible: los anuncios vencidos igual se ocultan por RLS (expires_at).';
end $$;

-- ===== 20260101000010_market_stats.sql =====
-- Cifras públicas y agregadas del mercado (no expone anuncios ni datos personales).
-- Las ventas se cuentan desde que el dueño marca el anuncio como vendido (listings.sold_at).
create or replace function public.market_stats() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'active', (select count(*) from public.listings where status = 'active' and expires_at > now()),
    'sold', (select count(*) from public.listings where status = 'sold'),
    'sold_30d', (select count(*) from public.listings where status = 'sold' and sold_at > now() - interval '30 days')
  )
$$;

grant execute on function public.market_stats() to anon, authenticated;

-- ===== 20260101000011_oauth_profile.sql =====
-- Al registrarse con Google (u otro proveedor OAuth) usa su nombre y foto de perfil.
create or replace function public.handle_auth_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, phone, phone_verified, avatar_url)
  values (
    new.id,
    left(coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Usuario'
    ), 50),
    nullif(new.phone, ''),
    new.phone_confirmed_at is not null,
    nullif(coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'), '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- ===== 20260101000012_facebook_contact.sql =====
-- Contacto opcional por Facebook (Messenger). Solo se guarda el usuario o id; el enlace se arma al revelar el contacto.
alter table public.profiles
  add column if not exists facebook text
  check (facebook is null or (length(facebook) <= 80 and facebook ~ '^[A-Za-z0-9.]+$|^profile\.php\?id=[0-9]+$'));

-- El público solo sabe SI hay Facebook, no cuál es (igual que con el teléfono).
create or replace view public.public_profiles as
  select p.id, p.display_name, p.city, p.state, p.avatar_url, p.phone_verified, p.created_at,
         (select count(*) from public.listings l
           where l.user_id = p.id and l.status = 'active' and l.expires_at > now()) as active_listings,
         (p.facebook is not null) as has_facebook
    from public.profiles p
   where not p.is_blocked;
grant select on public.public_profiles to anon, authenticated;

-- ===== 20260101000013_condition_scores.sql =====
-- Estado de carrocería y de mecánica (0–100), indicado por el vendedor. Nulo en anuncios anteriores a esta migración.
alter table public.listings
  add column if not exists body_condition smallint check (body_condition between 0 and 100),
  add column if not exists mechanical_condition smallint check (mechanical_condition between 0 and 100);

-- ===== 20260101000014_photo_size_limit.sql =====
-- Cada foto ya viene comprimida del navegador (~300 KB, tope 400 KB). El bucket rechaza todo lo que pase de 512 KB
-- para que ninguna llamada directa a la API infle el almacenamiento.
update storage.buckets set file_size_limit = 524288 where id = 'listing-photos';

-- ===== 20260101000015_boosted_listings.sql =====
-- Anuncios destacados ("impulsados"): aparecen primero y con la etiqueta "Destacado" mientras boosted_until sea futuro.
-- Solo el servidor (service role) o un administrador pueden fijarlo; el dueño no.
alter table public.listings add column if not exists boosted_until timestamptz;
create index if not exists listings_boosted on public.listings (boosted_until) where boosted_until is not null;

create or replace function public.listings_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); blocked boolean; pro boolean; active_n int;
begin
  if uid is null or public.is_admin() then return new; end if;

  select is_blocked, is_pro into blocked, pro from public.profiles where id = uid;
  if blocked then raise exception 'cuenta bloqueada'; end if;

  if tg_op = 'INSERT' then
    new.user_id := uid;
    new.status := 'active';
    new.needs_review := false;
    new.review_reasons := '{}';
    new.reports_count := 0;
    new.removed_reason := null;
    new.views_count := 0;
    new.expires_at := now() + interval '60 days';
    new.sold_at := null;
    new.boosted_until := null;
    select count(*) into active_n from public.listings
     where user_id = uid and status = 'active' and expires_at > now();
    if not pro and active_n >= 5 then raise exception 'limite_activos'; end if;
    if not public.rate_limit_hit('create_listing', 10, interval '24 hours') then
      raise exception 'limite_diario';
    end if;
  else
    new.user_id := old.user_id;
    new.needs_review := old.needs_review;
    new.review_reasons := old.review_reasons;
    new.reports_count := old.reports_count;
    new.removed_reason := old.removed_reason;
    new.views_count := old.views_count;
    -- El impulso solo lo activa el sistema de pagos o un administrador, nunca el dueño.
    new.boosted_until := old.boosted_until;
    if old.status = 'removed' then new.status := 'removed'; end if;
    if new.status = 'removed' then new.status := old.status; end if;
    if new.status = 'expired' and old.status <> 'expired' then new.status := old.status; end if;
    -- Un anuncio en revisión o pausado por reportes no se reactiva solo.
    if old.needs_review and old.status = 'paused' and new.status = 'active' then new.status := 'paused'; end if;
    if new.status = 'active' and old.status <> 'active' then
      select count(*) into active_n from public.listings
       where user_id = uid and status = 'active' and expires_at > now() and id <> old.id;
      if not pro and active_n >= 5 then raise exception 'limite_activos'; end if;
    end if;
    if new.status = 'sold' and old.status <> 'sold' then new.sold_at := now(); end if;
    -- Renovar solo extiende desde hoy hasta 60 días.
    if new.expires_at is distinct from old.expires_at then
      new.expires_at := least(new.expires_at, now() + interval '60 days');
    end if;
  end if;
  return new;
end $$;


-- ===== seed.sql =====
-- GENERADO por scripts/generate-seed.ts — no editar a mano (npm run catalog:seed).

-- Estados de la República (32 entidades federativas)
insert into public.mx_states (slug, name) values
  ('aguascalientes', 'Aguascalientes'),
  ('baja-california', 'Baja California'),
  ('baja-california-sur', 'Baja California Sur'),
  ('campeche', 'Campeche'),
  ('chiapas', 'Chiapas'),
  ('chihuahua', 'Chihuahua'),
  ('ciudad-de-mexico', 'Ciudad de México'),
  ('coahuila', 'Coahuila'),
  ('colima', 'Colima'),
  ('durango', 'Durango'),
  ('estado-de-mexico', 'Estado de México'),
  ('guanajuato', 'Guanajuato'),
  ('guerrero', 'Guerrero'),
  ('hidalgo', 'Hidalgo'),
  ('jalisco', 'Jalisco'),
  ('michoacan', 'Michoacán'),
  ('morelos', 'Morelos'),
  ('nayarit', 'Nayarit'),
  ('nuevo-leon', 'Nuevo León'),
  ('oaxaca', 'Oaxaca'),
  ('puebla', 'Puebla'),
  ('queretaro', 'Querétaro'),
  ('quintana-roo', 'Quintana Roo'),
  ('san-luis-potosi', 'San Luis Potosí'),
  ('sinaloa', 'Sinaloa'),
  ('sonora', 'Sonora'),
  ('tabasco', 'Tabasco'),
  ('tamaulipas', 'Tamaulipas'),
  ('tlaxcala', 'Tlaxcala'),
  ('veracruz', 'Veracruz'),
  ('yucatan', 'Yucatán'),
  ('zacatecas', 'Zacatecas')
on conflict do nothing;

-- Catálogo de marcas y modelos
create or replace function pg_temp.add_catalog(p_type vehicle_type, p_brand text, p_models text[]) returns void
language plpgsql as $$
declare bid int; m text;
begin
  insert into public.catalog_brands (vehicle_type, name, slug)
  values (p_type, p_brand, public.slugify(p_brand))
  on conflict (vehicle_type, slug) do update set name = excluded.name
  returning id into bid;
  foreach m in array p_models loop
    insert into public.catalog_models (brand_id, name, slug)
    values (bid, m, public.slugify(m)) on conflict (brand_id, slug) do nothing;
  end loop;
end $$;

select pg_temp.add_catalog('auto', 'Acura', array['ILX', 'MDX', 'RDX', 'RLX', 'TLX', 'TSX', 'ZDX']);
select pg_temp.add_catalog('auto', 'Alfa Romeo', array['Giulia', 'Giulietta', 'MiTo', 'Stelvio', 'Tonale']);
select pg_temp.add_catalog('auto', 'Audi', array['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'e-tron', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'R8', 'TT']);
select pg_temp.add_catalog('auto', 'BAIC', array['BJ40', 'D20', 'U5 Plus', 'X7', 'X35', 'X55']);
select pg_temp.add_catalog('auto', 'BMW', array['i3', 'i4', 'iX', 'Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 7', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4']);
select pg_temp.add_catalog('auto', 'Buick', array['Enclave', 'Encore', 'Envision', 'Lacrosse', 'Regal']);
select pg_temp.add_catalog('auto', 'BYD', array['Dolphin', 'Dolphin Mini', 'e2', 'F3', 'Han', 'Seal', 'Shark', 'Song Plus', 'Song Pro', 'Tang', 'Yuan Plus']);
select pg_temp.add_catalog('auto', 'Cadillac', array['ATS', 'CT4', 'CT5', 'CTS', 'Escalade', 'Lyriq', 'SRX', 'XT4', 'XT5', 'XT6']);
select pg_temp.add_catalog('auto', 'Changan', array['Alsvin', 'CS15', 'CS35 Plus', 'CS55 Plus', 'CS75 Plus', 'Hunter', 'Uni-K', 'Uni-T']);
select pg_temp.add_catalog('auto', 'Chevrolet', array['Aveo', 'Beat', 'Blazer', 'Camaro', 'Captiva', 'Cavalier', 'Chevy', 'Cheyenne', 'Colorado', 'Corvette', 'Cruze', 'Equinox', 'Groove', 'Malibu', 'Matiz', 'Montana', 'Onix', 'Optra', 'Orlando', 'S10', 'Silverado', 'Sonic', 'Spark', 'Suburban', 'Tahoe', 'Tornado', 'Tracker', 'Traverse', 'Trax']);
select pg_temp.add_catalog('auto', 'Chirey', array['Arrizo 5', 'Jaecoo 7', 'Omoda 5', 'Tiggo 2 Pro', 'Tiggo 4 Pro', 'Tiggo 7 Pro', 'Tiggo 8 Pro']);
select pg_temp.add_catalog('auto', 'Chrysler', array['300', 'Aspen', 'Pacifica', 'PT Cruiser', 'Town & Country', 'Voyager']);
select pg_temp.add_catalog('auto', 'Citroën', array['Berlingo', 'C3', 'C4', 'C4 Cactus', 'C5 Aircross', 'Jumpy', 'Xsara Picasso']);
select pg_temp.add_catalog('auto', 'Cupra', array['Ateca', 'Born', 'Formentor', 'León']);
select pg_temp.add_catalog('auto', 'DFSK', array['C31', 'Glory 500', 'Glory 560', 'Glory 580', 'K01', 'K02']);
select pg_temp.add_catalog('auto', 'Dodge', array['Attitude', 'Avenger', 'Caliber', 'Challenger', 'Charger', 'Dart', 'Durango', 'Grand Caravan', 'Hornet', 'Journey', 'Neon', 'Nitro', 'Ram 1500', 'Stratus', 'Viper']);
select pg_temp.add_catalog('auto', 'Fiat', array['500', '500e', 'Argo', 'Cronos', 'Ducato', 'Fastback', 'Freemont', 'Linea', 'Mobi', 'Palio', 'Panda', 'Pulse', 'Punto', 'Strada', 'Uno']);
select pg_temp.add_catalog('auto', 'Ford', array['Bronco', 'Bronco Sport', 'EcoSport', 'Edge', 'Escape', 'Escort', 'Expedition', 'Explorer', 'F-150', 'F-250', 'F-350', 'Fiesta', 'Figo', 'Focus', 'Fusion', 'Ikon', 'Lobo', 'Maverick', 'Mustang', 'Mustang Mach-E', 'Ranger', 'Taurus', 'Territory', 'Thunderbird', 'Transit']);
select pg_temp.add_catalog('auto', 'GAC', array['Emkoo', 'Empow', 'GA4', 'GS3', 'GS4', 'GS8']);
select pg_temp.add_catalog('auto', 'GMC', array['Acadia', 'Canyon', 'Envoy', 'Hummer EV', 'Sierra', 'Terrain', 'Yukon']);
select pg_temp.add_catalog('auto', 'Honda', array['Accord', 'Africa Twin', 'BR-V', 'City', 'Civic', 'Civic Type R', 'CR-V', 'CR-Z', 'Fit', 'HR-V', 'Insight', 'Odyssey', 'Passport', 'Pilot', 'Prologue', 'Ridgeline']);
select pg_temp.add_catalog('auto', 'Hyundai', array['Accent', 'Atos', 'Creta', 'Elantra', 'Excel', 'Getz', 'Grand i10', 'H-1', 'i10', 'i20', 'Ioniq', 'Ioniq 5', 'Kona', 'Palisade', 'Santa Cruz', 'Santa Fe', 'Sonata', 'Stargazer', 'Tucson', 'Veloster', 'Venue']);
select pg_temp.add_catalog('auto', 'Infiniti', array['EX35', 'FX35', 'G35', 'Q50', 'Q60', 'Q70', 'QX50', 'QX55', 'QX60', 'QX80']);
select pg_temp.add_catalog('auto', 'Isuzu', array['D-Max', 'Elf', 'Forward', 'MU-X', 'Trooper']);
select pg_temp.add_catalog('auto', 'JAC', array['E-J7', 'Frison', 'J4', 'J7', 'JS2', 'JS3', 'JS4', 'JS6', 'JS8', 'Sei 2', 'Sei 4', 'Sei 7', 'T6', 'T8']);
select pg_temp.add_catalog('auto', 'Jaguar', array['E-Pace', 'F-Pace', 'F-Type', 'I-Pace', 'XE', 'XF', 'XJ']);
select pg_temp.add_catalog('auto', 'Jeep', array['Avenger', 'Cherokee', 'Commander', 'Compass', 'Gladiator', 'Grand Cherokee', 'Grand Cherokee L', 'Liberty', 'Patriot', 'Renegade', 'Wagoneer', 'Wrangler']);
select pg_temp.add_catalog('auto', 'Jetour', array['Dashing', 'T2', 'X70', 'X70 Plus', 'X90 Plus']);
select pg_temp.add_catalog('auto', 'Kia', array['Carens', 'Carnival', 'Cerato', 'EV6', 'EV9', 'Forte', 'K3', 'Niro', 'Optima', 'Picanto', 'Rio', 'Rondo', 'Seltos', 'Sephia', 'Sonet', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Stonic', 'Telluride']);
select pg_temp.add_catalog('auto', 'Land Rover', array['Defender', 'Discovery', 'Discovery Sport', 'Freelander', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar']);
select pg_temp.add_catalog('auto', 'Lexus', array['CT', 'ES', 'GS', 'GX', 'IS', 'LC', 'LS', 'LX', 'NX', 'RC', 'RX', 'UX']);
select pg_temp.add_catalog('auto', 'Lincoln', array['Aviator', 'Continental', 'Corsair', 'MKC', 'MKS', 'MKT', 'MKX', 'MKZ', 'Nautilus', 'Navigator', 'Town Car']);
select pg_temp.add_catalog('auto', 'Mazda', array['BT-50', 'CX-3', 'CX-5', 'CX-7', 'CX-9', 'CX-30', 'CX-50', 'CX-60', 'CX-90', 'Mazda 2', 'Mazda 3', 'Mazda 5', 'Mazda 6', 'MX-5', 'MX-30', 'RX-8', 'Tribute']);
select pg_temp.add_catalog('auto', 'Mercedes-Benz', array['AMG GT', 'CLA', 'Clase A', 'Clase B', 'Clase C', 'Clase E', 'Clase G', 'Clase S', 'Clase V', 'CLS', 'EQA', 'EQB', 'EQC', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'SLK', 'Sprinter']);
select pg_temp.add_catalog('auto', 'MG', array['Cyberster', 'HS', 'Marvel R', 'MG 3', 'MG 5', 'MG 6', 'MG GT', 'MG ONE', 'MG4', 'RX5', 'RX8', 'ZS', 'ZS EV']);
select pg_temp.add_catalog('auto', 'Mini', array['Clubman', 'Convertible', 'Cooper', 'Cooper S', 'Countryman', 'John Cooper Works', 'Paceman']);
select pg_temp.add_catalog('auto', 'Mitsubishi', array['ASX', 'Colt', 'Eclipse Cross', 'Galant', 'L200', 'Lancer', 'Mirage', 'Montero', 'Montero Sport', 'Outlander', 'Outlander Sport', 'Xpander']);
select pg_temp.add_catalog('auto', 'Nissan', array['350Z', '370Z', 'Altima', 'Ariya', 'Armada', 'Frontier', 'GT-R', 'Juke', 'Kicks', 'Leaf', 'March', 'Maxima', 'Murano', 'Note', 'NP300', 'NP300 Estaquitas', 'Pathfinder', 'Platina', 'Qashqai', 'Rogue', 'Sentra', 'Tiida', 'Titan', 'Tsuru', 'Urvan', 'Versa', 'X-Trail', 'Xterra']);
select pg_temp.add_catalog('auto', 'Omoda', array['C5', 'E5', 'O5']);
select pg_temp.add_catalog('auto', 'Peugeot', array['106', '206', '207', '208', '301', '307', '308', '405', '406', '407', '2008', '3008', '5008', 'Expert', 'Manager', 'Partner', 'RCZ', 'Rifter']);
select pg_temp.add_catalog('auto', 'Pontiac', array['Aztek', 'G3', 'G5', 'G6', 'Grand Am', 'Grand Prix', 'Matiz', 'Montana', 'Solstice', 'Sunfire', 'Vibe']);
select pg_temp.add_catalog('auto', 'Porsche', array['718 Boxster', '718 Cayman', '911', 'Cayenne', 'Macan', 'Panamera', 'Taycan']);
select pg_temp.add_catalog('auto', 'Ram', array['700', '1200', '1500', '2500', '3500', '4000', 'Heavy Duty', 'ProMaster', 'ProMaster Rapid', 'Rampage']);
select pg_temp.add_catalog('auto', 'Renault', array['Alaskan', 'Arkana', 'Captur', 'Clio', 'Duster', 'Duster Oroch', 'Fluence', 'Kangoo', 'Kardian', 'Koleos', 'Kwid', 'Logan', 'Master', 'Megane', 'Oroch', 'Sandero', 'Scénic', 'Stepway', 'Symbol', 'Twingo']);
select pg_temp.add_catalog('auto', 'SEAT', array['Alhambra', 'Altea', 'Arona', 'Ateca', 'Córdoba', 'Ibiza', 'León', 'Mii', 'Tarraco', 'Toledo']);
select pg_temp.add_catalog('auto', 'Smart', array['EQ Fortwo', 'Forfour', 'Fortwo']);
select pg_temp.add_catalog('auto', 'Subaru', array['Ascent', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'Solterra', 'WRX', 'XV']);
select pg_temp.add_catalog('auto', 'Suzuki', array['Alto', 'Baleno', 'Celerio', 'Ciaz', 'Dzire', 'Ertiga', 'Fronx', 'Grand Vitara', 'Ignis', 'Jimny', 'S-Cross', 'Swift', 'SX4', 'Vitara', 'XL7']);
select pg_temp.add_catalog('auto', 'Tesla', array['Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y']);
select pg_temp.add_catalog('auto', 'Toyota', array['4Runner', 'Agya', 'Avalon', 'Avanza', 'Avanza Veloz', 'bZ4X', 'C-HR', 'Camry', 'Corolla', 'Corolla Cross', 'Crown', 'Echo', 'Etios', 'FJ Cruiser', 'Fortuner', 'GR Corolla', 'GR86', 'Hiace', 'Highlander', 'Hilux', 'Innova', 'Land Cruiser', 'Matrix', 'Prado', 'Prius', 'RAV4', 'Rush', 'Sequoia', 'Sienna', 'Solara', 'Supra', 'Tacoma', 'Tercel', 'Tundra', 'Venza', 'Yaris', 'Yaris Cross', 'Yaris Sedán']);
select pg_temp.add_catalog('auto', 'Volkswagen', array['Amarok', 'Atlas', 'Beetle', 'Bora', 'Caddy', 'CC', 'Combi', 'Crafter', 'CrossFox', 'Derby', 'Eos', 'Fox', 'Gol', 'Golf', 'GTI', 'ID.4', 'Jetta', 'Jetta GLI', 'Lupo', 'Nivus', 'Passat', 'Pointer', 'Polo', 'Saveiro', 'Scirocco', 'Sedán (Vocho)', 'Sharan', 'T-Cross', 'Taos', 'Teramont', 'Tiguan', 'Touareg', 'Transporter', 'Vento', 'Virtus', 'Voyage']);
select pg_temp.add_catalog('auto', 'Volvo', array['C30', 'C40', 'EX30', 'EX90', 'S40', 'S60', 'S80', 'S90', 'V40', 'V60', 'V90', 'XC40', 'XC60', 'XC90']);
select pg_temp.add_catalog('moto', 'Aprilia', array['Dorsoduro', 'RS 125', 'RS 660', 'RSV4', 'Shiver', 'SR GT', 'Tuareg 660', 'Tuono 660', 'Tuono V4']);
select pg_temp.add_catalog('moto', 'Bajaj', array['Avenger 220', 'Boxer 150', 'Boxer CT100', 'Discover', 'Dominar 250', 'Dominar 400', 'Platina', 'Pulsar 125', 'Pulsar 150', 'Pulsar 180', 'Pulsar N160', 'Pulsar NS125', 'Pulsar NS160', 'Pulsar NS200', 'Pulsar RS200', 'Rouser']);
select pg_temp.add_catalog('moto', 'Benelli', array['180S', '302S', '752S', 'Imperiale 400', 'Leoncino 250', 'Leoncino 500', 'TNT 15', 'TNT 25', 'TNT 135', 'TNT 300', 'TNT 600', 'TRK 251', 'TRK 502', 'TRK 702']);
select pg_temp.add_catalog('moto', 'BMW', array['C 400 X', 'CE 04', 'F 750 GS', 'F 850 GS', 'F 900 R', 'F 900 XR', 'G 310 GS', 'G 310 R', 'K 1600', 'R 1250 GS', 'R 1250 R', 'R 1250 RT', 'R nineT', 'S 1000 R', 'S 1000 RR', 'S 1000 XR']);
select pg_temp.add_catalog('moto', 'Carabela', array[]::text[]);
select pg_temp.add_catalog('moto', 'CFMOTO', array['150NK', '250NK', '300NK', '400NK', '450SR', '650MT', '650NK', '700CL-X', '800MT', 'CForce', 'Papio', 'Terralander', 'UForce']);
select pg_temp.add_catalog('moto', 'Dinamo', array[]::text[]);
select pg_temp.add_catalog('moto', 'Ducati', array['DesertX', 'Diavel', 'Hypermotard', 'Monster', 'Multistrada', 'Panigale V2', 'Panigale V4', 'Scrambler', 'Streetfighter', 'SuperSport', 'XDiavel']);
select pg_temp.add_catalog('moto', 'Harley-Davidson', array['Breakout', 'Fat Bob', 'Fat Boy', 'Forty-Eight', 'Heritage Classic', 'Iron 883', 'Iron 1200', 'LiveWire', 'Low Rider', 'Nightster', 'Pan America', 'Road Glide', 'Road King', 'Softail Standard', 'Sportster 1200', 'Sportster S', 'Street 500', 'Street 750', 'Street Bob', 'Street Glide', 'Ultra Limited']);
select pg_temp.add_catalog('moto', 'Hero', array['Dash 110', 'Dash 125', 'Hunk 160R', 'Ignitor', 'Splendor', 'Thriller 160R', 'Xpulse 200', 'Xpulse 200 4V', 'Xtreme 160R']);
select pg_temp.add_catalog('moto', 'Honda', array['ADV 150', 'ADV 350', 'Africa Twin', 'Biz 125', 'C90', 'Cargo 150', 'CB 125F', 'CB 160F', 'CB 190R', 'CB 300F', 'CB 500F', 'CB 650R', 'CB 1000R', 'CBR 150R', 'CBR 250R', 'CBR 500R', 'CBR 600RR', 'CBR 650R', 'CBR 1000RR', 'CGL 125', 'CRF 150L', 'CRF 250L', 'CRF 300L', 'Dio', 'Elite 125', 'Falcon', 'Gold Wing', 'Hornet', 'Invicta', 'Navi', 'NC 750X', 'PCX', 'Pop 110i', 'Rebel 300', 'Rebel 500', 'Rebel 1100', 'SH 150', 'Shadow', 'Tornado XR 250', 'Transalp', 'Wave 110', 'XR 150L', 'XR 190L', 'XRE 300']);
select pg_temp.add_catalog('moto', 'Husqvarna', array['701 Enduro', '701 Supermoto', 'FE 350', 'Norden 901', 'Svartpilen 250', 'Svartpilen 401', 'TE 300', 'Vitpilen 401']);
select pg_temp.add_catalog('moto', 'Italika', array['125Z', '150Z', '250Z', '300Z', 'AT110', 'Blackbird', 'DM 150', 'DM 200', 'FT 125', 'FT 150', 'FT 180', 'RC 150', 'RT 200', 'RT 250', 'TC 200', 'TC 250', 'Vort-X 200', 'Vort-X 300', 'Vort-X 650', 'WS 150']);
select pg_temp.add_catalog('moto', 'Kawasaki', array['Eliminator', 'KLR 650', 'KLX 150', 'KLX 230', 'KLX 300', 'Ninja 125', 'Ninja 250', 'Ninja 300', 'Ninja 400', 'Ninja 650', 'Ninja 1000SX', 'Ninja H2', 'Ninja ZX-6R', 'Ninja ZX-10R', 'Versys 300', 'Versys 650', 'Versys 1000', 'Vulcan 900', 'Vulcan 1700', 'Vulcan S', 'W800', 'Z H2', 'Z125', 'Z250', 'Z400', 'Z650', 'Z650RS', 'Z900', 'Z900RS', 'Z1000']);
select pg_temp.add_catalog('moto', 'Keeway', array['Cafe Racer 152', 'K-Light 202', 'K-Light 250', 'RK 150', 'RKF 125', 'RKS 125', 'RKV 200', 'V302C']);
select pg_temp.add_catalog('moto', 'KTM', array['125 Duke', '200 Duke', '250 Adventure', '250 Duke', '300 XC-W', '350 EXC', '390 Adventure', '390 Duke', '450 EXC', '500 EXC', '790 Adventure', '790 Duke', '890 Adventure', '890 Duke', '1290 Super Adventure', '1290 Super Duke', 'RC 200', 'RC 390']);
select pg_temp.add_catalog('moto', 'Kurazai', array[]::text[]);
select pg_temp.add_catalog('moto', 'Kymco', array['Agility 125', 'Agility City 150', 'AK 550', 'Downtown 350', 'K-Pipe', 'Like 150', 'MXU 250', 'People S 150', 'Super 8', 'Xciting 250']);
select pg_temp.add_catalog('moto', 'Piaggio', array['Ape', 'Beverly 300', 'Fly 150', 'Liberty 150', 'Medley 150', 'MP3', 'Typhoon', 'X10', 'Zip']);
select pg_temp.add_catalog('moto', 'Royal Enfield', array['Bullet 350', 'Classic 350', 'Classic 500', 'Continental GT 650', 'Himalayan', 'Hunter 350', 'Interceptor 650', 'Meteor 350', 'Scram 411', 'Shotgun 650', 'Super Meteor 650', 'Thunderbird 350']);
select pg_temp.add_catalog('moto', 'Suzuki', array['Address 110', 'Avenis 125', 'AX4', 'Boulevard M50', 'Burgman 125', 'Burgman 200', 'Burgman 400', 'DR 150', 'DR 200', 'DR 650', 'DR-Z400', 'Gixxer 150', 'Gixxer 250', 'Gixxer SF 150', 'GN 125', 'GN 150', 'GSX-250R', 'GSX-R150', 'GSX-R600', 'GSX-R750', 'GSX-R1000', 'GSX-S750', 'GSX-S1000', 'Hayabusa', 'Intruder 150', 'Katana', 'Marauder', 'Sixteen', 'SV650', 'UZ 125', 'V-Strom 250', 'V-Strom 650', 'V-Strom 1050', 'VanVan 200']);
select pg_temp.add_catalog('moto', 'SYM', array['Citycom', 'Cruisym', 'Fiddle', 'Jet 14', 'Joyride', 'Maxsym', 'Orbit', 'Symphony', 'VF3i', 'Wolf']);
select pg_temp.add_catalog('moto', 'Triumph', array['Bonneville T100', 'Bonneville T120', 'Daytona 675', 'Rocket 3', 'Scrambler 400 X', 'Scrambler 900', 'Scrambler 1200', 'Speed 400', 'Speed Triple', 'Speed Twin', 'Street Triple', 'Thruxton', 'Tiger 660', 'Tiger 850', 'Tiger 900', 'Tiger 1200', 'Trident 660']);
select pg_temp.add_catalog('moto', 'TVS', array['Apache RR 310', 'Apache RTR 160', 'Apache RTR 180', 'Apache RTR 200', 'Jupiter', 'Ntorq 125', 'Radeon', 'Raider 125', 'Sport', 'Star City']);
select pg_temp.add_catalog('moto', 'Vento', array['Crossmax', 'Nitrox', 'Rebellian', 'Rocketman', 'Screamer', 'Tornado', 'Workman']);
select pg_temp.add_catalog('moto', 'Vespa', array['Elettrica', 'GTS 300', 'GTV 300', 'LX 150', 'Primavera 150', 'S 125', 'Sprint 150']);
select pg_temp.add_catalog('moto', 'Yamaha', array['Bolt', 'Crypton', 'Cygnus', 'DT 125', 'DT 175', 'Fascino', 'Fazer 250', 'FZ 16', 'FZ 25', 'FZ-09 / MT-09', 'FZ-10 / MT-10', 'FZ-S 3.0', 'FZ-S FI', 'FZS 25', 'Libero 125', 'Mio', 'MT-03', 'MT-07', 'MT-15', 'MT-25', 'NMAX', 'NMAX 155', 'PW 50', 'R1', 'R3', 'R6', 'R7', 'R15', 'R125', 'Ray ZR', 'Ray ZR 125', 'RX 100', 'Tenere 700', 'Tenere 1200', 'Tracer 7', 'Tracer 9', 'TW 200', 'V Star 250', 'V Star 650', 'Vino 125', 'Virago 250', 'WR 250', 'XMAX 300', 'XSR 700', 'XSR 900', 'XTZ 125', 'XTZ 150', 'XTZ 250', 'YBR 125', 'YZ 250', 'Zuma 125']);
select pg_temp.add_catalog('moto', 'Zontes', array['125 G1', '125 U', '310 R', '310 T', '310 X', '350 D', '350 GK', '350 T', '368 G', '703 F', '703 RR']);
