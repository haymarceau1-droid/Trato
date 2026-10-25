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
