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
