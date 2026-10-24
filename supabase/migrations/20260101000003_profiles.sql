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
