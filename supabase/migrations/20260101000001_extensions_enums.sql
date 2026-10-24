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
