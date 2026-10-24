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
