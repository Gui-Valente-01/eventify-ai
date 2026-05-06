-- =============================================================
-- Eventify AI — Migration 0005
-- Endurece policies de convidados para o link publico.
-- Execute apos 0004_publication_flow.sql.
-- =============================================================

drop policy if exists "convidados_owner_insert" on public.convidados;
create policy "convidados_owner_insert" on public.convidados
  for insert with check (
    exists (
      select 1
      from public.eventos e
      where e.id = evento_id and e.owner_id = auth.uid()
    )
  );

drop policy if exists "convidados_public_insert" on public.convidados;
create policy "convidados_public_insert" on public.convidados
  for insert with check (
    exists (
      select 1
      from public.eventos e
      where e.id = evento_id and e.status in ('paid', 'published')
    )
  );

drop policy if exists "convidados_public_read" on public.convidados;
create policy "convidados_public_read" on public.convidados
  for select using (
    exists (
      select 1
      from public.eventos e
      where e.id = evento_id and e.status in ('paid', 'published')
    )
  );
