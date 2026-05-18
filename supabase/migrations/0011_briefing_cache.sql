-- =============================================================
-- Eventify AI — Cache de geração de site
-- Adiciona colunas pra que /api/gerar-site possa retornar cache
-- quando o briefing não mudou (economiza chamada Claude).
-- =============================================================

alter table public.eventos
  add column if not exists briefing_hash text,
  add column if not exists site_cached_at timestamptz;

-- Index pra invalidação por TTL eventual (cleanup futuro)
create index if not exists eventos_briefing_hash_idx
  on public.eventos (briefing_hash)
  where briefing_hash is not null;
