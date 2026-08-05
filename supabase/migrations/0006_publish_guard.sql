-- ============================================================
-- Invitly — publicar exige pagamento (trava no banco)
--
-- Antes: a policy "Users manage own invites" é `for all`, então o dono podia
-- dar UPDATE em qualquer coluna do próprio convite — inclusive `status`.
-- Bastava um comando no console do navegador para publicar de graça.
--
-- Agora: quem chega pelo navegador (papéis `authenticated` e `anon`) não
-- muda `status` nem `payment_id`. Quem publica é:
--   • o webhook da Kiwify, que usa a service_role key (papel `service_role`);
--   • o painel admin, via admin_set_invite_status() — security definer, roda
--     como `postgres` e já checa is_admin().
--
-- A função é SECURITY INVOKER de propósito: precisamos enxergar o papel real
-- de quem executa o comando. Se fosse definer, current_user viraria o dono
-- da função e a trava não distinguiria ninguém.
-- ============================================================

create or replace function public.invites_guard_publish()
returns trigger
language plpgsql
as $$
begin
  -- service_role (webhook), postgres (SQL Editor) e as funções security
  -- definer do painel admin passam direto.
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Convite nasce rascunho, sempre — não adianta mandar status no insert.
    new.status := 'draft';
    new.payment_id := null;
    return new;
  end if;

  if new.status is distinct from old.status then
    raise exception
      'Publicar um convite exige pagamento confirmado.'
      using errcode = '42501';
  end if;

  if new.payment_id is distinct from old.payment_id then
    raise exception
      'payment_id só pode ser gravado pela confirmacao de pagamento.'
      using errcode = '42501';
  end if;

  -- Trocar de dono também não: evita "mover" um convite já pago pra outra conta.
  if new.user_id is distinct from old.user_id then
    raise exception
      'user_id nao pode ser alterado.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists invites_guard_publish on public.invites;
create trigger invites_guard_publish
  before insert or update on public.invites
  for each row execute function public.invites_guard_publish();
