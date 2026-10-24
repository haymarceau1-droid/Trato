create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  position smallint not null check (position between 0 and 11),
  created_at timestamptz not null default now(),
  unique (listing_id, position) deferrable initially deferred
);
create index listing_photos_listing on public.listing_photos (listing_id, position);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
create index favorites_listing on public.favorites (listing_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason report_reason not null,
  comment text check (char_length(comment) <= 500),
  status report_status not null default 'nuevo',
  created_at timestamptz not null default now(),
  unique (listing_id, reporter_id)
);
create index reports_status on public.reports (status, created_at desc);

-- 3 reportes distintos → pausa automática y revisión.
create or replace function public.on_report_created() returns trigger
language plpgsql security definer set search_path = public as $$
declare total int;
begin
  select count(*) into total from public.reports where listing_id = new.listing_id and status <> 'descartado';
  update public.listings
     set reports_count = total,
         status = case when total >= 3 and status = 'active' then 'paused' else status end,
         needs_review = needs_review or total >= 3,
         review_reasons = case when total >= 3 and not ('reportes' = any(review_reasons))
                               then array_append(review_reasons, 'reportes') else review_reasons end
   where id = new.listing_id;
  return new;
end $$;

create trigger reports_after_insert after insert on public.reports
  for each row execute function public.on_report_created();
