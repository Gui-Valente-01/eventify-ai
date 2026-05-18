-- =============================================================
-- Eventify AI — RSVP detalhado
-- Adiciona campos opcionais em convidados: status (vai/talvez/recusou),
-- acompanhantes, restricao_alimentar e recado.
-- Mantém backward compat: nome continua obrigatório.
-- =============================================================

alter table public.convidados
  add column if not exists status text not null default 'confirmado'
    check (status in ('confirmado', 'talvez', 'recusou')),
  add column if not exists acompanhantes integer not null default 0
    check (acompanhantes >= 0 and acompanhantes <= 20),
  add column if not exists restricao_alimentar text,
  add column if not exists recado text;

create index if not exists convidados_status_idx
  on public.convidados (evento_id, status);
