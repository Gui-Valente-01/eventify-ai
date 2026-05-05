-- =============================================================
-- Eventify AI — Parte 2: Admin + tracking de uso da IA
-- Rode ESTE arquivo INTEIRO no SQL Editor (depois do RODAR-ISSO.sql)
-- =============================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create table if not exists public.usage_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  evento_id uuid references public.eventos(id) on delete set null,
  model text not null,
  plan text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cache_read_tokens integer not null default 0,
  cache_write_tokens integer not null default 0,
  cost_usd numeric(10,6) not null default 0,
  status text not null default 'ok' check (status in ('ok', 'error')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists usage_logs_user_idx on public.usage_logs (user_id, created_at desc);
create index if not exists usage_logs_evento_idx on public.usage_logs (evento_id);
create index if not exists usage_logs_created_idx on public.usage_logs (created_at desc);

alter table public.usage_logs enable row level security;

drop policy if exists "usage_logs_owner_read" on public.usage_logs;
create policy "usage_logs_owner_read" on public.usage_logs
  for select using (auth.uid() = user_id);

drop policy if exists "usage_logs_admin_read" on public.usage_logs;
create policy "usage_logs_admin_read" on public.usage_logs
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

drop policy if exists "usage_logs_self_insert" on public.usage_logs;
create policy "usage_logs_self_insert" on public.usage_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "eventos_admin_read" on public.eventos;
create policy "eventos_admin_read" on public.eventos
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read" on public.profiles
  for select using (
    exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin = true)
  );

drop policy if exists "convidados_admin_read" on public.convidados;
create policy "convidados_admin_read" on public.convidados
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- =============================================================
-- IMPORTANTE: depois de rodar isso, marque seu próprio usuário
-- como admin com o comando abaixo (substitua o e-mail):
--
-- update public.profiles
--   set is_admin = true
--   where id = (select id from auth.users where email = 'SEU@EMAIL.COM');
-- =============================================================
