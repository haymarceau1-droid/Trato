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
