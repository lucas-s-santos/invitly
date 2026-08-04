-- ============================================================
-- Invitly — painel do administrador v2
-- Substitui admin_stats/admin_invites/admin_users por versões com mais
-- contexto (últimos 7 dias, série de 14 dias, plano, categoria, RSVPs).
-- Todas as chaves antigas continuam existindo — o painel velho não quebra.
-- ============================================================

-- Métricas gerais + séries
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
    -- totais (chaves originais)
    'invites',   (select count(*) from invites),
    'published', (select count(*) from invites where status = 'published'),
    'drafts',    (select count(*) from invites where status <> 'published'),
    'rsvps',     (select count(*) from rsvp),
    'views',     (select coalesce(sum(views), 0) from invites),
    'users',     (select count(*) from auth.users),

    -- últimos 7 dias
    'invites_7d',   (select count(*) from invites where created_at > now() - interval '7 days'),
    'published_7d', (select count(*) from invites where status = 'published' and created_at > now() - interval '7 days'),
    'rsvps_7d',     (select count(*) from rsvp where created_at > now() - interval '7 days'),
    'users_7d',     (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'views_7d',     (select count(*) from invite_views where viewed_at > now() - interval '7 days'),

    -- pessoas confirmadas (soma dos acompanhantes) e planos dos publicados
    'guests',  (select coalesce(sum(guests_count), 0) from rsvp where status = 'confirmed'),
    'premium', (select count(*) from invites where status = 'published' and data->>'plan' = 'premium'),
    'basico',  (select count(*) from invites where status = 'published' and coalesce(data->>'plan', 'basico') <> 'premium'),

    -- distribuições
    'by_status', (
      select coalesce(json_agg(row_to_json(s)), '[]'::json) from (
        select status, count(*)::int as n from invites group by status order by n desc
      ) s
    ),
    'by_category', (
      select coalesce(json_agg(row_to_json(c)), '[]'::json) from (
        select category, count(*)::int as n from invites group by category order by n desc limit 10
      ) c
    ),

    -- série dos últimos 14 dias
    'series', (
      select coalesce(json_agg(row_to_json(d)), '[]'::json) from (
        select to_char(g.day, 'DD/MM') as label,
               (select count(*)::int from invites i where i.created_at::date = g.day) as invites,
               (select count(*)::int from rsvp r where r.created_at::date = g.day) as rsvps,
               (select count(*)::int from invite_views v where v.viewed_at::date = g.day) as views
        from generate_series(current_date - interval '13 days', current_date, interval '1 day') g(day)
        order by g.day
      ) d
    ),

    -- convites mais vistos
    'top', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select i.title, i.slug, i.views,
               (select count(*)::int from rsvp r where r.invite_id = i.id) as rsvps
        from invites i
        where i.status = 'published'
        order by i.views desc, i.created_at desc
        limit 5
      ) t
    )
  ) into result;
  return result;
end;
$$;
grant execute on function public.admin_stats() to authenticated;

-- Convites: + categoria, plano e nº de confirmações
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
           i.category,
           coalesce(i.data->>'plan', 'basico') as plan,
           (select count(*)::int from rsvp r where r.invite_id = i.id) as rsvps,
           u.email as owner_email
    from invites i
    left join auth.users u on u.id = i.user_id
    order by i.created_at desc
  ) t;
  return result;
end;
$$;
grant execute on function public.admin_invites() to authenticated;

-- Usuários: + último acesso e convites publicados
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
    select u.id, u.email, u.created_at, u.last_sign_in_at,
           (select count(*)::int from invites i where i.user_id = u.id) as invites,
           (select count(*)::int from invites i
             where i.user_id = u.id and i.status = 'published') as published
    from auth.users u
    order by u.created_at desc
  ) t;
  return result;
end;
$$;
grant execute on function public.admin_users() to authenticated;
