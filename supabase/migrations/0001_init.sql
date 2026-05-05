-- =============================================================
-- Eventify AI — Schema inicial
-- Execute este arquivo no SQL Editor do Supabase OU via:
--   supabase db push   (se estiver usando o CLI)
-- =============================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ----- profiles ------------------------------------------------
-- Espelho da auth.users com dados de plano
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'basico', 'intermediario', 'premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----- eventos -------------------------------------------------
create table if not exists public.eventos (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  nome text not null,
  tipo text not null,
  data date not null,
  endereco jsonb not null default '{}'::jsonb,
  imagem_url text,
  site_gerado jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create index if not exists eventos_owner_idx on public.eventos (owner_id, created_at desc);
create index if not exists eventos_slug_idx on public.eventos (slug);

-- ----- convidados ----------------------------------------------
create table if not exists public.convidados (
  id uuid primary key default uuid_generate_v4(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  nome text not null,
  confirmado_em timestamptz not null default now()
);

create index if not exists convidados_evento_idx on public.convidados (evento_id);
create unique index if not exists convidados_evento_nome_uniq on public.convidados (evento_id, lower(nome));

-- =============================================================
-- Row Level Security
-- =============================================================
alter table public.profiles enable row level security;
alter table public.eventos enable row level security;
alter table public.convidados enable row level security;

-- profiles: cada usuário vê e edita apenas o próprio perfil
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- eventos: dono vê tudo; público vê apenas leitura (página /cliente/[slug])
drop policy if exists "eventos_owner_all" on public.eventos;
create policy "eventos_owner_all" on public.eventos
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "eventos_public_read" on public.eventos;
create policy "eventos_public_read" on public.eventos
  for select using (true);

-- convidados: dono do evento gerencia tudo; público pode inserir (RSVP)
drop policy if exists "convidados_owner_select" on public.convidados;
create policy "convidados_owner_select" on public.convidados
  for select using (
    exists (select 1 from public.eventos e where e.id = evento_id and e.owner_id = auth.uid())
  );

drop policy if exists "convidados_owner_delete" on public.convidados;
create policy "convidados_owner_delete" on public.convidados
  for delete using (
    exists (select 1 from public.eventos e where e.id = evento_id and e.owner_id = auth.uid())
  );

drop policy if exists "convidados_public_insert" on public.convidados;
create policy "convidados_public_insert" on public.convidados
  for insert with check (true);

drop policy if exists "convidados_public_read" on public.convidados;
create policy "convidados_public_read" on public.convidados
  for select using (true);

-- =============================================================
-- Trigger: auto-criar profile ao registrar
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

drop trigger if exists eventos_updated_at on public.eventos;
create trigger eventos_updated_at
  before update on public.eventos
  for each row execute procedure public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- =============================================================
-- Storage bucket para imagens dos eventos
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
