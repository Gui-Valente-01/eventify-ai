-- =============================================================
-- Eventify AI — Migration 0004
-- Fluxo comercial: status de publicacao, pagamento por evento e RLS publica.
-- Execute apos 0003_usage_e_admin.sql.
-- =============================================================

alter table public.eventos
  add column if not exists status text not null default 'preview',
  add column if not exists paid_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists paid_plan text;

do $$
begin
  alter table public.eventos
    add constraint eventos_status_check
    check (status in ('draft', 'preview', 'paid', 'published', 'archived'));
exception
  when duplicate_object then null;
end $$;

create index if not exists eventos_status_idx on public.eventos (status, created_at desc);

drop policy if exists "eventos_public_read" on public.eventos;
create policy "eventos_public_read" on public.eventos
  for select using (status in ('paid', 'published'));

comment on column public.eventos.status is 'draft, preview, paid, published ou archived. Link final publico so abre para paid/published.';
comment on column public.eventos.paid_at is 'Momento em que o checkout confirmou pagamento do evento.';
comment on column public.eventos.published_at is 'Momento em que o evento foi liberado como link final.';
comment on column public.eventos.paid_plan is 'Plano comprado para publicar este evento.';
