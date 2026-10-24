-- pg_cron viene incluido en Supabase. Si tu entorno local no lo tiene, esta migración no falla.
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('expire-listings', '15 6 * * *', 'select public.expire_listings()');
exception when others then
  raise notice 'pg_cron no disponible: los anuncios vencidos igual se ocultan por RLS (expires_at).';
end $$;
