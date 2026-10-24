insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 1048576, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- Lectura pública (el bucket es público); escritura solo en la carpeta propia: {user_id}/...
create policy "photos upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photos update own folder" on storage.objects for update to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photos delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
