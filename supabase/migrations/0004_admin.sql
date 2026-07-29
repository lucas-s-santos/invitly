-- ============================================================
-- Invitly — Painel do administrador
-- Tabela de admins + funções security definer (checam is_admin()).
-- Nenhum dado de outros usuários é exposto sem ser admin.
-- ============================================================

create table if not exists public.app_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;
-- Sem policies: a tabela só é acessada pelas funções security definer abaixo.

-- Admin inicial (dono). Ajuste/adicione pelo painel depois.
insert into public.app_admins (email)
values ('lucassilvadossantos2005@gmail.com')
on conflict (email) do nothing;

-- true se o e-mail do JWT atual está na lista de admins
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_admins
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;
grant execute on function public.is_admin() to authenticated;

-- Métricas gerais
create or replace function public.admin_stats()
returns json
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare result json;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  select json_build_object(
    'invites',   (select count(*) from invites),
    'published', (select count(*) from invites where status = 'published'),
    'drafts',    (select count(*) from invites where status <> 'published'),
    'rsvps',     (select count(*) from rsvp),
    'views',     (select coalesce(sum(views), 0) from invites),
    'users',     (select count(*) from auth.users)
  ) into result;
  return result;
end;
$$;
grant execute on function public.admin_stats() to authenticated;

-- Todos os convites (com e-mail do dono)
create or replace function public.admin_invites()
returns json
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare result json;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  select coalesce(json_agg(row_to_json(t)), '[]'::json) into result from (
    select i.id, i.title, i.slug, i.status, i.views, i.created_at,
           u.email as owner_email
    from invites i
    left join auth.users u on u.id = i.user_id
    order by i.created_at desc
  ) t;
  return result;
end;
$$;
grant execute on function public.admin_invites() to authenticated;

-- Todos os usuários (com contagem de convites)
create or replace function public.admin_users()
returns json
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare result json;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  select coalesce(json_agg(row_to_json(t)), '[]'::json) into result from (
    select u.id, u.email, u.created_at,
           (select count(*) from invites i where i.user_id = u.id) as invites
    from auth.users u
    order by u.created_at desc
  ) t;
  return result;
end;
$$;
grant execute on function public.admin_users() to authenticated;

-- Lista de admins
create or replace function public.admin_admins()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare result json;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  select coalesce(json_agg(email order by email), '[]'::json)
    into result from app_admins;
  return result;
end;
$$;
grant execute on function public.admin_admins() to authenticated;

create or replace function public.admin_add_admin(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  insert into app_admins (email) values (lower(trim(p_email)))
  on conflict (email) do nothing;
end;
$$;
grant execute on function public.admin_add_admin(text) to authenticated;

create or replace function public.admin_remove_admin(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  -- impede remover o último admin (evita travar o painel)
  if (select count(*) from app_admins) <= 1 then
    raise exception 'nao pode remover o ultimo admin';
  end if;
  delete from app_admins where lower(email) = lower(trim(p_email));
end;
$$;
grant execute on function public.admin_remove_admin(text) to authenticated;

-- Moderação de convites
create or replace function public.admin_set_invite_status(p_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  if p_status not in ('draft', 'paid', 'published', 'expired') then
    raise exception 'status invalido';
  end if;
  update invites set status = p_status where id = p_id;
end;
$$;
grant execute on function public.admin_set_invite_status(uuid, text) to authenticated;

create or replace function public.admin_delete_invite(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  delete from invites where id = p_id; -- cascade remove rsvp/views
end;
$$;
grant execute on function public.admin_delete_invite(uuid) to authenticated;
