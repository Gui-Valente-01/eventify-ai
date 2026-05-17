-- =============================================================
-- Eventify AI — Tabela de jobs de geração de sites
-- Permite tornar /api/gerar-site assíncrono.
-- =============================================================

create table if not exists public.generation_jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  evento_id uuid references public.eventos(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'running', 'done', 'failed', 'stale')),
  input jsonb not null,
  output jsonb,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists generation_jobs_user_idx
  on public.generation_jobs (user_id, created_at desc);

create index if not exists generation_jobs_status_idx
  on public.generation_jobs (status, started_at);

alter table public.generation_jobs enable row level security;

drop policy if exists "generation_jobs_owner_read" on public.generation_jobs;
create policy "generation_jobs_owner_read" on public.generation_jobs
  for select using (auth.uid() = user_id);

drop policy if exists "generation_jobs_owner_insert" on public.generation_jobs;
create policy "generation_jobs_owner_insert" on public.generation_jobs
  for insert with check (auth.uid() = user_id);

-- Updates feitos apenas via service role (servidor), bypass RLS.
