-- ============================================================
-- Invitly — exclusão de conta (LGPD)
-- Função que o próprio usuário chama para apagar a conta + dados.
-- ============================================================

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Remove o usuário autenticado; o ON DELETE CASCADE em invites
  -- (e daí rsvp/invite_views) apaga todos os dados vinculados.
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_my_account() to authenticated;
