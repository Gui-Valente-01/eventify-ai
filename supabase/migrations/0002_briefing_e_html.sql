-- =============================================================
-- Eventify AI — Migration 0002
-- Adiciona briefing criativo e HTML gerado pela IA.
-- Execute APÓS 0001_init.sql.
-- =============================================================

alter table public.eventos
  add column if not exists briefing jsonb default '{}'::jsonb,
  add column if not exists site_html text;

comment on column public.eventos.briefing is 'Briefing criativo: estilo, clima, publico, corPrincipal, descricao';
comment on column public.eventos.site_html is 'Site completo (HTML+CSS+JS) gerado pela IA Claude';
