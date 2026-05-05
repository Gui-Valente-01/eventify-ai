-- =============================================================
-- Eventify AI — Rode ESTE arquivo INTEIRO no SQL Editor do Supabase
-- Faz limpeza + cria tudo do zero (0001 + 0002 corrigidos)
-- =============================================================

-- ---------- LIMPEZA (caso algo tenha ficado pela metade) -----
drop table if exists public.convidados cascade;
drop table if exists public.eventos cascade;
drop table if exists public.profiles cascade;

-- ---------- EXTENSÕES ----------------------------------------
create extension if not exists "uuid-ossp";

-- ---------- profiles -----------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'basico', 'intermediario', 'premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- eventos ------------------------------------------
create table public.eventos (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  nome text not null,
  tipo text not null,
  data date not null,
  status text not null default 'preview' check (status in ('draft', 'preview', 'paid', 'published', 'archived')),
  endereco jsonb not null default '{}'::jsonb,
  imagem_url text,
  briefing jsonb default '{}'::jsonb,
  site_gerado jsonb,
  site_html text,
  paid_at timestamptz,
  published_at timestamptz,
  paid_plan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create index eventos_owner_idx on public.eventos (owner_id, created_at desc);
create index eventos_slug_idx on public.eventos (slug);
create index eventos_status_idx on public.eventos (status, created_at desc);

-- ---------- convidados ---------------------------------------
create table public.convidados (
  id uuid primary key default uuid_generate_v4(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  nome text not null,
  confirmado_em timestamptz not null default now()
);

create index convidados_evento_idx on public.convidados (evento_id);
create unique index convidados_evento_nome_uniq on public.convidados (evento_id, lower(nome));

-- =============================================================
-- Row Level Security
-- =============================================================
alter table public.profiles enable row level security;
alter table public.eventos enable row level security;
alter table public.convidados enable row level security;

create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_self_insert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

create policy "eventos_owner_all" on public.eventos
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "eventos_public_read" on public.eventos
  for select using (status in ('paid', 'published'));

create policy "convidados_owner_select" on public.convidados
  for select using (
    exists (select 1 from public.eventos e where e.id = evento_id and e.owner_id = auth.uid())
  );
create policy "convidados_owner_delete" on public.convidados
  for delete using (
    exists (select 1 from public.eventos e where e.id = evento_id and e.owner_id = auth.uid())
  );
create policy "convidados_public_insert" on public.convidados
  for insert with check (true);
create policy "convidados_public_read" on public.convidados
  for select using (true);

-- =============================================================
-- Trigger: cria profile automático quando usuário se cadastra
-- =============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================
-- Trigger: updated_at automático
-- =============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger eventos_updated_at
  before update on public.eventos
  for each row execute procedure public.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- =============================================================
-- Storage bucket pra imagens dos eventos
-- =============================================================
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

drop policy if exists "event_images_public_read" on storage.objects;
create policy "event_images_public_read" on storage.objects
  for select using (bucket_id = 'event-images');

drop policy if exists "event_images_authenticated_insert" on storage.objects;
create policy "event_images_authenticated_insert" on storage.objects
  for insert with check (bucket_id = 'event-images' and auth.role() = 'authenticated');

drop policy if exists "event_images_owner_delete" on storage.objects;
create policy "event_images_owner_delete" on storage.objects
  for delete using (bucket_id = 'event-images' and auth.uid() = owner);

drop policy if exists "event_images_owner_update" on storage.objects;
create policy "event_images_owner_update" on storage.objects
  for update using (bucket_id = 'event-images' and auth.uid() = owner);

-- =============================================================
-- Comentários (documentação interna)
-- =============================================================
comment on column public.eventos.briefing is 'Briefing criativo: estilo, clima, publico, corPrincipal, descricao, detalhes';
comment on column public.eventos.site_html is 'Site completo (HTML+CSS+JS) gerado pela IA Claude';

-- =============================================================
-- Pronto! Se chegou aqui sem erro, o banco está OK.
-- =============================================================
