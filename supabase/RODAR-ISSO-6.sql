-- =============================================================
-- Eventify AI — Parte 6: Analytics por evento
-- Rode INTEIRO no SQL Editor do Supabase.
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

drop policy if exists "event_views_owner_read" on public.event_views;
create policy "event_views_owner_read" on public.event_views
  for select using (
    exists (
      select 1 from public.eventos e
      where e.id = event_views.evento_id and e.owner_id = auth.uid()
    )
  );

drop policy if exists "event_views_admin_read" on public.event_views;
create policy "event_views_admin_read" on public.event_views
  for select using (public.is_user_admin(auth.uid()));

notify pgrst, 'reload schema';
