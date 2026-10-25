-- Estado de carrocería y de mecánica (0–100), indicado por el vendedor. Nulo en anuncios anteriores a esta migración.
alter table public.listings
  add column if not exists body_condition smallint check (body_condition between 0 and 100),
  add column if not exists mechanical_condition smallint check (mechanical_condition between 0 and 100);
