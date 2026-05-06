-- =============================================================
-- Eventify AI — Parte 4: colunas de publicação na tabela eventos
-- =============================================================
-- Erro corrigido: PGRST204 "Could not find the 'status' column"
-- Adiciona status, paid_at, published_at, paid_plan e site_html.
-- =============================================================

alter table public.eventos
  add column if not exists status text not null default 'preview'
    check (status in ('draft', 'preview', 'paid', 'published', 'archived')),
  add column if not exists paid_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists paid_plan text,
  add column if not exists site_html text;

-- Índice por status (pra queries do admin)
create index if not exists eventos_status_idx
  on public.eventos (status, created_at desc);

-- Atualiza policy pública pra só liberar evento com status pago/publicado
drop policy if exists "eventos_public_read" on public.eventos;
create policy "eventos_public_read" on public.eventos
  for select using (status in ('paid', 'published'));

-- Recarrega o cache de schema do PostgREST (Supabase)
notify pgrst, 'reload schema';

-- =============================================================
-- Pronto. Os eventos antigos vão ficar com status='preview' default.
-- =============================================================
