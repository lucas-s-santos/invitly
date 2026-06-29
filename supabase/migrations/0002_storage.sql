-- ============================================================
-- Invitly — Storage para fotos de fundo dos convites
-- Bucket público "invite-images" + policies de upload
-- ============================================================

insert into storage.buckets (id, name, public)
values ('invite-images', 'invite-images', true)
on conflict (id) do nothing;

-- Leitura pública (o bucket é público; a página do convite usa a URL pública)
drop policy if exists "Public read invite images" on storage.objects;
create policy "Public read invite images" on storage.objects
  for select
  using (bucket_id = 'invite-images');

-- Usuários autenticados podem enviar imagens
drop policy if exists "Authenticated upload invite images" on storage.objects;
create policy "Authenticated upload invite images" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'invite-images');

-- Dono pode atualizar/substituir as próprias imagens
drop policy if exists "Owner update invite images" on storage.objects;
create policy "Owner update invite images" on storage.objects
  for update
  to authenticated
  using (bucket_id = 'invite-images' and owner = auth.uid());

-- Dono pode apagar as próprias imagens
drop policy if exists "Owner delete invite images" on storage.objects;
create policy "Owner delete invite images" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'invite-images' and owner = auth.uid());
