-- =============================================================
-- Eventify · SETUP COMPLETO v2 (consolidado · idempotente)
-- =============================================================
-- Cole ESTE script INTEIRO no SQL Editor do Supabase e clique RUN.
-- Pode rodar várias vezes sem efeitos colaterais — tudo usa
-- "if not exists" / "drop ... if exists then create".
--
-- O que esse script garante que existe no seu Supabase:
--   1.  extensão uuid-ossp
--   2.  helper function public.is_user_admin()
--   3.  tabela profiles  (com is_admin + campos Stripe)
--   4.  tabela eventos   (com briefing, site_html, status, selected_plan)
--   5.  tabela convidados
--   6.  tabela usage_logs (custo IA)
--   7.  tabela event_views (analytics)
--   8.  tabela error_logs (monitoring)
--   9.  RLS em todas + policies completas (owner, public, admin)
--  10.  triggers handle_new_user + set_updated_at
--  11.  bucket "event-images" + policies
--
-- Nota sobre Onda 4 (template gallery):
--   O sistema de templates usa a coluna jsonb `briefing` da tabela
--   eventos — sem precisar de migration. O campo gravado é
--   briefing.templateId = "editorial-romantic" (ou outro id do
--   registry em lib/templateGallery.ts).
-- =============================================================


-- ============= 1. EXTENSÕES ==================================
create extension if not exists "uuid-ossp";


-- ============= 2. HELPER: is_user_admin ======================
-- Usado por policies de várias tabelas (usage_logs, event_views,
-- error_logs, eventos admin read, etc).
-- security definer pra contornar RLS no select.
--
-- Nota: Postgres não deixa CREATE OR REPLACE FUNCTION mudar o nome
-- dos parâmetros. Usamos DROP ... CASCADE para forçar o recreate
-- — o CASCADE também dropa policies que dependem dessa função,
-- mas o próprio script recria essas policies mais abaixo
-- (blocos 10*), então fica idempotente.
drop function if exists public.is_user_admin(uuid) cascade;

create function public.is_user_admin(check_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = check_user_id),
    false
  );
$$;


-- ============= 3. TABELA: profiles ===========================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Colunas que vieram em migrations posteriores (idempotente)
alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text;

-- Plan check (drop + add pra garantir a versão atual)
alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles add constraint profiles_plan_check
  check (plan in ('free', 'basico', 'intermediario', 'premium'));

create index if not exists profiles_stripe_customer_idx
  on public.profiles (stripe_customer_id);

comment on column public.profiles.is_admin is
  'Quando true, dá acesso ao /admin e leitura de todos os dados.';
comment on column public.profiles.stripe_customer_id is
  'ID do cliente na Stripe para abrir portal de assinatura.';
comment on column public.profiles.subscription_status is
  'Status da assinatura Stripe (active, past_due, canceled, etc).';


