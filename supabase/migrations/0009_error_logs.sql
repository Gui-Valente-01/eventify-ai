-- =============================================================
-- Eventify AI — Migration 0009: Error logs (monitoramento)
-- =============================================================

create table if not exists public.error_logs (
  id uuid primary key default uuid_generate_v4(),
  scope text not null,
  level text not null default 'error' check (level in ('warn', 'error', 'fatal')),
  message text not null,
  error_name text,
  error_message text,
  stack text,
  url text,
  user_id uuid references auth.users(id) on delete set null,
  user_agent text,
  context jsonb,
  status text not null default 'open' check (status in ('open', 'investigating', 'resolved', 'ignored')),
  ai_analysis text,
  ai_suggested_fix text,
  ai_severity text check (ai_severity in ('low', 'medium', 'high', 'critical')),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists error_logs_status_idx
  on public.error_logs (status, created_at desc);

create index if not exists error_logs_scope_idx
  on public.error_logs (scope, created_at desc);

create index if not exists error_logs_unresolved_idx
  on public.error_logs (created_at desc) where status = 'open';

alter table public.error_logs enable row level security;

drop policy if exists "error_logs_admin_read" on public.error_logs;
create policy "error_logs_admin_read" on public.error_logs
  for select using (public.is_user_admin(auth.uid()));

drop policy if exists "error_logs_admin_update" on public.error_logs;
create policy "error_logs_admin_update" on public.error_logs
  for update using (public.is_user_admin(auth.uid()));

comment on table public.error_logs is 'Erros captados do app — server, client e error boundaries.';
comment on column public.error_logs.ai_analysis is 'Análise do erro feita pelo agente de IA.';
comment on column public.error_logs.ai_suggested_fix is 'Sugestão de correção (texto) gerada pela IA.';

notify pgrst, 'reload schema';
