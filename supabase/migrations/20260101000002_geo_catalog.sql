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