-- ============= 4. TABELA: eventos ============================
create table if not exists public.eventos (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  nome text not null,
  tipo text not null,
  data date not null,
  endereco jsonb not null default '{}'::jsonb,
  imagem_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Colunas adicionadas por migrations 0002, 0004, 0006
alter table public.eventos
  add column if not exists briefing jsonb default '{}'::jsonb,
  add column if not exists site_gerado jsonb,
  add column if not exists site_html text,
  add column if not exists status text not null default 'preview',
  add column if not exists paid_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists paid_plan text,
  add column if not exists selected_plan text;

-- Status check (drop + add)
alter table public.eventos drop constraint if exists eventos_status_check;
alter table public.eventos add constraint eventos_status_check
  check (status in ('draft', 'preview', 'paid', 'published', 'archived'));

create unique index if not exists eventos_owner_slug_key
  on public.eventos (owner_id, slug);
create index if not exists eventos_owner_idx
  on public.eventos (owner_id, created_at desc);
create index if not exists eventos_slug_idx
  on public.eventos (slug);
create index if not exists eventos_status_idx
  on public.eventos (status, created_at desc);

comment on column public.eventos.briefing is
  'Briefing criativo (JSONB): estilo, clima, publico, corPrincipal, descricao, detalhes, planoSelecionado, templateId. O templateId aponta pra um item do registry em lib/templateGallery.ts.';
comment on column public.eventos.site_html is
  'Site completo (HTML+CSS+JS) gerado pela IA.';
comment on column public.eventos.status is
  'draft, preview, paid, published, archived. Link público só abre para paid/published.';
comment on column public.eventos.selected_plan is
  'Plano desejado pelo cliente para orientar geração e publicação do site.';


-- ============= 5. TABELA: convidados =========================
create table if not exists public.convidados (
  id uuid primary key default uuid_generate_v4(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  nome text not null,
  confirmado_em timestamptz not null default now()
);

create unique index if not exists convidados_evento_nome_key
  on public.convidados (evento_id, lower(nome));
create index if not exists convidados_evento_idx
  on public.convidados (evento_id);


-- ============= 6. TABELA: usage_logs (custo IA) ==============
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
  status text not null default 'ok',
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.usage_logs
  add column if not exists provider text not null default 'anthropic',
  add column if not exists generation_mode text not null default 'agent-company',
  add column if not exists quality_score integer,
  add column if not exists agent_run jsonb;

alter table public.usage_logs drop constraint if exists usage_logs_status_check;
alter table public.usage_logs add constraint usage_logs_status_check
  check (status in ('ok', 'error'));

create index if not exists usage_logs_user_idx
  on public.usage_logs (user_id, created_at desc);
create index if not exists usage_logs_evento_idx
  on public.usage_logs (evento_id);
create index if not exists usage_logs_created_idx
  on public.usage_logs (created_at desc);
create index if not exists usage_logs_provider_idx
  on public.usage_logs (provider, created_at desc);
create index if not exists usage_logs_quality_idx
  on public.usage_logs (quality_score);

comment on table public.usage_logs is
  'Log de cada chamada à API Claude/Gemini — usado pra dashboard de admin e perfil do usuário.';


-- ============= 7. TABELA: event_views (analytics) ============
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

comment on table public.event_views is
  'Cada visita na página pública /cliente/[slug]. Anônimo, sem PII.';


-- ============= 8. TABELA: error_logs (monitoring) ============
create table if not exists public.error_logs (
  id uuid primary key default uuid_generate_v4(),
  scope text not null,
  level text not null default 'error',
  message text not null,
  error_name text,
  error_message text,
  stack text,
  url text,
  user_id uuid references auth.users(id) on delete set null,
  user_agent text,
  context jsonb,
  status text not null default 'open',
  ai_analysis text,
  ai_suggested_fix text,
  ai_severity text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.error_logs drop constraint if exists error_logs_level_check;
alter table public.error_logs add constraint error_logs_level_check
  check (level in ('warn', 'error', 'fatal'));

alter table public.error_logs drop constraint if exists error_logs_status_check;
alter table public.error_logs add constraint error_logs_status_check
  check (status in ('open', 'investigating', 'resolved', 'ignored'));

alter table public.error_logs drop constraint if exists error_logs_ai_severity_check;
alter table public.error_logs add constraint error_logs_ai_severity_check
  check (ai_severity is null or ai_severity in ('low', 'medium', 'high', 'critical'));

create index if not exists error_logs_status_idx
  on public.error_logs (status, created_at desc);
create index if not exists error_logs_scope_idx
  on public.error_logs (scope, created_at desc);
create index if not exists error_logs_unresolved_idx
  on public.error_logs (created_at desc) where status = 'open';

comment on table public.error_logs is
  'Erros captados do app — server, client e error boundaries.';


-- ============= 9. RLS · enable em todas as tabelas ===========
alter table public.profiles    enable row level security;
alter table public.eventos     enable row level security;
alter table public.convidados  enable row level security;
alter table public.usage_logs  enable row level security;
alter table public.event_views enable row level security;
alter table public.error_logs  enable row level security;


-- ============= 10. POLICIES · profiles =======================
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read" on public.profiles
  for select using (public.is_user_admin(auth.uid()));


-- ============= 10b. POLICIES · eventos =======================
drop policy if exists "eventos_owner_all" on public.eventos;
create policy "eventos_owner_all" on public.eventos
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "eventos_public_read" on public.eventos;
create policy "eventos_public_read" on public.eventos
  for select using (status in ('paid', 'published'));

drop policy if exists "eventos_admin_read" on public.eventos;
create policy "eventos_admin_read" on public.eventos
  for select using (public.is_user_admin(auth.uid()));


-- ============= 10c. POLICIES · convidados ====================
drop policy if exists "convidados_owner_select" on public.convidados;
create policy "convidados_owner_select" on public.convidados
  for select using (
    exists (
      select 1 from public.eventos e
      where e.id = evento_id and e.owner_id = auth.uid()
    )
  );

drop policy if exists "convidados_owner_insert" on public.convidados;
create policy "convidados_owner_insert" on public.convidados
  for insert with check (
    exists (
      select 1 from public.eventos e
      where e.id = evento_id and e.owner_id = auth.uid()
    )
  );

drop policy if exists "convidados_owner_delete" on public.convidados;
create policy "convidados_owner_delete" on public.convidados
  for delete using (
    exists (
      select 1 from public.eventos e
      where e.id = evento_id and e.owner_id = auth.uid()
    )
  );

drop policy if exists "convidados_public_insert" on public.convidados;
create policy "convidados_public_insert" on public.convidados
  for insert with check (
    exists (
      select 1 from public.eventos e
      where e.id = evento_id and e.status in ('paid', 'published')
    )
  );

drop policy if exists "convidados_public_read" on public.convidados;
create policy "convidados_public_read" on public.convidados
  for select using (
    exists (
      select 1 from public.eventos e
      where e.id = evento_id and e.status in ('paid', 'published')
    )
  );

drop policy if exists "convidados_admin_read" on public.convidados;
create policy "convidados_admin_read" on public.convidados
  for select using (public.is_user_admin(auth.uid()));


-- ============= 10d. POLICIES · usage_logs ====================
drop policy if exists "usage_logs_owner_read" on public.usage_logs;
create policy "usage_logs_owner_read" on public.usage_logs
  for select using (auth.uid() = user_id);

drop policy if exists "usage_logs_admin_read" on public.usage_logs;
create policy "usage_logs_admin_read" on public.usage_logs
  for select using (public.is_user_admin(auth.uid()));

drop policy if exists "usage_logs_self_insert" on public.usage_logs;
create policy "usage_logs_self_insert" on public.usage_logs
  for insert with check (auth.uid() = user_id);


-- ============= 10e. POLICIES · event_views ===================
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
-- Inserts são feitos exclusivamente pela API com service_role — sem policy de INSERT.


-- ============= 10f. POLICIES · error_logs ====================
drop policy if exists "error_logs_admin_read" on public.error_logs;
create policy "error_logs_admin_read" on public.error_logs
  for select using (public.is_user_admin(auth.uid()));

drop policy if exists "error_logs_admin_update" on public.error_logs;
create policy "error_logs_admin_update" on public.error_logs
  for update using (public.is_user_admin(auth.uid()));


-- ============= 11. TRIGGERS · handle_new_user ================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $func$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$func$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============= 11b. TRIGGERS · set_updated_at ================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $func$
begin
  new.updated_at = now();
  return new;
end;
$func$;

drop trigger if exists eventos_updated_at on public.eventos;
create trigger eventos_updated_at
  before update on public.eventos
  for each row execute procedure public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();


-- ============= 12. STORAGE · bucket event-images =============
-- ATENÇÃO: se este bloco falhar com "permission denied for table objects",
-- crie pela UI: Storage → New bucket → name "event-images" → Public.
-- E crie as 4 policies abaixo pela UI em Storage → Policies.

insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "event_images_public_read" on storage.objects;
create policy "event_images_public_read" on storage.objects
  for select using (bucket_id = 'event-images');

drop policy if exists "event_images_authenticated_insert" on storage.objects;
create policy "event_images_authenticated_insert" on storage.objects
  for insert with check (
    bucket_id = 'event-images' and auth.role() = 'authenticated'
  );

drop policy if exists "event_images_owner_delete" on storage.objects;
create policy "event_images_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'event-images' and auth.uid() = owner
  );

drop policy if exists "event_images_owner_update" on storage.objects;
create policy "event_images_owner_update" on storage.objects
  for update using (
    bucket_id = 'event-images' and auth.uid() = owner
  );


-- ============= 13. NOTIFY PostgREST ==========================
-- Avisa o PostgREST pra recarregar o schema cacheado.
notify pgrst, 'reload schema';


-- =============================================================
-- VERIFICAÇÃO · rode os SELECTs abaixo separadamente pra conferir
-- que tudo está em ordem.
-- =============================================================
-- 1) Lista de tabelas criadas:
--    select table_name from information_schema.tables
--    where table_schema = 'public' order by table_name;
--
-- 2) Colunas esperadas em profiles:
--    select column_name from information_schema.columns
--    where table_schema='public' and table_name='profiles'
--    order by column_name;
--    -- Esperado: created_at, full_name, id, is_admin, plan,
--    --           stripe_customer_id, stripe_subscription_id,
--    --           subscription_status, updated_at
--
-- 3) Colunas esperadas em eventos:
--    select column_name from information_schema.columns
--    where table_schema='public' and table_name='eventos'
--    order by column_name;
--    -- Esperado: briefing, created_at, data, endereco, id,
--    --           imagem_url, nome, owner_id, paid_at, paid_plan,
--    --           published_at, selected_plan, site_gerado,
--    --           site_html, slug, status, tipo, updated_at
--
-- 4) Helper function:
--    select public.is_user_admin('00000000-0000-0000-0000-000000000000');
--    -- Deve retornar false (sem erro).
--
-- 5) Pra te promover a admin (substitua o e-mail):
--    update public.profiles set is_admin = true
--    where id = (select id from auth.users where email = 'cybermoney071@gmail.com');
--
-- ✅ Se as 5 verificações passarem, o banco está pronto pra Onda 4.
-- =============================================================
