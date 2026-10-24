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
