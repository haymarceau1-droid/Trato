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

