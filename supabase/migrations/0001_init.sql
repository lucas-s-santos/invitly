-- ============================================================
-- Invitly — schema inicial
-- Tabelas: invites, rsvp, invite_views (+ RLS)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- invites
-- ------------------------------------------------------------
create table if not exists public.invites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  slug        text not null unique,
  title       text not null,
  category    text not null,
  template_id text not null,
  status      text not null default 'draft'
                check (status in ('draft', 'paid', 'published', 'expired')),
  data        jsonb not null default '{}'::jsonb,
  views       integer not null default 0,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz,
  payment_id  text
);

create index if not exists invites_user_id_idx on public.invites (user_id);
create index if not exists invites_slug_idx on public.invites (slug);
create index if not exists invites_status_idx on public.invites (status);

-- ------------------------------------------------------------
-- rsvp
-- ------------------------------------------------------------
create table if not exists public.rsvp (
  id           uuid primary key default gen_random_uuid(),
  invite_id    uuid not null references public.invites (id) on delete cascade,
  name         text not null,
  email        text,
  phone        text,
  status       text not null default 'confirmed'
                 check (status in ('confirmed', 'declined', 'maybe')),
  guests_count integer not null default 1 check (guests_count >= 0),
  message      text,
  created_at   timestamptz not null default now()
);

create index if not exists rsvp_invite_id_idx on public.rsvp (invite_id);

-- ------------------------------------------------------------
-- invite_views (rastreamento anonimizado)
-- ------------------------------------------------------------
create table if not exists public.invite_views (
  id         uuid primary key default gen_random_uuid(),
  invite_id  uuid not null references public.invites (id) on delete cascade,
  viewed_at  timestamptz not null default now(),
  ip_hash    text,
  device     text check (device in ('mobile', 'desktop'))
);

create index if not exists invite_views_invite_id_idx on public.invite_views (invite_id);
create index if not exists invite_views_viewed_at_idx on public.invite_views (viewed_at);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.invites enable row level security;
alter table public.rsvp enable row level security;
alter table public.invite_views enable row level security;

-- invites: dono gerencia os próprios; público lê os publicados
drop policy if exists "Users manage own invites" on public.invites;
create policy "Users manage own invites" on public.invites
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Public can view published invites" on public.invites;
create policy "Public can view published invites" on public.invites
  for select
  using (status = 'published');

-- rsvp: qualquer um confirma; dono do convite lê a lista
drop policy if exists "Anyone can create RSVP" on public.rsvp;
create policy "Anyone can create RSVP" on public.rsvp
  for insert
  with check (true);

drop policy if exists "Owner reads invite RSVPs" on public.rsvp;
create policy "Owner reads invite RSVPs" on public.rsvp
  for select
  using (
    exists (
      select 1 from public.invites i
      where i.id = rsvp.invite_id and i.user_id = auth.uid()
    )
  );

-- invite_views: dono lê as métricas do próprio convite
drop policy if exists "Owner reads invite views" on public.invite_views;
create policy "Owner reads invite views" on public.invite_views
  for select
  using (
    exists (
      select 1 from public.invites i
      where i.id = invite_views.invite_id and i.user_id = auth.uid()
    )
  );

-- ============================================================
-- Função: registrar visualização + incrementar contador
-- (security definer para rodar via página pública sem auth)
-- ============================================================
create or replace function public.register_invite_view(
  p_slug text,
  p_ip_hash text default null,
  p_device text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite_id uuid;
begin
  select id into v_invite_id
  from public.invites
  where slug = p_slug and status = 'published';

  if v_invite_id is null then
    return;
  end if;

  insert into public.invite_views (invite_id, ip_hash, device)
  values (v_invite_id, p_ip_hash, p_device);

  update public.invites
  set views = views + 1
  where id = v_invite_id;
end;
$$;

grant execute on function public.register_invite_view(text, text, text) to anon, authenticated;
