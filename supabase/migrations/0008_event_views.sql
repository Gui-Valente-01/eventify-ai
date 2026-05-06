-- =============================================================
-- Eventify AI — Migration 0008: Analytics por evento
-- Tabela `event_views` registra visitas anônimas em /cliente/[slug].
-- Insert via service_role (API /api/track-view).
-- Owner do evento e admin podem SELECT.
-- =============================================================

create table if not exists public.event_views (
  id uuid primary key default uuid_generate_v4(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  session_id text not null,
  referrer text,
  user_agent text,
  country text,
  created_at timestamptz not null default now()
);

create index if not exists event_views_evento_idx
  on public.event_views (evento_id, created_at desc);

create index if not exists event_views_session_idx
  on public.event_views (evento_id, session_id);

alter table public.event_views enable row level security;

-- Owner do evento vê analytics do próprio
drop policy if exists "event_views_owner_read" on public.event_views;
create policy "event_views_owner_read" on public.event_views
  for select using (
    exists (
      select 1 from public.eventos e
      where e.id = event_views.evento_id and e.owner_id = auth.uid()
    )
  );

-- Admin vê tudo
drop policy if exists "event_views_admin_read" on public.event_views;
create policy "event_views_admin_read" on public.event_views
  for select using (public.is_user_admin(auth.uid()));

-- Inserts são feitos exclusivamente pela API com service_role; sem policy de INSERT pra anon/authenticated.

comment on table public.event_views is 'Cada visita registrada na página pública /cliente/[slug]. Anônimo, sem PII.';
comment on column public.event_views.session_id is 'UUID gerado no browser e guardado em sessionStorage. Usado pra dedupe na mesma sessão.';

notify pgrst, 'reload schema';
